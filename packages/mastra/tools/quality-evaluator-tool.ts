import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import type { DiscussionStatement, QualityMetrics } from '../types/mbti-types';
import { MBTI_CHARACTERISTICS } from '../utils/mbti-characteristics';
import type { 
  SevenDimensionQualityMetrics 
} from '../utils/comprehensive-quality-evaluator';
import { 
  ComprehensiveQualityEvaluator 
} from '../utils/comprehensive-quality-evaluator';

// 7次元品質評価エンジンのインスタンス
const comprehensiveEvaluator = new ComprehensiveQualityEvaluator();

// セマンティック多様性の計算（簡易版 - 後方互換性）
function calculateSemanticDiversity(statements: DiscussionStatement[]): number {
  if (statements.length < 2) return 0;
  
  // 単語の出現頻度に基づく簡易的な多様性計算
  const wordFrequency = new Map<string, number>();
  let totalWords = 0;
  
  statements.forEach(statement => {
    const words = statement.content.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 3) { // 短い単語を除外
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        totalWords++;
      }
    });
  });
  
  // Shannon entropyを計算
  let entropy = 0;
  wordFrequency.forEach(count => {
    const probability = count / totalWords;
    entropy -= probability * Math.log2(probability);
  });
  
  // 正規化（0-1の範囲に）
  return Math.min(entropy / Math.log2(wordFrequency.size), 1);
}

// 論理的一貫性の評価（簡易版 - 後方互換性）
function evaluateLogicalConsistency(statements: DiscussionStatement[]): number {
  if (statements.length < 2) return 1;
  
  let consistencyScore = 1;
  
  // 連続する発言間の関連性をチェック
  for (let i = 1; i < statements.length; i++) {
    const prev = statements[i - 1].content.toLowerCase();
    const curr = statements[i].content.toLowerCase();
    
    // 共通単語の割合を計算
    const prevWords = new Set(prev.split(/\s+/).filter(w => w.length > 3));
    const currWords = new Set(curr.split(/\s+/).filter(w => w.length > 3));
    
    let commonWords = 0;
    prevWords.forEach(word => {
      if (currWords.has(word)) commonWords++;
    });
    
    const similarity = commonWords / Math.max(prevWords.size, currWords.size);
    
    // 関連性が低すぎる場合はペナルティ
    if (similarity < 0.1) {
      consistencyScore *= 0.9;
    }
  }
  
  return Math.max(consistencyScore, 0.5);
}

// MBTI特性との整合性評価（全16タイプ対応）
function evaluateMBTIAlignment(statements: DiscussionStatement[]): number {
  if (statements.length === 0) return 0;
  
  let alignmentScore = 0;
  let count = 0;
  
  statements.forEach(statement => {
    const characteristics = MBTI_CHARACTERISTICS[statement.mbtiType];
    if (!characteristics) return;
    
    // 簡易的なキーワードマッチング（全16タイプ対応）
    const content = statement.content.toLowerCase();
    let matches = 0;
    
    // 各MBTIタイプの特徴的なキーワードをチェック
    switch (statement.mbtiType) {
      // NT (Rational)
      case 'INTJ':
        if (content.includes('戦略') || content.includes('システム') || content.includes('効率')) matches++;
        break;
      case 'INTP':
        if (content.includes('理論') || content.includes('論理') || content.includes('可能性')) matches++;
        break;
      case 'ENTJ':
        if (content.includes('目標') || content.includes('リーダーシップ') || content.includes('結果')) matches++;
        break;
      case 'ENTP':
        if (content.includes('革新') || content.includes('議論') || content.includes('創造')) matches++;
        break;
      
      // NF (Idealist)
      case 'INFJ':
        if (content.includes('価値') || content.includes('意味') || content.includes('人')) matches++;
        break;
      case 'INFP':
        if (content.includes('個人的') || content.includes('真正') || content.includes('理想')) matches++;
        break;
      case 'ENFJ':
        if (content.includes('調和') || content.includes('成長') || content.includes('協力')) matches++;
        break;
      case 'ENFP':
        if (content.includes('可能性') || content.includes('インスピレーション') || content.includes('創造')) matches++;
        break;
      
      // SJ (Guardian)
      case 'ISTJ':
        if (content.includes('事実') || content.includes('経験') || content.includes('具体')) matches++;
        break;
      case 'ISFJ':
        if (content.includes('配慮') || content.includes('支援') || content.includes('協力')) matches++;
        break;
      case 'ESTJ':
        if (content.includes('組織') || content.includes('効率') || content.includes('実績')) matches++;
        break;
      case 'ESFJ':
        if (content.includes('調和') || content.includes('協力') || content.includes('責任')) matches++;
        break;
      
      // SP (Artisan)
      case 'ISTP':
        if (content.includes('実用') || content.includes('解決') || content.includes('分析')) matches++;
        break;
      case 'ISFP':
        if (content.includes('個人的') || content.includes('美的') || content.includes('体験')) matches++;
        break;
      case 'ESTP':
        if (content.includes('行動') || content.includes('現実') || content.includes('実用')) matches++;
        break;
      case 'ESFP':
        if (content.includes('楽しく') || content.includes('人との') || content.includes('前向き')) matches++;
        break;
    }
    
    alignmentScore += (matches > 0 ? 1 : 0.5);
    count++;
  });
  
  return count > 0 ? alignmentScore / count : 0;
}

