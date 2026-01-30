# codex resume id
 Visit https://chatgpt.com/codex/settings/usage for up-to-date              │
│ information on rate limits and credits                                     │
│                                                                            │
│  Model:            gpt-5.2-codex (reasoning medium, summaries auto)        │
│  Directory:        ~/Documents/extra-hobby-endpoint/hranker                │
│  Approval:         on-request                                              │
│  Sandbox:          workspace-write                                         │
│  Agents.md:        <none>                                                  │
│  Account:          chatgpt4.mja@gmail.com (Plus)                           │
│  Session:          019c0e2a-7de3-7b63-8bce-cfcb65122453                    │
│                                                                            │
│  Context window:   16% left (219K used / 258K)                             │
│  5h limit:         [████████████████████] 98% left (resets 21:33)          │
│  Weekly limit:     [██████████████░░░░░░] 72% left (resets 16:43 on 2 Feb) 

# stock-market-multichart-oi

This folder contains the GOLDM multistrike OI mini‑app: data ingestion, storage, and the chart UI.

## What it does

- Fetches GOLDM option-chain data from a third‑party endpoint.
- Stores snapshots in Supabase.
- Renders a multi‑series OI chart with Spot/Future overlays and hover tooltips.
- Supports interval bucketing (5m / 15m / 30m / Day) and an Intraday filter (today only).
- Provides mock testing data for localhost.

## Routes

- API (ingest & store):
  - `app/(stock-market-multichart-oi)/api/goldm/get-current-option-chain-data/route.ts`
  - POSTs to research360 option chain and stores a snapshot.
  - Returns `{ datahc, atm, future_price, spot_price }`.
- UI page:
  - `app/(stock-market-multichart-oi)/multichart-oi-graph/goldm/page.tsx`
  - Uses mock snapshots on localhost; otherwise loads from Supabase via server action.

## Data flow

1. Cron (external) calls the API route every ~2 minutes.
2. API parses upstream JSON and stores `{ datahc, atm, future_price, spot_price }` in Supabase.
3. UI page loads snapshots from Supabase (or mock data on localhost) and renders chart.

## Supabase table

Table name: `public.goldm_option_chain_snapshots`

Columns used:
- `id` (bigserial, primary key)
- `symbol` (text, default `GOLDM`)
- `datahc` (jsonb) — array of rows like `[strike, call_oi, put_oi, change_pct, call_oi_chg, put_oi_chg]`
- `atm` (integer)
- `future_price` (numeric)
- `spot_price` (numeric)
- `snapshot_at` (timestamptz, default `now()`)

## Server actions

Located in `app/(stock-market-multichart-oi)/_actions/goldm-option-chain.ts`:
- `getGoldmOptionChainSnapshots({ sinceIso? })` → reads snapshots.
- `storeGoldmOptionChainSnapshot({ datahc, atm, future_price, spot_price })` → inserts a snapshot.

## Chart UI

File: `app/(stock-market-multichart-oi)/multichart-oi-graph/goldm/_components/multistrike-oi-chart.tsx`

Highlights:
- Sidebar filters (search, only x500 / x10000, select all, selected count).
- Interval bucketing: points are grouped by the selected interval.
- Intraday filter: shows only snapshots whose date matches the latest snapshot date.
- Left axis = price (Spot/Future), right axis = OI.
- Hover tooltip with per‑series values and vertical cursor line.

## Testing data (localhost)

On `localhost` or `127.0.0.1`, the UI uses mock data instead of Supabase.

- Default mock file: `app/(stock-market-multichart-oi)/testing-data.ts`
- Long mock generator: `app/(stock-market-multichart-oi)/lib/testing/generate-testing-data.js`
  - Generates 100 days × 100 rows/day into:
    `app/(stock-market-multichart-oi)/lib/testing/testing-data.ts`
  - Run from repo root:
    - `node app/(stock-market-multichart-oi)/lib/testing/generate-testing-data.js`

If you want the UI to use the long mock file, switch the import in
`app/(stock-market-multichart-oi)/multichart-oi-graph/goldm/page.tsx`.

## Env vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side writes)
- `RESEARCH360_COOKIE` (optional; passed to upstream)
