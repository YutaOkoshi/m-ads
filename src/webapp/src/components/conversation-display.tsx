'use client';

import React from 'react';

// 型定義（簡略版）
interface ConversationTurn {
  turnNumber: number;
  speakerMbtiType: string;
  statement: string;
  timestamp: string;
  confidence: number;
  relevance: number;
  dynamicWeight: number;
  qualityContribution: number;
  sevenDimensionEvaluation?: {
    performance: number;
    psychological: number;
    externalAlignment: number;
    internalConsistency: number;
    socialDecisionMaking: number;
    contentQuality: number;
    ethics: number;
    overallQuality: number;
  };
  realtimeOptimization: {
    weightAdjustment: number;
    graphOptimization: boolean;
    qualityImprovement: number;
  };
}

interface ConversationDisplayProps {
  conversationFlow: ConversationTurn[];
  isRealtime?: boolean;
}

// MBTIタイプ別のカラーマッピング
const getMBTIColor = (mbtiType: string) => {
  const typeColors = {
    // NT (Rational) - 青系
    'INTJ': 'border-l-blue-600 bg-blue-50',
    'INTP': 'border-l-blue-500 bg-blue-50',
    'ENTJ': 'border-l-indigo-600 bg-indigo-50',
    'ENTP': 'border-l-indigo-500 bg-indigo-50',
    
    // NF (Idealist) - 緑系
    'INFJ': 'border-l-green-600 bg-green-50',
    'INFP': 'border-l-green-500 bg-green-50',
    'ENFJ': 'border-l-emerald-600 bg-emerald-50',
    'ENFP': 'border-l-emerald-500 bg-emerald-50',
    
    // SJ (Guardian) - 黄系
    'ISTJ': 'border-l-yellow-600 bg-yellow-50',
    'ISFJ': 'border-l-yellow-500 bg-yellow-50',
    'ESTJ': 'border-l-orange-600 bg-orange-50',
    'ESFJ': 'border-l-orange-500 bg-orange-50',
    
    // SP (Artisan) - 紫系
    'ISTP': 'border-l-purple-600 bg-purple-50',
    'ISFP': 'border-l-purple-500 bg-purple-50',
    'ESTP': 'border-l-pink-600 bg-pink-50',
    'ESFP': 'border-l-pink-500 bg-pink-50',
  };
  return typeColors[mbtiType as keyof typeof typeColors] || 'border-l-gray-400 bg-gray-50';
};

const getMBTIBadgeColor = (mbtiType: string) => {
  const badgeColors = {
    // NT (Rational) - 青系
    'INTJ': 'bg-blue-100 text-blue-800',
    'INTP': 'bg-blue-100 text-blue-700',
    'ENTJ': 'bg-indigo-100 text-indigo-800',
    'ENTP': 'bg-indigo-100 text-indigo-700',
    
    // NF (Idealist) - 緑系
    'INFJ': 'bg-green-100 text-green-800',
    'INFP': 'bg-green-100 text-green-700',
    'ENFJ': 'bg-emerald-100 text-emerald-800',
    'ENFP': 'bg-emerald-100 text-emerald-700',
    
    // SJ (Guardian) - 黄系
    'ISTJ': 'bg-yellow-100 text-yellow-800',
    'ISFJ': 'bg-yellow-100 text-yellow-700',
    'ESTJ': 'bg-orange-100 text-orange-800',
    'ESFJ': 'bg-orange-100 text-orange-700',
    
    // SP (Artisan) - 紫系
    'ISTP': 'bg-purple-100 text-purple-800',
    'ISFP': 'bg-purple-100 text-purple-700',
    'ESTP': 'bg-pink-100 text-pink-800',
    'ESFP': 'bg-pink-100 text-pink-700',
  };
  return badgeColors[mbtiType as keyof typeof badgeColors] || 'bg-gray-100 text-gray-700';
};

