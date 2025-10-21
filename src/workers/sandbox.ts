export class SandboxObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const { code } = await request.json<{ code: string }>();

    try {
      const result = await this.executeCode(code);

      return new Response(
        JSON.stringify({
          success: true,
          output: result,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: String(error),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  private async executeCode(code: string): Promise<string> {
    const logs: string[] = [];

    // Create safe console implementation
    const safeConsole = {
      log: (...args: unknown[]) => {
        logs.push(
          args
            .map((arg) => {
              if (typeof arg === 'object' && arg !== null) {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            })
            .join(' ')
        );
      },
    };

    // Create a safe global context
    const context = {
      console: safeConsole,
      Math,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Date,
      RegExp,
      Set,
      Map,
      Promise,
    };

    try {
      // Wrap user code in an async function with our context
      const wrappedCode = `
        return (async function() {
          const { console, Math, JSON, Array, Object, String, Number, Boolean, Date, RegExp, Set, Map, Promise } = arguments[0];
          ${code}
        })(context);
      `;

      // Use AsyncFunction constructor (like Function but for async code)
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction('context', wrappedCode);

      await fn(context);

      return logs.join('\n') || 'Code executed successfully (no output)';
    } catch (error) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return `Error: ${String(error)}`;
    }
  }
}
