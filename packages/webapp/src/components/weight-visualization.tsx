'use client';

import React from 'react';
import { MBTIType } from '../../../types/m-ads';

interface WeightData {
  mbtiType: MBTIType;
  currentWeight: number;
  initialWeight?: number;
  participationCount: number;
  averageQuality: number;
}

interface WeightVisualizationProps {
  weightData: WeightData[];
  showHistory?: boolean;
}

// MBTIグループ分類
const getMBTIGroup = (mbtiType: string) => {
  if (['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(mbtiType)) return { name: 'NT', label: 'Rational', color: 'blue' };
  if (['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(mbtiType)) return { name: 'NF', label: 'Idealist', color: 'green' };
  if (['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(mbtiType)) return { name: 'SJ', label: 'Guardian', color: 'yellow' };
  if (['ISTP', 'ISFP', 'ESTP', 'ESFP'].includes(mbtiType)) return { name: 'SP', label: 'Artisan', color: 'purple' };
  return { name: 'Unknown', label: 'Unknown', color: 'gray' };
};

const getWeightColor = (weight: number, baseWeight: number = 1.0) => {
  const ratio = weight / baseWeight;
  if (ratio >= 1.2) return 'text-green-600 bg-green-100';
  if (ratio >= 1.1) return 'text-green-500 bg-green-50';
  if (ratio >= 0.9) return 'text-gray-600 bg-gray-100';
  if (ratio >= 0.8) return 'text-orange-500 bg-orange-50';
  return 'text-red-600 bg-red-100';
};

const getBarColor = (group: string) => {
  const colors = {
    'blue': 'bg-blue-500',
    'green': 'bg-green-500',
    'yellow': 'bg-yellow-500',
    'purple': 'bg-purple-500',
    'gray': 'bg-gray-500'
  };
  return colors[group as keyof typeof colors] || 'bg-gray-500';
};

export default function WeightVisualization({ weightData }: WeightVisualizationProps) {
  if (!weightData || weightData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        重みデータがありません
      </div>
    );
  }

  // MBTIグループ別にデータを整理
  const groupedData = weightData.reduce((acc, data) => {
    const group = getMBTIGroup(data.mbtiType);
    if (!acc[group.name]) {
      acc[group.name] = { group, types: [] };
    }
    acc[group.name].types.push(data);
    return acc;
  }, {} as Record<string, { group: { name: string; label: string; color: string }, types: WeightData[] }>);

  const maxWeight = Math.max(...weightData.map(d => d.currentWeight), 1.5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">エージェント重みづけ状況</h3>
        <div className="text-sm text-gray-600">
          基準値: 1.0 | 最大: {maxWeight.toFixed(2)}
        </div>
      </div>

      {/* グループ別表示 */}
      <div className="space-y-4">
        {Object.values(groupedData).map(({ group, types }) => (
          <div key={group.name} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">
                {group.name} - {group.label}
              </h4>
              <div className="text-sm text-gray-600">
                平均重み: {(types.reduce((sum, t) => sum + t.currentWeight, 0) / types.length).toFixed(2)}
              </div>
            </div>

            <div className="grid gap-3">
              {types.map((data) => (
                <div key={data.mbtiType} className="flex items-center space-x-4">
                  {/* MBTIタイプラベル */}
                  <div className="w-16 text-sm font-medium text-gray-700">
                    {data.mbtiType}
                  </div>

                  {/* 重みバー */}
                  <div className="flex-1 relative">
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getBarColor(group.color)}`}
                        style={{ width: `${(data.currentWeight / maxWeight) * 100}%` }}
                      />
                      {/* 基準線（1.0） */}
                      <div
                        className="absolute top-0 h-full w-0.5 bg-gray-400"
                        style={{ left: `${(1.0 / maxWeight) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-600">
                      <span>0</span>
                      <span>1.0</span>
                      <span>{maxWeight.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* 重み値表示 */}
                  <div className={`px-2 py-1 rounded-md text-sm font-medium ${getWeightColor(data.currentWeight)}`}>
                    {data.currentWeight.toFixed(2)}
                  </div>

                  {/* 参加回数と品質 */}
                  <div className="text-sm text-gray-600 space-x-3">
                    <span>発言: {data.participationCount}回</span>
                    <span>品質: {(data.averageQuality * 100).toFixed(0)}%</span>
                  </div>

                  {/* 重み変化表示 */}
                  {data.initialWeight && (
                    <div className="text-xs">
                      {data.currentWeight > data.initialWeight ? (
                        <span className="text-green-600">
                          ↑ +{((data.currentWeight - data.initialWeight) * 100).toFixed(1)}%
                        </span>
                      ) : data.currentWeight < data.initialWeight ? (
                        <span className="text-red-600">
                          ↓ {((data.currentWeight - data.initialWeight) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-500">→ 変化なし</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 全体統計 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">重みづけ統計</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">最高重み</div>
            <div className="font-medium text-green-600">
              {Math.max(...weightData.map(d => d.currentWeight)).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-600">最低重み</div>
            <div className="font-medium text-red-600">
              {Math.min(...weightData.map(d => d.currentWeight)).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-600">平均重み</div>
            <div className="font-medium text-gray-600">
              {(weightData.reduce((sum, d) => sum + d.currentWeight, 0) / weightData.length).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-600">重み分散</div>
            <div className="font-medium text-gray-600">
              {(() => {
                const weights = weightData.map(d => d.currentWeight);
                const mean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
                const variance = weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length;
                return Math.sqrt(variance).toFixed(3);
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 重み調整の説明 */}
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
        <div className="font-medium mb-1">重みづけシステムについて:</div>
        <ul className="space-y-1 pl-4">
          <li>• 基準値1.0から、発言品質と参加バランスに基づいて動的に調整</li>
          <li>• 高品質な発言を行うエージェントの重みが増加</li>
          <li>• グラフトポロジー最適化により効率的な議論フローを実現</li>
          <li>• リアルタイム調整により議論品質を継続的に向上</li>
        </ul>
      </div>
    </div>
  );
}