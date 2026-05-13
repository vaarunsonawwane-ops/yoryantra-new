export const metadata = {
  title: "Terms of Use | Yoryantra",
  description:
    "Terms and conditions for using Yoryantra tools.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Terms of Use</h1>

      <div className="space-y-6 text-gray-700 leading-8">
        <p>
          By using Yoryantra, you agree to use the tools responsibly and
          for lawful purposes only.
        </p>

        <p>
          All tools are provided “as is” without warranties of any kind.
          We do not guarantee accuracy or availability at all times.
        </p>

        <p>
          Yoryantra may update, modify, or remove features at any time
          without prior notice.
        </p>

        <p>
          We are not responsible for any loss or damage resulting from the
          use of these tools.
        </p>
      </div>
    </div>
  );
}