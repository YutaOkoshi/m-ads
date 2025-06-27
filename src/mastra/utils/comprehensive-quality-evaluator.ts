import type { DiscussionStatement, MBTIType, QualityMetrics } from '../types/mbti-types';
import { MBTI_CHARACTERISTICS } from './mbti-characteristics';

/**
 * 7次元品質評価システム - 最新RPA評価研究に基づく包括的評価
 */

export interface SevenDimensionQualityMetrics {
  // 1. Performance（パフォーマンス）
  performance: {
    taskCompletionRate: number;        // タスク完了率
    responseRelevance: number;         // 応答関連性
    informationAccuracy: number;       // 情報精度
    overallPerformance: number;        // 総合パフォーマンス
  };

  // 2. Psychological（心理学的評価）
  psychological: {
    personalityConsistency: number;    // 性格一貫性
    emotionalStability: number;        // 感情安定性
    cognitiveProcessing: number;       // 認知処理
    psychologicalRealism: number;      // 心理的リアリズム
  };

  // 3. External Alignment（外部整合性）
  externalAlignment: {
    expectationConformity: number;     // 期待適合性
    roleAdherence: number;             // 役割遵守
    contextualAppropriate: number;     // 文脈適切性
    externalConsistency: number;       // 外部一貫性
  };

  // 4. Internal Consistency（内部一貫性）
  internalConsistency: {
    logicalCoherence: number;          // 論理的整合性
    memoryConsistency: number;         // 記憶一貫性
    valueAlignment: number;            // 価値観整合性
    internalHarmony: number;           // 内部調和
  };

  // 5. Social Decision-making（社会的意思決定）
  socialDecisionMaking: {
    cooperationLevel: number;          // 協力レベル
    conflictResolution: number;        // 対立解決
    consensusBuilding: number;         // 合意形成
    socialIntelligence: number;        // 社会的知能
  };

  // 6. Content Quality（コンテンツ品質）
  contentQuality: {
    argumentQuality: number;           // 論証品質
    semanticDiversity: number;         // 意味的多様性
    informationRichness: number;       // 情報豊富性
    linguisticQuality: number;         // 言語品質
  };

  // 7. Ethics（倫理性）
  ethics: {
    biasAvoidance: number;             // バイアス回避
    fairnessLevel: number;             // 公平性レベル
    respectfulness: number;            // 敬意レベル
    ethicalStandard: number;           // 倫理基準
  };

  // 統合指標
  overallQuality: number;              // 総合品質
  targetAchievement: {                 // 目標達成度
    diversityTarget: boolean;          // 多様性目標（≥0.80）
    consistencyTarget: boolean;        // 一貫性目標（≥0.85）
    convergenceTarget: boolean;        // 収束目標（≥0.75）
  };
}

/**
 * 論証多様性分析
 */
interface ArgumentDiversityAnalysis {
  perspectiveDiversity: number;        // 視点多様性
  argumentTypeDiversity: number;       // 論証タイプ多様性
  semanticDiversity: number;           // 意味的多様性
  mbtiPerspectiveCoverage: number;     // MBTI視点カバレッジ
}

/**
 * NLI（自然言語推論）ベース一貫性評価
 */
interface NLIConsistencyEvaluation {
  entailmentScore: number;             // 含意スコア
  contradictionScore: number;          // 矛盾スコア
  neutralScore: number;                // 中立スコア
  overallCoherence: number;            // 全体整合性
}

/**
 * 合意形成プロセス分析
 */
interface ConsensusProcessAnalysis {
  convergenceRate: number;             // 収束率
  participationBalance: number;        // 参加バランス
  agreementEvolution: number[];        // 合意度推移
  finalConsensusStrength: number;      // 最終合意強度
}

/**
 * 7次元品質評価エンジン
 */
export class ComprehensiveQualityEvaluator {
  private cognitivePatterns: Map<string, number[]>;
  private biasDetectionKeywords: Map<string, string[]>;
  private ethicalStandards: Map<string, number>;
  
