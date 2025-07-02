import type {
    FeedbackConfiguration,
    QualityThresholds,
    EvaluatorWeights,
    OptimizationStrategy,
    PerformanceTarget,
    AdaptiveSettings,
    FeedbackConfigurationUpdate
} from '../types/feedback-system-types';

/**
 * フィードバック設定管理システム
 * Builder パターンによる柔軟な設定構築
 */

export class FeedbackConfigurationBuilder {
    private config: Partial<FeedbackConfiguration> = {};

    /**
     * ビルダーインスタンス作成
     */
    static create(): FeedbackConfigurationBuilder {
        return new FeedbackConfigurationBuilder();
    }

    /**
     * デフォルト設定から開始
     */
    static fromDefaults(): FeedbackConfigurationBuilder {
        const builder = new FeedbackConfigurationBuilder();
        builder.config = { ...DEFAULT_FEEDBACK_CONFIG };
        return builder;
    }

    /**
     * 既存設定から開始
     */
    static fromExisting(config: FeedbackConfiguration): FeedbackConfigurationBuilder {
        const builder = new FeedbackConfigurationBuilder();
        builder.config = { ...config };
        return builder;
    }

    // ===========================================
    // 品質閾値設定
    // ===========================================

    withQualityThresholds(thresholds: Partial<QualityThresholds>): this {
        this.config.qualityThresholds = {
            ...DEFAULT_QUALITY_THRESHOLDS,
            ...this.config.qualityThresholds,
            ...thresholds
        };
        return this;
    }

    withPerformanceThreshold(threshold: number): this {
        return this.withQualityThresholds({ performance: threshold });
    }

    withPsychologicalThreshold(threshold: number): this {
        return this.withQualityThresholds({ psychological: threshold });
    }

    withContentQualityThreshold(threshold: number): this {
        return this.withQualityThresholds({ contentQuality: threshold });
    }

    withMBTIAlignmentThreshold(threshold: number): this {
        return this.withQualityThresholds({ mbtiAlignment: threshold });
    }

    withOverallMinimumThreshold(threshold: number): this {
        return this.withQualityThresholds({ overallMinimum: threshold });
    }

    withInterventionThreshold(threshold: number): this {
        return this.withQualityThresholds({ interventionThreshold: threshold });
    }

    // ===========================================
    // 評価器重み設定
    // ===========================================

    withEvaluatorWeights(weights: Partial<EvaluatorWeights>): this {
        this.config.evaluatorWeights = {
            ...DEFAULT_EVALUATOR_WEIGHTS,
            ...this.config.evaluatorWeights,
            ...weights
        };
        return this;
    }

    withSevenDimensionWeight(weight: number): this {
        return this.withEvaluatorWeights({ sevenDimension: weight });
    }

    withPerformanceWeight(weight: number): this {
        return this.withEvaluatorWeights({ performance: weight });
    }

    withMBTIAlignmentWeight(weight: number): this {
        return this.withEvaluatorWeights({ mbtiAlignment: weight });
    }

    withProgressTrackingWeight(weight: number): this {
        return this.withEvaluatorWeights({ progressTracking: weight });
    }

    // ===========================================
    // 最適化戦略設定
    // ===========================================

    withOptimizationStrategy(strategy: OptimizationStrategy): this {
        this.config.optimizationStrategy = strategy;
        return this;
    }

    enableQualityFocusedOptimization(): this {
        return this.withOptimizationStrategy('quality-focused');
    }

    enableDiversityFocusedOptimization(): this {
        return this.withOptimizationStrategy('diversity-focused');
    }

    enableEfficiencyFocusedOptimization(): this {
        return this.withOptimizationStrategy('efficiency-focused');
    }

    enableBalancedOptimization(): this {
        return this.withOptimizationStrategy('balanced');
    }

    // ===========================================
    // リアルタイム最適化設定
    // ===========================================

    enableRealtimeOptimization(enabled: boolean = true): this {
        this.config.enableRealtimeOptimization = enabled;
        return this;
    }

    disableRealtimeOptimization(): this {
        return this.enableRealtimeOptimization(false);
    }

    // ===========================================
    // パフォーマンス目標設定
    // ===========================================

    withPerformanceTarget(target: Partial<PerformanceTarget>): this {
        this.config.performanceTarget = {
            ...DEFAULT_PERFORMANCE_TARGET,
            ...this.config.performanceTarget,
            ...target
        };
        return this;
    }

    withResponseTimeTarget(milliseconds: number): this {
        return this.withPerformanceTarget({ responseTime: milliseconds });
    }

