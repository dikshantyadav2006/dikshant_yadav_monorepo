import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET() {
  let posts = [];
  try {
    const res = await fetch(`${API_URL}/posts?limit=50`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      posts = data.posts || [];
    }
  } catch (error) {
    console.error('RSS fetch failed', error);
  }

  const itemsXml = posts
    .map((post: any) => {
      const link = `https://post.dikshantyadav.in/posts/${post.slug}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date(post.createdAt).toUTCString();
      return `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${post.excerpt || ''}]]></description>
      </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>Dikshant Yadav Blog</title>
      <link>https://post.dikshantyadav.in</link>
      <description>Premium developer blogging platform covering engineering, design, and web trends.</description>
      <atom:link href="https://post.dikshantyadav.in/feed.xml" rel="self" type="application/rss+xml" />
      ${itemsXml}
    </channel>
  </rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
