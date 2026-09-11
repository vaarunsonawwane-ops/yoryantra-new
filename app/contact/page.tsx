export const metadata = {
  title: "Contact | Yoryantra",
  description:
    "Contact Yoryantra to report a tool issue, suggest an improvement, or ask a question about the website.",
  alternates: {
    canonical: "https://yoryantra.com/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="bg-white text-gray-700">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <h1 className="text-4xl font-bold tracking-tight text-gray-950">
          Contact Yoryantra
        </h1>

        <div className="mt-8 max-w-3xl space-y-5 text-[17px] leading-8">
          <p>
            If a tool behaves unexpectedly, an explanation is unclear, or you
            have a practical suggestion for Yoryantra, you can contact me
            directly.
          </p>

          <p>
            Useful reports help me reproduce the problem and decide whether the
            tool, its explanation, or both need to be corrected.
          </p>
        </div>

        <section className="mt-10 rounded-2xl border border-gray-200 bg-[var(--light-bg)] p-6 md:p-7">
          <h2 className="text-xl font-semibold text-gray-950">
            Contact details
          </h2>

          <p className="mt-4 text-gray-700">Varoun Sonawane</p>

          <a
            href="mailto:contactyoryantra@gmail.com"
            className="mt-2 inline-block break-all font-medium text-[var(--green)] underline decoration-1 underline-offset-4 hover:no-underline"
          >
            contactyoryantra@gmail.com
          </a>
        </section>

        <section className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-950">
            Reporting a tool issue
          </h2>

          <div className="mt-5 max-w-3xl space-y-4 leading-8">
            <p>
              Please include the tool name, what you expected to happen, what
              actually happened, and the browser or device if it appears
              relevant. A small reproducible example is especially helpful.
            </p>

            <p>
              Please do not email passwords, private keys, access tokens,
              production credentials, or other secrets. Replace sensitive
              values with safe examples before sending a report.
            </p>
          </div>
        </section>

        <section className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-950">
            About the project
          </h2>

          <p className="mt-5 max-w-3xl leading-8">
            For the story behind Yoryantra, visit the{" "}
            <a
              href="/about"
              className="font-medium text-[var(--green)] underline decoration-1 underline-offset-4 hover:no-underline"
            >
              About page
            </a>
            . You can also read{" "}
            <a
              href="/how-yoryantra-tools-are-built"
              className="font-medium text-[var(--green)] underline decoration-1 underline-offset-4 hover:no-underline"
            >
              how Yoryantra tools are built and reviewed
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
