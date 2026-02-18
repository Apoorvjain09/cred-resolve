import { NextResponse } from 'next/server';
import type { CastVoteRequest } from '@/app/(real-time-poll-rooms)/types/polls';
import { verifyRoomToken } from '@/app/(real-time-poll-rooms)/lib/room-token';
import { getVoteHashes } from '@/app/(real-time-poll-rooms)/lib/poll-voter';
import {
  getPollOptions,
  getPollRoom,
  getPollVotes,
  hasExistingVote,
  insertVote,
  isExpired,
  mapPollResults,
} from '../../_lib/poll-store';

export async function POST(req: Request, context: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await context.params;
  const body = (await req.json().catch(() => null)) as CastVoteRequest | null;

  if (!body || typeof body.token !== 'string' || typeof body.optionId !== 'string') {
    return NextResponse.json({ message: 'Invalid vote payload.' }, { status: 400 });
  }

  const token = body.token.trim();
  const optionId = body.optionId.trim();
  if (!token || !optionId) {
    return NextResponse.json({ message: 'Missing vote fields.' }, { status: 400 });
  }

  const verified = verifyRoomToken(token, roomId);
  if (!verified.ok) {
    return NextResponse.json({ message: verified.message }, { status: 401 });
  }

  const room = await getPollRoom(roomId);
  if (!room) {
    return NextResponse.json({ message: 'Poll room not found.' }, { status: 404 });
  }

  if (isExpired(room.expires_at)) {
    return NextResponse.json({ message: 'Poll room has expired.' }, { status: 410 });
  }

  const options = await getPollOptions(roomId);
  const optionExists = options.some((option) => option.id === optionId);
  if (!optionExists) {
    return NextResponse.json({ message: 'Option does not belong to this room.' }, { status: 400 });
  }

  const { voterHash, ipHash } = await getVoteHashes(req);
  const alreadyVoted = await hasExistingVote(roomId, voterHash, ipHash);
  if (alreadyVoted) {
    const votes = await getPollVotes(roomId);
    return NextResponse.json(mapPollResults(room, options, votes, true), { status: 409 });
  }

  try {
    await insertVote(roomId, optionId, voterHash, ipHash);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to record vote.';
    if (/duplicate key|unique/i.test(message)) {
      const votes = await getPollVotes(roomId);
      return NextResponse.json(mapPollResults(room, options, votes, true), { status: 409 });
    }
    return NextResponse.json({ message }, { status: 500 });
  }

  const votes = await getPollVotes(roomId);
  return NextResponse.json(mapPollResults(room, options, votes, true));
}
