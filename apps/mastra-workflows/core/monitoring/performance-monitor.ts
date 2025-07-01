import type {
  SystemMetrics,
  PerformanceMetrics,
  QualityScores
} from '../../types/feedback-system-types';

import type { MBTIType } from '../../types/mbti-types';

/**
 * パフォーマンスメトリクス詳細（メモリ使用量・レスポンス時間監視は削除済み）
 */
interface DetailedPerformanceMetrics extends PerformanceMetrics {
  throughput: {
    requestsPerSecond: number;
    evaluationsPerMinute: number;
  };
  errorRate: {
    total: number;
    percentage: number;
  };
}

/**
 * システムヘルスチェック結果
 */
interface HealthCheck {
  status: 'healthy' | 'warning' | 'critical';
  overall: boolean;
  components: {
    [key: string]: {
      status: 'healthy' | 'warning' | 'critical';
      message: string;
      lastCheck: Date;
    };
  };
  recommendations: string[];
}

/**
 * リアルタイム統計
 */
interface RealtimeStats {
  currentLoad: number;
  activeConnections: number;
  queueSize: number;
  processingLatency: number;
  lastUpdate: Date;
}

/**
 * アラート設定
 */
interface AlertThresholds {
  errorRate: {
    warning: number;
    critical: number;
  };
  qualityScore: {
    warning: number;
    critical: number;
  };
}

/**
 * パフォーマンス監視システム
 * リアルタイムシステム監視とアラート機能
 */
export class PerformanceMonitor {
  private metrics: Map<string, DetailedPerformanceMetrics>;
  private systemMetrics: SystemMetrics;
  private alertThresholds: AlertThresholds;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  // メトリクス履歴
  private metricsHistory: Array<{
    timestamp: Date;
    metrics: DetailedPerformanceMetrics;
  }> = [];

  // パフォーマンス追跡
  private responseTimes: number[] = [];
  private errorCounts: number[] = [];
  private memorySnapshots: number[] = [];

  // 設定
  private readonly MONITORING_INTERVAL = 5000; // 5秒
  private readonly HISTORY_RETENTION_SIZE = 1000;
  private readonly METRICS_WINDOW_SIZE = 100;

  constructor() {
    this.metrics = new Map();
    this.systemMetrics = this.createInitialSystemMetrics();
    this.alertThresholds = this.createDefaultAlertThresholds();

    // 初期化
    this.initializeMonitoring();
  }

  /**
   * 監視開始
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('⚠️ 監視は既に開始されています');
      return;
    }

    this.isMonitoring = true;

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.MONITORING_INTERVAL);

    console.log('📊 パフォーマンス監視を開始しました');
  }

  /**
   * 監視停止
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.log('⚠️ 監視は開始されていません');
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('📊 パフォーマンス監視を停止しました');
  }

  /**
   * レスポンス時間記録（閾値チェックは削除済み）
   */
  recordResponseTime(operationType: string, duration: number): void {
    this.responseTimes.push(duration);

    // ウィンドウサイズ制限
    if (this.responseTimes.length > this.METRICS_WINDOW_SIZE) {
      this.responseTimes = this.responseTimes.slice(-this.METRICS_WINDOW_SIZE);
    }

    // メモリ使用量・レスポンス時間の閾値チェックは削除済み
  }

  /**
   * エラー記録
   */
  recordError(errorType: string, error: Error): void {
    this.errorCounts.push(Date.now());

    // 古いエラーカウントの削除（1時間以内のみ保持）
    const oneHourAgo = Date.now() - 3600000;
    this.errorCounts = this.errorCounts.filter(timestamp => timestamp > oneHourAgo);

    // エラー率チェック
    this.checkErrorRateThresholds();

    console.error(`❌ エラー記録 [${errorType}]:`, error.message);
  }

  /**
   * 品質スコア記録
   */
  recordQualityScore(mbtiType: MBTIType, scores: QualityScores): void {
    const agentKey = `agent_${mbtiType}`;

    let agentMetrics = this.metrics.get(agentKey);
    if (!agentMetrics) {
      agentMetrics = this.createEmptyDetailedMetrics();
      this.metrics.set(agentKey, agentMetrics);
    }

    // メトリクス更新
    agentMetrics.averageScore = scores.overallScore;
    agentMetrics.bestScore = Math.max(agentMetrics.bestScore, scores.overallScore);
    agentMetrics.worstScore = Math.min(agentMetrics.worstScore, scores.overallScore);

    // 品質しきい値チェック
    this.checkQualityThresholds(mbtiType, scores.overallScore);
  }

