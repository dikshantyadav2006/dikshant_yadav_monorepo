const builtInNodes = [
  {
    type: 'heading',
    label: 'Heading',
    category: 'Content',
    defaultData: { level: 2, text: 'Untitled section' },
  },
  {
    type: 'text',
    label: 'Text',
    category: 'Content',
    defaultData: { body: '' },
  },
  {
    type: 'image',
    label: 'Image',
    category: 'Media',
    defaultData: {
      src: '',
      alt: '',
      caption: '',
      mediaId: null,
      width: null,
      height: null,
      blurDataUrl: null,
      dominantColor: null,
      responsiveMeta: null,
      layout: 'auto',
      focalPoint: { x: 50, y: 50 },
    },
  },
  {
    type: 'video',
    label: 'Video',
    category: 'Media',
    defaultData: { src: '', title: '' },
  },
  {
    type: 'gallery',
    label: 'Gallery',
    category: 'Media',
    defaultData: { items: [] },
  },
  {
    type: 'quote',
    label: 'Quote',
    category: 'Content',
    defaultData: { quote: '', attribution: '' },
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'Layout',
    defaultData: {},
  },
  {
    type: 'code-block',
    label: 'Code Block',
    category: 'Content',
    defaultData: { language: 'typescript', code: '' },
  },
  {
    type: 'question',
    label: 'Question',
    category: 'Interactive',
    defaultData: { prompt: '', options: [] },
  },
  {
    type: 'poll',
    label: 'Poll',
    category: 'Interactive',
    defaultData: { prompt: '', options: [] },
  },
  {
    type: 'embed',
    label: 'Embed',
    category: 'Media',
    defaultData: { url: '' },
  },
  {
    type: 'button',
    label: 'Button',
    category: 'Interactive',
    defaultData: { label: 'Continue', href: '' },
  },
  {
    type: 'ai-block',
    label: 'AI Block',
    category: 'AI',
    defaultData: { prompt: '', outputType: 'text' },
  },
  {
    type: 'code-block-interactive',
    label: 'Code Block',
    category: 'Code',
    defaultData: {
      title: '',
      runtime: 'react',
      code: '',
      html: '',
      css: '',
      js: '',
      props: {},
      previewHeight: 400,
      renderMode: 'preview',
      widthMode: 'contained',
      dependencies: [],
      libraryId: null,
      versionId: '',
      version: 1,
    },
  },
];

export class NodeRegistry {
  constructor() {
    this.nodes = new Map();
  }

  register(definition) {
    if (!definition?.type) {
      throw new Error('Node definitions require a type.');
    }

    this.nodes.set(definition.type, definition);
    return this;
  }

  registerMany(definitions) {
    definitions.forEach((definition) => this.register(definition));
    return this;
  }

  get(type) {
    return this.nodes.get(type);
  }

  has(type) {
    return this.nodes.has(type);
  }

  list() {
    return Array.from(this.nodes.values());
  }

  createNode(type, position = { x: 0, y: 0 }, data = {}) {
    const definition = this.get(type);
    if (!definition) {
      throw new Error(`Unknown node type: ${type}`);
    }

    return {
      id: `${type}-${crypto.randomUUID()}`,
      type,
      position,
      data: {
        ...structuredClone(definition.defaultData ?? {}),
        ...data,
      },
    };
  }
}

export const nodeRegistry = new NodeRegistry().registerMany(builtInNodes);
export const builtInNodeDefinitions = builtInNodes;

export const builtInWorkNodes = [
  {
    type: 'large-image',
    label: 'Image',
    category: 'Portfolio',
    defaultData: { src: '', alt: '' },
  },
  {
    type: 'about',
    label: 'About',
    category: 'Portfolio',
    defaultData: {
      eyebrow: 'The Project',
      heading: 'About',
      title: '',
      body: '',
    },
  },
  {
    type: 'grid-2',
    label: '2-Column Grid',
    category: 'Portfolio',
    defaultData: { images: ['', ''], alts: ['', ''], height: '' },
  },
  {
    type: 'banner',
    label: 'Banner',
    category: 'Portfolio',
    defaultData: { src: '', alt: '', height: '' },
  },
  {
    type: 'posters',
    label: 'Posters',
    category: 'Portfolio',
    defaultData: { images: ['', ''], alts: ['', ''], height: '' },
  },
  {
    type: 'mobile-showcase',
    label: 'Mobile Showcase',
    category: 'Portfolio',
    defaultData: { mobile: [], desktop: [] },
  },
  {
    type: 'desktop-showcase',
    label: 'Desktop Showcase',
    category: 'Portfolio',
    defaultData: { desktop: [], mobile: [] },
  },
  {
    type: 'bento',
    label: 'Project Bento',
    category: 'Portfolio',
    defaultData: {
      story: '',
      client: '',
      year: '',
      services: [],
      timeline: '',
      role: '',
      techStack: [],
      results: '',
    },
  },
  {
    type: 'video',
    label: 'Video',
    category: 'Portfolio',
    defaultData: { src: '', title: '', poster: '' },
  },
  {
    type: 'embed',
    label: 'Embed',
    category: 'Portfolio',
    defaultData: { url: '', aspectRatio: '16/9' },
  },
  {
    type: 'metrics',
    label: 'Metrics',
    category: 'Portfolio',
    defaultData: { items: [] },
  },
  {
    type: 'link',
    label: 'Link / CTA',
    category: 'Portfolio',
    defaultData: { label: '', href: '', description: '' },
  },
  {
    type: 'project-credits',
    label: 'Project Credits',
    category: 'Portfolio',
    defaultData: {
      eyebrow: 'Project Metadata',
      title: 'Credits',
      headingLabel: 'Project Credits',
      heading: 'Crafted With\nPrecision',
      year: '',
      items: [
        { label: 'Art Direction', value: '', variant: 'script' },
        { label: 'Web Design', value: '', variant: 'condensed' },
        { label: 'Development', value: '', variant: 'mono' },
      ],
    },
  },
  {
    type: 'code-block-interactive',
    label: 'Code Block',
    category: 'Code',
    defaultData: {
      title: '',
      runtime: 'react',
      code: '',
      html: '',
      css: '',
      js: '',
      props: {},
      previewHeight: 400,
      renderMode: 'preview',
      widthMode: 'contained',
      dependencies: [],
      libraryId: null,
      versionId: '',
      version: 1,
    },
  },
];

