'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PollRoomResponse } from '@/app/(real-time-poll-rooms)/types/polls';

type PollRoomClientProps = {
  roomId: string;
  token: string;
};

const parseMessage = (value: unknown, fallback: string) => {
  if (typeof value === 'object' && value !== null && 'message' in value && typeof value.message === 'string') {
    return value.message;
  }
  return fallback;
};

export function PollRoomClient({ roomId, token }: PollRoomClientProps) {
  const [data, setData] = useState<PollRoomResponse | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPoll = useCallback(async () => {
    const res = await fetch(`/api/polls/${encodeURIComponent(roomId)}?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    const parsed = (await res.json().catch(() => null)) as PollRoomResponse | { message?: string } | null;

    if (!res.ok) {
      throw new Error(parseMessage(parsed, `Unable to load poll room (HTTP ${res.status}).`));
    }

    const nextData = parsed as PollRoomResponse;
    setData(nextData);
    setSelectedOptionId((prev) => prev || nextData.options[0]?.id || '');
  }, [roomId, token]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        await loadPoll();
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load room.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadPoll]);

  useEffect(() => {
    if (!data) return;

    const timer = window.setInterval(() => {
      void loadPoll().catch(() => {
        // Ignore background refresh errors; foreground actions handle their own errors.
      });
    }, 2000);

    return () => {
      window.clearInterval(timer);
    };
  }, [data, loadPoll]);

  const canVote = useMemo(() => !!data && !data.hasVoted && !isExpired(data.expiresAt), [data]);

  const handleVote = async () => {
    if (!canVote || !selectedOptionId || busy) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/polls/${encodeURIComponent(roomId)}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionId: selectedOptionId,
          token,
        }),
      });

      const parsed = (await res.json().catch(() => null)) as PollRoomResponse | { message?: string } | null;

      if (res.status === 409) {
        setData(parsed as PollRoomResponse);
        setError('You already voted in this poll room.');
        return;
      }

      if (!res.ok) {
        throw new Error(parseMessage(parsed, 'Unable to cast vote.'));
      }

      setData(parsed as PollRoomResponse);
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : 'Unable to cast vote.');
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return <RoomMessage title="Invalid link" message="This poll URL is missing the required token." />;
  }

  if (loading) {
    return <RoomMessage title="Loading poll" message="Fetching room details..." />;
  }

  if (!data) {
    return <RoomMessage title="Poll unavailable" message={error || 'This poll room could not be loaded.'} />;
  }

  const expired = isExpired(data.expiresAt);

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Poll Room</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{data.question}</h1>
      <p className="mt-2 text-xs text-white/65">Expires at {new Date(data.expiresAt).toLocaleString()}</p>

      <div className="mt-6 space-y-3">
        {data.options.map((option) => (
          <label
            key={option.id}
            className="block cursor-pointer rounded-2xl border border-white/15 bg-black/45 p-4 transition hover:border-white/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="poll-option"
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => setSelectedOptionId(option.id)}
                  disabled={!canVote}
                  className="mt-0.5"
                />
                <span className="text-sm font-medium">{option.text}</span>
              </div>
              <span className="text-xs text-white/75">{option.voteCount} votes</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${option.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/65">{option.percentage}%</p>
          </label>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-xs text-white/70">Total votes: {data.totalVotes}</p>
        <button
          type="button"
          disabled={!canVote || busy || !selectedOptionId}
          onClick={() => void handleVote()}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Submitting...' : data.hasVoted ? 'Already voted' : expired ? 'Poll expired' : 'Submit vote'}
        </button>
      </div>

      {error ? <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      {data.hasVoted ? (
        <p className="mt-3 text-xs text-emerald-100/90">Your vote has been recorded. Results update automatically.</p>
      ) : null}
      {expired ? <p className="mt-3 text-xs text-amber-100">This poll room has expired and no longer accepts votes.</p> : null}
    </div>
  );
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

function RoomMessage({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-white/70">{message}</p>
    </div>
  );
}
