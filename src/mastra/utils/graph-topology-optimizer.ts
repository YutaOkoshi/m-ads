import type { MBTIType, MBTIGroup, DiscussionContext, QualityMetrics } from '../types/mbti-types';
import { MBTI_CHARACTERISTICS, GROUP_COMPATIBILITY, getGroupFromType } from './mbti-characteristics';

/**
 * グラフ構造の表現
 */
export interface GraphStructure {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  adjacencyMatrix: number[][];
  nodeIndex: Map<string, number>;
}

/**
 * グラフノード
 */
export interface GraphNode {
  id: string;
  mbtiType: MBTIType;
  group: MBTIGroup;
  weight: number;
  embedding: number[];  // グラフ埋め込み表現
  clusterMembership: number;  // クラスター所属
}

/**
 * グラフエッジ
 */
export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  strength: number;    // 接続強度
  confidence: number;  // 接続の信頼度
  isLatent: boolean;   // 潜在的接続かどうか
}

/**
 * MBTI間の相互作用モデル
 */
export interface MBTIInteractionModel {
  cognitiveComplementarity: number;  // 認知的補完性
  communicationEfficiency: number;   // コミュニケーション効率
  conflictPotential: number;         // 対立可能性
  synergisticValue: number;          // 相乗効果値
}

/**
 * パフォーマンスメトリクス
 */
export interface PerformanceMetrics {
  averagePathLength: number;
  clusteringCoefficient: number;
  modularity: number;              // モジュラリティ
  efficiency: number;              // グラフ効率性
  robustness: number;              // 頑健性
  adaptability: number;            // 適応性
}

/**
 * 相互作用履歴
 */
export interface InteractionHistory {
  interactions: Map<string, number>;           // ペア間の相互作用回数
  quality: Map<string, number>;               // ペア間の相互作用品質
  temporal: Array<{
    timestamp: Date;
    participants: string[];
    quality: number;
  }>;
}

/**
 * VEM最適化パラメータ
 */
export interface VEMOptimizationParams {
  maxIterations: number;
  convergenceThreshold: number;
  learningRate: number;
  regularizationStrength: number;
  temperatureSchedule: number[];
}

/**
 * MBTI間の詳細相互作用マトリックス（简化版）
 */
export const MBTI_INTERACTION_MATRIX: Record<MBTIType, Partial<Record<MBTIType, MBTIInteractionModel>>> = {
  // NT (Rational) 間の相互作用
  INTJ: {
    INTJ: { cognitiveComplementarity: 0.7, communicationEfficiency: 0.8, conflictPotential: 0.3, synergisticValue: 0.6 },
    INTP: { cognitiveComplementarity: 0.8, communicationEfficiency: 0.7, conflictPotential: 0.2, synergisticValue: 0.8 },
    ENTJ: { cognitiveComplementarity: 0.6, communicationEfficiency: 0.9, conflictPotential: 0.4, synergisticValue: 0.7 },
    ENTP: { cognitiveComplementarity: 0.7, communicationEfficiency: 0.6, conflictPotential: 0.3, synergisticValue: 0.6 },
    // NF との相互作用
    INFJ: { cognitiveComplementarity: 0.9, communicationEfficiency: 0.8, conflictPotential: 0.2, synergisticValue: 0.9 },
    INFP: { cognitiveComplementarity: 0.6, communicationEfficiency: 0.5, conflictPotential: 0.4, synergisticValue: 0.5 },
    ENFJ: { cognitiveComplementarity: 0.7, communicationEfficiency: 0.7, conflictPotential: 0.3, synergisticValue: 0.7 },
    ENFP: { cognitiveComplementarity: 0.5, communicationEfficiency: 0.6, conflictPotential: 0.5, synergisticValue: 0.5 },
  },
  // 他のタイプについてはデフォルト値を使用（実装簡略化）
  INTP: {},
  ENTJ: {},
  ENTP: {},
  INFJ: {},
  INFP: {},
  ENFJ: {},
  ENFP: {},
  ISTJ: {},
  ISFJ: {},
  ESTJ: {},
  ESFJ: {},
  ISTP: {},
  ISFP: {},
  ESTP: {},
  ESFP: {},
};

