# MBTI Multi-Agent Discussion System (M-ADS)

Phase 1 Core MVP開発 - MBTIの4つのグループ代表エージェントによるマルチエージェント議論システム

## 概要

M-ADSは、MBTI理論に基づく4つの性格グループ（NT, NF, SJ, SP）を代表する エージェントが協調し、多角的な視点から議論を行うシステムです。

### システム特徴

- **4つのMBTIグループ代表エージェント**
  - INTJ (Architect) - NT戦略家グループ代表
  - INFJ (Advocate) - NF外交官グループ代表  
  - ISTJ (Inspector) - SJ番人グループ代表
  - ISTP (Virtuoso) - SP探検家グループ代表

- **動的グラフトポロジー最適化**
  - エージェント間の相性に基づく接続重み調整
  - 議論フェーズに応じた動的なトポロジー変更

- **リアルタイム品質評価**
  - 多様性、一貫性、収束効率の7次元評価
  - MBTI特性一貫性の監視

## 技術スタック

- **Framework**: Mastra
- **LLM Provider**: AWS Bedrock (Claude 3.7 Sonnet V1)
- **Runtime**: Node.js 18+ / TypeScript 5.0+
- **Graph Library**: Graphology
- **Dependencies**:
  - @mastra/core
  - @ai-sdk/amazon-bedrock
  - @aws-sdk/credential-providers
  - graphology, uuid, graphology-shortest-path

## AWS設定

### 前提条件
- AWS CLIがインストール済み
- AWSプロファイルが設定済み（ここでは`isengard`プロファイルを使用）
- Amazon Bedrockでのモデルアクセス許可

### 1. AWS CLIプロファイル設定

```bash
# AWSプロファイルを設定（まだの場合）
aws configure --profile isengard

# またはSSO設定の場合
aws configure sso --profile isengard
```

### 2. Bedrockモデルアクセス許可

AWS Managementコンソールから：
1. Amazon Bedrockサービスに移動
2. Model accessセクションでClaude 3.7 Sonnet V1の利用申請
3. アクセス許可を取得

### 3. プロファイル認証の確認

```bash
# プロファイルでの認証が正常に動作することを確認
AWS_PROFILE=isengard aws sts get-caller-identity

# SSO認証の場合（必要に応じて）
aws sso login --profile isengard
```

### 4. アプリケーションでの設定

アプリケーションは自動的に `fromNodeProviderChain()` を使用してAWS認証を行います：

1. **環境変数による設定** (推奨)
```bash
export AWS_PROFILE=isengard
export AWS_REGION=us-east-1
```

2. **実行時指定**
```bash
AWS_PROFILE=isengard AWS_REGION=us-east-1 npm run discussion
```

### 注意事項

- 本システムは`createAmazonBedrock`で`credentialProvider: fromNodeProviderChain()`を使用
- `accessKeyId`, `secretAccessKey`, `sessionToken`は明示的に`undefined`に設定
- これにより自動的にAWSプロファイル、環境変数、IAMロールの順で認証を試行

## インストールと実行

### 1. 依存関係のインストール

```bash
npm install
```

### 2. TypeScriptビルド

```bash
npm run build
```

### 3. 議論システムの実行

```bash
# 環境変数を設定して実行
AWS_PROFILE=isengard AWS_REGION=us-east-1 npm run discussion

# または環境変数をあらかじめ設定
export AWS_PROFILE=isengard
export AWS_REGION=us-east-1
npm run discussion
```

## プロジェクト構造

```
src/mastra/
├── agents/                    # MBTIエージェント
│   ├── intj-agent.ts         # INTJ代表エージェント
│   ├── infj-agent.ts         # INFJ代表エージェント
│   ├── istj-agent.ts         # ISTJ代表エージェント
│   ├── istp-agent.ts         # ISTP代表エージェント
│   └── orchestrator-agent.ts # 議論管理エージェント
├── tools/                     # システムツール
│   ├── graph-manager-tool.ts    # グラフ管理
│   ├── weight-adjuster-tool.ts  # 重み調整
│   └── quality-evaluator-tool.ts # 品質評価
├── types/                     # 型定義
│   └── mbti-types.ts
├── utils/                     # ユーティリティ
│   ├── mbti-characteristics.ts # MBTI特性定義
│   └── graph-utils.ts          # グラフユーティリティ
├── workflows/                 # ワークフロー
│   └── mbti-discussion-workflow.ts
├── index.ts                   # Mastraインスタンス
└── run-discussion.ts         # 実行スクリプト
```

