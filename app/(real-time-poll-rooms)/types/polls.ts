export type PollDurationPreset = '1h' | '24h' | '7d';

export type CreatePollRequest = {
  question: string;
  options: string[];
  duration: PollDurationPreset;
};

export type CreatePollResponse = {
  roomId: string;
  shareUrl: string;
  token: string;
  expiresAt: string;
};

export type CastVoteRequest = {
  optionId: string;
  token: string;
};

export type PollOptionResult = {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
};

export type PollRoomResponse = {
  roomId: string;
  question: string;
  expiresAt: string;
  totalVotes: number;
  hasVoted: boolean;
  options: PollOptionResult[];
};

export type ApiErrorResponse = {
  message: string;
};
