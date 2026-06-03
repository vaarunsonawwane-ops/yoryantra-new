import Link from "next/link";

export default function Footer() {
  return (
	<footer className="border-t border-gray-100 bg-white mt-12">
	  <div className="max-w-7xl mx-auto px-6 py-10">

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">

          {/* BRAND */}
          <div className="max-w-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Yoryantra
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Practical browser tools for everyday work.
            </p>
          </div>

          {/* LINKS */}
          <div className="flex flex-wrap gap-10 text-sm">

			{/* RESOURCES */}
			<div className="flex flex-col gap-2">
			  <p className="font-semibold text-gray-900">
				Resources
			  </p>

			  <Link
				href="/developers"
				className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			  >
				Developers
			  </Link>
			  
			  <Link
			    href="/seo-resources"
			    className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			  >
				SEO Resources
			  </Link>
			  
			   <Link
				href="/security-guides"
				className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			  >
				Security Guides
			  </Link>
			  
			  <Link
			   href="/json-guides"
			   className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			  >
			   JSON Guides
			  </Link>
			  

			  <Link
				href="/devops-resources"
				className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			  >
				DevOps Resources
			  </Link>
			  
			  <Link
				href="/encoding-guides"
				className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			  >
				Encoding Guides
			  </Link>			  
			  
			  
			  <Link
				href="/categories"
				className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			  >
				Categories
			  </Link>

			  <Link
				href="/tools"
				className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			  >
				Tools
			  </Link>

			  <Link
				href="/sitemap"
				className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			  >
				Sitemap
			  </Link>
			</div>

            {/* TOOLS */}
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-900">
                Tools
              </p>

              <Link
                href="/tools"
                className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
              >
                All Tools
              </Link>
            </div>

            {/* COMPANY */}
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-900">
                Company
              </p>

              <Link
                href="/about"
                className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
              >
                About
              </Link>

              <Link
                href="/contact"
                className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
              >
                Contact
              </Link>
            </div>

            {/* LEGAL */}
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-900">
                Legal
              </p>

              <Link
                href="/privacy-policy"
                className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
              >
                Terms
              </Link>
			  
			  <Link
				href="/disclaimer"
				className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			  >
				Disclaimer
			  </Link> 
			  
			   </div>

          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-100 mt-8 pt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-sm text-gray-500">

          <p>
            © {new Date().getFullYear()} Yoryantra. All rights reserved.
          </p>

		  <p className="text-sm font-medium text-[var(--light-gold)]">
		    Built with Gratitude 🙏
		  </p>

        </div>

      </div>
    </footer>
  );
}