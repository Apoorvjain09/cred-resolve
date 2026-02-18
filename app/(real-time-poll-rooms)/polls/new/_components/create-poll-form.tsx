'use client';

import { useMemo, useState } from 'react';
import type { CreatePollResponse, PollDurationPreset } from '@/app/(real-time-poll-rooms)/types/polls';

type OptionItem = {
  id: number;
  value: string;
};

const makeOption = (id: number) => ({
  id,
  value: '',
});

const durationLabels: Record<PollDurationPreset, string> = {
  '1h': '1 hour',
  '24h': '24 hours',
  '7d': '7 days',
};

export function CreatePollForm() {
  const [question, setQuestion] = useState('');
  const [duration, setDuration] = useState<PollDurationPreset>('24h');
  const [options, setOptions] = useState<OptionItem[]>([makeOption(1), makeOption(2)]);
  const [nextOptionId, setNextOptionId] = useState(3);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatePollResponse | null>(null);

  const trimmedOptions = useMemo(
    () => options.map((item) => item.value.trim()).filter((item) => item.length > 0),
    [options]
  );

  const isValid = question.trim().length >= 5 && trimmedOptions.length >= 2;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || busy) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          options: trimmedOptions,
          duration,
        }),
      });

      const data = (await res.json().catch(() => null)) as CreatePollResponse | { message?: string } | null;

      if (!res.ok) {
        throw new Error(typeof data?.message === 'string' ? data.message : 'Unable to create poll.');
      }

      setCreated(data as CreatePollResponse);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create poll.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur sm:p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Create Real-Time Poll</h1>
      <p className="mt-2 text-sm text-white/65">Create a room, copy the link, and collect votes instantly.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/85">Question</span>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What should we build next?"
            className="w-full rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm outline-none ring-0 transition focus:border-white/40"
            maxLength={280}
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm font-medium text-white/85">Options</p>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <input
                  value={option.value}
                  onChange={(event) => {
                    setOptions((prev) =>
                      prev.map((item) => (item.id === option.id ? { ...item, value: event.target.value } : item))
                    );
                  }}
                  placeholder={`Option ${index + 1}`}
                  className="w-full rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm outline-none transition focus:border-white/40"
                />
                <button
                  type="button"
                  onClick={() => setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((item) => item.id !== option.id)))}
                  disabled={options.length <= 2}
                  className="rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-white/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setOptions((prev) => [...prev, makeOption(nextOptionId)]);
              setNextOptionId((prev) => prev + 1);
            }}
            className="mt-3 rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-white/85"
          >
            Add option
          </button>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/85">Room expires in</span>
          <select
            value={duration}
            onChange={(event) => setDuration(event.target.value as PollDurationPreset)}
            className="w-full rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm outline-none"
          >
            {Object.entries(durationLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={!isValid || busy}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Creating poll...' : 'Create poll room'}
        </button>
      </form>

      {error ? <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

      {created ? (
        <div className="mt-6 space-y-3 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold text-emerald-100">Poll room created</p>
          <p className="break-all text-xs text-emerald-100/85">{created.shareUrl}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(created.shareUrl)}
              className="rounded-lg border border-emerald-200/30 px-3 py-2 text-xs font-medium text-emerald-50"
            >
              Copy share link
            </button>
            <a
              href={created.shareUrl}
              className="rounded-lg border border-emerald-200/30 px-3 py-2 text-xs font-medium text-emerald-50"
            >
              Open room
            </a>
          </div>
          <p className="text-xs text-emerald-100/80">Expires at: {new Date(created.expiresAt).toLocaleString()}</p>
        </div>
      ) : null}
    </div>
  );
}
