import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { DiscussionGraph } from '../utils/graph-utils';
import { 
  GraphTopologyOptimizer, 
  GraphStructure, 
  PerformanceMetrics, 
  InteractionHistory 
} from '../utils/graph-topology-optimizer';
import type { MBTIType } from '../types/mbti-types';

// グローバルなグラフインスタンスと最適化エンジン
let discussionGraph: DiscussionGraph | null = null;
let topologyOptimizer: GraphTopologyOptimizer | null = null;

export const initializeGraphTool = createTool({
  id: 'initializeGraph',
  description: 'Initialize a new discussion graph for MBTI agents with VEM-GCN optimization',
  inputSchema: z.object({
    enableOptimization: z.boolean().default(true),
    optimizationParams: z.object({
      maxIterations: z.number().default(100),
      convergenceThreshold: z.number().default(0.001),
      learningRate: z.number().default(0.01),
      regularizationStrength: z.number().default(0.1)
    }).optional()
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    graphId: z.string(),
    optimizationEnabled: z.boolean()
  }),
  execute: async ({ context }) => {
    discussionGraph = new DiscussionGraph();
    
    if (context.enableOptimization) {
      topologyOptimizer = new GraphTopologyOptimizer(context.optimizationParams);
    }
    
    const graphId = `graph-${Date.now()}`;
    
    return {
      success: true,
      message: `Discussion graph initialized successfully with ${context.enableOptimization ? 'VEM-GCN optimization enabled' : 'basic optimization'}`,
      graphId,
      optimizationEnabled: context.enableOptimization
    };
  }
});

export const addAgentToGraphTool = createTool({
  id: 'addAgentToGraph',
  description: 'Add an MBTI agent to the discussion graph (supports all 16 types)',
  inputSchema: z.object({
    mbtiType: z.enum([
      'INTJ', 'INTP', 'ENTJ', 'ENTP',  // NT
      'INFJ', 'INFP', 'ENFJ', 'ENFP',  // NF
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',  // SJ
      'ISTP', 'ISFP', 'ESTP', 'ESFP'   // SP
    ] as const),
    initialWeight: z.number().min(0.1).max(2.0).default(1.0),
    autoOptimize: z.boolean().default(true)
  }),
  outputSchema: z.object({
    nodeId: z.string(),
    message: z.string(),
    optimizationApplied: z.boolean(),
    graphMetrics: z.object({
      nodeCount: z.number(),
      edgeCount: z.number(),
      averagePathLength: z.number(),
      clusteringCoefficient: z.number()
    }).optional()
  }),
  execute: async ({ context }) => {
    if (!discussionGraph) {
      discussionGraph = new DiscussionGraph();
    }
    
    const nodeId = discussionGraph.addAgent(context.mbtiType as MBTIType);
    discussionGraph.updateNodeWeight(nodeId, context.initialWeight);
    
    let optimizationApplied = false;
    let graphMetrics;
    
    // 自動最適化が有効で3つ以上のノードがある場合に最適化を実行
    if (context.autoOptimize && topologyOptimizer && discussionGraph.getSnapshot().length >= 3) {
      try {
        await optimizeGraphStructure();
        optimizationApplied = true;
        
        // 最適化後のメトリクスを取得
        graphMetrics = {
          nodeCount: discussionGraph.getSnapshot().length,
          edgeCount: discussionGraph.getSnapshot().reduce((sum, node) => sum + node.connections.size, 0) / 2,
          averagePathLength: discussionGraph.getAveragePathLength(),
          clusteringCoefficient: discussionGraph.getClusterCoefficient()
        };
      } catch (error) {
        console.warn('Graph optimization failed:', error);
      }
    }
    
    return {
      nodeId,
      message: `Agent ${context.mbtiType} added to graph with ID: ${nodeId}`,
      optimizationApplied,
      graphMetrics
    };
  }
});

