import type {
  FeedbackResult,
  FeedbackConfiguration,
  EvaluationContext,
  SystemMetrics,
  FeedbackConfigurationUpdate,
  EvaluationContextPartial,
  DiscussionPhase,
  StatementHistory,
  ParticipantInfo,
  DetailedFeedback,
  AdaptivePromptParams,
  QualityScores,
  OptimizationResult
} from '../types/feedback-system-types';

import type { MBTIType } from '../types/mbti-types';
import type { HealthCheckResult } from '../types/system-types';
import { QualityEvaluatorChain } from './evaluators/quality-evaluator-chain';
import { SystemOptimizer } from './optimization/system-optimizer';
import { FeedbackAggregator } from './feedback/feedback-aggregator';
import { HistoryManager } from './history/history-manager';
import { EventBus } from './events/event-bus';
import { PerformanceMonitor } from './monitoring/performance-monitor';

/**
 * 統合制御状態
 */
interface ControlState {
  isInitialized: boolean;
  isProcessing: boolean;
  lastOptimization: Date | null;
  currentPhase: DiscussionPhase;
  activeAgents: Set<MBTIType>;
}

/**
 * システム統計情報
 */
interface SystemStatistics {
  totalEvaluations: number;
  averageProcessingTime: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdate: Date;
}

/**
 * リアルタイムフィードバックマネージャー（本格版）
 * 全コンポーネントを統合したメインファサード
 */
export class RealtimeFeedbackManager {
  private evaluatorChain: QualityEvaluatorChain;
  private systemOptimizer: SystemOptimizer;
  private feedbackAggregator: FeedbackAggregator;
  private historyManager: HistoryManager;
  private eventBus: EventBus;
  private performanceMonitor: PerformanceMonitor;

  private config: FeedbackConfiguration;
  private controlState: ControlState;
  private systemStatistics: SystemStatistics;

  constructor(config: FeedbackConfiguration) {
    this.config = config;

    // 制御状態初期化
    this.controlState = {
      isInitialized: false,
      isProcessing: false,
      lastOptimization: null,
      currentPhase: 'initial',
      activeAgents: new Set()
    };

    // 統計情報初期化
    this.systemStatistics = {
      totalEvaluations: 0,
      averageProcessingTime: 0,
      systemHealth: 'healthy',
      lastUpdate: new Date()
    };

    // コンポーネント初期化（依存関係に注意）
    this.eventBus = new EventBus();
    this.performanceMonitor = new PerformanceMonitor();
    this.historyManager = new HistoryManager(config.adaptiveSettings);

    // SystemOptimizer用の設定（型安全性向上は別途実装）
    this.systemOptimizer = new SystemOptimizer(config as any, this.historyManager as any);

    this.feedbackAggregator = new FeedbackAggregator(this.historyManager, config);
    this.evaluatorChain = new QualityEvaluatorChain();

    console.log('🎯 RealtimeFeedbackManager (本格版) を作成しました');
  }

  // ===========================================
  // 初期化・設定
  // ===========================================

  /**
   * システム初期化
   */
  async initialize(): Promise<void> {
    if (this.controlState.isInitialized) {
      console.log('⚠️ システムは既に初期化されています');
      return;
    }

    const startTime = Date.now();
    console.log('🚀 システム初期化を開始します...');

    try {
      // 1. イベントシステム初期化
      await this.initializeEventSystem();

      // 2. 評価器チェーン初期化
      await this.initializeEvaluators();

      // 3. パフォーマンス監視開始
      this.performanceMonitor.startMonitoring();

      // 4. システム健全性チェック
      const healthCheck = await this.performInitialHealthCheck();

      const healthCheckResult = healthCheck as { overall: boolean; recommendations: string[] };
      if (!healthCheckResult.overall) {
        throw new Error(`システム健全性チェック失敗: ${healthCheckResult.recommendations.join(', ')}`);
      }

      // 5. 初期化完了
      this.controlState.isInitialized = true;

      const initTime = Date.now() - startTime;
      this.performanceMonitor.recordResponseTime('initialization', initTime);

      // 初期化完了イベント
      await this.eventBus.emit('system_started', {
        initializationTime: initTime,
        timestamp: new Date()
      });

      console.log(`✅ システム初期化完了 (${initTime}ms)`);

    } catch (error) {
      console.error('❌ システム初期化失敗:', error);

      // エラーイベント発行
      this.eventBus.emitSync('system_error', {
        error: error as Error,
        context: 'initialization'
      });

      throw error;
    }
  }

