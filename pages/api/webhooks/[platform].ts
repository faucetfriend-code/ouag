/**
 * Webhook Handler for Analyst Data
 *
 * Receives webhook data from various platforms and processes it through the analyst workflow.
 * Supports Discord, Twitter, and manual submissions.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { analystWorkflow, WebhookPayload } from '../../../lib/workflow';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { platform } = req.query;

  if (!platform || typeof platform !== 'string') {
    return res.status(400).json({ error: 'Platform parameter required' });
  }

  try {
    // Validate webhook authenticity (simplified for demo)
    const isValid = await validateWebhook(req, platform);
    if (!isValid) {
      console.warn(`Invalid webhook signature for ${platform}`);
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Parse webhook payload based on platform
    const payload = parseWebhookPayload(req.body, platform);

    if (!payload) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Process through workflow
    const processedPost = await analystWorkflow.processWebhookData(payload);

    console.log(`Successfully processed ${platform} webhook:`, {
      postId: processedPost.id,
      token: processedPost.token,
      contentType: processedPost.contentType,
      sentiment: processedPost.extractedData.sentiment
    });

    res.status(200).json({
      success: true,
      postId: processedPost.id,
      token: processedPost.token,
      contentType: processedPost.contentType,
      sentiment: processedPost.extractedData.sentiment,
      processed: true
    });

  } catch (error) {
    console.error(`Webhook processing error for ${platform}:`, error);
    res.status(500).json({
      error: 'Internal server error',
      platform,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * VALIDATE WEBHOOK AUTHENTICITY
 * In production, implement proper signature verification
 */
async function validateWebhook(req: NextApiRequest, platform: string): Promise<boolean> {
  // Simplified validation - in production, verify signatures
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.WEBHOOK_SECRET;

  if (!expectedToken) {
    console.warn('WEBHOOK_SECRET not configured');
    return true; // Allow for development
  }

  return authHeader === `Bearer ${expectedToken}`;
}

/**
 * PARSE WEBHOOK PAYLOAD
 * Convert platform-specific payload to standardized format
 */
function parseWebhookPayload(body: any, platform: string): WebhookPayload | null {
  try {
    switch (platform.toLowerCase()) {
      case 'discord':
        return parseDiscordPayload(body);

      case 'twitter':
        return parseTwitterPayload(body);

      case 'manual':
        return parseManualPayload(body);

      default:
        console.warn(`Unknown platform: ${platform}`);
        return null;
    }
  } catch (error) {
    console.error(`Error parsing ${platform} payload:`, error);
    return null;
  }
}

/**
 * PARSE DISCORD WEBHOOK PAYLOAD
 */
function parseDiscordPayload(body: any): WebhookPayload | null {
  if (!body || !body.author || !body.content) {
    return null;
  }

  return {
    platform: 'discord',
    content: body.content,
    author: {
      id: body.author.id,
      username: body.author.username,
      discriminator: body.author.discriminator || '0000'
    },
    timestamp: body.timestamp,
    channel: body.channel_id,
    id: body.id
  };
}

/**
 * PARSE TWITTER WEBHOOK PAYLOAD
 */
function parseTwitterPayload(body: any): WebhookPayload | null {
  if (!body || !body.author || !body.text) {
    return null;
  }

  return {
    platform: 'twitter',
    content: body.text,
    author: {
      id: body.author.id,
      username: body.author.username
    },
    timestamp: body.created_at,
    id: body.id
  };
}

/**
 * PARSE MANUAL SUBMISSION PAYLOAD
 */
function parseManualPayload(body: any): WebhookPayload | null {
  if (!body || !body.analyst_id || !body.content || !body.token) {
    return null;
  }

  return {
    platform: 'manual',
    content: body.content,
    author: {
      id: body.analyst_id,
      username: body.analyst_name || `analyst_${body.analyst_id}`,
      discriminator: undefined
    },
    timestamp: body.timestamp || new Date().toISOString(),
    channel: body.channel || 'manual',
    id: body.id || `manual_${Date.now()}`
  };
}