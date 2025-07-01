export type MBTIType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'  // NT (Rational)
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'  // NF (Idealist)
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'  // SJ (Guardian)
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'; // SP (Artisan)

export type MBTIGroup = 'NT' | 'NF' | 'SJ' | 'SP';

export interface MBTICharacteristics {
  type: MBTIType;
  group: MBTIGroup;
  cognitiveFunction: {
    dominant: string;
    auxiliary: string;
    tertiary: string;
    inferior: string;
  };
  communicationStyle: {
    focus: string;
    approach: string;
    preference: string;
  };
  decisionMaking: {
    primary: string;
    secondary: string;
  };
  weight: number; // Dynamic weight for discussion
}

export interface DiscussionContext {
  topic: string;
  phase: 'brainstorming' | 'analysis' | 'synthesis' | 'conclusion';
  previousStatements: DiscussionStatement[];
  timeElapsed: number;
  participantCount: number;
  complexityLevel: 'low' | 'medium' | 'high';
}

export interface DiscussionStatement {
  agentId: string;
  mbtiType: MBTIType;
  content: string;
  timestamp: Date;
  confidence: number;
  relevance: number;
}

// 🆕 会話ターン用の型定義
export interface DiscussionTurn {
  agentType: MBTIType;
  message: string;
  timestamp?: string;
  weight?: number;
  qualityMetrics?: {
    overallQuality?: number;
    confidence?: number;
    relevance?: number;
  };
}

export interface GraphNode {
  id: string;
  mbtiType: MBTIType;
  group: MBTIGroup;
  weight: number;
  connections: Map<string, number>; // nodeId -> connection strength
}

export interface QualityMetrics {
  diversityScore: number;      // 視点・論点・意味的多様性
  consistencyScore: number;    // 論理・話題・性格一貫性
  convergenceEfficiency: number; // 合意形成率とバランス
  mbtiAlignmentScore: number;  // MBTI特性再現率
  argumentQuality: number;
  participationBalance: number;
  resolutionRate: number;
  timestamp: Date;
}

export interface DiscussionResult {
  topic: string;
  statements: DiscussionStatement[];
  conclusion: string;
  qualityMetrics: QualityMetrics;
  graphSnapshot: GraphNode[];
}

export interface PerformanceMetrics {
  averagePathLength: number;
  clusteringCoefficient: number;
  modularity: number;
  efficiency: number;
  robustness: number;
  adaptability: number;
}

export interface InteractionHistory {
  interactions: Map<string, number>;
  quality: Map<string, number>;
  temporal: Array<{
    timestamp: Date;
    participants: string[];
    quality: number;
  }>;
}

// 🆕 最適化結果の型定義
export interface OptimizationResults {
  executionCount: number;
  improvementPercentage: number;
  recommendations: string[];
}

// 🔧 リアルタイム最適化用の型定義（拡張版）
export interface ComprehensiveQualityReport {
  // 7次元品質評価
  performanceScore?: number;
  psychologicalScore?: number;
  externalAlignmentScore?: number;
  internalConsistencyScore?: number;
  socialDecisionScore?: number;
  contentQualityScore?: number;
  ethicsScore?: number;
  
  // 従来メトリクス
  diversityScore?: number;
  consistencyScore?: number;
  convergenceEfficiency?: number;
  mbtiAlignmentScore?: number;
  interactionQuality?: number;
  argumentQuality?: number;
  participationBalance?: number;
  resolutionRate?: number;
  
  // 総合評価
  overallScore?: number;
  grade?: string;
  
  // 分析結果
  strengths?: string[];
  improvements?: string[];
  optimizationResults?: OptimizationResults;
  
  // 過去互換性のため
  comprehensiveMetrics?: {
    performanceScore: number;
    psychologicalScore: number;
    externalAlignmentScore: number;
    internalConsistencyScore: number;
    socialDecisionScore: number;
    contentQualityScore: number;
    ethicsScore: number;
    diversityScore: number;
    consistencyScore: number;
    convergenceEfficiency: number;
    mbtiAlignmentScore: number;
    interactionQuality: number;
    argumentQuality: number;
    participationBalance: number;
    resolutionRate: number;
  };
  detailedAnalysis?: string;
  recommendations?: string[];
  qualityGrade?: string;
}

export interface GraphStructure {
  nodes: Set<MBTIType>;
  edges: Map<string, number>;
  clusters: Map<string, Set<MBTIType>>;
}

export interface OptimizedGraphStructure {
  nodes: Set<MBTIType>;
  edges: Map<string, number>;
  clusters: Map<string, Set<MBTIType>>;
  optimizationMetrics: {
    efficiency: number;
    cohesion: number;
    adaptationSpeed: number;
  };
}

export interface WeightingContext {
  discussionPhase: 'brainstorming' | 'analysis' | 'synthesis' | 'conclusion';
  topicRelevance: Map<MBTIType, number>;
  participationHistory: Array<{
    mbtiType: MBTIType;
    timestamp: Date;
    quality: number;
  }>;
  qualityMetrics: {
    diversityScore: number;
    consistencyScore: number;
    convergenceEfficiency: number;
    mbtiAlignmentScore: number;
    interactionQuality: number;
    argumentQuality: number;
    participationBalance: number;
    resolutionRate: number;
  };
} 