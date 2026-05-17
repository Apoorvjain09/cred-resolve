import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TABLE_NAME = "exam_helper_latest_message";
const CURRENT_MESSAGE_ID = "current";

type LatestMessageRow = {
  message: string;
  updated_at: string;
};

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );

async function readIncomingMessage(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  const rawBody = await req.text();

  if (contentType.includes("application/json")) {
    const parsed = JSON.parse(rawBody) as unknown;

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof parsed.message === "string"
    ) {
      return parsed.message.trim();
    }

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "text" in parsed &&
      typeof parsed.text === "string"
    ) {
      return parsed.text.trim();
    }

    if (typeof parsed === "string") {
      return parsed.trim();
    }

    return "";
  }

  return rawBody.trim();
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from(TABLE_NAME)
      .select("message, updated_at")
      .eq("id", CURRENT_MESSAGE_ID)
      .maybeSingle<LatestMessageRow>();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: data?.message ?? "",
        updatedAt: data?.updated_at ?? null,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to load message.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let message = "";

  try {
    message = await readIncomingMessage(req);
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ message: "Message is required." }, { status: 400 });
  }

  const updatedAt = new Date().toISOString();

  try {
    const { error } = await supabaseAdmin().from(TABLE_NAME).upsert({
      id: CURRENT_MESSAGE_ID,
      message,
      updated_at: updatedAt,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message,
      updatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to save message.",
      },
      { status: 500 }
    );
  }
}
