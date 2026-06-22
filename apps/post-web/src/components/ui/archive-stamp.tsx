import { cn } from '@/lib/utils';

interface ArchiveStampProps {
  text?: string;
  className?: string;
}

export default function ArchiveStamp({
  text = 'Declassified',
  className,
}: ArchiveStampProps) {
  return (
    <div
      className={cn('archive-stamp select-none', className)}
      aria-hidden
    >
      {text}
    </div>
  );
}
