import type { MBTIType, DiscussionStatement } from '../types/mbti-types';
import type { PerformanceFeedback } from './performance-evaluator';

/**
 * 適応的プロンプト生成（評価結果を反映）
 * パフォーマンスフィードバックと重み情報を統合してプロンプトを生成
 */
export function createAdaptivePhasePrompt(
  phase: string,
  topic: string,
  mbtiType: MBTIType,
  recentStatements: DiscussionStatement[],
  performanceFeedback?: PerformanceFeedback,
  currentWeight?: number
): string {
  const context = recentStatements.length > 0 ?
    `\n\n最近の発言:\n${recentStatements.map(s => `${s.mbtiType}: ${s.content}`).join('\n\n')}` : '';

  const phaseInstructions: Record<string, string> = {
    initial: `${mbtiType}として、このトピックについてあなたの独自の視点から初期意見を述べてください。`,
    interaction: `他のエージェントの意見を踏まえ、建設的な相互作用を行ってください。`,
    synthesis: `これまでの議論を統合し、より深い洞察を提供してください。`,
    consensus: `最終的な合意形成に向けて、あなたの結論を述べてください。`
  };

  // パフォーマンスフィードバックの統合
  let feedbackInstruction = '';
  if (performanceFeedback) {
    feedbackInstruction = `\n\n【前回の評価結果】\n評価スコア: ${(performanceFeedback.overallScore * 100).toFixed(0)}%\n` +
      `フィードバック: ${performanceFeedback.feedback}`;

    if (performanceFeedback.improvementSuggestions.length > 0) {
      feedbackInstruction += `\n改善点: ${performanceFeedback.improvementSuggestions.join('、')}`;
    }

    feedbackInstruction += '\n\n上記の評価を参考に、今回はより質の高い発言を心がけてください。';
  }

  // 重み情報の統合
  let weightInstruction = '';
  if (currentWeight && currentWeight !== 1.0) {
    if (currentWeight > 1.2) {
      weightInstruction = `\n\n【重要】あなたの発言の重要度が高く評価されています（重み: ${currentWeight.toFixed(2)}）。議論をリードする積極的な発言をお願いします。`;
    } else if (currentWeight < 0.8) {
      weightInstruction = `\n\n【注意】発言の影響度を高めるため、より独創的で建設的な視点を提供してください（現在の重み: ${currentWeight.toFixed(2)}）。`;
    }
  }

  return `議論トピック: ${topic}${context}\n\n${phaseInstructions[phase]}${feedbackInstruction}${weightInstruction}\n\n${mbtiType}の特性を活かした200-300文字の回答をお願いします。`;
}

/**
 * フェーズ別の特殊プロンプト生成
 * 各議論フェーズに最適化されたプロンプトを生成
 */
