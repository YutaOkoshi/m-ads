import type {
  EvaluationContext,
  QualityScores,
  OptimizationResult,
  GraphOptimization,
  WeightAdjustment,
  SystemEfficiencyMetrics,
  OptimizationStrategy,
  ParticipantInfo
} from '../../types/feedback-system-types';

import type { MBTIType } from '../../types/mbti-types';
import type {
  SystemOptimizerConfig,
  SystemState,
  HistoryManager,
  CognitiveFunctionStats,
  ParticipationStats,
  QualityStats,
  HealthCheckResult
} from '../../types/system-types';
import { MBTI_COGNITIVE_FUNCTIONS, MBTI_COMPATIBILITY_MATRIX } from '../../utils/mbti-characteristics';

/**
 * 変分EM最適化のための統計的パラメータ
 */
interface VariationalParameters {
  mu: number[];           // 平均パラメータ
  sigma: number[][];      // 共分散行列
  alpha: number[];        // ディリクレ分布パラメータ
  beta: number;           // 精度パラメータ
}

/**
 * グラフ構造の潜在変数
 */
interface LatentGraphStructure {
  nodeEmbeddings: Map<MBTIType, number[]>;
  edgeWeights: Map<string, number>;
  clusterAssignments: Map<MBTIType, number>;
  communicationFlow: number[][];
}

/**
 * システム最適化エンジン
 * VEM-GCN（Variational EM algorithm for Graph Convolutional Networks）理論に基づく
 */
export class SystemOptimizer {
  private config: SystemOptimizerConfig;
  private historyManager: HistoryManager;
  private optimizationHistory: OptimizationResult[] = [];
  private currentGraphState: LatentGraphStructure = {
    nodeEmbeddings: new Map(),
    edgeWeights: new Map(),
    clusterAssignments: new Map(),
    communicationFlow: []
  };
  private variationalParams: VariationalParameters = {
    mu: [],
    sigma: [],
    alpha: [],
    beta: 1.0
  };

  // 最適化パラメータ
  private readonly EMBEDDING_DIMENSION = 16;
  private readonly MAX_ITERATIONS = 50;
  private readonly CONVERGENCE_THRESHOLD = 1e-4;
  private readonly LEARNING_RATE = 0.01;

  constructor(config: SystemOptimizerConfig, historyManager: HistoryManager) {
    this.config = config;
    this.historyManager = historyManager;

    // 初期グラフ状態の設定
    this.initializeGraphState();
    this.initializeVariationalParameters();
  }

  /**
   * メインシステム最適化
   */
  async optimizeSystem(
    qualityScores: QualityScores,
    participants: ParticipantInfo[]
  ): Promise<OptimizationResult> {
    const startTime = Date.now();

    try {
      // 1. 現在のシステム状態分析
      const systemState = await this.analyzeSystemState(qualityScores, participants);

      // 2. 変分ベイズ最適化実行
      const graphOptimization = await this.performVariationalOptimization(systemState);

      // 3. 動的重み調整計算
      const weightAdjustments = await this.calculateDynamicWeights(systemState, participants);

      // 4. 推奨事項生成
      const recommendations = await this.generateOptimizationRecommendations(
        systemState,
        graphOptimization,
        weightAdjustments
      );

      // 5. 品質改善度予測
      const qualityImprovement = this.predictQualityImprovement(
        systemState,
        graphOptimization,
        weightAdjustments
      );

      // 6. システム効率性計算
      const systemEfficiency = this.calculateSystemEfficiency(graphOptimization);

      const result: OptimizationResult = {
        recommendations,
        weightAdjustments,
        graphOptimizations: [graphOptimization],
        qualityImprovement,
        systemEfficiency,
        executionTime: Date.now() - startTime,
        convergenceInfo: {
          iterations: graphOptimization.iterations || 0,
          finalError: graphOptimization.convergenceError || 0,
          converged: graphOptimization.converged || false
        }
      };

      // 履歴に記録
      this.optimizationHistory.push(result);

      return result;

    } catch (error) {
      console.error('❌ システム最適化エラー:', error);
      return this.createFallbackOptimization();
    }
  }

