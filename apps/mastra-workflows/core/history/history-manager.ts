import type {
  StatementHistory,
  ParticipantInfo,
  QualityScores,
  AdaptiveSettings,
  EvaluationRecord,
  AgentHistory,
  PerformanceMetrics
} from '../../types/feedback-system-types';

import type { MBTIType } from '../../types/mbti-types';

/**
 * 評価記録の内部構造
 */
interface InternalEvaluationRecord {
  statement: string;
  scores: QualityScores;
  feedback: unknown;
  timestamp: Date;
  context: {
    topic: string;
    phase: string;
    turnNumber: number;
  };
}

/**
 * エージェント履歴データ
 */
interface AgentHistoryData {
  mbtiType: MBTIType;
  evaluationHistory: InternalEvaluationRecord[];
  performanceMetrics: PerformanceMetrics;
  learningData: {
    strengthPatterns: Map<string, number>;
    weaknessPatterns: Map<string, number>;
    improvementTrends: number[];
    consistencyScores: number[];
  };
  lastUpdated: Date;
}

/**
 * 履歴・学習管理エンジン
 * リアルタイム学習とパフォーマンス追跡を実行
 */
export class HistoryManager {
  private agentHistories: Map<MBTIType, AgentHistoryData>;
  private globalHistory: InternalEvaluationRecord[];
  private adaptiveSettings: AdaptiveSettings;

  // 学習パラメータ
  private readonly LEARNING_WINDOW_SIZE = 10;
  private readonly TREND_ANALYSIS_WINDOW = 20;
  private readonly PATTERN_THRESHOLD = 0.3;
  private readonly CONSISTENCY_THRESHOLD = 0.8;

  constructor(adaptiveSettings: AdaptiveSettings) {
    this.adaptiveSettings = adaptiveSettings;
    this.agentHistories = new Map();
    this.globalHistory = [];

    // 全MBTIタイプの履歴を初期化
    this.initializeAgentHistories();
  }

  /**
   * 評価記録の保存
   */
  async recordEvaluation(
    mbtiType: MBTIType,
    evaluation: EvaluationRecord
  ): Promise<void> {
    try {
      const internalRecord: InternalEvaluationRecord = {
        statement: evaluation.statement,
        scores: evaluation.scores,
        feedback: evaluation.feedback,
        timestamp: evaluation.timestamp,
        context: {
          topic: 'unknown',
          phase: 'interaction',
          turnNumber: this.getNextTurnNumber(mbtiType)
        }
      };

      await this.addToAgentHistory(mbtiType, internalRecord);
      this.globalHistory.push(internalRecord);
      await this.performRealtimeLearning(mbtiType, internalRecord);
      await this.updatePerformanceMetrics(mbtiType);

    } catch (error) {
      console.error('❌ 評価記録保存エラー:', error);
      throw error;
    }
  }

