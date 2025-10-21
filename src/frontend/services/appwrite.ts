import { Client, Account, Databases, Storage, Functions, Realtime } from 'appwrite';

export interface Project {
  id: string;
  name: string;
  description: string;
  files: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface RealtimePayload {
  events: string[];
  channels: string[];
  timestamp: string;
  payload: unknown;
}

export class AppwriteService {
  private client: Client;
  private account: Account;
  private databases: Databases;
  private storage: Storage;
  private functions: Functions;
  private realtime: Realtime;

  constructor() {
    this.client = new Client()
      .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'http://localhost/v1')
      .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || 'open-tech-lab');

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.functions = new Functions(this.client);
    this.realtime = new Realtime(this.client);
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch {
      return null;
    }
  }

  async login(email: string, password: string) {
    return await this.account.createEmailPasswordSession(email, password);
  }

  async logout() {
    return await this.account.deleteSession('current');
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    return await this.databases.createDocument('main', 'projects', 'unique()', project);
  }

  async getProjects(): Promise<Project[]> {
    const response = await this.databases.listDocuments('main', 'projects');
    return response.documents as unknown as Project[];
  }

  async updateProject(id: string, data: Partial<Project>) {
    return await this.databases.updateDocument('main', 'projects', id, data);
  }

  async deleteProject(id: string) {
    return await this.databases.deleteDocument('main', 'projects', id);
  }

  subscribeToProject(projectId: string, callback: (payload: RealtimePayload) => void) {
    return this.realtime.subscribe(
      `databases.main.collections.projects.documents.${projectId}`,
      callback
    );
  }

  async executeFunction(functionId: string, data: unknown) {
    return await this.functions.createExecution(functionId, JSON.stringify(data));
  }
}
