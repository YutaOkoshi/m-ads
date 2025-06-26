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
}

export interface DiscussionStatement {
  agentId: string;
  mbtiType: MBTIType;
  content: string;
  timestamp: Date;
  confidence: number;
  relevance: number;
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
  timestamp: Date;
}

export interface DiscussionResult {
  topic: string;
  statements: DiscussionStatement[];
  conclusion: string;
  qualityMetrics: QualityMetrics;
  graphSnapshot: GraphNode[];
} 