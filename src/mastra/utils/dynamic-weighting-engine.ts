import type { MBTIType, MBTIGroup, DiscussionContext } from '../types/mbti-types';
import { MBTI_CHARACTERISTICS, getGroupFromType, PHASE_WEIGHT_MODIFIERS } from './mbti-characteristics';

/**
 * Big Five特性スコア
 */
export interface BigFiveScores {
  openness: number;      // 開放性 (0-1)
  conscientiousness: number; // 誠実性 (0-1)
  extraversion: number;      // 外向性 (0-1)
  agreeableness: number;     // 協調性 (0-1)
  neuroticism: number;       // 神経症的傾向 (0-1)
}

/**
 * 認知機能の重み
 */
export interface CognitiveFunctionWeights {
  dominantWeight: number;   // 主機能の重み
  auxiliaryWeight: number;  // 補助機能の重み
  tertiaryWeight: number;   // 第三機能の重み
  inferiorWeight: number;   // 劣等機能の重み
}

/**
 * 重み調整の修正係数マトリックス
 */
export interface ModifierMatrix {
  topicRelevance: number;    // 話題関連性修正係数
  groupDynamics: number;     // グループダイナミクス係数
  expertiseLevel: number;    // 専門性レベル係数
  personalityFit: number;    // 性格適合度係数
}

/**
 * 動的調整エンジンの設定
 */
export interface DynamicAdjustmentSettings {
  learningRate: number;      // 学習率
  decayFactor: number;       // 減衰係数
  adaptationSpeed: number;   // 適応速度
  stabilityThreshold: number; // 安定性閾値
}

/**
 * 重みベクトル
 */
export interface WeightVector {
  baseWeight: number;
  contextualWeight: number;
  bigFiveAdjustment: number;
  learningAdjustment: number;
  finalWeight: number;
  confidence: number;        // 重み計算の信頼度
}

/**
 * MBTIタイプとBig Five特性のマッピング
 * 研究に基づく相関係数を使用
 */
export const MBTI_BIG_FIVE_CORRELATION: Record<MBTIType, BigFiveScores> = {
  // NT (Rational)
  INTJ: { openness: 0.8, conscientiousness: 0.7, extraversion: 0.2, agreeableness: 0.4, neuroticism: 0.3 },
  INTP: { openness: 0.9, conscientiousness: 0.4, extraversion: 0.2, agreeableness: 0.5, neuroticism: 0.4 },
  ENTJ: { openness: 0.7, conscientiousness: 0.8, extraversion: 0.8, agreeableness: 0.4, neuroticism: 0.2 },
  ENTP: { openness: 0.9, conscientiousness: 0.3, extraversion: 0.8, agreeableness: 0.6, neuroticism: 0.3 },

  // NF (Idealist)
  INFJ: { openness: 0.8, conscientiousness: 0.6, extraversion: 0.3, agreeableness: 0.8, neuroticism: 0.4 },
  INFP: { openness: 0.9, conscientiousness: 0.4, extraversion: 0.2, agreeableness: 0.9, neuroticism: 0.5 },
  ENFJ: { openness: 0.7, conscientiousness: 0.7, extraversion: 0.8, agreeableness: 0.9, neuroticism: 0.3 },
  ENFP: { openness: 0.9, conscientiousness: 0.3, extraversion: 0.9, agreeableness: 0.8, neuroticism: 0.4 },

  // SJ (Guardian)
  ISTJ: { openness: 0.3, conscientiousness: 0.9, extraversion: 0.2, agreeableness: 0.6, neuroticism: 0.2 },
  ISFJ: { openness: 0.4, conscientiousness: 0.8, extraversion: 0.3, agreeableness: 0.9, neuroticism: 0.3 },
  ESTJ: { openness: 0.4, conscientiousness: 0.9, extraversion: 0.8, agreeableness: 0.5, neuroticism: 0.2 },
  ESFJ: { openness: 0.5, conscientiousness: 0.8, extraversion: 0.8, agreeableness: 0.9, neuroticism: 0.3 },

  // SP (Artisan)
  ISTP: { openness: 0.6, conscientiousness: 0.4, extraversion: 0.3, agreeableness: 0.4, neuroticism: 0.3 },
  ISFP: { openness: 0.8, conscientiousness: 0.4, extraversion: 0.2, agreeableness: 0.8, neuroticism: 0.4 },
  ESTP: { openness: 0.6, conscientiousness: 0.3, extraversion: 0.9, agreeableness: 0.6, neuroticism: 0.2 },
  ESFP: { openness: 0.7, conscientiousness: 0.3, extraversion: 0.9, agreeableness: 0.8, neuroticism: 0.3 },
};

/**
 * 認知機能別の標準重み配分
 */
