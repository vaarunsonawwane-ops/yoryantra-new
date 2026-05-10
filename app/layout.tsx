import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { Mail, Shield, Info, Cpu, Menu } from 'lucide-react';
import './globals.css';

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '700', '800'],
  variable: '--font-poppins' 
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins bg-white text-charcoal min-h-screen flex flex-col antialiased">
        
        {/* HEADER: Sticky with Top-Left Brand Alignment */}
        <nav className="py-8 px-6 md:px-12 border-b border-light-gold sticky top-0 bg-white/95 backdrop-blur-md z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            
            {/* FINALIZED LOGO: Top-Left, 22° Rise, Poppins Bold */}
            <Link href="/" className="relative group no-underline">
              <div className="flex flex-col items-start transform -rotate-[22deg] origin-left transition-transform hover:scale-105 active:scale-95">
                <span className="text-3xl md:text-4xl font-[800] tracking-tighter text-charcoal leading-none">
                  Yoryantra
                </span>
                {/* Gold Underline: Length matched Y to a */}
                <div className="w-full h-[5px] bg-gold mt-2 rounded-full shadow-sm"></div>
              </div>
            </Link>

            {/* NAVIGATION LINKS */}
            <div className="hidden md:flex items-center gap-10 font-bold text-xs uppercase tracking-[0.2em] text-charcoal/60">
              <Link href="/" className="hover:text-gold transition-colors">Tools</Link>
              <Link href="/about" className="hover:text-gold transition-colors">About</Link>
              <Link href="/contact" className="hover:text-gold transition-colors">Contact</Link>
              <Link href="/contact" className="bg-emerald text-white px-6 py-2.5 rounded-lg hover:bg-golden-yellow hover:text-charcoal transition-all shadow-md active:translate-y-0.5">
                Support
              </Link>
            </div>

            {/* Mobile Menu Icon for S24 Viewport */}
            <div className="md:hidden text-charcoal">
              <Menu size={28} />
            </div>
          </div>
        </nav>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-grow">
          {children}
        </main>

        {/* FOOTER: Minimalist with Light Gold Border */}
        <footer className="bg-white border-t-4 border-light-gold py-16 px-8 mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gold">
                <Cpu size={24} />
                <span className="font-black text-xl tracking-tighter">YORYANTRA</span>
              </div>
              <p className="text-sm leading-relaxed opacity-60 max-w-xs">
                A professional suite of uncommon technical utilities built for speed, precision, and the modern developer workflow.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-charcoal/80">
              <Link href="/about" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Info size={16} /> The Founder
              </Link>
              <Link href="/contact" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Mail size={16} /> Contact Support
              </Link>
              <Link href="#" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Shield size={16} /> Privacy Policy
              </Link>
            </div>

            {/* Signature Section */}
            <div className="md:text-right flex flex-col justify-end">
              <p className="text-xs font-bold text-gold uppercase tracking-[0.4em]">Built with Gratitude</p>
              <p className="text-[10px] opacity-40 mt-2 italic">
                © 2026 Vaarun Sonawwane. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}