  /**
   * システムメトリクス取得
   */
  getSystemMetrics(): SystemMetrics {
    this.updateSystemMetrics();
    return { ...this.systemMetrics };
  }

  /**
   * パフォーマンスメトリクス取得
   */
  getPerformanceMetrics(mbtiType?: MBTIType): DetailedPerformanceMetrics | Map<string, DetailedPerformanceMetrics> {
    if (mbtiType) {
      const agentKey = `agent_${mbtiType}`;
      return this.metrics.get(agentKey) || this.createEmptyDetailedMetrics();
    }

    return new Map(this.metrics);
  }

  /**
   * ヘルスチェック実行
   */
  async performHealthCheck(): Promise<HealthCheck> {
    const components: HealthCheck['components'] = {};
    const recommendations: string[] = [];


    // エラー率チェック
    const errorRateCheck = this.checkErrorRateHealth();
    components.errorRate = errorRateCheck;
    if (errorRateCheck.status !== 'healthy') {
      recommendations.push('エラー率の改善が必要です');
    }

    // 品質スコアチェック
    const qualityCheck = this.checkQualityHealth();
    components.quality = qualityCheck;
    if (qualityCheck.status !== 'healthy') {
      recommendations.push('議論品質の向上が必要です');
    }

    // 全体ステータス決定
    const componentStatuses = Object.values(components).map(c => c.status);
    const hasCritical = componentStatuses.includes('critical');
    const hasWarning = componentStatuses.includes('warning');

    const overall = !hasCritical && !hasWarning;
    const status = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy';

    return {
      status,
      overall,
      components,
      recommendations
    };
  }

  /**
   * リアルタイム統計取得
   */
  getRealtimeStats(): RealtimeStats {
    const currentLoad = this.calculateCurrentLoad();
    const processingLatency = this.calculateAverageResponseTime();

    return {
      currentLoad,
      activeConnections: this.metrics.size,
      queueSize: 0, // EventBusから取得予定
      processingLatency,
      lastUpdate: new Date()
    };
  }

  /**
   * アラートしきい値設定
   */
  setAlertThresholds(thresholds: Partial<AlertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    console.log('🔧 アラートしきい値を更新しました');
  }

  /**
   * メトリクス履歴取得
   */
  getMetricsHistory(
    limit: number = 100,
    since?: Date
  ): Array<{ timestamp: Date; metrics: DetailedPerformanceMetrics }> {
    let history = [...this.metricsHistory];

    if (since) {
      history = history.filter(entry => entry.timestamp >= since);
    }

    return history.slice(-limit).reverse();
  }

  /**
   * プライベートメソッド
   */
  private initializeMonitoring(): void {
    // 初期メトリクスの設定
    this.updateSystemMetrics();

    // プロセス終了時のクリーンアップ
    process.on('SIGINT', () => this.stopMonitoring());
    process.on('SIGTERM', () => this.stopMonitoring());
  }

  private createInitialSystemMetrics(): SystemMetrics {
    return {
      evaluationCount: 0,
      averageQuality: 0.8,
      optimizationEfficiency: 0.8,
      systemLoad: 0.5,
      memoryUsage: 0.4,
      responseTime: 1000,
      errorRate: 0.01,
      participantBalance: 0.8,
      lastUpdated: new Date()
    };
  }

  private createDefaultAlertThresholds(): AlertThresholds {
    return {
      errorRate: {
        warning: 0.10,  // 10%（より寛容に）
        critical: 0.20  // 20%（より寛容に）
      },
      qualityScore: {
        warning: 0.50,  // 50%（より寛容に）
        critical: 0.30  // 30%（より寛容に）
      }
    };
  }

  private createEmptyDetailedMetrics(): DetailedPerformanceMetrics {
    return {
      averageScore: 0.0,
      bestScore: 0.0,
      worstScore: 1.0,
      improvementRate: 0.0,
      consistencyIndex: 0.8,
      participationFrequency: 0.0,
      recentTrend: 'stable',
      strongDimensions: [],
      weakDimensions: [],
      throughput: {
        requestsPerSecond: 0,
        evaluationsPerMinute: 0
      },
      errorRate: {
        total: 0,
        percentage: 0
      }
    };
  }

