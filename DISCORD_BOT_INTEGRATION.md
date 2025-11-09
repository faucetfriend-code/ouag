# Discord Bot Integration Guide

This document explains how to integrate the Unity Oracle Aggregator tools with a Discord bot to fetch real-time cryptocurrency data.

## Overview

The tools section supports integration with Discord bots to display real-time trading data. Each tool sends requests to API endpoints that can be configured to communicate with your Discord bot.

## Architecture

```
User clicks timeframe button
  ↓
Frontend sends request to API route
  ↓
API route calls Discord bot webhook
  ↓
Discord bot processes request and returns data
  ↓
API route formats data and sends to frontend
  ↓
Frontend displays data to user
```

## Implemented Tools

### 1. Top Gainers & Losers (`/tools/gainers-losers`)

**Purpose:** Show top gaining and losing cryptocurrencies for USDT perpetual contracts

**Timeframes:** 5m, 15m, 1h, 4h, 1d

**Request Format:**
```typescript
GET /api/tools/gainers-losers?timeframe=5m&type=gainers
```

**Parameters:**
- `timeframe`: `'5m' | '15m' | '1h' | '4h' | '1d'`
- `type`: `'gainers' | 'losers'`

**Expected Response:**
```json
{
  "success": true,
  "timeframe": "5m",
  "type": "gainers",
  "data": [
    {
      "token": "BTC",
      "price": "$98,245.50",
      "change": "2.96%"
    }
  ],
  "timestamp": "2025-11-08T12:00:00Z"
}
```

---

### 2. Top Volume (`/tools/top-volume`)

**Purpose:** Show cryptocurrencies with highest volume inflows/outflows

**Timeframes:** 5m, 15m, 1h, 4h, 1d

**Request Format:**
```typescript
GET /api/tools/top-volume?timeframe=5m&flow=inflows
```

**Parameters:**
- `timeframe`: `'5m' | '15m' | '1h' | '4h' | '1d'`
- `flow`: `'inflows' | 'outflows'`

**Expected Response:**
```json
{
  "success": true,
  "timeframe": "5m",
  "flow": "inflows",
  "data": [
    {
      "token": "BTC",
      "price": "$98,245.50",
      "volume": "$2.4B"
    }
  ],
  "timestamp": "2025-11-08T12:00:00Z"
}
```

---

### 3. Funding Rates (`/tools/funding-rates`)

**Purpose:** Show perpetual futures funding rates across exchanges

**Request Format:**
```typescript
GET /api/tools/funding-rates?type=positive
```

**Parameters:**
- `type`: `'positive' | 'negative'`

**Expected Response:**
```json
{
  "success": true,
  "type": "positive",
  "data": [
    {
      "token": "BTC/USDT",
      "exchange": "Binance",
      "rate": "0.0100%",
      "nextFunding": "4:00 PM",
      "predicted": "0.0098%"
    }
  ],
  "timestamp": "2025-11-08T12:00:00Z"
}
```

---

### 4. Volatility (Planned)

**Purpose:** Show bullish/bearish volatility alerts with price action analysis

**Types:** Bullish, Bearish

**Expected Output:**
- Fast Move Alerts
- Big Move Alerts
- Price, Change, Ticks, Volume
- Chart visualization

---

### 5. Oracle Alerts (Planned)

**Purpose:** Market structure breaks and delta volume alerts

**Alert Types:**
- Bullish/Bearish Market Structure Breaks
- Delta Volume Oscillator signals

**Format:** RSS-style feed with continuous updates

---

### 6. Watchlist (Planned)

**Purpose:** User-customizable watchlist for specific tokens

---

## Discord Bot Setup

### Environment Variables

Add these to your `.env.local` file:

```bash
# Discord Bot Webhook URLs
DISCORD_TOOLS_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN

# Or separate webhooks per tool
DISCORD_GAINERS_LOSERS_WEBHOOK=https://discord.com/api/webhooks/...
DISCORD_TOP_VOLUME_WEBHOOK=https://discord.com/api/webhooks/...
DISCORD_FUNDING_RATES_WEBHOOK=https://discord.com/api/webhooks/...
```

### Implementation Steps

#### Option 1: Webhook Integration

1. **Create Discord Webhook:**
   ```
   Discord Server → Channel Settings → Integrations → Webhooks → New Webhook
   ```

2. **Update API Route:**

   Edit `/app/api/tools/gainers-losers/route.ts`:

   ```typescript
   export async function GET(request: NextRequest) {
     const searchParams = request.nextUrl.searchParams;
     const timeframe = searchParams.get('timeframe') || '5m';
     const type = searchParams.get('type') || 'gainers';

     const webhookUrl = process.env.DISCORD_GAINERS_LOSERS_WEBHOOK;

     const response = await fetch(webhookUrl, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         content: `Fetch ${type} for ${timeframe}`,
         embeds: [{
           title: `Top ${type} Request`,
           fields: [
             { name: 'Timeframe', value: timeframe },
             { name: 'Type', value: type }
           ]
         }]
       })
     });

     // Process bot response
     const data = await response.json();

     return NextResponse.json({
       success: true,
       timeframe,
       type,
       data: processDiscordResponse(data),
       timestamp: new Date().toISOString()
     });
   }
   ```

