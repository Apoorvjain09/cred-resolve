import { NextResponse } from 'next/server';
import { verifyRoomToken } from '@/app/(real-time-poll-rooms)/lib/room-token';
import { getVoteHashes } from '@/app/(real-time-poll-rooms)/lib/poll-voter';
import { getPollOptions, getPollRoom, getPollVotes, hasExistingVote, isExpired, mapPollResults } from '../_lib/poll-store';

const getToken = (req: Request) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  return typeof token === 'string' ? token.trim() : '';
};

export async function GET(req: Request, context: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await context.params;
  const token = getToken(req);

  if (!token) {
    return NextResponse.json({ message: 'Missing room token.' }, { status: 401 });
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

  const { voterHash, ipHash } = await getVoteHashes(req);
  const [options, votes, hasVoted] = await Promise.all([
    getPollOptions(roomId),
    getPollVotes(roomId),
    hasExistingVote(roomId, voterHash, ipHash),
  ]);

  return NextResponse.json(mapPollResults(room, options, votes, hasVoted));
}
