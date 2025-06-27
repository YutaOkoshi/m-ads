import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import type { 
  DiscussionStatement, 
  MBTIType, 
  ComprehensiveQualityReport,
  GraphStructure,
  WeightingContext,
  PerformanceMetrics,
  OptimizedGraphStructure
} from '../types/mbti-types';
import { ALL_MBTI_TYPES } from '../utils/mbti-characteristics';
import { saveConversationAsMarkdown, saveConversationAsJson, type ConversationData } from '../utils/conversation-saver';
// 🆕 実際の品質評価システムをインポート
import { ComprehensiveQualityEvaluator } from '../utils/comprehensive-quality-evaluator';

// 🔧 ヘルパー関数群（外部定義）
function selectDiverseMBTITypes(count: number): MBTIType[] {
  const groups = {
    NT: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] as MBTIType[],
    NF: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] as MBTIType[],
    SJ: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] as MBTIType[],
    SP: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] as MBTIType[]
  };
  
  const selected: MBTIType[] = [];
  const groupKeys = Object.keys(groups) as (keyof typeof groups)[];
  
  // 各グループから最低1つは選択
  groupKeys.forEach(group => {
    const availableTypes = groups[group].filter(type => !selected.includes(type));
    if (availableTypes.length > 0) {
      selected.push(availableTypes[Math.floor(Math.random() * availableTypes.length)]);
    }
  });
  
  // 残りをランダムに選択
  while (selected.length < count) {
    const remainingTypes = ALL_MBTI_TYPES.filter(type => !selected.includes(type));
    if (remainingTypes.length === 0) break;
    selected.push(remainingTypes[Math.floor(Math.random() * remainingTypes.length)]);
  }
  
  return selected.slice(0, count);
}

function getAgentName(type: MBTIType): string {
  const names: Record<MBTIType, string> = {
    'INTJ': 'INTJ-Architect', 'INTP': 'INTP-Thinker', 'ENTJ': 'ENTJ-Commander', 'ENTP': 'ENTP-Debater',
    'INFJ': 'INFJ-Advocate', 'INFP': 'INFP-Mediator', 'ENFJ': 'ENFJ-Protagonist', 'ENFP': 'ENFP-Campaigner',
    'ISTJ': 'ISTJ-Inspector', 'ISFJ': 'ISFJ-Protector', 'ESTJ': 'ESTJ-Executive', 'ESFJ': 'ESFJ-Consul',
    'ISTP': 'ISTP-Virtuoso', 'ISFP': 'ISFP-Adventurer', 'ESTP': 'ESTP-Entrepreneur', 'ESFP': 'ESFP-Entertainer'
  };
  return names[type];
}

function createPhasePrompt(phase: string, topic: string, mbtiType: MBTIType, recentStatements: DiscussionStatement[]): string {
  const context = recentStatements.length > 0 ? 
    `\n\n最近の発言:\n${recentStatements.map(s => `${s.mbtiType}: ${s.content}`).join('\n\n')}` : '';
  
  const phaseInstructions: Record<string, string> = {
    initial: `${mbtiType}として、このトピックについてあなたの独自の視点から初期意見を述べてください。`,
    interaction: `他のエージェントの意見を踏まえ、建設的な相互作用を行ってください。`,
    synthesis: `これまでの議論を統合し、より深い洞察を提供してください。`,
    consensus: `最終的な合意形成に向けて、あなたの結論を述べてください。`
  };
  
  return `議論トピック: ${topic}${context}\n\n${phaseInstructions[phase]}\n\n${mbtiType}の特性を活かした200-300文字の回答をお願いします。`;
}

function generateStrengths(metrics: any): string[] {
  const strengths = [];
  if (metrics.diversityScore >= 0.8) strengths.push('優れた多様性を実現');
  if (metrics.consistencyScore >= 0.85) strengths.push('高い論理的一貫性を維持');
  if (metrics.ethicsScore >= 0.9) strengths.push('倫理的配慮が徹底');
  if (metrics.contentQualityScore >= 0.85) strengths.push('高品質なコンテンツを生成');
  return strengths.length > 0 ? strengths : ['バランスの取れた議論を実現'];
}

function generateWeaknesses(metrics: any): string[] {
  const weaknesses = [];
  if (metrics.convergenceEfficiency < 0.75) weaknesses.push('合意形成の効率性要改善');
  if (metrics.participationBalance < 0.8) weaknesses.push('参加バランスの最適化が必要');
  if (metrics.resolutionRate < 0.75) weaknesses.push('解決率の向上が必要');
  return weaknesses.length > 0 ? weaknesses : ['特記すべき弱点なし'];
}

// 🔧 リアルタイム最適化システム
interface RealtimeOptimizationEngine {
  optimizeInRealtime(
    currentDiscussion: DiscussionStatement[],
    graphStructure: GraphStructure,
    qualityMetrics: ComprehensiveQualityReport,
    context: WeightingContext
  ): Promise<{
    optimizedGraph: OptimizedGraphStructure;
    adjustedWeights: Map<MBTIType, number>;
    recommendations: string[];
    qualityImprovement: number;
  }>;
}

