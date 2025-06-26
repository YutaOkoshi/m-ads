import 'dotenv/config';
import { mastra } from './index';

async function runMBTIDiscussion() {
  console.log('=== M-ADS (MBTI Multi-Agent Discussion System) ===');
  console.log('Phase 1: Core MVP\n');
  
  // 議論のトピックを設定
  const topic = process.argv[2] || 'AIが人間の創造性にもたらす影響について';
  
  console.log(`議論トピック: "${topic}"\n`);
  console.log('参加エージェント:');
  console.log('- INTJ (The Architect) - NT代表');
  console.log('- INFJ (The Advocate) - NF代表');
  console.log('- ISTJ (The Inspector) - SJ代表');
  console.log('- ISTP (The Virtuoso) - SP代表\n');
  
  console.log('議論を開始します...\n');
  
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
    
    console.log('=== 議論結果 ===\n');
    console.log(`発言数: ${output.totalStatements}`);
    console.log('\n--- 品質メトリクス ---');
    console.log(`多様性スコア: ${(output.metrics.diversityScore * 100).toFixed(1)}%`);
    console.log(`一貫性スコア: ${(output.metrics.consistencyScore * 100).toFixed(1)}%`);
    console.log(`収束効率: ${(output.metrics.convergenceEfficiency * 100).toFixed(1)}%`);
    console.log(`MBTI整合性: ${(output.metrics.mbtiAlignmentScore * 100).toFixed(1)}%`);
    
    console.log('\n--- 評価レポート ---');
    console.log(`総合評価: ${output.report.grade} (${(output.report.overallScore * 100).toFixed(1)}%)`);
    console.log(`\n${output.report.summary}`);
    
    if (output.report.strengths.length > 0) {
      console.log('\n強み:');
      output.report.strengths.forEach((strength: string) => {
        console.log(`- ${strength}`);
      });
    }
    
    if (output.report.weaknesses.length > 0) {
      console.log('\n改善点:');
      output.report.weaknesses.forEach((weakness: string) => {
        console.log(`- ${weakness}`);
      });
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