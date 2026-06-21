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
    defaultData: { src: '', alt: '', caption: '' },
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
