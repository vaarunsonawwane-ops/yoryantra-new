import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { BLOG_RELEASE_ENABLED } from "../blog-config";
import { getRenderableArticle, getRenderableArticles } from "../blog-data";
import "../blog.css";

type PageProps = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  const articles = getRenderableArticles();
  // Next.js static export requires at least one path, even before the Blog launches.
  // The reserved path renders a 404; no draft or READY article is exported.
  return articles.length
    ? articles.map((article) => ({ slug: article.slug }))
    : [{ slug: "__c10-unpublished" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getRenderableArticle(slug);
  if (!article) notFound();
  const path = `/blog/${article.slug}`;
  return {
    title: `${article.title} | Yoryantra`,
    description: article.description,
    alternates: BLOG_RELEASE_ENABLED ? { canonical: path } : undefined,
    robots: BLOG_RELEASE_ENABLED ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: BLOG_RELEASE_ENABLED ? {
      type: "article", title: article.title, description: article.description,
      url: path, publishedTime: article.datePublished ?? undefined,
      modifiedTime: article.dateModified ?? undefined,
    } : undefined,
  };
}

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

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getRenderableArticle(slug);
  if (!article) notFound();

  const canonical = `https://yoryantra.com/blog/${article.slug}`;
  const jsonLd = BLOG_RELEASE_ENABLED && article.datePublished ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: canonical,
    datePublished: article.datePublished,
    ...(article.dateModified ? { dateModified: article.dateModified } : {}),
    author: { "@type": "Person", name: article.author, url: "https://yoryantra.com/about" },
    publisher: { "@type": "Organization", name: "Yoryantra", url: "https://yoryantra.com" },
  } : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }} />
      )}
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        <Link className="yoryantra-blog-breadcrumb-link" href="/">Home</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <Link className="yoryantra-blog-breadcrumb-link" href="/blog">Blog</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span aria-current="page">{article.title}</span>
      </nav>
      {!BLOG_RELEASE_ENABLED && (
        <p role="status" className="yoryantra-blog-preview-note mt-6 px-4 py-3 text-sm">
          Local C10 preview — not published.
        </p>
      )}
      <header className="mt-8 max-w-3xl border-b border-gray-200 pb-8">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--green)]">{article.topic} · {readerArticleType(article.articleType)}</p>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">{article.title}</h1>
        <p className="mt-5 text-base leading-7 text-gray-700">{article.description}</p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
          <span>By {article.author}</span>
          {article.datePublished && BLOG_RELEASE_ENABLED && (
            <time dateTime={article.datePublished}>Published {readableDate(article.datePublished)}</time>
          )}
          {article.dateModified && article.dateModified !== article.datePublished && BLOG_RELEASE_ENABLED && (
            <time dateTime={article.dateModified}>Updated {readableDate(article.dateModified)}</time>
          )}
        </div>
      </header>
      <article className="yoryantra-blog-prose mx-auto mt-9 max-w-3xl">
        <MDXRemote source={article.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </article>
      <nav aria-label="Return to Blog" className="mx-auto mt-12 max-w-3xl border-t border-gray-200 pt-7">
        <Link className="yoryantra-blog-back-link inline-flex items-center gap-2 text-sm" href="/blog">← Back to Blog</Link>
      </nav>
    </main>
  );
}
