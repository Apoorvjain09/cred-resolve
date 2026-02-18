import { NextResponse } from 'next/server';
import { createRoomToken } from '@/app/(real-time-poll-rooms)/lib/room-token';
import { POLL_DURATIONS } from './_lib/poll-store';
import type { CreatePollRequest, CreatePollResponse, PollDurationPreset } from '@/app/(real-time-poll-rooms)/types/polls';
import { supabaseRequest } from '@/app/(real-time-poll-rooms)/lib/supabaseRequest';

type CreatedRoomRow = {
  id: string;
  expires_at: string;
};

const isDurationPreset = (value: unknown): value is PollDurationPreset =>
  value === '1h' || value === '24h' || value === '7d';

const sanitizeOptions = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  const trimmed = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return [...new Set(trimmed)];
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as CreatePollRequest | null;
  if (!body) {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (question.length < 5 || question.length > 280) {
    return NextResponse.json(
      { message: 'Question must be between 5 and 280 characters.' },
      { status: 400 }
    );
  }

  if (!isDurationPreset(body.duration)) {
    return NextResponse.json({ message: 'Invalid duration preset.' }, { status: 400 });
  }

  const options = sanitizeOptions(body.options);
  if (options.length < 2) {
    return NextResponse.json({ message: 'At least 2 unique options are required.' }, { status: 400 });
  }

  if (options.length > 10) {
    return NextResponse.json({ message: 'At most 10 options are allowed.' }, { status: 400 });
  }

  const expiresAtDate = new Date(Date.now() + POLL_DURATIONS[body.duration] * 1000);

  let room: CreatedRoomRow;
  try {
    const roomRows = await supabaseRequest<CreatedRoomRow[]>(`/rest/v1/poll_rooms`, {
      method: 'POST',
      useServiceRole: true,
      headers: {
        Prefer: 'return=representation',
      },
      body: [
        {
          question,
          expires_at: expiresAtDate.toISOString(),
        },
      ],
    });

    room = roomRows[0];
    if (!room) {
      return NextResponse.json({ message: 'Failed to create poll room.' }, { status: 500 });
    }

    await supabaseRequest(`/rest/v1/poll_room_options`, {
      method: 'POST',
      useServiceRole: true,
      headers: {
        Prefer: 'return=minimal',
      },
      body: options.map((option, index) => ({
        room_id: room.id,
        option_text: option,
        option_order: index,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to create poll room.' },
      { status: 500 }
    );
  }

  const expSeconds = Math.floor(new Date(room.expires_at).getTime() / 1000);
  const token = createRoomToken(room.id, expSeconds);
  const origin = new URL(req.url).origin;

  const response: CreatePollResponse = {
    roomId: room.id,
    token,
    expiresAt: room.expires_at,
    shareUrl: `${origin}/poll/${room.id}?token=${encodeURIComponent(token)}`,
  };

  return NextResponse.json(response, { status: 201 });
}