export const updateAgentWeightTool = createTool({
  id: 'updateAgentWeight',
  description: 'Update the weight of an agent in the graph with dynamic adjustment',
  inputSchema: z.object({
    nodeId: z.string(),
    weight: z.number().min(0.1).max(2.0),
    triggerOptimization: z.boolean().default(false)
  }),
  outputSchema: z.object({
    success: z.boolean(),
    previousWeight: z.number(),
    newWeight: z.number(),
    optimizationTriggered: z.boolean(),
    qualityImprovement: z.number().optional()
  }),
  execute: async ({ context }) => {
    if (!discussionGraph) {
      throw new Error('Graph not initialized');
    }
    
    const previousWeight = discussionGraph.getNodeWeight(context.nodeId);
    discussionGraph.updateNodeWeight(context.nodeId, context.weight);
    
    let optimizationTriggered = false;
    let qualityImprovement;
    
    if (context.triggerOptimization && topologyOptimizer) {
      try {
        const beforeMetrics = getGraphMetrics();
        await optimizeGraphStructure();
        const afterMetrics = getGraphMetrics();
        
        qualityImprovement = calculateQualityImprovement(beforeMetrics, afterMetrics);
        optimizationTriggered = true;
      } catch (error) {
        console.warn('Optimization triggered by weight update failed:', error);
      }
    }
    
    return {
      success: true,
      previousWeight,
      newWeight: context.weight,
      optimizationTriggered,
      qualityImprovement
    };
  }
});

export const getGraphMetricsTool = createTool({
  id: 'getGraphMetrics',
  description: 'Get comprehensive graph topology metrics including VEM-GCN performance indicators',
  inputSchema: z.object({
    includeOptimizationMetrics: z.boolean().default(true)
  }),
  outputSchema: z.object({
    basicMetrics: z.object({
      averagePathLength: z.number(),
      clusterCoefficient: z.number(),
      nodeCount: z.number(),
      edgeCount: z.number()
    }),
    optimizationMetrics: z.object({
      efficiency: z.number(),
      modularity: z.number(),
      robustness: z.number(),
      adaptability: z.number(),
      qualityScore: z.number()
    }).optional(),
    mbtiDistribution: z.object({
      NT: z.number(),
      NF: z.number(),
      SJ: z.number(),
      SP: z.number()
    }),
    performanceTargets: z.object({
      averagePathLengthTarget: z.number(),
      clusterCoefficientTarget: z.number(),
      pathLengthMet: z.boolean(),
      clusterTargetMet: z.boolean()
    })
  }),
  execute: async ({ context }) => {
    if (!discussionGraph) {
      throw new Error('Graph not initialized');
    }
    
    const snapshot = discussionGraph.getSnapshot();
    const basicMetrics = {
      averagePathLength: discussionGraph.getAveragePathLength(),
      clusterCoefficient: discussionGraph.getClusterCoefficient(),
      nodeCount: snapshot.length,
      edgeCount: snapshot.reduce((sum, node) => sum + node.connections.size, 0) / 2
    };
    
    // MBTIグループ分布の計算
    const distribution = { NT: 0, NF: 0, SJ: 0, SP: 0 };
    snapshot.forEach(node => {
      distribution[node.group]++;
    });
    
    const mbtiDistribution = {
      NT: distribution.NT / snapshot.length,
      NF: distribution.NF / snapshot.length,
      SJ: distribution.SJ / snapshot.length,
      SP: distribution.SP / snapshot.length
    };
    
    // パフォーマンス目標との比較
    const performanceTargets = {
      averagePathLengthTarget: 3.0,
      clusterCoefficientTarget: 0.7,
      pathLengthMet: basicMetrics.averagePathLength <= 3.0,
      clusterTargetMet: basicMetrics.clusterCoefficient >= 0.7
    };
    
    let optimizationMetrics;
    if (context.includeOptimizationMetrics && topologyOptimizer) {
      const graphStructure = convertToGraphStructure();
      const perfMetrics = topologyOptimizer.calculatePerformanceMetrics(graphStructure);
      
      optimizationMetrics = {
        efficiency: perfMetrics.efficiency,
        modularity: perfMetrics.modularity,
        robustness: perfMetrics.robustness,
        adaptability: perfMetrics.adaptability,
        qualityScore: (perfMetrics.efficiency + perfMetrics.modularity + perfMetrics.robustness) / 3
      };
    }
    
    return {
      basicMetrics,
      optimizationMetrics,
      mbtiDistribution,
      performanceTargets
    };
  }
});

