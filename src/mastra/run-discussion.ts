#!/usr/bin/env tsx

import 'dotenv/config';
import { mastra } from './index';
import { parseArgs } from 'util';
import type { MBTIType, ComprehensiveQualityReport, DiscussionTurn } from './types/mbti-types';
import { saveConversationAsMarkdown, saveConversationAsJson, type ConversationData } from './utils/conversation-saver';

/**
 * M-ADS (MBTI Multi-Agent Discussion System) 実行スクリプト
 * Phase 2 完全版対応
 * 
 * 必要な環境変数:
 * - AWS_REGION: AWS リージョン (例: us-east-1)
 * - AWS_PROFILE: AWSプロファイル名 (プロファイルを使用する場合)
 * 
 * または直接認証情報:
 * - AWS_ACCESS_KEY_ID: AWSアクセスキーID
 * - AWS_SECRET_ACCESS_KEY: AWSシークレットアクセスキー
 */

// 🎯 コマンドライン引数解析
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'participants': { type: 'string', short: 'p' },
    'topic': { type: 'string', short: 't' },
    'no-realtime': { type: 'boolean' },
    'no-graph': { type: 'boolean' },
    'threshold': { type: 'string' },
    'show-conversation': { type: 'boolean', short: 'c' },
    'show-realtime': { type: 'boolean', short: 'r' },
    'save-conversation': { type: 'boolean', short: 's' },  // 🆕 保存オプション
    'output-format': { type: 'string', short: 'f' },      // 🆕 出力形式
    'output-dir': { type: 'string', short: 'o' }          // 🆕 出力ディレクトリ
  },
  allowPositionals: true
});

