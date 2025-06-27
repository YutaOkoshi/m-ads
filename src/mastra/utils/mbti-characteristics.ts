import type { MBTICharacteristics, MBTIType, MBTIGroup } from '../types/mbti-types';

// Phase 1: 4つのグループ代表のみ定義
export const MBTI_CHARACTERISTICS: Record<MBTIType, MBTICharacteristics> = {
  // NT代表: INTJ (The Architect)
  INTJ: {
    type: 'INTJ',
    group: 'NT',
    cognitiveFunction: {
      dominant: 'Ni (内向的直観)',
      auxiliary: 'Te (外向的思考)',
      tertiary: 'Fi (内向的感情)',
      inferior: 'Se (外向的感覚)'
    },
    communicationStyle: {
      focus: '戦略的・長期的視点',
      approach: '論理的・体系的',
      preference: '効率的・構造化された議論'
    },
    decisionMaking: {
      primary: '論理的分析',
      secondary: '直観的洞察'
    },
    weight: 1.0
  },

  // NF代表: INFJ (The Advocate)
  INFJ: {
    type: 'INFJ',
    group: 'NF',
    cognitiveFunction: {
      dominant: 'Ni (内向的直観)',
      auxiliary: 'Fe (外向的感情)',
      tertiary: 'Ti (内向的思考)',
      inferior: 'Se (外向的感覚)'
    },
    communicationStyle: {
      focus: '人間中心・価値観重視',
      approach: '共感的・洞察的',
      preference: '意味と目的を重視した議論'
    },
    decisionMaking: {
      primary: '価値観との整合性',
      secondary: '直観的理解'
    },
    weight: 1.0
  },

  // SJ代表: ISTJ (The Inspector)
  ISTJ: {
    type: 'ISTJ',
    group: 'SJ',
    cognitiveFunction: {
      dominant: 'Si (内向的感覚)',
      auxiliary: 'Te (外向的思考)',
      tertiary: 'Fi (内向的感情)',
      inferior: 'Ne (外向的直観)'
    },
    communicationStyle: {
      focus: '実践的・具体的事実',
      approach: '慎重・詳細志向',
      preference: '構造化された段階的議論'
    },
    decisionMaking: {
      primary: '過去の経験と実績',
      secondary: '論理的整合性'
    },
    weight: 1.0
  },

  // SP代表: ISTP (The Virtuoso)
  ISTP: {
    type: 'ISTP',
    group: 'SP',
    cognitiveFunction: {
      dominant: 'Ti (内向的思考)',
      auxiliary: 'Se (外向的感覚)',
      tertiary: 'Ni (内向的直観)',
      inferior: 'Fe (外向的感情)'
    },
    communicationStyle: {
      focus: '実用的・問題解決志向',
      approach: '分析的・実践的',
      preference: '具体的で実行可能な議論'
    },
    decisionMaking: {
      primary: '論理的分析',
      secondary: '実践的有効性'
    },
    weight: 1.0
  },

  // Phase 2で実装予定の他のタイプ
  INTP: {} as MBTICharacteristics,
  ENTJ: {} as MBTICharacteristics,
  ENTP: {} as MBTICharacteristics,
  INFP: {} as MBTICharacteristics,
  ENFJ: {} as MBTICharacteristics,
  ENFP: {} as MBTICharacteristics,
  ISFJ: {} as MBTICharacteristics,
  ESTJ: {} as MBTICharacteristics,
  ESFJ: {} as MBTICharacteristics,
  ISFP: {} as MBTICharacteristics,
  ESTP: {} as MBTICharacteristics,
  ESFP: {} as MBTICharacteristics
};

// グループ間の相性スコア（0-1）
export const GROUP_COMPATIBILITY: Record<MBTIGroup, Record<MBTIGroup, number>> = {
  NT: { NT: 0.8, NF: 0.6, SJ: 0.5, SP: 0.7 },
  NF: { NT: 0.6, NF: 0.9, SJ: 0.4, SP: 0.5 },
  SJ: { NT: 0.5, NF: 0.4, SJ: 0.8, SP: 0.3 },
  SP: { NT: 0.7, NF: 0.5, SJ: 0.3, SP: 0.8 }
};

// 議論フェーズごとの重み調整係数
export const PHASE_WEIGHT_MODIFIERS: Record<string, Record<MBTIGroup, number>> = {
  brainstorming: { NT: 0.9, NF: 1.2, SJ: 0.8, SP: 1.1 },
  analysis: { NT: 1.3, NF: 0.9, SJ: 1.1, SP: 0.8 },
  synthesis: { NT: 1.1, NF: 1.0, SJ: 0.9, SP: 0.9 },
  conclusion: { NT: 1.0, NF: 0.8, SJ: 1.2, SP: 1.0 }
};

export function getGroupFromType(type: MBTIType): MBTIGroup {
  const char = MBTI_CHARACTERISTICS[type];
  return char?.group || 'NT';
}

export function calculateDynamicWeight(
  type: MBTIType,
  phase: string,
  previousInteractions: number = 0
): number {
  const baseWeight = MBTI_CHARACTERISTICS[type]?.weight || 1.0;
  const group = getGroupFromType(type);
  const phaseModifier = PHASE_WEIGHT_MODIFIERS[phase]?.[group] || 1.0;
  
  // 過去の相互作用に基づく調整（発言が多すぎる場合は重みを下げる）
  const interactionModifier = Math.max(0.5, 1.0 - (previousInteractions * 0.1));
  
  return baseWeight * phaseModifier * interactionModifier;
} 