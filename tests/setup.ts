import { vi } from 'vitest';

// Mock IndexedDB
const mockIDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.indexedDB = mockIDB as any;

// Mock idb library
vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue({
    get: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn().mockResolvedValue([]),
    put: vi.fn().mockResolvedValue(undefined),
    add: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  }),
  deleteDB: vi.fn().mockResolvedValue(undefined),
}));

// Mock Appwrite SDK globally
/*global global*/
vi.mock('appwrite', () => ({
  Client: vi.fn(() => ({
    setEndpoint: vi.fn().mockReturnThis(),
    setProject: vi.fn().mockReturnThis(),
  })),
  Account: vi.fn(() => ({
    get: vi.fn().mockResolvedValue({ $id: 'test-user', email: 'test@example.com' }),
    createEmailPasswordSession: vi.fn().mockResolvedValue({ $id: 'session-id' }),
    deleteSession: vi.fn().mockResolvedValue(true),
  })),
  Databases: vi.fn(() => ({
    createDocument: vi.fn().mockResolvedValue({ $id: 'doc-id' }),
    listDocuments: vi.fn().mockResolvedValue({ documents: [] }),
    updateDocument: vi.fn().mockResolvedValue({ $id: 'doc-id' }),
    deleteDocument: vi.fn().mockResolvedValue(true),
  })),
  Storage: vi.fn(() => ({
    createFile: vi.fn().mockResolvedValue({ $id: 'file-id' }),
    getFileView: vi.fn().mockReturnValue('http://example.com/file'),
  })),
  Functions: vi.fn(() => ({
    createExecution: vi.fn().mockResolvedValue({ $id: 'exec-id' }),
  })),
  Realtime: vi.fn(() => ({
    subscribe: vi.fn().mockReturnValue(() => {}),
  })),
}));

// Setup DOM environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock crypto.randomUUID
if (!global.crypto) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.crypto = {} as any;
}
global.crypto.randomUUID = vi.fn(() => 'mock-uuid-' + Math.random());
