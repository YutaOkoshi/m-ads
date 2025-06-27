# MBTI Multi-Agent Discussion System (M-ADS)

**Phase 2 Complete** - 全16タイプMBTIエージェントによる高度なマルチエージェント議論システム

## 概要

M-ADSは、MBTI理論に基づく全16タイプの性格エージェントが協調し、多角的な視点から議論を行う次世代マルチエージェントシステムです。

### システム特徴

- **全16タイプMBTIエージェント完全実装**
  - **NT (Rational)**: INTJ, INTP, ENTJ, ENTP - 理論的・戦略的思考
  - **NF (Idealist)**: INFJ, INFP, ENFJ, ENFP - 価値観・人間関係重視
  - **SJ (Guardian)**: ISTJ, ISFJ, ESTJ, ESFJ - 責任・組織・安定重視
  - **SP (Artisan)**: ISTP, ISFP, ESTP, ESFP - 実用性・体験・柔軟性重視

- **動的グラフトポロジー最適化**
  - エージェント間の相性に基づく接続重み調整
  - 議論フェーズに応じた動的なトポロジー変更
  - MBTIタイプ別最適化アルゴリズム

- **統合品質評価システム**
  - 多様性、一貫性、収束効率の7次元評価
  - MBTI特性一貫性の監視
  - リアルタイム品質最適化

- **高度なデータ管理**
  - LibSQL による永続化ストレージ
  - Mastra Memory による文脈保持
  - PinoLogger による包括的ログ管理

## 技術スタック

- **Framework**: Mastra v0.10.8
- **LLM Provider**: AWS Bedrock (Claude 3.7 Sonnet V1 v2)
- **Runtime**: Node.js 20.9.0+ / TypeScript 5.8.3+
- **Database**: LibSQL (SQLite-compatible)
- **Graph Library**: Graphology v0.26.0
- **Dependencies**:
  - @mastra/core, @mastra/libsql, @mastra/memory, @mastra/loggers
  - @ai-sdk/amazon-bedrock, @aws-sdk/credential-providers
  - graphology, graphology-shortest-path, uuid, zod

## AWS設定

### 前提条件
- AWS CLIがインストール済み
- AWSプロファイルが設定済み（ここでは`production-aws`プロファイルを使用）
- Amazon Bedrockでのモデルアクセス許可

### 1. AWS CLIプロファイル設定

```bash
# AWSプロファイルを設定（まだの場合）
aws configure --profile production-aws

# またはSSO設定の場合
aws configure sso --profile production-aws
```

### 2. Bedrockモデルアクセス許可

AWS Managementコンソールから：
1. Amazon Bedrockサービスに移動
2. Model accessセクションでClaude 3.7 Sonnet V1の利用申請
3. アクセス許可を取得

### 3. プロファイル認証の確認

```bash
# プロファイルでの認証が正常に動作することを確認
AWS_PROFILE=production-aws aws sts get-caller-identity

# SSO認証の場合（必要に応じて）
aws sso login --profile production-aws
```

### 4. アプリケーションでの設定

アプリケーションは自動的に `fromNodeProviderChain()` を使用してAWS認証を行います：

1. **環境変数による設定** (推奨)
```bash
export AWS_PROFILE=production-aws
export AWS_REGION=us-east-1
```

2. **実行時指定**
```bash
AWS_PROFILE=production-aws AWS_REGION=us-east-1 npm run discuss
```

### 注意事項

- 本システムは`createAmazonBedrock`で`credentialProvider: fromNodeProviderChain()`を使用
- `accessKeyId`, `secretAccessKey`, `sessionToken`は明示的に`undefined`に設定
- これにより自動的にAWSプロファイル、環境変数、IAMロールの順で認証を試行
- **MBTIタイプ別最適化**: 各エージェントに最適なモデルを自動選択

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
# 環境変数を設定して実行（推奨）
AWS_PROFILE=production-aws AWS_REGION=us-east-1 npm run discuss