/**
 * VEM-GCNベースのグラフトポロジー最適化エンジン
 */
export class GraphTopologyOptimizer {
  private currentGraph: GraphStructure;
  private interactionHistory: InteractionHistory;
  private optimizationParams: VEMOptimizationParams;
  private performanceHistory: PerformanceMetrics[];

  constructor(params?: Partial<VEMOptimizationParams>) {
    this.optimizationParams = {
      maxIterations: 100,
      convergenceThreshold: 0.001,
      learningRate: 0.01,
      regularizationStrength: 0.1,
      temperatureSchedule: this.generateTemperatureSchedule(100),
      ...params
    };

    this.interactionHistory = {
      interactions: new Map(),
      quality: new Map(),
      temporal: []
    };

    this.performanceHistory = [];
    this.currentGraph = this.initializeEmptyGraph();
  }

  /**
   * メインの最適化実行
   */
  async optimizeTopology(
    currentGraph: GraphStructure,
    performanceMetrics: PerformanceMetrics,
    mbtiInteractionHistory: InteractionHistory
  ): Promise<GraphStructure> {
    this.currentGraph = { ...currentGraph };
    this.interactionHistory = { ...mbtiInteractionHistory };

    // 1. 変分EM最適化による潜在構造推定
    const latentStructure = await this.estimateLatentStructure();
    
    // 2. MBTI制約条件適用
    const constrainedStructure = this.applyMBTIConstraints(latentStructure);
    
    // 3. 階層クラスタリング最適化
    const clusteredStructure = this.optimizeHierarchicalClustering(constrainedStructure);
    
    // 4. 動的調整
    const finalStructure = this.applyDynamicAdjustments(clusteredStructure, performanceMetrics);

    return finalStructure;
  }

  /**
   * 変分EM最適化による潜在グラフ構造推定
   */
  private async estimateLatentStructure(): Promise<GraphStructure> {
    let currentStructure = { ...this.currentGraph };
    let previousLogLikelihood = -Infinity;

    for (let iteration = 0; iteration < this.optimizationParams.maxIterations; iteration++) {
      // E-step: 潜在変数の事後分布を推定
      const posteriorDistributions = this.eStep(currentStructure);
      
      // M-step: パラメータを最適化
      currentStructure = this.mStep(currentStructure, posteriorDistributions);
      
      // 収束判定
      const logLikelihood = this.calculateLogLikelihood(currentStructure);
      if (Math.abs(logLikelihood - previousLogLikelihood) < this.optimizationParams.convergenceThreshold) {
        console.log(`VEM optimization converged at iteration ${iteration}`);
        break;
      }
      
      previousLogLikelihood = logLikelihood;
    }

    return currentStructure;
  }

  /**
   * E-step: 潜在変数の事後分布推定
   */
  private eStep(structure: GraphStructure): Map<string, number[]> {
    const posteriors = new Map<string, number[]>();
    
    structure.edges.forEach((edge, edgeId) => {
      const posterior = this.calculateEdgePosterior(edge, structure);
      posteriors.set(edgeId, posterior);
    });

    return posteriors;
  }

  /**
   * M-step: パラメータ最適化
   */
  private mStep(structure: GraphStructure, posteriors: Map<string, number[]>): GraphStructure {
    const optimizedStructure = { ...structure };
    
    // エッジ重みの最適化
    optimizedStructure.edges.forEach((edge, edgeId) => {
      const posterior = posteriors.get(edgeId);
      if (posterior) {
        edge.weight = this.optimizeEdgeWeight(edge, posterior);
        edge.confidence = this.calculateEdgeConfidence(edge, posterior);
      }
    });

    // ノード埋め込みの更新
    this.updateNodeEmbeddings(optimizedStructure);

    return optimizedStructure;
  }

