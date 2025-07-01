import type { DiscussionStatement, MBTIType } from '../types/mbti-types';
import {
  analyzeParticipationPattern,
  analyzeConfidenceProgression,
  analyzeInteractionDensity
} from './performance-evaluator';

/**
 * 議論総括の型定義
 */
export interface DiscussionSummary {
  overview: string;
  keyThemes: string[];
  progressAnalysis: string;
  mbtiContributions: Record<string, string>;
  consensus: string;
  insights: string[];
  processCharacteristics: string[];
}

/**
 * 議論総括生成機能（LLMベース要約）
 * オーケストレーターが利用可能な場合はLLMベース、そうでなければフォールバック分析を使用
 */
export async function generateDiscussionSummary(
  statements: DiscussionStatement[],
  topic: string,
  participantTypes: MBTIType[],
  qualityMetrics: any,
  orchestrator: any
): Promise<DiscussionSummary> {
  if (!orchestrator) {
    // フォールバック：アルゴリズム的な分析
    return generateFallbackSummary(statements, topic, participantTypes, qualityMetrics);
  }

  try {
    // 🔍 主要テーマの抽出（LLMベース）
    const keyThemes = await extractKeyThemesWithLLM(statements, topic, orchestrator);

    // 📊 議論進展の分析（LLMベース）
    const progressAnalysis = await analyzeDiscussionProgressWithLLM(statements, orchestrator);

    // 🎭 MBTIタイプ別貢献分析（LLMベース）
    const mbtiContributions = await analyzeMBTIContributionsWithLLM(statements, participantTypes, orchestrator);

    // 🤝 合意形成の分析（LLMベース）
    const consensus = await analyzeConsensusBuildingWithLLM(statements, orchestrator);

    // 💡 洞察の抽出（LLMベース）
    const insights = await extractKeyInsightsWithLLM(statements, topic, qualityMetrics, orchestrator);

    // 🔄 プロセス特徴の分析（LLMベース）
    const processCharacteristics = await analyzeProcessCharacteristicsWithLLM(statements, participantTypes, orchestrator);

    // 📝 総合概要の生成（LLMベース）
    const overview = await generateOverviewWithLLM(
      topic,
      statements,
      participantTypes,
      qualityMetrics,
      keyThemes,
      orchestrator
    );

    return {
      overview,
      keyThemes,
      progressAnalysis,
      mbtiContributions,
      consensus,
      insights,
      processCharacteristics
    };
  } catch (error) {
    console.warn(`⚠️ LLMベース要約でエラーが発生、フォールバックを使用: ${error}`);
    return generateFallbackSummary(statements, topic, participantTypes, qualityMetrics);
  }
}

// ========== LLMベース分析関数群 ==========

/**
 * LLMベース総合概要生成
 */
async function generateOverviewWithLLM(
  topic: string,
  statements: DiscussionStatement[],
  participantTypes: MBTIType[],
  qualityMetrics: any,
  keyThemes: string[],
  orchestrator: any
): Promise<string> {
  const conversationSample = statements.slice(0, 6).map((s, i) =>
    `${i + 1}. ${s.mbtiType}: ${s.content.substring(0, 150)}...`
  ).join('\n');

  const prompt = `
以下のMBTI議論の総合概要を自然な日本語で200-250文字で要約してください。

**議論トピック**: ${topic}
**参加者**: ${participantTypes.join(', ')} (計${participantTypes.length}名)
**総発言数**: ${statements.length}回
**主要テーマ**: ${keyThemes.join('、')}
**品質スコア**: ${(qualityMetrics.diversityScore * 100).toFixed(0)}%（多様性）、${(qualityMetrics.consistencyScore * 100).toFixed(0)}%（一貫性）

**議論サンプル**:
${conversationSample}

以下の観点を含めて要約してください：
- 誰の発言が特徴的だったか
- どのような主張や論点が展開されたか
- 議論の流れや特徴
- 到達した結論や合意内容

**回答は200-250文字の自然な日本語でお願いします。**
`;

  const response = await orchestrator.generate([
    {
      role: 'system',
      content: 'あなたは議論の要約を専門とするアナリストです。簡潔で洞察に富んだ要約を提供してください。'
    },
    {
      role: 'user',
      content: prompt
    }
  ]);

  return response.text.trim();
}

