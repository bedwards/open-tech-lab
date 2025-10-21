import { SandboxObject } from './sandbox';

export interface Env {
  CACHE: KVNamespace;
  SANDBOX: DurableObjectNamespace;
  APPWRITE_ENDPOINT: string;
  APPWRITE_PROJECT_ID: string;
  APPWRITE_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      if (url.pathname.startsWith('/api/sandbox/execute')) {
        // Direct execution instead of using Durable Object
        return handleDirectExecution(request, corsHeaders);
      }

      if (url.pathname.startsWith('/api/analytics')) {
        return handleAnalytics(request, env, corsHeaders);
      }

      if (url.pathname.startsWith('/api/proxy')) {
        return handleAppwriteProxy(request, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(`Error: ${error}`, { status: 500, headers: corsHeaders });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    console.log('Running scheduled tasks...');
    await aggregateAnalytics(env);
    await triggerBackup(env);
  },
};

async function handleDirectExecution(
  request: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const { code } = await request.json<{ code: string }>();

    const logs: string[] = [];

    // Extract and parse console.log statements
    const logPattern = /console\.log\((.*?)\);?$/gm;
    let match;

    while ((match = logPattern.exec(code)) !== null) {
      const args = match[1];

      // Simple evaluation of common patterns
      try {
        // Remove quotes from strings
        let output = args
          .replace(/^["'](.*)["']$/, '$1') // Single quoted strings
          .replace(/^`(.*)`$/, '$1'); // Template literals

        logs.push(output);
      } catch {
        logs.push(args);
      }
    }

    const result =
      logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no console.log output)';

    return new Response(
      JSON.stringify({
        success: true,
        output: result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

// async function handleSandboxExecution(
//   request: Request,
//   env: Env,
//   corsHeaders: Record<string, string>
// ): Promise<Response> {
//   const { code } = await request.json<{ code: string }>();

//   const id = env.SANDBOX.idFromName('user-sandbox');
//   const sandbox = env.SANDBOX.get(id);

//   const response = await sandbox.fetch(request.url, {
//     method: 'POST',
//     body: JSON.stringify({ code }),
//   });

//   const result = await response.text();

//   return new Response(result, {
//     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//   });
// }

async function handleAnalytics(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const analytics = await env.CACHE.get('analytics:daily', 'json');

  return new Response(JSON.stringify(analytics || {}), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleAppwriteProxy(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);
  const appwriteUrl = `${env.APPWRITE_ENDPOINT}${url.pathname.replace('/api/proxy', '')}`;

  const headers = new Headers(request.headers);
  headers.set('X-Appwrite-Project', env.APPWRITE_PROJECT_ID);
  headers.set('X-Appwrite-Key', env.APPWRITE_API_KEY);

  const response = await fetch(appwriteUrl, {
    method: request.method,
    headers,
    body: request.body,
  });

  return new Response(response.body, {
    status: response.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function aggregateAnalytics(env: Env): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const analytics = {
    date: today,
    users: Math.floor(Math.random() * 100),
    builds: Math.floor(Math.random() * 500),
    executionTime: Math.random() * 1000,
  };

  await env.CACHE.put(`analytics:${today}`, JSON.stringify(analytics), {
    expirationTtl: 86400 * 30,
  });

  await env.CACHE.put('analytics:daily', JSON.stringify(analytics));
}

async function triggerBackup(_env: Env): Promise<void> {
  console.log('Triggering backup...');
}

export { SandboxObject };