    withAccuracyTarget(accuracy: number): this {
        return this.withPerformanceTarget({ accuracy });
    }

    withThroughputTarget(evaluationsPerMinute: number): this {
        return this.withPerformanceTarget({ throughput: evaluationsPerMinute });
    }

    withMemoryUsageTarget(megabytes: number): this {
        return this.withPerformanceTarget({ memoryUsage: megabytes });
    }

    // ===========================================
    // 適応設定
    // ===========================================

    withAdaptiveSettings(settings: Partial<AdaptiveSettings>): this {
        this.config.adaptiveSettings = {
            ...DEFAULT_ADAPTIVE_SETTINGS,
            ...this.config.adaptiveSettings,
            ...settings
        };
        return this;
    }

    withLearningRate(rate: number): this {
        return this.withAdaptiveSettings({ learningRate: rate });
    }

    withAdaptationSensitivity(sensitivity: number): this {
        return this.withAdaptiveSettings({ adaptationSensitivity: sensitivity });
    }

    withHistoryWindowSize(size: number): this {
        return this.withAdaptiveSettings({ historyWindowSize: size });
    }

    withFeedbackFrequency(frequency: AdaptiveSettings['feedbackFrequency']): this {
        return this.withAdaptiveSettings({ feedbackFrequency: frequency });
    }

    // ===========================================
    // プリセット設定
    // ===========================================

    /**
     * 高品質重視プリセット
     */
    applyHighQualityPreset(): this {
        return this
            .withQualityThresholds({
                performance: 0.9,
                psychological: 0.85,
                contentQuality: 0.9,
                mbtiAlignment: 0.8,
                overallMinimum: 0.85,
                interventionThreshold: 0.7
            })
            .withOptimizationStrategy('quality-focused')
            .enableRealtimeOptimization()
            .withPerformanceTarget({
                responseTime: 3000,
                accuracy: 0.9,
                throughput: 50
            });
    }

    /**
     * 多様性重視プリセット
     */
    applyDiversityPreset(): this {
        return this
            .withQualityThresholds({
                performance: 0.75,
                psychological: 0.8,
                contentQuality: 0.75,
                mbtiAlignment: 0.9,
                overallMinimum: 0.75,
                interventionThreshold: 0.6
            })
            .withOptimizationStrategy('diversity-focused')
            .enableRealtimeOptimization()
            .withEvaluatorWeights({
                sevenDimension: 0.3,
                performance: 0.2,
                mbtiAlignment: 0.4,
                progressTracking: 0.1
            });
    }

    /**
     * 効率重視プリセット
     */
    applyEfficiencyPreset(): this {
        return this
            .withQualityThresholds({
                performance: 0.8,
                psychological: 0.75,
                contentQuality: 0.8,
                mbtiAlignment: 0.75,
                overallMinimum: 0.75,
                interventionThreshold: 0.65
            })
            .withOptimizationStrategy('efficiency-focused')
            .enableRealtimeOptimization()
            .withPerformanceTarget({
                responseTime: 1500,
                accuracy: 0.85,
                throughput: 120
            })
            .withAdaptiveSettings({
                learningRate: 0.15,
                adaptationSensitivity: 1.2,
                feedbackFrequency: 'threshold-based'
            });
    }

    /**
     * バランス型プリセット（推奨）
     */
    applyBalancedPreset(): this {
        return this
            .withQualityThresholds({
                performance: 0.8,
                psychological: 0.8,
                contentQuality: 0.8,
                mbtiAlignment: 0.75,
                overallMinimum: 0.78,
                interventionThreshold: 0.65
            })
            .withOptimizationStrategy('balanced')
            .enableRealtimeOptimization()
            .withEvaluatorWeights({
                sevenDimension: 0.4,
                performance: 0.3,
                mbtiAlignment: 0.25,
                progressTracking: 0.05
            })
            .withPerformanceTarget({
                responseTime: 2000,
                accuracy: 0.85,
                throughput: 80
            });
    }

    // ===========================================
    // バリデーションと構築
    // ===========================================

    /**
     * 設定の妥当性を検証
     */
    validate(): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // 重みの合計チェック
        const weights = this.config.evaluatorWeights;
        if (weights) {
            const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
            if (Math.abs(totalWeight - 1.0) > 0.01) {
                warnings.push(`評価器重みの合計が1.0ではありません: ${totalWeight.toFixed(3)}`);
            }
        }

        // 閾値の妥当性チェック
        const thresholds = this.config.qualityThresholds;
        if (thresholds) {
            Object.entries(thresholds).forEach(([key, value]) => {
                if (value < 0 || value > 1) {
                    errors.push(`品質閾値 ${key} が範囲外です: ${value}`);
                }
            });
        }