export const optimizeGraphTopologyTool = createTool({
  id: 'optimizeGraphTopology',
  description: 'Optimize the graph topology using VEM-GCN algorithm for enhanced agent communication',
  inputSchema: z.object({
    targetMetrics: z.object({
      maxPathLength: z.number().default(3.0),
      minClusterCoefficient: z.number().default(0.7),
      minEfficiency: z.number().default(0.8)
    }).optional(),
    forceOptimization: z.boolean().default(false)
  }),
  outputSchema: z.object({
    success: z.boolean(),
    optimizationPerformed: z.boolean(),
    beforeMetrics: z.object({
      averagePathLength: z.number(),
      clusterCoefficient: z.number(),
      efficiency: z.number()
    }),
    afterMetrics: z.object({
      averagePathLength: z.number(),
      clusterCoefficient: z.number(),
      efficiency: z.number()
    }),
    improvement: z.object({
      pathLengthImprovement: z.number(),
      clusterImprovement: z.number(),
      efficiencyImprovement: z.number(),
      overallImprovement: z.number()
    }),
    convergenceInfo: z.object({
      iterations: z.number(),
      convergenceRate: z.number(),
      qualityScore: z.number()
    })
  }),
  execute: async ({ context }) => {
    if (!discussionGraph) {
      throw new Error('Graph not initialized');
    }
    
    if (!topologyOptimizer) {
      throw new Error('Graph topology optimizer not initialized');
    }
    
    const beforeBasicMetrics = getGraphMetrics();
    const beforeStructure = convertToGraphStructure();
    const beforeAdvancedMetrics = topologyOptimizer.calculatePerformanceMetrics(beforeStructure);
    
    const beforeMetrics = {
      averagePathLength: beforeBasicMetrics.averagePathLength,
      clusterCoefficient: beforeBasicMetrics.clusterCoefficient,
      efficiency: beforeAdvancedMetrics.efficiency
    };
    
    // 最適化が必要かどうかをチェック
    const needsOptimization = context.forceOptimization || 
      beforeMetrics.averagePathLength > (context.targetMetrics?.maxPathLength || 3.0) ||
      beforeMetrics.clusterCoefficient < (context.targetMetrics?.minClusterCoefficient || 0.7) ||
      beforeMetrics.efficiency < (context.targetMetrics?.minEfficiency || 0.8);
    
    let optimizationPerformed = false;
    let afterMetrics = beforeMetrics;
    let improvement = {
      pathLengthImprovement: 0,
      clusterImprovement: 0,
      efficiencyImprovement: 0,
      overallImprovement: 0
    };
    let convergenceInfo = {
      iterations: 0,
      convergenceRate: 0,
      qualityScore: 0
    };
    
    if (needsOptimization) {
      // VEM-GCN最適化を実行
      const interactionHistory: InteractionHistory = {
        interactions: new Map(),
        quality: new Map(),
        temporal: []
      };
      
      const optimizedStructure = await topologyOptimizer.optimizeTopology(
        beforeStructure,
        beforeAdvancedMetrics,
        interactionHistory
      );
      
      // 最適化結果をグラフに適用
      applyOptimizedStructure(optimizedStructure);
      
      // 最適化後のメトリクスを取得
      const afterBasicMetrics = getGraphMetrics();
      const afterAdvancedMetrics = topologyOptimizer.calculatePerformanceMetrics(optimizedStructure);
      
      afterMetrics = {
        averagePathLength: afterBasicMetrics.averagePathLength,
        clusterCoefficient: afterBasicMetrics.clusterCoefficient,
        efficiency: afterAdvancedMetrics.efficiency
      };
      
      // 改善度を計算
      improvement = {
        pathLengthImprovement: (beforeMetrics.averagePathLength - afterMetrics.averagePathLength) / beforeMetrics.averagePathLength,
        clusterImprovement: (afterMetrics.clusterCoefficient - beforeMetrics.clusterCoefficient) / Math.max(beforeMetrics.clusterCoefficient, 0.01),
        efficiencyImprovement: (afterMetrics.efficiency - beforeMetrics.efficiency) / Math.max(beforeMetrics.efficiency, 0.01),
        overallImprovement: 0
      };
      improvement.overallImprovement = (improvement.pathLengthImprovement + improvement.clusterImprovement + improvement.efficiencyImprovement) / 3;
      
      // 最適化品質を評価
      const qualityEvaluation = topologyOptimizer.evaluateOptimizationQuality(beforeStructure, optimizedStructure);
      convergenceInfo = {
        iterations: 50, // 簡略化
        convergenceRate: qualityEvaluation.convergenceRate,
        qualityScore: qualityEvaluation.qualityScore
      };
      
      optimizationPerformed = true;
    }
    
    return {
      success: true,
      optimizationPerformed,
      beforeMetrics,
      afterMetrics,
      improvement,
      convergenceInfo
    };
  }
});

