import type {
  FeedbackEvent,
  FeedbackEventHandler,
  QualityScores,
  OptimizationResult
} from '../../types/feedback-system-types';

import type { MBTIType } from '../../types/mbti-types';

/**
 * イベントタイプ定義
 */
export type EventType =
  | 'evaluation_completed'
  | 'feedback_generated'
  | 'optimization_started'
  | 'optimization_completed'
  | 'weight_adjusted'
  | 'system_error'
  | 'system_started'
  | 'configuration_updated'
  | 'agent_activated'
  | 'agent_deactivated'
  | 'quality_threshold_crossed'
  | 'consistency_alert';

/**
 * イベントリスナー関数型
 */
export type EventListener<T = unknown> = (data: T) => void | Promise<void>;

/**
 * イベントメタデータ
 */
interface EventMetadata {
  eventId: string;
  timestamp: Date;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 内部イベント構造
 */
interface InternalEvent<T = unknown> {
  type: EventType;
  data: T;
  metadata: EventMetadata;
}

/**
 * イベントリスナー登録情報
 */
interface ListenerRegistration {
  id: string;
  listener: EventListener<unknown>;
  options: {
    once?: boolean;
    priority?: number;
    filter?: (data: unknown) => boolean;
  };
}

/**
 * リアルタイムイベント処理システム
 * 非同期イベント駆動アーキテクチャによる疎結合システム
 */
export class EventBus {
  private listeners: Map<EventType, ListenerRegistration[]>;
  private eventHistory: InternalEvent[];
  private isProcessing: boolean = false;
  private eventQueue: InternalEvent[] = [];

  // 設定
  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly MAX_QUEUE_SIZE = 100;

  constructor() {
    this.listeners = new Map();
    this.eventHistory = [];

    // デフォルトリスナーの登録
    this.registerDefaultListeners();
  }

  /**
   * イベントリスナーの登録
   */
  on<T = unknown>(
    eventType: EventType,
    listener: EventListener<T>,
    options: {
      once?: boolean;
      priority?: number;
      filter?: (data: T) => boolean;
    } = {}
  ): string {
    const listenerId = this.generateListenerId();

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const registration: ListenerRegistration = {
      id: listenerId,
      listener: listener as EventListener<unknown>,
      options: {
        once: options.once,
        priority: options.priority,
        filter: options.filter ? (data: unknown) => options.filter!(data as T) : undefined
      }
    };

    const listeners = this.listeners.get(eventType)!;

    // 優先度順に挿入
    const priority = options.priority || 0;
    let insertIndex = listeners.findIndex(reg => (reg.options.priority || 0) < priority);
    if (insertIndex === -1) insertIndex = listeners.length;

    listeners.splice(insertIndex, 0, registration);

    console.log(`📡 イベントリスナー登録: ${eventType} (${listenerId})`);

    return listenerId;
  }

  /**
   * 一回限りのイベントリスナー登録
   */
  once<T = unknown>(
    eventType: EventType,
    listener: EventListener<T>,
    options: Omit<Parameters<typeof this.on>[2], 'once'> = {}
  ): string {
    return this.on(eventType, listener, { ...options, once: true });
  }

  /**
   * イベントリスナーの削除
   */
  off(eventType: EventType, listenerId: string): boolean {
    const listeners = this.listeners.get(eventType);

    if (!listeners) return false;

    const index = listeners.findIndex(reg => reg.id === listenerId);

    if (index === -1) return false;

    listeners.splice(index, 1);

    if (listeners.length === 0) {
      this.listeners.delete(eventType);
    }

    console.log(`📡 イベントリスナー削除: ${eventType} (${listenerId})`);

    return true;
  }

  /**
   * イベントの発行
   */
  async emit<T = unknown>(
    eventType: EventType,
    data: T,
    metadata: Partial<EventMetadata> = {}
  ): Promise<void> {
    const event: InternalEvent<T> = {
      type: eventType,
      data,
      metadata: {
        eventId: metadata.eventId || this.generateEventId(),
        timestamp: metadata.timestamp || new Date(),
        source: metadata.source || 'system',
        priority: metadata.priority || 'medium'
      }
    };

    // 履歴に追加
    this.addToHistory(event);

    // キューに追加
    await this.enqueueEvent(event);

    // 処理開始
    await this.processEventQueue();
  }

