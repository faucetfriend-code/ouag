/**
 * botClient.ts — thin server-side client for the Discord Signal Bot's
 * read-only Oracle API (Flask app in `Discord Bot/dashboard.py`, routes under
 * `/api/oracle/*`, gated by a bearer token).
 *
 * Config (server env, never exposed to the browser):
 *   BOT_API_URL    e.g. https://bot.example.com  or  http://localhost:5050
 *   BOT_API_TOKEN  shared secret == ORACLE_API_TOKEN on the bot side
 *
 * Every call fails soft: if the bot is unreachable or unconfigured, callers
 * fall back to mock data so the UI keeps rendering in development.
 */

const BASE = (process.env.BOT_API_URL || '').replace(/\/$/, '');
const TOKEN = process.env.BOT_API_TOKEN || '';

export const isBotConfigured = (): boolean => Boolean(BASE && TOKEN);

export interface BotEnvelope<T> {
  success: boolean;
  data: T;
  timestamp?: string;
  [k: string]: unknown;
}

/**
 * GET a bot Oracle endpoint and return the parsed envelope, or null on any
 * failure (unconfigured, network error, non-2xx, timeout, bad JSON).
 */
export async function botGet<T = unknown>(
  path: string,
  params?: Record<string, string | number | undefined>,
  timeoutMs = 4000,
): Promise<BotEnvelope<T> | null> {
  if (!isBotConfigured()) return null;

  const url = new URL(`${BASE}/api/oracle/${path.replace(/^\//, '')}`);
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as BotEnvelope<T>;
    return json?.success === false ? null : json;
  } catch {
    return null; // fail soft — caller uses fallback
  } finally {
    clearTimeout(timer);
  }
}

/** Bot's raw signal row shape (from dashboard._read_signals). */
export interface BotSignal {
  ts: string;
  analyst: string;
  symbol: string;
  side: string;
  outcome: string;
  raw_text: string;
}

/** Bot's analyst-stats row shape (from dashboard._read_analyst_stats). */
export interface BotAnalystStat {
  analyst: string;
  leverage: number;
  wins: number;
  losses: number;
  total: number;
  win_rate: string;
  realized_pnl: number;
}
