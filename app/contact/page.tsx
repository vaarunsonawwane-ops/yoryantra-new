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
          Contact Us
        </h1>

        <div className="mt-8 max-w-3xl space-y-5 text-[17px] leading-8">
          <p>
            If you are having issues with the tool, or you would like to provide feedback on how we can improve Yoryantra please feel free to get in touch.
          </p>
        </div>

        <section className="mt-10 rounded-[8px] bg-[#FAF6EB] p-6 md:p-7">
          <h2 className="text-xl font-semibold text-gray-950">
            Contact
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
            Report a Problem with a Tool
          </h2>

          <div className="mt-5 max-w-3xl space-y-4 leading-8">
            <p>
              If something isn't working as expected please let us know which tool you were using, what you were trying to do and what happened.
            </p>

            <p>
              We can get a better understanding of what went wrong by having a small example. If you think it might be browser/device related please let us know.
            </p>

            <p>
              Do not include any sensitive information such as passwords, private keys, access tokens, production credentials etc. in your email. Please replace any private information with example information.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
