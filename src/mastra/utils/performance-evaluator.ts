import type { MBTIType, DiscussionStatement } from '../types/mbti-types';
import type { ComprehensiveQualityEvaluator } from './comprehensive-quality-evaluator';

/**
 * パフォーマンスフィードバック結果の型定義
 */
export interface PerformanceFeedback {
  overallScore: number;
  feedback: string;
  improvementSuggestions: string[];
  sevenDimensionEvaluation: StatementLevel7DimensionEvaluation;
  detailedAnalysis: {
    strengths: string[];
    weaknesses: string[];
    specificImprovements: string[];
    nextSpeechGuidance: string;
  };
  mbtiAlignment: {
    alignmentScore: number;
    expectedCharacteristics: string[];
    demonstratedCharacteristics: string[];
    alignmentGap: string[];
  };
  progressTracking: {
    improvementTrend: 'improving' | 'stable' | 'declining';
    consistencyScore: number;
    recommendedFocus: string[];
  };
}

/**
 * パフォーマンス評価フィードバックシステム
 * 信頼度、関連性、フェーズ適応性、MBTI適応性を総合評価
 */
export function generatePerformanceFeedback(
  confidence: number,
  relevance: number,
  phaseAlignment: number,
  mbtiAlignment: number
): PerformanceFeedback {
  const overallScore = (confidence * 0.3 + relevance * 0.3 + phaseAlignment * 0.2 + mbtiAlignment * 0.2);

  const suggestions: string[] = [];
  if (confidence < 0.7) {
    suggestions.push('より具体的な根拠や詳細な分析を含めてください');
  }
  if (relevance < 0.7) {
    suggestions.push('議論トピックにより直接的に関連する内容を含めてください');
  }
  if (phaseAlignment < 0.7) {
    suggestions.push('現在の議論フェーズに適した発言スタイルを心がけてください');
  }
  if (mbtiAlignment < 0.7) {
    suggestions.push('あなたのMBTIタイプの特性をより活かした視点を提供してください');
  }

  let feedback = '';
  if (overallScore >= 0.85) {
    feedback = '優秀な発言でした。議論に大きく貢献しています。';
  } else if (overallScore >= 0.75) {
    feedback = '良い発言でした。さらなる改善の余地があります。';
  } else if (overallScore >= 0.65) {
    feedback = '標準的な発言でした。改善点を意識してください。';
  } else {
    feedback = '発言の質を向上させる必要があります。以下の改善点を参考にしてください。';
  }

  return {
    overallScore,
    feedback,
    improvementSuggestions: suggestions,
    sevenDimensionEvaluation: {
      performance: 0,
      psychological: 0,
      externalAlignment: 0,
      internalConsistency: 0,
      socialDecisionMaking: 0,
      contentQuality: 0,
      ethics: 0,
      overallQuality: 0
    },
    detailedAnalysis: {
      strengths: [],
      weaknesses: [],
      specificImprovements: [],
      nextSpeechGuidance: ''
    },
    mbtiAlignment: {
      alignmentScore: 0,
      expectedCharacteristics: [],
      demonstratedCharacteristics: [],
      alignmentGap: []
    },
    progressTracking: {
      improvementTrend: 'stable',
      consistencyScore: 0.8,
      recommendedFocus: []
    }
  };
}

/**
 * 参加パターンの分析結果
 */
export interface ParticipationPattern {
  balanced: boolean;
  qualityProgression: boolean;
}

/**
 * 参加パターン分析
 * 発言の偏りと品質の向上パターンを分析
 */
export function analyzeParticipationPattern(statements: DiscussionStatement[]): ParticipationPattern {
  const typeParticipation = new Map<string, number>();
  statements.forEach(s => {
    typeParticipation.set(s.mbtiType, (typeParticipation.get(s.mbtiType) || 0) + 1);
  });

  const participationValues = Array.from(typeParticipation.values());
  const balanced = participationValues.length > 0 &&
    (Math.max(...participationValues) / Math.min(...participationValues)) <= 2;

  // 品質進行分析
  const firstHalf = statements.slice(0, Math.floor(statements.length / 2));
  const secondHalf = statements.slice(Math.floor(statements.length / 2));

  const firstHalfAvgConfidence = firstHalf.reduce((sum, s) => sum + s.confidence, 0) / firstHalf.length;
  const secondHalfAvgConfidence = secondHalf.reduce((sum, s) => sum + s.confidence, 0) / secondHalf.length;

  const qualityProgression = secondHalfAvgConfidence > firstHalfAvgConfidence + 0.05;

  return { balanced, qualityProgression };
}