  /**
   * 同期イベント発行（即座に処理）
   */
  emitSync<T = unknown>(
    eventType: EventType,
    data: T,
    metadata: Partial<EventMetadata> = {}
  ): void {
    const event: InternalEvent<T> = {
      type: eventType,
      data,
      metadata: {
        eventId: metadata.eventId || this.generateEventId(),
        timestamp: metadata.timestamp || new Date(),
        source: metadata.source || 'system',
        priority: metadata.priority || 'medium'
      }
    };

    this.addToHistory(event);
    this.processEventSync(event);
  }

  /**
   * 特定タイプの全リスナー削除
   */
  removeAllListeners(eventType?: EventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
      console.log(`📡 全リスナー削除: ${eventType}`);
    } else {
      this.listeners.clear();
      console.log('📡 全イベントリスナーを削除');
    }
  }

  /**
   * イベント履歴取得
   */
  getEventHistory(filter?: {
    eventType?: EventType;
    source?: string;
    since?: Date;
    limit?: number;
  }): InternalEvent[] {
    let history = [...this.eventHistory];

    if (filter) {
      if (filter.eventType) {
        history = history.filter(event => event.type === filter.eventType);
      }

      if (filter.source) {
        history = history.filter(event => event.metadata.source === filter.source);
      }

      if (filter.since) {
        history = history.filter(event => event.metadata.timestamp >= filter.since!);
      }

      if (filter.limit) {
        history = history.slice(-filter.limit);
      }
    }

    return history.reverse(); // 新しい順
  }

  /**
   * システム統計情報取得
   */
  getStatistics(): {
    totalEvents: number;
    activeListeners: number;
    queueSize: number;
    eventTypeDistribution: Map<EventType, number>;
    averageProcessingTime: number;
  } {
    const eventTypeDistribution = new Map<EventType, number>();

    this.eventHistory.forEach(event => {
      const current = eventTypeDistribution.get(event.type) || 0;
      eventTypeDistribution.set(event.type, current + 1);
    });

    const totalListeners = Array.from(this.listeners.values())
      .reduce((sum, listeners) => sum + listeners.length, 0);

    return {
      totalEvents: this.eventHistory.length,
      activeListeners: totalListeners,
      queueSize: this.eventQueue.length,
      eventTypeDistribution,
      averageProcessingTime: 0 // 簡略実装
    };
  }

