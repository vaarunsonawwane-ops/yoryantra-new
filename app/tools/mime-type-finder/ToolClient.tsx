"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type MediaEntry = {
  type: string;
  extensions: string[];
  note: string;
  aliases?: string[];
  registryNote?: string;
};

const MEDIA_ENTRIES: MediaEntry[] = [
  { type: "text/html", extensions: ["html", "htm"], note: "HTML documents." },
  { type: "text/css", extensions: ["css"], note: "CSS stylesheets." },
  { type: "text/javascript", extensions: ["js", "mjs", "cjs"], note: "JavaScript. application/javascript is obsolete in favor of text/javascript.", aliases: ["application/javascript"] },
  { type: "application/json", extensions: ["json"], note: "JSON documents and API payloads." },
  { type: "application/ld+json", extensions: ["jsonld"], note: "JSON-LD linked-data documents." },
  { type: "application/manifest+json", extensions: ["webmanifest"], note: "Web application manifests." },
  { type: "application/xml", extensions: ["xml"], note: "XML documents. text/xml is also registered; the best Content-Type depends on the protocol and content." },
  { type: "application/yaml", extensions: ["yaml", "yml"], note: "YAML documents; application/yaml is the registered media type." },
  { type: "text/plain", extensions: ["txt", "log"], note: "Plain text." },
  { type: "text/csv", extensions: ["csv"], note: "Comma-separated values." },
  { type: "text/markdown", extensions: ["md", "markdown"], note: "Markdown text." },
  { type: "text/calendar", extensions: ["ics"], note: "iCalendar data." },
  { type: "text/vcard", extensions: ["vcf"], note: "vCard contact data." },
  { type: "application/pdf", extensions: ["pdf"], note: "PDF documents." },
  { type: "application/rtf", extensions: ["rtf"], note: "Rich Text Format." },
  { type: "application/zip", extensions: ["zip"], note: "ZIP archives." },
  { type: "application/gzip", extensions: ["gz", "gzip"], note: "Gzip-compressed data. A name such as archive.tar.gz is still gzip at the outer file layer." },
  { type: "application/wasm", extensions: ["wasm"], note: "WebAssembly binary modules." },
  { type: "application/msword", extensions: ["doc"], note: "Legacy Microsoft Word documents." },
  { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extensions: ["docx"], note: "Office Open XML Word documents." },
  { type: "application/vnd.ms-excel", extensions: ["xls"], note: "Legacy Microsoft Excel workbooks." },
  { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extensions: ["xlsx"], note: "Office Open XML Excel workbooks." },
  { type: "application/vnd.ms-powerpoint", extensions: ["ppt"], note: "Legacy Microsoft PowerPoint presentations." },
  { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extensions: ["pptx"], note: "Office Open XML PowerPoint presentations." },
  { type: "image/png", extensions: ["png"], note: "PNG images." },
  { type: "image/jpeg", extensions: ["jpg", "jpeg", "jpe"], note: "JPEG images." },
  { type: "image/gif", extensions: ["gif"], note: "GIF images." },
  { type: "image/svg+xml", extensions: ["svg"], note: "SVG vector images." },
  { type: "image/webp", extensions: ["webp"], note: "WebP images." },
  { type: "image/avif", extensions: ["avif"], note: "AVIF images." },
  { type: "image/heic", extensions: ["heic"], note: "HEIC images." },
  { type: "image/bmp", extensions: ["bmp"], note: "BMP images." },
  { type: "image/vnd.microsoft.icon", extensions: ["ico"], note: "Microsoft icon files." },
  { type: "image/tiff", extensions: ["tif", "tiff"], note: "TIFF images." },
  { type: "audio/mpeg", extensions: ["mp3"], note: "MPEG audio, commonly MP3." },
  { type: "audio/aac", extensions: ["aac"], note: "AAC audio." },
  { type: "audio/vnd.wave", extensions: ["wav"], note: "Registered WAVE media type. The unregistered audio/wav spelling is also common in browser tooling.", registryNote: "IANA-registered vendor-tree type" },
  { type: "audio/ogg", extensions: ["oga", "ogg"], note: "Ogg audio container." },
  { type: "video/mp4", extensions: ["mp4", "m4v"], note: "MP4 video." },
  { type: "video/webm", extensions: ["webm"], note: "Common WebM media type used by browsers and web servers.", registryNote: "Common web value; not listed in the IANA Media Types registry used for this review" },
  { type: "video/ogg", extensions: ["ogv"], note: "Ogg video." },
  { type: "font/woff", extensions: ["woff"], note: "WOFF web fonts." },
  { type: "font/woff2", extensions: ["woff2"], note: "WOFF2 web fonts." },
  { type: "font/ttf", extensions: ["ttf"], note: "TrueType fonts." },
  { type: "font/otf", extensions: ["otf"], note: "OpenType fonts." },
];