  private initializeAgentHistories(): void {
    const mbtiTypes: MBTIType[] = [
      'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ];

    mbtiTypes.forEach(mbtiType => {
      this.agentHistories.set(mbtiType, {
        mbtiType,
        evaluationHistory: [],
        performanceMetrics: this.createEmptyPerformanceMetrics(),
        learningData: {
          strengthPatterns: new Map(),
          weaknessPatterns: new Map(),
          improvementTrends: [],
          consistencyScores: []
        },
        lastUpdated: new Date()
      });
    });
  }

  private createEmptyPerformanceMetrics(): PerformanceMetrics {
    return {
      averageScore: 0.0,
      bestScore: 0.0,
      worstScore: 1.0,
      improvementRate: 0.0,
      consistencyIndex: 0.0,
      participationFrequency: 0.0,
      recentTrend: 'stable',
      strongDimensions: [],
      weakDimensions: []
    };
  }

  private getNextTurnNumber(mbtiType: MBTIType): number {
    const historyData = this.agentHistories.get(mbtiType);
    return historyData ? historyData.evaluationHistory.length + 1 : 1;
  }

  private async addToAgentHistory(
    mbtiType: MBTIType,
    record: InternalEvaluationRecord
  ): Promise<void> {
    const historyData = this.agentHistories.get(mbtiType);

    if (!historyData) {
      throw new Error(`エージェント履歴データが見つかりません: ${mbtiType}`);
    }

    historyData.evaluationHistory.push(record);
    historyData.lastUpdated = new Date();

    if (historyData.evaluationHistory.length > 100) {
      historyData.evaluationHistory = historyData.evaluationHistory.slice(-50);
    }
  }

  private async performRealtimeLearning(
    mbtiType: MBTIType,
    record: InternalEvaluationRecord
  ): Promise<void> {
    const historyData = this.agentHistories.get(mbtiType);
    if (!historyData) return;

    await this.updatePatternLearning(historyData, record);
    this.updateTrendAnalysis(historyData, record);
    this.updateConsistencyAnalysis(historyData, record);
  }

  private async updatePatternLearning(
    historyData: AgentHistoryData,
    record: InternalEvaluationRecord
  ): Promise<void> {
    const { scores } = record;

    Object.entries(scores).forEach(([dimension, score]) => {
      if (typeof score === 'number' && score >= 0.8) {
        const currentCount = historyData.learningData.strengthPatterns.get(dimension) || 0;
        historyData.learningData.strengthPatterns.set(dimension, currentCount + 1);
      } else if (typeof score === 'number' && score < 0.7) {
        const currentCount = historyData.learningData.weaknessPatterns.get(dimension) || 0;
        historyData.learningData.weaknessPatterns.set(dimension, currentCount + 1);
      }
    });
  }

  private updateTrendAnalysis(
    historyData: AgentHistoryData,
    record: InternalEvaluationRecord
  ): void {
    historyData.learningData.improvementTrends.push(record.scores.overallScore);

    if (historyData.learningData.improvementTrends.length > this.TREND_ANALYSIS_WINDOW) {
      historyData.learningData.improvementTrends =
        historyData.learningData.improvementTrends.slice(-this.TREND_ANALYSIS_WINDOW);
    }
  }

  private updateConsistencyAnalysis(
    historyData: AgentHistoryData,
    record: InternalEvaluationRecord
  ): void {
    const recentScores = historyData.evaluationHistory
      .slice(-this.LEARNING_WINDOW_SIZE)
      .map(r => r.scores.overallScore);

    if (recentScores.length >= 3) {
      const consistency = this.calculateConsistency(recentScores);
      historyData.learningData.consistencyScores.push(consistency);

      if (historyData.learningData.consistencyScores.length > this.LEARNING_WINDOW_SIZE) {
        historyData.learningData.consistencyScores =
          historyData.learningData.consistencyScores.slice(-this.LEARNING_WINDOW_SIZE);
      }
    }
  }

  private calculateConsistency(scores: number[]): number {
    if (scores.length < 2) return 1.0;

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    return Math.max(0, 1 - standardDeviation * 2);
  }

  private async updatePerformanceMetrics(mbtiType: MBTIType): Promise<void> {
    const historyData = this.agentHistories.get(mbtiType);
    if (!historyData) return;

    const scores = historyData.evaluationHistory.map(r => r.scores.overallScore);
    if (scores.length === 0) return;

    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    const improvementRate = this.calculateImprovementRate(scores);

    historyData.performanceMetrics = {
      averageScore,
      bestScore,
      worstScore,
      improvementRate,
      consistencyIndex: this.calculateCurrentConsistency(historyData),
      participationFrequency: this.calculateParticipationFrequency(historyData),
      recentTrend: this.determineRecentTrend(scores),
      strongDimensions: this.identifyStrongDimensions(historyData),
      weakDimensions: this.identifyWeakDimensions(historyData)
    };
  }

  private calculateImprovementRate(scores: number[]): number {
    if (scores.length < 5) return 0.0;

    const recent = scores.slice(-5);
    const earlier = scores.slice(-10, -5);

    if (earlier.length === 0) return 0.0;

    const recentAverage = recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const earlierAverage = earlier.reduce((sum, score) => sum + score, 0) / earlier.length;

    return recentAverage - earlierAverage;
  }

  private determineRecentTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
    if (scores.length < 3) return 'stable';

    const recent = scores.slice(-3);
    const slope = this.calculateSlope(recent);

    if (slope > 0.05) return 'improving';
    if (slope < -0.05) return 'declining';
    return 'stable';
  }