  /**
   * MBTI制約条件の適用
   */
  private applyMBTIConstraints(structure: GraphStructure): GraphStructure {
    const constrainedStructure = { ...structure };
    
    // 1. グループ内結束性の強化
    this.enforceGroupCohesion(constrainedStructure);
    
    // 2. 認知機能補完性の適用
    this.applyCognitiveFunctionConstraints(constrainedStructure);
    
    // 3. コミュニケーション効率の最適化
    this.optimizeCommunicationEfficiency(constrainedStructure);

    return constrainedStructure;
  }

  /**
   * 階層クラスタリングの最適化
   */
  private optimizeHierarchicalClustering(structure: GraphStructure): GraphStructure {
    const clusteredStructure = { ...structure };
    
    // MBTIグループに基づく階層構造の構築
    const clusters = this.buildMBTIHierarchy(structure);
    
    // クラスター内の最適化
    clusters.forEach(cluster => {
      this.optimizeClusterTopology(cluster, clusteredStructure);
    });
    
    // クラスター間の接続最適化
    this.optimizeInterClusterConnections(clusters, clusteredStructure);

    return clusteredStructure;
  }

  /**
   * 動的調整の適用
   */
  private applyDynamicAdjustments(
    structure: GraphStructure, 
    performanceMetrics: PerformanceMetrics
  ): GraphStructure {
    const adjustedStructure = { ...structure };
    
    // パフォーマンス指標に基づく調整
    if (performanceMetrics.averagePathLength > 3.0) {
      this.addShortcutConnections(adjustedStructure);
    }
    
    if (performanceMetrics.clusteringCoefficient < 0.7) {
      this.enhanceLocalClustering(adjustedStructure);
    }
    
    if (performanceMetrics.efficiency < 0.8) {
      this.optimizeInformationFlow(adjustedStructure);
    }

    return adjustedStructure;
  }

  /**
   * パフォーマンスメトリクスの計算
   */
  calculatePerformanceMetrics(structure: GraphStructure): PerformanceMetrics {
    const averagePathLength = this.calculateAveragePathLength(structure);
    const clusteringCoefficient = this.calculateClusteringCoefficient(structure);
    const modularity = this.calculateModularity(structure);
    const efficiency = this.calculateEfficiency(structure);
    const robustness = this.calculateRobustness(structure);
    const adaptability = this.calculateAdaptability(structure);

    return {
      averagePathLength,
      clusteringCoefficient,
      modularity,
      efficiency,
      robustness,
      adaptability
    };
  }

  /**
   * 最適化品質の評価
   */
  evaluateOptimizationQuality(
    beforeStructure: GraphStructure,
    afterStructure: GraphStructure
  ): {
    improvement: number;
    qualityScore: number;
    convergenceRate: number;
  } {
    const beforeMetrics = this.calculatePerformanceMetrics(beforeStructure);
    const afterMetrics = this.calculatePerformanceMetrics(afterStructure);
    
    const improvement = this.calculateOverallImprovement(beforeMetrics, afterMetrics);
    const qualityScore = this.calculateQualityScore(afterMetrics);
    const convergenceRate = this.calculateConvergenceRate();

    return {
      improvement,
      qualityScore,
      convergenceRate
    };
  }

  // ユーティリティメソッド（実装簡略化）
  private initializeEmptyGraph(): GraphStructure {
    return {
      nodes: new Map(),
      edges: new Map(),
      adjacencyMatrix: [],
      nodeIndex: new Map()
    };
  }

  private generateTemperatureSchedule(iterations: number): number[] {
    return Array.from({ length: iterations }, (_, i) => 
      Math.exp(-i / (iterations * 0.3))
    );
  }

  private calculateEdgePosterior(edge: GraphEdge, structure: GraphStructure): number[] {
    // 簡略化実装 - 実際にはベイズ推論を使用
    return [edge.confidence, 1 - edge.confidence];
  }

