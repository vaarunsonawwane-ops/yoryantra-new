export const metadata = {
  title: "Contact | Yoryantra",

  description:
    "Contact Yoryantra for feedback, suggestions, bugs, or general questions.",

  alternates: {
    canonical: "https://yoryantra.com/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-gray-950">
        Contact
      </h1>

      <div className="mt-8 space-y-5 text-lg leading-relaxed text-gray-600">
        <p>
          If you found something broken, have a suggestion, or want to
          share feedback, feel free to get in touch.
        </p>

        <p>
          Yoryantra is growing carefully, and helpful feedback is always
          appreciated.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-gray-200 bg-[var(--light-bg)] p-6">
        <p className="text-sm font-semibold text-gray-900">
          Contact
        </p>
		
		<p className="mt-2 text-gray-700">
		  Varon Sonawwane
		</p>

		<a
		  href="mailto:contactyoryantra@gmail.com"
		  className="mt-2 inline-block text-gray-700 hover:text-[var(--light-gold)] transition-colors duration-200 break-all"
		>
		  contactyoryantra@gmail.com
		</a>
      </div>
    </div>
  );
}