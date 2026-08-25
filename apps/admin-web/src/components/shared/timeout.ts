export function withTimeout<T>(
  fn: () => Promise<T>,
  ms: number,
  label = 'Operation',
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms. Check for infinite loops.`));
    }, ms);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export const TIMEOUTS = {
  compile: 5000,
  render: 3000,
  preview: 10000,
} as const;
