import { NextResponse } from "next/server";
import { insertGoldmOptionChainSnapshot } from "@/app/(stock-market-multichart-oi)/lib/goldm-option-chain";
import type {
    GoldmCurrentOptionChainDatahcRow,
    GoldmCurrentOptionChainResponse,
} from "@/app/(stock-market-multichart-oi)/types/goldm-current-option-chain";

export const runtime = "nodejs";

const ENDPOINT_URL =
    "https://www.research360.in/ajax/commodity/optionChainApi.php?getexpirty=1";

export async function GET() {
    try {
        const headers: HeadersInit = {
            accept: "application/json, text/javascript, */*; q=0.01",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
            origin: "https://www.research360.in",
            referer: "https://www.research360.in/commodity/com-detail/goldm",
        };

        // Optional cookie passthrough via env to avoid hardcoding sensitive values.
        if (process.env.RESEARCH360_COOKIE) {
            headers.cookie = process.env.RESEARCH360_COOKIE;
        }

        const response = await fetch(ENDPOINT_URL, {
            method: "POST",
            headers,
            body: "symble=GOLDM&showallnew=on",
            // Ensure fresh data on each request.
            cache: "no-store",
        });

        const text = await response.text();

        if (!response.ok) {
            return NextResponse.json(
                { error: "Upstream request failed", status: response.status, body: text },
                { status: 502 }
            );
        }

        // Upstream returns JSON; return only datahc and store snapshot.
        const data = JSON.parse(text) as GoldmCurrentOptionChainResponse;
        const datahc = Array.isArray(data?.datahc) ? data.datahc : [];
        const atm = typeof data?.atm === "number" ? data.atm : null;
        const future_price =
            typeof data?.future_price === "number" ? data.future_price : null;
        const spot_price =
            typeof data?.spot_price === "number" ? data.spot_price : null;

        await insertGoldmOptionChainSnapshot({
            datahc,
            atm,
            future_price,
            spot_price,
        });
        return NextResponse.json(
            { datahc, atm, future_price, spot_price },
            { status: 200 }
        );
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? "Something went wrong" },
            { status: 500 }
        );
    }
}