/**
 * 確信度進行分析
 * 議論の進行に伴う確信度の変化を分析
 */
export function analyzeConfidenceProgression(statements: DiscussionStatement[]): number {
  if (statements.length < 4) return 0;

  const firstQuarter = statements.slice(0, Math.floor(statements.length / 4));
  const lastQuarter = statements.slice(-Math.floor(statements.length / 4));

  const firstAvg = firstQuarter.reduce((sum, s) => sum + s.confidence, 0) / firstQuarter.length;
  const lastAvg = lastQuarter.reduce((sum, s) => sum + s.confidence, 0) / lastQuarter.length;

  return lastAvg - firstAvg;
}

/**
 * 相互作用密度分析
 * 発言の時間間隔から相互作用の密度を推定
 */
export function analyzeInteractionDensity(statements: DiscussionStatement[]): number {
  // 簡易的な相互作用密度計算（発言の時間間隔や内容の相互参照度合いから推定）
  const timeIntervals = [];
  for (let i = 1; i < statements.length; i++) {
    const interval = statements[i].timestamp.getTime() - statements[i - 1].timestamp.getTime();
    timeIntervals.push(interval);
  }

  if (timeIntervals.length === 0) return 0.5;

  const avgInterval = timeIntervals.reduce((sum, interval) => sum + interval, 0) / timeIntervals.length;
  const shortIntervals = timeIntervals.filter(interval => interval < avgInterval * 0.8).length;

  return shortIntervals / timeIntervals.length;
}

/**
 * 実際の内容に基づく評価スコア計算
 * Math.random()を使用せず、実際のコンテンツ品質を評価
 */
export function evaluateContentQuality(content: string, topic: string, mbtiType: MBTIType): {
  confidence: number;
  relevance: number;
  phaseAlignment: number;
  mbtiAlignment: number;
} {
  // 内容の長さと品質キーワードに基づく確信度計算
  const contentLength = content.length;
  const hasKeywords = /論理|分析|理由|根拠|証拠|価値|意味|協力|解決|提案|合意|結論/.test(content);
  const confidence = Math.min(0.95, 0.7 + (contentLength / 500) * 0.2 + (hasKeywords ? 0.1 : 0));

  // トピック関連性の計算
  const topicWords = topic.toLowerCase().split(/\s+/);
  const contentWords = content.toLowerCase();
  const relevantMatches = topicWords.filter(word => contentWords.includes(word)).length;
  const relevance = Math.min(0.95, 0.6 + (relevantMatches / topicWords.length) * 0.3);

  // フェーズ適応性（デフォルト値）
  const phaseAlignment = 0.8;

  // MBTI適応性（デフォルト値）
  const mbtiAlignment = 0.8;

  return {
    confidence,
    relevance,
    phaseAlignment,
    mbtiAlignment
  };
}

// 🆕 発言単位での7次元品質評価
export interface StatementLevel7DimensionEvaluation {
  performance: number;
  psychological: number;
  externalAlignment: number;
  internalConsistency: number;
  socialDecisionMaking: number;
  contentQuality: number;
  ethics: number;
  overallQuality: number;
}

// 🆕 発言単位の7次元品質評価実行
async function evaluateStatementWith7Dimensions(
  statement: string,
  topic: string,
  mbtiType: MBTIType,
  previousStatements: DiscussionStatement[],
  qualityEvaluator?: ComprehensiveQualityEvaluator
): Promise<StatementLevel7DimensionEvaluation> {
  if (!qualityEvaluator) {
    // フォールバック：基本的な評価
    return {
      performance: 0.8,
      psychological: 0.8,
      externalAlignment: 0.8,
      internalConsistency: 0.8,
      socialDecisionMaking: 0.8,
      contentQuality: 0.8,
      ethics: 0.9,
      overallQuality: 0.8
    };
  }

  try {
    // 擬似的な発言セットを作成（現在の発言を含む）
    const mockStatement: DiscussionStatement = {
      agentId: `node-${mbtiType}`,
      mbtiType: mbtiType,
      content: statement,
      timestamp: new Date(),
      confidence: 0.8,
      relevance: 0.8
    };

    const statementsForEvaluation = [...previousStatements.slice(-3), mockStatement];

    const evaluation = await qualityEvaluator.evaluateComprehensiveQuality(
      statementsForEvaluation,
      {
        topic: topic,
        duration: 60, // 仮の継続時間
        phase: 'statement-level',
        expectedOutcome: 'quality improvement'
      }
    );

    return {
      performance: evaluation.performance.overallPerformance,
      psychological: evaluation.psychological.psychologicalRealism,
      externalAlignment: evaluation.externalAlignment.externalConsistency,
      internalConsistency: evaluation.internalConsistency.internalHarmony,
      socialDecisionMaking: evaluation.socialDecisionMaking.socialIntelligence,
      contentQuality: evaluation.contentQuality.argumentQuality,
      ethics: evaluation.ethics.ethicalStandard,
      overallQuality: evaluation.overallQuality
    };
  } catch (error) {
    console.warn('7次元品質評価でエラーが発生しました:', error);
    // エラー時のフォールバック
    return {
      performance: 0.7,
      psychological: 0.7,
      externalAlignment: 0.7,
      internalConsistency: 0.7,
      socialDecisionMaking: 0.7,
      contentQuality: 0.7,
      ethics: 0.8,
      overallQuality: 0.7
    };
  }
}

