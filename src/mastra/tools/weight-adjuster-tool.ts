import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import type { MBTIType} from '../types/mbti-types';
import { DiscussionContext } from '../types/mbti-types';
import { calculateDynamicWeight, MBTI_CHARACTERISTICS } from '../utils/mbti-characteristics';
import { getDiscussionGraph } from './graph-manager-tool';

// エージェントの相互作用履歴を管理
const interactionHistory = new Map<string, number>();

export const calculateAgentWeightTool = createTool({
  id: 'calculateAgentWeight',
  description: 'Calculate dynamic weight for an MBTI agent based on discussion context',
  inputSchema: z.object({
    nodeId: z.string(),
    mbtiType: z.enum([
      'INTJ', 'INTP', 'ENTJ', 'ENTP',  // NT
      'INFJ', 'INFP', 'ENFJ', 'ENFP',  // NF
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',  // SJ
      'ISTP', 'ISFP', 'ESTP', 'ESFP'   // SP
    ] as const),
    phase: z.enum(['brainstorming', 'analysis', 'synthesis', 'conclusion'])
  }),
  outputSchema: z.object({
    weight: z.number(),
    factors: z.object({
      baseWeight: z.number(),
      phaseModifier: z.number(),
      interactionModifier: z.number()
    })
  }),
  execute: async ({ context }) => {
    const previousInteractions = interactionHistory.get(context.nodeId) || 0;
    const weight = calculateDynamicWeight(
      context.mbtiType as MBTIType,
      context.phase,
      previousInteractions
    );
    
    const characteristics = MBTI_CHARACTERISTICS[context.mbtiType as MBTIType];
    const baseWeight = characteristics.weight;
    
    // 計算の内訳を返す（透明性のため）
    return {
      weight,
      factors: {
        baseWeight,
        phaseModifier: weight / baseWeight / Math.max(0.5, 1.0 - (previousInteractions * 0.1)),
        interactionModifier: Math.max(0.5, 1.0 - (previousInteractions * 0.1))
      }
    };
  }
});

export const recordInteractionTool = createTool({
  id: 'recordInteraction',
  description: 'Record an agent interaction to update future weight calculations',
  inputSchema: z.object({
    nodeId: z.string(),
    mbtiType: z.enum([
      'INTJ', 'INTP', 'ENTJ', 'ENTP',  // NT
      'INFJ', 'INFP', 'ENFJ', 'ENFP',  // NF
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',  // SJ
      'ISTP', 'ISFP', 'ESTP', 'ESFP'   // SP
    ] as const)
  }),
  outputSchema: z.object({
    success: z.boolean(),
    totalInteractions: z.number()
  }),
  execute: async ({ context }) => {
    const currentCount = interactionHistory.get(context.nodeId) || 0;
    const newCount = currentCount + 1;
    interactionHistory.set(context.nodeId, newCount);
    
    return {
      success: true,
      totalInteractions: newCount
    };
  }
});

export const adjustAllAgentWeightsTool = createTool({
  id: 'adjustAllAgentWeights',
  description: 'Adjust weights for all agents in the graph based on current phase',
  inputSchema: z.object({
    phase: z.enum(['brainstorming', 'analysis', 'synthesis', 'conclusion']),
    agentNodeMap: z.record(z.string(), z.enum([
      'INTJ', 'INTP', 'ENTJ', 'ENTP',  // NT
      'INFJ', 'INFP', 'ENFJ', 'ENFP',  // NF
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',  // SJ
      'ISTP', 'ISFP', 'ESTP', 'ESFP'   // SP
    ] as const))
  }),
  outputSchema: z.object({
    success: z.boolean(),
    adjustments: z.array(z.object({
      nodeId: z.string(),
      mbtiType: z.string(),
      oldWeight: z.number(),
      newWeight: z.number()
    }))
  }),
  execute: async ({ context }) => {
    const graph = getDiscussionGraph();
    if (!graph) {
      throw new Error('Discussion graph not initialized');
    }
    
    const adjustments = [];
    
    for (const [nodeId, mbtiType] of Object.entries(context.agentNodeMap)) {
      const oldWeight = graph.getNodeWeight(nodeId);
      const previousInteractions = interactionHistory.get(nodeId) || 0;
      const newWeight = calculateDynamicWeight(
        mbtiType as MBTIType,
        context.phase,
        previousInteractions
      );
      
      graph.updateNodeWeight(nodeId, newWeight);
      
      adjustments.push({
        nodeId,
        mbtiType,
        oldWeight,
        newWeight
      });
    }
    
    return {
      success: true,
      adjustments
    };
  }
});

export const getWeightDistributionTool = createTool({
  id: 'getWeightDistribution',
  description: 'Get current weight distribution across all agents',
  inputSchema: z.object({
    agentNodeMap: z.record(z.string(), z.enum([
      'INTJ', 'INTP', 'ENTJ', 'ENTP',  // NT
      'INFJ', 'INFP', 'ENFJ', 'ENFP',  // NF
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',  // SJ
      'ISTP', 'ISFP', 'ESTP', 'ESFP'   // SP
    ] as const))
  }),
  outputSchema: z.object({
    distribution: z.array(z.object({
      nodeId: z.string(),
      mbtiType: z.string(),
      weight: z.number(),
      interactionCount: z.number()
    })),
    totalWeight: z.number(),
    averageWeight: z.number()
  }),
  execute: async ({ context }) => {
    const graph = getDiscussionGraph();
    if (!graph) {
      throw new Error('Discussion graph not initialized');
    }
    
    const distribution = [];
    let totalWeight = 0;
    
    for (const [nodeId, mbtiType] of Object.entries(context.agentNodeMap)) {
      const weight = graph.getNodeWeight(nodeId);
      const interactionCount = interactionHistory.get(nodeId) || 0;
      
      distribution.push({
        nodeId,
        mbtiType,
        weight,
        interactionCount
      });
      
      totalWeight += weight;
    }
    
    return {
      distribution,
      totalWeight,
      averageWeight: distribution.length > 0 ? totalWeight / distribution.length : 0
    };
  }
});

export const resetInteractionHistoryTool = createTool({
  id: 'resetInteractionHistory',
  description: 'Reset interaction history for new discussion session',
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string()
  }),
  execute: async () => {
    interactionHistory.clear();
    
    return {
      success: true,
      message: 'Interaction history reset successfully'
    };
  }
}); 