export default function ConversationDisplay({ conversationFlow, isRealtime = false }: ConversationDisplayProps) {
  if (!conversationFlow || conversationFlow.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        まだ会話が開始されていません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">会話の流れ</h3>
        {isRealtime && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600">リアルタイム更新中</span>
          </div>
        )}
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {conversationFlow.map((turn, index) => (
          <div
            key={`turn-${turn.turnNumber}-${index}`}
            className={`border-l-4 p-4 rounded-r-lg ${getMBTIColor(turn.speakerMbtiType)} transition-all duration-300`}
          >
            {/* ヘッダー情報 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMBTIBadgeColor(turn.speakerMbtiType)}`}>
                  {turn.speakerMbtiType}
                </span>
                <span className="text-sm text-gray-600">
                  ターン {turn.turnNumber}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(turn.timestamp).toLocaleTimeString('ja-JP')}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-600">
                  重み: <span className="font-medium">{turn.dynamicWeight.toFixed(2)}</span>
                </div>
                {turn.realtimeOptimization.weightAdjustment !== 0 && (
                  <div className={`text-xs px-1 py-0.5 rounded ${
                    turn.realtimeOptimization.weightAdjustment > 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {turn.realtimeOptimization.weightAdjustment > 0 ? '+' : ''}{(turn.realtimeOptimization.weightAdjustment * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {/* 発言内容 */}
            <div className="mb-3">
              <p className="text-gray-800 leading-relaxed">{turn.statement}</p>
            </div>

            {/* メトリクス表示 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">信頼度</div>
                <div className={`text-lg font-bold ${
                  turn.confidence >= 0.8 ? 'text-green-600' : 
                  turn.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(turn.confidence * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">関連度</div>
                <div className={`text-lg font-bold ${
                  turn.relevance >= 0.8 ? 'text-green-600' : 
                  turn.relevance >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(turn.relevance * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">品質貢献</div>
                <div className={`text-lg font-bold ${
                  turn.qualityContribution >= 0.8 ? 'text-green-600' : 
                  turn.qualityContribution >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(turn.qualityContribution * 100).toFixed(0)}%
                </div>
              </div>
              
              {turn.sevenDimensionEvaluation && (
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">総合品質</div>
                  <div className={`text-lg font-bold ${
                    turn.sevenDimensionEvaluation.overallQuality >= 0.8 ? 'text-green-600' : 
                    turn.sevenDimensionEvaluation.overallQuality >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(turn.sevenDimensionEvaluation.overallQuality * 100).toFixed(0)}%
                  </div>
                </div>
              )}
            </div>

            {/* 7次元評価（展開可能） */}
            {turn.sevenDimensionEvaluation && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  7次元品質評価を表示
                </summary>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Performance:</span>
                    <span className="ml-1 font-medium">{(turn.sevenDimensionEvaluation.performance * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">心理的:</span>
                    <span className="ml-1 font-medium">{(turn.sevenDimensionEvaluation.psychological * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">外部整合:</span>
                    <span className="ml-1 font-medium">{(turn.sevenDimensionEvaluation.externalAlignment * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">内部一貫:</span>
                    <span className="ml-1 font-medium">{(turn.sevenDimensionEvaluation.internalConsistency * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">社会的:</span>
                    <span className="ml-1 font-medium">{(turn.sevenDimensionEvaluation.socialDecisionMaking * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">コンテンツ:</span>
                    <span className="ml-1 font-medium">{(turn.sevenDimensionEvaluation.contentQuality * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">倫理性:</span>
                    <span className="ml-1 font-medium">{(turn.sevenDimensionEvaluation.ethics * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </details>
            )}

            {/* リアルタイム最適化情報 */}
            {(turn.realtimeOptimization.graphOptimization || turn.realtimeOptimization.qualityImprovement > 0) && (
              <div className="mt-3 p-2 bg-blue-100 rounded-md">
                <div className="text-xs text-blue-800">
                  リアルタイム最適化:
                  {turn.realtimeOptimization.graphOptimization && <span className="ml-2">🔗 グラフ最適化実行</span>}
                  {turn.realtimeOptimization.qualityImprovement > 0 && (
                    <span className="ml-2">📈 品質向上 +{(turn.realtimeOptimization.qualityImprovement * 100).toFixed(1)}%</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}