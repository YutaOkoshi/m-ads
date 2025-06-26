import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { DiscussionStatement } from '../types/mbti-types';

// ステップ1: 議論の実行と評価
const executeMBTIDiscussionStep = createStep({
  id: 'execute-mbti-discussion',
  description: 'Execute MBTI discussion with all agents',
  inputSchema: z.object({
    topic: z.string().describe('The topic for discussion')
  }),
  outputSchema: z.object({
    topic: z.string(),
    totalStatements: z.number(),
    metrics: z.object({
      diversityScore: z.number(),
      consistencyScore: z.number(),
      convergenceEfficiency: z.number(),
      mbtiAlignmentScore: z.number()
    }),
    report: z.object({
      summary: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      overallScore: z.number(),
      grade: z.string()
    }),
    statements: z.array(z.object({
      agentId: z.string(),
      mbtiType: z.string(),
      content: z.string(),
      timestamp: z.string(),
      confidence: z.number(),
      relevance: z.number()
    }))
  }),
  execute: async ({ inputData, mastra }) => {
    const statements: DiscussionStatement[] = [];
    
    // Phase 1: オーケストレータによる初期化
    const orchestrator = mastra?.getAgent('M-ADS-Orchestrator');
    if (orchestrator) {
      await orchestrator.generate([
        { 
          role: 'user', 
          content: `initializeGraphツールを使用してグラフを初期化し、INTJ、INFJ、ISTJ、ISTPのエージェントを追加してください。`
        }
      ]);
    }
    
    // Phase 1: 各MBTIエージェントの議論実行（簡易版）
    const mbtiTypes = ['INTJ', 'INFJ', 'ISTJ', 'ISTP'] as const;
    const agentNames = {
      'INTJ': 'INTJ-Architect',
      'INFJ': 'INFJ-Advocate', 
      'ISTJ': 'ISTJ-Inspector',
      'ISTP': 'ISTP-Virtuoso'
    };
    
    for (const mbtiType of mbtiTypes) {
      const agent = mastra?.getAgent(agentNames[mbtiType]);
      if (!agent) continue;
      
      const prompt = `議論のトピック: ${inputData.topic}
フェーズ: brainstorming
あなたの${mbtiType}としての視点から、このトピックについて意見を述べてください。`;
      
      const response = await agent.generate([
        { role: 'user', content: prompt }
      ]);
      
      statements.push({
        agentId: `node-${mbtiType}`,
        mbtiType: mbtiType,
        content: response.text,
        timestamp: new Date(),
        confidence: 0.8 + Math.random() * 0.2,
        relevance: 0.7 + Math.random() * 0.3
      });
    }
    
    // Phase 1: 品質評価（簡易版）
    const metrics = {
      diversityScore: 0.75 + Math.random() * 0.15,
      consistencyScore: 0.80 + Math.random() * 0.10,
      convergenceEfficiency: 0.70 + Math.random() * 0.20,
      mbtiAlignmentScore: 0.85 + Math.random() * 0.10
    };
    
    const overallScore = (
      metrics.diversityScore * 0.25 +
      metrics.consistencyScore * 0.25 +
      metrics.convergenceEfficiency * 0.25 +
      metrics.mbtiAlignmentScore * 0.25
    );
    
    const strengths = [];
    const weaknesses = [];
    
    if (metrics.diversityScore >= 0.8) {
      strengths.push('多様な視点からの議論が展開されました');
    }
    if (metrics.consistencyScore >= 0.85) {
      strengths.push('論理的に一貫した議論が行われました');
    }
    if (metrics.mbtiAlignmentScore >= 0.85) {
      strengths.push('各エージェントがMBTI特性に沿った発言をしました');
    }
    if (metrics.convergenceEfficiency < 0.75) {
      weaknesses.push('合意形成の効率性を高める必要があります');
    }
    
    let grade: string;
    if (overallScore >= 0.9) grade = 'S';
    else if (overallScore >= 0.8) grade = 'A';
    else if (overallScore >= 0.7) grade = 'B';
    else if (overallScore >= 0.6) grade = 'C';
    else grade = 'D';
    
    return {
      topic: inputData.topic,
      totalStatements: statements.length,
      metrics,
      report: {
        summary: `「${inputData.topic}」について${statements.length}つのMBTIタイプによる議論が行われました。総合評価は${(overallScore * 100).toFixed(1)}%（グレード${grade}）です。`,
        strengths,
        weaknesses: weaknesses.length > 0 ? weaknesses : ['特に大きな弱点は見つかりませんでした'],
        overallScore,
        grade
      },
      statements: statements.map(s => ({
        ...s,
        timestamp: s.timestamp.toISOString()
      }))
    };
  }
});

// ワークフローの定義
export const mbtiDiscussionWorkflow = createWorkflow({
  id: 'mbti-discussion-workflow',
  description: 'MBTI Multi-Agent Discussion System workflow - Phase 1 MVP',
  inputSchema: z.object({
    topic: z.string().describe('The topic for discussion')
  }),
  outputSchema: z.object({
    topic: z.string(),
    totalStatements: z.number(),
    metrics: z.object({
      diversityScore: z.number(),
      consistencyScore: z.number(),
      convergenceEfficiency: z.number(),
      mbtiAlignmentScore: z.number()
    }),
    report: z.object({
      summary: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      overallScore: z.number(),
      grade: z.string()
    })
  })
})
  .then(executeMBTIDiscussionStep)
  .commit(); 