// 🆕 7次元評価結果に基づく具体的フィードバック生成
function generate7DimensionFeedback(evaluation: StatementLevel7DimensionEvaluation): {
  strengths: string[];
  improvements: string[];
  guidance: string;
} {
  const strengths: string[] = [];
  const improvements: string[] = [];

  // 各次元の評価を分析
  if (evaluation.performance >= 0.8) {
    strengths.push('タスク達成度が高い');
  } else if (evaluation.performance < 0.6) {
    improvements.push('タスクへの貢献度を高めてください');
  }

  if (evaluation.psychological >= 0.8) {
    strengths.push('MBTI特性がよく表現されている');
  } else if (evaluation.psychological < 0.6) {
    improvements.push('MBTI特性をより明確に表現してください');
  }

  if (evaluation.contentQuality >= 0.8) {
    strengths.push('論理的で質の高い内容');
  } else if (evaluation.contentQuality < 0.6) {
    improvements.push('論理性と具体性を向上させてください');
  }

  if (evaluation.socialDecisionMaking >= 0.8) {
    strengths.push('協調性と合意形成に貢献');
  } else if (evaluation.socialDecisionMaking < 0.6) {
    improvements.push('他者との協調と合意形成を意識してください');
  }

  if (evaluation.ethics >= 0.8) {
    strengths.push('倫理的で偏見のない発言');
  } else if (evaluation.ethics < 0.7) {
    improvements.push('より公平で倫理的な表現を心がけてください');
  }

  // 総合ガイダンス生成
  let guidance = '';
  if (evaluation.overallQuality >= 0.85) {
    guidance = '7次元すべてで高品質な発言です。この水準を維持してください。';
  } else if (evaluation.overallQuality >= 0.75) {
    guidance = `7次元評価で良好な結果です。特に${improvements.length > 0 ? improvements[0] : '継続的な改善'}に注力してください。`;
  } else {
    guidance = `7次元評価で改善の余地があります。${improvements.slice(0, 2).join('、')}を重点的に改善してください。`;
  }

  return { strengths, improvements, guidance };
}

