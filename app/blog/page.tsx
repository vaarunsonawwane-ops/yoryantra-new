import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_RELEASE_ENABLED } from "./blog-config";
import { getRenderableArticles } from "./blog-data";
import "./blog.css";

export const metadata: Metadata = {
  title: "Blog | Yoryantra",
  description: "Practical explanations and troubleshooting guides for development, DevOps and technical SEO.",
  alternates: BLOG_RELEASE_ENABLED ? { canonical: "/blog" } : undefined,
  robots: BLOG_RELEASE_ENABLED ? { index: true, follow: true } : { index: false, follow: false },
};

function readableDate(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

function readerArticleType(value: string) {
  if (value === "Evergreen") return "Guide";
  if (value === "Comparison / Explainer") return "Comparison";
  return value;
}

export default function BlogIndex() {
  const articles = getRenderableArticles();
  if (!articles.length) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        <Link href="/" className="yoryantra-blog-breadcrumb-link">Home</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span aria-current="page">Blog</span>
      </nav>
      <header className="mb-10 mt-7 max-w-3xl">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">Technical guides and explanations</h1>
        <p className="mt-4 text-base leading-7 text-gray-700">
          Understand what a tool result means, diagnose failures, and choose the next step in a technical workflow.
        </p>
        {!BLOG_RELEASE_ENABLED && (
          <p className="yoryantra-blog-preview-note mt-4 px-4 py-3 text-sm" role="status">
            Local C10 preview. These articles are not published.
          </p>
        )}
      </header>
      <section aria-labelledby="blog-articles-heading">
        <h2 id="blog-articles-heading" className="mb-5 text-xl font-semibold text-gray-900">Articles</h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {articles.map((article) => (
          <article key={article.slug} className="min-w-0">
            <Link
              href={`/blog/${article.slug}`}
              className="yoryantra-blog-card group flex h-full flex-col rounded-2xl p-5 sm:p-6"
              aria-label={`Read ${article.title}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
                {article.topic} <span className="mx-2 text-gray-400">·</span> {readerArticleType(article.articleType)}
              </p>
              <h3 className="yoryantra-blog-card-title mt-3 text-lg font-bold leading-snug sm:text-xl">
                {article.title}
              </h3>
              <p className="yoryantra-blog-card-description mt-3 text-sm leading-6 text-gray-700">
                {article.description}
              </p>
              {article.datePublished && BLOG_RELEASE_ENABLED && (
                <p className="mt-auto pt-4 text-xs text-gray-600">
                  <time dateTime={article.datePublished}>Published {readableDate(article.datePublished)}</time>
                  {article.dateModified && article.dateModified > article.datePublished && (
                    <>
                      <span className="mx-2 text-gray-400" aria-hidden="true">·</span>
                      <time dateTime={article.dateModified}>Updated {readableDate(article.dateModified)}</time>
                    </>
                  )}
                </p>
              )}
            </Link>
          </article>
        ))}
        </div>
      </section>
    </main>
  );
}
