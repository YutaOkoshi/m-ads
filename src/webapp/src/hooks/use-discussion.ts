import { useState, useCallback } from 'react';
import { DiscussionConfig, DiscussionResult, DiscussionState, ApiResponse, MBTIType } from '../../../types/m-ads';

// MBTIType初期化ヘルパー
const createEmptyMBTIRecord = (): Record<MBTIType, number> => ({
  'INTJ': 1.0, 'INTP': 1.0, 'ENTJ': 1.0, 'ENTP': 1.0,
  'INFJ': 1.0, 'INFP': 1.0, 'ENFJ': 1.0, 'ENFP': 1.0,
  'ISTJ': 1.0, 'ISFJ': 1.0, 'ESTJ': 1.0, 'ESFJ': 1.0,
  'ISTP': 1.0, 'ISFP': 1.0, 'ESTP': 1.0, 'ESFP': 1.0,
});

export function useDiscussion() {
  const [state, setState] = useState<DiscussionState>({
    status: 'idle',
    progress: {
      currentPhase: 'brainstorming',
      currentTurn: 0,
      totalExpectedTurns: 0,
      progressPercentage: 0
    },
    liveMetrics: {
      latestWeight: createEmptyMBTIRecord(),
      qualityTrend: [],
      optimizationCount: 0
    }
  });

  const startDiscussion = useCallback(async (config: DiscussionConfig) => {
    setState(prev => ({
      ...prev,
      status: 'running',
      config,
      error: undefined,
      progress: {
        currentPhase: 'brainstorming',
        currentTurn: 0,
        totalExpectedTurns: config.participantCount * 4, // 推定ターン数
        progressPercentage: 0
      }
    }));

    try {
      // シミュレーション用のプログレス更新
      const updateProgress = (phase: 'brainstorming' | 'analysis' | 'synthesis' | 'conclusion', turn: number) => {
        setState(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            currentPhase: phase,
            currentTurn: turn,
            progressPercentage: Math.min((turn / (config.participantCount * 4)) * 100, 100)
          }
        }));
      };

      // フェーズ別にプログレスを更新
      for (let i = 0; i < ['brainstorming', 'analysis', 'synthesis', 'conclusion'].length; i++) {
        const phases = ['brainstorming', 'analysis', 'synthesis', 'conclusion'] as const;
        updateProgress(phases[i], (i + 1) * config.participantCount);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
      }

      // 議論実行API呼び出し
      const response = await fetch('/api/discussion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      const apiResponse: ApiResponse<DiscussionResult> = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.error || '議論の実行に失敗しました');
      }

      setState(prev => ({
        ...prev,
        status: 'completed',
        result: apiResponse.data,
        progress: {
          ...prev.progress,
          progressPercentage: 100
        }
      }));

    } catch (error) {
      console.error('議論実行エラー:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      }));
    }
  }, []);

  const resetDiscussion = useCallback(() => {
    setState({
      status: 'idle',
      progress: {
        currentPhase: 'brainstorming',
        currentTurn: 0,
        totalExpectedTurns: 0,
        progressPercentage: 0
      },
      liveMetrics: {
        latestWeight: createEmptyMBTIRecord(),
        qualityTrend: [],
        optimizationCount: 0
      }
    });
  }, []);

  return {
    state,
    startDiscussion,
    resetDiscussion,
    isRunning: state.status === 'running',
    isCompleted: state.status === 'completed',
    hasError: state.status === 'error'
  };
}