export const metadata = {
  title: "Contact | Yoryantra",
  description:
    "Get in touch with Yoryantra for feedback, suggestions, or collaborations.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Contact</h1>

      <p className="text-gray-700 leading-8">
        Have feedback, ideas, or found a bug? We’d love to hear from you.
        Yoryantra is built and improved continuously based on user input.
      </p>

      <div className="mt-8 p-6 rounded-2xl border bg-[#faf7f0]">
        <p className="font-medium">Email</p>
        <p className="mt-2">contact@yoryantra.com</p>
      </div>
    </div>
  );
}