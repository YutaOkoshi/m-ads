import type {
    QualityEvaluator,
    EvaluationContext,
    EvaluationResult,
    EvaluatorType,
    EvaluatorConfig
} from '../../types/feedback-system-types';

/**
 * 基本評価器の実装
 * 簡略版フィードバックシステム用
 */

/**
 * 基本評価器の抽象クラス
 */
abstract class BaseEvaluator implements QualityEvaluator {
    protected weight: number;
    protected enabled = true;
    protected config: EvaluatorConfig;

    constructor(weight: number = 1.0) {
        this.weight = weight;
        this.config = {
            weight,
            thresholds: {},
            enabled: true
        };
    }

    abstract evaluate(context: EvaluationContext): Promise<EvaluationResult>;
    abstract getType(): EvaluatorType;

    getWeight(): number {
        return this.weight;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    configure(config: EvaluatorConfig): void {
        this.config = { ...this.config, ...config };
        this.weight = config.weight;
        this.enabled = config.enabled;
    }

    /**
     * 基本的なスコア計算
     */
    protected calculateBasicScore(statement: string): number {
        if (!statement || statement.trim().length === 0) {
            return 0.1;
        }

        const length = statement.trim().length;

        // 長さによる基本スコア (50-300文字が理想)
        let lengthScore = 0.5;
        if (length >= 50 && length <= 300) {
            lengthScore = 0.9;
        } else if (length >= 30 && length <= 500) {
            lengthScore = 0.7;
        } else if (length >= 10) {
            lengthScore = 0.5;
        }

        return Math.min(0.95, lengthScore);
    }

    /**
     * キーワード分析
     */
    protected analyzeKeywords(statement: string, keywords: string[]): number {
        if (!statement) return 0.0;

        const lowerStatement = statement.toLowerCase();
        const matchCount = keywords.filter(keyword =>
            lowerStatement.includes(keyword.toLowerCase())
        ).length;

        return Math.min(1.0, matchCount / Math.max(1, keywords.length * 0.5));
    }
}

/**
 * パフォーマンス評価器
 */
export class PerformanceEvaluator extends BaseEvaluator {
    getType(): EvaluatorType {
        return 'performance';
    }

    async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
        const { statement, topic } = context;

        // 基本スコア計算
        const basicScore = this.calculateBasicScore(statement);

        // トピック関連性チェック
        const topicKeywords = topic.split(/\s+/).filter(word => word.length > 2);
        const relevanceScore = this.analyzeKeywords(statement, topicKeywords);

        // 構造的品質（句読点、段落構成など）
        const structureScore = this.evaluateStructure(statement);

        // 総合スコア
        const overallScore = (basicScore * 0.4 + relevanceScore * 0.4 + structureScore * 0.2);

        return {
            score: overallScore,
            confidence: 0.8,
            breakdown: {
                basicQuality: basicScore,
                topicRelevance: relevanceScore,
                structure: structureScore
            },
            feedback: this.generatePerformanceFeedback(basicScore, relevanceScore, structureScore),
            suggestions: this.generatePerformanceSuggestions(basicScore, relevanceScore, structureScore),
            metadata: {
                statementLength: statement.length,
                topicKeywordCount: topicKeywords.length
            }
        };
    }

    private evaluateStructure(statement: string): number {
        if (!statement) return 0.0;

        let score = 0.5;

        // 句読点の適切な使用
        const punctuationCount = (statement.match(/[。！？、]/g) || []).length;
        if (punctuationCount > 0) {
            score += 0.2;
        }

        // 適切な改行や段落
        const lines = statement.split(/\n/).filter(line => line.trim().length > 0);
        if (lines.length > 1) {
            score += 0.1;
        }

        // 極端に長い文の回避
        const sentences = statement.split(/[。！？]/).filter(s => s.trim().length > 0);
        const averageSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
        if (averageSentenceLength > 0 && averageSentenceLength < 100) {
            score += 0.2;
        }

        return Math.min(1.0, score);
    }

    private generatePerformanceFeedback(basic: number, relevance: number, structure: number): string {
        if (basic < 0.5) {
            return '発言の長さや内容をもう少し充実させてください。';
        }
        if (relevance < 0.5) {
            return 'トピックにより関連した内容を含めてください。';
        }
        if (structure < 0.5) {
            return '文章構造をより整理してください。';
        }
        return '良い品質の発言です。さらなる向上を目指しましょう。';
    }

    private generatePerformanceSuggestions(basic: number, relevance: number, structure: number): string[] {
        const suggestions: string[] = [];

        if (basic < 0.7) {
            suggestions.push('もう少し詳細な説明を加えてください');
        }
        if (relevance < 0.7) {
            suggestions.push('トピックに関連するキーワードを含めてください');
        }
        if (structure < 0.7) {
            suggestions.push('句読点や改行を使って読みやすくしてください');
        }

        if (suggestions.length === 0) {
            suggestions.push('現在の品質を維持してください');
        }

        return suggestions;
    }
}