  /**
   * プライベートメソッド
   */
  private registerDefaultListeners(): void {
    // 評価完了イベントの処理
    this.on('evaluation_completed', async (data: { mbtiType: MBTIType; scores: QualityScores }) => {
      console.log(`✅ 評価完了: ${data.mbtiType} - スコア: ${data.scores.overallScore.toFixed(3)}`);

      // 品質閾値チェック
      if (data.scores.overallScore < 0.6) {
        this.emitSync('quality_threshold_crossed', {
          mbtiType: data.mbtiType,
          score: data.scores.overallScore,
          threshold: 0.6,
          severity: 'warning'
        });
      }
    }, { priority: 10 });

    // フィードバック生成イベントの処理
    this.on('feedback_generated', async (data: { mbtiType: MBTIType; feedback: unknown }) => {
      console.log(`💬 フィードバック生成: ${data.mbtiType}`);
    }, { priority: 8 });

    // 最適化完了イベントの処理
    this.on('optimization_completed', async (data: { result: OptimizationResult }) => {
      console.log(`🔧 最適化完了: 品質改善 ${(data.result.qualityImprovement * 100).toFixed(1)}%`);
    }, { priority: 8 });

    // エラーイベントの処理
    this.on('system_error', async (data: { error: Error; context: string }) => {
      console.error(`❌ システムエラー [${data.context}]:`, data.error);
    }, { priority: 100 });

    // 品質閾値超過アラート
    this.on('quality_threshold_crossed', async (data: {
      mbtiType: MBTIType;
      score: number;
      threshold: number;
      severity: 'info' | 'warning' | 'critical'
    }) => {
      const emoji = data.severity === 'critical' ? '🚨' : data.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${emoji} 品質閾値アラート: ${data.mbtiType} スコア${data.score.toFixed(3)} < 閾値${data.threshold}`);
    }, { priority: 20 });
  }

  private async enqueueEvent(event: InternalEvent): Promise<void> {
    if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
      console.warn('⚠️ イベントキューが満杯です。古いイベントを削除します。');
      this.eventQueue.shift();
    }

    // 優先度順に挿入
    const priority = this.getPriorityValue(event.metadata.priority);
    let insertIndex = this.eventQueue.findIndex(e =>
      this.getPriorityValue(e.metadata.priority) < priority
    );

    if (insertIndex === -1) insertIndex = this.eventQueue.length;

    this.eventQueue.splice(insertIndex, 0, event);
  }

  private getPriorityValue(priority: EventMetadata['priority']): number {
    const values = { low: 1, medium: 2, high: 3, critical: 4 };
    return values[priority];
  }

  private async processEventQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;
        await this.processEvent(event);
      }
    } catch (error) {
      console.error('❌ イベント処理エラー:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processEvent(event: InternalEvent): Promise<void> {
    const listeners = this.listeners.get(event.type);

    if (!listeners || listeners.length === 0) {
      return;
    }

    const promises: Promise<void>[] = [];
    const toRemove: string[] = [];

    for (const registration of listeners) {
      try {
        // フィルターチェック
        if (registration.options.filter && !registration.options.filter(event.data)) {
          continue;
        }

        // リスナー実行
        const result = registration.listener(event.data);

        if (result instanceof Promise) {
          promises.push(result);
        }

        // 一回限りリスナーの場合は削除予約
        if (registration.options.once) {
          toRemove.push(registration.id);
        }

      } catch (error) {
        console.error(`❌ リスナー実行エラー [${event.type}]:`, error);
      }
    }

    // 非同期リスナーの完了を待機
    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }

    // 一回限りリスナーを削除
    toRemove.forEach(id => this.off(event.type, id));
  }

  private processEventSync(event: InternalEvent): void {
    const listeners = this.listeners.get(event.type);

    if (!listeners || listeners.length === 0) {
      return;
    }

    const toRemove: string[] = [];

    for (const registration of listeners) {
      try {
        // フィルターチェック
        if (registration.options.filter && !registration.options.filter(event.data)) {
          continue;
        }

        // 同期リスナーのみ実行
        const result = registration.listener(event.data);

        if (result instanceof Promise) {
          console.warn('⚠️ 同期イベントで非同期リスナーが呼ばれました');
        }

        // 一回限りリスナーの場合は削除予約
        if (registration.options.once) {
          toRemove.push(registration.id);
        }

      } catch (error) {
        console.error(`❌ 同期リスナー実行エラー [${event.type}]:`, error);
      }
    }

    // 一回限りリスナーを削除
    toRemove.forEach(id => this.off(event.type, id));
  }

  private addToHistory(event: InternalEvent): void {
    this.eventHistory.push(event);

    // 履歴サイズ制限
    if (this.eventHistory.length > this.MAX_HISTORY_SIZE) {
      this.eventHistory = this.eventHistory.slice(-Math.floor(this.MAX_HISTORY_SIZE * 0.8));
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateListenerId(): string {
    return `lst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 外部インターフェース
  hasListeners(eventType: EventType): boolean {
    const listeners = this.listeners.get(eventType);
    return listeners ? listeners.length > 0 : false;
  }

  getListenerCount(eventType?: EventType): number {
    if (eventType) {
      const listeners = this.listeners.get(eventType);
      return listeners ? listeners.length : 0;
    }

    return Array.from(this.listeners.values())
      .reduce((sum, listeners) => sum + listeners.length, 0);
  }

  // デバッグ用メソッド
  debug(): void {
    console.log('🔍 EventBus Debug Info:');
    console.log(`  - Total Events: ${this.eventHistory.length}`);
    console.log(`  - Queue Size: ${this.eventQueue.length}`);
    console.log(`  - Processing: ${this.isProcessing}`);
    console.log('  - Listeners:');

    for (const [eventType, listeners] of this.listeners.entries()) {
      console.log(`    - ${eventType}: ${listeners.length} listeners`);
    }
  }

  // システム停止時のクリーンアップ
  destroy(): void {
    this.removeAllListeners();
    this.eventQueue.length = 0;
    this.eventHistory.length = 0;
    this.isProcessing = false;

    console.log('🔌 EventBus stopped');
  }
}
