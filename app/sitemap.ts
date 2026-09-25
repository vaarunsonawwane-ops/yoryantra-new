import type { MetadataRoute } from "next";
import { tools } from "@/app/data/tools";

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
    "/terms",
    "/sitemap",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
  }));

  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
  }));

  return [...staticEntries, ...toolEntries];
}
