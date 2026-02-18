import { supabaseRequest } from '@/app/(real-time-poll-rooms)/lib/supabaseRequest';
import type { PollOptionResult, PollRoomResponse } from '@/app/(real-time-poll-rooms)/types/polls';

type PollRoomRow = {
  id: string;
  question: string;
  expires_at: string;
};

type PollOptionRow = {
  id: string;
  option_text: string;
  option_order: number;
};

type PollVoteRow = {
  option_id: string;
};

type PollVoteExistRow = {
  id: string;
};

export const POLL_DURATIONS = {
  '1h': 60 * 60,
  '24h': 24 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
} as const;

export async function getPollRoom(roomId: string) {
  const rows = await supabaseRequest<PollRoomRow[]>(`/rest/v1/poll_rooms`, {
    method: 'GET',
    useServiceRole: true,
    query: {
      id: `eq.${roomId}`,
      select: 'id,question,expires_at',
      limit: '1',
    },
  });

  return rows[0] ?? null;
}

export async function getPollOptions(roomId: string) {
  return supabaseRequest<PollOptionRow[]>(`/rest/v1/poll_room_options`, {
    method: 'GET',
    useServiceRole: true,
    query: {
      room_id: `eq.${roomId}`,
      select: 'id,option_text,option_order',
      order: 'option_order.asc',
    },
  });
}

export async function getPollVotes(roomId: string) {
  return supabaseRequest<PollVoteRow[]>(`/rest/v1/poll_room_votes`, {
    method: 'GET',
    useServiceRole: true,
    query: {
      room_id: `eq.${roomId}`,
      select: 'option_id',
    },
  });
}

export async function hasExistingVote(roomId: string, voterHash: string, ipHash: string) {
  const rows = await supabaseRequest<PollVoteExistRow[]>(`/rest/v1/poll_room_votes`, {
    method: 'GET',
    useServiceRole: true,
    query: {
      room_id: `eq.${roomId}`,
      or: `(voter_hash.eq.${voterHash},ip_hash.eq.${ipHash})`,
      select: 'id',
      limit: '1',
    },
  });

  return rows.length > 0;
}

export async function insertVote(roomId: string, optionId: string, voterHash: string, ipHash: string) {
  return supabaseRequest<{ id: string }[]>(`/rest/v1/poll_room_votes`, {
    method: 'POST',
    useServiceRole: true,
    headers: {
      Prefer: 'return=representation',
    },
    body: [
      {
        room_id: roomId,
        option_id: optionId,
        voter_hash: voterHash,
        ip_hash: ipHash,
      },
    ],
  });
}

export const mapPollResults = (
  room: PollRoomRow,
  options: PollOptionRow[],
  votes: PollVoteRow[],
  hasVoted: boolean
): PollRoomResponse => {
  const counts = new Map<string, number>();
  for (const vote of votes) {
    const current = counts.get(vote.option_id) ?? 0;
    counts.set(vote.option_id, current + 1);
  }

  const totalVotes = votes.length;

  const mappedOptions: PollOptionResult[] = options.map((option) => {
    const voteCount = counts.get(option.id) ?? 0;
    const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);

    return {
      id: option.id,
      text: option.option_text,
      voteCount,
      percentage,
    };
  });

  return {
    roomId: room.id,
    question: room.question,
    expiresAt: room.expires_at,
    totalVotes,
    hasVoted,
    options: mappedOptions,
  };
};

export const isExpired = (expiresAtIso: string) => new Date(expiresAtIso).getTime() <= Date.now();