  constructor() {
    this.cognitivePatterns = this.initializeCognitivePatterns();
    this.biasDetectionKeywords = this.initializeBiasDetection();
    this.ethicalStandards = this.initializeEthicalStandards();
  }

  /**
   * 包括的品質評価の実行
   */
  async evaluateComprehensiveQuality(
    statements: DiscussionStatement[],
    discussionContext: {
      topic: string;
      duration: number;
      phase: string;
      expectedOutcome: string;
    }
  ): Promise<SevenDimensionQualityMetrics> {
    
    // 1. Performance評価
    const performance = await this.evaluatePerformance(statements, discussionContext);
    
    // 2. Psychological評価
    const psychological = await this.evaluatePsychological(statements);
    
    // 3. External Alignment評価
    const externalAlignment = await this.evaluateExternalAlignment(statements, discussionContext);
    
    // 4. Internal Consistency評価
    const internalConsistency = await this.evaluateInternalConsistency(statements);
    
    // 5. Social Decision-making評価
    const socialDecisionMaking = await this.evaluateSocialDecisionMaking(statements);
    
    // 6. Content Quality評価
    const contentQuality = await this.evaluateContentQuality(statements);
    
    // 7. Ethics評価
    const ethics = await this.evaluateEthics(statements);
    
    // 統合指標の計算
    const overallQuality = this.calculateOverallQuality({
      performance,
      psychological,
      externalAlignment,
      internalConsistency,
      socialDecisionMaking,
      contentQuality,
      ethics
    });
    
    // 目標達成度の判定
    const targetAchievement = this.evaluateTargetAchievement({
      performance,
      psychological,
      externalAlignment,
      internalConsistency,
      socialDecisionMaking,
      contentQuality,
      ethics
    });

    return {
      performance,
      psychological,
      externalAlignment,
      internalConsistency,
      socialDecisionMaking,
      contentQuality,
      ethics,
      overallQuality,
      targetAchievement
    };
  }

  /**
   * 1. Performance評価
   */
  private async evaluatePerformance(
    statements: DiscussionStatement[],
    context: any
  ): Promise<SevenDimensionQualityMetrics['performance']> {
    
    const taskCompletionRate = this.calculateTaskCompletionRate(statements, context);
    const responseRelevance = this.calculateResponseRelevance(statements, context.topic);
    const informationAccuracy = this.calculateInformationAccuracy(statements);
    
    const overallPerformance = (taskCompletionRate + responseRelevance + informationAccuracy) / 3;

    return {
      taskCompletionRate,
      responseRelevance,
      informationAccuracy,
      overallPerformance
    };
  }

  /**
   * 2. Psychological評価
   */
  private async evaluatePsychological(
    statements: DiscussionStatement[]
  ): Promise<SevenDimensionQualityMetrics['psychological']> {
    
    const personalityConsistency = this.evaluatePersonalityConsistency(statements);
    const emotionalStability = this.evaluateEmotionalStability(statements);
    const cognitiveProcessing = this.evaluateCognitiveProcessing(statements);
    
    const psychologicalRealism = (personalityConsistency + emotionalStability + cognitiveProcessing) / 3;

    return {
      personalityConsistency,
      emotionalStability,
      cognitiveProcessing,
      psychologicalRealism
    };
  }

  /**
   * 3. External Alignment評価
   */
  private async evaluateExternalAlignment(
    statements: DiscussionStatement[],
    context: any
  ): Promise<SevenDimensionQualityMetrics['externalAlignment']> {
    
    const expectationConformity = this.evaluateExpectationConformity(statements, context);
    const roleAdherence = this.evaluateRoleAdherence(statements);
    const contextualAppropriate = this.evaluateContextualAppropriateness(statements, context);
    
    const externalConsistency = (expectationConformity + roleAdherence + contextualAppropriate) / 3;

    return {
      expectationConformity,
      roleAdherence,
      contextualAppropriate,
      externalConsistency
    };
  }