export const COGNITIVE_FUNCTION_WEIGHTS: Record<MBTIType, CognitiveFunctionWeights> = {
  // 各タイプの認知機能階層に基づく重み分配
  INTJ: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  INTP: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  ENTJ: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  ENTP: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  
  INFJ: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  INFP: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  ENFJ: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  ENFP: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  
  ISTJ: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  ISFJ: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  ESTJ: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  ESFJ: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  
  ISTP: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  ISFP: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  ESTP: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
  ESFP: { dominantWeight: 0.4, auxiliaryWeight: 0.3, tertiaryWeight: 0.2, inferiorWeight: 0.1 },
};

/**
 * 動的重み調整エンジンクラス
 */
export class DynamicWeightingEngine {
  private interactionHistory: Map<string, number> = new Map();
  private performanceHistory: Map<string, number[]> = new Map();
  private contextualModifiers: Map<string, ModifierMatrix> = new Map();
  private settings: DynamicAdjustmentSettings;

  constructor(settings?: Partial<DynamicAdjustmentSettings>) {
    this.settings = {
      learningRate: 0.1,
      decayFactor: 0.95,
      adaptationSpeed: 0.05,
      stabilityThreshold: 0.02,
      ...settings
    };
  }

  /**
   * Big Five統合重み計算
   */
  calculateHybridWeight(
    mbtiType: MBTIType,
    userBigFiveScores: Partial<BigFiveScores>,
    discussionContext: DiscussionContext
  ): WeightVector {
    // 1. ベース重み（MBTI特性から）
    const baseWeight = MBTI_CHARACTERISTICS[mbtiType].weight;
    
    // 2. Big Five補正係数を計算
    const expectedBigFive = MBTI_BIG_FIVE_CORRELATION[mbtiType];
    const bigFiveAdjustment = this.calculateBigFiveAdjustment(expectedBigFive, userBigFiveScores);
    
    // 3. 文脈適応重み
    const contextualWeight = this.calculateContextualWeight(mbtiType, discussionContext);
    
    // 4. 学習ベース調整
    const agentId = `${mbtiType}-agent`;
    const learningAdjustment = this.calculateLearningAdjustment(agentId);
    
    // 5. 最終重み計算
    const finalWeight = baseWeight * bigFiveAdjustment * contextualWeight * learningAdjustment;
    
    // 6. 信頼度計算
    const confidence = this.calculateConfidence(mbtiType, discussionContext);
    
    return {
      baseWeight,
      contextualWeight,
      bigFiveAdjustment,
      learningAdjustment,
      finalWeight: Math.max(0.1, Math.min(2.0, finalWeight)), // 0.1-2.0の範囲に制限
      confidence
    };
  }

  /**
   * Big Five特性に基づく調整係数計算
   */
  private calculateBigFiveAdjustment(
    expectedBigFive: BigFiveScores,
    userBigFive: Partial<BigFiveScores>
  ): number {
    if (Object.keys(userBigFive).length === 0) {
      return 1.0; // Big Fiveスコアが提供されていない場合はデフォルト
    }

    let totalAdjustment = 0;
    let validScores = 0;

    // 各次元での差異を計算
    (Object.keys(expectedBigFive) as Array<keyof BigFiveScores>).forEach(dimension => {
      if (userBigFive[dimension] !== undefined) {
        const expected = expectedBigFive[dimension];
        const actual = userBigFive[dimension]!;
        const difference = Math.abs(expected - actual);
        
        // 差異が小さいほど調整係数は1.0に近づく
        const adjustment = 1.0 - (difference * 0.3); // 最大30%の調整
        totalAdjustment += adjustment;
        validScores++;
      }
    });

    return validScores > 0 ? totalAdjustment / validScores : 1.0;
  }

  /**
   * 文脈適応重み計算
   */
  private calculateContextualWeight(mbtiType: MBTIType, context: DiscussionContext): number {
    const group = getGroupFromType(mbtiType);
    
    // 1. フェーズベース修正
    const phaseModifier = PHASE_WEIGHT_MODIFIERS[context.phase]?.[group] || 1.0;
    
    // 2. 話題関連性修正
    const topicModifier = this.calculateTopicRelevance(mbtiType, context.topic);
    
    // 3. 相互作用履歴修正
    const interactionModifier = this.calculateInteractionModifier(mbtiType, context);
    
    return phaseModifier * topicModifier * interactionModifier;
  }

