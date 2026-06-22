import type { Block, CanvasEdge, CanvasNode } from '@dikshant/types';

export function orderNodes(nodes: CanvasNode[], edges: CanvasEdge[]): Block[] {
  const adjList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const nodeMap = new Map<string, CanvasNode>();

  for (const node of nodes) {
    nodeMap.set(node.id, node);
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  }

  for (const edge of edges) {
    if (inDegree.has(edge.target) && adjList.has(edge.source)) {
      adjList.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, inDegree.get(edge.target)! + 1);
    }
  }

  const queue: string[] = [];
  for (const node of nodes) {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  }

  const orderedBlocks: Block[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    queue.sort((a, b) => {
      const nodeA = nodeMap.get(a)!;
      const nodeB = nodeMap.get(b)!;
      if (nodeA.position.y !== nodeB.position.y) {
        return nodeA.position.y - nodeB.position.y;
      }
      return nodeA.position.x - nodeB.position.x;
    });

    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentNode = nodeMap.get(currentId)!;
    orderedBlocks.push({
      id: currentNode.id,
      type: currentNode.type,
      data: currentNode.data ?? {},
    });

    for (const targetId of adjList.get(currentId) || []) {
      const newDegree = inDegree.get(targetId)! - 1;
      inDegree.set(targetId, newDegree);
      if (newDegree === 0) {
        queue.push(targetId);
      }
    }
  }

  const remainingNodes = nodes.filter((n) => !visited.has(n.id));
  if (remainingNodes.length > 0) {
    remainingNodes.sort((a, b) => {
      if (a.position.y !== b.position.y) return a.position.y - b.position.y;
      return a.position.x - b.position.x;
    });
    for (const node of remainingNodes) {
      orderedBlocks.push({ id: node.id, type: node.type, data: node.data ?? {} });
    }
  }

  return orderedBlocks;
}

export function resolveBlocks(canvasData: {
  blocks?: Block[];
  nodes?: CanvasNode[];
  edges?: CanvasEdge[];
} | null | undefined): Block[] {
  if (!canvasData) return [];
  if (canvasData.blocks?.length) return canvasData.blocks;
  if (canvasData.nodes?.length) {
    return orderNodes(canvasData.nodes, canvasData.edges || []);
  }
  return [];
}