// 🆕 発言履歴を活用した詳細フィードバック生成（7次元統合版）
export async function generateDetailedStatementFeedback(
  currentStatement: string,
  topic: string,
  mbtiType: MBTIType,
  previousStatements: string[],
  previousFeedbacks: PerformanceFeedback[],
  discussionContext: {
    phase: string;
    turnNumber: number;
    recentStatements: Array<{ content: string; mbtiType: string; }>;
  },
  // 🆕 7次元品質評価エンジンを追加
  qualityEvaluator?: ComprehensiveQualityEvaluator,
  // 🆕 前の発言のDiscussionStatement形式
  previousDiscussionStatements?: DiscussionStatement[]
): Promise<PerformanceFeedback> {
  // 現在の発言品質を評価
  const qualityScores = evaluateContentQuality(currentStatement, topic, mbtiType);

  // 🚀 発言単位での7次元品質評価を実行
  const sevenDimensionEvaluation = await evaluateStatementWith7Dimensions(
    currentStatement,
    topic,
    mbtiType,
    previousDiscussionStatements || [],
    qualityEvaluator
  );

  // 基本的なパフォーマンスフィードバックを生成
  const baseFeedback = generatePerformanceFeedback(
    qualityScores.confidence,
    qualityScores.relevance,
    qualityScores.phaseAlignment,
    qualityScores.mbtiAlignment
  );

  // 🔍 発言の詳細分析
  const detailedAnalysis = analyzeStatementInDetail(
    currentStatement,
    topic,
    mbtiType,
    discussionContext
  );

  // 🎯 MBTI特性との整合性分析
  const mbtiAlignment = analyzeMBTIAlignment(currentStatement, mbtiType, discussionContext);

  // 📈 進捗追跡分析
  const progressTracking = analyzeProgressTrend(
    previousFeedbacks,
    qualityScores,
    discussionContext.turnNumber
  );

  // 🎭 7次元評価結果に基づくフィードバック
  const sevenDimFeedback = generate7DimensionFeedback(sevenDimensionEvaluation);

  // 🚀 次回発言への具体的ガイダンス生成（7次元統合）
  const nextSpeechGuidance = generateNext7DimensionGuidance(
    detailedAnalysis,
    mbtiAlignment,
    progressTracking,
    sevenDimFeedback,
    discussionContext
  );

  // 総合スコアに7次元評価を反映
  const combinedScore = (baseFeedback.overallScore + sevenDimensionEvaluation.overallQuality) / 2;

  return {
    ...baseFeedback,
    overallScore: combinedScore,
    sevenDimensionEvaluation,
    detailedAnalysis: {
      strengths: [...detailedAnalysis.strengths, ...sevenDimFeedback.strengths],
      weaknesses: [...detailedAnalysis.weaknesses, ...sevenDimFeedback.improvements],
      specificImprovements: [...detailedAnalysis.specificImprovements, ...sevenDimFeedback.improvements],
      nextSpeechGuidance
    },
    mbtiAlignment,
    progressTracking
  };
}

// 🔍 発言の詳細分析
function analyzeStatementInDetail(
  statement: string,
  topic: string,
  mbtiType: MBTIType,
  context: { phase: string; turnNumber: number; recentStatements: Array<{ content: string; mbtiType: string; }> }
): { strengths: string[]; weaknesses: string[]; specificImprovements: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const specificImprovements: string[] = [];

  // 長さ分析
  const wordCount = statement.split(/\s+/).length;
  if (wordCount >= 20 && wordCount <= 100) {
    strengths.push('適切な発言長で簡潔にまとめられている');
  } else if (wordCount < 20) {
    weaknesses.push('発言が短すぎて内容が不十分');
    specificImprovements.push('より詳細な説明や具体例を追加してください');
  } else if (wordCount > 100) {
    weaknesses.push('発言が長すぎて焦点が散漫');
    specificImprovements.push('要点を絞って簡潔に表現してください');
  }

  // 具体性分析
  const hasSpecificExamples = /例えば|具体的に|実際に|たとえば/.test(statement);
  const hasNumbers = /\d+/.test(statement);
  if (hasSpecificExamples || hasNumbers) {
    strengths.push('具体的な例や数値を含む説得力のある発言');
  } else {
    weaknesses.push('抽象的すぎて具体性に欠ける');
    specificImprovements.push('具体的な事例や数値データを含めてください');
  }

  // 議論への貢献度分析
  const buildingOnOthers = /〜に関して|〜の意見に|前の発言で|先ほどの/.test(statement);
  if (buildingOnOthers) {
    strengths.push('他の参加者の発言を踏まえた建設的な議論');
  } else if (context.turnNumber > 3) {
    weaknesses.push('他の参加者の発言との連携が不足');
    specificImprovements.push('前の発言を参考にして議論を発展させてください');
  }

  // 質問・提案の有無
  const hasQuestions = /\?|でしょうか|はどうでしょう/.test(statement);
  const hasProposals = /提案|おすすめ|〜べき|〜したらどうか/.test(statement);
  if (hasQuestions) {
    strengths.push('議論を深める質問を含んでいる');
  }
  if (hasProposals) {
    strengths.push('建設的な提案を含んでいる');
  }

  // フェーズ適合性
  const phaseKeywords = {
    'initial': ['私の考え', '個人的に', '私は'],
    'interaction': ['どう思いますか', 'みなさん', '意見を聞かせて'],
    'synthesis': ['まとめると', '総合的に', '統合すると'],
    'consensus': ['合意', '結論', '決定']
  };

  const currentPhaseKeywords = phaseKeywords[context.phase as keyof typeof phaseKeywords] || [];
  const hasPhaseKeywords = currentPhaseKeywords.some(keyword => statement.includes(keyword));

  if (hasPhaseKeywords) {
    strengths.push(`${context.phase}フェーズに適した表現を使用`);
  } else {
    weaknesses.push(`${context.phase}フェーズの特徴が反映されていない`);
    specificImprovements.push(`${context.phase}フェーズに適した表現（${currentPhaseKeywords.join('、')}など）を使用してください`);
  }

  return { strengths, weaknesses, specificImprovements };
}

