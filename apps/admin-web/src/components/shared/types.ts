export interface CodeBlockInteractiveData {
  title: string;
  description: string;
  runtime: 'react' | 'html';
  code: string;
  html: string;
  css: string;
  js: string;
  props: Record<string, any>;
  previewHeight: number;
  previewWidth: number;
  renderMode: 'preview' | 'component' | 'hidden';
  dependencies: string[];
  libraryId: string | null;
  versionId: string;
  version: number;
  lastSavedAt: string | null;
  componentExports: string[];
}

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export const PREVIEW_DEVICES: Record<PreviewDevice, { width: number; label: string }> = {
  desktop: { width: 0, label: 'Desktop' },
  tablet: { width: 768, label: 'Tablet' },
  mobile: { width: 375, label: 'Mobile' },
};
