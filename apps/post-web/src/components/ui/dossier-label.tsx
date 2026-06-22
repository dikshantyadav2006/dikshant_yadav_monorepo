import { cn } from '@/lib/utils';

interface DossierLabelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'classified' | 'reference';
}

export default function DossierLabel({
  children,
  className,
  variant = 'default',
}: DossierLabelProps) {
  return (
    <span
      className={cn(
        'dossier-label inline-block',
        variant === 'classified' && 'text-stamp font-bold',
        variant === 'reference' && 'text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}