/**
 * LLMベース主要テーマ抽出
 */
async function extractKeyThemesWithLLM(
  statements: DiscussionStatement[],
  topic: string,
  orchestrator: any
): Promise<string[]> {
  const allContent = statements.map(s => s.content).join(' ');

  const prompt = `
以下の議論内容から主要なテーマを3-5個抽出してください。

**トピック**: ${topic}

**議論内容**: ${allContent.substring(0, 2000)}...

各テーマは1-2単語で簡潔に表現し、カンマ区切りで回答してください。
例：効率性, 創造性, 協調性, 技術革新, 人間性
`;

  const response = await orchestrator.generate([
    {
      role: 'system',
      content: 'あなたは議論分析の専門家です。議論から重要なテーマを的確に抽出してください。'
    },
    {
      role: 'user',
      content: prompt
    }
  ]);

  return response.text.split(',').map((theme: string) => theme.trim()).filter((theme: string) => theme.length > 0).slice(0, 5);
}

/**
 * LLMベース議論進展分析
 */
async function analyzeDiscussionProgressWithLLM(
  statements: DiscussionStatement[],
  orchestrator: any
): Promise<string> {
  const early = statements.slice(0, Math.floor(statements.length / 3));
  const middle = statements.slice(Math.floor(statements.length / 3), Math.floor(statements.length * 2 / 3));
  const late = statements.slice(Math.floor(statements.length * 2 / 3));

  const prompt = `
以下の議論の進展パターンを分析し、100-150文字で要約してください。

**序盤の議論**: ${early.map(s => `${s.mbtiType}: ${s.content.substring(0, 80)}`).join('｜')}

**中盤の議論**: ${middle.map(s => `${s.mbtiType}: ${s.content.substring(0, 80)}`).join('｜')}

**終盤の議論**: ${late.map(s => `${s.mbtiType}: ${s.content.substring(0, 80)}`).join('｜')}

議論がどのように発展・深化したかを分析してください。
`;

  const response = await orchestrator.generate([
    {
      role: 'system',
      content: 'あなたは議論の流れを分析する専門家です。議論の進展パターンを的確に分析してください。'
    },
    {
      role: 'user',
      content: prompt
    }
  ]);

  return response.text.trim();
}

/**
 * LLMベースMBTIタイプ別貢献分析
 */