  /**
   * 4. Internal Consistency評価
   */
  private async evaluateInternalConsistency(
    statements: DiscussionStatement[]
  ): Promise<SevenDimensionQualityMetrics['internalConsistency']> {
    
    const logicalCoherence = await this.evaluateLogicalCoherence(statements);
    const memoryConsistency = this.evaluateMemoryConsistency(statements);
    const valueAlignment = this.evaluateValueAlignment(statements);
    
    const internalHarmony = (logicalCoherence + memoryConsistency + valueAlignment) / 3;

    return {
      logicalCoherence,
      memoryConsistency,
      valueAlignment,
      internalHarmony
    };
  }

  /**
   * 5. Social Decision-making評価
   */
  private async evaluateSocialDecisionMaking(
    statements: DiscussionStatement[]
  ): Promise<SevenDimensionQualityMetrics['socialDecisionMaking']> {
    
    const cooperationLevel = this.evaluateCooperationLevel(statements);
    const conflictResolution = this.evaluateConflictResolution(statements);
    const consensusBuilding = await this.evaluateConsensusBuilding(statements);
    
    const socialIntelligence = (cooperationLevel + conflictResolution + consensusBuilding) / 3;

    return {
      cooperationLevel,
      conflictResolution,
      consensusBuilding,
      socialIntelligence
    };
  }

  /**
   * 6. Content Quality評価
   */
  private async evaluateContentQuality(
    statements: DiscussionStatement[]
  ): Promise<SevenDimensionQualityMetrics['contentQuality']> {
    
    const argumentQuality = this.evaluateArgumentQuality(statements);
    const semanticDiversity = await this.evaluateSemanticDiversity(statements);
    const informationRichness = this.evaluateInformationRichness(statements);
    const linguisticQuality = this.evaluateLinguisticQuality(statements);

    return {
      argumentQuality,
      semanticDiversity,
      informationRichness,
      linguisticQuality
    };
  }

  /**
   * 7. Ethics評価
   */
  private async evaluateEthics(
    statements: DiscussionStatement[]
  ): Promise<SevenDimensionQualityMetrics['ethics']> {
    
    const biasAvoidance = this.evaluateBiasAvoidance(statements);
    const fairnessLevel = this.evaluateFairnessLevel(statements);
    const respectfulness = this.evaluateRespectfulness(statements);
    
    const ethicalStandard = (biasAvoidance + fairnessLevel + respectfulness) / 3;

    return {
      biasAvoidance,
      fairnessLevel,
      respectfulness,
      ethicalStandard
    };
  }

  // 実装メソッド群（簡略化版）

  private calculateTaskCompletionRate(statements: DiscussionStatement[], context: any): number {
    const hasConclusion = statements.some(s => 
      s.content.includes('結論') || s.content.includes('まとめ') || s.content.includes('合意')
    );
    const hasSolution = statements.some(s => 
      s.content.includes('解決') || s.content.includes('提案') || s.content.includes('アプローチ')
    );
    
    return (hasConclusion ? 0.5 : 0) + (hasSolution ? 0.5 : 0);
  }

  private calculateResponseRelevance(statements: DiscussionStatement[], topic: string): number {
    if (statements.length === 0) return 0;
    
    const topicWords = topic.toLowerCase().split(/\s+/);
    let relevanceSum = 0;
    
    statements.forEach(statement => {
      const content = statement.content.toLowerCase();
      const relevantWords = topicWords.filter(word => content.includes(word));
      relevanceSum += relevantWords.length / topicWords.length;
    });
    
    return relevanceSum / statements.length;
  }

  private calculateInformationAccuracy(statements: DiscussionStatement[]): number {
    if (statements.length === 0) return 0;
    return statements.reduce((sum, s) => sum + s.confidence, 0) / statements.length;
  }

  private evaluatePersonalityConsistency(statements: DiscussionStatement[]): number {
    const typeConsistency = new Map<MBTIType, number[]>();
    
    statements.forEach(statement => {
      if (!typeConsistency.has(statement.mbtiType)) {
        typeConsistency.set(statement.mbtiType, []);
      }
      
      const alignmentScore = this.calculateMBTIAlignment(statement);
      typeConsistency.get(statement.mbtiType)!.push(alignmentScore);
    });
    
    let totalConsistency = 0;
    let typeCount = 0;
    
    typeConsistency.forEach((scores, type) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
      const consistency = 1 - Math.sqrt(variance);
      
      totalConsistency += Math.max(0, consistency);
      typeCount++;
    });
    