function extractExtension(input: string): string {
  const withoutQuery = input.split(/[?#]/)[0].trim();
  const normalizedPath = withoutQuery.replace(/\\/g, "/");
  const fileName = normalizedPath.split("/").pop() || normalizedPath;

  if (fileName.charAt(0) === "." && fileName.indexOf(".", 1) === -1) {
    return fileName.slice(1).toLowerCase();
  }

  const dot = fileName.lastIndexOf(".");
  if (dot >= 0 && dot < fileName.length - 1) return fileName.slice(dot + 1).toLowerCase();
  return fileName.replace(/^\./, "").toLowerCase();
}

function findByExtension(extension: string): MediaEntry | null {
  for (const entry of MEDIA_ENTRIES) {
    if (entry.extensions.indexOf(extension) !== -1) return entry;
  }
  return null;
}

function findByMediaType(type: string): { entry: MediaEntry; alias: boolean } | null {
  const cleaned = type.split(";", 1)[0].trim().toLowerCase();
  for (const entry of MEDIA_ENTRIES) {
    if (entry.type === cleaned) return { entry, alias: false };
    if (entry.aliases && entry.aliases.indexOf(cleaned) !== -1) return { entry, alias: true };
  }
  return null;
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const findMimeType = () => {
    const raw = input.trim();
    if (!raw) {
      setOutput("");
      return;
    }

    if (/^[^\s/]+\/[^\s/]+(?:\s*;.*)?$/i.test(raw)) {
      const foundType = findByMediaType(raw);
      if (!foundType) {
        setOutput("Media type not found in this bundled common-type table. The IANA registry is much larger, so an unknown result here does not mean the media type is invalid.");
        return;
      }

      const entry = foundType.entry;
      const lines = [
        foundType.alias ? "Known obsolete/alias media type" : "Known media type",
        "",
        "Media type: " + entry.type,
        "Common extensions: " + entry.extensions.map((extension) => "." + extension).join(", "),
        "Note: " + entry.note,
      ];
      if (entry.registryNote) lines.push("Registry note: " + entry.registryNote);
      if (foundType.alias) lines.push("Input note: " + raw.split(";", 1)[0].trim() + " is retained as an alias/obsolete form; prefer " + entry.type + ".");
      setOutput(lines.join("\n"));
      return;
    }

    const extension = extractExtension(raw);
    if (!extension || !/^[a-z0-9][a-z0-9+_-]*$/i.test(extension)) {
      setOutput("Could not extract a simple file extension. Enter something like .json, app.js, archive.tar.gz, or application/json.");
      return;
    }

    const entry = findByExtension(extension);
    if (!entry) {
      setOutput(
        "No common mapping found for ." +
          extension +
          ". Extension lookup is only a convention table; it does not inspect file bytes or prove the actual Content-Type."
      );
      return;
    }

    setOutput(
      [
        "Common extension mapping",
        "",
        "Input extension: ." + extension,
        "Media type: " + entry.type,
        "Other common extensions: " + entry.extensions.map((item) => "." + item).join(", "),
        "Note: " + entry.note,
        ...(entry.registryNote ? ["Registry note: " + entry.registryNote] : []),
        "",
        "Important: a filename extension cannot verify the file's real contents. Server configuration or content inspection can produce a different result.",
      ].join("\n")
    );
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolShell
      title="MIME Type Finder"
      description="Look up common media types from file names or extensions, or reverse-check a known media type."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          File Name, Extension, or Media Type
        </label>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="app.js or application/json"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={findMimeType} className="yoryantra-btn">Find Media Type</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Media Type Result</h3>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Extension or media type details will appear here."}
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Extension Lookup Is a Hint, Not File Detection</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A media type (historically called a MIME type) describes the format of transferred content, such as <code>application/json</code>, <code>text/css</code>, or <code>image/png</code>. This tool maps common filename extensions to practical Content-Type values and can reverse-check media types that are in its bundled table.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The mapping is intentionally described as a convention. A file named <code>photo.jpg</code> can still contain something other than JPEG data, and a server can send any configured Content-Type. Upload validation and security checks should inspect trusted metadata and, where appropriate, the file contents instead of trusting the extension alone.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A Few Modern Details That Matter</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><code>.js</code> maps to <code>text/javascript</code>; IANA lists <code>application/javascript</code> as obsolete in favor of it.</li>
            <li><code>.yaml</code> and <code>.yml</code> use the registered <code>application/yaml</code> media type.</li>
            <li>Web fonts use the <code>font/*</code> top-level types such as <code>font/woff2</code> and <code>font/ttf</code>.</li>
            <li>A compound filename such as <code>backup.tar.gz</code> is looked up by its outer <code>.gz</code> extension; the tool does not unpack archives.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When to Use the Result</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            The lookup is useful when checking an HTTP <code>Content-Type</code> header, configuring static assets, reviewing CDN rules, preparing upload allowlists, or debugging a browser that refuses to load a resource because its declared type does not match the expected context.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference and Limits</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            IANA registrations are the primary reference for media type names in this table. A small number of common web values are labeled when they are widely used but are not present in the IANA registry reviewed for this release. The registry contains far more types than this practical extension table, and extension associations are not a universal one-to-one standard. No file is uploaded or sniffed by this page.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/mime-type-finder" />
        </div>
      </section>
    </ToolShell>
  );
}