// 🎯 MBTI特性との整合性分析
function analyzeMBTIAlignment(
  statement: string,
  mbtiType: MBTIType,
  context: { phase: string; recentStatements: Array<{ content: string; mbtiType: string; }> }
): {
  alignmentScore: number;
  expectedCharacteristics: string[];
  demonstratedCharacteristics: string[];
  alignmentGap: string[];
} {
  const mbtiCharacteristics: Record<MBTIType, { expected: string[]; indicators: string[] }> = {
    'INTJ': {
      expected: ['戦略的思考', '長期的視点', '構造的分析', '独創的アイデア'],
      indicators: ['戦略', '長期的', '体系的', '革新的', '効率']
    },
    'INFJ': {
      expected: ['直感的洞察', '人間理解', '理想的ビジョン', '価値観重視'],
      indicators: ['直感的', '人々の', '理想', '価値観', '意味']
    },
    'INFP': {
      expected: ['個人的価値観', '創造性', '柔軟性', '共感性'],
      indicators: ['個人的に', '感じる', '創造的', '柔軟', '共感']
    },
    'INTP': {
      expected: ['論理的分析', '概念的思考', '独立性', '知的好奇心'],
      indicators: ['論理的', '分析', '概念', '理論', '探求']
    },
    'ENTJ': {
      expected: ['リーダーシップ', '効率性', '目標達成', '組織化'],
      indicators: ['リーダー', '効率', '目標', '組織', '実現']
    },
    'ENTP': {
      expected: ['革新性', '可能性探求', '議論好き', '適応性'],
      indicators: ['新しい', '可能性', '議論', '適応', 'アイデア']
    },
    'ENFJ': {
      expected: ['人間関係重視', '協調性', 'インスピレーション', '成長支援'],
      indicators: ['みんな', '協力', 'インスピレーション', '成長', '支援']
    },
    'ENFP': {
      expected: ['熱意', '創造性', '人とのつながり', '新しい体験'],
      indicators: ['熱心', '創造', 'つながり', '新しい', '体験']
    },
    'ISTJ': {
      expected: ['実用性', '責任感', '詳細重視', '伝統尊重'],
      indicators: ['実用的', '責任', '詳細', '伝統', '確実']
    },
    'ISFJ': {
      expected: ['他者への配慮', '実用的支援', '安定性', '協調性'],
      indicators: ['配慮', '支援', '安定', '協調', '他者']
    },
    'ISTP': {
      expected: ['実践的問題解決', '技術的スキル', '独立性', '効率性'],
      indicators: ['実践的', '技術', '独立', '効率', '問題解決']
    },
    'ISFP': {
      expected: ['個人的価値観', '芸術性', '柔軟性', '真正性'],
      indicators: ['価値観', '芸術', '柔軟', '真正', '個人']
    },
    'ESTP': {
      expected: ['行動力', '現実主義', '適応性', '社交性'],
      indicators: ['行動', '現実', '適応', '社交', '実際']
    },
    'ESFP': {
      expected: ['人との関わり', '楽観性', '柔軟性', '体験重視'],
      indicators: ['人と', '楽観', '柔軟', '体験', '楽しい']
    },
    'ESTJ': {
      expected: ['組織運営', '効率性', '責任感', '実用性'],
      indicators: ['組織', '効率', '責任', '実用', '管理']
    },
    'ESFJ': {
      expected: ['協調性', '他者への配慮', '実用的支援', '安定性'],
      indicators: ['協調', '配慮', '支援', '安定', 'みなさん']
    }
  };

  const characteristics = mbtiCharacteristics[mbtiType] || { expected: [], indicators: [] };
  const expected = characteristics.expected;
  const indicators = characteristics.indicators;

  // 発言中のMBTI指標の検出
  const demonstratedCharacteristics: string[] = [];
  let matchCount = 0;

  indicators.forEach((indicator: string) => {
    if (statement.includes(indicator)) {
      matchCount++;
      // 対応する期待特性を見つける
      const charIndex = indicators.indexOf(indicator);
      if (charIndex < expected.length) {
        demonstratedCharacteristics.push(expected[charIndex]);
      }
    }
  });

  const alignmentScore = matchCount / Math.max(indicators.length, 1);

  // 不足している特性を特定
  const alignmentGap: string[] = [];
  expected.forEach((char: string) => {
    if (!demonstratedCharacteristics.includes(char)) {
      alignmentGap.push(char);
    }
  });

  return {
    alignmentScore,
    expectedCharacteristics: expected,
    demonstratedCharacteristics,
    alignmentGap
  };
}

