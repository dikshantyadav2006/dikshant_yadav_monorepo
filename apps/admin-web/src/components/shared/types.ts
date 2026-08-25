export interface CodeBlockInteractiveData {
  title: string;
  runtime: 'react' | 'html';
  code: string;
  props: Record<string, any>;
  previewHeight: number;
  renderMode: 'preview' | 'component' | 'hidden';
  dependencies: string[];
  libraryId: string | null;
  versionId: string;
  version: number;
}
