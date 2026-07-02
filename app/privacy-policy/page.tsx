export const metadata = {
  title: "Privacy Policy | Yoryantra",
  description:
    "Learn how Yoryantra handles tool inputs, analytics, advertising, and website usage data.",
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

        <p>
          We do not sell or rent personal information. Limited technical data
          may be processed by service providers that help with analytics,
          advertising, hosting, security, or website operation.
        </p>
      </div>
    </div>
  );
}