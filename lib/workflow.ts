/**
 * Analyst Data Processing Workflow
 *
 * Handles webhook-triggered data processing for analyst posts:
 * - Extracts relevant data from webhooks
 * - Processes content (full vs summary based on length)
 * - Updates chart data
 * - Stores in database
 */

import { TradingPost } from '../data/mockData';
import { generateAnalysis } from './aiService';
import { redisService } from './redis';

export interface WebhookPayload {
  platform: 'discord' | 'twitter' | 'manual';
  content: string;
  author: {
    id: string;
    username: string;
    discriminator?: string;
  };
  timestamp: string;
  channel?: string;
  id: string;
}

export interface ProcessedPost extends Omit<TradingPost, 'chartData'> {
  chartData?: number[];
  contentType: 'full' | 'summary';
  originalLength: number;
  aiAnalysis?: any;
  extractedData: {
    tokens: string[];
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
  };
}

export class AnalystWorkflow {
  private readonly MAX_SHORT_POST_LENGTH = 280; // Twitter-like limit
  private readonly CHART_DATA_POINTS = 5; // Number of data points to maintain

  /**
   * MAIN WORKFLOW ENTRY POINT
   * Processes webhook data through the entire pipeline
   */
  async processWebhookData(payload: WebhookPayload): Promise<ProcessedPost> {
    console.log(`Processing ${payload.platform} webhook from ${payload.author.username}`);

    // Step 1: Extract and validate data
    const extractedData = this.extractRelevantData(payload);

    // Step 2: Process content based on length
    const processedContent = await this.processContent(payload.content, extractedData);

    // Step 3: Generate or update chart data
    const chartData = await this.updateChartData(extractedData.tokens[0], payload, extractedData);

    // Step 4: Generate AI analysis if needed
    const aiAnalysis = await this.generateAnalysisIfNeeded(processedContent, extractedData);

    // Step 5: Create final post object
    const processedPost: ProcessedPost = {
      id: payload.id,
      user: payload.author.username,
      channel: payload.channel || payload.platform,
      token: extractedData.tokens[0] || 'UNKNOWN',
      content: processedContent.content,
      timestamp: new Date(payload.timestamp),
      analysis: aiAnalysis?.summary,
      contentType: processedContent.type,
      originalLength: payload.content.length,
      aiAnalysis,
      extractedData
    };

    // Step 6: Update database
    await this.updateDatabase(processedPost);

    // Step 7: Trigger real-time updates
    await this.triggerRealtimeUpdates(processedPost);

    return processedPost;
  }

  /**
   * STEP 1: EXTRACT RELEVANT DATA
   * Parses content to find tokens, sentiment, and key information
   */
  private extractRelevantData(payload: WebhookPayload) {
    const content = payload.content.toLowerCase();

    // Extract token symbols ($BTC, $ETH, etc.)
    const tokenRegex = /\$([A-Z]{2,10})/g;
    const tokens = [];
    let match;
    while ((match = tokenRegex.exec(content)) !== null) {
      tokens.push(match[1]);
    }

    // Fallback: look for token mentions without $
    if (tokens.length === 0) {
      const commonTokens = ['BTC', 'ETH', 'ADA', 'SOL', 'DOGE', 'LINK', 'UNI', 'AVAX', 'MATIC', 'DOT'];
      for (const token of commonTokens) {
        if (content.includes(token.toLowerCase())) {
          tokens.push(token);
          break; // Take first match
        }
      }
    }

    // Basic sentiment analysis
    const bullishWords = ['bullish', 'buy', 'long', 'up', 'breakout', 'target', 'accumulation', 'strong'];
    const bearishWords = ['bearish', 'sell', 'short', 'down', 'reversal', 'caution', 'distribution', 'weak'];

    let bullishCount = bullishWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
    let bearishCount = bearishWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);

    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let confidence = 0.5;

    if (bullishCount > bearishCount) {
      sentiment = 'bullish';
      confidence = Math.min(0.9, 0.5 + (bullishCount - bearishCount) * 0.1);
    } else if (bearishCount > bullishCount) {
      sentiment = 'bearish';
      confidence = Math.min(0.9, 0.5 + (bearishCount - bullishCount) * 0.1);
    }

