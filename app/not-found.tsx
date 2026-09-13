import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <p className="text-sm font-semibold text-[var(--light-gold)]">
        404
      </p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-950">
        This page could not be found.
      </h1>

      <p className="mt-5 max-w-2xl leading-relaxed text-gray-600">
        The page may have moved, the link may be outdated, or the address may
        have been entered incorrectly.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/tools"
          className="rounded-xl bg-[var(--green)] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:opacity-95"
        >
          Explore Tools
        </Link>

        <Link
          href="/"
          className="rounded-xl border border-[var(--green)] bg-white px-6 py-3 text-sm font-medium text-[var(--green)] transition hover:-translate-y-0.5 hover:bg-green-50"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}