    return typeCount > 0 ? totalConsistency / typeCount : 0;
  }

  private evaluateEmotionalStability(statements: DiscussionStatement[]): number {
    const emotionalWords = ['怒', '悲', '喜', '驚', '恐', '嫌', '楽', '苦'];
    const emotionalScores = statements.map(statement => {
      let emotionalCount = 0;
      emotionalWords.forEach(word => {
        if (statement.content.includes(word)) emotionalCount++;
      });
      return emotionalCount / statement.content.length;
    });
    
    if (emotionalScores.length === 0) return 1;
    
    const average = emotionalScores.reduce((sum, score) => sum + score, 0) / emotionalScores.length;
    const variance = emotionalScores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / emotionalScores.length;
    
    return Math.max(0, 1 - Math.sqrt(variance) * 10);
  }

  private evaluateCognitiveProcessing(statements: DiscussionStatement[]): number {
    const cognitiveIndicators = {
      thinking: ['論理', '分析', '理由', '根拠', '証拠'],
      feeling: ['感じ', '価値', '意味', '大切', '重要'],
      sensing: ['事実', '具体', '経験', '実際', '現実'],
      intuition: ['可能', '将来', '潜在', 'アイデア', '想像']
    };
    
    let totalScore = 0;
    statements.forEach(statement => {
      let cognitiveScore = 0;
      Object.entries(cognitiveIndicators).forEach(([function_, keywords]) => {
        const keywordCount = keywords.filter(keyword => 
          statement.content.includes(keyword)
        ).length;
        cognitiveScore += keywordCount;
      });
      
      totalScore += Math.min(1, cognitiveScore / 10);
    });
    
    return statements.length > 0 ? totalScore / statements.length : 0;
  }

  private async evaluateLogicalCoherence(statements: DiscussionStatement[]): Promise<number> {
    const nliEvaluation = await this.evaluateNLIConsistency(statements);
    return nliEvaluation.overallCoherence;
  }

  private evaluateMemoryConsistency(statements: DiscussionStatement[]): number {
    let consistencyScore = 1;
    const agentStatements = new Map<string, DiscussionStatement[]>();
    
    statements.forEach(statement => {
      if (!agentStatements.has(statement.agentId)) {
        agentStatements.set(statement.agentId, []);
      }
      agentStatements.get(statement.agentId)!.push(statement);
    });
    
    agentStatements.forEach((agentStmts) => {
      if (agentStmts.length < 2) return;
      
      for (let i = 1; i < agentStmts.length; i++) {
        const similarity = this.calculateContentSimilarity(
          agentStmts[i - 1].content,
          agentStmts[i].content
        );
        
        if (similarity < 0.2) {
          consistencyScore *= 0.95;
        }
      }
    });
    
    return Math.max(0, consistencyScore);
  }

  private evaluateValueAlignment(statements: DiscussionStatement[]): number {
    const valueKeywords = new Map<MBTIType, string[]>();
    
    valueKeywords.set('INTJ', ['効率', '戦略', 'システム', '改善']);
    valueKeywords.set('INFJ', ['調和', '意味', '成長', '理解']);
    valueKeywords.set('ISTJ', ['責任', '安定', '伝統', '信頼']);
    valueKeywords.set('ISTP', ['実用', '技術', '解決', '分析']);
    
    let alignmentScore = 0;
    let count = 0;
    
    statements.forEach(statement => {
      const expectedValues = valueKeywords.get(statement.mbtiType) || [];
      let matchCount = 0;
      
      expectedValues.forEach(value => {
        if (statement.content.includes(value)) matchCount++;
      });
      
      alignmentScore += matchCount / Math.max(expectedValues.length, 1);
      count++;
    });
    
    return count > 0 ? alignmentScore / count : 0;
  }

  private evaluateCooperationLevel(statements: DiscussionStatement[]): number {
    const cooperativeWords = ['協力', '一緒', '共同', '協調', '連携', '賛成', '支持'];
    let cooperativeCount = 0;
    
    statements.forEach(statement => {
      cooperativeWords.forEach(word => {
        if (statement.content.includes(word)) cooperativeCount++;
      });
    });
    
    return Math.min(1, cooperativeCount / statements.length);
  }

  private evaluateConflictResolution(statements: DiscussionStatement[]): number {
    const conflictWords = ['反対', '違う', '問題', '課題', '矛盾'];
    const resolutionWords = ['解決', '折り合い', '妥協', '代案', '調整'];
    
    let conflictCount = 0;
    let resolutionCount = 0;
    
    statements.forEach(statement => {
      conflictWords.forEach(word => {
        if (statement.content.includes(word)) conflictCount++;
      });
      resolutionWords.forEach(word => {
        if (statement.content.includes(word)) resolutionCount++;
      });
    });
    
    return conflictCount > 0 ? resolutionCount / conflictCount : 1;
  }

  private async evaluateConsensusBuilding(statements: DiscussionStatement[]): Promise<number> {
    const processAnalysis = await this.analyzeConsensusProcess(statements);
    return processAnalysis.convergenceRate;
  }

  private evaluateArgumentQuality(statements: DiscussionStatement[]): number {
    const qualityIndicators = ['理由', '根拠', '証拠', '例', 'データ', '研究', '結果'];
    let qualityScore = 0;
    
    statements.forEach(statement => {
      let indicatorCount = 0;
      qualityIndicators.forEach(indicator => {
        if (statement.content.includes(indicator)) indicatorCount++;
      });
      qualityScore += Math.min(1, indicatorCount / 3);
    });
    
    return statements.length > 0 ? qualityScore / statements.length : 0;
  }

  private async evaluateSemanticDiversity(statements: DiscussionStatement[]): Promise<number> {
    return this.calculateAdvancedSemanticDiversity(statements);
  }

  private evaluateInformationRichness(statements: DiscussionStatement[]): number {
    let totalLength = 0;
    let uniqueWords = new Set<string>();
    
    statements.forEach(statement => {
      totalLength += statement.content.length;
      const words = statement.content.split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) uniqueWords.add(word.toLowerCase());
      });
    });
    
    const averageLength = statements.length > 0 ? totalLength / statements.length : 0;
    const vocabularyDiversity = uniqueWords.size / Math.max(totalLength / 10, 1);
    
    return Math.min(1, (averageLength / 100 + vocabularyDiversity) / 2);
  }

  private evaluateLinguisticQuality(statements: DiscussionStatement[]): number {
    let qualitySum = 0;
    
    statements.forEach(statement => {
      const hasPunctuation = /[。！？]/.test(statement.content);
      const hasConnectors = /[そして|しかし|また|さらに|一方]/.test(statement.content);
      const appropriateLength = statement.content.length >= 20 && statement.content.length <= 200;
      
      let score = 0;
      if (hasPunctuation) score += 0.4;
      if (hasConnectors) score += 0.3;
      if (appropriateLength) score += 0.3;
      
      qualitySum += score;
    });
    
    return statements.length > 0 ? qualitySum / statements.length : 0;
  }

  private evaluateBiasAvoidance(statements: DiscussionStatement[]): number {
    const biasWords = ['絶対', '必ず', '当然', '明らか', '常に', '決して'];
    let biasCount = 0;
    let totalWords = 0;
    
    statements.forEach(statement => {
      const words = statement.content.split(/\s+/);
      totalWords += words.length;
      biasWords.forEach(bias => {
        if (statement.content.includes(bias)) biasCount++;
      });
    });
    
    return Math.max(0, 1 - (biasCount / Math.max(totalWords / 50, 1)));
  }

  private evaluateFairnessLevel(statements: DiscussionStatement[]): number {
    return this.calculateParticipationBalance(statements);
  }

  private evaluateRespectfulness(statements: DiscussionStatement[]): number {
    const respectfulWords = ['思います', 'と考え', 'かもしれ', 'でしょう', 'いかが'];
    const disrespectfulWords = ['馬鹿', 'おかしい', '間違い', 'だめ'];
    
    let respectfulCount = 0;
    let disrespectfulCount = 0;
    
    statements.forEach(statement => {
      respectfulWords.forEach(word => {
        if (statement.content.includes(word)) respectfulCount++;
      });
      disrespectfulWords.forEach(word => {
        if (statement.content.includes(word)) disrespectfulCount++;
      });
    });
    
    const respectfulRatio = respectfulCount / Math.max(statements.length, 1);
    const disrespectfulPenalty = disrespectfulCount / Math.max(statements.length, 1);
    
    return Math.max(0, respectfulRatio - disrespectfulPenalty);
  }

  // ユーティリティメソッド群

  private calculateOverallQuality(metrics: any): number {
    const weights = {
      performance: 0.2,
      psychological: 0.15,
      externalAlignment: 0.15,
      internalConsistency: 0.2,
      socialDecisionMaking: 0.15,
      contentQuality: 0.1,
      ethics: 0.05
    };
    
    return (
      metrics.performance.overallPerformance * weights.performance +
      metrics.psychological.psychologicalRealism * weights.psychological +
      metrics.externalAlignment.externalConsistency * weights.externalAlignment +
      metrics.internalConsistency.internalHarmony * weights.internalConsistency +
      metrics.socialDecisionMaking.socialIntelligence * weights.socialDecisionMaking +
      metrics.contentQuality.semanticDiversity * weights.contentQuality +
      metrics.ethics.ethicalStandard * weights.ethics
    );
  }

  private evaluateTargetAchievement(metrics: any): SevenDimensionQualityMetrics['targetAchievement'] {
    const diversityScore = metrics.contentQuality.semanticDiversity;
    const consistencyScore = metrics.internalConsistency.internalHarmony;
    const convergenceScore = metrics.socialDecisionMaking.consensusBuilding;
    
    return {
      diversityTarget: diversityScore >= 0.80,
      consistencyTarget: consistencyScore >= 0.85,
      convergenceTarget: convergenceScore >= 0.75
    };
  }

  private async evaluateNLIConsistency(statements: DiscussionStatement[]): Promise<NLIConsistencyEvaluation> {
    let entailmentScore = 0;
    let contradictionScore = 0;
    let neutralScore = 0;
    let totalPairs = 0;

    for (let i = 0; i < statements.length - 1; i++) {
      for (let j = i + 1; j < statements.length; j++) {
        const relation = this.analyzeStatementRelation(statements[i], statements[j]);
        
        if (relation === 'entailment') entailmentScore++;
        else if (relation === 'contradiction') contradictionScore++;
        else neutralScore++;
        
        totalPairs++;
      }
    }

    if (totalPairs === 0) {
      return {
        entailmentScore: 0,
        contradictionScore: 0,
        neutralScore: 0,
        overallCoherence: 0
      };
    }

    const normalizedEntailment = entailmentScore / totalPairs;
    const normalizedContradiction = contradictionScore / totalPairs;
    const normalizedNeutral = neutralScore / totalPairs;
    
    const overallCoherence = normalizedEntailment - (normalizedContradiction * 0.8) + (normalizedNeutral * 0.3);

    return {
      entailmentScore: normalizedEntailment,
      contradictionScore: normalizedContradiction,
      neutralScore: normalizedNeutral,
      overallCoherence: Math.max(0, Math.min(1, overallCoherence))
    };
  }

  private async analyzeConsensusProcess(statements: DiscussionStatement[]): Promise<ConsensusProcessAnalysis> {
    const agreementEvolution = this.trackAgreementEvolution(statements);
    const convergenceRate = this.calculateConvergenceRate(agreementEvolution);
    const participationBalance = this.calculateParticipationBalance(statements);
    const finalConsensusStrength = agreementEvolution[agreementEvolution.length - 1] || 0;

    return {
      convergenceRate,
      participationBalance,
      agreementEvolution,
      finalConsensusStrength
    };
  }

  private async calculateAdvancedSemanticDiversity(statements: DiscussionStatement[]): Promise<number> {
    if (statements.length < 2) return 0;
    
    const documents = statements.map(s => s.content);
    const allWords = new Set<string>();
    
    documents.forEach(doc => {
      const words = doc.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      words.forEach(word => allWords.add(word));
    });
    
    let diversity = 0;
    allWords.forEach(word => {
      const docCount = documents.filter(doc => doc.includes(word)).length;
      const idf = Math.log(documents.length / docCount);
      diversity += idf;
    });
    
    return Math.min(1, diversity / (allWords.size * Math.log(documents.length)));
  }

  // その他のユーティリティメソッド（簡略化実装）
  private calculateMBTIAlignment(statement: DiscussionStatement): number {
    return 0.8;
  }

  private calculateContentSimilarity(content1: string, content2: string): number {
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    
    let commonWords = 0;
    words1.forEach(word => {
      if (words2.has(word)) commonWords++;
    });
    
    return commonWords / Math.max(words1.size, words2.size);
  }

  private analyzeStatementRelation(stmt1: DiscussionStatement, stmt2: DiscussionStatement): string {
    const content1 = stmt1.content.toLowerCase();
    const content2 = stmt2.content.toLowerCase();
    
    const contradictionWords = ['しかし', 'でも', '反対', '違う'];
    const entailmentWords = ['そして', 'また', 'さらに', '同様'];
    
    const hasContradiction = contradictionWords.some(word => content2.includes(word));
    const hasEntailment = entailmentWords.some(word => content2.includes(word));
    
    if (hasContradiction) return 'contradiction';
    if (hasEntailment) return 'entailment';
    return 'neutral';
  }

  private trackAgreementEvolution(statements: DiscussionStatement[]): number[] {
    const evolution = [];
    let cumulativeAgreement = 0.5;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.content.includes('賛成') || statement.content.includes('同意')) {
        cumulativeAgreement = Math.min(1, cumulativeAgreement + 0.1);
      } else if (statement.content.includes('反対') || statement.content.includes('違う')) {
        cumulativeAgreement = Math.max(0, cumulativeAgreement - 0.1);
      }
      
      evolution.push(cumulativeAgreement);
    }
    
    return evolution;
  }

  private calculateConvergenceRate(agreementEvolution: number[]): number {
    if (agreementEvolution.length < 2) return 0;
    
    const start = agreementEvolution[0];
    const end = agreementEvolution[agreementEvolution.length - 1];
    const improvement = end - start;
    
    let stability = 1;
    for (let i = 1; i < agreementEvolution.length; i++) {
      const change = Math.abs(agreementEvolution[i] - agreementEvolution[i - 1]);
      if (change > 0.2) stability *= 0.9;
    }
    
    return Math.max(0, improvement * stability);
  }

  private calculateParticipationBalance(statements: DiscussionStatement[]): number {
    const participation = new Map<string, number>();
    
    statements.forEach(statement => {
      participation.set(statement.agentId, (participation.get(statement.agentId) || 0) + 1);
    });
    
    if (participation.size < 2) return 1;
    
    const values = Array.from(participation.values());
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return min / max;
  }

  private evaluateExpectationConformity(statements: DiscussionStatement[], context: any): number {
    return 0.8;
  }

  private evaluateRoleAdherence(statements: DiscussionStatement[]): number {
    return 0.85;
  }

  private evaluateContextualAppropriateness(statements: DiscussionStatement[], context: any): number {
    return 0.8;
  }

  private initializeCognitivePatterns(): Map<string, number[]> {
    return new Map();
  }

  private initializeBiasDetection(): Map<string, string[]> {
    return new Map([
      ['confirmation', ['確信', '間違いない', '明らか']],
      ['anchoring', ['最初', '第一印象', '基準']],
      ['availability', ['最近', '思い出す', '記憶']]
    ]);
  }

  private initializeEthicalStandards(): Map<string, number> {
    return new Map([
      ['respect', 0.8],
      ['fairness', 0.8],
      ['transparency', 0.7]
    ]);
  }
} 