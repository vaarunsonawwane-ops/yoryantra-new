export const metadata = {
  title: "Disclaimer | Yoryantra",

  description:
    "Read the disclaimer for using Yoryantra tools, outputs, and website content.",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">

      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Disclaimer
      </h1>

      <div className="space-y-6 text-gray-700 leading-8">

        <p>
          Yoryantra provides browser-based utilities, converters, and
          technical tools for general informational and practical use.
        </p>

        <p>
          While we strive to keep the tools accurate and reliable,
          Yoryantra makes no guarantees regarding completeness,
          correctness, availability, or suitability for any specific use.
        </p>

        <p>
          Users should independently review and verify tool outputs before
          using them in professional, technical, financial, legal,
          security-sensitive, or other critical workflows.
        </p>

        <p>
          To the extent permitted by applicable law, Yoryantra is not
          responsible for losses, damages, inaccuracies, or consequences
          resulting from the use of the website or its tools.
        </p>

        <p>
          External links, references, pricing information, or third-party
          content, if present, are provided for convenience only and do not
          imply endorsement or guarantee continued accuracy.
        </p>

        <p>
          By using Yoryantra, you acknowledge this disclaimer and accept
          responsibility for how you use the platform and its outputs.
        </p>

      </div>

    </div>
  );
}