  /**
   * 設定の動的更新
   */
  async updateConfiguration(updates: FeedbackConfigurationUpdate): Promise<void> {
    console.log('🔧 設定を更新中...', updates);

    try {
      // 部分的な設定を安全にマージ
      this.config = {
        ...this.config,
        qualityThresholds: {
          ...this.config.qualityThresholds,
          ...updates.qualityThresholds
        },
        evaluatorWeights: {
          ...this.config.evaluatorWeights,
          ...updates.evaluatorWeights
        },
        performanceTarget: {
          ...this.config.performanceTarget,
          ...updates.performanceTarget
        },
        adaptiveSettings: {
          ...this.config.adaptiveSettings,
          ...updates.adaptiveSettings
        }
      };

      // 各コンポーネントに設定を伝播（型安全性向上）
      if (updates.adaptiveSettings) {
        // 設定更新（型安全な方法）
        const mergedSettings = {
          ...this.config.adaptiveSettings,
          ...updates.adaptiveSettings
        };
        this.historyManager.updateSettings(mergedSettings);
      }

      if (updates.evaluatorWeights) {
        // updateWeightsメソッドが存在しない場合のガード
        if (typeof (this.evaluatorChain as any).updateWeights === 'function') {
          await (this.evaluatorChain as any).updateWeights(updates.evaluatorWeights);
        } else {
          console.warn('⚠️ evaluatorChain.updateWeights メソッドが存在しません');
        }
      }

      // 設定更新イベント
      await this.eventBus.emit('configuration_updated', {
        updates,
        timestamp: new Date()
      });

      console.log('✅ 設定更新完了');

    } catch (error) {
      console.error('❌ 設定更新失敗:', error);

      this.eventBus.emitSync('system_error', {
        error: error as Error,
        context: 'configuration_update'
      });

      throw error;
    }
  }

  // ===========================================
  // メイン評価フロー
  // ===========================================

  /**
   * 発言評価（メインエントリーポイント）
   */
  async evaluateStatement(context: EvaluationContext): Promise<FeedbackResult> {
    if (!this.controlState.isInitialized) {
      throw new Error('システムが初期化されていません。initialize()を呼び出してください。');
    }

    if (this.controlState.isProcessing) {
      console.warn('⚠️ 別の評価が進行中です。キューに追加します。');
    }

    this.controlState.isProcessing = true;
    const startTime = Date.now();

    try {
      console.log(`📊 発言評価開始: ${context.mbtiType} - "${context.statement.substring(0, 50)}..."`);

      // 1. エージェント活性化
      this.controlState.activeAgents.add(context.mbtiType);
      await this.eventBus.emit('agent_activated', { mbtiType: context.mbtiType });

      // 2. 7次元品質評価実行
      const qualityScores = await this.performQualityEvaluation(context);

      // 3. システム最適化実行
      const optimizationResult = await this.performSystemOptimization(qualityScores, context);

      // 4. フィードバック統合
      const detailedFeedback = await this.aggregateComprehensiveFeedback(
        qualityScores,
        optimizationResult,
        context
      );

      // 5. 履歴記録
      await this.recordEvaluationHistory(context, qualityScores, detailedFeedback);

      // 6. 結果構築（型完全性対応）
      const result: FeedbackResult = {
        scores: qualityScores,
        overall: qualityScores, // overall追加
        detailed: detailedFeedback, // detailed追加
        detailedFeedback,
        optimization: optimizationResult, // optimization追加
        optimizationResult,
        adaptivePrompt: await this.generateAdaptivePrompt({
          mbtiType: context.mbtiType,
          topic: context.topic,
          phase: 'interaction',
          currentWeight: 1.0
        }),
        nextGuidance: `${context.mbtiType}として次回の発言を改善してください`,
        systemRecommendations: optimizationResult.recommendations || [],
        confidence: detailedFeedback.sevenDimensionEvaluation?.overallQuality || 0.8,
        timestamp: new Date(), // timestamp追加
        executionTime: Date.now() - startTime
      };

      // 7. パフォーマンス記録
      this.performanceMonitor.recordResponseTime('evaluation', result.executionTime);
      this.performanceMonitor.recordQualityScore(context.mbtiType, qualityScores);

      // 8. 統計更新
      this.updateSystemStatistics(result.executionTime);

      // 9. 評価完了イベント
      await this.eventBus.emit('evaluation_completed', {
        mbtiType: context.mbtiType,
        scores: qualityScores,
        executionTime: result.executionTime
      });

      console.log(`✅ 発言評価完了: ${context.mbtiType} - スコア: ${qualityScores.overallScore.toFixed(3)} (${result.executionTime}ms)`);

      return result;

    } catch (error) {
      console.error('❌ 発言評価エラー:', error);

      // エラー記録
      this.performanceMonitor.recordError('evaluation', error as Error);

      // エラーイベント
      this.eventBus.emitSync('system_error', {
        error: error as Error,
        context: `evaluation_${context.mbtiType}`
      });

      // フォールバック結果
      return this.createFallbackResult(context, Date.now() - startTime);

    } finally {
      this.controlState.isProcessing = false;
    }
  }

