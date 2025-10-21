import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export class CollaborativeSession {
  private yDoc: Y.Doc;
  private provider: WebsocketProvider | null = null;

  constructor(private roomId: string) {
    this.yDoc = new Y.Doc();
  }

  connect(wsUrl: string): void {
    this.provider = new WebsocketProvider(wsUrl, this.roomId, this.yDoc);

    this.provider.on('status', (event: { status: string }) => {
      console.log('WebSocket status:', event.status);
    });
  }

  disconnect(): void {
    this.provider?.destroy();
  }

  getSharedText(key: string): Y.Text {
    return this.yDoc.getText(key);
  }

  getAwareness() {
    return this.provider?.awareness;
  }
}