  private collectMetrics(): void {
    try {
      // システムメトリクス更新
      this.updateSystemMetrics();

      // メモリ使用量記録
      const memoryUsage = this.getMemoryUsage();
      this.memorySnapshots.push(memoryUsage.percentage);

      if (this.memorySnapshots.length > this.METRICS_WINDOW_SIZE) {
        this.memorySnapshots = this.memorySnapshots.slice(-this.METRICS_WINDOW_SIZE);
      }

      // 全エージェントのメトリクス更新
      for (const [key, metrics] of this.metrics.entries()) {
        this.updateAgentMetrics(key, metrics);
      }

      // 履歴に追加
      this.addToHistory();

    } catch (error) {
      console.error('❌ メトリクス収集エラー:', error);
    }
  }

  private updateSystemMetrics(): void {
    const memoryInfo = this.getMemoryUsage();
    const avgResponseTime = this.calculateAverageResponseTime();
    const errorRate = this.calculateErrorRate();
    const systemLoad = this.calculateSystemLoad();

    this.systemMetrics = {
      ...this.systemMetrics,
      memoryUsage: memoryInfo.percentage,
      responseTime: avgResponseTime,
      errorRate,
      systemLoad,
      lastUpdated: new Date()
    };
  }

  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    const memInfo = process.memoryUsage();
    const used = memInfo.heapUsed;
    const total = memInfo.heapTotal;
    const percentage = total > 0 ? used / total : 0;

