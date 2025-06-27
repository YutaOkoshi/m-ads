import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

// Phase 2: 全16エージェントのインポート
import {
  // NT Agents
  intjAgent, intpAgent, entjAgent, entpAgent,
  // NF Agents  
  infjAgent, infpAgent, enfjAgent, enfpAgent,
  // SJ Agents
  istjAgent, isfjAgent, estjAgent, esfjAgent,
  // SP Agents
  istpAgent, isfpAgent, estpAgent, esfpAgent,
  // Orchestrator
  orchestratorAgent
} from './agents/index';

// ワークフローのインポート
import { mbtiDiscussionWorkflow } from './workflows/mbti-discussion-workflow';

export const mastra = new Mastra({
  workflows: {
    mbtiDiscussionWorkflow
  },
  agents: {
    // 🧠 NT (Rational) - 理論的・戦略的思考
    'INTJ-Architect': intjAgent,
    'INTP-Thinker': intpAgent,
    'ENTJ-Commander': entjAgent,
    'ENTP-Debater': entpAgent,
    
    // 💖 NF (Idealist) - 価値観・人間関係重視
    'INFJ-Advocate': infjAgent,
    'INFP-Mediator': infpAgent,
    'ENFJ-Protagonist': enfjAgent,
    'ENFP-Campaigner': enfpAgent,
    
    // 🏛️ SJ (Guardian) - 責任・組織・安定重視
    'ISTJ-Inspector': istjAgent,
    'ISFJ-Protector': isfjAgent,
    'ESTJ-Executive': estjAgent,
    'ESFJ-Consul': esfjAgent,
    
    // 🎨 SP (Artisan) - 実用性・体験・柔軟性重視
    'ISTP-Virtuoso': istpAgent,
    'ISFP-Adventurer': isfpAgent,
    'ESTP-Entrepreneur': estpAgent,
    'ESFP-Entertainer': esfpAgent,
    
    // 🎯 Orchestrator - 中央制御
    'M-ADS-Orchestrator': orchestratorAgent
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: "file:../mastra.db",
  }),
  logger: new PinoLogger({
    name: 'M-ADS Phase 2',
    level: 'info',
  }),
});
