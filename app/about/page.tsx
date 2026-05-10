import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto p-8 md:p-16 text-slate-800 font-sans">
      <h1 className="text-4xl font-black mb-8 tracking-tight text-slate-900">About Yoryantra</h1>
      
      <div className="space-y-6 text-lg leading-relaxed">
        <p>
          <strong>Yoryantra</strong> is your very own friendly platform dedicated to helping you with those 
          common or uncommon tools which you, as a developer, need on a daily basis. 
        </p>

        <p>
          Too often, you can't find these tools easily, or there is simply no modern solution available; be it 
          technical utilities, converters, or simple calculation tools. And if you do find one, it’s usually 
          loaded with too many ads. Trust me, I have faced a similar problems. It feels like wasting time just closing 
          pop-ups before you can even use the tool you came for.
        </p>

        <p>
          I deeply felt there should be a platform that doesn't waste your time. At Yoryantra, we don't do 
          generic converters, and we won’t make you hunt for the "X" to close a popup. We give you exactly 
          what you are looking for; from legacy encoding transformations to niche infrastructure configurations. 
          In a subtle way, we might show minimal ads just for our survival and to keep this project running, 
          but never at the cost of your experience. 

        </p>
        <p>
          The name "Yoryantra" came to me while I was thinking about the <strong><em>Shrimad Bhagwat Geeta</em></strong>. 
          Being a spiritual person, I was looking for a name connected to my Sanatani roots with a meaning relevant in today's digital world. 
          <strong>Yor (Your) + Yantra (Machine/Tool)</strong>strong> Yantra is a Sanskrit word and quite literally it means machine or tool.
        </p>
        <p>
          I am <strong>Vaarun Sonawwane</strong>, an IT professional with 9 years of experience. I passionately want to give back to society and help whoever I can in this universe through <strong>Yoryantra</strong>.
        </p>
        <p>
          You can find my specific details on the <Link href="/contact" className="text-blue-600 underline hover:text-blue-800">Contact Us</Link> page.
        </p>

        <p className="text-xl font-semibold pt-8">
          Thank you, and Gratitude!!
        </p>
      </div>
    </main>
  );
}