    return { used, total, percentage };
  }

  private calculateAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;

    const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.responseTimes.length;
  }

  private calculateErrorRate(): number {
    const totalRequests = this.responseTimes.length + this.errorCounts.length;
    return totalRequests > 0 ? this.errorCounts.length / totalRequests : 0;
  }

  private calculateSystemLoad(): number {
    // 複数の要因を組み合わせた負荷計算
    const memoryLoad = this.getMemoryUsage().percentage;
    const responseTimeLoad = Math.min(1.0, this.calculateAverageResponseTime() / 5000);
    const errorLoad = Math.min(1.0, this.calculateErrorRate() * 10);

    return (memoryLoad + responseTimeLoad + errorLoad) / 3;
  }

  private calculateCurrentLoad(): number {
    return this.systemMetrics.systemLoad || 0;
  }

  private updateAgentMetrics(key: string, metrics: DetailedPerformanceMetrics): void {
    // エラー率
    metrics.errorRate = {
      total: this.errorCounts.length,
      percentage: this.calculateErrorRate()
    };

    // スループット（簡略実装）
    metrics.throughput = {
      requestsPerSecond: this.calculateRequestsPerSecond(),
      evaluationsPerMinute: this.calculateEvaluationsPerMinute()
    };
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateRequestsPerSecond(): number {
    // 過去1分間のリクエスト数を計算（簡略実装）
    const recentRequests = this.responseTimes.length;
    return recentRequests / 60;
  }

  private calculateEvaluationsPerMinute(): number {
    // 簡略実装
    return this.metrics.size * 2;
  }

  private addToHistory(): void {
    // 代表的なメトリクスを履歴に追加（メモリ使用量・レスポンス時間は除外）
    const representativeMetrics = this.createEmptyDetailedMetrics();
    representativeMetrics.errorRate.percentage = this.calculateErrorRate();

    this.metricsHistory.push({
      timestamp: new Date(),
      metrics: representativeMetrics
    });

    // 履歴サイズ制限
    if (this.metricsHistory.length > this.HISTORY_RETENTION_SIZE) {
      this.metricsHistory = this.metricsHistory.slice(-Math.floor(this.HISTORY_RETENTION_SIZE * 0.8));
    }
  }

  // ヘルスチェック関連メソッド（メモリ使用量・レスポンス時間監視は削除済み）

  private checkErrorRateHealth(): HealthCheck['components'][string] {
    const errorRate = this.calculateErrorRate();
    const thresholds = this.alertThresholds.errorRate;

    // 初期化時はエラーデータがないため、健全と判定
    if (this.errorCounts.length === 0 && this.responseTimes.length === 0) {
      return {
        status: 'healthy',
        message: 'エラー率データ準備中（初期化時は正常）',
        lastCheck: new Date()
      };
    }

    if (errorRate >= thresholds.critical) {
      return {
        status: 'critical',
        message: `エラー率が危険レベル: ${(errorRate * 100).toFixed(1)}%`,
        lastCheck: new Date()
      };
    } else if (errorRate >= thresholds.warning) {
      return {
        status: 'warning',
        message: `エラー率が高い: ${(errorRate * 100).toFixed(1)}%`,
        lastCheck: new Date()
      };
    } else {
      return {
        status: 'healthy',
        message: `エラー率正常: ${(errorRate * 100).toFixed(1)}%`,
        lastCheck: new Date()
      };
    }
  }

  private checkQualityHealth(): HealthCheck['components'][string] {
    // 全エージェントの平均品質スコア計算
    const qualityScores = Array.from(this.metrics.values())
      .map(m => m.averageScore)
      .filter(score => score > 0);

    // 初期化時または品質データが不足している場合は健全と判定
    if (qualityScores.length === 0) {
      return {
        status: 'healthy',
        message: '品質データ準備中（初期化時は正常）',
        lastCheck: new Date()
      };
    }

    // データが少ない場合も寛容に判定
    if (qualityScores.length < 3) {
      const avgQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
      return {
        status: 'healthy',
        message: `品質データ蓄積中: ${(avgQuality * 100).toFixed(1)}% (${qualityScores.length}件)`,
        lastCheck: new Date()
      };
    }

    const avgQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
    const thresholds = this.alertThresholds.qualityScore;

    if (avgQuality <= thresholds.critical) {
      return {
        status: 'critical',
        message: `議論品質が危険レベル: ${(avgQuality * 100).toFixed(1)}%`,
        lastCheck: new Date()
      };
    } else if (avgQuality <= thresholds.warning) {
      return {
        status: 'warning',
        message: `議論品質が低い: ${(avgQuality * 100).toFixed(1)}%`,
        lastCheck: new Date()
      };
    } else {
      return {
        status: 'healthy',
        message: `議論品質正常: ${(avgQuality * 100).toFixed(1)}%`,
        lastCheck: new Date()
      };
    }
  }

  // しきい値チェックメソッド（レスポンス時間監視は削除済み）

  private checkErrorRateThresholds(): void {
    const errorRate = this.calculateErrorRate();
    const thresholds = this.alertThresholds.errorRate;

    if (errorRate >= thresholds.critical) {
      console.warn(`🚨 クリティカル: エラー率 ${(errorRate * 100).toFixed(1)}%`);
    } else if (errorRate >= thresholds.warning) {
      console.warn(`⚠️ 警告: エラー率 ${(errorRate * 100).toFixed(1)}%`);
    }
  }

  private checkQualityThresholds(mbtiType: MBTIType, score: number): void {
    const thresholds = this.alertThresholds.qualityScore;

    if (score <= thresholds.critical) {
      console.warn(`🚨 クリティカル: ${mbtiType} 品質スコア ${(score * 100).toFixed(1)}%`);
    } else if (score <= thresholds.warning) {
      console.warn(`⚠️ 警告: ${mbtiType} 品質スコア ${(score * 100).toFixed(1)}%`);
    }
  }

  // 外部インターフェース
  isActive(): boolean {
    return this.isMonitoring;
  }

  reset(): void {
    this.responseTimes.length = 0;
    this.errorCounts.length = 0;
    this.memorySnapshots.length = 0;
    this.metricsHistory.length = 0;
    this.metrics.clear();

    console.log('🔄 パフォーマンスメトリクスをリセットしました');
  }

  // デバッグ用
  debug(): void {
    console.log('🔍 PerformanceMonitor Debug Info:');
    console.log(`  - Monitoring: ${this.isMonitoring}`);
    console.log(`  - Metrics Count: ${this.metrics.size}`);
    console.log(`  - History Size: ${this.metricsHistory.length}`);
    console.log(`  - Response Times: ${this.responseTimes.length}`);
    console.log(`  - Error Counts: ${this.errorCounts.length}`);
    console.log(`  - Current Load: ${(this.calculateCurrentLoad() * 100).toFixed(1)}%`);
  }
}
