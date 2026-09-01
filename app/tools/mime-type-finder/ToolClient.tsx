"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type RegistryStatus = "registered" | "obsolete-alias" | "common-unregistered";

type MediaEntry = {
  type: string;
  extensions: string[];
  note: string;
  aliases?: string[];
  status?: RegistryStatus;
};

type LookupResult =
  | {
      kind: "media-type";
      entry: MediaEntry;
      inputType: string;
      parameters: string;
      alias: boolean;
    }
  | {
      kind: "extension";
      entry: MediaEntry;
      extension: string;
      compoundExtension: string;
    }
  | {
      kind: "unknown-type";
      inputType: string;
      parameters: string;
      suffixHint: string;
    }
  | {
      kind: "unknown-extension";
      extension: string;
      compoundExtension: string;
    };

const MEDIA_ENTRIES: MediaEntry[] = [
  { type: "text/html", extensions: ["html", "htm"], note: "HTML documents." },
  { type: "text/css", extensions: ["css"], note: "CSS stylesheets." },
  { type: "text/javascript", extensions: ["js", "mjs", "cjs"], note: "JavaScript source. application/javascript is obsolete in favor of text/javascript.", aliases: ["application/javascript"] },
  { type: "application/json", extensions: ["json"], note: "JSON documents and API payloads." },
  { type: "application/ld+json", extensions: ["jsonld"], note: "JSON-LD linked-data documents." },
  { type: "application/manifest+json", extensions: ["webmanifest"], note: "Web application manifests." },
  { type: "application/xml", extensions: ["xml"], note: "XML documents. text/xml is also registered; protocol context can determine which is appropriate." },
  { type: "text/xml", extensions: [], note: "Registered XML media type. It shares XML syntax with application/xml, but the two registrations have different historical/default charset semantics and protocol context can matter." },
  { type: "application/yaml", extensions: ["yaml", "yml"], note: "YAML documents. application/yaml is the registered media type." },
  { type: "text/plain", extensions: ["txt", "log"], note: "Plain text. A server may add a charset parameter where appropriate." },
  { type: "text/csv", extensions: ["csv"], note: "Comma-separated values." },
  { type: "text/markdown", extensions: ["md", "markdown"], note: "Markdown text." },
  { type: "text/calendar", extensions: ["ics"], note: "iCalendar data." },
  { type: "text/vcard", extensions: ["vcf"], note: "vCard contact data." },

  { type: "application/pdf", extensions: ["pdf"], note: "PDF documents." },
  { type: "application/rtf", extensions: ["rtf"], note: "Rich Text Format documents." },
  { type: "application/zip", extensions: ["zip"], note: "ZIP archives." },
  { type: "application/gzip", extensions: ["gz", "gzip"], note: "Gzip-compressed data. In archive.tar.gz, gzip is the outer file layer." },
  { type: "application/wasm", extensions: ["wasm"], note: "WebAssembly binary modules." },
  { type: "application/octet-stream", extensions: ["bin"], note: "Generic binary data when a more specific media type is not known." },

  { type: "application/msword", extensions: ["doc"], note: "Legacy Microsoft Word documents." },
  { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extensions: ["docx"], note: "Office Open XML Word documents." },
  { type: "application/vnd.ms-excel", extensions: ["xls"], note: "Legacy Microsoft Excel workbooks." },
  { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extensions: ["xlsx"], note: "Office Open XML Excel workbooks." },
  { type: "application/vnd.ms-powerpoint", extensions: ["ppt"], note: "Legacy Microsoft PowerPoint presentations." },
  { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extensions: ["pptx"], note: "Office Open XML PowerPoint presentations." },

  { type: "image/png", extensions: ["png"], note: "PNG images." },
  { type: "image/jpeg", extensions: ["jpg", "jpeg", "jpe"], note: "JPEG images." },
  { type: "image/gif", extensions: ["gif"], note: "GIF images." },
  { type: "image/svg+xml", extensions: ["svg"], note: "SVG vector images. SVG is XML-based and can contain active features, so upload handling should not treat it like an inert bitmap." },
  { type: "image/webp", extensions: ["webp"], note: "WebP images." },
  { type: "image/avif", extensions: ["avif"], note: "AVIF images." },
  { type: "image/heic", extensions: ["heic"], note: "HEIC image files." },
  { type: "image/bmp", extensions: ["bmp"], note: "BMP images." },
  { type: "image/vnd.microsoft.icon", extensions: ["ico"], note: "Microsoft icon files.", aliases: ["image/x-icon"] },
  { type: "image/tiff", extensions: ["tif", "tiff"], note: "TIFF images." },

  { type: "audio/mpeg", extensions: ["mp3"], note: "MPEG audio, commonly MP3." },
  { type: "audio/aac", extensions: ["aac"], note: "AAC audio." },
  { type: "audio/ogg", extensions: ["oga", "ogg"], note: "Ogg audio. The generic .ogg extension is not enough to prove that the contained streams are audio-only; application/ogg or video/ogg can be appropriate in other Ogg workflows." },
  { type: "audio/wav", extensions: ["wav"], note: "Widely used Content-Type for WAVE audio in browsers and web servers. Treat this as a practical mapping rather than an IANA main-registry claim.", status: "common-unregistered" },

  { type: "video/mp4", extensions: ["mp4", "m4v"], note: "MP4 video." },
  { type: "video/ogg", extensions: ["ogv"], note: "Ogg video." },
  { type: "video/webm", extensions: ["webm"], note: "Widely used WebM Content-Type in browsers and web servers. A .webm extension alone cannot prove whether video/webm or audio/webm best describes the contained streams. Treat this as a practical web mapping rather than an IANA main-registry claim.", status: "common-unregistered" },

  { type: "font/woff", extensions: ["woff"], note: "WOFF web fonts." },
  { type: "font/woff2", extensions: ["woff2"], note: "WOFF2 web fonts." },
  { type: "font/ttf", extensions: ["ttf"], note: "TrueType fonts." },
  { type: "font/otf", extensions: ["otf"], note: "OpenType fonts." },
];

