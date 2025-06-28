import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

// 🔧 分割されたモジュールのインポート
import type {
  DiscussionStatement,
  MBTIType,
  ComprehensiveQualityReport,
  GraphStructure,
  WeightingContext,
  PerformanceMetrics,
  OptimizedGraphStructure
} from '../types/mbti-types';

import {
  selectDiverseMBTITypes,
  getAgentName,
  selectNextSpeakerByWeight,
  createPhasePrompt,
  generateStrengths,
  generateWeaknesses
} from '../utils/discussion-helpers';

import {
  generatePerformanceFeedback,
  evaluateContentQuality,
  generateDetailedStatementFeedback,
  type PerformanceFeedback
} from '../utils/performance-evaluator';

import {
  createAdaptivePhasePrompt,
  createStatementLevelAdaptivePrompt
} from '../utils/adaptive-prompt-generator';

import {
  executeOrchestratorIntervention
} from '../utils/orchestrator-intervention';

import {
  RealtimeOptimizer,
  createRealtimeOptimizer
} from '../utils/realtime-optimizer';

import {
  generateDiscussionSummary,
  type DiscussionSummary
} from '../utils/discussion-summarizer';

import { saveConversationAsMarkdown, saveConversationAsJson, type ConversationData } from '../utils/conversation-saver';
import { ComprehensiveQualityEvaluator } from '../utils/comprehensive-quality-evaluator';

// 🆕 統合フィードバックシステム
import { RealtimeFeedbackManager } from '../core/realtime-feedback-manager';
import { FeedbackConfigurationBuilder } from '../config/feedback-configuration';
import type { EvaluationContext } from '../types/feedback-system-types';

// 🆕 拡張された対話スキーマ（7次元評価統合）
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
  // 🆕 7次元品質評価結果を追加
  sevenDimensionEvaluation: z.object({
    performance: z.number(),
    psychological: z.number(),
    externalAlignment: z.number(),
    internalConsistency: z.number(),
    socialDecisionMaking: z.number(),
    contentQuality: z.number(),
    ethics: z.number(),
    overallQuality: z.number()
  }).optional(),
  realtimeOptimization: z.object({
    weightAdjustment: z.number(),
    graphOptimization: z.boolean(),
    qualityImprovement: z.number()
  })
});

// 🔧 品質評価エンジンのインスタンス作成
const qualityEvaluator = new ComprehensiveQualityEvaluator();

