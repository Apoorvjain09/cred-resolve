import MultistrikeOiChart from "./_components/multistrike-oi-chart";
import { getGoldmOptionChainSnapshots } from "@/app/(stock-market-multichart-oi)/_actions/goldm-option-chain";
import { headers } from "next/headers";
import { testingSnapshots } from "../../lib/testing/testing-data"

export const dynamic = "force-dynamic";

export default async function GoldmMultichartOiGraphPage() {
  const host = (await headers()).get("host") ?? "";
  const isLocalhost =
    host.includes("localhost") || host.startsWith("127.0.0.1");
  const snapshots = isLocalhost
    ? testingSnapshots
    : await getGoldmOptionChainSnapshots({ limit: 1000 });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-6 md:grid-cols-[260px_1fr]">
        <MultistrikeOiChart snapshots={snapshots} />
      </div>
    </div>
  );
}
