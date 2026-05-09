import Link from 'next/link';

export default function RegionalCategory() {
  return (
    <main className="max-w-6xl mx-auto p-8 md:p-16">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Regional Technical Utilities</h1>
        <p className="text-xl text-slate-600">Specialized tools for regional encoding, local data standards, and legacy system transformations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* We will add tool links here as we build them */}
        <div className="p-8 border border-slate-200 rounded-3xl bg-white shadow-sm">
          <div className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-2">Development</div>
          <h2 className="text-2xl font-bold mb-4">Urdu InPage to Unicode</h2>
          <p className="text-slate-600 mb-6">The most precise converter for transforming legacy Urdu InPage text into modern, web-ready Unicode strings.</p>
          <span className="inline-block bg-slate-100 text-slate-500 px-4 py-2 rounded-full text-sm font-semibold">
            Coming Soon
          </span>
        </div>
      </div>
    </main>
  );
}