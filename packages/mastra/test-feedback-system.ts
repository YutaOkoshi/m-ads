import { RealtimeFeedbackManager } from './core/realtime-feedback-manager';
import { FeedbackConfigurationBuilder } from './config/feedback-configuration';
import type { MBTIType } from './types/mbti-types';

/**
 * フィードバックシステム動作確認テスト
 */
export async function testFeedbackSystem(): Promise<void> {
  console.log('🧪 フィードバックシステムのテストを開始します\n');

  try {
    // 1. 設定構築
    console.log('📋 Step 1: 設定構築');
    const config = FeedbackConfigurationBuilder
      .create()
      .applyBalancedPreset()
      .build();
    console.log('✅ 設定構築完了\n');

    // 2. フィードバックマネージャー初期化
    console.log('🔧 Step 2: システム初期化');
    const feedbackManager = new RealtimeFeedbackManager(config);
    await feedbackManager.initialize();
    console.log('✅ システム初期化完了\n');

    // 3. 基本的な評価テスト
    console.log('📊 Step 3: 基本評価テスト');
    const result = await feedbackManager.evaluateStatement({
      statement: 'AIの発展により、我々の創造性の概念が根本的に変化していると考えます。',
      topic: 'AIと創造性の未来',
      mbtiType: 'INTJ' as MBTIType,
      phase: 'initial' as any
    } as any);

    console.log(`総合スコア: ${(result.overall.overallScore * 100).toFixed(1)}%`);
    console.log(`信頼度: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`フィードバック: ${result.detailed.feedback}`);

    console.log('\n🎉 === フィードバックシステムテスト完了 ===');
    console.log('✅ 統合されたフィードバックシステムが正常に動作しています');

  } catch (error) {
    console.error('❌ テスト実行中にエラーが発生:', error);
    throw error;
  }
}

/**
 * 簡単な動作確認
 */
export async function quickTest(): Promise<void> {
  console.log('⚡ 簡単動作確認テスト\n');

  try {
    const config = FeedbackConfigurationBuilder.create().applyBalancedPreset().build();
    const manager = new RealtimeFeedbackManager(config);
    await manager.initialize();

    const result = await manager.evaluateStatement({
      statement: 'テストメッセージです。システムが正常に動作しているか確認します。',
      topic: 'システムテスト',
      mbtiType: 'INTJ' as MBTIType,
      phase: 'initial' as any
    } as any);

    console.log(`✅ テスト成功 - スコア: ${(result.overall.overallScore * 100).toFixed(1)}%`);
  } catch (error) {
    console.error(`❌ テスト失敗:`, error);
    throw error;
  }
}

// モジュールとして実行された場合のテスト実行
if (require.main === module) {
  quickTest()
    .then(() => console.log('テスト完了'))
    .catch(error => {
      console.error('テスト失敗:', error);
      process.exit(1);
    });
}
