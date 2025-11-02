# Webhook Integration Guide

This document outlines how to integrate webhooks for receiving analyst updates from external platforms.

## Overview

Webhooks allow real-time data flow from analyst sources (Discord, Twitter, etc.) to update the Unity Oracle Aggregator with fresh trading insights and analysis.

## Supported Platforms

### Discord Webhooks

**Setup:**
1. Create a Discord bot with appropriate permissions
2. Configure webhook URLs in Discord Developer Portal
3. Set bot intents for message events

**Endpoint:** `POST /api/webhooks/discord`

**Required Permissions:**
- `bot` scope
- `messages.read` intent
- `guilds.read` intent

### Twitter Webhooks

**Setup:**
1. Create Twitter Developer account
2. Set up Account Activity API
3. Configure webhook URLs

**Endpoint:** `POST /api/webhooks/twitter`

### Manual Analyst Submissions

**Endpoint:** `POST /api/webhooks/manual`

For analysts who prefer direct API submissions.

## Webhook Payload Formats

### Discord Message Event

```json
{
  "type": 0,
  "tts": false,
  "timestamp": "2023-10-01T10:00:00.000Z",
  "pinned": false,
  "mentions": [],
  "mention_roles": [],
  "mention_everyone": false,
  "id": "1234567890123456789",
  "flags": 0,
  "embeds": [],
  "edited_timestamp": null,
  "content": "$BTC showing strong bullish signals above $58k resistance.",
  "components": [],
  "channel_id": "9876543210987654321",
  "author": {
    "username": "crypto_analyst",
    "discriminator": "1234",
    "id": "1111111111111111111",
    "avatar": "avatar_hash",
    "bot": false
  },
  "attachments": []
}
```

### Twitter Tweet Event

```json
{
  "id": "1234567890123456789",
  "text": "$ETH breaking out of consolidation. Target $2100 #Ethereum",
  "created_at": "2023-10-01T10:00:00.000Z",
  "author_id": "1111111111111111111",
  "author": {
    "username": "crypto_analyst",
    "name": "Crypto Analyst",
    "id": "1111111111111111111"
  },
  "entities": {
    "hashtags": ["Ethereum"],
    "symbols": ["ETH"]
  }
}
```

### Manual Submission

```json
{
  "analyst_id": "analyst_123",
  "token": "BTC",
  "content": "BTC analysis content here",
  "analysis": "Optional pre-written analysis",
  "timestamp": "2023-10-01T10:00:00.000Z",
  "platform": "manual"
}
```

## API Endpoint Implementation

### Base Webhook Handler

```typescript
// /api/webhooks/[platform].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { validateWebhook, processWebhookData } from '../../../lib/webhookUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate webhook authenticity
    const isValid = await validateWebhook(req, req.query.platform as string);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Process the webhook data
    const result = await processWebhookData(req.body, req.query.platform as string);

    res.status(200).json({ success: true, processed: result });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Security & Validation

### Discord Webhook Validation

```typescript
function validateDiscordWebhook(request: NextApiRequest): boolean {
  const signature = request.headers['x-signature-ed25519'];
  const timestamp = request.headers['x-signature-timestamp'];
  const body = JSON.stringify(request.body);

  // Verify using Discord's public key
  return verify(signature, timestamp + body, DISCORD_PUBLIC_KEY);
}
```

### Twitter Webhook Validation

```typescript
function validateTwitterWebhook(request: NextApiRequest): boolean {
  const signature = request.headers['x-twitter-webhooks-signature'];
  const body = JSON.stringify(request.body);

  // Verify using Twitter consumer secret
  return verify(signature, body, TWITTER_CONSUMER_SECRET);
}
```

## Data Processing Flow

1. **Receive Webhook**
2. **Validate Authenticity**
3. **Parse Content**
   - Extract token symbols ($BTC, $ETH, etc.)
   - Identify analyst information
   - Clean and normalize text
4. **Generate Analysis** (see SUMINT.md)
5. **Store in Database**
6. **Trigger Real-time Updates**
7. **Send Confirmation**

## Error Handling

- **Invalid Signatures**: 401 Unauthorized
- **Malformed Data**: 400 Bad Request
- **Server Errors**: 500 Internal Server Error
- **Rate Limiting**: 429 Too Many Requests

## Monitoring & Logging

- Log all webhook attempts
- Track processing success/failure rates
- Monitor latency and throughput
- Alert on authentication failures

## Testing

Use tools like:
- ngrok for local webhook testing
- Discord webhook testing tools
- Twitter API testing sandbox

## Environment Variables

```env
DISCORD_PUBLIC_KEY=your_discord_public_key
DISCORD_BOT_TOKEN=your_bot_token
TWITTER_CONSUMER_KEY=your_consumer_key
TWITTER_CONSUMER_SECRET=your_consumer_secret
WEBHOOK_SECRET=your_webhook_secret
```</content>
</xai:function_call">WEBHOOK.md