const TYPE_TOKEN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

function splitMediaTypeInput(raw: string) {
  const semicolon = raw.indexOf(";");
  const base =
    semicolon === -1 ? raw.trim() : raw.slice(0, semicolon).trim();
  const parameters =
    semicolon === -1 ? "" : raw.slice(semicolon + 1).trim();

  return {
    base: base.toLowerCase(),
    parameters,
  };
}

function looksLikeMediaType(raw: string) {
  const parsed = splitMediaTypeInput(raw);
  const slash = parsed.base.indexOf("/");

  if (
    slash <= 0 ||
    slash === parsed.base.length - 1 ||
    parsed.base.indexOf("/", slash + 1) !== -1
  ) {
    return false;
  }

  const top = parsed.base.slice(0, slash);
  const subtype = parsed.base.slice(slash + 1);

  return TYPE_TOKEN.test(top) && TYPE_TOKEN.test(subtype);
}

function findByMediaType(type: string) {
  const cleaned = type.toLowerCase();

  for (const entry of MEDIA_ENTRIES) {
    if (entry.type === cleaned) {
      return { entry, alias: false };
    }

    if (
      entry.aliases &&
      entry.aliases.some((alias) => alias.toLowerCase() === cleaned)
    ) {
      return { entry, alias: true };
    }
  }

  return null;
}

function findByExtension(extension: string) {
  for (const entry of MEDIA_ENTRIES) {
    if (entry.extensions.includes(extension)) {
      return entry;
    }
  }

  return null;
}

