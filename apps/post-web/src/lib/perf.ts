const PERF_ENABLED =
  process.env.LOG_PERF === 'true' || process.env.NODE_ENV === 'development';

export function logServerFetch(
  path: string,
  startMs: number,
  status: number,
  meta?: Record<string, unknown>,
): void {
  if (!PERF_ENABLED) return;

  console.log(
    JSON.stringify({
      type: 'server-fetch',
      path,
      status,
      durationMs: Math.round(performance.now() - startMs),
      ...meta,
    }),
  );
}

export function logServerRender(
  label: string,
  startMs: number,
  meta?: Record<string, unknown>,
): void {
  if (!PERF_ENABLED) return;

  console.log(
    JSON.stringify({
      type: 'server-render',
      label,
      durationMs: Math.round(performance.now() - startMs),
      ...meta,
    }),
  );
}
