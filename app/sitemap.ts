import type { MetadataRoute } from "next";
import { tools } from "@/app/data/tools";
import { getPublishedArticles } from "@/app/blog/blog-data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://yoryantra.com";

  const staticPages = [
    "",
    "/tools",
    "/categories",
    "/categories/developer-tools",
    "/categories/encoding-tools",
    "/categories/json-tools",
    "/categories/security-tools",
    "/categories/seo-tools",
    "/categories/devops-tools",
    "/resources",
    "/developers",
    "/devops-resources",
    "/encoding-guides",
    "/json-guides",
    "/security-guides",
    "/seo-resources",
    "/how-yoryantra-tools-are-built",
    "/about",
    "/contact",
    "/privacy-policy",
    "/sitemap",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
  }));

  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
  }));

  // Only the individually approved, published articles enter the public sitemap.
  const published = getPublishedArticles();
  const blogEntries: MetadataRoute.Sitemap = published.length > 0
    ? [
        { url: `${baseUrl}/blog` },
        ...published.map((article) => ({
          url: `${baseUrl}/blog/${article.slug}`,
          lastModified: new Date(`${article.dateModified ?? article.datePublished}T00:00:00Z`),
        })),
      ]
    : [];

  return [...staticEntries, ...toolEntries, ...blogEntries];
}
