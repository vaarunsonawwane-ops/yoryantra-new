export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto p-8 md:p-16 text-slate-800">
      <h1 className="text-4xl font-extrabold mb-6">About Yoryantra</h1>
      <p className="text-lg mb-6 leading-relaxed">
        Yoryantra is a professional-grade platform dedicated to providing <strong>uncommon technical utilities</strong> 
        and regional converters for the global developer community. 
      </p>
      <h2 className="text-2xl font-bold mt-10 mb-4">Our Mission</h2>
      <p className="mb-6">
        Most tool websites focus on common tasks like JSON formatting. We focus on the <strong>Long Tail</strong>: 
        the specific, difficult, and regional technical challenges that developers face daily but find no modern 
        solutions for. From legacy encoding transformations to niche infrastructure configurations, 
        Yoryantra is built for precision.
      </p>
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-2">Technical Excellence</h3>
        <p className="text-blue-900 text-sm">
          Built using Next.js and deployed on Cloudflare's Edge Network, our tools are designed to be 
          serverless, secure, and lightning-fast. Your data never leaves your browser.
        </p>
      </div>
    </main>
  );
}