export const evaluateDiscussionQualityTool = createTool({
  id: 'evaluateDiscussionQuality',
  description: 'Evaluate the quality of the discussion based on multiple metrics',
  inputSchema: z.object({
    statements: z.array(z.object({
      agentId: z.string(),
      mbtiType: z.enum([
        'INTJ', 'INTP', 'ENTJ', 'ENTP',  // NT
        'INFJ', 'INFP', 'ENFJ', 'ENFP',  // NF
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',  // SJ
        'ISTP', 'ISFP', 'ESTP', 'ESFP'   // SP
      ] as const),
      content: z.string(),
      timestamp: z.string(), // ISO string
      confidence: z.number(),
      relevance: z.number()
    }))
  }),
  outputSchema: z.object({
    metrics: z.object({
      diversityScore: z.number(),
      consistencyScore: z.number(),
      convergenceEfficiency: z.number(),
      mbtiAlignmentScore: z.number(),
      argumentQuality: z.number(),
      participationBalance: z.number(),
      resolutionRate: z.number(),
      timestamp: z.string()
    }),
    analysis: z.object({
      totalStatements: z.number(),
      averageConfidence: z.number(),
      averageRelevance: z.number(),
      participationBalance: z.number()
    })
  }),
  execute: async ({ context }) => {
    const statements: DiscussionStatement[] = context.statements.map(s => ({
      ...s,
      timestamp: new Date(s.timestamp)
    }));
    
    // 各メトリクスを計算
    const diversityScore = calculateSemanticDiversity(statements);
    const consistencyScore = evaluateLogicalConsistency(statements);
    const mbtiAlignmentScore = evaluateMBTIAlignment(statements);
    
    // 参加バランスを計算
    const participationMap = new Map<string, number>();
    statements.forEach(s => {
      participationMap.set(s.mbtiType, (participationMap.get(s.mbtiType) || 0) + 1);
    });
    
    const participationValues = Array.from(participationMap.values());
    const maxParticipation = Math.max(...participationValues);
    const minParticipation = Math.min(...participationValues);
    const participationBalance = minParticipation / maxParticipation;
    
    // 収束効率を計算
    const averageConfidence = statements.reduce((sum, s) => sum + s.confidence, 0) / statements.length;
    const averageRelevance = statements.reduce((sum, s) => sum + s.relevance, 0) / statements.length;
    const convergenceEfficiency = (averageConfidence + averageRelevance + participationBalance) / 3;
    
    // 新しい指標を追加
    const argumentQuality = calculateArgumentQuality(statements);
    const resolutionRate = calculateResolutionRate(statements);
    
    const metrics: QualityMetrics = {
      diversityScore,
      consistencyScore,
      convergenceEfficiency,
      mbtiAlignmentScore,
      argumentQuality,
      participationBalance,
      resolutionRate,
      timestamp: new Date()
    };
    
    return {
      metrics: {
        ...metrics,
        timestamp: metrics.timestamp.toISOString()
      },
      analysis: {
        totalStatements: statements.length,
        averageConfidence,
        averageRelevance,
        participationBalance
      }
    };
  }
});