  /**
   * 話題関連性の計算
   */
  private calculateTopicRelevance(mbtiType: MBTIType, topic: string): number {
    const characteristics = MBTI_CHARACTERISTICS[mbtiType];
    const topicLower = topic.toLowerCase();
    
    // 各MBTIタイプの得意分野に基づく関連性スコア
    let relevanceScore = 1.0;
    
    // NT: 戦略、システム、技術関連の話題
    if (characteristics.group === 'NT') {
      if (topicLower.includes('戦略') || topicLower.includes('システム') || 
          topicLower.includes('技術') || topicLower.includes('分析')) {
        relevanceScore *= 1.2;
      }
    }
    
    // NF: 人間関係、価値観、創造性関連の話題
    if (characteristics.group === 'NF') {
      if (topicLower.includes('人') || topicLower.includes('価値') || 
          topicLower.includes('創造') || topicLower.includes('意味')) {
        relevanceScore *= 1.2;
      }
    }
    
    // SJ: 組織、計画、実装関連の話題
    if (characteristics.group === 'SJ') {
      if (topicLower.includes('組織') || topicLower.includes('計画') || 
          topicLower.includes('実装') || topicLower.includes('管理')) {
        relevanceScore *= 1.2;
      }
    }
    
    // SP: 実用性、現実性、行動関連の話題
    if (characteristics.group === 'SP') {
      if (topicLower.includes('実用') || topicLower.includes('行動') || 
          topicLower.includes('現実') || topicLower.includes('実践')) {
        relevanceScore *= 1.2;
      }
    }
    
    return Math.min(relevanceScore, 1.5); // 最大50%の向上
  }

  /**
   * 相互作用履歴に基づく修正係数
   */
  private calculateInteractionModifier(mbtiType: MBTIType, context: DiscussionContext): number {
    const agentId = `${mbtiType}-agent`;
    const interactions = this.interactionHistory.get(agentId) || 0;
    
    // 発言が多すぎる場合は重みを下げる（多様性確保）
    if (interactions > context.previousStatements.length * 0.3) {
      return Math.max(0.6, 1.0 - ((interactions - context.previousStatements.length * 0.3) * 0.1));
    }
    
    return 1.0;
  }

  /**
   * 学習ベース調整係数
   */
  private calculateLearningAdjustment(agentId: string): number {
    const performances = this.performanceHistory.get(agentId) || [];
    
    if (performances.length < 3) {
      return 1.0; // 十分なデータがない場合はデフォルト
    }
    
    // 最近のパフォーマンス傾向を分析
    const recentPerformances = performances.slice(-5);
    const averagePerformance = recentPerformances.reduce((sum, p) => sum + p, 0) / recentPerformances.length;
    
    // パフォーマンスが高い場合は重みを上げ、低い場合は下げる
    const adjustment = 0.8 + (averagePerformance * 0.4); // 0.8-1.2の範囲
    
    return Math.max(0.7, Math.min(1.3, adjustment));
  }

  /**
   * 重み計算の信頼度
   */
  private calculateConfidence(mbtiType: MBTIType, context: DiscussionContext): number {
    const agentId = `${mbtiType}-agent`;
    const interactions = this.interactionHistory.get(agentId) || 0;
    const performances = this.performanceHistory.get(agentId) || [];
    
    // データ量に基づく信頼度
    const dataConfidence = Math.min(1.0, (interactions + performances.length) / 10);
    
    // 文脈適合度に基づく信頼度
    const contextConfidence = this.calculateTopicRelevance(mbtiType, context.topic) / 1.5;
    
    return (dataConfidence + contextConfidence) / 2;
  }

  /**
   * 相互作用を記録
   */
  recordInteraction(agentId: string, performance?: number): void {
    // 相互作用回数を記録
    const currentCount = this.interactionHistory.get(agentId) || 0;
    this.interactionHistory.set(agentId, currentCount + 1);
    
    // パフォーマンススコアを記録（提供されている場合）
    if (performance !== undefined) {
      const performances = this.performanceHistory.get(agentId) || [];
      performances.push(performance);
      
      // 最大50回の履歴を保持
      if (performances.length > 50) {
        performances.shift();
      }
      
      this.performanceHistory.set(agentId, performances);
    }
  }

  /**
   * 履歴をリセット
   */
  resetHistory(): void {
    this.interactionHistory.clear();
    this.performanceHistory.clear();
    this.contextualModifiers.clear();
  }

  /**
   * エージェントの統計情報を取得
   */
  getAgentStatistics(agentId: string): {
    interactions: number;
    averagePerformance: number;
    recentTrend: 'improving' | 'declining' | 'stable';
  } {
    const interactions = this.interactionHistory.get(agentId) || 0;
    const performances = this.performanceHistory.get(agentId) || [];
    
    const averagePerformance = performances.length > 0 
      ? performances.reduce((sum, p) => sum + p, 0) / performances.length 
      : 0;
    
    let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (performances.length >= 5) {
      const recent = performances.slice(-3);
      const earlier = performances.slice(-6, -3);
      
      if (recent.length >= 3 && earlier.length >= 3) {
        const recentAvg = recent.reduce((sum, p) => sum + p, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, p) => sum + p, 0) / earlier.length;
        
        if (recentAvg > earlierAvg + 0.05) {
          recentTrend = 'improving';
        } else if (recentAvg < earlierAvg - 0.05) {
          recentTrend = 'declining';
        }
      }
    }
    
    return {
      interactions,
      averagePerformance,
      recentTrend
    };
  }
} 