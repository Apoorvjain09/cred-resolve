import { createHmac, timingSafeEqual } from 'crypto';

const FALLBACK_JWT_SECRET = 'poll-jwt-dev-only-secret-change-me';

type RoomTokenPayload = {
  iss: 'reacherr-polls';
  aud: 'poll-room';
  sub: `room:${string}`;
  rid: string;
  scope: ['view', 'vote'];
  iat: number;
  nbf: number;
  exp: number;
  ver: 1;
};

const getJwtSecret = () => process.env.POLL_HASH_SECRET || FALLBACK_JWT_SECRET;

const encodeBase64Url = (value: string | Buffer) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(`${normalized}${'='.repeat(padLength)}`, 'base64').toString('utf8');
};

const signPart = (input: string) => encodeBase64Url(createHmac('sha256', getJwtSecret()).update(input).digest());

export const createRoomToken = (roomId: string, expiresAtEpochSeconds: number) => {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload: RoomTokenPayload = {
    iss: 'reacherr-polls',
    aud: 'poll-room',
    sub: `room:${roomId}`,
    rid: roomId,
    scope: ['view', 'vote'],
    iat: now,
    nbf: now,
    exp: expiresAtEpochSeconds,
    ver: 1,
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signPart(`${encodedHeader}.${encodedPayload}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyRoomToken = (token: string, roomId: string) => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false as const, message: 'Invalid token format.' };
  }

  const [header, payload, signature] = parts;
  const expected = signPart(`${header}.${payload}`);

  const given = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (given.length !== expectedBuffer.length || !timingSafeEqual(given, expectedBuffer)) {
    return { ok: false as const, message: 'Invalid token signature.' };
  }

  let parsed: RoomTokenPayload;
  try {
    parsed = JSON.parse(decodeBase64Url(payload)) as RoomTokenPayload;
  } catch {
    return { ok: false as const, message: 'Invalid token payload.' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (parsed.iss !== 'reacherr-polls' || parsed.aud !== 'poll-room') {
    return { ok: false as const, message: 'Invalid token issuer.' };
  }
  if (parsed.rid !== roomId || parsed.sub !== `room:${roomId}`) {
    return { ok: false as const, message: 'Token does not match room.' };
  }
  if (parsed.nbf > now || parsed.exp <= now) {
    return { ok: false as const, message: 'Token expired.' };
  }

  return {
    ok: true as const,
    payload: parsed,
  };
};