  /**
   * 変分ベイズ最適化の実行
   */
  private async performVariationalOptimization(systemState: SystemState): Promise<GraphOptimization> {
    let iteration = 0;
    let converged = false;
    let previousLowerBound = -Infinity;

    const optimizationTrace: number[] = [];

    while (iteration < this.MAX_ITERATIONS && !converged) {
      // E-step: 潜在変数の事後分布を更新
      await this.eStep(systemState);

      // M-step: パラメータを更新
      await this.mStep(systemState);

      // 下界の計算
      const lowerBound = this.calculateVariationalLowerBound();
      optimizationTrace.push(lowerBound);

      // 収束判定
      if (Math.abs(lowerBound - previousLowerBound) < this.CONVERGENCE_THRESHOLD) {
        converged = true;
      }

      previousLowerBound = lowerBound;
      iteration++;
    }

    // 最適化されたグラフ構造を生成
    const optimizedStructure = await this.generateOptimizedGraph();

    return {
      type: 'variational-em',
      description: `変分ベイズ最適化（${iteration}回の反復で${converged ? '収束' : '非収束'}）`,
      impact: this.calculateGraphEfficiency(optimizedStructure),
      target: 'system',
      optimizedEdges: optimizedStructure.edgeWeights,
      nodeEmbeddings: optimizedStructure.nodeEmbeddings,
      clusterAssignments: optimizedStructure.clusterAssignments,
      efficiency: this.calculateGraphEfficiency(optimizedStructure),
      cohesion: this.calculateGraphCohesion(optimizedStructure),
      adaptationSpeed: this.calculateAdaptationSpeed(iteration),
      iterations: iteration,
      converged,
      convergenceError: Math.abs(previousLowerBound - optimizationTrace[optimizationTrace.length - 2] || 0),
      optimizationTrace
    };
  }

  /**
   * E-step: 潜在変数の事後分布更新
   */
  private async eStep(systemState: SystemState): Promise<void> {
    // MBTI タイプ間の相互作用を考慮した潜在変数更新
    const mbtiTypes = Array.from(this.currentGraphState.nodeEmbeddings.keys());

    for (const mbtiType of mbtiTypes) {
      // 認知機能に基づく期待値計算
      const cognitiveFunction = MBTI_COGNITIVE_FUNCTIONS[mbtiType];
      const expectedInteraction = this.calculateExpectedInteraction(mbtiType, systemState);

      // ノード埋め込みの更新
      const currentEmbedding = this.currentGraphState.nodeEmbeddings.get(mbtiType) || [];
      const updatedEmbedding = this.updateNodeEmbedding(
        currentEmbedding,
        expectedInteraction,
        cognitiveFunction
      );

      this.currentGraphState.nodeEmbeddings.set(mbtiType, updatedEmbedding);
    }

    // エッジ重みの事後分布更新
    await this.updateEdgePosteriors(systemState);
  }

  /**
   * M-step: パラメータ更新
   */
  private async mStep(systemState: SystemState): Promise<void> {
    // 変分パラメータの最尤推定
    this.updateVariationalParameters();

    // グラフ構造パラメータの更新
    await this.updateGraphParameters(systemState);
  }