# または環境変数をあらかじめ設定
export AWS_PROFILE=production-aws
export AWS_REGION=us-east-1
npm run discuss
```

### 4. 開発・デバッグ実行

```bash
# Mastra開発モード
npm run dev

# TypeScriptの型チェック
npm run type-check

# ESLintによるコード品質チェック
npm run lint
npm run lint:fix
```

## プロジェクト構造

```
src/mastra/
├── agents/                    # 全16のMBTIエージェント
│   ├── intj-agent.ts         # INTJ Architect（戦略家）
│   ├── intp-agent.ts         # INTP Thinker（思想家）
│   ├── entj-agent.ts         # ENTJ Commander（指揮官）
│   ├── entp-agent.ts         # ENTP Debater（討論者）
│   ├── infj-agent.ts         # INFJ Advocate（提唱者）
│   ├── infp-agent.ts         # INFP Mediator（仲介者）
│   ├── enfj-agent.ts         # ENFJ Protagonist（主人公）
│   ├── enfp-agent.ts         # ENFP Campaigner（運動家）
│   ├── istj-agent.ts         # ISTJ Inspector（管理者）
│   ├── isfj-agent.ts         # ISFJ Protector（擁護者）
│   ├── estj-agent.ts         # ESTJ Executive（幹部）
│   ├── esfj-agent.ts         # ESFJ Consul（領事）
│   ├── istp-agent.ts         # ISTP Virtuoso（巨匠）
│   ├── isfp-agent.ts         # ISFP Adventurer（冒険家）
│   ├── estp-agent.ts         # ESTP Entrepreneur（起業家）
│   ├── esfp-agent.ts         # ESFP Entertainer（エンターテイナー）
│   ├── orchestrator-agent.ts # 議論管理エージェント
│   └── index.ts              # エージェント統合管理
├── tools/                     # システムツール
│   ├── graph-manager-tool.ts    # グラフ管理
│   ├── weight-adjuster-tool.ts  # 重み調整
│   └── quality-evaluator-tool.ts # 品質評価
├── types/                     # 型定義
│   └── mbti-types.ts
├── utils/                     # ユーティリティ
│   ├── bedrock-config.ts         # Bedrock設定管理
│   ├── mbti-characteristics.ts  # MBTI特性定義
│   ├── dynamic-weighting-engine.ts # 動的重み調整
│   ├── graph-topology-optimizer.ts # グラフ最適化
│   ├── comprehensive-quality-evaluator.ts # 包括的品質評価
│   ├── conversation-saver.ts    # 会話保存
│   └── graph-utils.ts           # グラフユーティリティ
├── workflows/                 # ワークフロー
│   └── mbti-discussion-workflow.ts
├── index.ts                   # Mastraインスタンス
└── run-discussion.ts         # 実行スクリプト
```

## 実装状況

### ✅ Phase 2 Complete（現在）
- [x] **全16のMBTIタイプエージェント完全実装**
- [x] **高度なグラフトポロジー最適化**
- [x] **動的重み調整システム**
- [x] **統合品質評価システム（7次元評価）**
- [x] **AWS Bedrock統合（Claude 3.7 Sonnet V1 v2）**
- [x] **LibSQL永続化ストレージ**
- [x] **Mastra Memory文脈保持**
- [x] **PinoLogger包括的ログ管理**
- [x] **MBTIタイプ別モデル最適化**

### 🔄 Phase 3 In Progress（進行中）
- [ ] パフォーマンスチューニング
- [ ] 統合監視・アナリティクス
- [ ] 学習・適応機能の高度化
- [ ] 分析・可視化ダッシュボード

### 📋 Future Enhancements（将来予定）
- [ ] マルチリージョン対応
- [ ] リアルタイムWebUI
- [ ] カスタムMBTIプロファイル
- [ ] 業界特化型議論モード

## システム能力

### 技術品質指標
- **API成功率**: ≥99.0%
- **平均応答時間**: ≤8秒
- **同時処理能力**: ≥10セッション
- **多様性スコア**: ≥0.80（16タイプによる視点多様性）
- **一貫性スコア**: ≥0.85（論理・話題・性格の統合一貫性）
- **収束効率**: ≥0.75（合意形成率とバランス）
- **MBTI特性再現率**: ≥0.85（期待特性との一致度）

### 議論能力
- **視点数**: 16タイプ × 4グループによる多角的分析
- **認知機能**: 8つの認知機能（Ni, Ne, Ti, Te, Fi, Fe, Si, Se）の完全カバー
- **議論フェーズ**: ブレインストーミング → 分析 → 統合 → 結論
- **品質保証**: リアルタイム7次元評価

## トラブルシューティング

### AWS認証エラー

1. **AWS CLIプロファイルの確認**
```bash
aws configure list --profile production-aws
```

2. **Bedrockアクセス権限の確認**
```bash
AWS_PROFILE=production-aws aws bedrock list-foundation-models --region us-east-1
```

3. **SSOトークンの更新**（SSOを使用している場合）
```bash
aws sso login --profile production-aws
```

### Bedrockモデルアクセスエラー

```
Error: You don't have access to the model with the specified model ID
```

**解決方法**:
1. AWS Bedrockコンソールでモデルアクセスを有効化
2. 適切なリージョン（us-east-1）が設定されているか確認

### Node.js バージョンエラー

```
Error: The engine "node" is incompatible with this module
```

**解決方法**:
```bash
# Node.js 20.9.0以上が必要
node --version  # 20.9.0以上であることを確認

