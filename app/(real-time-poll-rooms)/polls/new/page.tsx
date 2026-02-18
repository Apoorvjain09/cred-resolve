import { CreatePollForm } from './_components/create-poll-form';

const DEMO_VIDEO_VIEW_URL =
  'https://drive.google.com/file/d/1Dv2t2WnPOln81cQ_pM61Q12ptNGqIfoE/view?usp=sharing';
const DEMO_VIDEO_EMBED_URL =
  'https://drive.google.com/file/d/1Dv2t2WnPOln81cQ_pM61Q12ptNGqIfoE/preview';

export default function CreatePollPage() {
  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white sm:px-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Project Demo Video</p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            <iframe
              title="Real-Time Poll Rooms Demo"
              src={DEMO_VIDEO_EMBED_URL}
              className="h-[220px] w-full sm:h-[420px]"
              allow="autoplay"
            />
          </div>
          <a
            href={DEMO_VIDEO_VIEW_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-blue-300 underline underline-offset-4"
          >
            Open video in Google Drive
          </a>
        </section>

        <CreatePollForm />
      </div>
    </div>
  );
}
