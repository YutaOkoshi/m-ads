import type {
    QualityEvaluator,
    EvaluationContext,
    EvaluationResult,
    QualityScores,
    QualityBreakdown,
    EvaluatorType,
    EvaluatorConfig
} from '../../types/feedback-system-types';

/**
 * 品質評価器チェーンシステム
 * Strategy パターンによる交換可能な評価アルゴリズム
 */

export class QualityEvaluatorChain {
    private evaluators: Map<EvaluatorType, QualityEvaluator> = new Map();
    private evaluationOrder: EvaluatorType[] = [];
    private lastEvaluation?: ChainEvaluationResult;

    constructor(evaluators: QualityEvaluator[] = []) {
        evaluators.forEach(evaluator => this.addEvaluator(evaluator));
    }

    // ===========================================
    // 評価器管理
    // ===========================================

    /**
     * 評価器を追加
     */
    addEvaluator(evaluator: QualityEvaluator): this {
        const type = evaluator.getType();
        this.evaluators.set(type, evaluator);

        if (!this.evaluationOrder.includes(type)) {
            this.evaluationOrder.push(type);
        }

        return this;
    }

    /**
     * 評価器を削除
     */
    removeEvaluator(type: EvaluatorType): boolean {
        const removed = this.evaluators.delete(type);
        this.evaluationOrder = this.evaluationOrder.filter(t => t !== type);
        return removed;
    }

    /**
     * 評価器の実行順序を設定
     */
    setEvaluationOrder(order: EvaluatorType[]): this {
        // 存在しない評価器をフィルタリング
        this.evaluationOrder = order.filter(type => this.evaluators.has(type));
        return this;
    }

    /**
     * 評価器の設定を更新
     */
    configureEvaluator(type: EvaluatorType, config: EvaluatorConfig): boolean {
        const evaluator = this.evaluators.get(type);
        if (evaluator) {
            evaluator.configure(config);
            return true;
        }
        return false;
    }

    /**
     * すべての評価器設定を更新
     */
    updateConfiguration(updates: Partial<Record<EvaluatorType, EvaluatorConfig>>): void {
        Object.entries(updates).forEach(([type, config]) => {
            if (config) {
                this.configureEvaluator(type as EvaluatorType, config);
            }
        });
    }

    // ===========================================
    // 評価実行
    // ===========================================

    /**
     * すべての評価器で評価を実行
     */
    async evaluate(context: EvaluationContext): Promise<QualityScores> {
        const startTime = Date.now();
        const results = new Map<EvaluatorType, EvaluationResult>();
        const errors = new Map<EvaluatorType, Error>();

        // 並行実行で各評価器を実行
        const evaluationPromises = this.evaluationOrder
            .map(type => this.evaluators.get(type))
            .filter((evaluator): evaluator is QualityEvaluator =>
                evaluator !== undefined && evaluator.isEnabled()
            )
            .map(async (evaluator) => {
                try {
                    const result = await evaluator.evaluate(context);
                    results.set(evaluator.getType(), result);
                } catch (error) {
                    console.error(`評価器 ${evaluator.getType()} でエラー:`, error);
                    errors.set(evaluator.getType(), error as Error);
                }
            });

        // すべての評価器の完了を待機
        await Promise.all(evaluationPromises);

        // 結果を統合
        const aggregatedScores = this.aggregateResults(results, errors);

        // 評価履歴を記録
        this.lastEvaluation = {
            context,
            results,
            errors,
            aggregatedScores,
            executionTime: Date.now() - startTime,
            timestamp: new Date()
        };

        return aggregatedScores;
    }

    /**
     * 特定の評価器のみで評価
     */
    async evaluateWith(
        context: EvaluationContext,
        types: EvaluatorType[]
    ): Promise<QualityScores> {
        const originalOrder = [...this.evaluationOrder];
        this.setEvaluationOrder(types);

        try {
            return await this.evaluate(context);
        } finally {
            this.evaluationOrder = originalOrder;
        }
    }

    // ===========================================
    // 結果統合
    // ===========================================

    /**
     * 評価結果を統合してスコアを計算
     */
    private aggregateResults(
        results: Map<EvaluatorType, EvaluationResult>,
        errors: Map<EvaluatorType, Error>
    ): QualityScores {
        if (results.size === 0) {
            return this.createFallbackScores();
        }

        let totalWeightedScore = 0;
        let totalWeight = 0;
        const breakdown: QualityBreakdown = {
            strengths: [],
            weaknesses: [],
            specificImprovements: [],
            dimensionScores: {}
        };

        // 各評価器の結果を重み付き平均で統合
        for (const [type, result] of results) {
            const evaluator = this.evaluators.get(type);
            if (!evaluator) continue;

            const weight = evaluator.getWeight();
            totalWeightedScore += result.score * weight;
            totalWeight += weight;

            // ブレイクダウン情報を統合
            breakdown.strengths.push(...result.suggestions.filter(s => s.includes('良い') || s.includes('優秀')));
            breakdown.weaknesses.push(...result.suggestions.filter(s => s.includes('改善') || s.includes('不足')));
            breakdown.specificImprovements.push(...result.suggestions);
            breakdown.dimensionScores[type] = result.score;
        }

        const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

        // 次元別スコアを抽出
        const dimensionScores = this.extractDimensionScores(results);

        return {
            performance: dimensionScores.performance,
            psychological: dimensionScores.psychological,
            contentQuality: dimensionScores.contentQuality,
            mbtiAlignment: dimensionScores.mbtiAlignment,
            overallScore,
            breakdown
        };
    }

