/**
 * Benchmark article API + Next.js page load times.
 * Usage: node scripts/benchmark-article.mjs [postId]
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
const postId = process.argv[2];

async function timedFetch(label, url, options = {}) {
  const start = performance.now();
  const res = await fetch(url, options);
  const durationMs = Math.round(performance.now() - start);
  const ok = res.ok;
  let size = 0;
  try {
    const text = await res.text();
    size = text.length;
  } catch {
    // ignore
  }
  return { label, url, durationMs, ok, size };
}

async function discoverPostId() {
  const res = await fetch(`${API_URL}/posts?limit=1`);
  if (!res.ok) throw new Error(`API unavailable at ${API_URL}`);
  const data = await res.json();
  const post = data.posts?.[0];
  if (!post) throw new Error('No published posts found');
  return { id: post.id, slug: post.slug };
}

async function run() {
  const target = postId
    ? { id: postId, slug: 'benchmark' }
    : await discoverPostId();

  console.log(`\nBenchmarking post ${target.id}\n`);

  const results = [];

  // Cold-ish API post detail
  results.push(
    await timedFetch('API GET /posts/:id (1)', `${API_URL}/posts/${target.id}`, {
      cache: 'no-store',
    }),
  );

  // Warm API post detail
  results.push(
    await timedFetch('API GET /posts/:id (2)', `${API_URL}/posts/${target.id}`, {
      cache: 'no-store',
    }),
  );

  results.push(
    await timedFetch('API GET /related', `${API_URL}/related?postId=${target.id}&limit=3`, {
      cache: 'no-store',
    }),
  );

  if (target.slug !== 'benchmark') {
    results.push(
      await timedFetch(
        'Next.js article page',
        `${WEB_URL}/posts/${target.id}/${target.slug}`,
        { cache: 'no-store' },
      ),
    );
  }

  console.table(results);

  const apiFirst = results.find((r) => r.label.includes('(1)'));
  const apiSecond = results.find((r) => r.label.includes('(2)'));
  if (apiFirst && apiSecond) {
    console.log(
      `\nAPI warm improvement: ${apiFirst.durationMs}ms → ${apiSecond.durationMs}ms`,
    );
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
