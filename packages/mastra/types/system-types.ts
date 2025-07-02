import type { QualityScores, ParticipantInfo } from './feedback-system-types';
import type { MBTIType } from './mbti-types';

/**
 * システム最適化器用の型定義
 */

// システム設定インターフェース
export interface SystemOptimizerConfig {
    learningRate: number;
    convergenceThreshold: number;
    maxIterations: number;
    embeddingDimension: number;
    adaptationSpeed: number;
    qualityThreshold: number;
    enableGraphOptimization: boolean;
    enableRealtimeOptimization: boolean;
}

// システム状態インターフェース
export interface SystemState {
    currentPhase: 'initial' | 'interaction' | 'synthesis' | 'consensus' | 'final';
    averageQuality: number;
    participantCount: number;
    qualityDistribution: QualityScores;
    totalEvaluations: number;
    lastOptimization: Date | null;
}

// 履歴管理インターフェース
export interface HistoryManager {
    getParticipantInfo(): Promise<ParticipantInfo[]>;
    updateSettings(settings: unknown): void;
    getSystemMetrics(): HistoryMetrics;
    recordEvaluation(mbtiType: MBTIType, data: EvaluationRecord): Promise<void>;
    getAgentHistory(mbtiType: MBTIType): AgentHistory;
    getStatementHistory(mbtiType: MBTIType): Promise<StatementHistory>;
}

export interface HistoryMetrics {
    averageQuality: number;
    totalEvaluations: number;
    participantBalance: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
}

export interface EvaluationRecord {
    statement: string;
    scores: QualityScores;
    feedback: unknown;
    timestamp: Date;
}

export interface AgentHistory {
    getRecentFeedback(): RecentFeedback[];
    analyzeProgressTrend(): 'improving' | 'stable' | 'declining';
}

export interface RecentFeedback {
    overallScore: number;
    improvementAreas: string[];
    timestamp: Date;
}

export interface StatementHistory {
    recentStatements: Array<{
        statement: string;
        timestamp: Date;
        score: number;
    }>;
    averageScore: number;
    trendAnalysis: 'improving' | 'stable' | 'declining';
}

// 認知機能統計インターフェース
export interface CognitiveFunctionStats {
    dominantFunction: string;
    auxiliaryFunction: string;
    tertiaryFunction: string;
    inferiorFunction: string;
    interactionPattern: Record<string, number>;
}

// 参加統計インターフェース
export interface ParticipationStats {
    average: number;
    variance: number;
    distribution: Record<MBTIType, number>;
    balanceScore: number;
}

// 品質統計インターフェース
export interface QualityStats {
    average: number;
    variance: number;
    distribution: Record<string, number>;
    trendAnalysis: 'improving' | 'stable' | 'declining';
}

// 評価コンテキスト拡張
export interface EvaluationContextExtended {
    topic: string;
    duration: number;
    phase: string;
    expectedOutcome: string;
    participantTypes?: MBTIType[];
    qualityThreshold?: number;
}

// 健全性チェック結果
export interface HealthCheckResult {
    overall: boolean;
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    systemLoad: number;
    memoryUsage: number;
}