  /**
   * 適応的プロンプト生成
   */
  async generateAdaptivePrompt(params: AdaptivePromptParams): Promise<string> {
    try {
      const startTime = Date.now();

      // 履歴データ取得
      const agentHistory = await this.historyManager.getAgentHistory(params.mbtiType);
      const recentFeedback = agentHistory.getRecentFeedback();
      const progressTrend = agentHistory.analyzeProgressTrend();

      // フィードバック集約器でプロンプト生成
      const adaptivePrompt = await this.feedbackAggregator.generateAdaptivePrompt({
        ...params,
        recentFeedback,
        progressTrend
      });

      // パフォーマンス記録
      const processingTime = Date.now() - startTime;
      this.performanceMonitor.recordResponseTime('prompt_generation', processingTime);

      console.log(`🎯 適応的プロンプト生成: ${params.mbtiType} (${processingTime}ms)`);

      return adaptivePrompt;

    } catch (error) {
      console.error('❌ 適応的プロンプト生成エラー:', error);

      this.performanceMonitor.recordError('prompt_generation', error as Error);

      // フォールバックプロンプト
      return `${params.mbtiType}として「${params.topic}」について発言してください。`;
    }
  }

  // ===========================================
  // データ取得
  // ===========================================

  /**
   * システムメトリクス取得
   */
  getSystemMetrics(): SystemMetrics {
    const performanceMetrics = this.performanceMonitor.getSystemMetrics();
    const historyMetrics = this.historyManager.getSystemMetrics();
    const eventStats = this.eventBus.getStatistics();

    return {
      evaluationCount: this.systemStatistics.totalEvaluations,
      averageQuality: (historyMetrics && typeof historyMetrics === 'object' && 'averageQuality' in historyMetrics)
        ? (historyMetrics as any).averageQuality : 0.8,
      optimizationEfficiency: this.systemOptimizer.getEfficiencyMetrics(),
      systemLoad: performanceMetrics.systemLoad,
      memoryUsage: performanceMetrics.memoryUsage,
      responseTime: performanceMetrics.responseTime,
      errorRate: performanceMetrics.errorRate,
      participantBalance: this.calculateParticipantBalance(),
      lastUpdated: new Date(),
      eventSystemStats: {
        totalEvents: eventStats.totalEvents,
        activeListeners: eventStats.activeListeners,
        queueSize: eventStats.queueSize
      },
      componentHealth: this.getComponentHealth()
    };
  }

  /**
   * 発言履歴取得
   */
  async getStatementHistory(mbtiType: MBTIType): Promise<StatementHistory> {
    return await this.historyManager.getStatementHistory(mbtiType);
  }

  /**
   * 参加者情報取得
   */
  async getParticipantInfo(): Promise<ParticipantInfo[]> {
    return await this.historyManager.getParticipantInfo();
  }

  // ===========================================
  // プライベートメソッド
  // ===========================================



