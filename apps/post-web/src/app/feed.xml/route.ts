import { NextResponse } from 'next/server';
import { SITE_URL, SITE_NAME } from '@/lib/constants';
import { getPosts, getPostPath } from '@/lib/posts';

export async function GET() {
  const { posts } = await getPosts({ limit: 50 });

  const itemsXml = posts
    .map((post) => {
      const link = `${SITE_URL}${getPostPath(post)}`;
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
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
      <description>Intelligence archive and editorial dossier system.</description>
      <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
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