export const evaluateComprehensiveQualityTool = createTool({
  id: 'evaluateComprehensiveQuality',
  description: 'Evaluate discussion quality using advanced 7-dimension RPA evaluation framework',
  inputSchema: z.object({
    statements: z.array(z.object({
      agentId: z.string(),
      mbtiType: z.enum([
        'INTJ', 'INTP', 'ENTJ', 'ENTP',  // NT
        'INFJ', 'INFP', 'ENFJ', 'ENFP',  // NF
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',  // SJ
        'ISTP', 'ISFP', 'ESTP', 'ESFP'   // SP
      ] as const),
      content: z.string(),
      timestamp: z.string(),
      confidence: z.number(),
      relevance: z.number()
    })),
    context: z.object({
      topic: z.string(),
      duration: z.number(),
      phase: z.string(),
      expectedOutcome: z.string()
    })
  }),
  outputSchema: z.object({
    sevenDimensionMetrics: z.object({
      performance: z.object({
        taskCompletionRate: z.number(),
        responseRelevance: z.number(),
        informationAccuracy: z.number(),
        overallPerformance: z.number()
      }),
      psychological: z.object({
        personalityConsistency: z.number(),
        emotionalStability: z.number(),
        cognitiveProcessing: z.number(),
        psychologicalRealism: z.number()
      }),
      externalAlignment: z.object({
        expectationConformity: z.number(),
        roleAdherence: z.number(),
        contextualAppropriate: z.number(),
        externalConsistency: z.number()
      }),
      internalConsistency: z.object({
        logicalCoherence: z.number(),
        memoryConsistency: z.number(),
        valueAlignment: z.number(),
        internalHarmony: z.number()
      }),
      socialDecisionMaking: z.object({
        cooperationLevel: z.number(),
        conflictResolution: z.number(),
        consensusBuilding: z.number(),
        socialIntelligence: z.number()
      }),
      contentQuality: z.object({
        argumentQuality: z.number(),
        semanticDiversity: z.number(),
        informationRichness: z.number(),
        linguisticQuality: z.number()
      }),
      ethics: z.object({
        biasAvoidance: z.number(),
        fairnessLevel: z.number(),
        respectfulness: z.number(),
        ethicalStandard: z.number()
      }),
      overallQuality: z.number(),
      targetAchievement: z.object({
        diversityTarget: z.boolean(),
        consistencyTarget: z.boolean(),
        convergenceTarget: z.boolean()
      })
    }),
    qualityAssessment: z.object({
      overallGrade: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      recommendations: z.array(z.string()),
      targetStatus: z.object({
        diversityMet: z.boolean(),
        consistencyMet: z.boolean(),
        convergenceMet: z.boolean(),
        allTargetsMet: z.boolean()
      })
    })
  }),
  execute: async ({ context }) => {
    const statements: DiscussionStatement[] = context.statements.map(s => ({
      ...s,
      timestamp: new Date(s.timestamp)
    }));
    
    // 7次元品質評価を実行
    const sevenDimensionMetrics = await comprehensiveEvaluator.evaluateComprehensiveQuality(
      statements,
      context.context
    );
    
    // 品質アセスメントを生成
    const qualityAssessment = generateQualityAssessment(sevenDimensionMetrics);
    
    return {
      sevenDimensionMetrics,
      qualityAssessment
    };
  }
});

