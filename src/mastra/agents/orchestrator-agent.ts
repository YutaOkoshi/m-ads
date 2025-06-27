import { Agent } from '@mastra/core/agent';
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
  evaluateComprehensiveQualityTool,
  analyzeArgumentDiversityTool,
  trackConsensusEvolutionTool,
  compareQualityMetricsTool,
  generateQualityReportTool
} from '../tools/quality-evaluator-tool';
import { createBedrockModel, MBTI_MODEL_PREFERENCES } from '../utils/bedrock-config';

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
3. 品質評価: 
   - evaluateDiscussionQuality: 基本的な議論品質評価
   - evaluateComprehensiveQuality: 7次元RPA品質評価（Performance, Psychological, External Alignment, Internal Consistency, Social Decision-making, Content Quality, Ethics）
   - analyzeArgumentDiversity: 引数多様性・視点分析
   - trackConsensusEvolution: 合意形成進化の追跡
   - compareQualityMetrics: 品質メトリクス比較
   - generateQualityReport: 総合品質レポート生成

【議論管理プロセス】
1. グラフを初期化し、MBTIエージェントを追加
2. 議論フェーズに応じて重みを動的調整
3. 各エージェントの発言を記録し、品質を評価
4. 必要に応じてグラフトポロジーを最適化
5. 7次元品質評価による詳細分析
6. 最終的な品質レポートを生成

常に公平で効率的な議論を心がけ、すべてのMBTIタイプの視点が適切に反映されるよう調整してください。`,
  model: createBedrockModel(MBTI_MODEL_PREFERENCES.ORCHESTRATOR),
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
    
    // 品質評価ツール（完全版）
    evaluateDiscussionQuality: evaluateDiscussionQualityTool,
    evaluateComprehensiveQuality: evaluateComprehensiveQualityTool,
    analyzeArgumentDiversity: analyzeArgumentDiversityTool,
    trackConsensusEvolution: trackConsensusEvolutionTool,
    compareQualityMetrics: compareQualityMetricsTool,
    generateQualityReport: generateQualityReportTool
  }
}); 