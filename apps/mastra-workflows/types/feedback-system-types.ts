import type { MBTIType, DiscussionStatement } from './mbti-types';

/**
 * フィードバックシステム統合型定義
 * RealtimeFeedbackManager用の包括的型システム
 */

// ===========================================
// コア評価結果型
// ===========================================

export interface FeedbackResult {
  scores?: QualityScores;
  overall: QualityScores;
  detailed: DetailedFeedback;
  detailedFeedback: DetailedFeedback;
  optimization: OptimizationResult;
  optimizationResult: OptimizationResult;
  nextGuidance: string;
  adaptivePrompt: string;
  systemRecommendations: string[];
  timestamp: Date;
  confidence: number;
  executionTime: number;
}

export interface QualityScores {
  performance: number;
  psychological: number;
  contentQuality: number;
  mbtiAlignment: number;
  overallScore: number;
  breakdown: QualityBreakdown;
}

export interface QualityBreakdown {
  strengths: string[];
  weaknesses: string[];
  specificImprovements: string[];
  dimensionScores: Record<string, number>;
}

// ===========================================
// 評価コンテキスト
// ===========================================

export interface EvaluationContext {
  statement: string;
  topic: string;
  mbtiType: MBTIType;
  phase: DiscussionPhase;
  turnNumber: number;
  history: StatementHistory;
  participants: ParticipantInfo[];
  previousFeedback?: DetailedFeedback;
  currentWeight: number;
}

export interface StatementHistory {
  recentStatements: Array<{
    statement: string;
    timestamp: Date;
    score: number;
  }>;
  agentStatements: Array<{
    statement: string;
    context: {
      topic: string;
      phase: string;
      turnNumber: number;
    };
    score: number;
    timestamp: Date;
  }>;
  performanceHistory: Array<{
    timestamp: Date;
    overallScore: number;
    dimensionScores: {
      performance: number;
      contentQuality: number;
      mbtiAlignment: number;
    };
  }>;
  feedbackHistory: Array<{
    timestamp: Date;
    feedback: unknown;
    improvements: string[];
    strengths: string[];
  }>;
}

export interface ParticipantInfo {
  mbtiType: MBTIType;
  currentWeight: number;
  participationCount: number;
  averageQuality: number;
  lastActivity: Date;
  consistencyScore?: number;
  improvementTrend?: ProgressTrend;
}

export type DiscussionPhase = 'initial' | 'interaction' | 'synthesis' | 'consensus';

// ===========================================
// 評価器インターフェース
// ===========================================

export interface QualityEvaluator {
  evaluate(context: EvaluationContext): Promise<EvaluationResult>;
  getWeight(): number;
  getType(): EvaluatorType;
  configure(config: EvaluatorConfig): void;
  isEnabled(): boolean;
}

export interface EvaluationResult {
  score: number;
  confidence: number;
  breakdown: Record<string, number>;
  feedback: string;
  suggestions: string[];
  metadata: Record<string, unknown>;
}

export type EvaluatorType =
  | 'seven-dimension'
  | 'performance'
  | 'mbti-alignment'
  | 'progress-tracking'
  | 'custom';

export interface EvaluatorConfig {
  weight: number;
  thresholds: Record<string, number>;
  enabled: boolean;
  customSettings?: Record<string, unknown>;
}

// ===========================================
// 詳細フィードバック
// ===========================================

export interface DetailedFeedback {
  overallScore: number;
  feedback: string;
  improvements: string[];
  detailedAnalysis: DetailedAnalysis;
  mbtiAlignment: MBTIAlignmentAnalysis;
  progressTracking: ProgressTracking;
  sevenDimensionEvaluation: SevenDimensionEvaluation;
}

export interface DetailedAnalysis {
  strengths: string[];
  weaknesses: string[];
  specificImprovements: string[];
  nextSpeechGuidance: string;
  qualityTrend: 'improving' | 'stable' | 'declining';
}

export interface MBTIAlignmentAnalysis {
  alignmentScore: number;
  expectedCharacteristics: string[];
  demonstratedCharacteristics: string[];
  alignmentGap: string[];
  recommendedFocus: string[];
}

