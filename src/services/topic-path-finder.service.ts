import { Topic, Resource } from '@prisma/client';

export interface TopicNode extends Topic {
  childTopics: TopicNode[];
  parentTopic: TopicNode | null;
  resources: Resource[];
}

interface PathNode {
  topic: TopicNode;
  path: TopicNode[];
}

/**
 * Service class for finding paths between topics in the hierarchy
 * This implementation uses a bidirectional BFS approach to find the path more efficiently
 */
export class TopicPathFinderService {
  private buildAncestorMap(topic: TopicNode): Map<string, TopicNode> {
    const ancestorMap = new Map<string, TopicNode>();
    let current: TopicNode | null | undefined = topic;

    while (current) {
      ancestorMap.set(current.id, current);
      current = current.parentTopic;
    }

    return ancestorMap;
  }

  private findCommonAncestor(topic1: TopicNode, topic2: TopicNode): TopicNode | null {
    const ancestors1 = this.buildAncestorMap(topic1);
    let current: TopicNode | null | undefined = topic2;

    while (current) {
      if (ancestors1.has(current.id)) {
        return current;
      }
      current = current.parentTopic;
    }

    return null;
  }

  private buildPathToAncestor(from: TopicNode, to: TopicNode): TopicNode[] {
    const path: TopicNode[] = [];
    let current: TopicNode | null | undefined = from;

    while (current && current.id !== to.id) {
      path.push(current);
      current = current.parentTopic;
    }

    if (current) {
      path.push(current);
    }

    return path;
  }

  private findChildPath(from: TopicNode, targetId: string): TopicNode[] | null {
    const queue: PathNode[] = [{ topic: from, path: [from] }];
    const visited = new Set<string>([from.id]);

    while (queue.length > 0) {
      const { topic, path } = queue.shift()!;

      if (topic.id === targetId) {
        return path;
      }

      for (const child of topic.childTopics) {
        if (!visited.has(child.id)) {
          visited.add(child.id);
          queue.push({
            topic: child,
            path: [...path, child]
          });
        }
      }
    }

    return null;
  }

  /**
   * Finds the shortest path between two topics in the hierarchy
   * @param topic1 Starting topic
   * @param topic2 Target topic
   * @returns Array of topics representing the path, or null if no path exists
   */
  findShortestPath(topic1: TopicNode, topic2: TopicNode): TopicNode[] | null {
    // If it's the same topic, return it as a single-element path
    if (topic1.id === topic2.id) {
      return [topic1];
    }

    // First, try to find if one topic is a descendant of the other
    const directPath = this.findChildPath(topic1, topic2.id);
    if (directPath) {
      return directPath;
    }

    const reversePath = this.findChildPath(topic2, topic1.id);
    if (reversePath) {
      return reversePath.reverse();
    }

    // If no direct path exists, find the lowest common ancestor
    const commonAncestor = this.findCommonAncestor(topic1, topic2);
    if (!commonAncestor) {
      return null; // No path exists
    }

    // Build paths from both topics to the common ancestor
    const path1 = this.buildPathToAncestor(topic1, commonAncestor);
    const path2 = this.buildPathToAncestor(topic2, commonAncestor);

    // Combine the paths (reverse the second path to get the correct order)
    return [...path1, ...path2.slice(0, -1).reverse()];
  }
}