# nvm を使用している場合
nvm install 20.9.0
nvm use 20.9.0
```

### TypeScriptエラー

```bash
# 型定義の問題がある場合
npm run type-check
npm run build --verbose
```

### レート制限エラー

```
Error: Too many requests, please wait before trying again.
```

**解決方法**:
1. 16エージェントの同時実行でレート制限に達した場合
2. 少し時間を置いてから再実行
3. `bedrock-config.ts`の設定で実行間隔を調整

## 実装の特徴

### ✅ 実装済み機能
- **16タイプ完全実装**: 全MBTIタイプとそれぞれの認知機能
- **高度な設定管理**: `bedrock-config.ts`による統一設定
- **型安全性**: TypeScript strict modeによる完全な型安全性
- **永続化**: LibSQLによるローカル・クラウド対応DB
- **メモリ管理**: Mastra Memoryによる文脈保持
- **ログ管理**: PinoLoggerによる構造化ログ
- **品質保証**: 包括的品質評価システム

### 🔧 最適化済み要素
- **MBTIタイプ別モデル**: 各性格タイプに最適化されたLLM選択
- **プロファイル認証**: `fromNodeProviderChain()`による柔軟なAWS認証
- **グラフ最適化**: 性格相性に基づく動的トポロジー調整
- **重み調整**: 文脈・フェーズ・履歴に基づく動的重み計算

### 📊 正しい使用方法

```typescript
import { createMBTIOptimizedModel } from './utils/bedrock-config';

// MBTIタイプ別最適化モデルの使用
const intjModel = createMBTIOptimizedModel('INTJ');
const enfjModel = createMBTIOptimizedModel('ENFJ');

// 全エージェントの取得と実行
import { getAllAgents } from './agents';
const allAgents = getAllAgents();
```

### 重要なポイント

1. **Node.js要件**: 20.9.0以上が必須
2. **実行方法**: `npm run discuss` を使用（tsxによる高速実行）
3. **認証方法**: `fromNodeProviderChain()` による自動認証
4. **モデル選択**: MBTIタイプ別最適化による性格特性の正確な再現
5. **データ管理**: LibSQL + Mastra Memoryによる包括的データ管理

## ライセンス

MIT License