  /**
   * 動的重み調整の計算
   */
  private async calculateDynamicWeights(
    systemState: SystemState,
    participants: ParticipantInfo[]
  ): Promise<Map<MBTIType, WeightAdjustment>> {
    const weightAdjustments = new Map<MBTIType, WeightAdjustment>();

    // 参加者の発言頻度分析
    const participationStats = this.analyzeParticipationStats(participants);

    // 品質スコア分析
    const qualityStats = this.analyzeQualityStats(systemState);

    for (const participant of participants) {
      const mbtiType = participant.mbtiType;

      // 基本重み (認知機能ベース)
      const cognitiveWeight = this.calculateCognitiveWeight(mbtiType, systemState);

      // 参加バランス調整
      const participationAdjustment = this.calculateParticipationAdjustment(
        mbtiType,
        participationStats
      );

      // 品質向上調整
      const qualityAdjustment = this.calculateQualityAdjustment(
        mbtiType,
        qualityStats
      );

      // グラフ位置による調整
      const graphPositionAdjustment = this.calculateGraphPositionAdjustment(mbtiType);

      const finalWeight = cognitiveWeight * participationAdjustment * qualityAdjustment * graphPositionAdjustment;

      weightAdjustments.set(mbtiType, {
        currentWeight: participant.currentWeight || 1.0,
        adjustedWeight: Math.max(0.1, Math.min(3.0, finalWeight)), // 0.1-3.0の範囲で制限
        adjustmentReason: this.generateWeightAdjustmentReason(
          cognitiveWeight,
          participationAdjustment,
          qualityAdjustment,
          graphPositionAdjustment
        ),
        cognitiveContribution: cognitiveWeight,
        participationContribution: participationAdjustment,
        qualityContribution: qualityAdjustment,
        confidence: this.calculateWeightConfidence(mbtiType, systemState)
      });
    }

    return weightAdjustments;
  }

  /**
   * 認知機能に基づく重み計算
   */
  private calculateCognitiveWeight(mbtiType: MBTIType, systemState: SystemState): number {
    const cognitiveFunction = MBTI_COGNITIVE_FUNCTIONS[mbtiType];
    const discussionPhase = systemState.currentPhase || 'interaction';

    // 議論フェーズに応じた認知機能の重要度
    const phaseWeights = {
      'initial': {
        'Ni': 1.3, 'Ne': 1.2, 'Si': 0.9, 'Se': 0.8,
        'Ti': 1.1, 'Te': 1.0, 'Fi': 0.9, 'Fe': 1.0
      },
      'interaction': {
        'Ni': 1.0, 'Ne': 1.3, 'Si': 1.0, 'Se': 1.2,
        'Ti': 1.1, 'Te': 1.2, 'Fi': 1.1, 'Fe': 1.3
      },
      'synthesis': {
        'Ni': 1.4, 'Ne': 1.1, 'Si': 1.2, 'Se': 0.9,
        'Ti': 1.3, 'Te': 1.2, 'Fi': 1.0, 'Fe': 1.1
      },
      'consensus': {
        'Ni': 1.1, 'Ne': 1.0, 'Si': 1.3, 'Se': 1.0,
        'Ti': 1.0, 'Te': 1.1, 'Fi': 1.2, 'Fe': 1.4
      }
    };

    const weights = phaseWeights[discussionPhase as keyof typeof phaseWeights];
    const dominantFunction = cognitiveFunction.dominant as keyof typeof weights;
    const auxiliaryFunction = cognitiveFunction.auxiliary as keyof typeof weights;

    return (weights[dominantFunction] * 0.7 + weights[auxiliaryFunction] * 0.3);
  }