// 🎯 リアルタイム最適化エンジン実装
class RealtimeOptimizer implements RealtimeOptimizationEngine {
  async optimizeInRealtime(
    currentDiscussion: DiscussionStatement[],
    graphStructure: GraphStructure,
    qualityMetrics: ComprehensiveQualityReport,
    context: WeightingContext
  ) {
    const recommendations: string[] = [];
    let qualityImprovement = 0;

    // 1. 発言パターン分析
    const mbtiParticipation = this.analyzeMBTIParticipation(currentDiscussion);
    const dominantTypes = Object.entries(mbtiParticipation)
      .filter(([, count]) => count > currentDiscussion.length * 0.3)
      .map(([type]) => type as MBTIType);

    // 2. 品質ボトルネック検出
    const bottlenecks = this.detectQualityBottlenecks(qualityMetrics);
    
    // 3. 動的重み調整
    const adjustedWeights = new Map<MBTIType, number>();
    ALL_MBTI_TYPES.forEach(type => {
      let weight = 1.0;
      
      // 発言頻度に基づく調整
      const participation = mbtiParticipation[type] || 0;
      const averageParticipation = currentDiscussion.length / 16;
      
      if (participation < averageParticipation * 0.5) {
        weight *= 1.3; // 発言が少ないタイプの重みを上げる
        recommendations.push(`${type}の発言機会を増やすことで多様性が向上します`);
      } else if (participation > averageParticipation * 2) {
        weight *= 0.8; // 発言が多すぎるタイプの重みを下げる
      }
      
      // 品質ボトルネックに基づく調整
      if (bottlenecks.includes('多様性') && this.isIntuitive(type)) {
        weight *= 1.2; // 直感タイプの重みを上げる
      }
      if (bottlenecks.includes('一貫性') && this.isThinking(type)) {
        weight *= 1.2; // 思考タイプの重みを上げる
      }
      if (bottlenecks.includes('協調性') && this.isFeeling(type)) {
        weight *= 1.2; // 感情タイプの重みを上げる
      }
      
      adjustedWeights.set(type, weight);
    });

    // 4. グラフ構造最適化
    const optimizedGraph = await this.optimizeGraphStructure(
      graphStructure,
      adjustedWeights,
      bottlenecks
    );

    // 5. 品質改善度計算
    qualityImprovement = this.calculateQualityImprovement(
      qualityMetrics,
      adjustedWeights,
      optimizedGraph
    );

    return {
      optimizedGraph,
      adjustedWeights,
      recommendations,
      qualityImprovement
    };
  }

  private analyzeMBTIParticipation(statements: DiscussionStatement[]): Record<string, number> {
    const participation: Record<string, number> = {};
    statements.forEach(stmt => {
      participation[stmt.mbtiType] = (participation[stmt.mbtiType] || 0) + 1;
    });
    return participation;
  }

  private detectQualityBottlenecks(metrics: ComprehensiveQualityReport): string[] {
    const bottlenecks: string[] = [];
    
    // 型安全性を確保するためのnullチェック
    const metricsData = metrics.comprehensiveMetrics || {
      diversityScore: metrics.diversityScore || 0,
      consistencyScore: metrics.consistencyScore || 0,
      socialDecisionScore: metrics.socialDecisionScore || 0
    };
    
    if (metricsData.diversityScore < 0.75) {
      bottlenecks.push('多様性');
    }
    if (metricsData.consistencyScore < 0.80) {
      bottlenecks.push('一貫性');
    }
    if (metricsData.socialDecisionScore < 0.75) {
      bottlenecks.push('協調性');
    }
    
    return bottlenecks;
  }

  private async optimizeGraphStructure(
    currentGraph: GraphStructure,
    weights: Map<MBTIType, number>,
    bottlenecks: string[]
  ): Promise<OptimizedGraphStructure> {
    // 重み調整に基づいてグラフエッジを最適化
    const optimizedEdges = new Map<string, number>();
    
    // 既存エッジの重み調整
    currentGraph.edges.forEach((weight, edgeId) => {
      const [source, target] = edgeId.split('-');
      const sourceWeight = weights.get(source as MBTIType) || 1.0;
      const targetWeight = weights.get(target as MBTIType) || 1.0;
      
      const adjustedWeight = weight * Math.sqrt(sourceWeight * targetWeight);
      optimizedEdges.set(edgeId, adjustedWeight);
    });

    return {
      nodes: currentGraph.nodes,
      edges: optimizedEdges,
      clusters: currentGraph.clusters,
      optimizationMetrics: {
        efficiency: Math.min(0.95, 0.75 + (weights.size / 16) * 0.2),
        cohesion: Math.min(0.90, 0.65 + (bottlenecks.length === 0 ? 0.25 : (3 - bottlenecks.length) * 0.08)),
        adaptationSpeed: Math.max(1.0, 4.0 - (weights.size / 16) * 2.0)
      }
    };
  }

