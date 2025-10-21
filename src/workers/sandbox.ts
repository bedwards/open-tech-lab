export class SandboxObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const { code } = await request.json<{ code: string }>();

    try {
      // Execute code in isolated environment
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
    // Sandboxed code execution
    // In production, this would use QuickJS or AssemblyScript WASM

    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map(String).join(' '));
      },
    };

    try {
      // Create isolated function
      const fn = new Function('console', code);
      fn(customConsole);

      return logs.join('\n') || 'Code executed successfully';
    } catch (error) {
      throw new Error(`Execution error: ${error}`);
    }
  }
}
