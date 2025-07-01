'use client';

import { useState } from 'react';
import { useDiscussion } from '@/hooks/use-discussion';
import { DiscussionConfig, MBTIType } from '@/types/m-ads';

export default function Dashboard() {
  const { state, startDiscussion, resetDiscussion, isRunning, isCompleted, hasError } = useDiscussion();
  const [config, setConfig] = useState<DiscussionConfig>({
    topic: 'AIが人間の創造性にもたらす影響について',
    participantCount: 8,
    enableRealtimeOptimization: true,
    enableGraphOptimization: true,
    qualityThreshold: 0.8,
    saveConversation: false,
    outputFormat: 'markdown',
    outputDirectory: './conversations'
  });

  const handleStartDiscussion = async () => {
    await startDiscussion(config);
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (state.status) {
      case 'running': return '議論実行中...';
      case 'completed': return '議論完了';
      case 'error': return 'エラー発生';
      default: return '待機中';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            M-ADS Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            MBTI Multi-Agent Discussion System - 16タイプエージェントによる議論システム
          </p>
        </div>

        {/* 議論設定パネル */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">議論設定</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* トピック設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                議論トピック
              </label>
              <textarea
                value={config.topic}
                onChange={(e) => setConfig(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="議論したいトピックを入力してください..."
                disabled={isRunning}
              />
            </div>

            {/* 参加者数設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                参加MBTIタイプ数: {config.participantCount}
              </label>
              <input
                type="range"
                min={4}
                max={16}
                value={config.participantCount}
                onChange={(e) => setConfig(prev => ({ ...prev, participantCount: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={isRunning}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4タイプ</span>
                <span>16タイプ</span>
              </div>
            </div>

            {/* オプション設定 */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">最適化オプション</h3>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enableRealtimeOptimization}
                  onChange={(e) => setConfig(prev => ({ ...prev, enableRealtimeOptimization: e.target.checked }))}
                  className="mr-2"
                  disabled={isRunning}
                />
                <span className="text-sm">リアルタイム最適化</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enableGraphOptimization}
                  onChange={(e) => setConfig(prev => ({ ...prev, enableGraphOptimization: e.target.checked }))}
                  className="mr-2"
                  disabled={isRunning}
                />
                <span className="text-sm">グラフトポロジー最適化</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.saveConversation}
                  onChange={(e) => setConfig(prev => ({ ...prev, saveConversation: e.target.checked }))}
                  className="mr-2"
                  disabled={isRunning}
                />
                <span className="text-sm">会話を保存</span>
              </label>
            </div>

            {/* 品質閾値設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                品質閾値: {(config.qualityThreshold * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min={0.5}
                max={1.0}
                step={0.05}
                value={config.qualityThreshold}
                onChange={(e) => setConfig(prev => ({ ...prev, qualityThreshold: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={isRunning}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* 実行ボタン */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleStartDiscussion}
              disabled={isRunning || !config.topic.trim()}
              className={`px-6 py-2 rounded-md font-medium ${
                isRunning || !config.topic.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {isRunning ? '実行中...' : '議論を開始'}
            </button>
            
            {(isCompleted || hasError) && (
              <button
                onClick={resetDiscussion}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
              >
                リセット
              </button>
            )}
          </div>
        </div>

        {/* ステータス表示 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">実行状況</h2>
          
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm font-medium text-gray-700">ステータス:</span>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {isRunning && (
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">現在のフェーズ:</span>
                <span className="text-sm text-blue-600">{state.progress.currentPhase}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">進捗:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${state.progress.progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {Math.round(state.progress.progressPercentage)}%
                </span>
              </div>
            </div>
          )}

          {hasError && state.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{state.error}</p>
            </div>
          )}
        </div>

        {/* 結果表示 */}
        {isCompleted && state.result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">議論結果</h2>
            
            {/* 基本統計 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{state.result.participantTypes.length}</div>
                <div className="text-sm text-gray-600">参加タイプ</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{state.result.totalTurns}</div>
                <div className="text-sm text-gray-600">総ターン数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{state.result.advancedReport.grade}</div>
                <div className="text-sm text-gray-600">総合評価</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {(state.result.advancedReport.overallScore * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">総合スコア</div>
              </div>
            </div>

            {/* 参加タイプ */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">参加MBTIタイプ</h3>
              <div className="flex flex-wrap gap-2">
                {state.result.participantTypes.map((type: MBTIType) => (
                  <span key={type} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* 議論サマリー */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">議論サマリー</h3>
              <p className="text-gray-700 mb-4">{state.result.discussionSummary.overview}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">主要テーマ</h4>
                  <ul className="space-y-1">
                    {state.result.discussionSummary.keyThemes.map((theme, index) => (
                      <li key={index} className="text-sm text-gray-600">• {theme}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">重要な洞察</h4>
                  <ul className="space-y-1">
                    {state.result.discussionSummary.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-600">• {insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 品質メトリクス */}
            <div>
              <h3 className="text-lg font-medium mb-3">7次元品質評価</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {(state.result.comprehensiveMetrics.performanceScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">パフォーマンス</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {(state.result.comprehensiveMetrics.psychologicalScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">心理的適合性</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {(state.result.comprehensiveMetrics.contentQualityScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">コンテンツ品質</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {(state.result.comprehensiveMetrics.ethicsScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">倫理性</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}