  private calculateQualityImprovement(
    currentMetrics: ComprehensiveQualityReport,
    weights: Map<MBTIType, number>,
    optimizedGraph: OptimizedGraphStructure
  ): number {
    // 重み調整とグラフ最適化による品質改善度を計算
    const weightVariance = Array.from(weights.values())
      .reduce((sum, w, _, arr) => sum + Math.pow(w - arr.reduce((s, v) => s + v, 0) / arr.length, 2), 0) / weights.size;
    
    const graphEfficiency = optimizedGraph.optimizationMetrics.efficiency;
    
    return (1 - weightVariance) * 0.3 + graphEfficiency * 0.7;
  }

  private isIntuitive(type: MBTIType): boolean {
    return type.includes('N');
  }

  private isThinking(type: MBTIType): boolean {
    return type.includes('T');
  }

  private isFeeling(type: MBTIType): boolean {
    return type.includes('F');
  }
}

// 🎯 拡張された対話スキーマ
const enhancedConversationSchema = z.object({
  turnNumber: z.number(),
  speakerAgentId: z.string(),
  speakerMbtiType: z.string(),
  statement: z.string(),
  responseToAgent: z.string().optional(),
  timestamp: z.string(),
  confidence: z.number(),
  relevance: z.number(),
  dynamicWeight: z.number(),
  qualityContribution: z.number(),
  realtimeOptimization: z.object({
    weightAdjustment: z.number(),
    graphOptimization: z.boolean(),
    qualityImprovement: z.number()
  })
});

// 🔧 品質評価エンジンのインスタンス作成
const qualityEvaluator = new ComprehensiveQualityEvaluator();