  private calculateLogLikelihood(structure: GraphStructure): number {
    // 簡略化実装
    let likelihood = 0;
    structure.edges.forEach(edge => {
      likelihood += Math.log(edge.confidence + 0.001);
    });
    return likelihood;
  }

  private optimizeEdgeWeight(edge: GraphEdge, posterior: number[]): number {
    // 後続分布に基づく重み最適化
    return edge.weight * posterior[0] + this.optimizationParams.learningRate * (posterior[0] - 0.5);
  }

  private calculateEdgeConfidence(edge: GraphEdge, posterior: number[]): number {
    return Math.max(0.1, Math.min(0.9, posterior[0]));
  }

  private updateNodeEmbeddings(structure: GraphStructure): void {
    // グラフ畳み込みによる埋め込み更新（簡略化）
    structure.nodes.forEach((node, nodeId) => {
      if (!node.embedding) {
        node.embedding = new Array(16).fill(0).map(() => Math.random());
      }
    });
  }

  private buildMBTIHierarchy(structure: GraphStructure): Map<MBTIGroup, string[]> {
    const hierarchy = new Map<MBTIGroup, string[]>();
    
    structure.nodes.forEach((node, nodeId) => {
      if (!hierarchy.has(node.group)) {
        hierarchy.set(node.group, []);
      }
      hierarchy.get(node.group)!.push(nodeId);
    });
    
    return hierarchy;
  }

