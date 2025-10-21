import { AppwriteService } from './services/appwrite';
import { StorageService } from './services/storage';
import { SyncService } from './services/sync';
import { ProjectList } from './components/ProjectList';
import { CodeEditor } from './components/CodeEditor';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

class App {
  private appwrite: AppwriteService;
  private storage: StorageService;
  private sync: SyncService;
  private projectList: ProjectList;
  private codeEditor: CodeEditor;
  private analyticsDashboard: AnalyticsDashboard;

  constructor() {
    this.appwrite = new AppwriteService();
    this.storage = new StorageService();
    this.sync = new SyncService(this.appwrite, this.storage);

    this.projectList = new ProjectList(this.appwrite, this.storage);
    this.codeEditor = new CodeEditor(this.appwrite, this.storage);
    this.analyticsDashboard = new AnalyticsDashboard();

    this.init();
  }

  private async init(): Promise<void> {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Initialize offline detection
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Setup navigation
    this.setupNavigation();

    // Check authentication
    try {
      const user = await this.appwrite.getCurrentUser();
      if (user) {
        this.showProjects();
      } else {
        this.showLogin();
      }
    } catch {
      this.showLogin();
    }

    // Start sync service
    this.sync.start();
  }

  private setupNavigation(): void {
    document.getElementById('projects-btn')?.addEventListener('click', () => {
      this.showProjects();
    });

    document.getElementById('analytics-btn')?.addEventListener('click', () => {
      this.showAnalytics();
    });

    document.getElementById('login-btn')?.addEventListener('click', () => {
      this.showLogin();
    });
  }

  private showProjects(): void {
    document.getElementById('project-list')!.style.display = 'block';
    document.getElementById('code-editor')!.style.display = 'none';
    document.getElementById('analytics-dashboard')!.style.display = 'none';

    this.projectList.render(document.getElementById('project-list')!);
  }

  private showAnalytics(): void {
    document.getElementById('project-list')!.style.display = 'none';
    document.getElementById('code-editor')!.style.display = 'none';
    document.getElementById('analytics-dashboard')!.style.display = 'block';

    this.analyticsDashboard.render(document.getElementById('analytics-dashboard')!);
  }

  private showLogin(): void {
    // Implement login UI
    console.log('Show login');
  }

  private handleOnline(): void {
    document.getElementById('offline-indicator')!.style.display = 'none';
    this.sync.syncPendingChanges();
  }

  private handleOffline(): void {
    document.getElementById('offline-indicator')!.style.display = 'block';
  }
}

// Initialize app
new App();
