export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-50">
      <section className="w-full max-w-3xl space-y-6">
        <p className="text-sm font-medium tracking-[0.2em] text-emerald-400 uppercase">
          PopSage
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Grounded support, with humans ready when AI reaches its limit.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-300">
          The Next.js foundation is ready. Live chat, knowledge ingestion, AI
          support, and human handoff will be added as independently testable
          product slices.
        </p>
        <div className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
          Stage 1 · application scaffold initialized
        </div>
      </section>
    </main>
  );
}
