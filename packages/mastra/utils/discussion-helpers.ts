import type { MBTIType, DiscussionStatement } from '../types/mbti-types';
import { ALL_MBTI_TYPES } from './mbti-characteristics';

/**
 * 多様性を考慮してMBTIタイプを選択する関数
 * 各グループ（NT, NF, SJ, SP）から最低1つずつ選択することで多様性を確保
 */
export function selectDiverseMBTITypes(count: number): MBTIType[] {
  const groups = {
    NT: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] as MBTIType[],
    NF: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] as MBTIType[],
    SJ: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] as MBTIType[],
    SP: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] as MBTIType[]
  };

  const selected: MBTIType[] = [];
  const groupKeys = Object.keys(groups) as (keyof typeof groups)[];

  // 各グループから最低1つは選択
  groupKeys.forEach(group => {
    const availableTypes = groups[group].filter(type => !selected.includes(type));
    if (availableTypes.length > 0) {
      selected.push(availableTypes[Math.floor(Math.random() * availableTypes.length)]);
    }
  });

  // 残りをランダムに選択
  while (selected.length < count) {
    const remainingTypes = ALL_MBTI_TYPES.filter(type => !selected.includes(type));
    if (remainingTypes.length === 0) break;
    selected.push(remainingTypes[Math.floor(Math.random() * remainingTypes.length)]);
  }

  return selected.slice(0, count);
}

/**
 * MBTIタイプに対応するエージェント名を取得する関数
 */
export function getAgentName(type: MBTIType): string {
  const names: Record<MBTIType, string> = {
    'INTJ': 'INTJ-Architect', 'INTP': 'INTP-Thinker', 'ENTJ': 'ENTJ-Commander', 'ENTP': 'ENTP-Debater',
    'INFJ': 'INFJ-Advocate', 'INFP': 'INFP-Mediator', 'ENFJ': 'ENFJ-Protagonist', 'ENFP': 'ENFP-Campaigner',
    'ISTJ': 'ISTJ-Inspector', 'ISFJ': 'ISFJ-Protector', 'ESTJ': 'ESTJ-Executive', 'ESFJ': 'ESFJ-Consul',
    'ISTP': 'ISTP-Virtuoso', 'ISFP': 'ISFP-Adventurer', 'ESTP': 'ESTP-Entrepreneur', 'ESFP': 'ESFP-Entertainer'
  };
  return names[type];
}

/**
 * 重み付けベースのエージェント選択システム
 * パフォーマンス履歴、発言間隔、フェーズ適応性を考慮してエージェントを選択
 */
