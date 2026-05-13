export const metadata = {
  title: "Privacy Policy | Yoryantra",
  description:
    "Privacy policy for Yoryantra tools and website usage.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <div className="space-y-6 text-gray-700 leading-8">
        <p>
          Yoryantra respects your privacy and is committed to keeping your
          data safe.
        </p>

        <p>
          Most tools on this website process data directly in your browser.
          Your input is not stored or sent to any server.
        </p>

        <p>
          We may use basic analytics tools to understand usage patterns and improve performance.
		  In the future, we may also use third-party services such as analytics or advertising networks.
        </p>

        <p>
          We do not sell, rent, or share user data with third parties.
        </p>
      </div>
    </div>
  );
}