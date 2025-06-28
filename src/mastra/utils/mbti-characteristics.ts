import type { MBTICharacteristics, MBTIType, MBTIGroup } from '../types/mbti-types';

// Phase 1: 4つのグループ代表のみ定義
// 全MBTIタイプの配列
export const ALL_MBTI_TYPES: MBTIType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

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

  // NT: INTP (The Thinker)
  INTP: {
    type: 'INTP',
    group: 'NT',
    cognitiveFunction: {
      dominant: 'Ti (内向的思考)',
      auxiliary: 'Ne (外向的直観)',
      tertiary: 'Si (内向的感覚)',
      inferior: 'Fe (外向的感情)'
    },
    communicationStyle: {
      focus: '理論的・概念的探求',
      approach: '分析的・客観的',
      preference: '論理的整合性を重視した議論'
    },
    decisionMaking: {
      primary: '論理的一貫性',
      secondary: '可能性の探索'
    },
    weight: 1.0
  },

  // NT: ENTJ (The Commander)
  ENTJ: {
    type: 'ENTJ',
    group: 'NT',
    cognitiveFunction: {
      dominant: 'Te (外向的思考)',
      auxiliary: 'Ni (内向的直観)',
      tertiary: 'Se (外向的感覚)',
      inferior: 'Fi (内向的感情)'
    },
    communicationStyle: {
      focus: '目標達成・リーダーシップ',
      approach: '決断力・推進力重視',
      preference: '効率的で結果志向の議論'
    },
    decisionMaking: {
      primary: '効率性と成果',
      secondary: '戦略的思考'
    },
    weight: 1.0
  },

  // NT: ENTP (The Debater)
  ENTP: {
    type: 'ENTP',
    group: 'NT',
    cognitiveFunction: {
      dominant: 'Ne (外向的直観)',
      auxiliary: 'Ti (内向的思考)',
      tertiary: 'Fe (外向的感情)',
      inferior: 'Si (内向的感覚)'
    },
    communicationStyle: {
      focus: '可能性・革新的アイデア',
      approach: '議論好き・挑戦的',
      preference: '創造的で刺激的な議論'
    },
    decisionMaking: {
      primary: '新しい可能性',
      secondary: '論理的検証'
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

  // NF: INFP (The Mediator)
  INFP: {
    type: 'INFP',
    group: 'NF',
    cognitiveFunction: {
      dominant: 'Fi (内向的感情)',
      auxiliary: 'Ne (外向的直観)',
      tertiary: 'Si (内向的感覚)',
      inferior: 'Te (外向的思考)'
    },
    communicationStyle: {
      focus: '個人的価値・真正性',
      approach: '理想主義・個性重視',
      preference: '価値観と意味を重視した議論'
    },
    decisionMaking: {
      primary: '個人的価値観',
      secondary: '可能性の探求'
    },
    weight: 1.0
  },

  // NF: ENFJ (The Protagonist)
  ENFJ: {
    type: 'ENFJ',
    group: 'NF',
    cognitiveFunction: {
      dominant: 'Fe (外向的感情)',
      auxiliary: 'Ni (内向的直観)',
      tertiary: 'Se (外向的感覚)',
      inferior: 'Ti (内向的思考)'
    },
    communicationStyle: {
      focus: '人間関係・調和',
      approach: '鼓舞的・協調的',
      preference: '皆が参加できる包容的な議論'
    },
    decisionMaking: {
      primary: '他者への影響',
      secondary: '直観的理解'
    },
    weight: 1.0
  },

  // NF: ENFP (The Campaigner)
  ENFP: {
    type: 'ENFP',
    group: 'NF',
    cognitiveFunction: {
      dominant: 'Ne (外向的直観)',
      auxiliary: 'Fi (内向的感情)',
      tertiary: 'Te (外向的思考)',
      inferior: 'Si (内向的感覚)'
    },
    communicationStyle: {
      focus: '人の可能性・インスピレーション',
      approach: '熱情的・創造的',
      preference: '自由で創造的な議論'
    },
    decisionMaking: {
      primary: '人間の可能性',
      secondary: '個人的価値'
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

  // SJ: ISFJ (The Protector)
  ISFJ: {
    type: 'ISFJ',
    group: 'SJ',
    cognitiveFunction: {
      dominant: 'Si (内向的感覚)',
      auxiliary: 'Fe (外向的感情)',
      tertiary: 'Ti (内向的思考)',
      inferior: 'Ne (外向的直観)'
    },
    communicationStyle: {
      focus: '他者への配慮・支援',
      approach: '協力的・責任感重視',
      preference: '安心できる協調的な議論'
    },
    decisionMaking: {
      primary: '他者への影響',
      secondary: '実践的経験'
    },
    weight: 1.0
  },

  // SJ: ESTJ (The Executive)
  ESTJ: {
    type: 'ESTJ',
    group: 'SJ',
    cognitiveFunction: {
      dominant: 'Te (外向的思考)',
      auxiliary: 'Si (内向的感覚)',
      tertiary: 'Ne (外向的直観)',
      inferior: 'Fi (内向的感情)'
    },
    communicationStyle: {
      focus: '組織運営・効率性',
      approach: '指導的・現実的',
      preference: '構造化された目標志向の議論'
    },
    decisionMaking: {
      primary: '効率性と実績',
      secondary: '既存の実践'
    },
    weight: 1.0
  },

  // SJ: ESFJ (The Consul)
  ESFJ: {
    type: 'ESFJ',
    group: 'SJ',
    cognitiveFunction: {
      dominant: 'Fe (外向的感情)',
      auxiliary: 'Si (内向的感覚)',
      tertiary: 'Ne (外向的直観)',
      inferior: 'Ti (内向的思考)'
    },
    communicationStyle: {
      focus: '調和・社会的責任',
      approach: '支援的・協調的',
      preference: '皆が心地よい協力的な議論'
    },
    decisionMaking: {
      primary: '集団の調和',
      secondary: '実践的経験'
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

  // SP: ISFP (The Adventurer)
  ISFP: {
    type: 'ISFP',
    group: 'SP',
    cognitiveFunction: {
      dominant: 'Fi (内向的感情)',
      auxiliary: 'Se (外向的感覚)',
      tertiary: 'Ni (内向的直観)',
      inferior: 'Te (外向的思考)'
    },
    communicationStyle: {
      focus: '個人的体験・美的価値',
      approach: '柔軟・個性重視',
      preference: '自由で個性的な議論'
    },
    decisionMaking: {
      primary: '個人的価値観',
      secondary: '現在の体験'
    },
    weight: 1.0
  },

  // SP: ESTP (The Entrepreneur)
  ESTP: {
    type: 'ESTP',
    group: 'SP',
    cognitiveFunction: {
      dominant: 'Se (外向的感覚)',
      auxiliary: 'Ti (内向的思考)',
      tertiary: 'Fe (外向的感情)',
      inferior: 'Ni (内向的直観)'
    },
    communicationStyle: {
      focus: '現実的・行動志向',
      approach: '実用的・エネルギッシュ',
      preference: '活動的で実践的な議論'
    },
    decisionMaking: {
      primary: '即座の実用性',
      secondary: '論理的分析'
    },
    weight: 1.0
  },

  // SP: ESFP (The Entertainer)
  ESFP: {
    type: 'ESFP',
    group: 'SP',
    cognitiveFunction: {
      dominant: 'Se (外向的感覚)',
      auxiliary: 'Fi (内向的感情)',
      tertiary: 'Te (外向的思考)',
      inferior: 'Ni (内向的直観)'
    },
    communicationStyle: {
      focus: '人との関係・楽しさ',
      approach: '社交的・現在重視',
      preference: '楽しく参加しやすい議論'
    },
    decisionMaking: {
      primary: '人への影響',
      secondary: '現在の体験'
    },
    weight: 1.0
  }
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

// MBTI認知機能マッピング
export const MBTI_COGNITIVE_FUNCTIONS: Record<MBTIType, {
  dominant: string;
  auxiliary: string;
  tertiary: string;
  inferior: string;
}> = {
  INTJ: { dominant: 'Ni', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Se' },
  INTP: { dominant: 'Ti', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Fe' },
  ENTJ: { dominant: 'Te', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Fi' },
  ENTP: { dominant: 'Ne', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Si' },
  INFJ: { dominant: 'Ni', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Se' },
  INFP: { dominant: 'Fi', auxiliary: 'Ne', tertiary: 'Si', inferior: 'Te' },
  ENFJ: { dominant: 'Fe', auxiliary: 'Ni', tertiary: 'Se', inferior: 'Ti' },
  ENFP: { dominant: 'Ne', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Si' },
  ISTJ: { dominant: 'Si', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Ne' },
  ISFJ: { dominant: 'Si', auxiliary: 'Fe', tertiary: 'Ti', inferior: 'Ne' },
  ESTJ: { dominant: 'Te', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Fi' },
  ESFJ: { dominant: 'Fe', auxiliary: 'Si', tertiary: 'Ne', inferior: 'Ti' },
  ISTP: { dominant: 'Ti', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Fe' },
  ISFP: { dominant: 'Fi', auxiliary: 'Se', tertiary: 'Ni', inferior: 'Te' },
  ESTP: { dominant: 'Se', auxiliary: 'Ti', tertiary: 'Fe', inferior: 'Ni' },
  ESFP: { dominant: 'Se', auxiliary: 'Fi', tertiary: 'Te', inferior: 'Ni' }
};

// MBTI相性マトリックス（0-1の相性スコア）
export const MBTI_COMPATIBILITY_MATRIX: Record<MBTIType, Record<MBTIType, number>> = {
  INTJ: { INTJ: 0.8, INTP: 0.9, ENTJ: 0.7, ENTP: 0.8, INFJ: 0.6, INFP: 0.5, ENFJ: 0.4, ENFP: 0.6, ISTJ: 0.5, ISFJ: 0.3, ESTJ: 0.6, ESFJ: 0.2, ISTP: 0.7, ISFP: 0.4, ESTP: 0.5, ESFP: 0.3 },
  INTP: { INTJ: 0.9, INTP: 0.8, ENTJ: 0.8, ENTP: 0.9, INFJ: 0.7, INFP: 0.6, ENFJ: 0.5, ENFP: 0.7, ISTJ: 0.4, ISFJ: 0.3, ESTJ: 0.5, ESFJ: 0.2, ISTP: 0.8, ISFP: 0.5, ESTP: 0.6, ESFP: 0.4 },
  ENTJ: { INTJ: 0.7, INTP: 0.8, ENTJ: 0.8, ENTP: 0.9, INFJ: 0.5, INFP: 0.4, ENFJ: 0.6, ENFP: 0.7, ISTJ: 0.6, ISFJ: 0.4, ESTJ: 0.8, ESFJ: 0.5, ISTP: 0.6, ISFP: 0.3, ESTP: 0.7, ESFP: 0.5 },
  ENTP: { INTJ: 0.8, INTP: 0.9, ENTJ: 0.9, ENTP: 0.8, INFJ: 0.6, INFP: 0.7, ENFJ: 0.7, ENFP: 0.8, ISTJ: 0.3, ISFJ: 0.4, ESTJ: 0.6, ESFJ: 0.5, ISTP: 0.7, ISFP: 0.6, ESTP: 0.8, ESFP: 0.7 },
  INFJ: { INTJ: 0.6, INTP: 0.7, ENTJ: 0.5, ENTP: 0.6, INFJ: 0.9, INFP: 0.8, ENFJ: 0.8, ENFP: 0.7, ISTJ: 0.4, ISFJ: 0.6, ESTJ: 0.3, ESFJ: 0.5, ISTP: 0.5, ISFP: 0.7, ESTP: 0.4, ESFP: 0.6 },
  INFP: { INTJ: 0.5, INTP: 0.6, ENTJ: 0.4, ENTP: 0.7, INFJ: 0.8, INFP: 0.8, ENFJ: 0.7, ENFP: 0.9, ISTJ: 0.3, ISFJ: 0.5, ESTJ: 0.2, ESFJ: 0.4, ISTP: 0.6, ISFP: 0.8, ESTP: 0.5, ESFP: 0.7 },
  ENFJ: { INTJ: 0.4, INTP: 0.5, ENTJ: 0.6, ENTP: 0.7, INFJ: 0.8, INFP: 0.7, ENFJ: 0.8, ENFP: 0.8, ISTJ: 0.5, ISFJ: 0.7, ESTJ: 0.6, ESFJ: 0.8, ISTP: 0.4, ISFP: 0.6, ESTP: 0.6, ESFP: 0.8 },
  ENFP: { INTJ: 0.6, INTP: 0.7, ENTJ: 0.7, ENTP: 0.8, INFJ: 0.7, INFP: 0.9, ENFJ: 0.8, ENFP: 0.8, ISTJ: 0.3, ISFJ: 0.5, ESTJ: 0.5, ESFJ: 0.7, ISTP: 0.5, ISFP: 0.7, ESTP: 0.7, ESFP: 0.8 },
  ISTJ: { INTJ: 0.5, INTP: 0.4, ENTJ: 0.6, ENTP: 0.3, INFJ: 0.4, INFP: 0.3, ENFJ: 0.5, ENFP: 0.3, ISTJ: 0.8, ISFJ: 0.7, ESTJ: 0.8, ESFJ: 0.6, ISTP: 0.6, ISFP: 0.5, ESTP: 0.5, ESFP: 0.4 },
  ISFJ: { INTJ: 0.3, INTP: 0.3, ENTJ: 0.4, ENTP: 0.4, INFJ: 0.6, INFP: 0.5, ENFJ: 0.7, ENFP: 0.5, ISTJ: 0.7, ISFJ: 0.8, ESTJ: 0.6, ESFJ: 0.8, ISTP: 0.5, ISFP: 0.6, ESTP: 0.4, ESFP: 0.6 },
  ESTJ: { INTJ: 0.6, INTP: 0.5, ENTJ: 0.8, ENTP: 0.6, INFJ: 0.3, INFP: 0.2, ENFJ: 0.6, ENFP: 0.5, ISTJ: 0.8, ISFJ: 0.6, ESTJ: 0.8, ESFJ: 0.7, ISTP: 0.5, ISFP: 0.3, ESTP: 0.6, ESFP: 0.5 },
  ESFJ: { INTJ: 0.2, INTP: 0.2, ENTJ: 0.5, ENTP: 0.5, INFJ: 0.5, INFP: 0.4, ENFJ: 0.8, ENFP: 0.7, ISTJ: 0.6, ISFJ: 0.8, ESTJ: 0.7, ESFJ: 0.8, ISTP: 0.3, ISFP: 0.5, ESTP: 0.5, ESFP: 0.7 },
  ISTP: { INTJ: 0.7, INTP: 0.8, ENTJ: 0.6, ENTP: 0.7, INFJ: 0.5, INFP: 0.6, ENFJ: 0.4, ENFP: 0.5, ISTJ: 0.6, ISFJ: 0.5, ESTJ: 0.5, ESFJ: 0.3, ISTP: 0.8, ISFP: 0.7, ESTP: 0.8, ESFP: 0.6 },
  ISFP: { INTJ: 0.4, INTP: 0.5, ENTJ: 0.3, ENTP: 0.6, INFJ: 0.7, INFP: 0.8, ENFJ: 0.6, ENFP: 0.7, ISTJ: 0.5, ISFJ: 0.6, ESTJ: 0.3, ESFJ: 0.5, ISTP: 0.7, ISFP: 0.8, ESTP: 0.6, ESFP: 0.7 },
  ESTP: { INTJ: 0.5, INTP: 0.6, ENTJ: 0.7, ENTP: 0.8, INFJ: 0.4, INFP: 0.5, ENFJ: 0.6, ENFP: 0.7, ISTJ: 0.5, ISFJ: 0.4, ESTJ: 0.6, ESFJ: 0.5, ISTP: 0.8, ISFP: 0.6, ESTP: 0.8, ESFP: 0.8 },
  ESFP: { INTJ: 0.3, INTP: 0.4, ENTJ: 0.5, ENTP: 0.7, INFJ: 0.6, INFP: 0.7, ENFJ: 0.8, ENFP: 0.8, ISTJ: 0.4, ISFJ: 0.6, ESTJ: 0.5, ESFJ: 0.7, ISTP: 0.6, ISFP: 0.7, ESTP: 0.8, ESFP: 0.8 }
};

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