export function selectNextSpeakerByWeight(
  participants: Array<{
    type: MBTIType;
    weight: number;
    lastSpokenTurn: number;
    performanceHistory: number[];
  }>,
  currentTurn: number,
  phase: string
): {
  selectedParticipant: unknown;
  selectionReason: string;
} {
  // 1. 重み調整（発言間隔を考慮）
  const adjustedWeights = participants.map(p => {
    let weight = p.weight;

    // 発言間隔ペナルティ（最近発言したエージェントの重みを下げる）
    const turnsSinceLastSpoken = currentTurn - p.lastSpokenTurn;
    if (turnsSinceLastSpoken < 2) {
      weight *= 0.5; // 直近発言者の重みを大幅減少
    } else if (turnsSinceLastSpoken > 5) {
      weight *= 1.3; // 長期間発言していないエージェントを優遇
    }

    // パフォーマンス履歴による調整
    const avgPerformance = p.performanceHistory.length > 0 ?
      p.performanceHistory.reduce((sum, score) => sum + score, 0) / p.performanceHistory.length : 0.7;
    weight *= (0.7 + avgPerformance * 0.6); // パフォーマンスを重みに反映

    // フェーズ適応性調整
    if (phase === 'consensus' && (p.type.includes('F') || p.type.includes('J'))) {
      weight *= 1.2; // 合意形成フェーズでは感情・判断タイプを優遇
    } else if (phase === 'analysis' && p.type.includes('T')) {
      weight *= 1.2; // 分析フェーズでは思考タイプを優遇
    }

    return { ...p, adjustedWeight: weight };
  });

  // 2. 重み付き確率選択
  const totalWeight = adjustedWeights.reduce((sum, p) => sum + p.adjustedWeight, 0);
  const random = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const participant of adjustedWeights) {
    cumulativeWeight += participant.adjustedWeight;
    if (random <= cumulativeWeight) {
      const reason = `重み: ${participant.adjustedWeight.toFixed(2)} (基本: ${participant.weight.toFixed(2)}, ` +
        `間隔: ${currentTurn - participant.lastSpokenTurn}ターン, ` +
        `平均成績: ${(participant.performanceHistory.reduce((sum, score) => sum + score, 0) / Math.max(participant.performanceHistory.length, 1) * 100).toFixed(0)}%)`;

      return {
        selectedParticipant: participant,
        selectionReason: reason
      };
    }
  }

  // フォールバック（最高重みのエージェントを選択）
  const fallback = adjustedWeights.reduce((max, p) => p.adjustedWeight > max.adjustedWeight ? p : max);
  return {
    selectedParticipant: fallback,
    selectionReason: `フォールバック選択（最高重み: ${fallback.adjustedWeight.toFixed(2)}）`
  };
}

/**
 * 基本的なフェーズプロンプト生成
 */
export function createPhasePrompt(phase: string, topic: string, mbtiType: MBTIType, recentStatements: DiscussionStatement[]): string {
  const context = recentStatements.length > 0 ?
    `\n\n最近の発言:\n${recentStatements.map(s => `${s.mbtiType}: ${s.content}`).join('\n\n')}` : '';

  const phaseInstructions: Record<string, string> = {
    initial: `${mbtiType}として、このトピックについてあなたの独自の視点から初期意見を述べてください。`,
    interaction: `他のエージェントの意見を踏まえ、建設的な相互作用を行ってください。`,
    synthesis: `これまでの議論を統合し、より深い洞察を提供してください。`,
    consensus: `最終的な合意形成に向けて、あなたの結論を述べてください。`
  };

  return `議論トピック: ${topic}${context}\n\n${phaseInstructions[phase]}\n\n${mbtiType}の特性を活かした200-300文字の回答をお願いします。`;
}

/**
 * 品質メトリクスに基づく強みの生成
 */
export function generateStrengths(metrics: unknown): string[] {
  const strengths = [];
  // 型安全性向上：unknown型の安全なアクセス
  if (typeof metrics === 'object' && metrics !== null) {
    const m = metrics as any;
    if (m.diversityScore >= 0.8) strengths.push('優れた多様性を実現');
    if (m.consistencyScore >= 0.85) strengths.push('高い論理的一貫性を維持');
    if (m.ethicsScore >= 0.9) strengths.push('倫理的配慮が徹底');
    if (m.contentQualityScore >= 0.85) strengths.push('高品質なコンテンツを生成');
  }
  return strengths.length > 0 ? strengths : ['バランスの取れた議論を実現'];
}

/**
 * 品質メトリクスに基づく弱点の生成
 */
export function generateWeaknesses(metrics: unknown): string[] {
  const weaknesses = [];
  // 型安全性向上：unknown型の安全なアクセス
  if (typeof metrics === 'object' && metrics !== null) {
    const m = metrics as any;
    if (m.convergenceEfficiency < 0.75) weaknesses.push('合意形成の効率性要改善');
    if (m.participationBalance < 0.8) weaknesses.push('参加バランスの最適化が必要');
    if (m.resolutionRate < 0.75) weaknesses.push('解決率の向上が必要');
  }
  return weaknesses.length > 0 ? weaknesses : ['特記すべき弱点なし'];
}