export function createPhaseSpecificPrompt(
  phase: string,
  topic: string,
  mbtiType: MBTIType,
  recentStatements: DiscussionStatement[],
  specialContext?: {
    qualityThreshold?: number;
    timeConstraint?: number;
    focusArea?: string;
  }
): string {
  const context = recentStatements.length > 0 ?
    `\n\n最近の議論の流れ:\n${recentStatements.slice(-3).map(s => `${s.mbtiType}: ${s.content.substring(0, 120)}...`).join('\n\n')}` : '';

  let phaseInstructions = '';
  let mbtiSpecificGuidance = '';

  // フェーズ別指示
  switch (phase) {
    case 'initial':
      phaseInstructions = `【初期発言フェーズ】\n${mbtiType}として、このトピックに対するあなたの独特な視点や経験を活かした初期見解を述べてください。`;
      break;
    case 'interaction':
      phaseInstructions = `【相互作用フェーズ】\n他の参加者の意見を踏まえつつ、建設的な議論を展開してください。異なる視点との対話を重視してください。`;
      break;
    case 'synthesis':
      phaseInstructions = `【統合フェーズ】\nこれまでの議論を踏まえ、より深い洞察や統合的な視点を提供してください。複数の意見をつなげる役割を果たしてください。`;
      break;
    case 'consensus':
      phaseInstructions = `【合意形成フェーズ】\n最終的な結論に向けて、あなたの立場を明確にし、合意可能な解決策を提示してください。`;
      break;
    default:
      phaseInstructions = `【一般議論】\nトピックについて、あなたの${mbtiType}としての特性を活かした発言をしてください。`;
  }

  // MBTIタイプ別ガイダンス
  if (mbtiType.includes('E')) {
    mbtiSpecificGuidance += '外向的な特性を活かし、積極的に意見を述べ、他者との相互作用を促進してください。';
  } else {
    mbtiSpecificGuidance += '内向的な特性を活かし、深く考察した洞察に富んだ発言をしてください。';
  }

  if (mbtiType.includes('N')) {
    mbtiSpecificGuidance += '直感的な視点から、可能性や将来的な展望について言及してください。';
  } else {
    mbtiSpecificGuidance += '具体的な事実や実践的な観点から、現実的な提案を行ってください。';
  }

  if (mbtiType.includes('T')) {
    mbtiSpecificGuidance += '論理的分析と客観的評価を重視した発言を心がけてください。';
  } else {
    mbtiSpecificGuidance += '人間的価値観や感情的側面を考慮した発言を心がけてください。';
  }

  if (mbtiType.includes('J')) {
    mbtiSpecificGuidance += '構造化された意見と明確な結論を提示してください。';
  } else {
    mbtiSpecificGuidance += '柔軟性と適応性を示し、複数の選択肢を提示してください。';
  }

  // 特別なコンテキストの処理
  let specialInstructions = '';
  if (specialContext) {
    if (specialContext.qualityThreshold && specialContext.qualityThreshold > 0.8) {
      specialInstructions += '\n\n【高品質要求】今回は特に高い品質の発言が求められています。根拠を明確にし、論理的に構成された発言をお願いします。';
    }
    if (specialContext.timeConstraint && specialContext.timeConstraint < 300) {
      specialInstructions += '\n\n【時間制約】限られた時間内での発言のため、要点を簡潔にまとめてください。';
    }
    if (specialContext.focusArea) {
      specialInstructions += `\n\n【焦点領域】特に「${specialContext.focusArea}」の観点を重視して発言してください。`;
    }
  }

  return `議論トピック: ${topic}${context}\n\n${phaseInstructions}\n\n【${mbtiType}としての発言ガイダンス】\n${mbtiSpecificGuidance}${specialInstructions}\n\n200-300文字で、あなたの特性を活かした質の高い発言をお願いします。`;
}

/**
 * 緊急時・品質改善プロンプト生成
 * 品質スコアが低い場合の改善指示プロンプト
 */
export function createImprovementPrompt(
  topic: string,
  mbtiType: MBTIType,
  recentStatements: DiscussionStatement[],
  qualityIssues: string[]
): string {
  const context = recentStatements.length > 0 ?
    `\n\n現在の議論状況:\n${recentStatements.slice(-2).map(s => `${s.mbtiType}: ${s.content.substring(0, 100)}...`).join('\n\n')}` : '';

  const improvementFocus = qualityIssues.length > 0 ?
    `\n\n【改善が必要な点】\n${qualityIssues.map(issue => `• ${issue}`).join('\n')}` : '';

  return `議論トピック: ${topic}${context}${improvementFocus}\n\n` +
    `【品質向上のための特別指示】\n` +
    `${mbtiType}として、以下の点を特に意識して発言してください：\n` +
    `• 具体的な根拠や例を含める\n` +
    `• 議論の流れに沿った建設的な内容\n` +
    `• あなたの専門性や特性を活かした独自の視点\n` +
    `• 他の参加者の意見を踏まえた発展的な議論\n\n` +
    `250-350文字で、質の高い発言をお願いします。`;
}