export const analyzeArgumentDiversityTool = createTool({
  id: 'analyzeArgumentDiversity',
  description: 'Analyze argument diversity including perspective, semantic, and MBTI coverage',
  inputSchema: z.object({
    statements: z.array(z.object({
      agentId: z.string(),
      mbtiType: z.enum([
        'INTJ', 'INTP', 'ENTJ', 'ENTP',  // NT
        'INFJ', 'INFP', 'ENFJ', 'ENFP',  // NF
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',  // SJ
        'ISTP', 'ISFP', 'ESTP', 'ESFP'   // SP
      ] as const),
      content: z.string(),
      timestamp: z.string(),
      confidence: z.number(),
      relevance: z.number()
    }))
  }),
  outputSchema: z.object({
    diversityAnalysis: z.object({
      perspectiveDiversity: z.number(),
      argumentTypeDiversity: z.number(),
      semanticDiversity: z.number(),
      mbtiCoverage: z.object({
        totalTypes: z.number(),
        ntCoverage: z.number(),
        nfCoverage: z.number(),
        sjCoverage: z.number(),
        spCoverage: z.number(),
        balanceScore: z.number()
      }),
      overallDiversityScore: z.number()
    }),
    recommendations: z.array(z.object({
      category: z.string(),
      suggestion: z.string(),
      priority: z.string()
    }))
  }),
  execute: async ({ context }) => {
    const statements: DiscussionStatement[] = context.statements.map(s => ({
      ...s,
      timestamp: new Date(s.timestamp)
    }));
    
    // 多様性分析を実行
    const diversityAnalysis = analyzeStatementDiversity(statements);
    
    // 改善提案を生成
    const recommendations = generateDiversityRecommendations(diversityAnalysis);
    
    return {
      diversityAnalysis,
      recommendations
    };
  }
});

export const trackConsensusEvolutionTool = createTool({
  id: 'trackConsensusEvolution',
  description: 'Track consensus evolution and convergence patterns throughout the discussion',
  inputSchema: z.object({
    statements: z.array(z.object({
      agentId: z.string(),
      mbtiType: z.enum([
        'INTJ', 'INTP', 'ENTJ', 'ENTP',  // NT
        'INFJ', 'INFP', 'ENFJ', 'ENFP',  // NF
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',  // SJ
        'ISTP', 'ISFP', 'ESTP', 'ESFP'   // SP
      ] as const),
      content: z.string(),
      timestamp: z.string(),
      confidence: z.number(),
      relevance: z.number()
    }))
  }),
  outputSchema: z.object({
    consensusEvolution: z.object({
      timelineData: z.array(z.object({
        timestamp: z.string(),
        consensusLevel: z.number(),
        participationBalance: z.number(),
        agreementScore: z.number(),
        conflictLevel: z.number()
      })),
      convergenceMetrics: z.object({
        finalConsensusStrength: z.number(),
        convergenceRate: z.number(),
        stabilityScore: z.number(),
        participationEquity: z.number()
      }),
      phaseAnalysis: z.object({
        peakConsensusPhase: z.string(),
        mostContentiousPhase: z.string(),
        convergencePhase: z.string(),
        consensusQuality: z.string()
      })
    })
  }),
  execute: async ({ context }) => {
    const statements: DiscussionStatement[] = context.statements.map(s => ({
      ...s,
      timestamp: new Date(s.timestamp)
    }));
    
    // 合意形成の進化を追跡
    const consensusEvolution = trackConsensusTimeline(statements);
    
    return {
      consensusEvolution
    };
  }
});

