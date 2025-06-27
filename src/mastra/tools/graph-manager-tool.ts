import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { DiscussionGraph } from '../utils/graph-utils';
import type { MBTIType } from '../types/mbti-types';

// グローバルなグラフインスタンス（Phase 1では簡易実装）
let discussionGraph: DiscussionGraph | null = null;

export const initializeGraphTool = createTool({
  id: 'initializeGraph',
  description: 'Initialize a new discussion graph for MBTI agents',
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string()
  }),
  execute: async () => {
    discussionGraph = new DiscussionGraph();
    return {
      success: true,
      message: 'Discussion graph initialized successfully'
    };
  }
});

export const addAgentToGraphTool = createTool({
  id: 'addAgentToGraph',
  description: 'Add an MBTI agent to the discussion graph',
  inputSchema: z.object({
    mbtiType: z.enum(['INTJ', 'INFJ', 'ISTJ', 'ISTP'] as const)
  }),
  outputSchema: z.object({
    nodeId: z.string(),
    message: z.string()
  }),
  execute: async ({ context }) => {
    if (!discussionGraph) {
      discussionGraph = new DiscussionGraph();
    }
    
    const nodeId = discussionGraph.addAgent(context.mbtiType as MBTIType);
    
    return {
      nodeId,
      message: `Agent ${context.mbtiType} added to graph with ID: ${nodeId}`
    };
  }
});

export const updateAgentWeightTool = createTool({
  id: 'updateAgentWeight',
  description: 'Update the weight of an agent in the graph based on discussion phase',
  inputSchema: z.object({
    nodeId: z.string(),
    weight: z.number().min(0).max(2)
  }),
  outputSchema: z.object({
    success: z.boolean(),
    previousWeight: z.number(),
    newWeight: z.number()
  }),
  execute: async ({ context }) => {
    if (!discussionGraph) {
      throw new Error('Graph not initialized');
    }
    
    const previousWeight = discussionGraph.getNodeWeight(context.nodeId);
    discussionGraph.updateNodeWeight(context.nodeId, context.weight);
    
    return {
      success: true,
      previousWeight,
      newWeight: context.weight
    };
  }
});

export const getGraphMetricsTool = createTool({
  id: 'getGraphMetrics',
  description: 'Get current graph topology metrics',
  inputSchema: z.object({}),
  outputSchema: z.object({
    averagePathLength: z.number(),
    clusterCoefficient: z.number(),
    nodeCount: z.number()
  }),
  execute: async () => {
    if (!discussionGraph) {
      throw new Error('Graph not initialized');
    }
    
    const snapshot = discussionGraph.getSnapshot();
    
    return {
      averagePathLength: discussionGraph.getAveragePathLength(),
      clusterCoefficient: discussionGraph.getClusterCoefficient(),
      nodeCount: snapshot.length
    };
  }
});

export const optimizeGraphTopologyTool = createTool({
  id: 'optimizeGraphTopology',
  description: 'Optimize the graph topology for better agent communication',
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    beforeMetrics: z.object({
      averagePathLength: z.number(),
      clusterCoefficient: z.number()
    }),
    afterMetrics: z.object({
      averagePathLength: z.number(),
      clusterCoefficient: z.number()
    })
  }),
  execute: async () => {
    if (!discussionGraph) {
      throw new Error('Graph not initialized');
    }
    
    const beforeMetrics = {
      averagePathLength: discussionGraph.getAveragePathLength(),
      clusterCoefficient: discussionGraph.getClusterCoefficient()
    };
    
    discussionGraph.optimizeTopology();
    
    const afterMetrics = {
      averagePathLength: discussionGraph.getAveragePathLength(),
      clusterCoefficient: discussionGraph.getClusterCoefficient()
    };
    
    return {
      success: true,
      beforeMetrics,
      afterMetrics
    };
  }
});

// グラフのエクスポート関数（他のモジュールから使用するため）
export function getDiscussionGraph(): DiscussionGraph | null {
  return discussionGraph;
} 