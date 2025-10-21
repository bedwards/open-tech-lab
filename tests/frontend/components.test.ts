import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProjectList } from '@/frontend/components/ProjectList';
import { AppwriteService } from '@/frontend/services/appwrite';
import { StorageService } from '@/frontend/services/storage';

describe('ProjectList Component', () => {
  let projectList: ProjectList;
  let appwrite: AppwriteService;
  let storage: StorageService;

  beforeEach(() => {
    // Spy on navigator.onLine and set to false for offline mode
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    appwrite = new AppwriteService();
    storage = new StorageService();

    // Mock storage methods
    vi.spyOn(storage, 'getAllProjects').mockResolvedValue([]);
    vi.spyOn(storage, 'saveProject').mockResolvedValue();
    vi.spyOn(storage, 'getProject').mockResolvedValue(undefined);
    vi.spyOn(storage, 'deleteProject').mockResolvedValue();
    vi.spyOn(storage, 'addPendingSync').mockResolvedValue();

    projectList = new ProjectList(appwrite, storage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render project list', async () => {
    const container = document.createElement('div');
    await projectList.render(container);
    expect(container.querySelector('.project-list-header')).toBeTruthy();
  });

  it('should handle empty project list', async () => {
    const container = document.createElement('div');
    await projectList.render(container);
    expect(container.textContent).toContain('No projects yet');
  });
});
