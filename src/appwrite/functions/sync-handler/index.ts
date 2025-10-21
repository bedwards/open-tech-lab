interface AppwriteContext {
  req: {
    body: string;
  };
  res: {
    json: (data: unknown, status?: number) => void;
  };
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

interface SyncPayload {
  event: string;
  [key: string]: unknown;
}

export default async ({ req, res, log, error }: AppwriteContext) => {
  try {
    const payload = JSON.parse(req.body || '{}') as SyncPayload;

    log('Sync event received:', payload);

    // Handle document changes
    if (payload.event.includes('documents')) {
      await syncToSQLite(payload);
    }

    return res.json({ success: true });
  } catch (err) {
    error('Sync failed:', err);
    return res.json({ success: false, error: String(err) }, 500);
  }
};

async function syncToSQLite(payload: SyncPayload): Promise<void> {
  // Sync changes to SQLite database
  console.log('Syncing to SQLite:', payload);
  // Implementation would use Drizzle ORM to update SQLite
}
