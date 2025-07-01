import type { DiscussionStatement } from '../types/mbti-types';

/**
 * オーケストレーター介入結果の型定義
 */
export interface OrchestratorIntervention {
    interventionExecuted: boolean;
    interventionType: string;
    guidance: string;
}

/**
 * オーケストレーター介入システム
 * 品質メトリクスに基づいて必要に応じて議論を指導
 */
export async function executeOrchestratorIntervention(
    orchestrator: any,
    qualityMetrics: any,
    currentPhase: string,
    statements: DiscussionStatement[]
): Promise<OrchestratorIntervention> {
    // 介入条件の判定
    const needsIntervention =
        qualityMetrics.diversityScore < 0.6 ||
        qualityMetrics.consistencyScore < 0.7 ||
        qualityMetrics.convergenceEfficiency < 0.5;

    if (!needsIntervention || !orchestrator) {
        return {
            interventionExecuted: false,
            interventionType: 'none',
            guidance: ''
        };
    }

    // 介入タイプの決定
    let interventionType = '';
    let guidancePrompt = '';

    if (qualityMetrics.diversityScore < 0.6) {
        interventionType = 'diversity_boost';
        guidancePrompt = `議論の多様性が不足しています（${(qualityMetrics.diversityScore * 100).toFixed(0)}%）。` +
            `参加者により多角的な視点や異なる解釈を促すための指導をお願いします。`;
    } else if (qualityMetrics.consistencyScore < 0.7) {
        interventionType = 'consistency_improvement';
        guidancePrompt = `議論の論理的一貫性に課題があります（${(qualityMetrics.consistencyScore * 100).toFixed(0)}%）。` +
            `議論の構造化と論点の整理を行ってください。`;
    } else if (qualityMetrics.convergenceEfficiency < 0.5) {
        interventionType = 'convergence_facilitation';
        guidancePrompt = `合意形成が困難な状況です（${(qualityMetrics.convergenceEfficiency * 100).toFixed(0)}%）。` +
            `共通点の発見と建設的な解決策の模索を促進してください。`;
    }

    try {
        const response = await orchestrator.generate([
            {
                role: 'system',
                content: `あなたは議論の品質を監視し、必要に応じて参加者を指導するオーケストレーターです。`
            },
            {
                role: 'user',
                content: `${guidancePrompt}\n\n現在の議論状況:\n` +
                    `最近の発言: ${statements.slice(-3).map(s => `${s.mbtiType}: ${s.content.substring(0, 100)}...`).join('\n')}\n\n` +
                    `具体的な改善指導を200文字以内で提供してください。`
            }
        ]);

        return {
            interventionExecuted: true,
            interventionType,
            guidance: response.text
        };

    } catch (error) {
        console.warn(`⚠️ オーケストレーター介入でエラーが発生: ${error}`);
        return {
            interventionExecuted: false,
            interventionType: 'error',
            guidance: ''
        };
    }
}

/**
 * 特定の問題パターンに対する介入戦略
 */
export function getInterventionStrategy(qualityMetrics: any): {
    priority: 'high' | 'medium' | 'low';
    focusArea: string;
    specificActions: string[];
} {
    const issues = [];

    if (qualityMetrics.diversityScore < 0.5) {
        issues.push({
            priority: 'high' as const,
            focusArea: 'diversity',
            actions: [
                '未発言または発言頻度の低いMBTIタイプに発言機会を提供',
                '異なる視点からの意見を積極的に求める',
                '同じような視点の発言が続いている場合は流れを変える'
            ]
        });
    }

    if (qualityMetrics.consistencyScore < 0.6) {
        issues.push({
            priority: 'high' as const,
            focusArea: 'consistency',
            actions: [
                '論点を整理し、議論の焦点を明確化する',
                '矛盾する主張について明確化を求める',
                '建設的な議論に向けた方向性を示す'
            ]
        });
    }

    if (qualityMetrics.convergenceEfficiency < 0.4) {
        issues.push({
            priority: 'medium' as const,
            focusArea: 'convergence',
            actions: [
                '共通する価値観や目標を特定する',
                '意見の違いを建設的な対話に変換する',
                '具体的な解決策の提案を促す'
            ]
        });
    }

    if (issues.length === 0) {
        return {
            priority: 'low',
            focusArea: 'maintenance',
            specificActions: ['議論の質を維持し、さらなる深化を促進']
        };
    }

    // 最も優先度の高い問題を選択
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const topIssue = issues.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])[0];

    return {
        priority: topIssue.priority,
        focusArea: topIssue.focusArea,
        specificActions: topIssue.actions
    };
}

/**
 * 緊急介入が必要な状況の検出
 */
export function detectEmergencyIntervention(
    statements: DiscussionStatement[],
    qualityMetrics: any
): {
    isEmergency: boolean;
    reason: string;
    urgentActions: string[];
} {
    const emergencyConditions = [];

    // 長時間同じエージェントが発言し続けている
    if (statements.length >= 3) {
        const lastThree = statements.slice(-3);
        if (lastThree.every(s => s.mbtiType === lastThree[0].mbtiType)) {
            emergencyConditions.push({
                reason: '特定のエージェントが3回連続で発言している',
                actions: ['他のエージェントに発言機会を与える', '異なる視点からの意見を促す']
            });
        }
    }

    // 品質スコアが危険なレベルまで低下
    if (qualityMetrics.diversityScore < 0.3 || qualityMetrics.consistencyScore < 0.4) {
        emergencyConditions.push({
            reason: '議論品質が危険なレベルまで低下している',
            actions: ['議論をリセットして新しい方向性を提示', '明確な指導と構造化を行う']
        });
    }

    // 議論が停滞している（低い相互作用）
    if (qualityMetrics.interactionQuality < 0.3) {
        emergencyConditions.push({
            reason: '議論の相互作用が著しく低下している',
            actions: ['活発な議論を促すための問いかけを行う', '参加者の積極的な関与を促進']
        });
    }

    if (emergencyConditions.length === 0) {
        return {
            isEmergency: false,
            reason: '',
            urgentActions: []
        };
    }

    // 最も深刻な問題を選択
    const primaryIssue = emergencyConditions[0];

    return {
        isEmergency: true,
        reason: primaryIssue.reason,
        urgentActions: primaryIssue.actions
    };
}