    /**
     * 次元別スコアを抽出
     */
    private extractDimensionScores(
        results: Map<EvaluatorType, EvaluationResult>
    ): Omit<QualityScores, 'overallScore' | 'breakdown'> {
        const defaultScore = 0.7; // デフォルトスコア

        return {
            performance: this.getScoreForDimension(results, 'performance') || defaultScore,
            psychological: this.getScoreForDimension(results, 'psychological') || defaultScore,
            contentQuality: this.getScoreForDimension(results, 'contentQuality') || defaultScore,
            mbtiAlignment: this.getScoreForDimension(results, 'mbtiAlignment') || defaultScore
        };
    }

    /**
     * 特定次元のスコアを取得
     */
    private getScoreForDimension(
        results: Map<EvaluatorType, EvaluationResult>,
        dimension: string
    ): number | undefined {
        // 評価器タイプから次元スコアをマッピング
        const typeMapping: Record<string, EvaluatorType[]> = {
            performance: ['performance', 'seven-dimension'],
            psychological: ['mbti-alignment', 'seven-dimension'],
            contentQuality: ['seven-dimension', 'performance'],
            mbtiAlignment: ['mbti-alignment']
        };

        const relevantTypes = typeMapping[dimension] || [];

        for (const type of relevantTypes) {
            const result = results.get(type);
            if (result) {
                // ブレイクダウンから該当スコアを取得、なければメインスコア使用
                return result.breakdown[dimension] || result.score;
            }
        }

        return undefined;
    }

    /**
     * フォールバックスコアを作成
     */
    private createFallbackScores(): QualityScores {
        return {
            performance: 0.7,
            psychological: 0.7,
            contentQuality: 0.7,
            mbtiAlignment: 0.7,
            overallScore: 0.7,
            breakdown: {
                strengths: ['基本的な評価を実行'],
                weaknesses: ['評価器でエラーが発生'],
                specificImprovements: ['システムの復旧を確認してください'],
                dimensionScores: {}
            }
        };
    }

    // ===========================================
    // 情報取得
    // ===========================================

    /**
     * 登録されている評価器一覧を取得
     */
    getRegisteredEvaluators(): EvaluatorInfo[] {
        return Array.from(this.evaluators.entries()).map(([type, evaluator]) => ({
            type,
            weight: evaluator.getWeight(),
            enabled: evaluator.isEnabled(),
            order: this.evaluationOrder.indexOf(type)
        }));
    }

    /**
     * 最後の評価結果を取得
     */
    getLastEvaluation(): ChainEvaluationResult | undefined {
        return this.lastEvaluation;
    }

    /**
     * 統計情報を取得
     */
    getStatistics(): ChainStatistics {
        const evaluators = this.getRegisteredEvaluators();
        const enabledCount = evaluators.filter(e => e.enabled).length;
        const totalWeight = evaluators.reduce((sum, e) => sum + (e.enabled ? e.weight : 0), 0);

        return {
            totalEvaluators: evaluators.length,
            enabledEvaluators: enabledCount,
            totalWeight,
            averageWeight: enabledCount > 0 ? totalWeight / enabledCount : 0,
            lastExecutionTime: this.lastEvaluation?.executionTime || 0,
            evaluationOrder: [...this.evaluationOrder]
        };
    }

    /**
     * 健全性チェック
     */
    healthCheck(): HealthCheckResult {
        const issues: string[] = [];
        const warnings: string[] = [];

        // 評価器の存在チェック
        if (this.evaluators.size === 0) {
            issues.push('評価器が登録されていません');
        }

        // 有効な評価器のチェック
        const enabledEvaluators = Array.from(this.evaluators.values()).filter(e => e.isEnabled());
        if (enabledEvaluators.length === 0) {
            issues.push('有効な評価器がありません');
        }

        // 重みの合計チェック
        const totalWeight = enabledEvaluators.reduce((sum, e) => sum + e.getWeight(), 0);
        if (Math.abs(totalWeight - 1.0) > 0.1) {
            warnings.push(`評価器重みの合計が1.0から大きく乖離: ${totalWeight.toFixed(3)}`);
        }

        // 評価順序のチェック
        const missingTypes = this.evaluationOrder.filter(type => !this.evaluators.has(type));
        if (missingTypes.length > 0) {
            warnings.push(`評価順序に存在しない評価器: ${missingTypes.join(', ')}`);
        }

        return {
            healthy: issues.length === 0,
            issues,
            warnings,
            timestamp: new Date()
        };
    }
}

// ===========================================
// 型定義
// ===========================================

interface ChainEvaluationResult {
    context: EvaluationContext;
    results: Map<EvaluatorType, EvaluationResult>;
    errors: Map<EvaluatorType, Error>;
    aggregatedScores: QualityScores;
    executionTime: number;
    timestamp: Date;
}

interface EvaluatorInfo {
    type: EvaluatorType;
    weight: number;
    enabled: boolean;
    order: number;
}

interface ChainStatistics {
    totalEvaluators: number;
    enabledEvaluators: number;
    totalWeight: number;
    averageWeight: number;
    lastExecutionTime: number;
    evaluationOrder: EvaluatorType[];
}

interface HealthCheckResult {
    healthy: boolean;
    issues: string[];
    warnings: string[];
    timestamp: Date;
}

// ===========================================
// ファクトリー関数
// ===========================================

/**
 * デフォルト評価器チェーンを作成
 */
export function createDefaultEvaluatorChain(): QualityEvaluatorChain {
    // 後で具体的な評価器を実装した後に追加
    return new QualityEvaluatorChain();
}

/**
 * カスタム評価器チェーンを作成
 */
export function createCustomEvaluatorChain(
    evaluators: QualityEvaluator[],
    order?: EvaluatorType[]
): QualityEvaluatorChain {
    const chain = new QualityEvaluatorChain(evaluators);

    if (order) {
        chain.setEvaluationOrder(order);
    }

    return chain;
}
