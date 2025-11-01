# Unity Oracle Aggregator

A comprehensive crypto trading intelligence platform with Discord authentication and premium subscription features.

## Features

- **Discord Authentication**: Login with Discord and verify server membership
- **Subscription Management**: Premium features for active subscribers
- **Analyst Insights**: Detailed crypto analysis from expert traders
- **Real-time Charts**: Interactive price charts with analyst sentiment
- **Portfolio Tracking**: Monitor your crypto holdings

## Setup

### Prerequisites

- Node.js 18+
- Discord Application (for OAuth)

### Discord Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URI: `http://localhost:3000/api/auth/callback/discord`
5. Copy Client ID and Client Secret

### Environment Variables

Create a `.env.local` file with:

```env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_SERVER_ID=your_discord_server_id
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication Flow

1. Users login with Discord OAuth
2. System verifies they are members of the specified Discord server
3. Users with active subscriptions can access premium features
4. Users without subscriptions are redirected to profile page with subscription options

## Access Control

- **Public Routes**: `/`, `/login`
- **Authenticated Routes**: `/profile`
- **Premium Routes**: `/analysts`, `/tools` (require active subscription)

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Authentication**: NextAuth.js with Discord OAuth
- **Styling**: Bootstrap 5
- **Charts**: Chart.js with react-chartjs-2
- **State Management**: React Context API
