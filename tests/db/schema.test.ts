import { describe, it, expect } from 'vitest';
import { projects, plugins } from '@/db/schema';

describe('Database Schema', () => {
  it('should have correct project schema', () => {
    expect(projects).toBeDefined();
    expect(projects.id).toBeDefined();
    expect(projects.name).toBeDefined();
  });

  it('should have correct plugin schema', () => {
    expect(plugins).toBeDefined();
    expect(plugins.id).toBeDefined();
    expect(plugins.name).toBeDefined();
  });
});
