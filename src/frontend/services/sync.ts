import { AppwriteService } from './appwrite';
import { StorageService } from './storage';

export class SyncService {
  private syncInterval: number | null = null;

  constructor(
    private appwrite: AppwriteService,
    private storage: StorageService
  ) {}

  start(): void {
    // Sync every 30 seconds when online
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingChanges();
      }
    }, 30000);
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncPendingChanges(): Promise<void> {
    const pending = await this.storage.getPendingSync();
    
    for (const item of pending) {
      try {
        switch (item.action) {
          case 'create':
            await this.appwrite.createProject(item.data);
            break;
          case 'update':
            await this.appwrite.updateProject(item.projectId, item.data);
            break;
          case 'delete':
            await this.appwrite.deleteProject(item.projectId);
            break;
        }
        
        await this.storage.clearPendingSync(item.id);
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
      }
    }
  }

  async downloadProjects(): Promise<void> {
    try {
      const projects = await this.appwrite.getProjects();
      for (const project of projects) {
        await this.storage.saveProject(project);
      }
    } catch (error) {
      console.error('Failed to download projects:', error);
    }
  }
}
