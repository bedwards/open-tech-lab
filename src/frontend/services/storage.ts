import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ProjectData {
  id: string;
  name: string;
  description: string;
  files: Record<string, string>;
  lastSynced: number;
  pendingChanges: boolean;
}

interface PendingSyncData {
  id: string;
  projectId: string;
  action: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
}

interface OpenTechLabDB extends DBSchema {
  projects: {
    key: string;
    value: ProjectData;
  };
  pendingSync: {
    key: string;
    value: PendingSyncData;
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

  async saveProject(project: Partial<ProjectData> & { id: string }): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('projects', {
      ...project,
      name: project.name || '',
      description: project.description || '',
      files: project.files || {},
      lastSynced: Date.now(),
      pendingChanges: false,
    });
  }

  async getProject(id: string): Promise<ProjectData | undefined> {
    if (!this.db) await this.init();
    return await this.db!.get('projects', id);
  }

  async getAllProjects(): Promise<ProjectData[]> {
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
    data: unknown
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

  async getPendingSync(): Promise<PendingSyncData[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('pendingSync');
  }

  async clearPendingSync(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('pendingSync', id);
  }
}
