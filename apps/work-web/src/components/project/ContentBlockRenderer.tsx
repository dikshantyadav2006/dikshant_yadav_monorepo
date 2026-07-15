import { ContentBlock } from '@/types/project';
import BlockLargeImage from './blocks/BlockLargeImage';
import BlockGrid2 from './blocks/BlockGrid2';
import BlockBanner from './blocks/BlockBanner';
import BlockPosters from './blocks/BlockPosters';
import BlockMobileShowcase from './blocks/BlockMobileShowcase';
import BlockDesktopShowcase from './blocks/BlockDesktopShowcase';

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
    default:
      return null;
  }
}

export default function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  return (
    <div className="flex flex-col gap-[80px] md:gap-[120px]">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}