export interface ProgressTracking {
  improvementTrend: 'improving' | 'stable' | 'declining';
  consistencyScore: number;
  recommendedFocus: string[];
  milestones: ProgressMilestone[];
}

export interface ProgressMilestone {
  achievement: string;
  timestamp: Date;
  score: number;
}

export interface SevenDimensionEvaluation {
  performance: number;
  psychological: number;
  externalAlignment: number;
  internalConsistency: number;
  socialDecisionMaking: number;
  contentQuality: number;
  ethics: number;
  overallQuality: number;
}

// ===========================================
// システム最適化
// ===========================================

export interface OptimizationResult {
  recommendations: string[];
  weightAdjustments: Map<MBTIType, WeightAdjustment>;
  graphOptimizations: GraphOptimization[];
  qualityImprovement: number;
  systemEfficiency: number;
  executionTime: number;
  convergenceInfo: {
    iterations: number;
    finalError: number;
    converged: boolean;
  };
}

export interface GraphOptimization {
  type: 'weight-adjustment' | 'topology-change' | 'routing-optimization' | 'variational-em';
  description: string;
  impact: number;
  target: MBTIType | 'system';
  optimizedEdges?: Map<string, number>;
  nodeEmbeddings?: Map<MBTIType, number[]>;
  clusterAssignments?: Map<MBTIType, number>;
  efficiency?: number;
  cohesion?: number;
  adaptationSpeed?: number;
  iterations?: number;
  converged?: boolean;
  convergenceError?: number;
  optimizationTrace?: number[];
}

// ===========================================
// 設定管理
// ===========================================

export interface FeedbackConfiguration {
  qualityThresholds: QualityThresholds;
  evaluatorWeights: EvaluatorWeights;
  optimizationStrategy: OptimizationStrategy;
  enableRealtimeOptimization: boolean;
  performanceTarget: PerformanceTarget;
  adaptiveSettings: AdaptiveSettings;
}

export interface QualityThresholds {
  performance: number;
  psychological: number;
  contentQuality: number;
  mbtiAlignment: number;
  overallMinimum: number;
  interventionThreshold: number;
}

export interface EvaluatorWeights {
  sevenDimension: number;
  performance: number;
  mbtiAlignment: number;
  progressTracking: number;
}

export type OptimizationStrategy =
  | 'quality-focused'
  | 'diversity-focused'
  | 'efficiency-focused'
  | 'balanced'
  | 'custom';

export interface PerformanceTarget {
  responseTime: number; // ミリ秒
  accuracy: number; // 0-1
  throughput: number; // 評価/分
  memoryUsage: number; // MB
}

export interface AdaptiveSettings {
  learningRate: number;
  adaptationSensitivity: number;
  historyWindowSize: number;
  feedbackFrequency: 'every-turn' | 'phase-based' | 'threshold-based';
}

// ===========================================
// 履歴管理
// ===========================================

export interface AgentHistory {
  mbtiType: MBTIType;
  totalEvaluations: number;
  statements?: StatementRecord[];
  evaluations?: EvaluationRecord[];
  progressMetrics?: ProgressMetrics;
  totalParticipation?: number;
  averageScore: number;
  recentPerformance: number;
  strengthAreas: string[];
  improvementAreas: string[];
  consistencyScore: number;
  learningProgress: unknown;
  averageQuality?: number;
  lastActivity?: Date;
  getRecentFeedback: () => unknown[];
  analyzeProgressTrend: () => ProgressTrend;
}

export interface StatementRecord {
  statement: string;
  timestamp: Date;
  quality: number;
  feedback: DetailedFeedback;
  context: Partial<EvaluationContext>;
}

export interface EvaluationRecord {
  statement: string;
  timestamp: Date;
  scores: QualityScores;
  feedback: DetailedFeedback;
  optimization?: OptimizationResult;
  improvement?: number;
}

export interface ProgressMetrics {
  qualityTrend: TrendAnalysis;
  participationPattern: ParticipationPattern;
  improvementRate: number;
  consistencyScore: number;
  milestones: ProgressMilestone[];
}

