import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectList } from '@/frontend/components/ProjectList';
import { AppwriteService } from '@/frontend/services/appwrite';
import { StorageService } from '@/frontend/services/storage';

describe('ProjectList Component', () => {
  let projectList: ProjectList;
  let appwrite: AppwriteService;
  let storage: StorageService;

  beforeEach(() => {
    appwrite = new AppwriteService();
    storage = new StorageService();
    projectList = new ProjectList(appwrite, storage);
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
