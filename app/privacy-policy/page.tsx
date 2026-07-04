export const metadata = {
  title: "Privacy Policy | Yoryantra",
  description:
    "Learn how Yoryantra handles tool inputs, analytics, advertising, cookies, and website usage data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <div className="space-y-6 text-gray-700 leading-8">
        <p>
          Yoryantra respects your privacy and aims to keep data collection
          limited to what is needed to operate and improve the website.
        </p>

        <p>
          Most tools process input directly in your browser. Tools that need
          to inspect an external URL or remote response may send the required
          request over the internet, and that behaviour should be clear on the
          relevant tool page.
        </p>

        <p>
          We may use analytics services to understand general usage patterns
          and improve performance. We may also use advertising services to
          support the website. These providers may process limited technical
          information according to their own privacy policies.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Advertising and cookies
          </h2>

          <p>
            Yoryantra may use Google AdSense or other advertising services to
            show limited, non-intrusive ads that help support the website.
            Third-party vendors, including Google, may use cookies or similar
            technologies to serve ads based on a user&apos;s prior visits to
            this website or other websites.
          </p>

          <p className="mt-4">
            These cookies may help with ad delivery, ad measurement, fraud
            prevention, frequency limits, and ad personalization where allowed.
            Users can manage cookies in their browser settings and can review
            Google&apos;s ad personalization choices through Google&apos;s own
            ad settings.
          </p>
        </div>

        <p>
          We do not sell or rent personal information. Limited technical data
          may be processed by service providers that help with analytics,
          advertising, hosting, security, or website operation.
        </p>
      </div>
    </div>
  );
}