async function runDiscussion(): Promise<void> {
  console.log('🚀 === M-ADS Phase 2 完全版 ===');
  console.log('MBTI Multi-Agent Discussion System');
  console.log('- 16 MBTI エージェント対応');
  console.log('- 7次元品質評価システム');
  console.log('- リアルタイム最適化機能');
  console.log('- グラフトポロジー最適化\n');
  
  const config = {
    topic: values.topic || 'AIが人間の創造性にもたらす影響について',
    participantCount: values.participants ? parseInt(values.participants) : 8, // Phase 2完全版: 8エージェントでテスト
    enableRealtimeOptimization: !values['no-realtime'],
    enableGraphOptimization: !values['no-graph'],
    qualityThreshold: values.threshold ? parseFloat(values.threshold) : 0.8,
    showConversation: values['show-conversation'] || false,
    showRealtimeDetails: values['show-realtime'] || false,
    saveConversation: values['save-conversation'] || false,              // 🆕 
    outputFormat: values['output-format'] || 'markdown',                 // 🆕 markdown or json
    outputDir: values['output-dir'] || './conversations'                 // 🆕
  };
  
  console.log('\n🎯 議論設定:');
  console.log(`  トピック: "${config.topic}"`);
  console.log(`  参加者数: ${config.participantCount} MBTIタイプ`);
  console.log(`  リアルタイム最適化: ${config.enableRealtimeOptimization ? 'ON' : 'OFF'}`);
  console.log(`  グラフ最適化: ${config.enableGraphOptimization ? 'ON' : 'OFF'}`);
  console.log(`  品質閾値: ${(config.qualityThreshold * 100).toFixed(0)}%`);
  if (config.saveConversation) {
    console.log(`  会話保存: ON (${config.outputFormat.toUpperCase()}形式)`);
    console.log(`  出力先: ${config.outputDir}`);
  }
  
  console.log('\n📊 Phase 2 完全版議論を開始します...\n');
  
  const startTime = new Date();
  let conversationTurns: DiscussionTurn[] = [];
  let participantTypes: MBTIType[] = [];
  
  try {
    console.log('\n⚡ ワークフロー実行中...');
    
    // Phase 2完全版ワークフローを取得
    const workflow = mastra.getWorkflow('mbtiDiscussionWorkflow');
    
    if (!workflow) {
      console.error('❌ mbtiDiscussionWorkflow が見つかりません');
      console.log('💡 利用可能なワークフロー:', Object.keys(mastra.getWorkflows()));
      return;
    }
    
    // 実行インスタンスを作成
    const run = await workflow.createRunAsync();
    
    // ワークフローを開始
    const workflowResult = await run.start({
      inputData: {
        topic: config.topic,
        participantCount: config.participantCount,
        enableRealtimeOptimization: config.enableRealtimeOptimization,
        enableGraphOptimization: config.enableGraphOptimization,
        qualityThreshold: config.qualityThreshold
      }
    });

    // 実行結果を確認
    if (workflowResult.status !== 'success') {
      console.error(`❌ ワークフローの実行に失敗しました: ${workflowResult.status}`);
      if (workflowResult.status === 'failed' && 'error' in workflowResult) {
        console.error('エラー:', workflowResult.error);
      }
      return;
    }

    // 成功した結果を取得
    const result = workflowResult.result;
    
    // 🔄 会話データの抽出と変換
    if (result.conversationFlow) {
      conversationTurns = result.conversationFlow.map((turn: any): DiscussionTurn => ({
        agentType: turn.speakerMbtiType as MBTIType,
        message: turn.statement,
        timestamp: turn.timestamp,
        weight: turn.dynamicWeight,
        qualityMetrics: {
          overallQuality: turn.qualityContribution * 100,
          confidence: turn.confidence * 100,
          relevance: turn.relevance * 100
        }
      }));
    }

    participantTypes = result.participantTypes as MBTIType[];

    // 📊 詳細結果表示
    displayDetailedResults(result, config);

    // 💾 会話保存処理
    if (config.saveConversation && conversationTurns.length > 0) {
      await saveConversationData({
        topic: config.topic,
        participants: participantTypes,
        startTime,
        endTime: new Date(),
        turns: conversationTurns,
        qualityReport: convertToQualityReport(result),
        metadata: {
          participantCount: config.participantCount,
          totalTurns: conversationTurns.length,
          enabledFeatures: {
            realtimeOptimization: config.enableRealtimeOptimization,
            graphOptimization: config.enableGraphOptimization
          }
        }
      }, config.outputFormat, config.outputDir);
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
}

/**
 * 会話データを保存
 */
async function saveConversationData(
  data: ConversationData, 
  format: string, 
  outputDir: string
): Promise<void> {
  try {
    console.log('\n💾 === 会話データ保存中 ===');
    
    let savedPath: string;
    
    if (format === 'json') {
      savedPath = saveConversationAsJson(data, outputDir);
      console.log(`📄 JSON形式で保存完了: ${savedPath}`);
    } else {
      savedPath = saveConversationAsMarkdown(data, outputDir);  
      console.log(`📝 Markdown形式で保存完了: ${savedPath}`);
    }
    
    console.log(`📁 ファイルサイズ: ${getFileSizeKB(savedPath)} KB`);
    console.log(`🕒 保存時刻: ${new Date().toLocaleString('ja-JP')}`);
    
  } catch (error) {
    console.error('💥 会話保存でエラーが発生:', error);
  }
}

/**
 * ファイルサイズを取得
 */
function getFileSizeKB(filePath: string): number {
  try {
    const fs = require('fs');
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024 * 10) / 10; // KB、小数点1位
  } catch {
    return 0;
  }
}

/**
 * ワークフロー結果をComprehensiveQualityReportに変換
 */
function convertToQualityReport(result: any): ComprehensiveQualityReport {
  const metrics = result.comprehensiveMetrics || {};
  
  return {
    // 7次元品質評価
    performanceScore: metrics.performanceScore,
    psychologicalScore: metrics.psychologicalScore,
    externalAlignmentScore: metrics.externalAlignmentScore,
    internalConsistencyScore: metrics.internalConsistencyScore,
    socialDecisionScore: metrics.socialDecisionScore,
    contentQualityScore: metrics.contentQualityScore,
    ethicsScore: metrics.ethicsScore,
    
    // 従来メトリクス
    diversityScore: metrics.diversityScore,
    consistencyScore: metrics.consistencyScore,
    convergenceEfficiency: metrics.convergenceEfficiency,
    mbtiAlignmentScore: metrics.mbtiAlignmentScore,
    interactionQuality: metrics.interactionQuality,
    argumentQuality: metrics.argumentQuality,
    participationBalance: metrics.participationBalance,
    resolutionRate: metrics.resolutionRate,
    
    // 総合評価
    overallScore: result.advancedReport?.overallScore,
    grade: result.advancedReport?.grade,
    
    // 分析結果
    strengths: result.advancedReport?.strengths,
    improvements: result.advancedReport?.weaknesses,
    optimizationResults: {
      executionCount: result.realtimeOptimization?.optimizationCount || 0,
      improvementPercentage: (result.realtimeOptimization?.qualityImprovement || 0) * 100,
      recommendations: result.realtimeOptimization?.recommendations || []
    }
  };
}

/**
 * 詳細結果表示（既存ロジック）
 */
function displayDetailedResults(result: any, config: any) {
  // 📊 基本統計の表示
  const participantTypes = result.participantTypes || [];
  const totalStatements = result.totalStatements || 0;
  const totalTurns = result.totalTurns || 0;

  console.log('\n🎉 === Phase 2 完全版議論結果 ===');
  console.log('\n📊 基本統計:');
  console.log(`  参加MBTIタイプ: ${participantTypes.join(', ')}`);
  console.log(`  総発言数: ${totalStatements}`);
  console.log(`  総ターン数: ${totalTurns}`);

  // 🎯 7次元品質評価
  const metrics = result.comprehensiveMetrics;
  if (metrics) {
    console.log('\n🎯 7次元品質評価:');
    console.log(`  Performance (パフォーマンス): ${(metrics.performanceScore * 100).toFixed(1)}%`);
    console.log(`  Psychological (心理的適合性): ${(metrics.psychologicalScore * 100).toFixed(1)}%`);
    console.log(`  External Alignment (外部整合性): ${(metrics.externalAlignmentScore * 100).toFixed(1)}%`);
    console.log(`  Internal Consistency (内部一貫性): ${(metrics.internalConsistencyScore * 100).toFixed(1)}%`);
    console.log(`  Social Decision-making (社会的意思決定): ${(metrics.socialDecisionScore * 100).toFixed(1)}%`);
    console.log(`  Content Quality (コンテンツ品質): ${(metrics.contentQualityScore * 100).toFixed(1)}%`);
    console.log(`  Ethics (倫理性): ${(metrics.ethicsScore * 100).toFixed(1)}%`);

    console.log('\n📈 従来メトリクス:');
    console.log(`  多様性スコア: ${(metrics.diversityScore * 100).toFixed(1)}%`);
    console.log(`  一貫性スコア: ${(metrics.consistencyScore * 100).toFixed(1)}%`);
    console.log(`  収束効率: ${(metrics.convergenceEfficiency * 100).toFixed(1)}%`);
    console.log(`  MBTI整合性: ${(metrics.mbtiAlignmentScore * 100).toFixed(1)}%`);
    console.log(`  相互作用品質: ${(metrics.interactionQuality * 100).toFixed(1)}%`);

    console.log('\n🆕 新規メトリクス:');
    console.log(`  論証品質: ${(metrics.argumentQuality * 100).toFixed(1)}%`);
    console.log(`  参加バランス: ${(metrics.participationBalance * 100).toFixed(1)}%`);
    console.log(`  解決率: ${(metrics.resolutionRate * 100).toFixed(1)}%`);
  }

  // ⚡ リアルタイム最適化結果
  const optimization = result.realtimeOptimization;
  if (optimization && config.enableRealtimeOptimization) {
    console.log('\n⚡ リアルタイム最適化結果:');
    console.log(`  最適化実行回数: ${optimization.optimizationCount}回`);
    console.log(`  品質改善度: ${(optimization.qualityImprovement * 100).toFixed(1)}%`);
    console.log(`  グラフ最適化回数: ${optimization.graphOptimizations}回`);
  }

  // 🏆 総合評価レポート
  const report = result.advancedReport;
  if (report) {
    console.log('\n🏆 総合評価レポート:');
    console.log(`  総合スコア: ${report.grade} (${(report.overallScore * 100).toFixed(1)}%)`);
    console.log(`  ${report.summary}`);

    if (report.strengths?.length > 0) {
      console.log('\n💪 強み:');
      report.strengths.forEach((strength: string) => {
        console.log(`  + ${strength}`);
      });
    }

    if (report.weaknesses?.length > 0) {
      console.log('\n🔧 改善点:');
      report.weaknesses.forEach((weakness: string) => {
        console.log(`  - ${weakness}`);
      });
    }
  }

  // 📊 MBTIタイプ別分析
  const mbtiAnalysis = result.advancedReport?.mbtiTypeAnalysis;
  if (mbtiAnalysis) {
    console.log('\n📊 MBTIタイプ別分析:');
    Object.entries(mbtiAnalysis).forEach(([type, analysis]: [string, any]) => {
      console.log(`  ${type}:`);
      console.log(`    参加率: ${(analysis.participationRate * 100).toFixed(1)}%`);
      console.log(`    品質貢献度: ${(analysis.qualityContribution * 100).toFixed(1)}%`);
      console.log(`    特性整合性: ${(analysis.characteristicAlignment * 100).toFixed(1)}%`);
    });
  }

  // 📈 詳細分析
  if (report?.detailedAnalysis) {
    console.log('\n📈 詳細分析:');
    console.log(`  ${report.detailedAnalysis}`);
  }

  // 💬 会話の詳細表示（オプション）
  if (config.showConversation && result.conversationFlow) {
    console.log('\n💬 === 会話の流れ ===');
    result.conversationFlow.forEach((turn: any, index: number) => {
      const timestamp = new Date(turn.timestamp).toLocaleTimeString('ja-JP');
      console.log(`\n[Turn ${turn.turnNumber}] ${turn.speakerMbtiType} (${timestamp})`);
      console.log(turn.statement);
      console.log(`信頼度: ${(turn.confidence * 100).toFixed(1)}% | 関連度: ${(turn.relevance * 100).toFixed(1)}% | 重み: ${turn.dynamicWeight.toFixed(2)} | 品質: ${(turn.qualityContribution * 100).toFixed(1)}%`);
    });
  } else {
    console.log('\n💡 ヒント:');
    console.log('  --show-conversation (-c): 会話の詳細を表示');
    console.log('  --show-realtime (-r): リアルタイム最適化の詳細を表示');
    console.log('  --save-conversation (-s): 会話をファイルに保存');
    console.log('  --output-format (-f): 出力形式 (markdown/json)');
    console.log('  --output-dir (-o): 出力ディレクトリ');
  }

  console.log('\n🎉 === Phase 2 完全版議論完了 ===');
}

// ヘルプ表示
function showHelp() {
  console.log('🚀 M-ADS Phase 2 完全版 使用方法:\n');
  console.log('基本実行:');
  console.log('  npm run discussion');
  console.log('  npm run discussion "カスタムトピック"\n');
  
  console.log('オプション:');
  console.log('  --topic, -t <text>         議論トピックを指定');
  console.log('  --participants, -p <num>   参加MBTIタイプ数 (4-16)');
  console.log('  --no-realtime             リアルタイム最適化を無効化');
  console.log('  --no-graph                グラフ最適化を無効化');
  console.log('  --quality-threshold, -q    品質閾値 (0.5-1.0)');
  console.log('  --show-conversation, -c    会話の詳細を表示');
  console.log('  --show-realtime, -r        リアルタイム最適化詳細を表示');
  console.log('  --save-conversation, -s     会話をファイルに保存');
  console.log('  --output-format, -f         出力形式 (markdown/json)');
  console.log('  --output-dir, -o           出力ディレクトリ\n');
  
  console.log('例:');
  console.log('  npm run discussion -- --participants 12 --show-conversation');
  console.log('  npm run discussion -- --topic "リモートワークの未来" --no-realtime');
  console.log('  npm run discussion -- --participants 16 --show-realtime -c');
}

// ヘルプ表示チェック
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// メイン実行
runDiscussion().catch(console.error); 