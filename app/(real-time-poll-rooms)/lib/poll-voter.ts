import { randomUUID, createHash } from 'crypto';
import { cookies } from 'next/headers';

const VOTER_COOKIE_NAME = 'poll_voter_token';
const FALLBACK_POLL_HASH_SECRET = 'poll-dev-only-secret-change-me';

export const getPollHashSecret = () => process.env.POLL_HASH_SECRET || FALLBACK_POLL_HASH_SECRET;

export const getClientIp = (req: Request) => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp?.trim()) return realIp.trim();

  return 'unknown';
};

const hashWithSecret = (value: string) =>
  createHash('sha256').update(`${getPollHashSecret()}:${value}`).digest('hex');

export const getOrCreateVoterToken = async () => {
  const store = await cookies();
  const existing = store.get(VOTER_COOKIE_NAME)?.value;
  if (existing && existing.trim().length > 0) {
    return {
      token: existing,
      didSetCookie: false,
    };
  }

  const created = randomUUID();
  store.set(VOTER_COOKIE_NAME, created, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  return {
    token: created,
    didSetCookie: true,
  };
};

export const getVoteHashes = async (req: Request) => {
  const { token, didSetCookie } = await getOrCreateVoterToken();
  const ip = getClientIp(req);

  return {
    didSetCookie,
    voterHash: hashWithSecret(token),
    ipHash: hashWithSecret(ip),
  };
};