#### Option 2: Discord Bot Commands

1. **Create Discord Bot:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create New Application
   - Add Bot
   - Get Bot Token

2. **Bot Commands:**

   Example Discord.js bot command structure:

   ```javascript
   // Discord Bot (Discord.js)
   client.on('interactionCreate', async interaction => {
     if (interaction.commandName === 'gainers') {
       const timeframe = interaction.options.getString('timeframe');

       // Fetch data from your data source
       const data = await fetchGainersData(timeframe);

       // Format response
       const embed = {
         title: `Top Gainers (${timeframe})`,
         fields: data.map(item => ({
           name: item.token,
           value: `Price: ${item.price} | Change: ${item.change}`,
           inline: true
         }))
       };

       await interaction.reply({ embeds: [embed] });
     }
   });
   ```

3. **API Integration:**

   Your API routes can trigger bot commands via webhook or REST API:

   ```typescript
   const response = await fetch('https://discord.com/api/v10/webhooks/...', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
     },
     body: JSON.stringify({
       tool: 'gainers-losers',
       timeframe,
       type
     })
   });
   ```

#### Option 3: Direct Database Integration

If your Discord bot stores data in a database:

```typescript
import { createClient } from '@supabase/supabase-js';
// or MongoDB, PostgreSQL, etc.

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function GET(request: NextRequest) {
  const timeframe = request.nextUrl.searchParams.get('timeframe');
  const type = request.nextUrl.searchParams.get('type');

  const { data, error } = await supabase
    .from('market_data')
    .select('*')
    .eq('timeframe', timeframe)
    .eq('type', type)
    .order('change', { ascending: false })
    .limit(10);

  return NextResponse.json({ success: true, data });
}
```

---

## RSS Feed Implementation

For tools like **Oracle Alerts** that function as RSS feeds:

### Server-Sent Events (SSE)

```typescript
// app/api/tools/oracle-alerts/stream/route.ts
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Subscribe to Discord bot events
      const subscription = await subscribeToAlerts();

      subscription.on('alert', (alert) => {
        const data = `data: ${JSON.stringify(alert)}\n\n`;
        controller.enqueue(encoder.encode(data));
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Frontend Consumption

```typescript
useEffect(() => {
  const eventSource = new EventSource('/api/tools/oracle-alerts/stream');

  eventSource.onmessage = (event) => {
    const alert = JSON.parse(event.data);
    setAlerts(prev => [alert, ...prev]);
  };

  return () => eventSource.close();
}, []);
```

---

## Testing

### Mock Data

All API routes currently use mock data. Test the UI flow:

```bash
npm run dev:local
# Visit http://localhost:3000/tools/gainers-losers
# Click timeframe buttons to see mock data display
```

### Replace Mock Data

Once your Discord bot is ready:

1. Update environment variables
2. Replace mock data in API routes
3. Test with real Discord webhook
4. Monitor console for errors

### Example Test Request

```bash
curl http://localhost:3000/api/tools/gainers-losers?timeframe=5m&type=gainers
```

---

## Data Flow Summary

| Tool | Frontend | API Route | Discord Bot | Output |
|------|----------|-----------|-------------|---------|
| Gainers/Losers | Timeframe + Type | `/api/tools/gainers-losers` | Fetch top movers | Table display |
| Top Volume | Timeframe + Flow | `/api/tools/top-volume` | Fetch volume data | Table display |
| Funding Rates | Rate Type | `/api/tools/funding-rates` | Fetch funding rates | Card grid |
| Volatility | Type (Bullish/Bearish) | `/api/tools/volatility` | Fetch alerts | Alert cards with charts |
| Oracle Alerts | RSS Stream | `/api/tools/oracle-alerts/stream` | SSE subscription | Live feed |

---

## Security Considerations

1. **Rate Limiting:** Implement rate limiting on API routes to prevent abuse
2. **Authentication:** Consider requiring authentication for tool access
3. **Webhook Validation:** Validate Discord webhook signatures
4. **Environment Variables:** Never commit webhook URLs or bot tokens to git
5. **CORS:** Configure CORS properly if bot runs on different domain

---

## Next Steps

1. Set up Discord bot with desired commands
2. Configure webhook URLs in `.env.local`
3. Update API routes to replace mock data
4. Test integration thoroughly
5. Monitor performance and add caching if needed
6. Implement error handling and fallbacks
7. Add logging for debugging

---

## Support

For questions or issues:
- Discord: discord.gg/unityacademy
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)

