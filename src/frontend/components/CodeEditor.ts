import { AppwriteService } from '../services/appwrite';
import { StorageService } from '../services/storage';
import * as Y from 'yjs';

interface RealtimeResponse {
  events: string[];
  channels: string[];
  timestamp: string;
  payload: unknown;
}

export class CodeEditor {
  private yDoc: Y.Doc;
  private yText: Y.Text;
  private currentProjectId: string | null = null;

  constructor(
    private appwrite: AppwriteService,
    private storage: StorageService
  ) {
    this.yDoc = new Y.Doc();
    this.yText = this.yDoc.getText('content');
  }

  async render(container: HTMLElement, projectId: string): Promise<void> {
    this.currentProjectId = projectId;

    container.innerHTML = `
      <div class="editor-header">
        <button id="back-btn">← Back to Projects</button>
        <span id="project-name"></span>
        <div class="editor-actions">
          <button id="save-btn">Save</button>
          <button id="run-btn">Run</button>
          <span id="collab-status">👤 Solo</span>
        </div>
      </div>
      <div class="editor-workspace">
        <div class="file-tree">
          <h3>Files</h3>
          <div id="file-list"></div>
          <button id="new-file-btn">+ New File</button>
        </div>
        <div class="code-editor">
          <textarea id="code-input" spellcheck="false"></textarea>
        </div>
        <div class="output-panel">
          <h3>Output</h3>
          <pre id="output-content"></pre>
        </div>
      </div>
    `;

    // Load project
    await this.loadProject(projectId);

    // Setup CRDT collaboration
    this.setupCollaboration(projectId);

    // Event listeners
    document.getElementById('save-btn')?.addEventListener('click', () => this.saveProject());
    document.getElementById('run-btn')?.addEventListener('click', () => this.runCode());
  }

  private async loadProject(projectId: string): Promise<void> {
    let project;
    try {
      if (navigator.onLine) {
        project = (await this.appwrite.getProjects()).find((p) => p.id === projectId);
      } else {
        project = await this.storage.getProject(projectId);
      }
    } catch {
      project = await this.storage.getProject(projectId);
    }

    if (!project) {
      alert('Project not found');
      return;
    }

    document.getElementById('project-name')!.textContent = project.name;

    // Load first file
    const firstFile = Object.keys(project.files)[0];
    if (firstFile) {
      const textarea = document.getElementById('code-input') as HTMLTextAreaElement;
      textarea.value = project.files[firstFile];
    }
  }

  private setupCollaboration(projectId: string): void {
    // Subscribe to real-time updates
    this.appwrite.subscribeToProject(projectId, (response: RealtimeResponse) => {
      console.log('Real-time update:', response);
      // Apply CRDT updates
      this.applyRemoteChanges(response.payload);
    });

    // Listen to local changes
    const textarea = document.getElementById('code-input') as HTMLTextAreaElement;
    textarea.addEventListener('input', () => {
      this.yText.delete(0, this.yText.length);
      this.yText.insert(0, textarea.value);
    });

    // Observe CRDT changes
    this.yText.observe(() => {
      textarea.value = this.yText.toString();
    });
  }

  private applyRemoteChanges(payload: unknown): void {
    // Implement CRDT merge logic
    console.log('Applying remote changes:', payload);
  }

  private async saveProject(): Promise<void> {
    if (!this.currentProjectId) return;

    const textarea = document.getElementById('code-input') as HTMLTextAreaElement;
    const content = textarea.value;

    try {
      if (navigator.onLine) {
        await this.appwrite.updateProject(this.currentProjectId, {
          files: { 'main.js': content },
          updatedAt: new Date().toISOString(),
        });
      } else {
        await this.storage.saveProject({
          id: this.currentProjectId,
          files: { 'main.js': content },
          updatedAt: new Date().toISOString(),
        });
        await this.storage.addPendingSync('update', this.currentProjectId, {
          files: { 'main.js': content },
        });
      }

      alert('Saved!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed');
    }
  }

  private async runCode(): Promise<void> {
    const textarea = document.getElementById('code-input') as HTMLTextAreaElement;
    const code = textarea.value;

    try {
      // Execute code in Cloudflare Worker sandbox
      const response = await fetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();
      const output = document.getElementById('output-content')!;
      output.textContent = result.output || result.error || 'No output';
    } catch (error) {
      console.error('Execution failed:', error);
      const output = document.getElementById('output-content')!;
      output.textContent = `Error: ${error}`;
    }
  }
}