// 📈 進捗追跡分析
function analyzeProgressTrend(
  previousFeedbacks: PerformanceFeedback[],
  currentQuality: { confidence: number; relevance: number; phaseAlignment: number; mbtiAlignment: number },
  turnNumber: number
): {
  improvementTrend: 'improving' | 'stable' | 'declining';
  consistencyScore: number;
  recommendedFocus: string[];
} {
  if (previousFeedbacks.length < 2) {
    return {
      improvementTrend: 'stable',
      consistencyScore: 0.8,
      recommendedFocus: ['基本的な発言品質の維持']
    };
  }

  // 最近の3つのフィードバックを分析
  const recentFeedbacks = previousFeedbacks.slice(-3);
  const scores = recentFeedbacks.map(f => f.overallScore);
  const currentScore = (currentQuality.confidence + currentQuality.relevance +
    currentQuality.phaseAlignment + currentQuality.mbtiAlignment) / 4;

  // トレンド分析
  let improvementTrend: 'improving' | 'stable' | 'declining';
  if (scores.length >= 2) {
    const lastScore = scores[scores.length - 1];
    const improvement = currentScore - lastScore;

    if (improvement > 0.1) {
      improvementTrend = 'improving';
    } else if (improvement < -0.1) {
      improvementTrend = 'declining';
    } else {
      improvementTrend = 'stable';
    }
  } else {
    improvementTrend = 'stable';
  }

  // 一貫性スコア計算
  const consistency = scores.length > 1 ?
    1 - (Math.max(...scores) - Math.min(...scores)) : 0.8;

  // 推奨フォーカス
  const recommendedFocus: string[] = [];

  if (currentQuality.confidence < 0.7) {
    recommendedFocus.push('発言の自信と確信度向上');
  }
  if (currentQuality.relevance < 0.7) {
    recommendedFocus.push('トピックとの関連性強化');
  }
  if (currentQuality.phaseAlignment < 0.7) {
    recommendedFocus.push('議論フェーズへの適応改善');
  }
  if (currentQuality.mbtiAlignment < 0.7) {
    recommendedFocus.push('MBTI特性の表現強化');
  }

  if (improvementTrend === 'declining') {
    recommendedFocus.push('品質低下の原因分析と改善');
  }

  return {
    improvementTrend,
    consistencyScore: consistency,
    recommendedFocus
  };
}

// 🚀 7次元統合版：次回発言への具体的ガイダンス生成
function generateNext7DimensionGuidance(
  detailedAnalysis: { strengths: string[]; weaknesses: string[]; specificImprovements: string[] },
  mbtiAlignment: { alignmentScore: number; alignmentGap: string[] },
  progressTracking: { improvementTrend: 'improving' | 'stable' | 'declining'; recommendedFocus: string[] },
  sevenDimFeedback: { strengths: string[]; improvements: string[]; guidance: string },
  context: { phase: string; turnNumber: number }
): string {
  let guidance = sevenDimFeedback.guidance + ' ';

  // 改善トレンドに基づく基本方針
  if (progressTracking.improvementTrend === 'improving') {
    guidance += '前回から改善が見られます。この調子を維持しつつ、';
  } else if (progressTracking.improvementTrend === 'declining') {
    guidance += '品質が低下しています。7次元品質評価の結果を参考に、';
  } else {
    guidance += '安定した品質を保っています。7次元評価で、';
  }

  // 7次元評価の改善点を優先
  if (sevenDimFeedback.improvements.length > 0) {
    const topImprovement = sevenDimFeedback.improvements[0];
    guidance += `特に${topImprovement}。`;
  }

  // MBTI特性の強化
  if (mbtiAlignment.alignmentScore < 0.7 && mbtiAlignment.alignmentGap.length > 0) {
    const missingChar = mbtiAlignment.alignmentGap[0];
    guidance += `また、${missingChar}の特性をより明確に表現してください。`;
  }

  return guidance;
}
