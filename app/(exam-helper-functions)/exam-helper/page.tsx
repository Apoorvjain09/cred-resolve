"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type LatestMessageResponse = {
  message: string;
  updatedAt: string | null;
};

const POLL_INTERVAL_MS = 30_000;
const CODE_BLOCK_RE = /^```(\w+)?\n([\s\S]*?)\n```$/;

export default function ExamHelperPage() {
  const [message, setMessage] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeExpanded, setCodeExpanded] = useState(true);

  const loadMessage = useCallback(async () => {
    const res = await fetch("/api/realtime-webhook", {
      method: "GET",
      cache: "no-store",
    });

    const parsed = (await res.json().catch(() => null)) as
      | LatestMessageResponse
      | { message?: string }
      | null;

    if (!res.ok) {
      throw new Error(
        parsed?.message ?? `Unable to load message (HTTP ${res.status}).`
      );
    }

    const nextMessage =
      typeof parsed?.message === "string" ? parsed.message : "";
    const nextUpdatedAt =
      parsed && "updatedAt" in parsed && typeof parsed.updatedAt === "string"
        ? parsed.updatedAt
        : null;

    setMessage(nextMessage);
    setUpdatedAt(nextUpdatedAt);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setError(null);
        await loadMessage();
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load message."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    const timer = window.setInterval(() => {
      void run();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [loadMessage]);

  const formattedUpdatedAt = useMemo(() => {
    if (!updatedAt) return null;
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date(updatedAt));
  }, [updatedAt]);

  const codeBlock = useMemo(() => {
    const match = message.match(CODE_BLOCK_RE);
    return match ? { language: match[1] ?? "code", code: match[2] } : null;
  }, [message]);

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-8 text-white sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-center">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
              Exam Helper
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Live message</h1>
          </div>
          <div className="text-right text-xs text-white/55">
            <p>Polls every 30 seconds</p>
            {formattedUpdatedAt ? <p>Updated {formattedUpdatedAt}</p> : null}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          {loading ? (
            <p className="text-3xl font-semibold text-white/60 sm:text-5xl">
              Loading...
            </p>
          ) : codeBlock ? (
            <div className="w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-black/45 text-left shadow-2xl">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                <span>{codeBlock.language}</span>
                <button
                  type="button"
                  onClick={() => setCodeExpanded((expanded) => !expanded)}
                  className="rounded border border-white/10 px-2 py-1 text-[10px] text-white/70 hover:bg-white/10"
                >
                  {codeExpanded ? "Minimize" : "Maximize"}
                </button>
              </div>
              {codeExpanded ? (
                <pre className="max-h-[70vh] overflow-auto p-4 text-sm leading-relaxed text-white sm:text-base">
                  <code>{codeBlock.code}</code>
                </pre>
              ) : null}
            </div>
          ) : message ? (
            <p className="max-w-5xl whitespace-pre-wrap break-words text-center text-5xl font-bold leading-tight sm:text-7xl lg:text-8xl">
              {message}
            </p>
          ) : (
            <p className="text-center text-4xl font-semibold text-white/45 sm:text-6xl">
              Waiting for message
            </p>
          )}
        </div>

        {error ? (
          <p className="mt-8 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