        // パフォーマンス目標の妥当性チェック
        const performance = this.config.performanceTarget;
        if (performance) {
            if (performance.responseTime && performance.responseTime < 100) {
                warnings.push('応答時間目標が非常に短く設定されています');
            }
            if (performance.accuracy && performance.accuracy > 0.95) {
                warnings.push('精度目標が非常に高く設定されています');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * 設定を構築
     */
    build(): FeedbackConfiguration {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`設定が無効です: ${validation.errors.join(', ')}`);
        }

        // デフォルト値をマージ
        const finalConfig: FeedbackConfiguration = {
            ...DEFAULT_FEEDBACK_CONFIG,
            ...this.config
        } as FeedbackConfiguration;

        // 警告をログ出力
        if (validation.warnings.length > 0) {
            console.warn('設定に関する警告:', validation.warnings);
        }

        return finalConfig;
    }

    /**
     * 現在の設定状態を取得（デバッグ用）
     */
    getConfigState(): Partial<FeedbackConfiguration> {
        return { ...this.config };
    }
}

// ===========================================
// デフォルト設定値
// ===========================================

export const DEFAULT_QUALITY_THRESHOLDS: QualityThresholds = {
    performance: 0.8,
    psychological: 0.8,
    contentQuality: 0.8,
    mbtiAlignment: 0.75,
    overallMinimum: 0.78,
    interventionThreshold: 0.65
};

export const DEFAULT_EVALUATOR_WEIGHTS: EvaluatorWeights = {
    sevenDimension: 0.4,
    performance: 0.3,
    mbtiAlignment: 0.25,
    progressTracking: 0.05
};

export const DEFAULT_PERFORMANCE_TARGET: PerformanceTarget = {
    responseTime: 2000, // 2秒
    accuracy: 0.85,
    throughput: 80, // 80評価/分
    memoryUsage: 512 // 512MB
};

export const DEFAULT_ADAPTIVE_SETTINGS: AdaptiveSettings = {
    learningRate: 0.1,
    adaptationSensitivity: 1.0,
    historyWindowSize: 20,
    feedbackFrequency: 'every-turn'
};

export const DEFAULT_FEEDBACK_CONFIG: FeedbackConfiguration = {
    qualityThresholds: DEFAULT_QUALITY_THRESHOLDS,
    evaluatorWeights: DEFAULT_EVALUATOR_WEIGHTS,
    optimizationStrategy: 'balanced',
    enableRealtimeOptimization: true,
    performanceTarget: DEFAULT_PERFORMANCE_TARGET,
    adaptiveSettings: DEFAULT_ADAPTIVE_SETTINGS
};

// ===========================================
// バリデーション結果型
// ===========================================

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// ===========================================
// 設定更新ユーティリティ
// ===========================================

/**
 * 既存設定の部分更新
 */
export function updateConfiguration(
    current: FeedbackConfiguration,
    updates: FeedbackConfigurationUpdate
): FeedbackConfiguration {
    return FeedbackConfigurationBuilder
        .fromExisting(current)
        .withQualityThresholds(updates.qualityThresholds || {})
        .withEvaluatorWeights(updates.evaluatorWeights || {})
        .withPerformanceTarget(updates.performanceTarget || {})
        .withAdaptiveSettings(updates.adaptiveSettings || {})
        .build();
}

/**
 * 設定の比較
 */
export function compareConfigurations(
    config1: FeedbackConfiguration,
    config2: FeedbackConfiguration
): ConfigurationDiff {
    const differences: string[] = [];

    // 品質閾値の比較
    Object.keys(config1.qualityThresholds).forEach(key => {
        const key1 = config1.qualityThresholds[key as keyof QualityThresholds];
        const key2 = config2.qualityThresholds[key as keyof QualityThresholds];
        if (key1 !== key2) {
            differences.push(`品質閾値.${key}: ${key1} → ${key2}`);
        }
    });

    // 評価器重みの比較
    Object.keys(config1.evaluatorWeights).forEach(key => {
        const key1 = config1.evaluatorWeights[key as keyof EvaluatorWeights];
        const key2 = config2.evaluatorWeights[key as keyof EvaluatorWeights];
        if (key1 !== key2) {
            differences.push(`評価器重み.${key}: ${key1} → ${key2}`);
        }
    });

    return {
        identical: differences.length === 0,
        differences
    };
}

interface ConfigurationDiff {
    identical: boolean;
    differences: string[];
}