// 🆕 発言単位のフィードバック履歴を活用したプロンプト生成
export function createStatementLevelAdaptivePrompt(
  phase: 'initial' | 'interaction' | 'synthesis' | 'consensus',
  topic: string,
  mbtiType: MBTIType,
  recentStatements: DiscussionStatement[],
  detailedFeedback: PerformanceFeedback | undefined,
  currentWeight: number,
  discussionContext: {
    turnNumber: number;
    totalParticipants: number;
    previousStatements: string[];
    recentMBTITypes: string[];
  }
): string {
  let prompt = `あなたは${mbtiType}タイプの議論参加者です。「${topic}」について議論しています。\n\n`;

  // 🎯 現在のフェーズ特有の指示
  const phaseInstructions = {
    'initial': `【初期段階】あなたの個人的な見解を述べてください。${mbtiType}の特徴である直感的な洞察を活かして、独自の視点を提供してください。`,
    'interaction': `【対話段階】他の参加者の意見を参考にしながら、議論を深めてください。異なる視点との対話を通じて、新たな洞察を見つけてください。`,
    'synthesis': `【統合段階】これまでの議論を踏まえて、アイデアを統合し、より良い解決策を見つけてください。`,
    'consensus': `【合意段階】議論の結論に向けて、建設的な意見を述べてください。合意形成に貢献してください。`
  };

  prompt += phaseInstructions[phase] + '\n\n';

  // 🔍 詳細フィードバックに基づく具体的な改善指示
  if (detailedFeedback) {
    prompt += `【前回の発言フィードバック】\n`;

    // 進捗状況
    const { progressTracking } = detailedFeedback;
    if (progressTracking.improvementTrend === 'improving') {
      prompt += `✅ 前回から改善が見られます。この調子を維持してください。\n`;
    } else if (progressTracking.improvementTrend === 'declining') {
      prompt += `⚠️ 発言品質の低下が見られます。今回は特に注意深く発言してください。\n`;
    }

    // 具体的な強みと弱点
    const { detailedAnalysis } = detailedFeedback;
    if (detailedAnalysis.strengths.length > 0) {
      prompt += `💪 前回の強み: ${detailedAnalysis.strengths.join('、')}\n`;
    }
    if (detailedAnalysis.weaknesses.length > 0) {
      prompt += `🎯 改善が必要な点: ${detailedAnalysis.weaknesses.join('、')}\n`;
    }

    // 次回発言への具体的ガイダンス
    if (detailedAnalysis.nextSpeechGuidance) {
      prompt += `🚀 次回発言への具体的な指示: ${detailedAnalysis.nextSpeechGuidance}\n`;
    }

    // MBTI特性との整合性
    const { mbtiAlignment } = detailedFeedback;
    if (mbtiAlignment.alignmentScore < 0.7) {
      prompt += `🎭 MBTI特性の強化が必要: ${mbtiAlignment.alignmentGap.slice(0, 2).join('、')}の特性をより明確に表現してください。\n`;
    }

    // 推奨フォーカス
    if (progressTracking.recommendedFocus.length > 0) {
      prompt += `🎯 今回特に注意する点: ${progressTracking.recommendedFocus.slice(0, 2).join('、')}\n`;
    }

    prompt += '\n';
  }

  // 🤝 他の参加者の発言を踏まえた指示
  if (recentStatements.length > 0) {
    prompt += `【最近の議論の流れ】\n`;
    recentStatements.slice(-2).forEach((stmt, index) => {
      prompt += `${stmt.mbtiType}: ${stmt.content.substring(0, 80)}...\n`;
    });
    prompt += `\n上記の発言を踏まえて、議論を発展させてください。特に他の参加者の視点を参考にしながら、建設的な議論を心がけてください。\n\n`;
  }

  // 🎯 MBTI特性に基づく具体的なアドバイス
  const mbtiSpecificGuidance = getMBTISpecificGuidance(mbtiType, phase, discussionContext);
  prompt += `【${mbtiType}としての発言ガイド】\n${mbtiSpecificGuidance}\n\n`;

  // 📊 発言品質の要件
  prompt += `【発言品質の要件】\n`;
  prompt += `- 発言長: 20-100語程度で簡潔にまとめてください\n`;
  prompt += `- 具体性: 可能な限り具体的な例や数値を含めてください\n`;
  prompt += `- 建設性: 他の参加者の発言を踏まえて議論を発展させてください\n`;
  prompt += `- 一貫性: あなたの${mbtiType}特性を明確に表現してください\n`;

  // 🎯 現在の重みと参加状況を反映
  if (currentWeight > 1.2) {
    prompt += `\n💪 あなたの発言は高く評価されています（重み: ${currentWeight.toFixed(2)}）。この品質を維持してください。`;
  } else if (currentWeight < 0.8) {
    prompt += `\n⚠️ 発言の品質向上が必要です（重み: ${currentWeight.toFixed(2)}）。より質の高い発言を心がけてください。`;
  }

  return prompt;
}

