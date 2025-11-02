/**
 * External Analysis Update API
 *
 * Allows external services to update AI analysis for processed posts.
 * Used for asynchronous summary generation.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { redisService } from '../../../../lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postId } = req.query;

  if (!postId || typeof postId !== 'string') {
    return res.status(400).json({ error: 'Post ID required' });
  }

  try {
    // Validate webhook authenticity (simplified)
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.ANALYSIS_UPDATE_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return res.status(401).json({ error: 'Invalid authorization' });
    }

    // Validate analysis data
    const { analysis, sentiment, confidence, keyPoints, priceTargets, summary } = req.body;

    if (!analysis && !summary) {
      return res.status(400).json({ error: 'Analysis data required' });
    }

    // Prepare analysis object
    const analysisData = {
      sentiment: sentiment || 'neutral',
      confidence: confidence || 0.5,
      keyPoints: Array.isArray(keyPoints) ? keyPoints : [],
      priceTargets: Array.isArray(priceTargets) ? priceTargets : undefined,
      timeframes: ['short-term'], // Default
      summary: summary || analysis || 'Analysis updated externally'
    };

    // Update the post analysis in Redis
    await redisService.updatePostAnalysis(postId, analysisData);

    console.log(`Updated analysis for post ${postId}`);

    res.status(200).json({
      success: true,
      postId,
      updated: true,
      analysis: analysisData
    });

  } catch (error) {
    console.error(`Analysis update error for post ${postId}:`, error);
    res.status(500).json({
      error: 'Internal server error',
      postId
    });
  }
}