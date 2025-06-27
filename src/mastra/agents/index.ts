import { Agent } from '@mastra/core/agent';
import type { MBTIType } from '../types/mbti-types';

// NT (Rational) Agents
import { intjAgent, getINTJCharacteristics } from './intj-agent';
import { intpAgent, getINTPCharacteristics } from './intp-agent';
import { entjAgent, getENTJCharacteristics } from './entj-agent';
import { entpAgent, getENTPCharacteristics } from './entp-agent';

// NF (Idealist) Agents
import { infjAgent, getINFJCharacteristics } from './infj-agent';
import { infpAgent, getINFPCharacteristics } from './infp-agent';
import { enfjAgent, getENFJCharacteristics } from './enfj-agent';
import { enfpAgent, getENFPCharacteristics } from './enfp-agent';

// SJ (Guardian) Agents
import { istjAgent, getISTJCharacteristics } from './istj-agent';
import { isfjAgent, getISFJCharacteristics } from './isfj-agent';
import { estjAgent, getESTJCharacteristics } from './estj-agent';
import { esfjAgent, getESFJCharacteristics } from './esfj-agent';

// SP (Artisan) Agents
import { istpAgent, getISTPCharacteristics } from './istp-agent';
import { isfpAgent, getISFPCharacteristics } from './isfp-agent';
import { estpAgent, getESTPCharacteristics } from './estp-agent';
import { esfpAgent, getESFPCharacteristics } from './esfp-agent';

// Orchestrator
import { orchestratorAgent } from './orchestrator-agent';

// Re-export all agents and characteristics
export {
  // NT Agents
  intjAgent, getINTJCharacteristics,
  intpAgent, getINTPCharacteristics,
  entjAgent, getENTJCharacteristics,
  entpAgent, getENTPCharacteristics,
  
  // NF Agents
  infjAgent, getINFJCharacteristics,
  infpAgent, getINFPCharacteristics,
  enfjAgent, getENFJCharacteristics,
  enfpAgent, getENFPCharacteristics,
  
  // SJ Agents
  istjAgent, getISTJCharacteristics,
  isfjAgent, getISFJCharacteristics,
  estjAgent, getESTJCharacteristics,
  esfjAgent, getESFJCharacteristics,
  
  // SP Agents
  istpAgent, getISTPCharacteristics,
  isfpAgent, getISFPCharacteristics,
  estpAgent, getESTPCharacteristics,
  esfpAgent, getESFPCharacteristics,
  
  // Orchestrator
  orchestratorAgent
};

// 全MBTIエージェントのマップ
export const ALL_MBTI_AGENTS: Record<MBTIType, Agent> = {
  // NT (Rational)
  INTJ: intjAgent,
  INTP: intpAgent,
  ENTJ: entjAgent,
  ENTP: entpAgent,
  
  // NF (Idealist)
  INFJ: infjAgent,
  INFP: infpAgent,
  ENFJ: enfjAgent,
  ENFP: enfpAgent,
  
  // SJ (Guardian)
  ISTJ: istjAgent,
  ISFJ: isfjAgent,
  ESTJ: estjAgent,
  ESFJ: esfjAgent,
  
  // SP (Artisan)
  ISTP: istpAgent,
  ISFP: isfpAgent,
  ESTP: estpAgent,
  ESFP: esfpAgent,
} as const;

/**
 * MBTIタイプに基づいてエージェントを取得
 * @param mbtiType - MBTIタイプ
 * @returns 対応するエージェント
 */
export function getAgentByType(mbtiType: MBTIType): Agent {
  const agent = ALL_MBTI_AGENTS[mbtiType];
  if (!agent) {
    throw new Error(`Agent not found for MBTI type: ${mbtiType}`);
  }
  return agent;
}

/**
 * 指定されたMBTIタイプのリストに基づいてエージェントを取得
 * @param mbtiTypes - MBTIタイプのリスト
 * @returns エージェントのマップ
 */
export function getAgentsByTypes(mbtiTypes: MBTIType[]): Record<string, Agent> {
  const agents: Record<string, Agent> = {};
  mbtiTypes.forEach(type => {
    agents[type] = getAgentByType(type);
  });
  return agents;
}

/**
 * 全16エージェントを取得
 * @returns 全エージェントのマップ
 */
export function getAllAgents(): Record<MBTIType, Agent> {
  return ALL_MBTI_AGENTS;
} 