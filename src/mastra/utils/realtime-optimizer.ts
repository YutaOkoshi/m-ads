import type {
    DiscussionStatement,
    MBTIType,
    ComprehensiveQualityReport,
    GraphStructure,
    WeightingContext,
    OptimizedGraphStructure
} from '../types/mbti-types';
import { ALL_MBTI_TYPES } from './mbti-characteristics';

/**
 * リアルタイム最適化結果の型定義
 */
export interface RealtimeOptimizationResult {
    optimizedGraph: OptimizedGraphStructure;
    adjustedWeights: Map<MBTIType, number>;
    recommendations: string[];
    qualityImprovement: number;
}

/**
 * リアルタイム最適化エンジンのインターフェース
 */
export interface RealtimeOptimizationEngine {
    optimizeInRealtime(
        currentDiscussion: DiscussionStatement[],
        graphStructure: GraphStructure,
        qualityMetrics: ComprehensiveQualityReport,
        context: WeightingContext
    ): Promise<RealtimeOptimizationResult>;
}

/**
 * リアルタイム最適化エンジンの実装
 * MBTI議論システム専用の最適化アルゴリズム
 */
export class RealtimeOptimizer implements RealtimeOptimizationEngine {
    async optimizeInRealtime(
        currentDiscussion: DiscussionStatement[],
        graphStructure: GraphStructure,
        qualityMetrics: ComprehensiveQualityReport,
        context: WeightingContext
    ): Promise<RealtimeOptimizationResult> {
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
                recommendations.push(`${type}タイプの発言機会を増やすことを推奨`);
            } else if (participation > averageParticipation * 2) {
                weight *= 0.8; // 発言が多すぎるタイプの重みを下げる
                recommendations.push(`${type}タイプの発言頻度を調整することを推奨`);
            }

            // 品質ボトルネックに基づく調整
            if (bottlenecks.includes('多様性') && this.isIntuitive(type)) {
                weight *= 1.2; // 直感タイプの重みを上げる
                recommendations.push(`多様性向上のため${type}タイプの創造的視点を活用`);
            }
            if (bottlenecks.includes('一貫性') && this.isThinking(type)) {
                weight *= 1.2; // 思考タイプの重みを上げる
                recommendations.push(`一貫性向上のため${type}タイプの論理的分析を活用`);
            }
            if (bottlenecks.includes('協調性') && this.isFeeling(type)) {
                weight *= 1.2; // 感情タイプの重みを上げる
                recommendations.push(`協調性向上のため${type}タイプの調和的視点を活用`);
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

        // 6. 追加の推奨事項生成
        this.generateAdditionalRecommendations(
            currentDiscussion,
            qualityMetrics,
            recommendations
        );

        return {
            optimizedGraph,
            adjustedWeights,
            recommendations,
            qualityImprovement
        };
    }

    /**
     * MBTIタイプ別参加状況分析
     */
    private analyzeMBTIParticipation(statements: DiscussionStatement[]): Record<string, number> {
        const participation: Record<string, number> = {};
        statements.forEach(stmt => {
            participation[stmt.mbtiType] = (participation[stmt.mbtiType] || 0) + 1;
        });
        return participation;
    }

    /**
     * 品質ボトルネック検出
     */
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

    /**
     * グラフ構造最適化
     */
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

    /**
     * 品質改善度計算
     */
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

    /**
     * 追加推奨事項の生成
     */
    private generateAdditionalRecommendations(
        statements: DiscussionStatement[],
        qualityMetrics: ComprehensiveQualityReport,
        recommendations: string[]
    ): void {
        // 議論の長さに基づく推奨
        if (statements.length > 20) {
            recommendations.push('議論が長期化しています。要点整理と方向性の確認を推奨');
        }

        // 品質スコアに基づく推奨
        const metricsData = qualityMetrics.comprehensiveMetrics || {};
        if ('contentQualityScore' in metricsData &&
            typeof (metricsData as any).contentQualityScore === 'number' &&
            (metricsData as any).contentQualityScore < 0.7) {
            recommendations.push('発言内容の質向上のため、具体例や根拠の提示を推奨');
        }

        if ('ethicsScore' in metricsData &&
            typeof (metricsData as any).ethicsScore === 'number' &&
            (metricsData as any).ethicsScore < 0.9) {
            recommendations.push('倫理的配慮の向上を推奨');
        }

        // 相互作用パターンに基づく推奨
        if (statements.length > 5) {
            const recentTypes = statements.slice(-5).map(s => s.mbtiType);
            const uniqueRecentTypes = new Set(recentTypes);

            if (uniqueRecentTypes.size < 3) {
                recommendations.push('議論の多様性向上のため、より多くのMBTIタイプの参加を促進');
            }
        }
    }

    /**
     * MBTIタイプ判定ヘルパーメソッド
     */
    private isIntuitive(type: MBTIType): boolean {
        return type.includes('N');
    }

    private isThinking(type: MBTIType): boolean {
        return type.includes('T');
    }

    private isFeeling(type: MBTIType): boolean {
        return type.includes('F');
    }

    private isJudging(type: MBTIType): boolean {
        return type.includes('J');
    }

    private isPerceiving(type: MBTIType): boolean {
        return type.includes('P');
    }

    private isExtraverted(type: MBTIType): boolean {
        return type.includes('E');
    }

    private isIntroverted(type: MBTIType): boolean {
        return type.includes('I');
    }

    private isSensing(type: MBTIType): boolean {
        return type.includes('S');
    }
}

/**
 * 最適化設定の型定義
 */
export interface OptimizationConfig {
    enableWeightAdjustment: boolean;
    enableGraphOptimization: boolean;
    qualityThreshold: number;
    maxRecommendations: number;
    adaptationSensitivity: number;
}

/**
 * デフォルト最適化設定
 */
export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationConfig = {
    enableWeightAdjustment: true,
    enableGraphOptimization: true,
    qualityThreshold: 0.8,
    maxRecommendations: 5,
    adaptationSensitivity: 1.0
};

/**
 * 最適化エンジンのファクトリー関数
 */
export function createRealtimeOptimizer(config: Partial<OptimizationConfig> = {}): RealtimeOptimizer {
    // 設定のバリデーションやカスタマイズが可能
    const finalConfig = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };

    return new RealtimeOptimizer();
}