async function analyzeMBTIContributionsWithLLM(
  statements: DiscussionStatement[],
  participantTypes: MBTIType[],
  orchestrator: any
): Promise<Record<string, string>> {
  const contributions: Record<string, string> = {};

  for (const type of participantTypes) {
    const typeStatements = statements.filter(s => s.mbtiType === type);
    if (typeStatements.length === 0) continue;

    const sampleStatements = typeStatements.slice(0, 3).map(s => s.content.substring(0, 100)).join('｜');

    const prompt = `
${type}タイプの議論での貢献内容を50-80文字で要約してください。

**${type}の発言例**: ${sampleStatements}
**発言回数**: ${typeStatements.length}回

このMBTIタイプがどのような視点・価値・スタイルで議論に貢献したかを簡潔に表現してください。
`;

    const response = await orchestrator.generate([
      {
        role: 'system',
        content: 'あなたはMBTI分析の専門家です。各タイプの特徴的な貢献を的確に分析してください。'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    contributions[type] = response.text.trim();
  }

  return contributions;
}

/**
 * LLMベース合意形成分析
 */
async function analyzeConsensusBuildingWithLLM(
  statements: DiscussionStatement[],
  orchestrator: any
): Promise<string> {
  const laterStatements = statements.slice(-Math.floor(statements.length / 2));
  const sampleContent = laterStatements.map(s => `${s.mbtiType}: ${s.content.substring(0, 120)}`).join('\n');

  const prompt = `
以下の議論終盤での合意形成プロセスを分析し、80-120文字で要約してください。

**終盤の議論**:
${sampleContent}

参加者がどのように合意に向かった（または多様性を維持した）かを分析してください。
`;

  const response = await orchestrator.generate([
    {
      role: 'system',
      content: 'あなたは合意形成プロセスの分析専門家です。議論の収束パターンを的確に分析してください。'
    },
    {
      role: 'user',
      content: prompt
    }
  ]);

  return response.text.trim();
}

/**
 * LLMベース洞察抽出
 */
async function extractKeyInsightsWithLLM(
  statements: DiscussionStatement[],
  topic: string,
  qualityMetrics: any,
  orchestrator: any
): Promise<string[]> {
  const highlightStatements = statements
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map(s => `${s.mbtiType}: ${s.content}`)
    .join('\n\n');

  const prompt = `
以下の高品質な議論から重要な洞察を2-3個抽出してください。

**トピック**: ${topic}
**品質スコア**: 多様性${(qualityMetrics.diversityScore * 100).toFixed(0)}%、一貫性${(qualityMetrics.consistencyScore * 100).toFixed(0)}%

**注目すべき発言**:
${highlightStatements}

各洞察は30-50文字で表現し、リスト形式で回答してください。
`;

  const response = await orchestrator.generate([
    {
      role: 'system',
      content: 'あなたは議論から価値ある洞察を抽出する専門家です。重要なポイントを的確に特定してください。'
    },
    {
      role: 'user',
      content: prompt
    }
  ]);

  return response.text
    .split('\n')
    .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
    .filter((insight: string) => insight.length > 10)
    .slice(0, 3);
}

/**
 * LLMベースプロセス特徴分析
 */
async function analyzeProcessCharacteristicsWithLLM(
  statements: DiscussionStatement[],
  participantTypes: MBTIType[],
  orchestrator: any
): Promise<string[]> {
  const prompt = `
以下の議論プロセスの特徴的なパターンを2-3個特定してください。

**参加者**: ${participantTypes.join(', ')}
**議論スタイル**: ${statements.length}回の発言による多角的議論
**品質傾向**: 平均確信度${(statements.reduce((sum, s) => sum + s.confidence, 0) / statements.length * 100).toFixed(0)}%

議論の進行方式、参加パターン、意見交換の特徴を30-40文字で表現し、リスト形式で回答してください。
`;

  const response = await orchestrator.generate([
    {
      role: 'system',
      content: 'あなたは議論プロセス分析の専門家です。議論の構造的特徴を的確に特定してください。'
    },
    {
      role: 'user',
      content: prompt
    }
  ]);

  return response.text
    .split('\n')
    .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
    .filter((characteristic: string) => characteristic.length > 10)
    .slice(0, 3);
}

// ========== フォールバック：アルゴリズム的な分析（元の実装） ==========

/**
 * フォールバック：アルゴリズム的な分析（元の実装）
 */
function generateFallbackSummary(
  statements: DiscussionStatement[],
  topic: string,
  participantTypes: MBTIType[],
  qualityMetrics: any
): DiscussionSummary {
  // 🔍 主要テーマの抽出
  const keyThemes = extractKeyThemes(statements, topic);

  // 📊 議論進展の分析
  const progressAnalysis = analyzeDiscussionProgress(statements);

  // 🎭 MBTIタイプ別貢献分析
  const mbtiContributions = analyzeMBTIContributions(statements, participantTypes);

  // 🤝 合意形成の分析
  const consensus = analyzeConsensusBuilding(statements);

  // 💡 洞察の抽出
  const insights = extractKeyInsights(statements, qualityMetrics);

  // 🔄 プロセス特徴の分析
  const processCharacteristics = analyzeProcessCharacteristics(statements, participantTypes);

  // 📝 総合概要の生成
  const overview = generateOverview(
    topic,
    participantTypes,
    statements.length,
    qualityMetrics,
    keyThemes
  );

  return {
    overview,
    keyThemes,
    progressAnalysis,
    mbtiContributions,
    consensus,
    insights,
    processCharacteristics
  };
}

/**
 * 主要テーマ抽出（アルゴリズム的）
 */
function extractKeyThemes(statements: DiscussionStatement[], topic: string): string[] {
  const themes = new Set<string>();
  const commonKeywords = ['効率', '革新', '協力', '分析', '価値', '実現', '解決', '戦略', '感情', '論理'];

  statements.forEach(statement => {
    const content = statement.content.toLowerCase();
    commonKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        themes.add(keyword);
      }
    });

    // 追加的なテーマ検出ロジック
    if (content.includes('技術') || content.includes('システム')) themes.add('技術的観点');
    if (content.includes('人間') || content.includes('社会')) themes.add('人間・社会的観点');
    if (content.includes('将来') || content.includes('未来')) themes.add('将来展望');
    if (content.includes('課題') || content.includes('問題')) themes.add('課題解決');
  });

  return Array.from(themes).slice(0, 5); // 上位5テーマ
}