export const analyzeGraphPerformanceTool = createTool({
  id: 'analyzeGraphPerformance',
  description: 'Analyze graph performance and provide optimization recommendations',
  inputSchema: z.object({
    includeRecommendations: z.boolean().default(true)
  }),
  outputSchema: z.object({
    performanceAnalysis: z.object({
      currentQuality: z.string(), // 'excellent' | 'good' | 'fair' | 'poor'
      bottlenecks: z.array(z.string()),
      strengths: z.array(z.string())
    }),
    recommendations: z.array(z.object({
      priority: z.string(), // 'high' | 'medium' | 'low'
      action: z.string(),
      expectedImpact: z.string(),
      estimatedTime: z.string()
    })).optional()
  }),
  execute: async ({ context }) => {
    if (!discussionGraph) {
      throw new Error('Graph not initialized');
    }
    
    const metrics = getGraphMetrics();
    const snapshot = discussionGraph.getSnapshot();
    
    // パフォーマンス分析
    const bottlenecks = [];
    const strengths = [];
    
    if (metrics.averagePathLength > 3.0) {
      bottlenecks.push('Average path length exceeds target (>3.0)');
    } else if (metrics.averagePathLength <= 2.0) {
      strengths.push('Excellent path length efficiency');
    }
    
    if (metrics.clusterCoefficient < 0.7) {
      bottlenecks.push('Clustering coefficient below target (<0.7)');
    } else if (metrics.clusterCoefficient >= 0.8) {
      strengths.push('Strong local clustering');
    }
    
    if (snapshot.length < 4) {
      bottlenecks.push('Limited agent diversity (less than 4 agents)');
    }
    
    // 全体品質の判定
    let currentQuality: string;
    if (metrics.averagePathLength <= 2.5 && metrics.clusterCoefficient >= 0.8) {
      currentQuality = 'excellent';
    } else if (metrics.averagePathLength <= 3.0 && metrics.clusterCoefficient >= 0.7) {
      currentQuality = 'good';
    } else if (metrics.averagePathLength <= 3.5 && metrics.clusterCoefficient >= 0.6) {
      currentQuality = 'fair';
    } else {
      currentQuality = 'poor';
    }
    
    const performanceAnalysis = {
      currentQuality,
      bottlenecks,
      strengths
    };
    
    let recommendations;
    if (context.includeRecommendations) {
      recommendations = [];
      
      if (metrics.averagePathLength > 3.0) {
        recommendations.push({
          priority: 'high',
          action: 'Add shortcut connections between distant MBTI groups',
          expectedImpact: 'Reduce path length by 10-20%',
          estimatedTime: '< 5 seconds'
        });
      }
      
      if (metrics.clusterCoefficient < 0.7) {
        recommendations.push({
          priority: 'medium',
          action: 'Strengthen intra-group connections',
          expectedImpact: 'Improve clustering by 15-25%',
          estimatedTime: '< 3 seconds'
        });
      }
      
      if (snapshot.length < 8) {
        recommendations.push({
          priority: 'low',
          action: 'Add more diverse MBTI agents',
          expectedImpact: 'Improve discussion quality and robustness',
          estimatedTime: 'Depends on agent availability'
        });
      }
    }
    
    return {
      performanceAnalysis,
      recommendations
    };
  }
});