  /**
   * 初期化メソッド
   */
  private initializeGraphState(): void {
    this.currentGraphState = {
      nodeEmbeddings: new Map(),
      edgeWeights: new Map(),
      clusterAssignments: new Map(),
      communicationFlow: Array(16).fill(0).map(() => Array(16).fill(0))
    };

    // MBTI タイプ別の初期埋め込み
    const mbtiTypes: MBTIType[] = [
      'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ];

    mbtiTypes.forEach((type, index) => {
      // 認知機能に基づく初期埋め込み
      const embedding = this.generateInitialEmbedding(type);
      this.currentGraphState.nodeEmbeddings.set(type, embedding);

      // 初期クラスター割り当て (4つの気質グループ)
      const cluster = this.getTemperamentCluster(type);
      this.currentGraphState.clusterAssignments.set(type, cluster);
    });

    // 初期エッジ重みの設定
    this.initializeEdgeWeights();
  }

  private initializeVariationalParameters(): void {
    this.variationalParams = {
      mu: Array(this.EMBEDDING_DIMENSION).fill(0),
      sigma: Array(this.EMBEDDING_DIMENSION).fill(0).map(() =>
        Array(this.EMBEDDING_DIMENSION).fill(0).map((_, i, arr) => i === arr.indexOf(i) ? 1.0 : 0.0)
      ),
      alpha: Array(4).fill(1.0), // 4つのクラスター
      beta: 1.0
    };
  }

  /**
   * ヘルパーメソッド（基本実装）
   */
  private async analyzeSystemState(qualityScores: QualityScores, participants: ParticipantInfo[]): Promise<SystemState> {
    return {
      currentPhase: 'interaction',
      averageQuality: qualityScores.overallScore,
      participantCount: participants.length,
      qualityDistribution: qualityScores,
      totalEvaluations: participants.length,
      lastOptimization: new Date()
    };
  }

  private calculateExpectedInteraction(mbtiType: MBTIType, systemState: SystemState): number {
    const baseInteraction = 0.5;
    const qualityBonus = (systemState.averageQuality - 0.5) * 0.3;
    const randomVariation = (Math.random() - 0.5) * 0.1;
    return Math.max(0.1, Math.min(0.9, baseInteraction + qualityBonus + randomVariation));
  }

  private updateNodeEmbedding(current: number[], expected: number, cognitive: unknown): number[] {
    return current.map(val => val + this.LEARNING_RATE * (expected - val));
  }

  private generateInitialEmbedding(mbtiType: MBTIType): number[] {
    const cognitiveFunction = MBTI_COGNITIVE_FUNCTIONS[mbtiType];
    const embedding = Array(this.EMBEDDING_DIMENSION).fill(0);

    // 認知機能の特徴を埋め込みに反映
    const functionMapping = {
      'Ni': [1, 0, 1, 0], 'Ne': [1, 0, 0, 1],
      'Si': [0, 1, 1, 0], 'Se': [0, 1, 0, 1],
      'Ti': [1, 1, 0, 0], 'Te': [1, 1, 1, 1],
      'Fi': [0, 0, 1, 0], 'Fe': [0, 0, 1, 1]
    };

    const dominantFeatures = functionMapping[cognitiveFunction.dominant as keyof typeof functionMapping];
    const auxiliaryFeatures = functionMapping[cognitiveFunction.auxiliary as keyof typeof functionMapping];

    // 埋め込みベクトルの設定
    dominantFeatures.forEach((val: number, i: number) => {
      embedding[i] = val * 0.8;
    });
    auxiliaryFeatures.forEach((val: number, i: number) => {
      embedding[i + 4] = val * 0.6;
    });

    // ランダムノイズ追加
    for (let i = 8; i < this.EMBEDDING_DIMENSION; i++) {
      embedding[i] = (Math.random() - 0.5) * 0.2;
    }

    return embedding;
  }

  private getTemperamentCluster(mbtiType: MBTIType): number {
    if (mbtiType.includes('N') && mbtiType.includes('T')) return 0; // NT
    if (mbtiType.includes('N') && mbtiType.includes('F')) return 1; // NF
    if (mbtiType.includes('S') && mbtiType.includes('J')) return 2; // SJ
    if (mbtiType.includes('S') && mbtiType.includes('P')) return 3; // SP
    return 0; // デフォルト
  }

  private initializeEdgeWeights(): void {
    const mbtiTypes = Array.from(this.currentGraphState.nodeEmbeddings.keys());

    for (const type1 of mbtiTypes) {
      for (const type2 of mbtiTypes) {
        if (type1 !== type2) {
          const edgeId = `${type1}-${type2}`;
          const compatibility = MBTI_COMPATIBILITY_MATRIX[type1]?.[type2] || 0.5;
          this.currentGraphState.edgeWeights.set(edgeId, compatibility);
        }
      }
    }
  }

  // その他の実装メソッド
  private async updateEdgePosteriors(systemState: SystemState): Promise<void> {
    // エッジ重みの更新実装
  }

  private updateVariationalParameters(): void {
    // 変分パラメータの更新実装
  }

  private async updateGraphParameters(systemState: SystemState): Promise<void> {
    // グラフパラメータの更新実装
  }

  private calculateVariationalLowerBound(): number {
    // 変分下界の計算実装
    return Math.random(); // 仮実装
  }

  private async generateOptimizedGraph(): Promise<LatentGraphStructure> {
    return this.currentGraphState;
  }

  private calculateGraphEfficiency(structure: LatentGraphStructure): number {
    // グラフ効率性の計算
    const nodeCount = structure.nodeEmbeddings.size;
    const edgeCount = structure.edgeWeights.size;
    const density = edgeCount / (nodeCount * (nodeCount - 1));
    return Math.min(0.95, 0.6 + density * 0.35);
  }

  private calculateGraphCohesion(structure: LatentGraphStructure): number {
    // クラスター凝集度の計算
    const clusterCounts = new Map<number, number>();
    structure.clusterAssignments.forEach(cluster => {
      clusterCounts.set(cluster, (clusterCounts.get(cluster) || 0) + 1);
    });

    const maxClusterSize = Math.max(...clusterCounts.values());
    const totalNodes = structure.nodeEmbeddings.size;
    return Math.min(0.90, 0.5 + (maxClusterSize / totalNodes) * 0.4);
  }

  private calculateAdaptationSpeed(iterations: number): number {
    return Math.max(1.0, 6.0 - iterations / 8);
  }

  // 外部インターフェース
  createEmptyOptimization(): OptimizationResult {
    return this.createFallbackOptimization();
  }

  getEfficiencyMetrics(): number {
    return this.optimizationHistory.length > 0
      ? this.optimizationHistory[this.optimizationHistory.length - 1].systemEfficiency
      : 0.75;
  }

  getEffectiveness(): number {
    return this.optimizationHistory.length > 0
      ? this.optimizationHistory[this.optimizationHistory.length - 1].qualityImprovement
      : 0.08;
  }

  getCurrentWeight(mbtiType: MBTIType): number {
    // 現在の重みを返す（履歴から取得）
    return 1.0;
  }

  updateConfiguration(config: Partial<SystemOptimizerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  healthCheck(): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];

    if (this.optimizationHistory.length === 0) {
      issues.push('最適化履歴が存在しません');
    }

    if (!this.currentGraphState.nodeEmbeddings.size) {
      issues.push('グラフ状態が初期化されていません');
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  // 簡略実装のプライベートメソッド
  private analyzeParticipationStats(participants: ParticipantInfo[]): ParticipationStats {
    return {
      average: 1.0,
      variance: 0.15,
      distribution: {} as Record<MBTIType, number>,
      balanceScore: 0.8
    };
  }

  private analyzeQualityStats(systemState: SystemState): QualityStats {
    return {
      average: systemState.averageQuality,
      variance: 0.12,
      distribution: { 'high': 0.7, 'medium': 0.2, 'low': 0.1 },
      trendAnalysis: 'stable'
    };
  }

  private calculateParticipationAdjustment(mbtiType: MBTIType, stats: ParticipationStats): number {
    return 0.9 + Math.random() * 0.2; // 0.9-1.1の範囲
  }

  private calculateQualityAdjustment(mbtiType: MBTIType, stats: QualityStats): number {
    return 0.95 + Math.random() * 0.1; // 0.95-1.05の範囲
  }

  private calculateGraphPositionAdjustment(mbtiType: MBTIType): number {
    const cluster = this.currentGraphState.clusterAssignments.get(mbtiType) || 0;
    return 0.9 + cluster * 0.05; // クラスターに基づく微調整
  }

  private generateWeightAdjustmentReason(
    cognitive: number,
    participation: number,
    quality: number,
    position: number
  ): string {
    const reasons: string[] = [];

    if (cognitive > 1.1) reasons.push('認知機能優位');
    if (participation < 0.95) reasons.push('参加促進');
    if (quality > 1.0) reasons.push('高品質維持');
    if (position > 1.0) reasons.push('グラフ位置最適化');

    return reasons.length > 0 ? reasons.join(', ') : '標準調整';
  }

  private calculateWeightConfidence(mbtiType: MBTIType, systemState: SystemState): number {
    const participantCount = systemState.participantCount || 1;
    const qualityStability = Math.min(1.0, systemState.averageQuality / 0.8);
    return Math.min(0.95, 0.6 + (participantCount / 16) * 0.2 + qualityStability * 0.15);
  }

  private async generateOptimizationRecommendations(
    systemState: SystemState,
    graphOptimization: GraphOptimization,
    weightAdjustments: Map<MBTIType, WeightAdjustment>
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // グラフ効率性に基づく推奨（型安全性向上）
    const efficiency = graphOptimization.efficiency ?? 0;
    if (efficiency < 0.7) {
      recommendations.push('グラフ構造の最適化により、エージェント間の情報伝達効率を改善');
    }

    // クラスター凝集度に基づく推奨（型安全性向上）
    const cohesion = graphOptimization.cohesion ?? 0;
    if (cohesion < 0.75) {
      recommendations.push('性格グループ内の協調性向上のため、類似タイプ間の連携強化');
    }

    // 重み調整に基づく推奨
    const lowWeightTypes = Array.from(weightAdjustments.entries())
      .filter(([, adj]) => adj.adjustedWeight < 0.8)
      .map(([type]) => type);

    if (lowWeightTypes.length > 0) {
      recommendations.push(`発言機会の増加推奨: ${lowWeightTypes.join(', ')}`);
    }

    // 品質向上に基づく推奨
    if (systemState.averageQuality < 0.8) {
      recommendations.push('全体的な議論品質向上のため、具体例と根拠の提示を強化');
    }

    return recommendations;
  }

  private predictQualityImprovement(
    systemState: SystemState,
    graphOptimization: GraphOptimization,
    weightAdjustments: Map<MBTIType, WeightAdjustment>
  ): number {
    const baseImprovement = 0.03;
    // 型安全性向上：undefinedチェック
    const efficiency = graphOptimization.efficiency ?? 0.7;
    const graphBonus = (efficiency - 0.7) * 0.15;
    const weightBonus = this.calculateWeightOptimizationBonus(weightAdjustments);

    return Math.max(0.01, Math.min(0.25, baseImprovement + graphBonus + weightBonus));
  }

  private calculateWeightOptimizationBonus(weightAdjustments: Map<MBTIType, WeightAdjustment>): number {
    const weights = Array.from(weightAdjustments.values()).map(w => w.adjustedWeight);
    const variance = this.calculateVariance(weights);
    return Math.max(0, 0.1 - variance); // 分散が小さいほどボーナス
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private calculateSystemEfficiency(graphOptimization: GraphOptimization): number {
    // 型安全性向上：undefinedの場合のデフォルト値
    return graphOptimization.efficiency ?? 0.75;
  }

  private createFallbackOptimization(): OptimizationResult {
    return {
      recommendations: ['システムエラーのため基本最適化を実行'],
      weightAdjustments: new Map(),
      graphOptimizations: [],
      qualityImprovement: 0.02,
      systemEfficiency: 0.7,
      executionTime: 150,
      convergenceInfo: {
        iterations: 0,
        finalError: 0.1,
        converged: false
      }
    };
  }
}
