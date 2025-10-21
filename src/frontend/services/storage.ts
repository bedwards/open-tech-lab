import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OpenTechLabDB extends DBSchema {
  projects: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      files: Record<string, string>;
      lastSynced: number;
      pendingChanges: boolean;
    };
  };
  pendingSync: {
    key: string;
    value: {
      id: string;
      projectId: string;
      action: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
    };
  };
}

export class StorageService {
  private db: IDBPDatabase<OpenTechLabDB> | null = null;

  async init(): Promise<void> {
    this.db = await openDB<OpenTechLabDB>('open-tech-lab', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pendingSync')) {
          const store = db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }

  async saveProject(project: any): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('projects', {
      ...project,
      lastSynced: Date.now(),
      pendingChanges: false,
    });
  }

  async getProject(id: string): Promise<any> {
    if (!this.db) await this.init();
    return await this.db!.get('projects', id);
  }

  async getAllProjects(): Promise<any[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('projects');
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('projects', id);
  }

  async addPendingSync(
    action: 'create' | 'update' | 'delete',
    projectId: string,
    data: any
  ): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.add('pendingSync', {
      id: crypto.randomUUID(),
      projectId,
      action,
      data,
      timestamp: Date.now(),
    });
  }

  async getPendingSync(): Promise<any[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('pendingSync');
  }

  async clearPendingSync(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('pendingSync', id);
  }
}
