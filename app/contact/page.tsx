export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto p-8 md:p-16">
      <h1 className="text-4xl font-extrabold mb-6 text-slate-900">Contact Us</h1>
      <p className="text-lg text-slate-600 mb-8">
        Have a suggestion for a new tool or need technical support? We'd love to hear from you.
      </p>
      <div className="border border-slate-200 rounded-2xl p-8 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">Email Support</h2>
        <p className="text-slate-600 mb-2">For all inquiries, please reach out to:</p>
        <a href="mailto:contact@yoryantra.com" className="text-blue-600 font-bold text-xl hover:underline">
          contact@yoryantra.com
        </a>
      </div>
      <p className="mt-8 text-sm text-slate-400 italic">
        We typically respond to technical inquiries within 24–48 hours.
      </p>
    </main>
  );
}