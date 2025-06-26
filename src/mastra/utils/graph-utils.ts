import Graph from 'graphology';
import { bidirectional } from 'graphology-shortest-path';
import { v4 as uuidv4 } from 'uuid';
import { GraphNode, MBTIType, MBTIGroup } from '../types/mbti-types';
import { GROUP_COMPATIBILITY, getGroupFromType } from './mbti-characteristics';

export class DiscussionGraph {
  private graph: Graph;
  private nodeMap: Map<string, GraphNode>;

  constructor() {
    this.graph = new Graph();
    this.nodeMap = new Map();
  }

  addAgent(mbtiType: MBTIType): string {
    const nodeId = uuidv4();
    const node: GraphNode = {
      id: nodeId,
      mbtiType,
      group: getGroupFromType(mbtiType),
      weight: 1.0,
      connections: new Map()
    };

    this.nodeMap.set(nodeId, node);
    this.graph.addNode(nodeId, {
      mbtiType,
      group: node.group,
      weight: node.weight
    });

    // 既存のノードとの接続を作成
    this.nodeMap.forEach((existingNode, existingId) => {
      if (existingId !== nodeId) {
        const strength = this.calculateConnectionStrength(node, existingNode);
        this.graph.addEdge(nodeId, existingId, { weight: strength });
        node.connections.set(existingId, strength);
        existingNode.connections.set(nodeId, strength);
      }
    });

    return nodeId;
  }

  private calculateConnectionStrength(node1: GraphNode, node2: GraphNode): number {
    const baseCompatibility = GROUP_COMPATIBILITY[node1.group][node2.group];
    
    // 同じグループ内でも個体差を反映
    const variance = node1.group === node2.group ? 0.9 : 1.0;
    
    return baseCompatibility * variance;
  }

  updateNodeWeight(nodeId: string, weight: number): void {
    const node = this.nodeMap.get(nodeId);
    if (node) {
      node.weight = weight;
      this.graph.setNodeAttribute(nodeId, 'weight', weight);
    }
  }

  getNodeWeight(nodeId: string): number {
    return this.nodeMap.get(nodeId)?.weight || 1.0;
  }

  getShortestPath(fromId: string, toId: string): string[] | null {
    try {
      return bidirectional(this.graph, fromId, toId);
    } catch {
      return null;
    }
  }

  getClusterCoefficient(): number {
    // クラスター凝集度の計算
    let totalCoefficient = 0;
    let nodeCount = 0;

    this.graph.forEachNode((node) => {
      const neighbors = this.graph.neighbors(node);
      const k = neighbors.length;
      
      if (k > 1) {
        let triangles = 0;
        for (let i = 0; i < neighbors.length; i++) {
          for (let j = i + 1; j < neighbors.length; j++) {
            if (this.graph.hasEdge(neighbors[i], neighbors[j])) {
              triangles++;
            }
          }
        }
        
        const coefficient = (2 * triangles) / (k * (k - 1));
        totalCoefficient += coefficient;
        nodeCount++;
      }
    });

    return nodeCount > 0 ? totalCoefficient / nodeCount : 0;
  }

  getAveragePathLength(): number {
    const nodes = this.graph.nodes();
    let totalLength = 0;
    let pathCount = 0;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const path = this.getShortestPath(nodes[i], nodes[j]);
        if (path) {
          totalLength += path.length - 1;
          pathCount++;
        }
      }
    }

    return pathCount > 0 ? totalLength / pathCount : 0;
  }

  getSnapshot(): GraphNode[] {
    return Array.from(this.nodeMap.values());
  }

  optimizeTopology(): void {
    // 簡易的なトポロジー最適化
    // Phase 2で変分ベイズ最適化を実装予定
    
    const avgPathLength = this.getAveragePathLength();
    const clusterCoeff = this.getClusterCoefficient();
    
    // 効率性の指標に基づいて接続を調整
    if (avgPathLength > 3.0) {
      // パスが長すぎる場合は接続を追加
      this.addOptimalConnections();
    }
  }

  private addOptimalConnections(): void {
    const nodes = Array.from(this.nodeMap.values());
    
    // グループ間の最適な接続を追加
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (!this.graph.hasEdge(nodes[i].id, nodes[j].id)) {
          const compatibility = GROUP_COMPATIBILITY[nodes[i].group][nodes[j].group];
          if (compatibility > 0.6 && Math.random() < 0.3) {
            this.graph.addEdge(nodes[i].id, nodes[j].id, { weight: compatibility });
            nodes[i].connections.set(nodes[j].id, compatibility);
            nodes[j].connections.set(nodes[i].id, compatibility);
          }
        }
      }
    }
  }
} 