  private calculateSlope(values: number[]): number {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateCurrentConsistency(historyData: AgentHistoryData): number {
    const consistencyScores = historyData.learningData.consistencyScores;

    if (consistencyScores.length === 0) return 0.8;

    return consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
  }

  private calculateParticipationFrequency(historyData: AgentHistoryData): number {
    const totalGlobalEvaluations = this.globalHistory.length;
    const agentEvaluations = historyData.evaluationHistory.length;

    return totalGlobalEvaluations > 0 ? agentEvaluations / totalGlobalEvaluations : 0.0;
  }

  private identifyStrongDimensions(historyData: AgentHistoryData): string[] {
    const dimensions: { dimension: string; score: number }[] = [];

    if (historyData.evaluationHistory.length === 0) return [];

    for (const [dimension, count] of historyData.learningData.strengthPatterns.entries()) {
      const frequency = count / historyData.evaluationHistory.length;
      dimensions.push({ dimension, score: frequency });
    }

    return dimensions
      .filter(d => d.score >= this.PATTERN_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(d => d.dimension);
  }

  private identifyWeakDimensions(historyData: AgentHistoryData): string[] {
    const dimensions: { dimension: string; score: number }[] = [];

    if (historyData.evaluationHistory.length === 0) return [];

    for (const [dimension, count] of historyData.learningData.weaknessPatterns.entries()) {
      const frequency = count / historyData.evaluationHistory.length;
      dimensions.push({ dimension, score: frequency });
    }

    return dimensions
      .filter(d => d.score >= this.PATTERN_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(d => d.dimension);
  }

  // 外部インターフェース
  async getAgentHistory(mbtiType: MBTIType): Promise<AgentHistory> {
    const historyData = this.agentHistories.get(mbtiType);

    if (!historyData) {
      throw new Error(`エージェント履歴が見つかりません: ${mbtiType}`);
    }

    return {
      mbtiType,
      totalEvaluations: historyData.evaluationHistory.length,
      averageScore: this.calculateAverageScore(historyData.evaluationHistory),
      recentPerformance: this.getRecentPerformance(historyData),
      strengthAreas: this.identifyStrengthAreas(historyData),
      improvementAreas: this.identifyImprovementAreas(historyData),
      consistencyScore: this.calculateCurrentConsistency(historyData),
      learningProgress: this.analyzeLearningProgress(historyData),
      getRecentFeedback: () => this.getRecentFeedback(mbtiType),
      analyzeProgressTrend: () => this.analyzeProgressTrend(mbtiType)
    };
  }

  private calculateAverageScore(records: InternalEvaluationRecord[]): number {
    if (records.length === 0) return 0.0;

    const total = records.reduce((sum, record) => sum + record.scores.overallScore, 0);
    return total / records.length;
  }

  private getRecentPerformance(historyData: AgentHistoryData): number {
    const recentRecords = historyData.evaluationHistory.slice(-5);
    return this.calculateAverageScore(recentRecords);
  }

  private identifyStrengthAreas(historyData: AgentHistoryData): string[] {
    return this.identifyStrongDimensions(historyData);
  }

  private identifyImprovementAreas(historyData: AgentHistoryData): string[] {
    return this.identifyWeakDimensions(historyData);
  }

  private analyzeLearningProgress(historyData: AgentHistoryData): unknown {
    const trends = historyData.learningData.improvementTrends;

    if (trends.length < 5) {
      return { status: 'insufficient_data', progress: 0.0 };
    }

    const slope = this.calculateSlope(trends);
    const variance = this.calculateVariance(trends);

    return {
      status: slope > 0.02 ? 'improving' : slope < -0.02 ? 'declining' : 'stable',
      progress: slope,
      stability: 1 - Math.min(1, variance)
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private getRecentFeedback(mbtiType: MBTIType): unknown[] {
    const historyData = this.agentHistories.get(mbtiType);

    if (!historyData) return [];

    return historyData.evaluationHistory
      .slice(-5)
      .map(record => ({
        timestamp: record.timestamp,
        overallScore: record.scores.overallScore,
        feedback: record.feedback,
        improvementAreas: this.extractImprovementAreas(record.feedback)
      }));
  }

  private extractImprovementAreas(feedback: unknown): string[] {
    if (feedback && typeof feedback === 'object' && 'improvements' in feedback) {
      const typedFeedback = feedback as { improvements: string[] };
      return Array.isArray(typedFeedback.improvements) ? typedFeedback.improvements : [];
    }
    return [];
  }

  private analyzeProgressTrend(mbtiType: MBTIType): 'improving' | 'stable' | 'declining' {
    const historyData = this.agentHistories.get(mbtiType);

    if (!historyData) return 'stable';

    return historyData.performanceMetrics.recentTrend;
  }

  // その他の外部インターフェース
  async getStatementHistory(mbtiType: MBTIType): Promise<StatementHistory> {
    const historyData = this.agentHistories.get(mbtiType);

    if (!historyData) {
      return {
        recentStatements: [],
        agentStatements: [],
        performanceHistory: [],
        feedbackHistory: []
      };
    }

    const recentStatements = historyData.evaluationHistory
      .slice(-this.LEARNING_WINDOW_SIZE)
      .map(record => ({
        statement: record.statement,
        timestamp: record.timestamp,
        score: record.scores.overallScore
      }));

    const agentStatements = historyData.evaluationHistory.map(record => ({
      statement: record.statement,
      context: record.context,
      score: record.scores.overallScore,
      timestamp: record.timestamp
    }));

    const performanceHistory = historyData.evaluationHistory.map(record => ({
      timestamp: record.timestamp,
      overallScore: record.scores.overallScore,
      dimensionScores: {
        performance: record.scores.performance,
        contentQuality: record.scores.contentQuality,
        mbtiAlignment: record.scores.mbtiAlignment
      }
    }));

    const feedbackHistory = historyData.evaluationHistory.map(record => {
      const typedFeedback = record.feedback && typeof record.feedback === 'object' ?
        record.feedback as { improvements?: string[]; strengths?: string[] } : {};

      return {
        timestamp: record.timestamp,
        feedback: record.feedback,
        improvements: typedFeedback.improvements || [],
        strengths: typedFeedback.strengths || []
      };
    });

    return {
      recentStatements,
      agentStatements,
      performanceHistory,
      feedbackHistory
    };
  }

  async getParticipantInfo(): Promise<ParticipantInfo[]> {
    const participants: ParticipantInfo[] = [];

    for (const [mbtiType, historyData] of this.agentHistories.entries()) {
      const recentActivity = historyData.evaluationHistory.slice(-5);
      const averageScore = this.calculateAverageScore(recentActivity);

      participants.push({
        mbtiType,
        participationCount: historyData.evaluationHistory.length,
        averageQuality: averageScore,
        lastActivity: historyData.lastUpdated,
        currentWeight: this.calculateCurrentWeight(historyData),
        consistencyScore: this.calculateCurrentConsistency(historyData),
        improvementTrend: this.getImprovementTrend(historyData)
      });
    }

    return participants;
  }

  private calculateCurrentWeight(historyData: AgentHistoryData): number {
    const recentPerformance = this.getRecentPerformance(historyData);
    const consistency = this.calculateCurrentConsistency(historyData);

    return Math.max(0.5, Math.min(2.0, recentPerformance * consistency * 1.2));
  }

  private getImprovementTrend(historyData: AgentHistoryData): 'improving' | 'stable' | 'declining' {
    return historyData.performanceMetrics.recentTrend;
  }

  async getLastFeedback(mbtiType: MBTIType): Promise<unknown> {
    const historyData = this.agentHistories.get(mbtiType);

    if (!historyData || historyData.evaluationHistory.length === 0) {
      return null;
    }

    const lastEvaluation = historyData.evaluationHistory[historyData.evaluationHistory.length - 1];
    return lastEvaluation.feedback;
  }

  getSystemMetrics(): unknown {
    const totalEvaluations = this.globalHistory.length;
    const averageQuality = this.calculateGlobalAverageQuality();
    const participantDistribution = this.calculateParticipantDistribution();
    const qualityStability = this.calculateQualityStability();

    return {
      totalEvaluations,
      averageQuality,
      participantDistribution,
      qualityStability
    };
  }

  private calculateGlobalAverageQuality(): number {
    if (this.globalHistory.length === 0) return 0.8;

    const total = this.globalHistory.reduce((sum, record) => sum + record.scores.overallScore, 0);
    return total / this.globalHistory.length;
  }

  private calculateParticipantDistribution(): Map<MBTIType, number> {
    const distribution = new Map<MBTIType, number>();

    for (const [mbtiType, historyData] of this.agentHistories.entries()) {
      distribution.set(mbtiType, historyData.evaluationHistory.length);
    }

    return distribution;
  }

  private calculateQualityStability(): number {
    if (this.globalHistory.length < 10) return 0.8;

    const recentScores = this.globalHistory
      .slice(-20)
      .map(record => record.scores.overallScore);

    return this.calculateConsistency(recentScores);
  }

  updateSettings(newSettings: AdaptiveSettings): void {
    this.adaptiveSettings = { ...this.adaptiveSettings, ...newSettings };
    console.log('📝 HistoryManager設定を更新しました');
  }
}
