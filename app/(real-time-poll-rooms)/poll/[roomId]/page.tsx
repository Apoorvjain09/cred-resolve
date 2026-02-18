import { PollRoomClient } from './_components/poll-room-client';

type PollRoomPageProps = {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function PollRoomPage({ params, searchParams }: PollRoomPageProps) {
  const { roomId } = await params;
  const query = await searchParams;
  const token = typeof query.token === 'string' ? query.token : '';

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white sm:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <PollRoomClient roomId={roomId} token={token} />
      </div>
    </div>
  );
}
