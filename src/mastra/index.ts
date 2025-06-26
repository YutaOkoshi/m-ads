import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

// エージェントのインポート
import { intjAgent } from './agents/intj-agent';
import { infjAgent } from './agents/infj-agent';
import { istjAgent } from './agents/istj-agent';
import { istpAgent } from './agents/istp-agent';
import { orchestratorAgent } from './agents/orchestrator-agent';

// ワークフローのインポート
import { mbtiDiscussionWorkflow } from './workflows/mbti-discussion-workflow';

export const mastra = new Mastra({
  workflows: {
    mbtiDiscussionWorkflow
  },
  agents: {
    'INTJ-Architect': intjAgent,
    'INFJ-Advocate': infjAgent,
    'ISTJ-Inspector': istjAgent,
    'ISTP-Virtuoso': istpAgent,
    'M-ADS-Orchestrator': orchestratorAgent
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: "file:../mastra.db",
  }),
  logger: new PinoLogger({
    name: 'M-ADS',
    level: 'info',
  }),
});
