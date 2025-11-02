# Analyst Data Processing Workflow

This document describes the automated workflow for processing analyst posts from webhooks, extracting relevant data, and updating the database with appropriate content and chart data.

## Overview

The workflow automatically processes incoming analyst posts through a multi-step pipeline:

1. **Webhook Reception** → Extract relevant data
2. **Content Processing** → Full content or AI-generated summary
3. **Chart Data Integration** → Update price data points
4. **Database Storage** → Persist processed data
5. **Real-time Updates** → Notify connected clients

## Architecture

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Webhook   │───▶│   Data Parser   │───▶│ Content Processor│
│  (Discord/  │    │                 │    │                 │
│   Twitter)  │    └─────────────────┘    └─────────────────┘
└─────────────┘             │                        │
                           ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Chart Data      │    │   AI Analysis   │    │   Database      │
│ Integration     │    │   (Optional)    │    │   Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                           │                        │
                           └────────────────────────┘
                                    │
                                    ▼
┌─────────────────┐    ┌─────────────────┐
│ Real-time       │    │   UI Update     │
│ Notifications   │    │                 │
└─────────────────┘    └─────────────────┘
```

## Key Features

### Intelligent Content Processing

- **Short Posts** (< 280 chars): Store full content
- **Long Posts** (> 280 chars): Generate concise summaries
- **AI Enhancement**: Optional AI analysis for complex posts

### Smart Data Extraction

- **Token Detection**: Automatic $TOKEN symbol recognition
- **Sentiment Analysis**: Bullish/bearish/neutral classification
- **Price Target Extraction**: Identify mentioned price levels
- **Confidence Scoring**: Rate analysis certainty

### Chart Data Management

- **Price Point Extraction**: Parse $XX,XXX price mentions
- **Data Point Updates**: Maintain rolling 5-point charts
- **Sentiment-Based Generation**: Fallback chart generation
- **Historical Replacement**: Update with newest data

## API Endpoints

### Webhook Handler
```
POST /api/webhooks/[platform]
```

**Platforms Supported:**
- `discord` - Discord message events
- `twitter` - Twitter tweet events
- `manual` - Direct analyst submissions

**Authentication:**
```bash
Authorization: Bearer <WEBHOOK_SECRET>
```

## Data Flow Example

### Input (Discord Webhook)
```json
{
  "id": "123456789",
  "content": "$BTC breaking key resistance at $59,500. Strong bullish momentum with volume confirmation.",
  "author": {
    "username": "btc_analyst",
    "id": "987654321"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "channel_id": "btc-analysis"
}
```

### Processing Steps

1. **Extract Data**
   ```javascript
   {
     tokens: ["BTC"],
     sentiment: "bullish",
     confidence: 0.8
   }
   ```

2. **Process Content**
   ```javascript
   {
     content: "$BTC breaking key resistance at $59,500. Strong bullish momentum with volume confirmation.",
     type: "full",
     originalLength: 85
   }
   ```

3. **Update Chart Data**
   ```javascript
   [58500, 58750, 59000, 59250, 59500] // Extracted from content
   ```

4. **Generate AI Analysis** (if confidence > 0.6)
   ```javascript
   {
     sentiment: "bullish",
     confidence: 0.85,
     summary: "BTC showing strong upward momentum with resistance breakout",
     keyPoints: ["Resistance breakout at $59,500", "Volume confirmation present"]
   }
   ```

### Output (Database Record)
```json
{
  "id": "123456789",
  "user": "btc_analyst",
  "token": "BTC",
  "content": "$BTC breaking key resistance at $59,500. Strong bullish momentum with volume confirmation.",
  "contentType": "full",
  "extractedData": {
    "tokens": ["BTC"],
    "sentiment": "bullish",
    "confidence": 0.8
  },
  "aiAnalysis": {
    "sentiment": "bullish",
    "confidence": 0.85,
    "summary": "BTC showing strong upward momentum with resistance breakout"
  },
  "chartData": [58500, 58750, 59000, 59250, 59500],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Configuration

### Environment Variables

```env
WEBHOOK_SECRET=your_webhook_secret_here
AI_ENABLED=true
MAX_SHORT_POST_LENGTH=280
CHART_DATA_POINTS=5
```

### Content Processing Rules

- **Short Posts**: Length ≤ `MAX_SHORT_POST_LENGTH`
- **AI Analysis Trigger**: Confidence > 0.6 OR long post
- **Chart Updates**: Replace oldest data points with new ones
- **Token Fallback**: Search for common tokens if $SYMBOL not found

## Testing

Run the test script to verify workflow functionality:

```bash
node test-workflow.js
```

This will process sample payloads and show the complete workflow execution.

## Integration Points

### Database Schema Updates

```sql
-- Add new columns to trading_posts table
ALTER TABLE trading_posts ADD COLUMN content_type ENUM('full', 'summary');
ALTER TABLE trading_posts ADD COLUMN original_length INT;
ALTER TABLE trading_posts ADD COLUMN ai_analysis JSON;
ALTER TABLE trading_posts ADD COLUMN extracted_data JSON;

-- Chart data table
CREATE TABLE chart_data (
  token VARCHAR(10) PRIMARY KEY,
  data_points JSON,
  last_updated TIMESTAMP
);
```

### Real-time Updates

```javascript
// WebSocket integration
io.emit('new-analysis', {
  token: processedPost.token,
  post: processedPost,
  chartData: processedPost.chartData
});
```

## Monitoring & Logging

- **Success Rates**: Track webhook processing success
- **Content Types**: Monitor full vs summary ratios
- **AI Usage**: Log AI analysis generation
- **Performance**: Monitor processing latency
- **Errors**: Alert on processing failures

## Future Enhancements

- **Multi-token Posts**: Handle posts mentioning multiple tokens
- **Advanced AI**: Custom fine-tuned models for crypto analysis
- **Real-time Validation**: Cross-reference with market data
- **Collaborative Analysis**: Multiple analysts on same token
- **Historical Analysis**: Trend analysis over time
- **Risk Scoring**: Dynamic risk assessment based on market conditions

## Troubleshooting

### Common Issues

1. **No Tokens Detected**
   - Check for $SYMBOL format
   - Verify token list includes the symbol

2. **AI Analysis Fails**
   - Check API keys and network connectivity
   - Verify AI service is enabled

3. **Chart Data Empty**
   - Ensure prices are in $XX,XXX format
   - Check token has base price configured

4. **Webhook Authentication**
   - Verify WEBHOOK_SECRET is set
   - Check Authorization header format

### Debug Mode

Enable detailed logging:

```javascript
process.env.DEBUG_WORKFLOW = 'true';
```

This will log each processing step for troubleshooting.</content>
</xai:function_call">WORKFLOW_README.md