/**
 * 議論進展分析（アルゴリズム的）
 */
function analyzeDiscussionProgress(statements: DiscussionStatement[]): string {
  const phases = Math.ceil(statements.length / 4);
  const progressPatterns = [];

  for (let i = 0; i < phases; i++) {
    const phaseStatements = statements.slice(i * 4, (i + 1) * 4);
    const avgConfidence = phaseStatements.reduce((sum, s) => sum + s.confidence, 0) / phaseStatements.length;
    const avgRelevance = phaseStatements.reduce((sum, s) => sum + s.relevance, 0) / phaseStatements.length;

    if (avgConfidence > 0.8 && avgRelevance > 0.8) {
      progressPatterns.push(`フェーズ${i + 1}：高品質な議論`);
    } else if (avgConfidence > 0.7) {
      progressPatterns.push(`フェーズ${i + 1}：安定した議論`);
    } else {
      progressPatterns.push(`フェーズ${i + 1}：探索的議論`);
    }
  }

  return `議論は${phases}つのフェーズに分かれて進行。${progressPatterns.join('、')}。全体として${statements.length > 12 ? '充実した' : '効率的な'}議論プロセスを実現。`;
}

/**
 * MBTIタイプ別貢献分析（アルゴリズム的）
 */
function analyzeMBTIContributions(statements: DiscussionStatement[], participantTypes: MBTIType[]): Record<string, string> {
  const contributions: Record<string, string> = {};

  participantTypes.forEach(type => {
    const typeStatements = statements.filter(s => s.mbtiType === type);
    if (typeStatements.length === 0) return;

    const avgConfidence = typeStatements.reduce((sum, s) => sum + s.confidence, 0) / typeStatements.length;
    const contributionLevel = typeStatements.length;

    // MBTIタイプの特性に基づく貢献分析
    let contributionDescription = '';

    if (type.includes('NT')) {
      contributionDescription = `戦略的・分析的視点から${contributionLevel}回の発言。論理的構造化に貢献（品質: ${(avgConfidence * 100).toFixed(0)}%）`;
    } else if (type.includes('NF')) {
      contributionDescription = `価値観・人間的視点から${contributionLevel}回の発言。議論の意味付けに貢献（品質: ${(avgConfidence * 100).toFixed(0)}%）`;
    } else if (type.includes('SJ')) {
      contributionDescription = `実践的・組織的視点から${contributionLevel}回の発言。具体化・体系化に貢献（品質: ${(avgConfidence * 100).toFixed(0)}%）`;
    } else if (type.includes('SP')) {
      contributionDescription = `柔軟・適応的視点から${contributionLevel}回の発言。現実的解決策に貢献（品質: ${(avgConfidence * 100).toFixed(0)}%）`;
    }

    contributions[type] = contributionDescription;
  });

  return contributions;
}

/**
 * 合意形成分析（アルゴリズム的）
 */
function analyzeConsensusBuilding(statements: DiscussionStatement[]): string {
  const laterStatements = statements.slice(-Math.floor(statements.length / 3));
  const consensusKeywords = ['同意', '合意', '賛成', '理解', '納得', '結論', 'まとめ'];

  let consensusCount = 0;
  laterStatements.forEach(statement => {
    const content = statement.content.toLowerCase();
    consensusKeywords.forEach(keyword => {
      if (content.includes(keyword)) consensusCount++;
    });
  });

  const consensusRate = consensusCount / laterStatements.length;

  if (consensusRate > 0.3) {
    return `終盤で活発な合意形成が見られ、参加者間の理解が深化。建設的な収束プロセスを実現。`;
  } else if (consensusRate > 0.1) {
    return `段階的な合意形成が進行し、一定の共通理解が形成された。`;
  } else {
    return `多様な視点が維持されつつ、各論点での理解が深化。継続議論の基盤が構築された。`;
  }
}

