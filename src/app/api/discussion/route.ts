import { NextRequest, NextResponse } from 'next/server';
import { DiscussionConfig, DiscussionResult, ApiResponse } from '@/types/m-ads';

/**
 * M-ADS議論実行API
 * Mastraワークフローを実行し、結果を返す
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<DiscussionResult>>> {
  try {
    console.log('🚀 M-ADS議論API開始');
    
    // リクエストボディを解析
    const config: DiscussionConfig = await request.json();
    console.log('📊 議論設定:', config);

    // バリデーション
    if (!config.topic || config.topic.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'トピックは必須です',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    if (config.participantCount < 4 || config.participantCount > 16) {
      return NextResponse.json({
        success: false,
        error: '参加者数は4-16の範囲で指定してください',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // TODO: Mastraワークフローとの統合
    // 現在はモックデータを返す
    const mockResult: DiscussionResult = {
      topic: config.topic,
      participantTypes: ['INTJ', 'ENFP', 'ISTP', 'ESFJ'],
      totalStatements: 24,
      totalTurns: 4,
      conversationFlow: [
        {
          turnNumber: 1,
          speakerAgentId: 'node-INTJ',
          speakerMbtiType: 'INTJ',
          statement: `${config.topic}について戦略的な視点から分析すると...`,
          timestamp: new Date().toISOString(),
          confidence: 0.85,
          relevance: 0.90,
          dynamicWeight: 1.2,
          qualityContribution: 0.88,
          sevenDimensionEvaluation: {
            performance: 0.85,
            psychological: 0.90,
            externalAlignment: 0.82,
            internalConsistency: 0.88,
            socialDecisionMaking: 0.75,
            contentQuality: 0.87,
            ethics: 0.92,
            overallQuality: 0.86
          },
          realtimeOptimization: {
            weightAdjustment: 0.1,
            graphOptimization: false,
            qualityImprovement: 0.05
          }
        },
        {
          turnNumber: 2,
          speakerAgentId: 'node-ENFP',
          speakerMbtiType: 'ENFP',
          statement: `それは素晴らしい視点ですね！人間的な側面から考えると...`,
          timestamp: new Date().toISOString(),
          confidence: 0.92,
          relevance: 0.88,
          dynamicWeight: 1.1,
          qualityContribution: 0.90,
          sevenDimensionEvaluation: {
            performance: 0.88,
            psychological: 0.95,
            externalAlignment: 0.85,
            internalConsistency: 0.87,
            socialDecisionMaking: 0.92,
            contentQuality: 0.89,
            ethics: 0.94,
            overallQuality: 0.90
          },
          realtimeOptimization: {
            weightAdjustment: 0.05,
            graphOptimization: true,
            qualityImprovement: 0.08
          }
        }
      ],
      comprehensiveMetrics: {
        performanceScore: 0.86,
        psychologicalScore: 0.92,
        externalAlignmentScore: 0.84,
        internalConsistencyScore: 0.88,
        socialDecisionScore: 0.84,
        contentQualityScore: 0.88,
        ethicsScore: 0.93,
        diversityScore: 0.85,
        consistencyScore: 0.82,
        convergenceEfficiency: 0.79,
        mbtiAlignmentScore: 0.91,
        interactionQuality: 0.87,
        argumentQuality: 0.86,
        participationBalance: 0.78,
        resolutionRate: 0.81
      },
      realtimeOptimization: {
        optimizationCount: 3,
        qualityImprovement: 0.12,
        weightAdjustments: {
          'INTJ': 1.2,
          'ENFP': 1.1,
          'ISTP': 0.9,
          'ESFJ': 1.0
        },
        graphOptimizations: 2,
        recommendations: [
          'INTJの分析力を活用して議論の方向性を明確化',
          'ENFPの創造性で新しいアイデアを促進',
          'ISTPの実践的視点を重要な意思決定段階で活用'
        ]
      },
      advancedReport: {
        summary: `${config.topic}に関する議論で優秀な結果を達成しました。`,
        strengths: [
          '多様な視点からの包括的分析',
          '高い心理的適合性とMBTI特性の再現',
          '建設的な対話と合意形成'
        ],
        weaknesses: [
          '議論の収束に若干の改善余地',
          '参加バランスの最適化が可能'
        ],
        overallScore: 0.86,
        grade: 'A-',
        detailedAnalysis: '7次元品質評価で高スコアを記録。特に心理的適合性と倫理性で優秀な結果。',
        mbtiTypeAnalysis: {
          'INTJ': {
            participationRate: 0.25,
            qualityContribution: 0.88,
            characteristicAlignment: 0.91
          },
          'ENFP': {
            participationRate: 0.25,
            qualityContribution: 0.90,
            characteristicAlignment: 0.95
          },
          'ISTP': {
            participationRate: 0.25,
            qualityContribution: 0.82,
            characteristicAlignment: 0.87
          },
          'ESFJ': {
            participationRate: 0.25,
            qualityContribution: 0.85,
            characteristicAlignment: 0.89
          }
        }
      },
      discussionSummary: {
        overview: `${config.topic}について4つのMBTIタイプが活発な議論を展開し、建設的な合意形成に成功しました。`,
        keyThemes: ['戦略的分析', '人間中心の視点', '実践的アプローチ', '調和的統合'],
        progressAnalysis: '段階的な議論の深化と各タイプの特性を活かした貢献が見られました。',
        mbtiContributions: {
          'INTJ': '戦略的フレームワークの提供と長期的視点の導入',
          'ENFP': '創造的アイデアと人間的価値観の強調',
          'ISTP': '実践的解決策と現実的制約の考慮',
          'ESFJ': '調和的統合と全体的バランスの維持'
        },
        consensus: '多角的な分析を通じて実現可能性の高い合意案を形成',
        insights: [
          'MBTIタイプの多様性が議論の質を向上させる',
          'リアルタイム最適化により効率的な合意形成が可能',
          '7次元評価により包括的な品質管理を実現'
        ],
        processCharacteristics: [
          '段階的な議論の深化',
          '各タイプの強みを活かした役割分担',
          'リアルタイム調整による品質向上'
        ]
      }
    };

    console.log('✅ M-ADS議論完了');
    
    return NextResponse.json({
      success: true,
      data: mockResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ M-ADS議論API エラー:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '内部サーバーエラー',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * 議論設定の取得API
 */
export async function GET(): Promise<NextResponse<ApiResponse<{ availableTypes: string[], defaultConfig: Partial<DiscussionConfig> }>>> {
  return NextResponse.json({
    success: true,
    data: {
      availableTypes: [
        'INTJ', 'INTP', 'ENTJ', 'ENTP',  // NT (Rational)
        'INFJ', 'INFP', 'ENFJ', 'ENFP',  // NF (Idealist)
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',  // SJ (Guardian)
        'ISTP', 'ISFP', 'ESTP', 'ESFP'   // SP (Artisan)
      ],
      defaultConfig: {
        participantCount: 8,
        enableRealtimeOptimization: true,
        enableGraphOptimization: true,
        qualityThreshold: 0.8,
        saveConversation: false,
        outputFormat: 'markdown',
        outputDirectory: './conversations'
      }
    },
    timestamp: new Date().toISOString()
  });
}