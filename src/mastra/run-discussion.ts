import 'dotenv/config';
import { mastra } from './index';

/**
 * M-ADS (MBTI Multi-Agent Discussion System) 実行スクリプト
 * 
 * 必要な環境変数:
 * - AWS_REGION: AWS リージョン (例: us-east-1)
 * - AWS_PROFILE: AWSプロファイル名 (プロファイルを使用する場合)
 * 
 * または直接認証情報:
 * - AWS_ACCESS_KEY_ID: AWSアクセスキーID
 * - AWS_SECRET_ACCESS_KEY: AWSシークレットアクセスキー
 */

async function runMBTIDiscussion(): Promise<void> {
  console.log('=== M-ADS (MBTI Multi-Agent Discussion System) ===');
  console.log('Phase 1: Interactive Conversation MVP\n');
  
  // 議論のトピックを設定
  const topic = process.argv[2] || 'AIが人間の創造性にもたらす影響について';
  
  console.log(`議論トピック: "${topic}"\n`);
  console.log('参加エージェント:');
  console.log('- INTJ (The Architect) - NT代表');
  console.log('- INFJ (The Advocate) - NF代表');
  console.log('- ISTJ (The Inspector) - SJ代表');
  console.log('- ISTP (The Virtuoso) - SP代表\n');
  
  console.log('対話形式の議論を開始します...\n');
  
  try {
    // ワークフローを取得
    const workflow = mastra.getWorkflow('mbtiDiscussionWorkflow');
    
    // 実行インスタンスを作成
    const run = await workflow.createRunAsync();
    
    // ワークフローを開始
    const result = await run.start({
      inputData: {
        topic
      }
    });
    
    // 実行結果を確認
    if (result.status !== 'success') {
      console.error(`ワークフローの実行に失敗しました: ${result.status}`);
      if (result.status === 'failed' && 'error' in result) {
        console.error('エラー:', result.error);
      }
      return;
    }
    
    // 成功した結果を取得
    const output = result.result;
    
    console.log('\n=== 議論結果 ===\n');
    console.log(`総発言数: ${output.totalStatements}`);
    console.log(`総ターン数: ${output.totalTurns}`);
    
    console.log('\n--- 品質メトリクス ---');
    console.log(`多様性スコア: ${(output.metrics.diversityScore * 100).toFixed(1)}%`);
    console.log(`一貫性スコア: ${(output.metrics.consistencyScore * 100).toFixed(1)}%`);
    console.log(`収束効率: ${(output.metrics.convergenceEfficiency * 100).toFixed(1)}%`);
    console.log(`MBTI整合性: ${(output.metrics.mbtiAlignmentScore * 100).toFixed(1)}%`);
    console.log(`相互作用品質: ${(output.metrics.interactionQuality * 100).toFixed(1)}%`);
    
    console.log('\n--- 評価レポート ---');
    console.log(`総合評価: ${output.report.grade} (${(output.report.overallScore * 100).toFixed(1)}%)`);
    console.log(`\n${output.report.summary}`);
    
    if (output.report.conversationHighlights && output.report.conversationHighlights.length > 0) {
      console.log('\n📝 会話のハイライト:');
      output.report.conversationHighlights.forEach((highlight: string) => {
        console.log(`• ${highlight}`);
      });
    }
    
    if (output.report.strengths.length > 0) {
      console.log('\n💪 強み:');
      output.report.strengths.forEach((strength: string) => {
        console.log(`+ ${strength}`);
      });
    }
    
    if (output.report.weaknesses.length > 0) {
      console.log('\n🔧 改善点:');
      output.report.weaknesses.forEach((weakness: string) => {
        console.log(`- ${weakness}`);
      });
    }
    
    // 会話の流れを表示（オプション）
    if (process.argv.includes('--show-conversation') || process.argv.includes('-c')) {
      console.log('\n=== 会話の流れ ===');
      output.conversationFlow.forEach((turn: {
        turnNumber: number;
        speakerMbtiType: string;
        timestamp: string;
        statement: string;
        responseToAgent?: string;
        confidence: number;
        relevance: number;
      }) => {
        const timestamp = new Date(turn.timestamp).toLocaleTimeString('ja-JP');
        console.log(`\n[Turn ${turn.turnNumber}] ${turn.speakerMbtiType} (${timestamp})`);
        console.log(`${turn.statement}`);
        if (turn.responseToAgent) {
          console.log(`(→ ${turn.responseToAgent}への応答)`);
        }
        console.log(`信頼度: ${(turn.confidence * 100).toFixed(1)}% | 関連度: ${(turn.relevance * 100).toFixed(1)}%`);
      });
    } else {
      console.log('\n💡 ヒント: --show-conversation または -c オプションで会話の詳細を表示できます');
    }
    
    console.log('\n=== 議論完了 ===');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// スクリプトを実行
runMBTIDiscussion().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 