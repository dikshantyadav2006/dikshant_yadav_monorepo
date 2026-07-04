const PERF_ENABLED =
  process.env.LOG_PERF === 'true' || process.env.NODE_ENV !== 'production';

export function perfNow(): number {
  return performance.now();
}

export function logPerf(
  label: string,
  startMs: number,
  meta?: Record<string, unknown>,
): number {
  const durationMs = Math.round(performance.now() - startMs);
  if (PERF_ENABLED) {
    console.log(
      JSON.stringify({
        type: 'perf',
        label,
        durationMs,
        ...meta,
      }),
    );
  }
  return durationMs;
}

export async function timed<T>(
  label: string,
  fn: () => Promise<T>,
  meta?: Record<string, unknown>,
): Promise<T> {
  const start = perfNow();
  try {
    return await fn();
  } finally {
    logPerf(label, start, meta);
  }
}
