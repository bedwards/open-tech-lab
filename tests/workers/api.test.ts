import { describe, it, expect } from 'vitest';

describe('Worker API', () => {
  it('should handle sandbox execution', async () => {
    const code = 'console.log("Hello World")';
    const response = await fetch('http://localhost:8787/api/sandbox/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    expect(response.ok).toBe(true);
    const result = await response.json();
    expect(result.success).toBe(true);
  });

  it('should handle analytics requests', async () => {
    const response = await fetch('http://localhost:8787/api/analytics');
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toBeDefined();
  });
});
