export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown>,
  kv: KVNamespace
): Promise<void> {
  const timestamp = Date.now();
  const eventId = `${eventName}:${timestamp}`;

  await kv.put(
    eventId,
    JSON.stringify({
      event: eventName,
      properties,
      timestamp,
    }),
    {
      expirationTtl: 86400 * 7, // 7 days
    }
  );
}

export async function getAnalyticsSummary(kv: KVNamespace): Promise<{
  totalEvents: number;
  events: unknown[];
}> {
  const list = await kv.list({ prefix: '' });

  const events = await Promise.all(
    list.keys.map(async (key) => {
      const value = await kv.get(key.name, 'json');
      return value;
    })
  );

  return {
    totalEvents: events.length,
    events: events.filter(Boolean),
  };
}
