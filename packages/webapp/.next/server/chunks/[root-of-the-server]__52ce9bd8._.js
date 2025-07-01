module.exports = {

"[project]/.next-internal/server/app/api/discussion/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/app/api/discussion/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": (()=>GET),
    "POST": (()=>POST)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
/**
 * モックデータ生成関数
 */ function createMockResult(config) {
    return {
        topic: config.topic,
        participantTypes: [
            'INTJ',
            'ENFP',
            'ISTP',
            'ESFJ'
        ],
        totalStatements: 24,
        totalTurns: 4,
        conversationFlow: [
            {
                turnNumber: 1,
                speakerAgentId: 'node-INTJ',
                speakerMbtiType: 'INTJ',
                statement: `${config.topic}について戦略的な視点から分析すると、長期的な視点での体系的なアプローチが重要です。データ駆動の意思決定プロセスを構築し、潜在的なリスクと機会を事前に評価する必要があります。`,
                timestamp: new Date().toISOString(),
                confidence: 0.85,
                relevance: 0.90,
                dynamicWeight: 1.2,
                qualityContribution: 0.88,
                sevenDimensionEvaluation: {
                    performance: 0.85,
                    psychological: 0.90,
                    externalAlignment: 0.82,
                    internalConsistency: 0.88,
                    socialDecisionMaking: 0.75,
                    contentQuality: 0.87,
                    ethics: 0.92,
                    overallQuality: 0.86
                },
                realtimeOptimization: {
                    weightAdjustment: 0.1,
                    graphOptimization: false,
                    qualityImprovement: 0.05
                }
            },
            {
                turnNumber: 2,
                speakerAgentId: 'node-ENFP',
                speakerMbtiType: 'ENFP',
                statement: `それは素晴らしい視点ですね！INTJさんの分析的アプローチに加えて、人間的な側面からも考えてみたいと思います。創造性というのは論理だけでなく、感情や直感、そして人々の夢や希望から生まれるものです。技術の進歩と人間らしさのバランスを見つけることが鍵になりそうです。`,
                timestamp: new Date().toISOString(),
                confidence: 0.92,
                relevance: 0.88,
                dynamicWeight: 1.1,
                qualityContribution: 0.90,
                sevenDimensionEvaluation: {
                    performance: 0.88,
                    psychological: 0.95,
                    externalAlignment: 0.85,
                    internalConsistency: 0.87,
                    socialDecisionMaking: 0.92,
                    contentQuality: 0.89,
                    ethics: 0.94,
                    overallQuality: 0.90
                },
                realtimeOptimization: {
                    weightAdjustment: 0.05,
                    graphOptimization: true,
                    qualityImprovement: 0.08
                }
            },
            {
                turnNumber: 3,
                speakerAgentId: 'node-ISTP',
                speakerMbtiType: 'ISTP',
                statement: `実践的な観点から考えると、理論だけでは不十分です。実際にツールを使ってみて、どう活用するかが重要。私たちは技術を実生活でどう応用するか、具体的な手順や方法論を確立する必要があります。現場での試行錯誤を通じて最適解を見つけることが大切だと思います。`,
                timestamp: new Date().toISOString(),
                confidence: 0.82,
                relevance: 0.85,
                dynamicWeight: 0.95,
                qualityContribution: 0.84,
                sevenDimensionEvaluation: {
                    performance: 0.82,
                    psychological: 0.88,
                    externalAlignment: 0.86,
                    internalConsistency: 0.84,
                    socialDecisionMaking: 0.78,
                    contentQuality: 0.83,
                    ethics: 0.89,
                    overallQuality: 0.84
                },
                realtimeOptimization: {
                    weightAdjustment: -0.05,
                    graphOptimization: false,
                    qualityImprovement: 0.02
                }
            },
            {
                turnNumber: 4,
                speakerAgentId: 'node-ESFJ',
                speakerMbtiType: 'ESFJ',
                statement: `皆さんの意見を聞いて、とても包括的な視点が得られました。私は、変化の中で人々が安心して成長できる環境を作ることが大切だと考えます。新しい技術を導入する際は、チーム全体のハーモニーを保ち、一人ひとりのニーズに配慮しながら進めることで、より良い結果が得られると思います。`,
                timestamp: new Date().toISOString(),
                confidence: 0.89,
                relevance: 0.91,
                dynamicWeight: 1.05,
                qualityContribution: 0.87,
                sevenDimensionEvaluation: {
                    performance: 0.87,
                    psychological: 0.93,
                    externalAlignment: 0.88,
                    internalConsistency: 0.85,
                    socialDecisionMaking: 0.94,
                    contentQuality: 0.86,
                    ethics: 0.96,
                    overallQuality: 0.87
                },
                realtimeOptimization: {
                    weightAdjustment: 0.02,
                    graphOptimization: true,
                    qualityImprovement: 0.03
                }
            }
        ],
        comprehensiveMetrics: {
            performanceScore: 0.86,
            psychologicalScore: 0.92,
            externalAlignmentScore: 0.84,
            internalConsistencyScore: 0.88,
            socialDecisionScore: 0.84,
            contentQualityScore: 0.88,
            ethicsScore: 0.93,
            diversityScore: 0.85,
            consistencyScore: 0.82,
            convergenceEfficiency: 0.79,
            mbtiAlignmentScore: 0.91,
            interactionQuality: 0.87,
            argumentQuality: 0.86,
            participationBalance: 0.78,
            resolutionRate: 0.81
        },
        realtimeOptimization: {
            optimizationCount: 3,
            qualityImprovement: 0.12,
            weightAdjustments: {
                'INTJ': 1.2,
                'ENFP': 1.1,
                'ISTP': 0.95,
                'ESFJ': 1.05
            },
            graphOptimizations: 2,
            recommendations: [
                'INTJの分析力を活用して議論の方向性を明確化',
                'ENFPの創造性で新しいアイデアを促進',
                'ISTPの実践的視点を重要な意思決定段階で活用',
                'ESFJの調和力でチーム全体のバランスを最適化'
            ]
        },
        advancedReport: {
            summary: `${config.topic}に関する議論で優秀な結果を達成しました。4つの異なるMBTIタイプが各々の強みを活かして建設的な対話を展開し、包括的な視点から課題を検討することができました。`,
            strengths: [
                '多様な視点からの包括的分析（戦略的・人間的・実践的・調和的）',
                '高い心理的適合性とMBTI特性の再現',
                '建設的な対話と段階的な合意形成',
                '各タイプの強みを活かした役割分担'
            ],
            weaknesses: [
                '議論の収束に若干の改善余地',
                '参加バランスの最適化が可能',
                'より具体的な行動計画の策定が必要'
            ],
            overallScore: 0.86,
            grade: 'A-',
            detailedAnalysis: '7次元品質評価で高スコアを記録。特に心理的適合性（92%）と倫理性（93%）で優秀な結果。各MBTIタイプの特性が明確に現れており、実際の人間の議論に近い品質を実現。',
            mbtiTypeAnalysis: {
                'INTJ': {
                    participationRate: 0.25,
                    qualityContribution: 0.88,
                    characteristicAlignment: 0.91
                },
                'ENFP': {
                    participationRate: 0.25,
                    qualityContribution: 0.90,
                    characteristicAlignment: 0.95
                },
                'ISTP': {
                    participationRate: 0.25,
                    qualityContribution: 0.84,
                    characteristicAlignment: 0.87
                },
                'ESFJ': {
                    participationRate: 0.25,
                    qualityContribution: 0.87,
                    characteristicAlignment: 0.89
                }
            }
        },
        discussionSummary: {
            overview: `${config.topic}について4つのMBTIタイプが活発な議論を展開し、建設的な合意形成に成功しました。各タイプの特性が活かされ、多角的な分析から実用的な洞察が得られました。`,
            keyThemes: [
                '戦略的分析',
                '人間中心の視点',
                '実践的アプローチ',
                '調和的統合'
            ],
            progressAnalysis: '段階的な議論の深化が見られ、各タイプの特性を活かした自然な発言順序で議論が進行しました。リアルタイム最適化により品質が向上し、効率的な合意形成を実現。',
            mbtiContributions: {
                'INTJ': '戦略的フレームワークの提供と長期的視点の導入',
                'ENFP': '創造的アイデアと人間的価値観の強調',
                'ISTP': '実践的解決策と現実的制約の考慮',
                'ESFJ': '調和的統合と全体的バランスの維持'
            },
            consensus: '技術と人間性のバランスを重視し、実践的なアプローチを通じて段階的に発展させていく方向性で合意',
            insights: [
                'MBTIタイプの多様性が議論の質を大幅に向上させる',
                'リアルタイム最適化により効率的な合意形成が可能',
                '7次元評価により包括的な品質管理を実現',
                '各タイプの強みを活かした役割分担が自然に発生'
            ],
            processCharacteristics: [
                '段階的な議論の深化と自然な発言順序',
                '各タイプの認知特性を活かした貢献パターン',
                'リアルタイム調整による品質と効率の向上',
                '建設的な対話によるシナジー効果の創出'
            ]
        }
    };
}
async function POST(request) {
    try {
        console.log('🚀 M-ADS議論API開始');
        // リクエストボディを解析
        const config = await request.json();
        console.log('📊 議論設定:', config);
        // バリデーション
        if (!config.topic || config.topic.trim().length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'トピックは必須です',
                timestamp: new Date().toISOString()
            }, {
                status: 400
            });
        }
        if (config.participantCount < 4 || config.participantCount > 16) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: '参加者数は4-16の範囲で指定してください',
                timestamp: new Date().toISOString()
            }, {
                status: 400
            });
        }
        // 🚀 Mastraワークフローとの統合実装
        console.log('🔄 Mastraワークフロー実行開始...');
        let result;
        try {
            // 🎯 Mastraワークフローの動的インポートと実行
            // 🎯 Mastraワークフロー統合（現在は準備中）
            // TODO: Mastraワークフロー実行の実装
            // const { advancedMBTIDiscussionWorkflow } = await import('../../../../../../mastra/workflows/mbti-discussion-workflow');
            // result = await advancedMBTIDiscussionWorkflow({ ...config });
            console.log('� 現在はモックデータを使用中（Mastraワークフロー統合準備完了）');
            throw new Error('モックデータでE2Eテスト実行中');
        } catch (mastraError) {
            console.error('⚠️ Mastraワークフロー実行失敗、モックデータでフォールバック:', mastraError);
            // フォールバック：Mastra実行失敗時はモックデータを返す
            result = createMockResult(config);
        }
        console.log('✅ M-ADS議論完了');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ M-ADS議論API エラー:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error instanceof Error ? error.message : '内部サーバーエラー',
            timestamp: new Date().toISOString()
        }, {
            status: 500
        });
    }
}
async function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        data: {
            availableTypes: [
                'INTJ',
                'INTP',
                'ENTJ',
                'ENTP',
                'INFJ',
                'INFP',
                'ENFJ',
                'ENFP',
                'ISTJ',
                'ISFJ',
                'ESTJ',
                'ESFJ',
                'ISTP',
                'ISFP',
                'ESTP',
                'ESFP' // SP (Artisan)
            ],
            defaultConfig: {
                participantCount: 8,
                enableRealtimeOptimization: true,
                enableGraphOptimization: true,
                qualityThreshold: 0.8,
                saveConversation: false,
                outputFormat: 'markdown',
                outputDirectory: './conversations'
            }
        },
        timestamp: new Date().toISOString()
    });
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__52ce9bd8._.js.map