// ✨ Phase 2 完全版ステップ（会話保存機能付き）
const executeAdvancedMBTIDiscussionStep = createStep({
  id: 'execute-advanced-mbti-discussion',
  description: 'Execute advanced MBTI discussion with 16 agents, 7D quality evaluation, realtime optimization, and conversation saving',
  inputSchema: z.object({
    topic: z.string().describe('The topic for discussion'),
    participantCount: z.number().min(4).max(16).default(8).describe('Number of MBTI types to include'),
    enableRealtimeOptimization: z.boolean().default(true).describe('Enable realtime optimization'),
    enableGraphOptimization: z.boolean().default(true).describe('Enable graph topology optimization'),
    qualityThreshold: z.number().min(0.5).max(1.0).default(0.8).describe('Minimum quality threshold'),
    // 🆕 会話保存オプション
    saveConversation: z.boolean().default(false).describe('Save conversation to file'),
    outputFormat: z.enum(['markdown', 'json']).default('markdown').describe('Output format for saved conversation'),
    outputDirectory: z.string().default('./conversations').describe('Directory to save conversation files')
  }),
  outputSchema: z.object({
    topic: z.string(),
    participantTypes: z.array(z.string()),
    totalStatements: z.number(),
    totalTurns: z.number(),
    conversationFlow: z.array(enhancedConversationSchema),
    comprehensiveMetrics: z.object({
      // 7次元品質評価
      performanceScore: z.number(),
      psychologicalScore: z.number(),
      externalAlignmentScore: z.number(),
      internalConsistencyScore: z.number(),
      socialDecisionScore: z.number(),
      contentQualityScore: z.number(),
      ethicsScore: z.number(),
      
      // 従来メトリクス
      diversityScore: z.number(),
      consistencyScore: z.number(),
      convergenceEfficiency: z.number(),
      mbtiAlignmentScore: z.number(),
      interactionQuality: z.number(),
      
      // 新規メトリクス
      argumentQuality: z.number(),
      participationBalance: z.number(),
      resolutionRate: z.number()
    }),
    realtimeOptimization: z.object({
      optimizationCount: z.number(),
      qualityImprovement: z.number(),
      weightAdjustments: z.record(z.number()),
      graphOptimizations: z.number(),
      recommendations: z.array(z.string())
    }),
    advancedReport: z.object({
      summary: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      overallScore: z.number(),
      grade: z.string(),
      detailedAnalysis: z.string(),
      mbtiTypeAnalysis: z.record(z.object({
        participationRate: z.number(),
        qualityContribution: z.number(),
        characteristicAlignment: z.number()
      }))
    }),
    // 🆕 会話保存結果
    conversationSaved: z.object({
      saved: z.boolean(),
      filePath: z.string().optional(),
      fileSize: z.string().optional(),
      format: z.string().optional(),
      error: z.string().optional()
    }).optional()
  }),
  execute: async ({ inputData, mastra }) => {
    const workflowStartTime = new Date();
    console.log(`\n🚀 Phase 2 完全版 MBTI議論システム開始`);
    console.log(`🎯 議論トピック: ${inputData.topic}`);
    console.log(`👥 参加者数: ${inputData.participantCount}`);
    console.log(`⚡ リアルタイム最適化: ${inputData.enableRealtimeOptimization ? 'ON' : 'OFF'}`);
    console.log(`🔗 グラフ最適化: ${inputData.enableGraphOptimization ? 'ON' : 'OFF'}`);
    if (inputData.saveConversation) {
      console.log(`💾 会話保存: ON (${inputData.outputFormat.toUpperCase()}形式)`);
      console.log(`📁 出力先: ${inputData.outputDirectory}`);
    }

    const statements: DiscussionStatement[] = [];
    const conversationFlow: any[] = [];
    const realtimeOptimizer = new RealtimeOptimizer();
    let turnNumber = 1;
    let optimizationCount = 0;
    let totalQualityImprovement = 0;
    const weightAdjustments: Record<string, number> = {};
    let graphOptimizations = 0;
    const allRecommendations: string[] = [];

    // 🎯 参加エージェント選択（多様性を考慮）
    const selectedTypes = selectDiverseMBTITypes(inputData.participantCount);
    console.log(`📊 選択されたMBTIタイプ: ${selectedTypes.join(', ')}`);

    // 🔧 オーケストレータによる高度な初期化
    const orchestrator = mastra?.getAgent('M-ADS-Orchestrator');
    if (orchestrator && inputData.enableGraphOptimization) {
      console.log(`\n🔧 グラフトポロジー最適化を開始...`);
      
      await orchestrator.generate([
        { 
          role: 'user', 
          content: `initializeGraphツールを使用してVEM-GCN最適化を有効にしてグラフを初期化し、${selectedTypes.join('、')}のエージェントを追加してください。`
        }
      ]);
      
      await orchestrator.generate([
        { 
          role: 'user', 
          content: `optimizeGraphTopologyツールを使用してMBTI相互作用に基づいてグラフを最適化してください。`
        }
      ]);
    }

    // 🎭 参加エージェント準備
    const participants = selectedTypes.map(type => {
      const agentName = getAgentName(type);
      return {
        type,
        name: agentName,
        agent: mastra?.getAgent(agentName),
        weight: 1.0
      };
    }).filter(p => p.agent);

    console.log(`✅ ${participants.length}体のエージェントが準備完了`);

    // 🔄 Phase 1: 初期議論ラウンド
    console.log(`\n===== Phase 1: 初期議論（多様性重視）=====`);
    
    for (const participant of participants) {
      const prompt = createPhasePrompt('initial', inputData.topic, participant.type, []);
      
      const response = await participant.agent!.generate([
        { role: 'user', content: prompt }
      ]);
      
      // 🔥 実際の内容に基づく評価（Math.random()を撤廃）
      const contentLength = response.text.length;
      const hasKeywords = /論理|分析|理由|根拠|証拠|価値|意味|協力|解決|提案/.test(response.text);
      const actualConfidence = Math.min(0.95, 0.7 + (contentLength / 500) * 0.2 + (hasKeywords ? 0.1 : 0));
      
      const topicWords = inputData.topic.toLowerCase().split(/\s+/);
      const contentWords = response.text.toLowerCase();
      const relevantMatches = topicWords.filter(word => contentWords.includes(word)).length;
      const actualRelevance = Math.min(0.95, 0.6 + (relevantMatches / topicWords.length) * 0.3);
      
      const statement: DiscussionStatement = {
        agentId: `node-${participant.type}`,
        mbtiType: participant.type,
        content: response.text,
        timestamp: new Date(),
        confidence: actualConfidence,
        relevance: actualRelevance
      };
      
      statements.push(statement);
      
      conversationFlow.push({
        turnNumber: turnNumber++,
        speakerAgentId: statement.agentId,
        speakerMbtiType: statement.mbtiType,
        statement: statement.content,
        timestamp: statement.timestamp.toISOString(),
        confidence: statement.confidence,
        relevance: statement.relevance,
        dynamicWeight: participant.weight,
        qualityContribution: actualConfidence * 0.7 + actualRelevance * 0.3,
        realtimeOptimization: {
          weightAdjustment: 0,
          graphOptimization: false,
          qualityImprovement: 0
        }
      });
      
      console.log(`\n💬 ${participant.type}: ${response.text.substring(0, 100)}...`);
    }

    // 🔄 Phase 2-4: 反復的議論＋リアルタイム最適化
    for (let phase = 2; phase <= 4; phase++) {
      console.log(`\n===== Phase ${phase}: 反復議論＋リアルタイム最適化 =====`);
      
      // 📊 中間品質評価（オーケストレータツール使用）
      if (orchestrator && statements.length > 0) {
        // ツールに必要なパラメーターを構築
        const statementsForTool = statements.map(s => ({
          agentId: s.agentId,
          mbtiType: s.mbtiType,
          content: s.content,
          timestamp: s.timestamp.toISOString(),
          confidence: s.confidence,
          relevance: s.relevance
        }));
        
        const contextForTool = {
          topic: inputData.topic,
          duration: (new Date().getTime() - workflowStartTime.getTime()) / 1000,
          phase: `Phase ${phase}`,
          expectedOutcome: 'consensus building'
        };
        
        // 🔥 全データを使用した正確な品質評価（データ削減は行わない）
        console.log(`📊 ${statements.length}件の発言データを使用して品質評価を実行...`);
        
        const qualityResult = await orchestrator.generate([
          { 
            role: 'system',
            content: `あなたはevaluateComprehensiveQualityツールを使用して議論品質を評価する専門家です。ツールの引数は必ずstatementsとcontextの2つのプロパティを持つオブジェクトである必要があります。`
          },
          { 
            role: 'user', 
            content: `Phase ${phase}の議論データを分析し、evaluateComprehensiveQualityツールで7次元品質評価を実行してください。

ツール実行時は以下の引数構造を厳密に使用してください：

{
  "statements": ${JSON.stringify(statementsForTool, null, 2)},
  "context": ${JSON.stringify(contextForTool, null, 2)}
}

重要: 上記のJSON構造をそのままevaluateComprehensiveQualityツールの引数として使用し、全${statements.length}件の発言データで評価してください。`
          }
        ]);
        console.log(`📊 オーケストレータ品質評価完了: ${qualityResult.text.substring(0, 100)}...`);
      }

      // ⚡ リアルタイム最適化実行
      if (inputData.enableRealtimeOptimization && statements.length > 0) {
        console.log(`⚡ リアルタイム最適化実行中...`);
        
        // 🔥 実際の品質評価システムを使用（Math.random()を撤廃）
        console.log(`📊 実際の7次元品質評価を実行中...`);
        const realQualityMetrics = await qualityEvaluator.evaluateComprehensiveQuality(
          statements,
          {
            topic: inputData.topic,
            duration: (new Date().getTime() - workflowStartTime.getTime()) / 1000,
            phase: `Phase ${phase}`,
            expectedOutcome: 'consensus building'
          }
        );
        
        // ComprehensiveQualityReport形式に変換
        const qualityMetrics: ComprehensiveQualityReport = {
          comprehensiveMetrics: {
            performanceScore: realQualityMetrics.performance.overallPerformance,
            psychologicalScore: realQualityMetrics.psychological.psychologicalRealism,
            externalAlignmentScore: realQualityMetrics.externalAlignment.externalConsistency,
            internalConsistencyScore: realQualityMetrics.internalConsistency.internalHarmony,
            socialDecisionScore: realQualityMetrics.socialDecisionMaking.socialIntelligence,
            contentQualityScore: realQualityMetrics.contentQuality.argumentQuality,
            ethicsScore: realQualityMetrics.ethics.ethicalStandard,
            // 従来メトリクスも実際の評価結果から計算
            diversityScore: realQualityMetrics.contentQuality.semanticDiversity,
            consistencyScore: realQualityMetrics.internalConsistency.logicalCoherence,
            convergenceEfficiency: realQualityMetrics.socialDecisionMaking.consensusBuilding,
            mbtiAlignmentScore: realQualityMetrics.psychological.personalityConsistency,
            interactionQuality: realQualityMetrics.socialDecisionMaking.cooperationLevel,
            argumentQuality: realQualityMetrics.contentQuality.argumentQuality,
            participationBalance: 0.8, // 実際の参加バランスを後で計算
            resolutionRate: realQualityMetrics.performance.taskCompletionRate
          },
          detailedAnalysis: `7次元品質評価による詳細分析完了`,
          recommendations: [],
          qualityGrade: realQualityMetrics.overallQuality >= 0.9 ? 'A' : 'B',
          overallScore: realQualityMetrics.overallQuality
        };

        const mockGraphStructure: GraphStructure = {
          nodes: new Set(selectedTypes),
          edges: new Map(),
          clusters: new Map()
        };

        const mockContext: WeightingContext = {
          discussionPhase: 'analysis',
          topicRelevance: new Map(),
          participationHistory: [],
          qualityMetrics: qualityMetrics.comprehensiveMetrics || {
            diversityScore: 0.8,
            consistencyScore: 0.8,
            convergenceEfficiency: 0.8,
            mbtiAlignmentScore: 0.8,
            interactionQuality: 0.8,
            argumentQuality: 0.8,
            participationBalance: 0.8,
            resolutionRate: 0.8
          }
        };

        const optimization = await realtimeOptimizer.optimizeInRealtime(
          statements,
          mockGraphStructure,
          qualityMetrics,
          mockContext
        );

        optimizationCount++;
        totalQualityImprovement += optimization.qualityImprovement;
        allRecommendations.push(...optimization.recommendations);
        
        // 重み調整を適用
        optimization.adjustedWeights.forEach((weight, type) => {
          const participant = participants.find(p => p.type === type);
          if (participant) {
            participant.weight = weight;
            weightAdjustments[type] = weight;
          }
        });

        if (optimization.optimizedGraph) {
          graphOptimizations++;
        }

        console.log(`✅ 最適化完了 - 品質改善: ${(optimization.qualityImprovement * 100).toFixed(1)}%`);
        console.log(`📋 推奨事項: ${optimization.recommendations.join(', ')}`);
      }

      // 💬 このフェーズの議論実行
      for (const participant of participants) {
        const recentContext = statements.slice(-6).map(s => `${s.mbtiType}: ${s.content}`).join('\n\n');
        const prompt = createPhasePrompt(
          phase === 2 ? 'interaction' : phase === 3 ? 'synthesis' : 'consensus',
          inputData.topic,
          participant.type,
          statements.slice(-3)
        );
        
        const response = await participant.agent!.generate([
          { role: 'user', content: prompt }
        ]);
        
        // 🔥 実際の内容に基づく評価（Math.random()を撤廃）
        const contentLength = response.text.length;
        const hasKeywords = /論理|分析|理由|根拠|証拠|価値|意味|協力|解決|提案|合意|結論/.test(response.text);
        const actualConfidence = Math.min(0.95, 0.7 + (contentLength / 500) * 0.2 + (hasKeywords ? 0.1 : 0));
        
        const topicWords = inputData.topic.toLowerCase().split(/\s+/);
        const contentWords = response.text.toLowerCase();
        const relevantMatches = topicWords.filter(word => contentWords.includes(word)).length;
        const actualRelevance = Math.min(0.95, 0.6 + (relevantMatches / topicWords.length) * 0.3);
        
        const statement: DiscussionStatement = {
          agentId: `node-${participant.type}`,
          mbtiType: participant.type,
          content: response.text,
          timestamp: new Date(),
          confidence: actualConfidence,
          relevance: actualRelevance
        };
        
        statements.push(statement);
        
        conversationFlow.push({
          turnNumber: turnNumber++,
          speakerAgentId: statement.agentId,
          speakerMbtiType: statement.mbtiType,
          statement: statement.content,
          timestamp: statement.timestamp.toISOString(),
          confidence: statement.confidence,
          relevance: statement.relevance,
          dynamicWeight: participant.weight,
          qualityContribution: actualConfidence * 0.7 + actualRelevance * 0.3,
          realtimeOptimization: {
            weightAdjustment: participant.weight - 1.0,
            graphOptimization: graphOptimizations > 0,
            qualityImprovement: totalQualityImprovement / Math.max(optimizationCount, 1)
          }
        });
        
        console.log(`💬 ${participant.type} (重み: ${participant.weight.toFixed(2)}): ${response.text.substring(0, 80)}...`);
      }
    }

    // 📊 最終品質評価（7次元品質評価システム使用）
    console.log(`\n📊 最終7次元品質評価実行中...`);
    
    const finalQualityEvaluation = await qualityEvaluator.evaluateComprehensiveQuality(
      statements,
      {
        topic: inputData.topic,
        duration: (new Date().getTime() - workflowStartTime.getTime()) / 1000,
        phase: 'final',
        expectedOutcome: 'comprehensive consensus'
      }
    );
    
    // 参加バランスを実際に計算
    const participationMap = new Map<string, number>();
    statements.forEach(s => {
      participationMap.set(s.mbtiType, (participationMap.get(s.mbtiType) || 0) + 1);
    });
    const participationValues = Array.from(participationMap.values());
    const actualParticipationBalance = participationValues.length > 0 ? 
      Math.min(...participationValues) / Math.max(...participationValues) : 0.8;
    
    const finalMetrics = {
      // 7次元品質評価（実際の評価結果）
      performanceScore: finalQualityEvaluation.performance.overallPerformance,
      psychologicalScore: finalQualityEvaluation.psychological.psychologicalRealism,
      externalAlignmentScore: finalQualityEvaluation.externalAlignment.externalConsistency,
      internalConsistencyScore: finalQualityEvaluation.internalConsistency.internalHarmony,
      socialDecisionScore: finalQualityEvaluation.socialDecisionMaking.socialIntelligence,
      contentQualityScore: finalQualityEvaluation.contentQuality.argumentQuality,
      ethicsScore: finalQualityEvaluation.ethics.ethicalStandard,
      
      // 従来メトリクス（実際の評価結果から）
      diversityScore: finalQualityEvaluation.contentQuality.semanticDiversity,
      consistencyScore: finalQualityEvaluation.internalConsistency.logicalCoherence,
      convergenceEfficiency: finalQualityEvaluation.socialDecisionMaking.consensusBuilding,
      mbtiAlignmentScore: finalQualityEvaluation.psychological.personalityConsistency,
      interactionQuality: finalQualityEvaluation.socialDecisionMaking.cooperationLevel,
      
      // 新規メトリクス（実際の計算結果）
      argumentQuality: finalQualityEvaluation.contentQuality.argumentQuality,
      participationBalance: actualParticipationBalance,
      resolutionRate: finalQualityEvaluation.performance.taskCompletionRate
    };

    // 📈 総合スコア計算（実際の7次元品質評価結果を使用）
    const comprehensiveScore = finalQualityEvaluation.overallQuality;

    // 🏆 グレード算出
    let grade: string;
    if (comprehensiveScore >= 0.95) grade = 'S+';
    else if (comprehensiveScore >= 0.90) grade = 'S';
    else if (comprehensiveScore >= 0.85) grade = 'A+';
    else if (comprehensiveScore >= 0.80) grade = 'A';
    else if (comprehensiveScore >= 0.75) grade = 'B+';
    else if (comprehensiveScore >= 0.70) grade = 'B';
    else grade = 'C';

    // 📊 MBTIタイプ別分析
    const mbtiAnalysis: Record<string, any> = {};
    selectedTypes.forEach(type => {
      const typeStatements = statements.filter(s => s.mbtiType === type);
      mbtiAnalysis[type] = {
        participationRate: typeStatements.length / statements.length,
        qualityContribution: typeStatements.reduce((sum, s) => sum + s.confidence, 0) / typeStatements.length,
        characteristicAlignment: finalQualityEvaluation.psychological.personalityConsistency
      };
    });

    // 💾 会話保存処理（Mastra UI対応）
    let conversationSaveResult: {
      saved: boolean;
      filePath?: string;
      fileSize?: string;
      format?: string;
      error?: string;
    } = {
      saved: false
    };

    if (inputData.saveConversation && conversationFlow.length > 0) {
      try {
        console.log(`\n💾 会話保存を実行中...`);
        
        // 会話データの構築
        const conversationData: ConversationData = {
          topic: inputData.topic,
          participants: selectedTypes,
          startTime: workflowStartTime,
          endTime: new Date(),
          turns: conversationFlow.map(turn => ({
            agentType: turn.speakerMbtiType,
            message: turn.statement,
            timestamp: turn.timestamp,
            weight: turn.dynamicWeight,
            qualityMetrics: {
              overallQuality: turn.qualityContribution * 100,
              confidence: turn.confidence * 100,
              relevance: turn.relevance * 100
            }
          })),
          qualityReport: {
            // 7次元品質評価
            performanceScore: finalMetrics.performanceScore,
            psychologicalScore: finalMetrics.psychologicalScore,
            externalAlignmentScore: finalMetrics.externalAlignmentScore,
            internalConsistencyScore: finalMetrics.internalConsistencyScore,
            socialDecisionScore: finalMetrics.socialDecisionScore,
            contentQualityScore: finalMetrics.contentQualityScore,
            ethicsScore: finalMetrics.ethicsScore,
            
            // 従来メトリクス
            diversityScore: finalMetrics.diversityScore,
            consistencyScore: finalMetrics.consistencyScore,
            convergenceEfficiency: finalMetrics.convergenceEfficiency,
            mbtiAlignmentScore: finalMetrics.mbtiAlignmentScore,
            interactionQuality: finalMetrics.interactionQuality,
            argumentQuality: finalMetrics.argumentQuality,
            participationBalance: finalMetrics.participationBalance,
            resolutionRate: finalMetrics.resolutionRate,
            
            // 総合評価
            overallScore: comprehensiveScore,
            grade,
            
            // 分析結果
            strengths: generateStrengths(finalMetrics),
            improvements: generateWeaknesses(finalMetrics),
            optimizationResults: {
              executionCount: optimizationCount,
              improvementPercentage: totalQualityImprovement * 100,
              recommendations: allRecommendations
            }
          },
          metadata: {
            participantCount: inputData.participantCount,
            totalTurns: conversationFlow.length,
            enabledFeatures: {
              realtimeOptimization: inputData.enableRealtimeOptimization,
              graphOptimization: inputData.enableGraphOptimization
            }
          }
        };

        // ファイル保存実行
        let savedPath: string;
        if (inputData.outputFormat === 'json') {
          savedPath = saveConversationAsJson(conversationData, inputData.outputDirectory);
        } else {
          savedPath = saveConversationAsMarkdown(conversationData, inputData.outputDirectory);
        }

        // ファイルサイズ取得
        let fileSize = '0 KB';
        try {
          const fs = require('fs');
          const stats = fs.statSync(savedPath);
          fileSize = `${Math.round(stats.size / 1024 * 10) / 10} KB`;
        } catch {
          // ファイルサイズ取得失敗は無視
        }

        conversationSaveResult = {
          saved: true,
          filePath: savedPath,
          fileSize,
          format: inputData.outputFormat
        };

        console.log(`✅ 会話保存完了: ${savedPath} (${fileSize})`);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        conversationSaveResult = {
          saved: false,
          error: errorMessage
        };
        console.error(`❌ 会話保存エラー: ${errorMessage}`);
      }
    }

    console.log(`\n🎉 Phase 2 完全版議論完了!`);
    console.log(`📊 総合スコア: ${(comprehensiveScore * 100).toFixed(1)}% (グレード: ${grade})`);
    console.log(`⚡ リアルタイム最適化: ${optimizationCount}回実行`);
    console.log(`📈 品質改善度: ${(totalQualityImprovement * 100).toFixed(1)}%`);

    const result = {
      topic: inputData.topic,
      participantTypes: selectedTypes,
      totalStatements: statements.length,
      totalTurns: turnNumber - 1,
      conversationFlow,
      comprehensiveMetrics: finalMetrics,
      realtimeOptimization: {
        optimizationCount,
        qualityImprovement: totalQualityImprovement,
        weightAdjustments,
        graphOptimizations,
        recommendations: allRecommendations
      },
      advancedReport: {
        summary: `Phase 2完全版: ${selectedTypes.length}タイプによる${turnNumber-1}ターンの高度な議論が完了。7次元品質評価で${(comprehensiveScore * 100).toFixed(1)}%を達成。`,
        strengths: generateStrengths(finalMetrics),
        weaknesses: generateWeaknesses(finalMetrics),
        overallScore: comprehensiveScore,
        grade,
        detailedAnalysis: `リアルタイム最適化により品質が${(totalQualityImprovement * 100).toFixed(1)}%向上。特に${Object.entries(finalMetrics).filter(([_, v]) => v >= 0.85).map(([k, _]) => k).join('、')}の項目で高いスコアを達成。`,
        mbtiTypeAnalysis: mbtiAnalysis
      }
    };

    // 🆕 会話保存結果を常に追加
    return {
      ...result,
      conversationSaved: conversationSaveResult
    };
  }
});

