import { Agent } from '@mastra/core/agent';
import { createAnthropic } from '@ai-sdk/anthropic';
import { 
  initializeGraphTool,
  addAgentToGraphTool,
  updateAgentWeightTool,
  getGraphMetricsTool,
  optimizeGraphTopologyTool
} from '../tools/graph-manager-tool';
import {
  calculateAgentWeightTool,
  recordInteractionTool,
  adjustAllAgentWeightsTool,
  getWeightDistributionTool,
  resetInteractionHistoryTool
} from '../tools/weight-adjuster-tool';
import {
  evaluateDiscussionQualityTool,
  compareQualityMetricsTool,
  generateQualityReportTool
} from '../tools/quality-evaluator-tool';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const orchestratorAgent = new Agent({
  name: 'M-ADS-Orchestrator',
  description: 'MBTI Multi-Agent Discussion System のオーケストレータ',
  instructions: `あなたはM-ADS（MBTI Multi-Agent Discussion System）のオーケストレータです。

【役割】
1. MBTIエージェント間の議論を管理・調整する
2. グラフトポロジーを最適化し、効率的な議論を促進する
3. 動的重み調整により、バランスの取れた議論を実現する
4. 議論品質を評価し、改善策を提示する

【議論フェーズ】
- brainstorming: 多様なアイデアの創出
- analysis: 深い分析と検討
- synthesis: アイデアの統合
- conclusion: 結論の導出

【使用可能なツール】
1. グラフ管理: initializeGraph, addAgentToGraph, updateAgentWeight, getGraphMetrics, optimizeGraphTopology
2. 重み調整: calculateAgentWeight, recordInteraction, adjustAllAgentWeights, getWeightDistribution, resetInteractionHistory
3. 品質評価: evaluateDiscussionQuality, compareQualityMetrics, generateQualityReport

【議論管理プロセス】
1. グラフを初期化し、MBTIエージェントを追加
2. 議論フェーズに応じて重みを動的調整
3. 各エージェントの発言を記録し、品質を評価
4. 必要に応じてグラフトポロジーを最適化
5. 最終的な品質レポートを生成

常に公平で効率的な議論を心がけ、すべてのMBTIタイプの視点が適切に反映されるよう調整してください。`,
  model: anthropic('claude-3-5-sonnet-20241022'),
  tools: {
    // グラフ管理ツール
    initializeGraph: initializeGraphTool,
    addAgentToGraph: addAgentToGraphTool,
    updateAgentWeight: updateAgentWeightTool,
    getGraphMetrics: getGraphMetricsTool,
    optimizeGraphTopology: optimizeGraphTopologyTool,
    
    // 重み調整ツール
    calculateAgentWeight: calculateAgentWeightTool,
    recordInteraction: recordInteractionTool,
    adjustAllAgentWeights: adjustAllAgentWeightsTool,
    getWeightDistribution: getWeightDistributionTool,
    resetInteractionHistory: resetInteractionHistoryTool,
    
    // 品質評価ツール
    evaluateDiscussionQuality: evaluateDiscussionQualityTool,
    compareQualityMetrics: compareQualityMetricsTool,
    generateQualityReport: generateQualityReportTool
  }
}); 