// 🎭 MBTI特性に基づく発言ガイダンス（拡張版）
function getMBTISpecificGuidance(
  mbtiType: MBTIType,
  phase: string,
  context: { turnNumber: number; totalParticipants: number; recentMBTITypes: string[] }
): string {
  const guidance = {
    'INTJ': {
      general: '戦略的で長期的な視点を持ち、体系的な分析を行ってください。',
      initial: '問題の本質を見抜く洞察力を発揮し、独創的なアプローチを提案してください。',
      interaction: '他者の意見を論理的に分析し、より効率的な解決策を提示してください。',
      synthesis: '複雑な情報を整理し、一貫性のある統合案を作成してください。',
      consensus: '長期的な影響を考慮した実用的な結論を導いてください。'
    },
    'INFJ': {
      general: '人間の動機と感情を理解し、理想的なビジョンを描いてください。',
      initial: '直感的洞察を活かして、問題の深層にある意味を探ってください。',
      interaction: '他者の感情や価値観に共感し、調和的な議論を促進してください。',
      synthesis: '理想と現実のバランスを取りながら、価値観に基づく統合を図ってください。',
      consensus: '全員が納得できる価値観に基づいた合意を形成してください。'
    },
    // 他のMBTIタイプも同様に定義...
    'ENTP': {
      general: '革新的なアイデアと可能性を探求し、議論を活性化してください。',
      initial: '既存の枠組みを疑問視し、新しい視点を提示してください。',
      interaction: '他者のアイデアを発展させ、創造的な議論を展開してください。',
      synthesis: '異なる視点を組み合わせて、革新的な解決策を提案してください。',
      consensus: '柔軟性を保ちながら、実現可能性の高い合意を形成してください。'
    },
    'ISFJ': {
      general: '他者への配慮を示し、実用的で安定した解決策を提案してください。',
      initial: '過去の経験に基づいて、確実で実用的な意見を述べてください。',
      interaction: '他者の意見を尊重し、調和を保ちながら支援的な発言をしてください。',
      synthesis: '全員の意見を配慮して、バランスの取れた統合案を作成してください。',
      consensus: '安定性と実用性を重視した合意形成に貢献してください。'
    }
  };

  const typeGuidance = guidance[mbtiType as keyof typeof guidance];
  if (!typeGuidance) {
    return '自分の特性を活かして、建設的な議論に参加してください。';
  }

  let specificGuidance = typeGuidance.general;

  // フェーズ特有の指示を追加
  const phaseSpecific = typeGuidance[phase as keyof typeof typeGuidance];
  if (phaseSpecific && typeof phaseSpecific === 'string') {
    specificGuidance += ` ${phaseSpecific}`;
  }

  // 議論の文脈に基づく追加指示
  if (context.turnNumber <= 2) {
    specificGuidance += ' 議論の方向性を決める重要な段階です。';
  } else if (context.turnNumber > context.totalParticipants * 2) {
    specificGuidance += ' 議論が深まってきています。これまでの流れを活かしてください。';
  }

  return specificGuidance;
}
