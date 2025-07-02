import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

/**
 * 利用可能なBedrock LLMモデル一覧
 */
export const BEDROCK_MODELS = {
  // Claude 3.7 Sonnet V1 v2 (推奨モデル)
  CLAUDE_3_7_SONNET: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
  
  // Claude 3.5 Sonnet V2
  CLAUDE_3_5_SONNET_V2: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
  
  // Claude 3.5 Sonnet V1
  CLAUDE_3_5_SONNET_V1: 'us.anthropic.claude-3-5-sonnet-20240620-v1:0',
  
  // Claude 3 Haiku (軽量・高速)
  CLAUDE_3_HAIKU: 'us.anthropic.claude-3-haiku-20240307-v1:0',
  
  // Claude 3 Opus (高性能・低速)
  CLAUDE_3_OPUS: 'us.anthropic.claude-3-opus-20240229-v1:0',
} as const;

export type BedrockModelType = typeof BEDROCK_MODELS[keyof typeof BEDROCK_MODELS];

/**
 * Bedrock設定オプション
 */
export interface BedrockConfig {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

/**
 * 共通Bedrockクライアントのシングルトンインスタンス
 */
let bedrockClient: ReturnType<typeof createAmazonBedrock> | null = null;

/**
 * BedrockクライアントのFactory関数
 * @param config - AWS設定（省略時はデフォルト設定を使用）
 * @returns Bedrockクライアント
 */
export function createBedrockClient(config?: BedrockConfig): ReturnType<typeof createAmazonBedrock> {
  if (!bedrockClient) {
    bedrockClient = createAmazonBedrock({
      region: config?.region || 'us-east-1',
      credentialProvider: fromNodeProviderChain(),
      // プロファイル認証を優先するため、明示的にundefinedに設定
      accessKeyId: config?.accessKeyId || undefined,
      secretAccessKey: config?.secretAccessKey || undefined,
      sessionToken: config?.sessionToken || undefined,
    });
  }
  return bedrockClient;
}

/**
 * 指定されたモデルでBedrockクライアントを作成
 * @param modelType - 使用するモデルタイプ
 * @param config - AWS設定（省略時はデフォルト設定を使用）
 * @returns 設定済みモデルインスタンス
 */
export function createBedrockModel(
  modelType: BedrockModelType = BEDROCK_MODELS.CLAUDE_3_7_SONNET,
  config?: BedrockConfig
) {
  const client = createBedrockClient(config);
  return client(modelType);
}

/**
 * MBTIエージェント専用のモデル設定
 * 各MBTIタイプに最適化されたモデル選択を行う
 */
export const MBTI_MODEL_PREFERENCES = {
  // 直感型（N）- より創造的で抽象的思考が得意なモデル
  INTUITIVE_TYPES: BEDROCK_MODELS.CLAUDE_3_7_SONNET,
  
  // 感覚型（S）- より具体的で実践的思考が得意なモデル  
  SENSING_TYPES: BEDROCK_MODELS.CLAUDE_3_7_SONNET,
  
  // 思考型（T）- より論理的で分析的思考が得意なモデル
  THINKING_TYPES: BEDROCK_MODELS.CLAUDE_3_7_SONNET,
  
  // 感情型（F）- より人間的で価値観重視思考が得意なモデル
  FEELING_TYPES: BEDROCK_MODELS.CLAUDE_3_7_SONNET,
  
  // オーケストレータ - 高性能モデル
  ORCHESTRATOR: BEDROCK_MODELS.CLAUDE_3_7_SONNET,
} as const;

/**
 * MBTIタイプに基づいて最適なモデルを選択
 * @param mbtiType - MBTIタイプ（例: 'INFJ', 'INTJ'）
 * @param config - AWS設定（省略時はデフォルト設定を使用）
 * @returns MBTIタイプに最適化されたモデルインスタンス
 */
export function createMBTIOptimizedModel(
  mbtiType: string,
  config?: BedrockConfig
): ReturnType<ReturnType<typeof createAmazonBedrock>> {
  let selectedModel: BedrockModelType;
  
  // MBTIタイプに基づくモデル選択ロジック（優先順位を改善）
  // 第2文字目（情報収集機能）で一次分類
  if (mbtiType.charAt(1) === 'N') {
    // 直感型：ENFJ, ENFP, ENTJ, ENTP, INFJ, INFP, INTJ, INTP
    selectedModel = MBTI_MODEL_PREFERENCES.INTUITIVE_TYPES;
  } else if (mbtiType.charAt(1) === 'S') {
    // 感覚型：ESFJ, ESFP, ESTJ, ESTP, ISFJ, ISFP, ISTJ, ISTP
    selectedModel = MBTI_MODEL_PREFERENCES.SENSING_TYPES;
  } else {
    // 第3文字目（判断機能）で二次分類
    if (mbtiType.charAt(2) === 'T') {
      // 思考型重視
      selectedModel = MBTI_MODEL_PREFERENCES.THINKING_TYPES;
    } else if (mbtiType.charAt(2) === 'F') {
      // 感情型重視
      selectedModel = MBTI_MODEL_PREFERENCES.FEELING_TYPES;
    } else {
      // デフォルト
      selectedModel = BEDROCK_MODELS.CLAUDE_3_7_SONNET;
    }
  }
  
  return createBedrockModel(selectedModel, config);
}

/**
 * BedrockクライアントのリセットUtility（テスト用）
 */
export function resetBedrockClient(): void {
  bedrockClient = null;
} 