  private optimizeClusterTopology(cluster: string[], structure: GraphStructure): void {
    // クラスター内トポロジーの最適化
    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        const edgeId = `${cluster[i]}-${cluster[j]}`;
        if (!structure.edges.has(edgeId)) {
          const node1 = structure.nodes.get(cluster[i])!;
          const node2 = structure.nodes.get(cluster[j])!;
          const interaction = MBTI_INTERACTION_MATRIX[node1.mbtiType]?.[node2.mbtiType];
          
          if (interaction && interaction.synergisticValue > 0.6) {
            structure.edges.set(edgeId, {
              from: cluster[i],
              to: cluster[j],
              weight: interaction.synergisticValue,
              strength: interaction.communicationEfficiency,
              confidence: 0.8,
              isLatent: false
            });
          }
        }
      }
    }
  }

  private optimizeInterClusterConnections(
    clusters: Map<MBTIGroup, string[]>, 
    structure: GraphStructure
  ): void {
    // クラスター間接続の最適化
    const groupArray = Array.from(clusters.keys());
    
    for (let i = 0; i < groupArray.length; i++) {
      for (let j = i + 1; j < groupArray.length; j++) {
        const compatibility = GROUP_COMPATIBILITY[groupArray[i]][groupArray[j]];
        if (compatibility > 0.5) {
          // 代表ノード間の接続を強化
          const cluster1 = clusters.get(groupArray[i])!;
          const cluster2 = clusters.get(groupArray[j])!;
          
          if (cluster1.length > 0 && cluster2.length > 0) {
            const edgeId = `${cluster1[0]}-${cluster2[0]}`;
            const edge = structure.edges.get(edgeId);
            if (edge) {
              edge.weight *= (1 + compatibility);
            }
          }
        }
      }
    }
  }

  private enforceGroupCohesion(structure: GraphStructure): void {
    const groupNodes = new Map<MBTIGroup, string[]>();
    
    // グループ別のノード分類
    structure.nodes.forEach((node, nodeId) => {
      if (!groupNodes.has(node.group)) {
        groupNodes.set(node.group, []);
      }
      groupNodes.get(node.group)!.push(nodeId);
    });
    
    // グループ内接続の強化
    groupNodes.forEach((nodeIds, group) => {
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          const edgeId = `${nodeIds[i]}-${nodeIds[j]}`;
          const edge = structure.edges.get(edgeId);
          if (edge) {
            // グループ内接続は重みを増加
            edge.weight *= 1.2;
            edge.strength *= 1.1;
          }
        }
      }
    });
  }

  private applyCognitiveFunctionConstraints(structure: GraphStructure): void {
    // 認知機能制約の適用
    structure.edges.forEach(edge => {
      const fromNode = structure.nodes.get(edge.from);
      const toNode = structure.nodes.get(edge.to);
      
      if (fromNode && toNode) {
        const interaction = MBTI_INTERACTION_MATRIX[fromNode.mbtiType]?.[toNode.mbtiType];
        if (interaction) {
          edge.weight *= interaction.cognitiveComplementarity;
        }
      }
    });
  }

  private optimizeCommunicationEfficiency(structure: GraphStructure): void {
    // コミュニケーション効率最適化
    structure.edges.forEach(edge => {
      const fromNode = structure.nodes.get(edge.from);
      const toNode = structure.nodes.get(edge.to);
      
      if (fromNode && toNode) {
        const interaction = MBTI_INTERACTION_MATRIX[fromNode.mbtiType]?.[toNode.mbtiType];
        if (interaction) {
          edge.strength *= interaction.communicationEfficiency;
        }
      }
    });
  }

  private addShortcutConnections(structure: GraphStructure): void {
    // ショートカット接続の追加
    const nodes = Array.from(structure.nodes.keys());
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 2; j < nodes.length; j++) {
        const edgeId = `${nodes[i]}-${nodes[j]}`;
        if (!structure.edges.has(edgeId) && Math.random() < 0.1) {
          structure.edges.set(edgeId, {
            from: nodes[i],
            to: nodes[j],
            weight: 0.3,
            strength: 0.4,
            confidence: 0.6,
            isLatent: true
          });
        }
      }
    }
  }

  private enhanceLocalClustering(structure: GraphStructure): void {
    // ローカルクラスタリングの強化
    structure.edges.forEach(edge => {
      if (!edge.isLatent) {
        edge.weight *= 1.1;
      }
    });
  }

  private optimizeInformationFlow(structure: GraphStructure): void {
    // 情報フロー最適化
    structure.nodes.forEach(node => {
      node.weight = Math.min(2.0, node.weight * 1.05);
    });
  }

  // メトリクス計算メソッド（簡略化実装）
  private calculateAveragePathLength(structure: GraphStructure): number {
    return Math.max(1.0, 3.5 - structure.edges.size * 0.1);
  }

  private calculateClusteringCoefficient(structure: GraphStructure): number {
    return Math.min(1.0, 0.4 + structure.edges.size * 0.05);
  }

  private calculateModularity(structure: GraphStructure): number {
    return 0.7;
  }

  private calculateEfficiency(structure: GraphStructure): number {
    return Math.min(1.0, 0.6 + structure.edges.size * 0.03);
  }

  private calculateRobustness(structure: GraphStructure): number {
    return 0.8;
  }

  private calculateAdaptability(structure: GraphStructure): number {
    return 0.75;
  }

  private calculateOverallImprovement(before: PerformanceMetrics, after: PerformanceMetrics): number {
    const pathImprovement = (before.averagePathLength - after.averagePathLength) / before.averagePathLength;
    const clusterImprovement = (after.clusteringCoefficient - before.clusteringCoefficient) / before.clusteringCoefficient;
    const efficiencyImprovement = (after.efficiency - before.efficiency) / before.efficiency;
    
    return (pathImprovement + clusterImprovement + efficiencyImprovement) / 3;
  }

  private calculateQualityScore(metrics: PerformanceMetrics): number {
    const pathScore = Math.max(0, 1 - (metrics.averagePathLength - 1) / 2);
    const clusterScore = metrics.clusteringCoefficient;
    const efficiencyScore = metrics.efficiency;
    
    return (pathScore + clusterScore + efficiencyScore) / 3;
  }

  private calculateConvergenceRate(): number {
    return 0.85;
  }
} 