export const compareQualityMetricsTool = createTool({
  id: 'compareQualityMetrics',
  description: 'Compare quality metrics between different discussion phases',
  inputSchema: z.object({
    metrics1: z.object({
      diversityScore: z.number(),
      consistencyScore: z.number(),
      convergenceEfficiency: z.number(),
      mbtiAlignmentScore: z.number()
    }),
    metrics2: z.object({
      diversityScore: z.number(),
      consistencyScore: z.number(),
      convergenceEfficiency: z.number(),
      mbtiAlignmentScore: z.number()
    })
  }),
  outputSchema: z.object({
    improvements: z.object({
      diversityImprovement: z.number(),
      consistencyImprovement: z.number(),
      convergenceImprovement: z.number(),
      mbtiAlignmentImprovement: z.number()
    }),
    overallImprovement: z.number(),
    recommendation: z.string()
  }),
  execute: async ({ context }) => {
    const improvements = {
      diversityImprovement: context.metrics2.diversityScore - context.metrics1.diversityScore,
      consistencyImprovement: context.metrics2.consistencyScore - context.metrics1.consistencyScore,
      convergenceImprovement: context.metrics2.convergenceEfficiency - context.metrics1.convergenceEfficiency,
      mbtiAlignmentImprovement: context.metrics2.mbtiAlignmentScore - context.metrics1.mbtiAlignmentScore
    };
    
    const overallImprovement = Object.values(improvements).reduce((sum, val) => sum + val, 0) / 4;
    
    let recommendation = '';
    if (improvements.diversityImprovement < -0.1) {
      recommendation = '多様性が低下しています。異なる視点からの発言を促してください。';
    } else if (improvements.consistencyImprovement < -0.1) {
      recommendation = '論理的一貫性が低下しています。議論の流れを整理してください。';
    } else if (improvements.convergenceImprovement < -0.1) {
      recommendation = '収束効率が低下しています。合意形成に向けた議論を促してください。';
    } else if (overallImprovement > 0.1) {
      recommendation = '議論の品質が向上しています。現在の方向性を維持してください。';
    } else {
      recommendation = '議論は安定していますが、さらなる深化が可能です。';
    }
    
    return {
      improvements,
      overallImprovement,
      recommendation
    };
  }
});

export const generateQualityReportTool = createTool({
  id: 'generateQualityReport',
  description: 'Generate a comprehensive quality report for the discussion',
  inputSchema: z.object({
    topic: z.string(),
    metrics: z.object({
      diversityScore: z.number(),
      consistencyScore: z.number(),
      convergenceEfficiency: z.number(),
      mbtiAlignmentScore: z.number()
    }),
    totalStatements: z.number(),
    duration: z.number() // in minutes
  }),
  outputSchema: z.object({
    report: z.object({
      summary: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      overallScore: z.number(),
      grade: z.string()
    })
  }),
  execute: async ({ context }) => {
    const overallScore = (
      context.metrics.diversityScore * 0.25 +
      context.metrics.consistencyScore * 0.25 +
      context.metrics.convergenceEfficiency * 0.25 +
      context.metrics.mbtiAlignmentScore * 0.25
    );
    
    const strengths = [];
    const weaknesses = [];
    
    // 強みと弱みを特定
    if (context.metrics.diversityScore >= 0.8) {
      strengths.push('多様な視点からの議論が展開されました');
    } else if (context.metrics.diversityScore < 0.6) {
      weaknesses.push('視点の多様性が不足しています');
    }
    
    if (context.metrics.consistencyScore >= 0.85) {
      strengths.push('論理的に一貫した議論が行われました');
    } else if (context.metrics.consistencyScore < 0.7) {
      weaknesses.push('論理的一貫性に改善の余地があります');
    }
    
    if (context.metrics.convergenceEfficiency >= 0.75) {
      strengths.push('効率的に合意形成が進みました');
    } else if (context.metrics.convergenceEfficiency < 0.6) {
      weaknesses.push('合意形成の効率性を高める必要があります');
    }
    
    if (context.metrics.mbtiAlignmentScore >= 0.85) {
      strengths.push('各エージェントがMBTI特性に沿った発言をしました');
    } else if (context.metrics.mbtiAlignmentScore < 0.7) {
      weaknesses.push('MBTI特性の再現性を向上させる必要があります');
    }
    
    // グレード判定
    let grade: string;
    if (overallScore >= 0.9) grade = 'S';
    else if (overallScore >= 0.8) grade = 'A';
    else if (overallScore >= 0.7) grade = 'B';
    else if (overallScore >= 0.6) grade = 'C';
    else grade = 'D';
    
    const summary = `「${context.topic}」についての議論は、${context.duration}分間で${context.totalStatements}件の発言を通じて行われました。` +
      `総合評価は${(overallScore * 100).toFixed(1)}%（グレード${grade}）です。`;
    
    return {
      report: {
        summary,
        strengths,
        weaknesses,
        overallScore,
        grade
      }
    };
  }
});

