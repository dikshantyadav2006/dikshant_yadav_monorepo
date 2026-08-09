'use client';

import { motion } from 'framer-motion';

interface BlockEmbedProps {
  url: string;
  aspectRatio?: string;
}

const RATIO_MAP: Record<string, string> = {
  '16/9': '56.25%',
  '4/3': '75%',
  '1/1': '100%',
  '9/16': '177.78%',
};

function getEmbedSrc(url: string): string {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export default function BlockEmbed({ url, aspectRatio = '16/9' }: BlockEmbedProps) {
  const src = getEmbedSrc(url);
  const padBottom = RATIO_MAP[aspectRatio] || RATIO_MAP['16/9'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full px-1"
    >
      <div
        className="relative w-full overflow-hidden bg-black"
        style={{ paddingBottom: padBottom }}
      >
        <iframe
          src={src}
          title={url}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </motion.div>
  );
}