/**
 * MBTI整合性評価器
 */
export class MBTIAlignmentEvaluator extends BaseEvaluator {
    getType(): EvaluatorType {
        return 'mbti-alignment';
    }

    async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
        const { statement, mbtiType } = context;

        // MBTI特性に基づく評価
        const alignmentScore = this.evaluateMBTIAlignment(statement, mbtiType);
        const characteristicScore = this.evaluateCharacteristics(statement, mbtiType);

        const overallScore = (alignmentScore * 0.6 + characteristicScore * 0.4);

        return {
            score: overallScore,
            confidence: 0.75,
            breakdown: {
                mbtiAlignment: alignmentScore,
                characteristics: characteristicScore
            },
            feedback: this.generateMBTIFeedback(mbtiType, alignmentScore),
            suggestions: this.generateMBTISuggestions(mbtiType, alignmentScore),
            metadata: {
                mbtiType,
                detectedCharacteristics: this.detectCharacteristics(statement, mbtiType)
            }
        };
    }

    private evaluateMBTIAlignment(statement: string, mbtiType: string): number {
        const characteristics = this.getMBTICharacteristics(mbtiType);
        return this.analyzeKeywords(statement, characteristics.keywords);
    }

    private evaluateCharacteristics(statement: string, mbtiType: string): number {
        const characteristics = this.getMBTICharacteristics(mbtiType);

        // 思考スタイルの評価
        let score = 0.5;

        // 内向型(I)vs外向型(E)の評価
        if (mbtiType.startsWith('I')) {
            // 内向型: 深い思考、内省的
            if (statement.includes('考え') || statement.includes('分析') || statement.includes('思う')) {
                score += 0.2;
            }
        } else {
            // 外向型: 行動的、社交的
            if (statement.includes('みんな') || statement.includes('一緒') || statement.includes('行動')) {
                score += 0.2;
            }
        }

        // 直感型(N)vs感覚型(S)の評価
        if (mbtiType.includes('N')) {
            // 直感型: 可能性、未来志向
            if (statement.includes('可能性') || statement.includes('アイデア') || statement.includes('未来')) {
                score += 0.15;
            }
        } else {
            // 感覚型: 具体性、現実的
            if (statement.includes('具体的') || statement.includes('実際') || statement.includes('現実')) {
                score += 0.15;
            }
        }

        // 思考型(T)vs感情型(F)の評価
        if (mbtiType.includes('T')) {
            // 思考型: 論理的、客観的
            if (statement.includes('論理') || statement.includes('分析') || statement.includes('効率')) {
                score += 0.15;
            }
        } else {
            // 感情型: 価値観、調和
            if (statement.includes('価値') || statement.includes('調和') || statement.includes('配慮')) {
                score += 0.15;
            }
        }

        return Math.min(1.0, score);
    }

    private getMBTICharacteristics(mbtiType: string): { keywords: string[] } {
        // 簡略版のMBTI特性キーワード
        const characteristics: Record<string, string[]> = {
            'INTJ': ['計画', '戦略', '論理', '分析', '効率', '独立'],
            'INFJ': ['理想', '洞察', '価値観', '調和', '深い', '意味'],
            'ISTJ': ['責任', '実用的', '伝統', '安定', '計画', '信頼'],
            'ISFJ': ['配慮', '支援', '伝統', '調和', '責任感', '協力'],
            'ENTP': ['アイデア', '可能性', '革新', '議論', '創造', '柔軟'],
            'ENFP': ['情熱', '創造', '人間関係', '可能性', '自由', 'インスピレーション'],
            'ESTP': ['行動', '実用的', '現実', '柔軟', '適応', '体験'],
            'ESFP': ['楽しい', '人間関係', '現在', '協力', '自由', '表現']
        };

        return {
            keywords: characteristics[mbtiType] || ['思考', '分析', '協力', '創造']
        };
    }

    private detectCharacteristics(statement: string, mbtiType: string): string[] {
        const characteristics = this.getMBTICharacteristics(mbtiType);
        return characteristics.keywords.filter(keyword =>
            statement.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    private generateMBTIFeedback(mbtiType: string, score: number): string {
        if (score < 0.5) {
            return `${mbtiType}タイプの特性をより活かした発言を心がけてください。`;
        }
        if (score < 0.7) {
            return `${mbtiType}らしい視点が見られます。さらに特性を活かせるでしょう。`;
        }
        return `${mbtiType}タイプの特性がよく表現されています。`;
    }

    private generateMBTISuggestions(mbtiType: string, score: number): string[] {
        const suggestions: string[] = [];

        if (score < 0.7) {
            const characteristics = this.getMBTICharacteristics(mbtiType);
            suggestions.push(`${mbtiType}の特徴（${characteristics.keywords.slice(0, 3).join('、')}）を意識してください`);
        }

        if (mbtiType.includes('T')) {
            suggestions.push('論理的な分析や根拠を含めてください');
        } else {
            suggestions.push('価値観や人への配慮を含めてください');
        }

        return suggestions;
    }
}

/**
 * 7次元評価器（簡略版）
 */
export class SevenDimensionEvaluator extends BaseEvaluator {
    getType(): EvaluatorType {
        return 'seven-dimension';
    }

    async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
        const { statement, topic, mbtiType } = context;

        // 7次元の簡略評価
        const dimensions = {
            performance: this.calculateBasicScore(statement),
            psychological: this.evaluatePsychological(statement, mbtiType),
            externalAlignment: this.evaluateAlignment(statement, topic),
            internalConsistency: this.evaluateConsistency(statement),
            socialDecisionMaking: this.evaluateSocial(statement),
            contentQuality: this.evaluateContent(statement),
            ethics: this.evaluateEthics(statement)
        };

        // 重み付き平均
        const weights = {
            performance: 0.15,
            psychological: 0.15,
            externalAlignment: 0.15,
            internalConsistency: 0.15,
            socialDecisionMaking: 0.1,
            contentQuality: 0.2,
            ethics: 0.1
        };

        const overallScore = Object.entries(dimensions).reduce(
            (sum, [key, value]) => sum + value * weights[key as keyof typeof weights],
            0
        );

        return {
            score: overallScore,
            confidence: 0.8,
            breakdown: dimensions,
            feedback: this.generateSevenDimensionFeedback(dimensions),
            suggestions: this.generateSevenDimensionSuggestions(dimensions),
            metadata: {
                dimensions,
                overallScore
            }
        };
    }

    private evaluatePsychological(statement: string, mbtiType: string): number {
        // 心理的適切性の簡易評価
        return this.calculateBasicScore(statement) * 0.8 + 0.2;
    }

    private evaluateAlignment(statement: string, topic: string): number {
        // 外部整合性（トピックとの一致）
        const topicWords = topic.split(/\s+/);
        return this.analyzeKeywords(statement, topicWords);
    }

    private evaluateConsistency(statement: string): number {
        // 内部一貫性の簡易評価
        return statement.length > 20 ? 0.8 : 0.5;
    }

    private evaluateSocial(statement: string): number {
        // 社会的意思決定の評価
        const socialKeywords = ['協力', '配慮', '議論', '合意', 'みんな', '一緒'];
        return this.analyzeKeywords(statement, socialKeywords) * 0.5 + 0.5;
    }

    private evaluateContent(statement: string): number {
        // コンテンツ品質
        return this.calculateBasicScore(statement);
    }

    private evaluateEthics(statement: string): number {
        // 倫理性（否定的な表現の検出）
        const negativeKeywords = ['差別', '偏見', '攻撃', '否定'];
        const hasNegative = negativeKeywords.some(keyword =>
            statement.toLowerCase().includes(keyword)
        );
        return hasNegative ? 0.3 : 0.9;
    }

    private generateSevenDimensionFeedback(dimensions: Record<string, number>): string {
        const lowestDimension = Object.entries(dimensions).reduce(
            (min, [key, value]) => value < min.value ? { key, value } : min,
            { key: '', value: 1.0 }
        );

        if (lowestDimension.value < 0.6) {
            const dimensionNames: Record<string, string> = {
                performance: 'パフォーマンス',
                psychological: '心理的適切性',
                externalAlignment: '外部整合性',
                internalConsistency: '内部一貫性',
                socialDecisionMaking: '社会的配慮',
                contentQuality: 'コンテンツ品質',
                ethics: '倫理性'
            };

            return `${dimensionNames[lowestDimension.key]}の改善が推奨されます。`;
        }

        return '全体的にバランスの取れた発言です。';
    }

    private generateSevenDimensionSuggestions(dimensions: Record<string, number>): string[] {
        const suggestions: string[] = [];

        if (dimensions.contentQuality < 0.7) {
            suggestions.push('より詳細で具体的な内容を含めてください');
        }
        if (dimensions.socialDecisionMaking < 0.7) {
            suggestions.push('他者への配慮や協調性を示してください');
        }
        if (dimensions.externalAlignment < 0.7) {
            suggestions.push('トピックにより密接に関連した内容にしてください');
        }

        if (suggestions.length === 0) {
            suggestions.push('高品質な発言です。この水準を維持してください');
        }

        return suggestions;
    }
}
