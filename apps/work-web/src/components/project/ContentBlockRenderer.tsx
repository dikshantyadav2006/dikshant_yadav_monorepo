import { ContentBlock } from '@/types/project';
import { CodeBlockInteractive } from '@dikshant/ui';
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
import ProjectCreditsBlock from './blocks/ProjectCreditsBlock';

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
    case 'project-credits':
      return (
        <ProjectCreditsBlock
          key={index}
          eyebrow={block.eyebrow}
          title={block.title}
          headingLabel={block.headingLabel}
          heading={block.heading}
          year={block.year}
          items={block.items}
        />
      );
    case 'code-block-interactive': {
      const rawCode = ((block as any).code || '') || ((block as any).html || '');
      const isFullDoc = typeof rawCode === 'string' && (/^\s*<!doctype/i.test(rawCode) || /<html[\s>]/i.test(rawCode));
      const hasImmersiveHints = isFullDoc && (/position\s*:\s*(fixed|absolute)/i.test(rawCode) || /height\s*:\s*100%/i.test(rawCode) || /inset\s*:\s*0/i.test(rawCode) || /overflow\s*:\s*hidden/i.test(rawCode));
      const widthModeRaw = (block as any).widthMode || 'contained';
      const widthMode = isFullDoc && hasImmersiveHints && widthModeRaw === 'contained' ? 'full-bleed' : widthModeRaw;
      const effectiveData = isFullDoc && hasImmersiveHints && widthModeRaw === 'contained' ? { ...(block as any), widthMode } : (block as any);
      let wrapperClass = 'relative block w-full min-w-0 max-w-full bg-transparent overflow-x-clip';
      let wrapperStyle: React.CSSProperties = {};
      if (widthMode === 'wide') {
        wrapperClass = 'relative block left-1/2 -translate-x-1/2 min-w-0 max-w-none bg-transparent overflow-visible';
        wrapperStyle = { width: 'min(1400px, calc(100vw - 2rem))' };
      } else if (widthMode === 'full-bleed') {
        wrapperClass = 'relative block min-w-0 max-w-none bg-transparent overflow-visible';
        wrapperStyle = { width: '100vw', marginLeft: 'calc(50% - 50vw)', maxWidth: 'none' as any };
      }
      return (
        <div key={index} className={wrapperClass} style={wrapperStyle}>
          <CodeBlockInteractive data={effectiveData} />
        </div>
      );
    }
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
