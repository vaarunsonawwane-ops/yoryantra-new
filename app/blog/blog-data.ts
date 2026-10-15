import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import {
  BLOG_LOCAL_PREVIEW_ENABLED,
  BLOG_RELEASE_ENABLED,
} from "./blog-config";

export type BlogStatus = "draft" | "ready" | "published";
export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  topic: string;
  articleType: string;
  author: string;
  datePublished: string | null;
  dateModified: string | null;
  status: BlogStatus;
  relatedTools: string[];
  relatedResources: string[];
  sources: string[];
  content: string;
};

const directory = join(process.cwd(), "content", "blog");
const yamlFrontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
const validDate = /^\d{4}-\d{2}-\d{2}$/;
const topics = new Set([
  "Developer", "DevOps", "Encoding", "JSON & Data", "Security", "SEO",
]);

function optionalDate(value: unknown, name: string, file: string): string | null {
  if (value == null) return null;
  if (typeof value !== "string" || !validDate.test(value) ||
    Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error(`${file}: invalid ${name}; use YYYY-MM-DD or null`);
  }
  return value;
}

function strings(value: unknown, file: string, field: string): string[] {
  if (value == null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${file}: ${field} must contain strings`);
  }
  return value;
}

function parseArticle(filename: string): BlogArticle {
  const source = readFileSync(join(directory, filename), "utf8");
  const match = yamlFrontmatter.exec(source);
  if (!match) throw new Error(`${filename}: missing YAML frontmatter`);
  const data = YAML.parse(match[1]) as Record<string, unknown>;
  const required = ["slug", "title", "description", "topic", "articleType", "author"];
  for (const field of required) {
    if (typeof data[field] !== "string" || !String(data[field]).trim()) {
      throw new Error(`${filename}: missing ${field}`);
    }
  }
  const slug = String(data.slug);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${filename}: unsafe slug ${slug}`);
  }
  if (!topics.has(String(data.topic))) {
    throw new Error(`${filename}: invalid topic ${data.topic}`);
  }
  if (!["draft", "ready", "published"].includes(String(data.status))) {
    throw new Error(`${filename}: invalid status ${data.status}`);
  }
  const published = optionalDate(data.datePublished, "datePublished", filename);
  const modified = optionalDate(data.dateModified, "dateModified", filename);
  if (modified && !published) {
    throw new Error(`${filename}: modification date without publication date`);
  }
  if (published && modified && modified < published) {
    throw new Error(`${filename}: modification precedes publication`);
  }
  return {
    slug,
    title: String(data.title),
    description: String(data.description),
    topic: String(data.topic),
    articleType: String(data.articleType),
    author: String(data.author),
    datePublished: published,
    dateModified: modified,
    status: data.status as BlogStatus,
    relatedTools: strings(data.relatedTools, filename, "relatedTools"),
    relatedResources: strings(data.relatedResources, filename, "relatedResources"),
    sources: strings(data.sources, filename, "sources"),
    content: source.slice(match[0].length),
  };
}

function allLocalArticles(): BlogArticle[] {
  const files = readdirSync(directory).filter((file) => file.endsWith(".mdx"));
  const articles = files.map(parseArticle);
  const slugs = articles.map((item) => item.slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Duplicate Blog slug(s); publication blocked");
  }

  return articles;
}

/** Only explicitly published files can be public; other MDX remain inaccessible.
 * Publishing a new article later requires its own C9-style content approval.
 */
export function getPublishedArticles(): BlogArticle[] {
  if (!BLOG_RELEASE_ENABLED) return [];
  const articles = allLocalArticles();
  const published = articles.filter((article) => article.status === "published");
  for (const article of published) {
    if (!article.datePublished) {
      throw new Error(`${article.slug}: published article needs a factual datePublished`);
    }
  }
  return published.sort((a, b) =>
    b.datePublished!.localeCompare(a.datePublished!) || a.title.localeCompare(b.title)
  );
}

/** Local-only C10 preview. Hidden from production visitors, nav and sitemap. */
export function getRenderableArticles(): BlogArticle[] {
  if (BLOG_LOCAL_PREVIEW_ENABLED && !BLOG_RELEASE_ENABLED) {
    return allLocalArticles()
      .filter((a) => a.status === "ready" || a.status === "published")
      .sort((a, b) => a.title.localeCompare(b.title));
  }
  return getPublishedArticles();
}

export function isPublicBlog(): boolean {
  return BLOG_RELEASE_ENABLED && getPublishedArticles().length > 0;
}

export function getRenderableArticle(slug: string): BlogArticle | undefined {
  return getRenderableArticles().find((article) => article.slug === slug);
}