## 開発状況

### Phase 1 (現在)
- [x] 4つのMBTIグループ代表エージェント
- [x] 基本的なグラフトポロジー
- [x] 動的重み調整システム
- [x] 品質評価システム
- [x] AWS Bedrock統合

### Phase 2 (予定)
- [ ] 全16のMBTIタイプエージェント
- [ ] 高度なグラフ最適化
- [ ] 7次元品質評価
- [ ] リアルタイム最適化

### Phase 3 (予定)
- [ ] パフォーマンスチューニング
- [ ] 統合監視・ログシステム
- [ ] 分析・可視化ダッシュボード

## トラブルシューティング

### AWS認証エラー

1. **AWS CLIプロファイルの確認**
```bash
aws configure list --profile isengard
```

2. **Bedrockアクセス権限の確認**
```bash
AWS_PROFILE=isengard aws bedrock list-foundation-models --region us-east-1
```

3. **SSOトークンの更新**（SSOを使用している場合）
```bash
aws sso login --profile isengard
```

### Bedrockモデルアクセスエラー

```
Error: You don't have access to the model with the specified model ID
```

**解決方法**:
1. AWS Bedrockコンソールでモデルアクセスを有効化
2. 適切なリージョン（us-east-1）が設定されているか確認

### Inference Profile エラー

```
Error: Invocation of model ID anthropic.claude-3-5-sonnet-20241022-v2:0 with on-demand throughput isn't supported. Retry your request with the ID or ARN of an inference profile that contains this model.
```

**解決方法**:
現在、us-east-1リージョンではinference profileを使用する必要があります
- ✅ **修正済み**: すべてのエージェントで `us.anthropic.claude-3-5-sonnet-20241022-v2:0` を使用

### レート制限エラー

```
Error: Too many requests, please wait before trying again.
```

**解決方法**:
1. 複数エージェントの同時実行でレート制限に達した場合
2. 少し時間を置いてから再実行
3. より控えめなリクエスト間隔での実行を検討

### TypeScriptエラー

```bash
# 型定義の問題がある場合
npm run build --verbose
```

## 実装の状況

### ✅ 成功している項目
- AWSプロファイル認証（`fromNodeProviderChain()`）
- Bedrock inference profile対応（`us.anthropic.claude-3-7-sonnet-20250219-v1:0`）
- 4つのMBTIエージェント（INTJ, INFJ, ISTJ, ISTP）の実装
- グラフ管理、重み調整、品質評価ツールの実装
- Mastraワークフロー統合

### 🔄 調整中の項目
- レート制限対応（現在: "Too many requests" エラー発生）
- 複数エージェントの同時実行最適化

### 📝 @ai-sdk/amazon-bedrock 正しい使用方法

```typescript
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

// AWSプロファイル認証を使用した正しい設定
const bedrock = createAmazonBedrock({
  region: 'us-east-1',
  credentialProvider: fromNodeProviderChain(),
  // 明示的にundefinedに設定してプロファイル認証を優先
  accessKeyId: undefined,
  secretAccessKey: undefined,
  sessionToken: undefined,
});

// Claude 3.7 Sonnet V1 - Inference profile対応モデルIDを使用
const model = bedrock('us.anthropic.claude-3-7-sonnet-20250219-v1:0');
```

### 重要なポイント

1. **認証方法**: `fromNodeProviderChain()` を使用してAWSプロファイル認証
2. **モデルID**: Claude 3.7 Sonnet V1 - inference profile必須（`us.anthropic.claude-3-7-sonnet-20250219-v1:0`）
3. **パッケージ**: `@aws-sdk/credential-providers` が必要
4. **環境変数**: `AWS_PROFILE=isengard AWS_REGION=us-east-1` を設定

## ライセンス

MIT License
