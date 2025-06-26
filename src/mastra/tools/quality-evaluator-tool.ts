import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { DiscussionStatement, QualityMetrics } from '../types/mbti-types';
import { MBTI_CHARACTERISTICS } from '../utils/mbti-characteristics';

// セマンティック多様性の計算（簡易版）
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

// 論理的一貫性の評価（簡易版）
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

// MBTI特性との整合性評価
function evaluateMBTIAlignment(statements: DiscussionStatement[]): number {
  if (statements.length === 0) return 0;
  
  let alignmentScore = 0;
  let count = 0;
  
  statements.forEach(statement => {
    const characteristics = MBTI_CHARACTERISTICS[statement.mbtiType];
    if (!characteristics) return;
    
    // 簡易的なキーワードマッチング
    const content = statement.content.toLowerCase();
    let matches = 0;
    
    // 各MBTIタイプの特徴的なキーワードをチェック
    if (statement.mbtiType === 'INTJ') {
      if (content.includes('戦略') || content.includes('システム') || content.includes('効率')) matches++;
    } else if (statement.mbtiType === 'INFJ') {
      if (content.includes('価値') || content.includes('意味') || content.includes('人')) matches++;
    } else if (statement.mbtiType === 'ISTJ') {
      if (content.includes('事実') || content.includes('経験') || content.includes('具体')) matches++;
    } else if (statement.mbtiType === 'ISTP') {
      if (content.includes('実用') || content.includes('解決') || content.includes('分析')) matches++;
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
      mbtiType: z.enum(['INTJ', 'INFJ', 'ISTJ', 'ISTP'] as const),
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
    
    const metrics: QualityMetrics = {
      diversityScore,
      consistencyScore,
      convergenceEfficiency,
      mbtiAlignmentScore,
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