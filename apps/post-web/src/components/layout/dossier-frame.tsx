import { cn } from '@/lib/utils';

interface DossierFrameProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export default function DossierFrame({ children, className, label }: DossierFrameProps) {
  return (
    <section className={cn('dossier-frame p-6 sm:p-8', className)}>
      {label && (
        <div className="absolute -top-3 left-4 bg-card px-2">
          <span className="dossier-label">{label}</span>
        </div>
      )}
      {children}
    </section>
  );
}