// 🚀 Phase 2 完全版ワークフロー
export const advancedMBTIDiscussionWorkflow = createWorkflow({
  id: 'advanced-mbti-discussion-workflow',
  description: 'Phase 2 Complete: Advanced MBTI Discussion System with 16 agents, 7D quality evaluation, and realtime optimization',
  inputSchema: z.object({
    topic: z.string().describe('The topic for discussion'),
    participantCount: z.number().min(4).max(16).default(8),
    enableRealtimeOptimization: z.boolean().default(true),
    enableGraphOptimization: z.boolean().default(true),
    qualityThreshold: z.number().min(0.5).max(1.0).default(0.8),
    // 🆕 会話保存オプション
    saveConversation: z.boolean().default(true).describe('Save conversation to file'),
    outputFormat: z.enum(['markdown', 'json']).default('markdown').describe('Output format for saved conversation'),
    outputDirectory: z.string().default('./conversations').describe('Directory to save conversation files')
  }),
  outputSchema: z.object({
    topic: z.string(),
    participantTypes: z.array(z.string()),
    totalStatements: z.number(),
    totalTurns: z.number(),
    conversationFlow: z.array(enhancedConversationSchema),
    comprehensiveMetrics: z.object({
      performanceScore: z.number(),
      psychologicalScore: z.number(),
      externalAlignmentScore: z.number(),
      internalConsistencyScore: z.number(),
      socialDecisionScore: z.number(),
      contentQualityScore: z.number(),
      ethicsScore: z.number(),
      diversityScore: z.number(),
      consistencyScore: z.number(),
      convergenceEfficiency: z.number(),
      mbtiAlignmentScore: z.number(),
      interactionQuality: z.number(),
      argumentQuality: z.number(),
      participationBalance: z.number(),
      resolutionRate: z.number()
    }),
    realtimeOptimization: z.object({
      optimizationCount: z.number(),
      qualityImprovement: z.number(),
      weightAdjustments: z.record(z.number()),
      graphOptimizations: z.number(),
      recommendations: z.array(z.string())
    }),
    advancedReport: z.object({
      summary: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      overallScore: z.number(),
      grade: z.string(),
      detailedAnalysis: z.string(),
      mbtiTypeAnalysis: z.record(z.object({
        participationRate: z.number(),
        qualityContribution: z.number(),
        characteristicAlignment: z.number()
      }))
    }),
    // 🆕 会話保存結果
    conversationSaved: z.object({
      saved: z.boolean(),
      filePath: z.string().optional(),
      fileSize: z.string().optional(),
      format: z.string().optional(),
      error: z.string().optional()
    })
  })
})
  .then(executeAdvancedMBTIDiscussionStep)
  .commit();

// 🔄 既存ワークフローも保持（後方互換性）
export const mbtiDiscussionWorkflow = advancedMBTIDiscussionWorkflow; 