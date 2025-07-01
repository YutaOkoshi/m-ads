// M-ADS (MBTI Multi-Agent Discussion System) Types
// Mastraワークフローとの統合用型定義

export type MBTIType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'  // NT (Rational)
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'  // NF (Idealist)
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'  // SJ (Guardian)
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'; // SP (Artisan)

export type MBTIGroup = 'NT' | 'NF' | 'SJ' | 'SP';

export type DiscussionPhase = 'brainstorming' | 'analysis' | 'synthesis' | 'conclusion';

// 🔄 会話ターン（Mastraワークフローの結果形式）
export interface ConversationTurn {
  turnNumber: number;
  speakerAgentId: string;
  speakerMbtiType: MBTIType;
  statement: string;
  responseToAgent?: string;
  timestamp: string;
  confidence: number;
  relevance: number;
  dynamicWeight: number;
  qualityContribution: number;
  sevenDimensionEvaluation?: {
    performance: number;
    psychological: number;
    externalAlignment: number;
    internalConsistency: number;
    socialDecisionMaking: number;
    contentQuality: number;
    ethics: number;
    overallQuality: number;
  };
  realtimeOptimization: {
    weightAdjustment: number;
    graphOptimization: boolean;
    qualityImprovement: number;
  };
}

// 📊 品質メトリクス（7次元＋従来メトリクス）
export interface ComprehensiveMetrics {
  // 7次元品質評価
  performanceScore: number;
  psychologicalScore: number;
  externalAlignmentScore: number;
  internalConsistencyScore: number;
  socialDecisionScore: number;
  contentQualityScore: number;
  ethicsScore: number;

  // 従来メトリクス
  diversityScore: number;
  consistencyScore: number;
  convergenceEfficiency: number;
  mbtiAlignmentScore: number;
  interactionQuality: number;

  // 新規メトリクス
  argumentQuality: number;
  participationBalance: number;
  resolutionRate: number;
}

// ⚡ リアルタイム最適化結果
export interface RealtimeOptimization {
  optimizationCount: number;
  qualityImprovement: number;
  weightAdjustments: Record<string, number>;
  graphOptimizations: number;
  recommendations: string[];
}

// 🏆 総合評価レポート
export interface AdvancedReport {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  overallScore: number;
  grade: string;
  detailedAnalysis: string;
  mbtiTypeAnalysis: Record<string, {
    participationRate: number;
    qualityContribution: number;
    characteristicAlignment: number;
  }>;
}

// 💬 議論総括
export interface DiscussionSummary {
  overview: string;
  keyThemes: string[];
  progressAnalysis: string;
  mbtiContributions: Record<string, string>;
  consensus: string;
  insights: string[];
  processCharacteristics: string[];
}

// 💾 会話保存結果
export interface ConversationSaved {
  saved: boolean;
  filePath?: string;
  fileSize?: string;
  format?: string;
  error?: string;
}

// 🎯 Mastraワークフロー実行結果の完全型定義
export interface DiscussionResult {
  topic: string;
  participantTypes: MBTIType[];
  totalStatements: number;
  totalTurns: number;
  conversationFlow: ConversationTurn[];
  comprehensiveMetrics: ComprehensiveMetrics;
  realtimeOptimization: RealtimeOptimization;
  advancedReport: AdvancedReport;
  discussionSummary: DiscussionSummary;
  conversationSaved?: ConversationSaved;
}

// 🔧 ワークフロー実行パラメータ
export interface DiscussionConfig {
  topic: string;
  participantCount: number;
  enableRealtimeOptimization: boolean;
  enableGraphOptimization: boolean;
  qualityThreshold: number;
  saveConversation: boolean;
  outputFormat: 'markdown' | 'json';
  outputDirectory: string;
}

// 📈 ダッシュボード用のリアルタイム状態
export interface DiscussionState {
  status: 'idle' | 'running' | 'completed' | 'error';
  config?: DiscussionConfig;
  result?: DiscussionResult;
  error?: string;
  progress: {
    currentPhase: DiscussionPhase;
    currentTurn: number;
    totalExpectedTurns: number;
    progressPercentage: number;
  };
  liveMetrics: {
    activeSpeaker?: MBTIType;
    latestWeight: Record<MBTIType, number>;
    qualityTrend: number[];
    optimizationCount: number;
  };
}

// 🎨 UIコンポーネント用の型定義
export interface MBTIAgentStatus {
  type: MBTIType;
  group: MBTIGroup;
  isActive: boolean;
  currentWeight: number;
  participationCount: number;
  averageQuality: number;
  lastActivity?: Date;
}

// 📊 チャート用データ型
export interface QualityChartData {
  name: string;
  value: number;
  fullMark: number;
}

export interface WeightHistoryData {
  turnNumber: number;
  [key: string]: number | string; // MBTITypeをキーとした重み値
}

export interface ParticipationData {
  mbtiType: MBTIType;
  count: number;
  percentage: number;
  quality: number;
}

// 🔄 API レスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// WebSocket リアルタイム通信用
export interface WSMessage {
  type: 'progress' | 'turn' | 'metrics' | 'completion' | 'error';
  data: any;
  timestamp: string;
}