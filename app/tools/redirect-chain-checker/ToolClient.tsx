"use client";
              <p className="mt-2 text-gray-600 leading-relaxed">
                Use 301 redirects for permanent URL changes and 302 redirects for temporary changes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool detect redirect loops?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Browser-based checks may not always fully expose redirect loops, but repeated redirect behavior can indicate a loop issue.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Redirect analysis often connects with canonical URLs, HTTP headers,
            technical SEO debugging, sitemap management, and crawl optimization.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/redirect-checker"
              className="yoryantra-btn-outline"
            >
              Redirect Checker
            </Link>

            <Link
              href="/tools/canonical-url-checker"
              className="yoryantra-btn-outline"
            >
              Canonical URL Checker
            </Link>

            <Link
              href="/tools/http-headers-checker"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Checker
            </Link>

            <Link
              href="/tools/sitemap-generator"
              className="yoryantra-btn-outline"
            >
              Sitemap Generator
            </Link>

            <Link
              href="/categories/seo-tools"
              className="yoryantra-btn-outline"
            >
              SEO Tools
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}