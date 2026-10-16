/**
 * Shared, server-only article navigation. MDX content remains the single source
 * of truth; editorial drafts do not need manually authored anchor links.
 */
export type BlogSection = { title: string; id: string };

function headingLabel(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\\([\\`*{}\[\]()#+.!_>-])/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionSlug(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";
}

/** Collect top-level H2 headings, ignoring literal headings inside code fences. */
export function collectBlogSections(source: string): BlogSection[] {
  const sections: BlogSection[] = [];
  const seen = new Map<string, number>();
  let fenceMarker = "";
  let fenceLength = 0;

  for (const line of source.split(/\r?\n/)) {
    const fence = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fence) {
      const marker = fence[1][0];
      if (!fenceMarker) {
        fenceMarker = marker;
        fenceLength = fence[1].length;
        continue;
      }
      if (fenceMarker === marker && fence[1].length >= fenceLength &&
          /^\s*$/.test(line.slice(fence[0].length))) {
        fenceMarker = "";
        fenceLength = 0;
        continue;
      }
    }
    if (fenceMarker) continue;

    // Article navigation uses section-level headings only, never H3 details.
    const match = /^ {0,3}##(?:\s+|$)(.*?)(?:\s+#+\s*)?$/.exec(line);
    if (!match) continue;
    const title = headingLabel(match[1]);
    if (!title) continue;
    const base = sectionSlug(title);
    const occurrence = (seen.get(base) ?? 0) + 1;
    seen.set(base, occurrence);
    sections.push({ title, id: occurrence === 1 ? base : `${base}-${occurrence}` });
  }
  return sections;
}

/** Keep navigation short, and avoid a table of contents on brief posts. */
export function selectBlogTocSections(sections: BlogSection[], source: string): BlogSection[] {
  if (sections.length < 4) return [];
  let inFence = false;
  const prose: string[] = [];
  for (const line of source.split(/\r?\n/)) {
    if (/^ {0,3}(`{3,}|~{3,})/.test(line)) { inFence = !inFence; continue; }
    if (!inFence && !/^\s*[|#<>]/.test(line)) prose.push(line);
  }
  // The article must have enough explanatory prose for jump navigation to help.
  if ((prose.join(" ").match(/[\p{L}\p{N}]+/gu)?.length ?? 0) < 900) return [];

  const useful = sections.filter(({ title }) =>
    !/^(sources? and (?:test )?basis|references?(?: and .*)?|where yoryantra(?:'s)?(?: tools)? (?:can )?(?:help|fit)|the practical rule|final thoughts)$/i.test(title)
  );
  return useful.length >= 4 ? useful.slice(0, 8) : [];
}

/**
 * Remark transform attaches exactly the same IDs used in the navigation.
 * The MDX renderer still owns HTML headings; no manual MDX edits are needed.
 */
export function remarkBlogHeadingAnchors(sections: BlogSection[]) {
  return function attachAnchors() {
    return function transform(tree: unknown) {
      const root = tree as { children?: unknown[] };
      let sectionIndex = 0;
      for (const child of root.children ?? []) {
        if (!child || typeof child !== "object") continue;
        const node = child as {
          type?: string;
          depth?: number;
          data?: { hProperties?: Record<string, unknown> };
        };
        if (node.type !== "heading" || node.depth !== 2) continue;
        const section = sections[sectionIndex++];
        if (!section) continue;
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, id: section.id },
        };
      }
    };
  };
}