function inspectFileLikeInput(raw: string) {
  const withoutQuery = raw.split(/[?#]/)[0].trim();
  const normalizedPath = withoutQuery.replace(/\\/g, "/");
  const fileName = normalizedPath.split("/").pop() || "";

  if (!fileName) {
    return { extension: "", compoundExtension: "" };
  }

  if (
    fileName.charAt(0) === "." &&
    fileName.indexOf(".", 1) === -1 &&
    normalizedPath !== fileName
  ) {
    return { extension: "", compoundExtension: "" };
  }

  if (
    normalizedPath === fileName &&
    /^\.[A-Za-z0-9][A-Za-z0-9+_-]*$/.test(fileName)
  ) {
    return {
      extension: fileName.slice(1).toLowerCase(),
      compoundExtension: fileName.toLowerCase(),
    };
  }

  const pieces = fileName.split(".").filter(Boolean);

  if (pieces.length < 2) {
    return {
      extension: "",
      compoundExtension: "",
    };
  }

  const extension = pieces[pieces.length - 1].toLowerCase();

  return {
    extension,
    compoundExtension:
      pieces.length >= 3
        ? `.${pieces.slice(-2).join(".").toLowerCase()}`
        : `.${extension}`,
  };
}

function structuredSuffixHint(type: string) {
  if (type.endsWith("+json")) {
    return "The +json structured syntax suffix indicates JSON-based representation semantics, but it does not prove that this specific media type is registered.";
  }

  if (type.endsWith("+xml")) {
    return "The +xml structured syntax suffix indicates XML-based representation semantics, but it does not prove that this specific media type is registered.";
  }

  if (type.endsWith("+cbor")) {
    return "The +cbor structured syntax suffix indicates CBOR-based representation semantics, but it does not prove that this specific media type is registered.";
  }

  return "";
}

function resultText(result: LookupResult) {
  if (result.kind === "media-type") {
    const status =
      result.entry.status === "common-unregistered"
        ? "Practical web mapping (not represented here as an IANA main-registry registration)"
        : result.alias
        ? "Known alias / alternate form in this table"
        : "Known media type in this table";

    const lines = [
      status,
      "",
      `Input media type: ${result.inputType}`,
      `Recommended / table media type: ${result.entry.type}`,
      `Common extensions: ${
        result.entry.extensions.length > 0
          ? result.entry.extensions
              .map((extension) => `.${extension}`)
              .join(", ")
          : "No extension mapping bundled for this type"
      }`,
      `Note: ${result.entry.note}`,
    ];

    if (result.parameters) {
      lines.push(
        `Parameters supplied: ${result.parameters}`,
        "Parameter note: parameters are separate from the base media-type name. Their validity and meaning depend on that media type's specification."
      );
    }

    if (result.alias && result.inputType !== result.entry.type) {
      lines.push(
        `Alias note: ${result.inputType} maps to ${result.entry.type} in this practical table.`
      );
    }

    return lines.join("\n");
  }

  if (result.kind === "extension") {
    const status =
      result.entry.status === "common-unregistered"
        ? "Practical extension mapping"
        : "Common extension mapping";

    return [
      status,
      "",
      `Input extension: .${result.extension}`,
      `Media type: ${result.entry.type}`,
      `Other common extensions: ${result.entry.extensions
        .map((extension) => `.${extension}`)
        .join(", ")}`,
      ...(result.compoundExtension &&
      result.compoundExtension !== `.${result.extension}`
        ? [`Compound filename ending: ${result.compoundExtension}`]
        : []),
      `Note: ${result.entry.note}`,
      "",
      "Important: a filename extension does not verify file contents. A server, upload pipeline, browser, or content-inspection library can determine a different type.",
    ].join("\n");
  }

  if (result.kind === "unknown-type") {
    return [
      "Media type not found in this bundled common-type table.",
      "",
      `Input media type: ${result.inputType}`,
      ...(result.parameters
        ? [`Parameters supplied: ${result.parameters}`]
        : []),
      ...(result.suffixHint ? [`Suffix note: ${result.suffixHint}`] : []),
      "",
      "An unknown result here does not mean the media type is invalid. The IANA registry contains far more registrations than this practical lookup table.",
    ].join("\n");
  }

  return [
    `No common mapping found for .${result.extension || "(none)"}.`,
    ...(result.compoundExtension
      ? [`Detected filename ending: ${result.compoundExtension}`]
      : []),
    "",
    "Extension lookup is a convention table. It does not inspect file bytes, query the operating system, upload the file, or prove the actual Content-Type.",
  ].join("\n");
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const tableStats = useMemo(() => {
    const registeredLike = MEDIA_ENTRIES.filter(
      (entry) => entry.status !== "common-unregistered"
    ).length;
    const practicalOnly = MEDIA_ENTRIES.length - registeredLike;

    return {
      entries: MEDIA_ENTRIES.length,
      registeredLike,
      practicalOnly,
    };
  }, []);

  const runLookup = () => {
    const raw = input.trim();

    setCopied(false);

    if (!raw) {
      setResult(null);
      setOutput("");
      return;
    }

    if (looksLikeMediaType(raw)) {
      const parsed = splitMediaTypeInput(raw);
      const found = findByMediaType(parsed.base);

      const next: LookupResult = found
        ? {
            kind: "media-type",
            entry: found.entry,
            inputType: parsed.base,
            parameters: parsed.parameters,
            alias: found.alias,
          }
        : {
            kind: "unknown-type",
            inputType: parsed.base,
            parameters: parsed.parameters,
            suffixHint: structuredSuffixHint(parsed.base),
          };

      setResult(next);
      setOutput(resultText(next));
      return;
    }

    const file = inspectFileLikeInput(raw);

    if (!file.extension) {
      const next: LookupResult = {
        kind: "unknown-extension",
        extension: "",
        compoundExtension: "",
      };
      setResult(next);
      setOutput(
        "Could not extract a file extension. Enter a value such as .json, app.js, archive.tar.gz, report.pdf, or application/json."
      );
      return;
    }

    const entry = findByExtension(file.extension);

    const next: LookupResult = entry
      ? {
          kind: "extension",
          entry,
          extension: file.extension,
          compoundExtension: file.compoundExtension,
        }
      : {
          kind: "unknown-extension",
          extension: file.extension,
          compoundExtension: file.compoundExtension,
        };

    setResult(next);
    setOutput(resultText(next));
  };

  const resetAll = () => {
    setInput("");
    setResult(null);
    setOutput("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ToolShell
      title="MIME Type Finder"
      description="Look up practical media-type mappings from common file names and extensions, or reverse-check a known Content-Type value without confusing filename conventions with real content detection."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          File Name, Extension, or Media Type
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Try <code>app.js</code>, <code>archive.tar.gz</code>,{" "}
          <code>.json</code>, <code>application/json</code>, or{" "}
          <code>text/html; charset=utf-8</code>.
        </p>

        <input
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setOutput("");
            setCopied(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") runLookup();
          }}
          placeholder="app.js or application/json"
          spellCheck={false}
          className="mt-4 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={runLookup} className="yoryantra-btn">
            Find Media Type
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="yoryantra-btn-outline"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Bundled mappings" value={String(tableStats.entries)} />
        <StatCard
          label="Registered/common table entries"
          value={String(tableStats.registeredLike)}
        />
        <StatCard
          label="Practical web-only mappings"
          value={String(tableStats.practicalOnly)}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Media Type Result
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              The table is designed for common developer workflows, not as a
              complete copy of every registered media type.
            </p>
          </div>

          {output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Extension or media-type details will appear here."}
        </pre>
      </div>

      {result && result.kind === "unknown-type" && result.suffixHint ? (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-800">
          Structured syntax suffixes such as <code>+json</code> and{" "}
          <code>+xml</code> can tell a generic processor something useful about
          representation syntax even when the full media type is not in this
          bundled table.
        </div>
      ) : null}

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A File Extension Is a Naming Convention, Not Content Proof
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A media type—historically called a MIME type—describes the format of
            transferred content. Filename extensions are useful conventions,
            but they are not authoritative evidence about the bytes inside a
            file. Renaming executable or HTML content to{" "}
            <code>photo.jpg</code> does not turn it into a JPEG image.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That distinction matters for uploads. An extension allowlist can
            improve usability, but security-sensitive validation should also
            use trusted server-side checks appropriate to the file type and
            should store user-controlled content with safe serving rules.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Content-Type Parameters Are Separate From the Base Media Type
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In a header such as{" "}
            <code>Content-Type: text/html; charset=utf-8</code>, the base media
            type is <code>text/html</code> and <code>charset=utf-8</code> is a
            parameter. Parameters are not universally interchangeable: each
            media type defines which parameters it accepts and what they mean.
            This finder uses the base type for lookup and shows supplied
            parameters separately.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Compound File Names Describe Layers
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A name such as <code>backup.tar.gz</code> tells you that gzip is the
            outer file layer. Looking up the last extension therefore returns{" "}
            <code>application/gzip</code>. That does not inspect or promise
            that the decompressed payload is actually a TAR archive. Similar
            layered names should be interpreted as hints about a processing
            pipeline, not as byte-level verification.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Modern Media-Type Details That Commonly Cause Confusion
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>
              JavaScript uses <code>text/javascript</code>; IANA marks{" "}
              <code>application/javascript</code> obsolete in favor of it.
            </li>
            <li>
              YAML has the registered <code>application/yaml</code> media type.
            </li>
            <li>
              Structured suffixes such as <code>+json</code> and{" "}
              <code>+xml</code> communicate underlying representation syntax,
              but the full media-type name still needs its own registration or
              protocol definition.
            </li>
            <li>
              SVG is <code>image/svg+xml</code>, but treating SVG as “just an
              image” can be unsafe in upload and embedding workflows because
              SVG is XML-based and can contain active features.
            </li>
            <li>
              Some values such as <code>audio/wav</code> and{" "}
              <code>video/webm</code> are widely used on the web even though
              this tool does not present them as main IANA registry entries.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Browser MIME Sniffing Is a Different Problem
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browsers can apply MIME-sniffing rules in some contexts when a
            response type is missing or ambiguous. This page does not implement
            those sniffing algorithms and does not download a resource. If you
            are debugging an HTTP response, inspect the actual{" "}
            <code>Content-Type</code>, <code>X-Content-Type-Options</code>,
            request context, and browser behavior rather than relying only on a
            filename.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            When the IANA Registry Adds Value
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            IANA is useful when you need to confirm whether a media-type name is
            registered or whether an older name has been obsoleted. It does not
            define a universal filename-extension database, which is why this
            tool labels extension results as practical mappings instead of
            pretending the extension itself is an IANA assignment.
          </p>
          <p className="mt-4 text-sm">
            <a
              href="https://www.iana.org/assignments/media-types/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              IANA Media Types Registry
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Local Lookup and Privacy Boundary
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The lookup runs against a bundled table in your browser. No file is
            uploaded, opened, sniffed, or sent to a media-detection API. If you
            paste a file path or URL, only the text itself is examined by this
            tool. Site-wide analytics or advertising scripts, if enabled, are
            separate from the lookup operation.
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