// ヘルパー関数

interface TimelineDataPoint {
  timestamp: string;
  consensusLevel: number;
  participationBalance: number;
  agreementScore: number;
  conflictLevel: number;
}

function calculateArgumentQuality(statements: DiscussionStatement[]): number {
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

function calculateResolutionRate(statements: DiscussionStatement[]): number {
  const resolutionWords = ['解決', '結論', '合意', '決定', 'まとめ'];
  let resolutionCount = 0;
  
  statements.forEach(statement => {
    resolutionWords.forEach(word => {
      if (statement.content.includes(word)) resolutionCount++;
    });
  });
  
  return Math.min(1, resolutionCount / Math.max(statements.length * 0.2, 1));
}

function generateQualityAssessment(metrics: SevenDimensionQualityMetrics) {
  const overallScore = metrics.overallQuality;
  
  // グレード判定
  let overallGrade: string;
  if (overallScore >= 0.9) overallGrade = 'S (優秀)';
  else if (overallScore >= 0.8) overallGrade = 'A (良好)';
  else if (overallScore >= 0.7) overallGrade = 'B (標準)';
  else if (overallScore >= 0.6) overallGrade = 'C (改善要)';
  else overallGrade = 'D (要改善)';
  
  // 強みの特定
  const strengths = [];
  if (metrics.performance.overallPerformance >= 0.8) {
    strengths.push('タスクパフォーマンスが優秀');
  }
  if (metrics.psychological.psychologicalRealism >= 0.8) {
    strengths.push('心理的リアリズムが高い');
  }
  if (metrics.internalConsistency.internalHarmony >= 0.85) {
    strengths.push('内部一貫性が優秀');
  }
  if (metrics.contentQuality.semanticDiversity >= 0.8) {
    strengths.push('意味的多様性が豊富');
  }
  if (metrics.ethics.ethicalStandard >= 0.8) {
    strengths.push('高い倫理基準を維持');
  }
  
  // 弱みの特定
  const weaknesses = [];
  if (metrics.performance.overallPerformance < 0.6) {
    weaknesses.push('タスクパフォーマンスの向上が必要');
  }
  if (metrics.psychological.psychologicalRealism < 0.7) {
    weaknesses.push('心理的リアリズムの改善が必要');
  }
  if (metrics.internalConsistency.internalHarmony < 0.75) {
    weaknesses.push('内部一貫性の強化が必要');
  }
  if (metrics.contentQuality.semanticDiversity < 0.7) {
    weaknesses.push('議論の多様性を高める必要');
  }
  if (metrics.socialDecisionMaking.socialIntelligence < 0.7) {
    weaknesses.push('社会的知能の向上が必要');
  }
  
  // 改善提案
  const recommendations = [];
  if (!metrics.targetAchievement.diversityTarget) {
    recommendations.push('より多様な視点を促進するため、異なるMBTIタイプの発言を均等に促す');
  }
  if (!metrics.targetAchievement.consistencyTarget) {
    recommendations.push('論理的一貫性向上のため、NLIベース評価に基づく発言品質管理を強化');
  }
  if (!metrics.targetAchievement.convergenceTarget) {
    recommendations.push('合意形成効率向上のため、段階的コンセンサス構築プロセスを導入');
  }
  
  return {
    overallGrade,
    strengths,
    weaknesses,
    recommendations,
    targetStatus: {
      diversityMet: metrics.targetAchievement.diversityTarget,
      consistencyMet: metrics.targetAchievement.consistencyTarget,
      convergenceMet: metrics.targetAchievement.convergenceTarget,
      allTargetsMet: metrics.targetAchievement.diversityTarget && 
                     metrics.targetAchievement.consistencyTarget && 
                     metrics.targetAchievement.convergenceTarget
    }
  };
}

function analyzeStatementDiversity(statements: DiscussionStatement[]) {
  // 視点多様性
  const perspectives = new Set(statements.map(s => s.mbtiType));
  const perspectiveDiversity = perspectives.size / 16;
  
  // MBTI カバレッジ分析
  const groups = { NT: 0, NF: 0, SJ: 0, SP: 0 };
  statements.forEach(s => {
    const characteristics = MBTI_CHARACTERISTICS[s.mbtiType];
    if (characteristics) {
      groups[characteristics.group]++;
    }
  });
  
  const totalStatements = statements.length;
  const mbtiCoverage = {
    totalTypes: perspectives.size,
    ntCoverage: groups.NT / totalStatements,
    nfCoverage: groups.NF / totalStatements,
    sjCoverage: groups.SJ / totalStatements,
    spCoverage: groups.SP / totalStatements,
    balanceScore: 0
  };
  
  // バランススコアの計算（理想は各グループ0.25）
  const ideal = 0.25;
  const deviations = [
    Math.abs(mbtiCoverage.ntCoverage - ideal),
    Math.abs(mbtiCoverage.nfCoverage - ideal),
    Math.abs(mbtiCoverage.sjCoverage - ideal),
    Math.abs(mbtiCoverage.spCoverage - ideal)
  ];
  mbtiCoverage.balanceScore = 1 - (deviations.reduce((sum, dev) => sum + dev, 0) / 4);
  
  // 論証タイプ多様性（簡略化）
  const argumentTypes = ['factual', 'logical', 'emotional', 'experiential'];
  const detectedTypes = new Set<string>();
  
  statements.forEach(statement => {
    if (statement.content.includes('事実') || statement.content.includes('データ')) {
      detectedTypes.add('factual');
    }
    if (statement.content.includes('論理') || statement.content.includes('理由')) {
      detectedTypes.add('logical');
    }
    if (statement.content.includes('感じ') || statement.content.includes('気持ち')) {
      detectedTypes.add('emotional');
    }
    if (statement.content.includes('経験') || statement.content.includes('体験')) {
      detectedTypes.add('experiential');
    }
  });
  
  const argumentTypeDiversity = detectedTypes.size / argumentTypes.length;
  
  // セマンティック多様性（簡易版）
  const semanticDiversity = calculateSemanticDiversity(statements);
  
  // 総合多様性スコア
  const overallDiversityScore = (perspectiveDiversity + argumentTypeDiversity + semanticDiversity + mbtiCoverage.balanceScore) / 4;
  
  return {
    perspectiveDiversity,
    argumentTypeDiversity,
    semanticDiversity,
    mbtiCoverage,
    overallDiversityScore
  };
}

function generateDiversityRecommendations(diversity: any) {
  const recommendations = [];
  
  if (diversity.perspectiveDiversity < 0.5) {
    recommendations.push({
      category: 'MBTI多様性',
      suggestion: 'より多くのMBTIタイプの参加を促進する',
      priority: 'high'
    });
  }
  
  if (diversity.argumentTypeDiversity < 0.6) {
    recommendations.push({
      category: '論証多様性',
      suggestion: '感情的・体験的論証を含む多様な論証タイプを促進する',
      priority: 'medium'
    });
  }
  
  if (diversity.mbtiCoverage.balanceScore < 0.6) {
    recommendations.push({
      category: '参加バランス',
      suggestion: 'すべてのMBTIグループ（NT, NF, SJ, SP）の均等な参加を促進する',
      priority: 'high'
    });
  }
  
  if (diversity.semanticDiversity < 0.7) {
    recommendations.push({
      category: '意味的多様性',
      suggestion: 'より多様な語彙と概念を使用した議論を促進する',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

function trackConsensusTimeline(statements: DiscussionStatement[]) {
  const timelineData: TimelineDataPoint[] = [];
  let cumulativeConsensus = 0.5;
  const cumulativeParticipation = new Map<string, number>();
  
  statements.forEach((statement, index) => {
    // 合意レベルの追跡
    if (statement.content.includes('賛成') || statement.content.includes('同意')) {
      cumulativeConsensus = Math.min(1, cumulativeConsensus + 0.1);
    } else if (statement.content.includes('反対') || statement.content.includes('違う')) {
      cumulativeConsensus = Math.max(0, cumulativeConsensus - 0.1);
    }
    
    // 参加バランスの追跡
    cumulativeParticipation.set(statement.agentId, (cumulativeParticipation.get(statement.agentId) || 0) + 1);
    const participationValues = Array.from(cumulativeParticipation.values());
    const participationBalance = participationValues.length > 1 ? 
      Math.min(...participationValues) / Math.max(...participationValues) : 1;
    
    // 合意スコアの計算
    const agreementScore = statement.confidence * statement.relevance;
    
    // 対立レベルの計算
    const conflictWords = ['反対', '違う', '問題', '課題'];
    let conflictLevel = 0;
    conflictWords.forEach(word => {
      if (statement.content.includes(word)) conflictLevel += 0.25;
    });
    
    timelineData.push({
      timestamp: statement.timestamp.toISOString(),
      consensusLevel: cumulativeConsensus,
      participationBalance,
      agreementScore,
      conflictLevel: Math.min(1, conflictLevel)
    });
  });
  
  // 収束メトリクスの計算
  const finalConsensusStrength = timelineData[timelineData.length - 1]?.consensusLevel || 0;
  const initialConsensus = timelineData[0]?.consensusLevel || 0.5;
  const convergenceRate = (finalConsensusStrength - initialConsensus) / Math.max(timelineData.length / 10, 1);
  
  // 安定性スコアの計算
  let stabilityScore = 1;
  for (let i = 1; i < timelineData.length; i++) {
    const change = Math.abs(timelineData[i].consensusLevel - timelineData[i - 1].consensusLevel);
    if (change > 0.2) stabilityScore *= 0.95;
  }
  
  // 参加公平性の計算
  const participationEquity = timelineData[timelineData.length - 1]?.participationBalance || 0;
  
  // フェーズ分析
  const consensusLevels = timelineData.map(d => d.consensusLevel);
  const conflictLevels = timelineData.map(d => d.conflictLevel);
  
  const peakConsensusIndex = consensusLevels.indexOf(Math.max(...consensusLevels));
  const highestConflictIndex = conflictLevels.indexOf(Math.max(...conflictLevels));
  
  const peakConsensusPhase = peakConsensusIndex < timelineData.length * 0.33 ? 'early' : 
                             peakConsensusIndex < timelineData.length * 0.66 ? 'middle' : 'late';
  const mostContentiousPhase = highestConflictIndex < timelineData.length * 0.33 ? 'early' : 
                               highestConflictIndex < timelineData.length * 0.66 ? 'middle' : 'late';
  
  let consensusQuality: string;
  if (finalConsensusStrength >= 0.8 && stabilityScore >= 0.8) {
    consensusQuality = 'excellent';
  } else if (finalConsensusStrength >= 0.6 && stabilityScore >= 0.7) {
    consensusQuality = 'good';
  } else if (finalConsensusStrength >= 0.4) {
    consensusQuality = 'fair';
  } else {
    consensusQuality = 'poor';
  }
  
  return {
    timelineData,
    convergenceMetrics: {
      finalConsensusStrength,
      convergenceRate,
      stabilityScore,
      participationEquity
    },
    phaseAnalysis: {
      peakConsensusPhase,
      mostContentiousPhase,
      convergencePhase: finalConsensusStrength > initialConsensus ? 'convergent' : 'divergent',
      consensusQuality
    }
  };
} 