/**
 * 洞察抽出（アルゴリズム的）
 */
function extractKeyInsights(statements: DiscussionStatement[], qualityMetrics: any): string[] {
  const insights = [];

  // 品質メトリクスに基づく洞察
  if (qualityMetrics.diversityScore >= 0.85) {
    insights.push('MBTIタイプの多様性が議論の豊かさを大幅に向上させた');
  }

  if (qualityMetrics.consistencyScore >= 0.85) {
    insights.push('論理的一貫性を保ちながら創造的議論が実現された');
  }

  if (qualityMetrics.socialDecisionScore >= 0.8) {
    insights.push('協調的意思決定プロセスが効果的に機能した');
  }

  // 議論パターンに基づく洞察
  const participationPattern = analyzeParticipationPattern(statements);
  if (participationPattern.balanced) {
    insights.push('バランスの取れた参加により包括的な議論が実現');
  }

  if (participationPattern.qualityProgression) {
    insights.push('議論の進行とともに発言品質が向上するパターンを確認');
  }

  return insights.slice(0, 4); // 上位4つの洞察
}

/**
 * プロセス特徴分析（アルゴリズム的）
 */
function analyzeProcessCharacteristics(statements: DiscussionStatement[], participantTypes: MBTIType[]): string[] {
  const characteristics = [];

  // 参加パターン分析
  const groupParticipation = {
    NT: participantTypes.filter(t => t.includes('NT')).length,
    NF: participantTypes.filter(t => t.includes('NF')).length,
    SJ: participantTypes.filter(t => t.includes('SJ')).length,
    SP: participantTypes.filter(t => t.includes('SP')).length
  };

  const dominantGroups = Object.entries(groupParticipation)
    .filter(([_, count]) => count >= 2)
    .map(([group, _]) => group);

  if (dominantGroups.length >= 3) {
    characteristics.push('4つの認知スタイル群がバランス良く参加');
  }

  // 議論の動的特性
  const avgConfidenceProgression = analyzeConfidenceProgression(statements);
  if (avgConfidenceProgression > 0.05) {
    characteristics.push('議論の進行とともに参加者の確信度が向上');
  }

  // 相互作用パターン
  const interactionDensity = analyzeInteractionDensity(statements);
  if (interactionDensity > 0.7) {
    characteristics.push('高い相互作用密度による活発な議論');
  } else {
    characteristics.push('構造化された順序立った議論進行');
  }

  return characteristics;
}

/**
 * 総合概要生成（アルゴリズム的）
 */
function generateOverview(
  topic: string,
  participantTypes: MBTIType[],
  statementCount: number,
  qualityMetrics: any,
  keyThemes: string[]
): string {
  const typeGroups = {
    NT: participantTypes.filter(t => t.includes('NT')).length,
    NF: participantTypes.filter(t => t.includes('NF')).length,
    SJ: participantTypes.filter(t => t.includes('SJ')).length,
    SP: participantTypes.filter(t => t.includes('SP')).length
  };

  const dominantGroups = Object.entries(typeGroups)
    .filter(([_, count]) => count > 0)
    .map(([group, count]) => `${group}(${count})`)
    .join('、');

  const qualityLevel = qualityMetrics.diversityScore >= 0.85 ? '非常に高品質' :
    qualityMetrics.diversityScore >= 0.75 ? '高品質' : '標準的';

  return `「${topic}」について、${participantTypes.length}のMBTIタイプ（${dominantGroups}）が${statementCount}回の発言を通じて${qualityLevel}な議論を展開。主要テーマは${keyThemes.slice(0, 3).join('、')}など。総合品質スコア${(qualityMetrics.diversityScore * 100).toFixed(0)}%を達成し、多角的視点による包括的な議論が実現された。`;
}
