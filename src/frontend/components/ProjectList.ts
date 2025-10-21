import { AppwriteService, Project } from '../services/appwrite';
import { StorageService } from '../services/storage';

export class ProjectList {
  constructor(
    private appwrite: AppwriteService,
    private storage: StorageService
  ) {}

  async render(container: HTMLElement): Promise<void> {
    container.innerHTML = `
      <div class="project-list-header">
        <h2>Your Projects</h2>
        <button id="new-project-btn" class="btn-primary">New Project</button>
      </div>
      <div id="projects-container"></div>
    `;

    const projectsContainer = container.querySelector('#projects-container')!;

    // Try to load from server first, fallback to local storage
    let projects: Project[];
    try {
      if (navigator.onLine) {
        projects = await this.appwrite.getProjects();
        // Cache locally
        for (const project of projects) {
          await this.storage.saveProject(project);
        }
      } else {
        projects = await this.storage.getAllProjects();
      }
    } catch {
      projects = await this.storage.getAllProjects();
    }

    if (projects.length === 0) {
      projectsContainer.innerHTML = '<p>No projects yet. Create your first one!</p>';
      return;
    }

    projectsContainer.innerHTML = projects
      .map(
        (project) => `
        <div class="project-card" data-id="${project.id}">
          <h3>${project.name}</h3>
          <p>${project.description}</p>
          <div class="project-meta">
            <span>Files: ${Object.keys(project.files).length}</span>
            <span>Updated: ${new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      `
      )
      .join('');

    // Add event listeners
    document.getElementById('new-project-btn')?.addEventListener('click', () => {
      this.createNewProject();
    });

    projectsContainer.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id')!;
        this.openProject(id);
      });
    });
  }

  private async createNewProject(): Promise<void> {
    const name = prompt('Project name:');
    if (!name) return;

    const description = prompt('Description:');

    const project = {
      name,
      description: description || '',
      files: { 'main.js': '// Start coding here\n' },
    };

    try {
      if (navigator.onLine) {
        await this.appwrite.createProject(project);
      } else {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        await this.storage.saveProject({
          ...project,
          id,
          createdAt: now,
          updatedAt: now,
        });
        await this.storage.addPendingSync('create', id, project);
      }

      // Refresh list
      this.render(document.getElementById('project-list')!);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  }

  private openProject(id: string): void {
    // Navigate to code editor
    console.log('Opening project:', id);
    // This would trigger the CodeEditor component
  }
}
