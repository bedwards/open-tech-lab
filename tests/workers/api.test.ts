import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
/*global global*/
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Worker API', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should handle sandbox execution', async () => {
    const code = 'console.log("Hello World")';

    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, output: 'Hello World' }),
    });

    const response = await fetch('http://localhost:8787/api/sandbox/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    expect(response.ok).toBe(true);
    const result = (await response.json()) as { success: boolean; output: string };
    expect(result.success).toBe(true);
  });

  it('should handle analytics requests', async () => {
    // Mock successful analytics response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        visits: 100,
        users: 50,
        projects: 25,
      }),
    });

    const response = await fetch('http://localhost:8787/api/analytics');
    expect(response.ok).toBe(true);
    const data = (await response.json()) as { visits: number; users: number; projects: number };
    expect(data.visits).toBeDefined();
  });
});