// ヘルパー関数
async function optimizeGraphStructure(): Promise<void> {
  if (!topologyOptimizer || !discussionGraph) return;
  
  const currentStructure = convertToGraphStructure();
  const currentMetrics = topologyOptimizer.calculatePerformanceMetrics(currentStructure);
  const interactionHistory: InteractionHistory = {
    interactions: new Map(),
    quality: new Map(),
    temporal: []
  };
  
  const optimizedStructure = await topologyOptimizer.optimizeTopology(
    currentStructure,
    currentMetrics,
    interactionHistory
  );
  
  applyOptimizedStructure(optimizedStructure);
}

function convertToGraphStructure(): GraphStructure {
  if (!discussionGraph) {
    throw new Error('Graph not initialized');
  }
  
  const snapshot = discussionGraph.getSnapshot();
  const nodes = new Map();
  const edges = new Map();
  const nodeIndex = new Map();
  
  // ノードを変換
  snapshot.forEach((node, index) => {
    nodes.set(node.id, {
      id: node.id,
      mbtiType: node.mbtiType,
      group: node.group,
      weight: node.weight,
      embedding: new Array(16).fill(0).map(() => Math.random()),
      clusterMembership: 0
    });
    nodeIndex.set(node.id, index);
  });
  
  // エッジを変換
  snapshot.forEach(node => {
    node.connections.forEach((strength, targetId) => {
      const edgeId = `${node.id}-${targetId}`;
      if (!edges.has(edgeId) && !edges.has(`${targetId}-${node.id}`)) {
        edges.set(edgeId, {
          from: node.id,
          to: targetId,
          weight: strength,
          strength: strength,
          confidence: 0.8,
          isLatent: false
        });
      }
    });
  });
  
  return {
    nodes,
    edges,
    adjacencyMatrix: [],
    nodeIndex
  };
}

function applyOptimizedStructure(structure: GraphStructure): void {
  if (!discussionGraph) return;
  
  // 重みの更新（基本的な適用のみ）
  structure.nodes.forEach((node, nodeId) => {
    discussionGraph!.updateNodeWeight(nodeId, node.weight);
  });
}

function getGraphMetrics() {
  if (!discussionGraph) {
    throw new Error('Graph not initialized');
  }
  
  return {
    averagePathLength: discussionGraph.getAveragePathLength(),
    clusterCoefficient: discussionGraph.getClusterCoefficient()
  };
}

function calculateQualityImprovement(before: any, after: any): number {
  const pathImprovement = (before.averagePathLength - after.averagePathLength) / before.averagePathLength;
  const clusterImprovement = (after.clusterCoefficient - before.clusterCoefficient) / Math.max(before.clusterCoefficient, 0.01);
  
  return (pathImprovement + clusterImprovement) / 2;
}

// グラフのエクスポート関数（他のモジュールから使用するため）
export function getDiscussionGraph(): DiscussionGraph | null {
  return discussionGraph;
}

export function getTopologyOptimizer(): GraphTopologyOptimizer | null {
  return topologyOptimizer;
} 