export const workNodeRegistry = new NodeRegistry().registerMany(builtInWorkNodes);
export const builtInWorkNodeDefinitions = builtInWorkNodes;

export const workTemplates = [
  {
    id: 'showcase',
    name: 'Showcase',
    description: 'Large hero image, 2-column grid, banner and desktop screenshots.',
    nodes: [
      { id: 'tpl-large-1', type: 'large-image', position: { x: 0, y: 0 }, data: { src: '', alt: '', height: '' } },
      { id: 'tpl-grid-1', type: 'grid-2', position: { x: 0, y: 160 }, data: { images: ['', ''], alts: ['', ''], height: '' } },
      { id: 'tpl-banner-1', type: 'banner', position: { x: 0, y: 320 }, data: { src: '', alt: '', height: '' } },
      { id: 'tpl-desk-1', type: 'desktop-showcase', position: { x: 0, y: 480 }, data: { desktop: [], mobile: [] } },
    ],
    edges: [
      { id: 'tpl-e-1', source: 'tpl-large-1', target: 'tpl-grid-1' },
      { id: 'tpl-e-2', source: 'tpl-grid-1', target: 'tpl-banner-1' },
      { id: 'tpl-e-3', source: 'tpl-banner-1', target: 'tpl-desk-1' },
    ],
  },
  {
    id: 'brand-identity',
    name: 'Brand Identity',
    description: 'Poster-led layout for branding and art direction projects.',
    nodes: [
      { id: 'tpl-large-1', type: 'large-image', position: { x: 0, y: 0 }, data: { src: '', alt: '', height: '' } },
      { id: 'tpl-poster-1', type: 'posters', position: { x: 0, y: 160 }, data: { images: ['', ''], alts: ['', ''], height: '' } },
      { id: 'tpl-grid-1', type: 'grid-2', position: { x: 0, y: 320 }, data: { images: ['', ''], alts: ['', ''], height: '' } },
      { id: 'tpl-banner-1', type: 'banner', position: { x: 0, y: 480 }, data: { src: '', alt: '', height: '' } },
      { id: 'tpl-mob-1', type: 'mobile-showcase', position: { x: 0, y: 640 }, data: { mobile: [], desktop: [] } },
    ],
    edges: [
      { id: 'tpl-e-1', source: 'tpl-large-1', target: 'tpl-poster-1' },
      { id: 'tpl-e-2', source: 'tpl-poster-1', target: 'tpl-grid-1' },
      { id: 'tpl-e-3', source: 'tpl-grid-1', target: 'tpl-banner-1' },
      { id: 'tpl-e-4', source: 'tpl-banner-1', target: 'tpl-mob-1' },
    ],
  },
  {
    id: 'website-case-study',
    name: 'Website Case Study',
    description: 'Desktop-first layout for web design projects.',
    nodes: [
      { id: 'tpl-large-1', type: 'large-image', position: { x: 0, y: 0 }, data: { src: '', alt: '', height: '' } },
      { id: 'tpl-desk-1', type: 'desktop-showcase', position: { x: 0, y: 160 }, data: { desktop: [], mobile: [] } },
      { id: 'tpl-grid-1', type: 'grid-2', position: { x: 0, y: 320 }, data: { images: ['', ''], alts: ['', ''], height: '' } },
      { id: 'tpl-banner-1', type: 'banner', position: { x: 0, y: 480 }, data: { src: '', alt: '', height: '' } },
    ],
    edges: [
      { id: 'tpl-e-1', source: 'tpl-large-1', target: 'tpl-desk-1' },
      { id: 'tpl-e-2', source: 'tpl-desk-1', target: 'tpl-grid-1' },
      { id: 'tpl-e-3', source: 'tpl-grid-1', target: 'tpl-banner-1' },
    ],
  },
];