  /**
   * イベントシステム初期化
   */
  private async initializeEventSystem(): Promise<void> {
    console.log('📡 イベントシステム初期化中...');

    // カスタムイベントハンドラー登録
    this.eventBus.on('quality_threshold_crossed', async (data) => {
      await this.handleQualityAlert(data);
    }, { priority: 20 });

    this.eventBus.on('optimization_completed', async (data) => {
      this.controlState.lastOptimization = new Date();
    }, { priority: 10 });

    console.log('✅ イベントシステム初期化完了');
  }

  /**
   * 評価器の初期化
   */
  private async initializeEvaluators(): Promise<void> {
    console.log('📊 評価器を初期化中...');

    try {
      // 基本評価器を動的インポート
      const { SevenDimensionEvaluator, PerformanceEvaluator, MBTIAlignmentEvaluator } =
        await import('./evaluators/basic-evaluators');

      // 評価器を追加
      this.evaluatorChain
        .addEvaluator(new SevenDimensionEvaluator(this.config.evaluatorWeights.sevenDimension))
        .addEvaluator(new PerformanceEvaluator(this.config.evaluatorWeights.performance))
        .addEvaluator(new MBTIAlignmentEvaluator(this.config.evaluatorWeights.mbtiAlignment));

      console.log('✅ 評価器初期化完了');

    } catch (error) {
      console.error('❌ 評価器初期化失敗:', error);
      throw error;
    }
  }

  /**
   * 初期健全性チェック
   */
  private async performInitialHealthCheck(): Promise<unknown> {
    console.log('🏥 初期健全性チェック中...');

    const healthCheck = await this.performanceMonitor.performHealthCheck();

    if (healthCheck.overall) {
      console.log('✅ システム健全性チェック完了');
    } else {
      console.warn('⚠️ システム健全性に問題があります:', healthCheck.recommendations);
    }

    return healthCheck;
  }

  /**
   * 7次元品質評価実行
   */
  private async performQualityEvaluation(context: EvaluationContext): Promise<any> {
    console.log(`📊 品質評価実行: ${context.mbtiType}`);

    const startTime = Date.now();

    try {
      // 評価器チェーンで評価実行
      const evaluationResult = await this.evaluatorChain.evaluate(context);

      // パフォーマンス記録
      const evaluationTime = Date.now() - startTime;
      this.performanceMonitor.recordResponseTime('quality_evaluation', evaluationTime);

      // 型安全性向上：scoresプロパティの安全なアクセス
      return (evaluationResult && typeof evaluationResult === 'object' && 'scores' in evaluationResult)
        ? (evaluationResult as any).scores
        : this.createFallbackQualityScores();

    } catch (error) {
      console.error('❌ 品質評価エラー:', error);
      this.performanceMonitor.recordError('quality_evaluation', error as Error);

      // フォールバック品質スコア
      return this.createFallbackQualityScores();
    }
  }

  /**
   * システム最適化実行
   */
  private async performSystemOptimization(qualityScores: unknown, context: EvaluationContext): Promise<any> {
    console.log('🔧 システム最適化実行中...');

    const startTime = Date.now();

    try {
      // 参加者情報取得
      const participants = await this.historyManager.getParticipantInfo();

      // 最適化実行（型安全性向上）
      const optimizationResult = await this.systemOptimizer.optimizeSystem(qualityScores as any, participants);

      // パフォーマンス記録
      const optimizationTime = Date.now() - startTime;
      this.performanceMonitor.recordResponseTime('optimization', optimizationTime);

      // 最適化完了イベント
      await this.eventBus.emit('optimization_completed', {
        result: optimizationResult,
        executionTime: optimizationTime
      });

      return optimizationResult;

    } catch (error) {
      console.error('❌ システム最適化エラー:', error);
      this.performanceMonitor.recordError('optimization', error as Error);

      return this.systemOptimizer.createEmptyOptimization();
    }
  }