export interface TrendAnalysis {
  direction: 'improving' | 'stable' | 'declining';
  rate: number; // 改善/悪化の速度
  confidence: number;
  dataPoints: number;
}

export interface ParticipationPattern {
  frequency: number;
  qualityConsistency: number;
  engagementLevel: 'high' | 'medium' | 'low';
  interactionStyle: string;
}

// ===========================================
// システムメトリクス
// ===========================================

export interface SystemMetrics {
  evaluationCount: number;
  averageQuality: number;
  optimizationEfficiency: number;
  systemLoad?: number;
  memoryUsage?: number;
  responseTime?: number;
  errorRate?: number;
  participantBalance: number;
  lastUpdated: Date;
  participantDistribution?: Map<MBTIType, number>;
  systemHealth?: SystemHealth;
  performanceMetrics?: SystemPerformanceMetrics;
  eventSystemStats?: {
    totalEvents: number;
    activeListeners: number;
    queueSize: number;
  };
  componentHealth?: unknown;
}

export interface SystemHealth {
  overallStatus: 'excellent' | 'good' | 'warning' | 'critical';
  qualityStability: number;
  optimizationEffectiveness: number;
  errorRate: number;
  uptime: number;
}

export interface SystemPerformanceMetrics {
  averageResponseTime: number;
  peakResponseTime: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
}

// ===========================================
// イベント型（Observer Pattern用）
// ===========================================

export interface FeedbackEvent {
  type: FeedbackEventType;
  timestamp: Date;
  agentId: string;
  data: unknown;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export type FeedbackEventType =
  | 'quality-threshold-breach'
  | 'optimization-triggered'
  | 'weight-adjusted'
  | 'progress-milestone'
  | 'system-alert'
  | 'configuration-changed';

export interface FeedbackEventHandler {
  handleEvent(event: FeedbackEvent): Promise<void>;
  getEventTypes(): FeedbackEventType[];
  isEnabled(): boolean;
}

// ===========================================
// エラー処理
// ===========================================

export interface FeedbackError extends Error {
  code: FeedbackErrorCode;
  context: EvaluationContext;
  recoverable: boolean;
  timestamp: Date;
}

export type FeedbackErrorCode =
  | 'EVALUATION_FAILED'
  | 'OPTIMIZATION_ERROR'
  | 'CONFIGURATION_INVALID'
  | 'HISTORY_CORRUPTION'
  | 'SYSTEM_OVERLOAD'
  | 'NETWORK_TIMEOUT';

// ===========================================
// 本格実装用追加型定義
// ===========================================

export interface FeedbackAggregationInput {
  scores: QualityScores;
  optimization: OptimizationResult;
  context: EvaluationContext;
  historicalData?: unknown;
}

export interface AdaptivePromptParams {
  mbtiType: MBTIType;
  topic: string;
  phase: DiscussionPhase;
  currentWeight: number;
  recentFeedback?: unknown[];
  progressTrend?: ProgressTrend;
}

export type ProgressTrend = 'improving' | 'stable' | 'declining';

export interface WeightAdjustment {
  currentWeight: number;
  adjustedWeight: number;
  adjustmentReason: string;
  cognitiveContribution: number;
  participationContribution: number;
  qualityContribution: number;
  confidence: number;
}

export interface SystemEfficiencyMetrics {
  overallEfficiency: number;
  optimizationCount: number;
  averageImprovementRate: number;
  systemStability: number;
}

export interface PerformanceMetrics {
  averageScore: number;
  bestScore: number;
  worstScore: number;
  improvementRate: number;
  consistencyIndex: number;
  participationFrequency: number;
  recentTrend: ProgressTrend;
  strongDimensions: string[];
  weakDimensions: string[];
}

// ===========================================
// ユーティリティ型
// ===========================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type FeedbackConfigurationUpdate = DeepPartial<FeedbackConfiguration>;

export type EvaluationContextPartial = RequiredKeys<
  Partial<EvaluationContext>,
  'statement' | 'topic' | 'mbtiType' | 'phase'
>;