    return {
      tokens: tokens.length > 0 ? tokens : ['UNKNOWN'],
      sentiment,
      confidence,
      author: payload.author,
      platform: payload.platform
    };
  }

  /**
   * STEP 2: PROCESS CONTENT
   * Decides whether to store full content or generate summary
   */
  private async processContent(content: string, extractedData: any) {
    const isShort = content.length <= this.MAX_SHORT_POST_LENGTH;

    if (isShort) {
      // Store full content for short posts
      return {
        content: content.trim(),
        type: 'full' as const,
        summary: null
      };
    } else {
      // Generate summary for long posts
      const summary = await this.generateSummary(content, extractedData);
      return {
        content: summary,
        type: 'summary' as const,
        summary: content // Store original for reference
      };
    }
  }

  /**
   * GENERATE SUMMARY FOR LONG POSTS
   */
  private async generateSummary(content: string, extractedData: any): Promise<string> {
    // For now, use simple extraction. In production, use AI.
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);

    // Try to find the most relevant sentence
    let bestSentence = sentences[0]?.trim();

    // Look for sentences with token mentions or key terms
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (extractedData.tokens.some((token: string) => lowerSentence.includes(token.toLowerCase()))) {
        bestSentence = sentence.trim();
        break;
      }
    }

    // Truncate if too long
    if (bestSentence && bestSentence.length > 200) {
      bestSentence = bestSentence.substring(0, 197) + '...';
    }

    return bestSentence || 'Analysis summary not available';
  }

  /**
   * STEP 3: UPDATE CHART DATA
   * Extracts or generates chart data points
   */
  private async updateChartData(token: string, payload: WebhookPayload, extractedData: any): Promise<number[]> {
    // Extract price data from content (e.g., "$58,750", "$1950")
    const priceRegex = /\$[\d,]+(?:\.\d+)?/g;
    const prices: number[] = [];

    let match;
    while ((match = priceRegex.exec(payload.content)) !== null) {
      const priceStr = match[0].replace(/[$,]/g, '');
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        prices.push(price);
      }
    }

    // If we found prices, use them as chart data
    if (prices.length >= 2) {
      return prices.slice(-this.CHART_DATA_POINTS); // Take last N prices
    }

    // Fallback: generate mock chart data based on sentiment
    const basePrice = this.getBasePriceForToken(token);
    const volatility = payload.content.toLowerCase().includes('volatile') ? 0.05 : 0.02;

    const chartData = [];
    let currentPrice = basePrice;

    for (let i = 0; i < this.CHART_DATA_POINTS; i++) {
      // Random walk with sentiment bias
      const randomChange = (Math.random() - 0.5) * volatility;
      const sentimentBias = extractedData.sentiment === 'bullish' ? 0.01 :
                           extractedData.sentiment === 'bearish' ? -0.01 : 0;

      currentPrice *= (1 + randomChange + sentimentBias);
      chartData.push(Math.round(currentPrice * 100) / 100);
    }

    return chartData;
  }

  /**
   * GET BASE PRICE FOR TOKEN
   */
  private getBasePriceForToken(token: string): number {
    const basePrices: Record<string, number> = {
      'BTC': 58750,
      'ETH': 1950,
      'ADA': 0.42,
      'SOL': 29.80,
      'DOGE': 0.078,
      'LINK': 9.20,
      'UNI': 5.40,
      'AVAX': 14.60,
      'MATIC': 0.98,
      'DOT': 5.60
    };

    return basePrices[token] || 100; // Default fallback
  }

  /**
   * STEP 4: GENERATE AI ANALYSIS IF NEEDED
   */
  private async generateAnalysisIfNeeded(processedContent: any, extractedData: any) {
    // Generate AI analysis for posts with clear trading signals
    const hasTradingSignals = extractedData.confidence > 0.6;
    const isLongPost = processedContent.type === 'summary';

    if (hasTradingSignals || isLongPost) {
      try {
        return await generateAnalysis(
          processedContent.content,
          extractedData.tokens[0],
          extractedData.author.username
        );
      } catch (error) {
        console.error('AI analysis failed:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * STEP 5: UPDATE DATABASE
   */
  private async updateDatabase(post: ProcessedPost): Promise<void> {
    try {
      await redisService.storePost(post);

      console.log('Updated Redis database with post:', {
        id: post.id,
        token: post.token,
        user: post.user,
        contentType: post.contentType,
        sentiment: post.extractedData.sentiment,
        hasChartData: !!post.chartData
      });
    } catch (error) {
      console.error('Failed to update database:', error);
      throw error;
    }
  }

  /**
   * STEP 6: TRIGGER REAL-TIME UPDATES
   */
  private async triggerRealtimeUpdates(post: ProcessedPost): Promise<void> {
    // Set cache invalidation flags in Redis
    await redisService.invalidateTokenCache(post.token);
    await redisService.invalidateStatsCache();

    console.log('Triggered real-time updates for token:', post.token);
  }
}

// Export singleton instance
export const analystWorkflow = new AnalystWorkflow();