import { ContentBlock } from '@/types/project';
import BlockLargeImage from './blocks/BlockLargeImage';
import BlockGrid2 from './blocks/BlockGrid2';
import BlockBanner from './blocks/BlockBanner';
import BlockPosters from './blocks/BlockPosters';
import BlockMobileShowcase from './blocks/BlockMobileShowcase';
import BlockDesktopShowcase from './blocks/BlockDesktopShowcase';
import BlockBento from './blocks/BlockBento';
import BlockVideo from './blocks/BlockVideo';
import BlockEmbed from './blocks/BlockEmbed';
import BlockMetrics from './blocks/BlockMetrics';
import BlockLink from './blocks/BlockLink';

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'large-image':
      return <BlockLargeImage key={index} src={block.src} alt={block.alt} height={block.height} />;
    case 'grid-2':
      return (
        <BlockGrid2
          key={index}
          images={block.images}
          alts={block.alts}
          height={block.height}
        />
      );
    case 'banner':
      return <BlockBanner key={index} src={block.src} alt={block.alt} height={block.height} />;
    case 'posters':
      return (
        <BlockPosters
          key={index}
          images={block.images}
          alts={block.alts}
          height={block.height}
        />
      );
    case 'mobile-showcase':
      return (
        <BlockMobileShowcase key={index} mobile={block.mobile} desktop={block.desktop} />
      );
    case 'desktop-showcase':
      return (
        <BlockDesktopShowcase key={index} desktop={block.desktop} mobile={block.mobile} />
      );
    case 'bento':
      return (
        <BlockBento
          key={index}
          story={block.story}
          client={block.client}
          year={block.year}
          services={block.services}
          timeline={block.timeline}
          role={block.role}
          techStack={block.techStack}
          results={block.results}
        />
      );
    case 'video':
      return <BlockVideo key={index} src={block.src} title={block.title} poster={block.poster} />;
    case 'embed':
      return <BlockEmbed key={index} url={block.url} aspectRatio={block.aspectRatio} />;
    case 'metrics':
      return <BlockMetrics key={index} items={block.items} />;
    case 'link':
      return (
        <BlockLink
          key={index}
          label={block.label}
          href={block.href}
          description={block.description}
        />
      );
    default:
      return null;
  }
}

export default function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  return (
    <div className="flex flex-col gap-[60px] md:gap-[80px]">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}
