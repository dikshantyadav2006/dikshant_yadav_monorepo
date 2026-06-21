import type { CanvasNode, CanvasNodeType, CanvasPosition } from '@dikshant/types';

export interface NodeDefinition<TData = Record<string, unknown>> {
  type: CanvasNodeType | string;
  label: string;
  category: 'Content' | 'Media' | 'Layout' | 'Interactive' | 'AI' | string;
  defaultData: TData;
}

export declare class NodeRegistry {
  register(definition: NodeDefinition): this;
  registerMany(definitions: NodeDefinition[]): this;
  get(type: string): NodeDefinition | undefined;
  has(type: string): boolean;
  list(): NodeDefinition[];
  createNode<TData = Record<string, unknown>>(
    type: string,
    position?: CanvasPosition,
    data?: Partial<TData>,
  ): CanvasNode<TData>;
}

export declare const nodeRegistry: NodeRegistry;
export declare const builtInNodeDefinitions: NodeDefinition[];
