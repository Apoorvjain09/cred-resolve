import { supabase } from "@/lib/supabase";

export async function insertGoldmOptionChainSnapshot(params: {
  datahc?: unknown;
  atm?: number | null;
  future_price?: number | null;
  spot_price?: number | null;
}) {
  const { datahc, atm, future_price, spot_price } = params;
  const { error } = await supabase
    .from("goldm_option_chain_snapshots")
    .insert({ symbol: "GOLDM", datahc, atm, future_price, spot_price });

  if (error) {
    throw new Error(error.message);
  }
}
