export default function HomePage() {
  return (
    <main className="bg-white text-gray-900">
      <style>{`
        :root {
          --gold: #d4a514;
          --green: #256b45;
          --dark: #2f3a45;
          --light: #f8f8f6;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* HERO */}
      <section
        id="home"
        className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center"
      >
        {/* LEFT */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-50 text-sm font-medium mb-8"
            style={{ color: "#946c00" }}
          >
            ✦ Built for You
          </div>

          <h2 className="text-5xl md:text-6xl font-bold leading-tight text-[var(--dark)]">
            Practical everyday tools that are
            <span className="text-[var(--green)]"> fast, clean, and built to save time.</span>
          </h2>

          <p className="mt-8 text-xl text-gray-600 leading-relaxed max-w-2xl">
            Modern tools, smart converters, encoding utilities, formatting helpers,
            and niche developer utilities without too much ads chaos and unnecessary clutter.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">
            <a
			  href="/tools"
			  className="px-8 py-4 rounded-xl text-white font-medium transition hover:opacity-90"
              style={{ backgroundColor: "var(--gold)" }}
            >
              Explore Tools →
            </a>

            <a
			  href="/categories"
              className="px-8 py-4 rounded-xl border font-medium transition hover:bg-green-50"
              style={{
                borderColor: "var(--green)",
                color: "var(--green)",
              }}
            >
              View Categories
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative">
          <div
            className="absolute top-10 right-10 w-72 h-72 rounded-full opacity-20"
            style={{ backgroundColor: "#f5d980" }}
          ></div>

          <div className="relative bg-white rounded-[2rem] border border-gray-200 shadow-xl p-10">
            <div className="flex gap-3 mb-8">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            </div>

            <div className="space-y-5">
              <div className="h-5 rounded-full bg-gray-100 w-3/4"></div>

              <div className="h-5 rounded-full bg-gray-100 w-2/3"></div>

              <div className="grid grid-cols-3 gap-4 mt-10">
                <div className="rounded-2xl p-5 bg-green-50 flex items-center justify-center">
                  📄
                </div>

                <div className="rounded-2xl p-5 bg-yellow-50 flex items-center justify-center">
                  ✓
                </div>

                <div className="rounded-2xl p-5 bg-gray-100 flex items-center justify-center">
                  ↻
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="bg-[var(--light)] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-[var(--dark)]">
              Explore by Categories
            </h3>

            <div
              className="w-20 h-[4px] rounded-full mx-auto mt-5"
              style={{ backgroundColor: "var(--gold)" }}
            ></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔄",
                title: "Converters & Transformers",
                desc: "Base64, JSON, text, encoding, decoding, and format conversion tools people search daily.",
              },
              {
                icon: "⚡",
                title: "Quick Utility Tools",
                desc: "Fast tools for timestamps, UUIDs, word counters, slug generators, and everyday tasks.",
              },
              {
                icon: "🧠",
                title: "Text & Data Utilities",
                desc: "Regex tester, case converter, diff checker, CSV tools, and smart text processors.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white border border-gray-200 rounded-3xl p-10 hover:shadow-xl transition"
              >
                <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                  {item.icon}
                </div>

                <h4 className="mt-8 text-2xl font-semibold text-[var(--green)]">
                  {item.title}
                </h4>

                <p className="mt-5 text-gray-600 leading-relaxed">
                  {item.desc}
                </p>

                <a
                  href="#"
                  className="inline-block mt-8 font-medium text-[var(--green)]"
                >
                  Explore →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-[var(--dark)]">
            About YORYANTRA
          </h3>

          <div
            className="w-20 h-[4px] rounded-full mx-auto mt-5"
            style={{ backgroundColor: "var(--gold)" }}
          ></div>

          <p className="mt-10 text-xl text-gray-600 leading-relaxed">
            YORYANTRA is a growing platform focused on creating thoughtful digital
            utilities for modern workflows, productivity, and structured work.
            Built with Gratitude reflects the intention behind the platform —
            creating practical tools that genuinely help people work better and
            simplify everyday professional tasks.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="py-24 text-white"
        style={{ backgroundColor: "var(--green)" }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold">
            Contact
          </h3>

          <p className="mt-6 text-lg text-green-100">
            Questions, ideas, or collaborations.
          </p>

          <p className="mt-8 text-2xl font-medium">
            contact@yoryantra.com
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <div className="inline-block">
            <h4 className="text-3xl font-light tracking-wide text-[var(--dark)]">
              Yoryantra
            </h4>

            <div
              className="h-[6px] rounded-sm mt-4 w-full"
              style={{ backgroundColor: "var(--gold)" }}
            ></div>
          </div>

          <p className="mt-5 italic text-gray-500">
            Built with Gratitude
          </p>

          <p className="mt-6 text-gray-600">
            Smart utilities for structured workflows, productivity, and modern
            work.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}