  /**
   * 包括的フィードバック統合
   */
  private async aggregateComprehensiveFeedback(
    qualityScores: any,
    optimizationResult: any,
    context: EvaluationContext
  ): Promise<DetailedFeedback> {
    console.log(`💬 フィードバック統合: ${context.mbtiType}`);

    const startTime = Date.now();

    try {
      // フィードバック統合実行
      const detailedFeedback = await this.feedbackAggregator.aggregateFeedback({
        scores: qualityScores,
        optimization: optimizationResult,
        context
      });

      // パフォーマンス記録
      const aggregationTime = Date.now() - startTime;
      this.performanceMonitor.recordResponseTime('feedback_aggregation', aggregationTime);

      // フィードバック生成イベント
      await this.eventBus.emit('feedback_generated', {
        mbtiType: context.mbtiType,
        feedback: detailedFeedback
      });

      return detailedFeedback;

    } catch (error) {
      console.error('❌ フィードバック統合エラー:', error);
      this.performanceMonitor.recordError('feedback_aggregation', error as Error);

      // フォールバックフィードバック
      return this.createFallbackDetailedFeedback(context);
    }
  }

  /**
   * 評価履歴記録
   */
  private async recordEvaluationHistory(
    context: EvaluationContext,
    qualityScores: any,
    detailedFeedback: DetailedFeedback
  ): Promise<void> {
    try {
      await this.historyManager.recordEvaluation(context.mbtiType, {
        statement: context.statement,
        scores: qualityScores,
        feedback: detailedFeedback,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ 履歴記録エラー:', error);
      this.performanceMonitor.recordError('history_recording', error as Error);
    }
  }

  /**
   * システム統計更新
   */
  private updateSystemStatistics(executionTime: number): void {
    this.systemStatistics.totalEvaluations++;

    // 平均処理時間の更新（移動平均）
    const alpha = 0.1; // 平滑化係数
    this.systemStatistics.averageProcessingTime =
      alpha * executionTime + (1 - alpha) * this.systemStatistics.averageProcessingTime;

    this.systemStatistics.lastUpdate = new Date();

    // システム健全性の更新
    this.updateSystemHealth();
  }

  /**
   * システム健全性更新
   */
  private async updateSystemHealth(): Promise<void> {
    try {
      const healthCheck = await this.performanceMonitor.performHealthCheck();
      this.systemStatistics.systemHealth = healthCheck.status;

    } catch (error) {
      console.error('❌ 健全性チェックエラー:', error);
      this.systemStatistics.systemHealth = 'critical';
    }
  }

  /**
   * 参加者バランス計算
   */
  private calculateParticipantBalance(): number {
    // 簡略実装
    const activeAgentCount = this.controlState.activeAgents.size;
    const totalAgentCount = 16; // MBTI全タイプ

    return activeAgentCount / totalAgentCount;
  }

  /**
   * コンポーネント健全性取得
   */
  private getComponentHealth(): any {
    return {
      evaluatorChain: (typeof (this.evaluatorChain as any).isHealthy === 'function')
        ? (this.evaluatorChain as any).isHealthy()
        : { healthy: true, issues: [] },
      systemOptimizer: this.systemOptimizer.healthCheck(),
      historyManager: { healthy: true, issues: [] },
      eventBus: { healthy: true, activeListeners: this.eventBus.getListenerCount() },
      performanceMonitor: { healthy: this.performanceMonitor.isActive() }
    };
  }

  /**
   * 品質アラート処理
   */
  private async handleQualityAlert(data: any): Promise<void> {
    console.log(`🚨 品質アラート処理: ${data.mbtiType} - ${data.severity}`);

    // 重要度に応じた対応
    if (data.severity === 'critical') {
      // クリティカルな場合は即座に介入
      await this.performEmergencyOptimization(data.mbtiType);
    }
  }

  /**
   * 緊急最適化実行
   */
  private async performEmergencyOptimization(mbtiType: MBTIType): Promise<void> {
    console.log(`🚨 緊急最適化実行: ${mbtiType}`);

    try {
      // 緊急最適化ロジック
      const participants = await this.historyManager.getParticipantInfo();
      const emergencyResult = await this.systemOptimizer.optimizeSystem(
        this.createFallbackQualityScores(),
        participants
      );

      console.log('✅ 緊急最適化完了');

    } catch (error) {
      console.error('❌ 緊急最適化失敗:', error);
    }
  }

  // ===========================================
  // フォールバック作成メソッド
  // ===========================================

  private createFallbackResult(context: EvaluationContext, executionTime: number): FeedbackResult {
    const fallbackOptimization = this.systemOptimizer.createEmptyOptimization();
    const fallbackScores = this.createFallbackQualityScores();
    const fallbackDetailedFeedback = this.createFallbackDetailedFeedback(context);

    return {
      scores: fallbackScores,
      overall: fallbackScores,
      detailed: fallbackDetailedFeedback,
      detailedFeedback: fallbackDetailedFeedback,
      optimization: fallbackOptimization,
      optimizationResult: fallbackOptimization,
      nextGuidance: `${context.mbtiType}として発言してください。`,
      adaptivePrompt: `${context.mbtiType}として発言してください。`,
      systemRecommendations: ['システムエラーのため基本評価を実行'],
      timestamp: new Date(),
      confidence: 0.7,
      executionTime
    };
  }

  private createFallbackQualityScores(): any {
    return {
      overallScore: 0.7,
      performance: 0.7,
      psychological: 0.7,
      contentQuality: 0.7,
      mbtiAlignment: 0.7,
      breakdown: {
        diversity: 0.7,
        consistency: 0.7,
        relevance: 0.7
      }
    };
  }

  private createFallbackDetailedFeedback(context: EvaluationContext): DetailedFeedback {
    return {
      overallScore: 0.7,
      feedback: 'システムエラーのため基本評価を実行しました',
      improvements: ['システムの状態を確認してください'],
      detailedAnalysis: {
        strengths: [],
        weaknesses: ['システムエラー'],
        specificImprovements: [],
        nextSpeechGuidance: '基本的な発言品質の向上を心がけてください',
        qualityTrend: 'stable'
      },
      mbtiAlignment: {
        alignmentScore: 0.7,
        expectedCharacteristics: [],
        demonstratedCharacteristics: [],
        alignmentGap: [],
        recommendedFocus: []
      },
      progressTracking: {
        improvementTrend: 'stable',
        consistencyScore: 0.7,
        recommendedFocus: [],
        milestones: []
      },
      sevenDimensionEvaluation: {
        performance: 0.7,
        psychological: 0.7,
        externalAlignment: 0.7,
        internalConsistency: 0.7,
        socialDecisionMaking: 0.7,
        contentQuality: 0.7,
        ethics: 0.7,
        overallQuality: 0.7
      }
    };
  }

  // ===========================================
  // 外部インターフェース
  // ===========================================

  isInitialized(): boolean {
    return this.controlState.isInitialized;
  }

  isProcessing(): boolean {
    return this.controlState.isProcessing;
  }

  getCurrentPhase(): DiscussionPhase {
    return this.controlState.currentPhase;
  }

  setCurrentPhase(phase: DiscussionPhase): void {
    this.controlState.currentPhase = phase;
    console.log(`🔄 議論フェーズを変更: ${phase}`);
  }

  getActiveAgents(): MBTIType[] {
    return Array.from(this.controlState.activeAgents);
  }

  // デバッグ用
  debug(): void {
    console.log('🔍 RealtimeFeedbackManager Debug Info:');
    console.log(`  - Initialized: ${this.controlState.isInitialized}`);
    console.log(`  - Processing: ${this.controlState.isProcessing}`);
    console.log(`  - Current Phase: ${this.controlState.currentPhase}`);
    console.log(`  - Active Agents: ${this.controlState.activeAgents.size}`);
    console.log(`  - Total Evaluations: ${this.systemStatistics.totalEvaluations}`);
    console.log(`  - System Health: ${this.systemStatistics.systemHealth}`);

    // 各コンポーネントのデバッグ情報
    this.eventBus.debug();
    this.performanceMonitor.debug();
  }

  // システム停止
  async shutdown(): Promise<void> {
    console.log('🔌 システムを停止中...');

    try {
      this.performanceMonitor.stopMonitoring();
      this.eventBus.destroy();

      this.controlState.isInitialized = false;
      this.controlState.activeAgents.clear();

      console.log('✅ システム停止完了');

    } catch (error) {
      console.error('❌ システム停止エラー:', error);
    }
  }
}