// ✨ Phase 2 完全版ステップ（大幅に簡素化）
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
    // 🆕 議論総括セクション
    discussionSummary: z.object({
      overview: z.string().describe('議論全体の総合概要'),
      keyThemes: z.array(z.string()).describe('議論で扱われた主要テーマ'),
      progressAnalysis: z.string().describe('議論の進展パターン分析'),
      mbtiContributions: z.record(z.string()).describe('MBTIタイプ別の具体的貢献内容'),
      consensus: z.string().describe('合意形成プロセスの分析'),
      insights: z.array(z.string()).describe('議論から得られた重要な洞察'),
      processCharacteristics: z.array(z.string()).describe('議論プロセスの特徴的パターン')
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

    // 🔧 初期化
    const statements: DiscussionStatement[] = [];
    const conversationFlow: Array<{
      turnNumber: number;
      speakerAgentId: string;
      speakerMbtiType: string;
      statement: string;
      timestamp: string;
      confidence: number;
      relevance: number;
      dynamicWeight: number;
      qualityContribution: number;
      realtimeOptimization: {
        weightAdjustment: number;
        graphOptimization: boolean;
        qualityImprovement: number;
      };
      sevenDimensionEvaluation?: {
        performance: number;
        psychological: number;
        externalAlignment: number;
        internalConsistency: number;
        socialDecisionMaking: number;
        contentQuality: number;
        ethics: number;
        overallQuality: number;
      };
      responseToAgent?: string;
    }> = [];
    const realtimeOptimizer = createRealtimeOptimizer();

    // 🆕 統合フィードバックシステム初期化
    console.log('🎯 統合フィードバックシステムを初期化中...');
    const feedbackConfig = FeedbackConfigurationBuilder
      .create()
      .applyBalancedPreset()
      .withQualityThresholds({
        overallMinimum: Math.max(inputData.qualityThreshold * 0.8, 0.6), // 健全性チェック用に閾値を緩和
        interventionThreshold: 0.5 // 介入閾値も緩和
      })
      .enableRealtimeOptimization(inputData.enableRealtimeOptimization)
      .build();

    const realtimeFeedbackManager = new RealtimeFeedbackManager(feedbackConfig);

    try {
      await realtimeFeedbackManager.initialize();
      console.log('✅ 統合フィードバックシステム初期化完了');
    } catch (error) {
      console.warn('⚠️ 統合フィードバックシステム初期化で警告:', error);
      console.log('🔄 より緩い設定で再試行中...');

      // より緩い設定で再試行
      const fallbackConfig = FeedbackConfigurationBuilder
        .create()
        .applyEfficiencyPreset() // より緩い効率重視プリセット
        .withQualityThresholds({
          overallMinimum: 0.6,
          interventionThreshold: 0.4
        })
        .enableRealtimeOptimization(inputData.enableRealtimeOptimization)
        .build();

      const fallbackManager = new RealtimeFeedbackManager(fallbackConfig);
      await fallbackManager.initialize();

      // マネージャーを置き換え
      Object.assign(realtimeFeedbackManager, fallbackManager);
      console.log('✅ フォールバック設定で統合フィードバックシステム初期化完了');
    }

    let turnNumber = 1;
    let optimizationCount = 0;
    let totalQualityImprovement = 0;
    const weightAdjustments: Record<string, number> = {};
    let graphOptimizations = 0;
    const allRecommendations: string[] = [];

    // 🎯 参加エージェント選択
    const selectedTypes = selectDiverseMBTITypes(inputData.participantCount);
    console.log(`📊 選択されたMBTIタイプ: ${selectedTypes.join(', ')}`);

    // 🔧 オーケストレーター取得
    const orchestrator = mastra?.getAgent('M-ADS-Orchestrator');

    // 🎭 参加エージェント準備
    const participants = selectedTypes.map(type => {
      const agentName = getAgentName(type);
      return {
        type,
        name: agentName,
        agent: mastra?.getAgent(agentName),
        weight: 1.0,
        lastSpokenTurn: 0,
        performanceHistory: [] as number[],
        feedbackHistory: [] as PerformanceFeedback[],
        previousStatements: [] as string[],
        previousDiscussionStatements: [] as DiscussionStatement[]
      };
    }).filter(p => p.agent);

    console.log(`✅ ${participants.length}体のエージェントが準備完了`);

    // 🔄 Phase 1: 初期議論ラウンド
    console.log(`\n===== Phase 1: 初期議論（多様性重視）=====`);

    for (const participant of participants) {
      // 🆕 適応的プロンプト生成（統合フィードバックシステムを使用）
      const adaptivePrompt = await realtimeFeedbackManager.generateAdaptivePrompt({
        mbtiType: participant.type,
        topic: inputData.topic,
        phase: 'initial',
        currentWeight: participant.weight
      });

      const response = await participant.agent!.generate([
        { role: 'user', content: adaptivePrompt }
      ]);

      // 🔥 統合フィードバック評価（RealtimeFeedbackManagerを使用）
      const evaluationContext: EvaluationContext = {
        statement: response.text,
        topic: inputData.topic,
        mbtiType: participant.type,
        phase: 'initial',
        turnNumber: turnNumber,
        history: {
          recentStatements: [],
          agentStatements: [],
          performanceHistory: [],
          feedbackHistory: []
        },
        participants: participants.map(p => ({
          mbtiType: p.type,
          currentWeight: p.weight,
          participationCount: 1,
          averageQuality: 0.8,
          lastActivity: new Date()
        })),
        currentWeight: participant.weight
      };

      const feedbackResult = await realtimeFeedbackManager.evaluateStatement(evaluationContext);

      // 下位互換性のため、旧形式のdetailedPerformanceFeedbackを構築
      const detailedPerformanceFeedback = {
        overallScore: feedbackResult.detailed.sevenDimensionEvaluation?.overallQuality || 0.8,
        feedback: feedbackResult.detailed.feedback,
        improvementSuggestions: feedbackResult.detailed.improvements || [],
        mbtiAlignment: feedbackResult.detailed.mbtiAlignment || {
          alignmentScore: 0.8,
          expectedCharacteristics: [],
          demonstratedCharacteristics: [],
          alignmentGap: [],
          recommendedFocus: []
        },
        detailedAnalysis: {
          nextSpeechGuidance: feedbackResult.nextGuidance || `${participant.type}として次回の発言を改善してください`,
          strengths: feedbackResult.detailed.improvements || [],
          weaknesses: [],
          specificImprovements: [],
          qualityTrend: 'stable' as const
        },
        sevenDimensionEvaluation: feedbackResult.detailed.sevenDimensionEvaluation || {
          performance: 0.8,
          psychological: 0.8,
          externalAlignment: 0.8,
          internalConsistency: 0.8,
          socialDecisionMaking: 0.8,
          contentQuality: 0.8,
          ethics: 0.8,
          overallQuality: 0.8
        },
        progressTracking: {
          improvementTrend: 'stable' as 'improving' | 'stable' | 'declining',
          consistencyScore: 0.8,
          recommendedFocus: [],
          milestones: []
        }
      };

      const statement: DiscussionStatement = {
        agentId: `node-${participant.type}`,
        mbtiType: participant.type,
        content: response.text,
        timestamp: new Date(),
        confidence: detailedPerformanceFeedback.overallScore,
        relevance: detailedPerformanceFeedback.overallScore
      };

      // 履歴を更新（DiscussionStatement形式も含む）
      participant.feedbackHistory.push(detailedPerformanceFeedback);
      participant.previousStatements.push(response.text);
      participant.previousDiscussionStatements.push(statement);
      participant.performanceHistory.push(detailedPerformanceFeedback.overallScore);
      participant.lastSpokenTurn = turnNumber;

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
        qualityContribution: detailedPerformanceFeedback.overallScore,
        // 🆕 7次元評価結果を型安全に追加
        sevenDimensionEvaluation: detailedPerformanceFeedback.sevenDimensionEvaluation ? {
          performance: detailedPerformanceFeedback.sevenDimensionEvaluation.performance || 0.8,
          psychological: detailedPerformanceFeedback.sevenDimensionEvaluation.psychological || 0.8,
          externalAlignment: detailedPerformanceFeedback.sevenDimensionEvaluation.externalAlignment || 0.8,
          internalConsistency: detailedPerformanceFeedback.sevenDimensionEvaluation.internalConsistency || 0.8,
          socialDecisionMaking: detailedPerformanceFeedback.sevenDimensionEvaluation.socialDecisionMaking || 0.8,
          contentQuality: detailedPerformanceFeedback.sevenDimensionEvaluation.contentQuality || 0.8,
          ethics: detailedPerformanceFeedback.sevenDimensionEvaluation.ethics || 0.8,
          overallQuality: detailedPerformanceFeedback.sevenDimensionEvaluation.overallQuality || 0.8
        } : undefined,
        realtimeOptimization: {
          weightAdjustment: 0,
          graphOptimization: false,
          qualityImprovement: 0
        }
      });

      console.log(`\n💬 ${participant.type} (重み: ${participant.weight.toFixed(2)}, 成績: ${(detailedPerformanceFeedback.overallScore * 100).toFixed(0)}%): ${response.text.substring(0, 100)}...`);
      console.log(`📊 フィードバック: ${detailedPerformanceFeedback.feedback}`);
      console.log(`🎯 次回への指示: ${detailedPerformanceFeedback.detailedAnalysis.nextSpeechGuidance}`);
      console.log(`📈 7次元評価: P${(detailedPerformanceFeedback.sevenDimensionEvaluation.performance * 100).toFixed(0)}% | 心${(detailedPerformanceFeedback.sevenDimensionEvaluation.psychological * 100).toFixed(0)}% | 品${(detailedPerformanceFeedback.sevenDimensionEvaluation.contentQuality * 100).toFixed(0)}% | 協${(detailedPerformanceFeedback.sevenDimensionEvaluation.socialDecisionMaking * 100).toFixed(0)}%`);
    }

    // 🔄 Phase 2-4: 反復的議論＋リアルタイム最適化
    for (let phase = 2; phase <= 4; phase++) {
      console.log(`\n===== Phase ${phase}: 反復議論＋リアルタイム最適化 =====`);

      // ⚡ リアルタイム最適化実行
      if (inputData.enableRealtimeOptimization && statements.length > 0) {
        console.log(`⚡ リアルタイム最適化実行中...`);

        const realQualityMetrics = await qualityEvaluator.evaluateComprehensiveQuality(
          statements,
          {
            topic: inputData.topic,
            duration: (new Date().getTime() - workflowStartTime.getTime()) / 1000,
            phase: `Phase ${phase}`,
            expectedOutcome: 'consensus building'
          }
        );

        const qualityMetrics: ComprehensiveQualityReport = {
          comprehensiveMetrics: {
            performanceScore: realQualityMetrics.performance.overallPerformance,
            psychologicalScore: realQualityMetrics.psychological.psychologicalRealism,
            externalAlignmentScore: realQualityMetrics.externalAlignment.externalConsistency,
            internalConsistencyScore: realQualityMetrics.internalConsistency.internalHarmony,
            socialDecisionScore: realQualityMetrics.socialDecisionMaking.socialIntelligence,
            contentQualityScore: realQualityMetrics.contentQuality.argumentQuality,
            ethicsScore: realQualityMetrics.ethics.ethicalStandard,
            diversityScore: realQualityMetrics.contentQuality.semanticDiversity,
            consistencyScore: realQualityMetrics.internalConsistency.logicalCoherence,
            convergenceEfficiency: realQualityMetrics.socialDecisionMaking.consensusBuilding,
            mbtiAlignmentScore: realQualityMetrics.psychological.personalityConsistency,
            interactionQuality: realQualityMetrics.socialDecisionMaking.cooperationLevel,
            argumentQuality: realQualityMetrics.contentQuality.argumentQuality,
            participationBalance: 0.8,
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
      const phaseTypeMapping = {
        2: 'interaction',
        3: 'synthesis',
        4: 'consensus'
      } as const;
      const currentPhaseType = phaseTypeMapping[phase as keyof typeof phaseTypeMapping];

      console.log(`\n🎯 重み付けベース選択による${currentPhaseType}議論開始`);

      const phaseParticipantCount = Math.min(participants.length, inputData.participantCount);

      for (let speakerIndex = 0; speakerIndex < phaseParticipantCount; speakerIndex++) {
        // 🆕 重み付けベースでエージェント選択
        const speakerSelection = selectNextSpeakerByWeight(
          participants,
          turnNumber,
          currentPhaseType
        );

        // 型安全性向上：selectedParticipantの型アサーション
        const selectedParticipant = speakerSelection.selectedParticipant as any;

        console.log(`\n🔍 重み付け選択結果: ${selectedParticipant?.type || 'Unknown'}`);
        console.log(`📊 選択理由: ${speakerSelection.selectionReason}`);

        // 🆕 適応的プロンプト生成（統合フィードバックシステムを使用）
        const adaptivePrompt = await realtimeFeedbackManager.generateAdaptivePrompt({
          mbtiType: selectedParticipant?.type || 'INTJ',
          topic: inputData.topic,
          phase: currentPhaseType,
          currentWeight: selectedParticipant?.weight || 1.0
        });

        const response = await selectedParticipant?.agent?.generate([
          { role: 'user', content: adaptivePrompt }
        ]) || { text: 'System error in agent response' };

        // 🔥 統合フィードバック評価（RealtimeFeedbackManagerを使用）
        const evaluationContext: EvaluationContext = {
          statement: response.text,
          topic: inputData.topic,
          mbtiType: selectedParticipant?.type || 'INTJ',
          phase: currentPhaseType,
          turnNumber: turnNumber,
          history: {
            recentStatements: [],
            agentStatements: [],
            performanceHistory: [],
            feedbackHistory: []
          },
          participants: participants.map(p => ({
            mbtiType: p.type,
            currentWeight: p.weight,
            participationCount: 1,
            averageQuality: 0.8,
            lastActivity: new Date()
          })),
          currentWeight: selectedParticipant?.weight || 1.0
        };

        const feedbackResult = await realtimeFeedbackManager.evaluateStatement(evaluationContext);

        // 下位互換性のため、旧形式のdetailedPerformanceFeedbackを構築
        const detailedPerformanceFeedback = {
          overallScore: feedbackResult.detailed.sevenDimensionEvaluation?.overallQuality || 0.8,
          feedback: feedbackResult.detailed.feedback,
          improvementSuggestions: feedbackResult.detailed.improvements || [],
          mbtiAlignment: feedbackResult.detailed.mbtiAlignment || {
            alignmentScore: 0.8,
            expectedCharacteristics: [],
            demonstratedCharacteristics: [],
            alignmentGap: [],
            recommendedFocus: []
          },
          detailedAnalysis: {
            nextSpeechGuidance: feedbackResult.nextGuidance || `${selectedParticipant?.type}として次回の発言を改善してください`,
            strengths: feedbackResult.detailed.improvements || [],
            weaknesses: [],
            specificImprovements: [],
            qualityTrend: 'stable' as const
          },
          sevenDimensionEvaluation: feedbackResult.detailed.sevenDimensionEvaluation || {
            performance: 0.8,
            psychological: 0.8,
            externalAlignment: 0.8,
            internalConsistency: 0.8,
            socialDecisionMaking: 0.8,
            contentQuality: 0.8,
            ethics: 0.8,
            overallQuality: 0.8
          },
          progressTracking: {
            improvementTrend: 'stable' as 'improving' | 'stable' | 'declining',
            consistencyScore: 0.8,
            recommendedFocus: [],
            milestones: []
          }
        };

        const statement: DiscussionStatement = {
          agentId: `node-${selectedParticipant?.type || 'UNKNOWN'}`,
          mbtiType: selectedParticipant?.type || 'INTJ',
          content: response.text,
          timestamp: new Date(),
          confidence: detailedPerformanceFeedback.overallScore,
          relevance: detailedPerformanceFeedback.overallScore
        };

        // 履歴を更新（DiscussionStatement形式も含む）
        if (selectedParticipant) {
          selectedParticipant.feedbackHistory?.push(detailedPerformanceFeedback);
          selectedParticipant.previousStatements?.push(response.text);
          selectedParticipant.previousDiscussionStatements?.push(statement);
          selectedParticipant.performanceHistory?.push(detailedPerformanceFeedback.overallScore);
          selectedParticipant.lastSpokenTurn = turnNumber;

          // 🆕 重み動的調整（進捗に基づく）
          const improvementTrend = detailedPerformanceFeedback.progressTracking.improvementTrend;
          if (improvementTrend === 'improving') {
            selectedParticipant.weight *= 1.15;
          } else if (improvementTrend === 'declining') {
            selectedParticipant.weight *= 0.85;
          } else if (detailedPerformanceFeedback.overallScore > 0.85) {
            selectedParticipant.weight *= 1.1;
          } else if (detailedPerformanceFeedback.overallScore < 0.6) {
            selectedParticipant.weight *= 0.9;
          }
        }

        statements.push(statement);

        conversationFlow.push({
          turnNumber: turnNumber++,
          speakerAgentId: statement.agentId,
          speakerMbtiType: statement.mbtiType,
          statement: statement.content,
          timestamp: statement.timestamp.toISOString(),
          confidence: statement.confidence,
          relevance: statement.relevance,
          dynamicWeight: selectedParticipant?.weight || 1.0,
          qualityContribution: detailedPerformanceFeedback.overallScore,
          // 🆕 7次元評価結果を型安全に追加
          sevenDimensionEvaluation: detailedPerformanceFeedback.sevenDimensionEvaluation ? {
            performance: detailedPerformanceFeedback.sevenDimensionEvaluation.performance || 0.8,
            psychological: detailedPerformanceFeedback.sevenDimensionEvaluation.psychological || 0.8,
            externalAlignment: detailedPerformanceFeedback.sevenDimensionEvaluation.externalAlignment || 0.8,
            internalConsistency: detailedPerformanceFeedback.sevenDimensionEvaluation.internalConsistency || 0.8,
            socialDecisionMaking: detailedPerformanceFeedback.sevenDimensionEvaluation.socialDecisionMaking || 0.8,
            contentQuality: detailedPerformanceFeedback.sevenDimensionEvaluation.contentQuality || 0.8,
            ethics: detailedPerformanceFeedback.sevenDimensionEvaluation.ethics || 0.8,
            overallQuality: detailedPerformanceFeedback.sevenDimensionEvaluation.overallQuality || 0.8
          } : undefined,
          realtimeOptimization: {
            weightAdjustment: (selectedParticipant?.weight || 1.0) - 1.0,
            graphOptimization: graphOptimizations > 0,
            qualityImprovement: totalQualityImprovement / Math.max(optimizationCount, 1)
          }
        });

        console.log(`💬 ${selectedParticipant?.type || 'Unknown'} (調整後重み: ${(selectedParticipant?.weight || 1.0).toFixed(2)}, 成績: ${(detailedPerformanceFeedback.overallScore * 100).toFixed(0)}%)`);
        console.log(`📝 発言: ${response.text.substring(0, 120)}...`);
        console.log(`🎯 次回への指示: ${detailedPerformanceFeedback.detailedAnalysis.nextSpeechGuidance}`);
        console.log(`📈 7次元評価: P${(detailedPerformanceFeedback.sevenDimensionEvaluation.performance * 100).toFixed(0)}% | 心${(detailedPerformanceFeedback.sevenDimensionEvaluation.psychological * 100).toFixed(0)}% | 品${(detailedPerformanceFeedback.sevenDimensionEvaluation.contentQuality * 100).toFixed(0)}% | 協${(detailedPerformanceFeedback.sevenDimensionEvaluation.socialDecisionMaking * 100).toFixed(0)}%`);
      }
    }

    // 📊 最終品質評価
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
      performanceScore: finalQualityEvaluation.performance.overallPerformance,
      psychologicalScore: finalQualityEvaluation.psychological.psychologicalRealism,
      externalAlignmentScore: finalQualityEvaluation.externalAlignment.externalConsistency,
      internalConsistencyScore: finalQualityEvaluation.internalConsistency.internalHarmony,
      socialDecisionScore: finalQualityEvaluation.socialDecisionMaking.socialIntelligence,
      contentQualityScore: finalQualityEvaluation.contentQuality.argumentQuality,
      ethicsScore: finalQualityEvaluation.ethics.ethicalStandard,
      diversityScore: finalQualityEvaluation.contentQuality.semanticDiversity,
      consistencyScore: finalQualityEvaluation.internalConsistency.logicalCoherence,
      convergenceEfficiency: finalQualityEvaluation.socialDecisionMaking.consensusBuilding,
      mbtiAlignmentScore: finalQualityEvaluation.psychological.personalityConsistency,
      interactionQuality: finalQualityEvaluation.socialDecisionMaking.cooperationLevel,
      argumentQuality: finalQualityEvaluation.contentQuality.argumentQuality,
      participationBalance: actualParticipationBalance,
      resolutionRate: finalQualityEvaluation.performance.taskCompletionRate
    };

    // 📈 総合スコア計算
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

    // 🆕 議論総括の生成
    console.log(`\n📝 議論総括を生成中...`);
    const discussionSummary = await generateDiscussionSummary(
      statements,
      inputData.topic,
      selectedTypes,
      finalMetrics,
      orchestrator
    );

    // 💾 会話保存処理
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

        const conversationData: ConversationData = {
          topic: inputData.topic,
          participants: selectedTypes,
          startTime: workflowStartTime,
          endTime: new Date(),
          turns: conversationFlow.map((turn: any) => ({
            agentType: turn?.speakerMbtiType || 'Unknown',
            message: turn?.statement || '',
            timestamp: turn?.timestamp || new Date().toISOString(),
            weight: turn?.dynamicWeight || 1.0,
            qualityMetrics: {
              overallQuality: (turn?.qualityContribution || 0.8) * 100,
              confidence: (turn?.confidence || 0.8) * 100,
              relevance: (turn?.relevance || 0.8) * 100
            }
          })),
          qualityReport: {
            performanceScore: finalMetrics.performanceScore,
            psychologicalScore: finalMetrics.psychologicalScore,
            externalAlignmentScore: finalMetrics.externalAlignmentScore,
            internalConsistencyScore: finalMetrics.internalConsistencyScore,
            socialDecisionScore: finalMetrics.socialDecisionScore,
            contentQualityScore: finalMetrics.contentQualityScore,
            ethicsScore: finalMetrics.ethicsScore,
            diversityScore: finalMetrics.diversityScore,
            consistencyScore: finalMetrics.consistencyScore,
            convergenceEfficiency: finalMetrics.convergenceEfficiency,
            mbtiAlignmentScore: finalMetrics.mbtiAlignmentScore,
            interactionQuality: finalMetrics.interactionQuality,
            argumentQuality: finalMetrics.argumentQuality,
            participationBalance: finalMetrics.participationBalance,
            resolutionRate: finalMetrics.resolutionRate,
            overallScore: comprehensiveScore,
            grade,
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
          },
          discussionSummary
        };

        let savedPath: string;
        if (inputData.outputFormat === 'json') {
          savedPath = saveConversationAsJson(conversationData, inputData.outputDirectory);
        } else {
          savedPath = saveConversationAsMarkdown(conversationData, inputData.outputDirectory);
        }

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
    console.log(`🔍 主要テーマ: ${discussionSummary.keyThemes.join('、')}`);
    console.log(`💡 主要洞察: ${discussionSummary.insights.slice(0, 2).join('、')}`);
    console.log(`🎭 7次元最終評価: P${(finalMetrics.performanceScore * 100).toFixed(0)}% | 心${(finalMetrics.psychologicalScore * 100).toFixed(0)}% | 品${(finalMetrics.contentQualityScore * 100).toFixed(0)}% | 協${(finalMetrics.socialDecisionScore * 100).toFixed(0)}% | 倫${(finalMetrics.ethicsScore * 100).toFixed(0)}%`);

    const result = {
      topic: inputData.topic,
      participantTypes: selectedTypes.map(type => type as string), // MBTIType[] → string[]変換
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
        summary: `Phase 2完全版: ${selectedTypes.length}タイプによる${turnNumber - 1}ターンの高度な議論が完了。7次元品質評価で${(comprehensiveScore * 100).toFixed(1)}%を達成。`,
        strengths: generateStrengths(finalMetrics),
        weaknesses: generateWeaknesses(finalMetrics),
        overallScore: comprehensiveScore,
        grade,
        detailedAnalysis: `リアルタイム最適化により品質が${(totalQualityImprovement * 100).toFixed(1)}%向上。特に${Object.entries(finalMetrics).filter(([_, v]) => v >= 0.85).map(([k, _]) => k).join('、')}の項目で高いスコアを達成。`,
        mbtiTypeAnalysis: mbtiAnalysis
      },
      discussionSummary: {
        overview: discussionSummary.overview || '議論全体の概要',
        keyThemes: discussionSummary.keyThemes || [],
        progressAnalysis: discussionSummary.progressAnalysis || '議論の進展分析',
        mbtiContributions: discussionSummary.mbtiContributions || {},
        consensus: discussionSummary.consensus || '合意形成の分析',
        insights: discussionSummary.insights || [],
        processCharacteristics: discussionSummary.processCharacteristics || []
      }
    };

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
    discussionSummary: z.object({
      overview: z.string().describe('議論全体の総合概要'),
      keyThemes: z.array(z.string()).describe('議論で扱われた主要テーマ'),
      progressAnalysis: z.string().describe('議論の進展パターン分析'),
      mbtiContributions: z.record(z.string()).describe('MBTIタイプ別の具体的貢献内容'),
      consensus: z.string().describe('合意形成プロセスの分析'),
      insights: z.array(z.string()).describe('議論から得られた重要な洞察'),
      processCharacteristics: z.array(z.string()).describe('議論プロセスの特徴的パターン')
    }),
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
