"use server";

import { insertGoldmOptionChainSnapshot } from "@/app/(stock-market-multichart-oi)/lib/goldm-option-chain";
import { supabase } from "@/lib/supabase";

export async function storeGoldmOptionChainSnapshot(params: {
  datahc?: unknown;
  atm?: number | null;
  future_price?: number | null;
  spot_price?: number | null;
}) {
  await insertGoldmOptionChainSnapshot(params);
}

export async function getGoldmOptionChainSnapshots(params: {
  sinceIso?: string;
  limit?: number;
}) {
  const { sinceIso, limit = 1000 } = params;
  const safeLimit = Math.max(1, Math.min(limit, 5000));
  const query = supabase
    .from("goldm_option_chain_snapshots")
    .select("datahc,atm,future_price,spot_price,snapshot_at")
    .order("snapshot_at", { ascending: false })
    .limit(safeLimit);

  const { data, error } = sinceIso
    ? await query.gte("snapshot_at", sinceIso)
    : await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reverse();
}
