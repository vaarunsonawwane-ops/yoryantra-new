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
  { type: "audio/wav", extensions: ["wav"], note: "Widely used Content-Type for WAVE audio in browsers and web servers. It is treated here as a common web mapping rather than an IANA main-registry registration.", status: "common-unregistered" },

  { type: "video/mp4", extensions: ["mp4", "m4v"], note: "MP4 video." },
  { type: "video/ogg", extensions: ["ogv"], note: "Ogg video." },
  { type: "video/webm", extensions: ["webm"], note: "Widely used WebM Content-Type in browsers and web servers. A .webm extension alone cannot prove whether video/webm or audio/webm best describes the contained streams. It is treated here as a common web mapping rather than an IANA main-registry registration.", status: "common-unregistered" },

  { type: "font/woff", extensions: ["woff"], note: "WOFF web fonts." },
  { type: "font/woff2", extensions: ["woff2"], note: "WOFF2 web fonts." },
  { type: "font/ttf", extensions: ["ttf"], note: "TrueType fonts." },
  { type: "font/otf", extensions: ["otf"], note: "OpenType fonts." },
];

const TYPE_TOKEN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

function stripContentTypeFieldName(raw: string) {
  return raw.replace(/^content-type\s*:\s*/i, "").trim();
}

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
        ? "Common web mapping (not listed here as an IANA main-registry registration)"
        : result.alias
        ? "Known alias or alternate form"
        : "Known media type";

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
        `Alias note: ${result.inputType} maps to ${result.entry.type} in the bundled mapping data.`
      );
    }

    return lines.join("\n");
  }

  if (result.kind === "extension") {
    const status =
      result.entry.status === "common-unregistered"
        ? "Common extension mapping"
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
      "No match here does not mean the media type is invalid. The IANA registry contains far more registrations than the bundled common-type list.",
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
  const [error, setError] = useState("");

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
    const raw = stripContentTypeFieldName(input.trim());

    setCopied(false);
    setError("");

    if (!raw) {
      setResult(null);
      setOutput("");
      return;
    }

    if (looksLikeMediaType(raw)) {
      const parsed = splitMediaTypeInput(raw);

      if (
        parsed.base === "*/*" ||
        parsed.base.endsWith("/*")
      ) {
        setResult(null);
        setOutput(
          [
            `${parsed.base} is a media range, not a concrete media type.`,
            "",
            "Wildcards belong in negotiation fields such as Accept. A Content-Type value identifies the actual representation and therefore uses a specific type/subtype.",
          ].join("\n")
        );
        return;
      }

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
    setError("");
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The media-type result could not be copied. Select and copy it manually.");
    }
  };

  return (
    <ToolShell
      title="MIME Type Finder"
      description="Match common file names and extensions with media types, or inspect a Content-Type value while keeping filename conventions separate from actual file-content detection."
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
            setError("");
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
          label="Common web-only mappings"
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
              Common mappings are bundled for quick lookup; the IANA registry
              contains many more registered media types.
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

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result && result.kind === "unknown-type" && result.suffixHint ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-gray-700">
          Structured syntax suffixes such as <code>+json</code> and{" "}
          <code>+xml</code> describe an underlying representation family even
          when the full media type is not present in the bundled list.
        </div>
      ) : null}

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Filename Can Suggest a Format; It Cannot Prove One
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A media type describes transferred content. A filename extension is
            only a naming convention. Renaming HTML, executable data, or a ZIP
            archive to <code>photo.jpg</code> does not turn those bytes into a
            JPEG image.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That distinction is important in upload handling. Extension checks
            are useful for user feedback, but security-sensitive validation
            needs server-side inspection appropriate to the format and safe
            storage and serving rules for user-controlled content.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Content-Type Has a Type, a Subtype, and Sometimes Parameters
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In <code>Content-Type: text/html; charset=utf-8</code>,{" "}
            <code>text/html</code> is the media type and{" "}
            <code>charset=utf-8</code> is a parameter. Parameters are defined by
            the media type's specification; they are not a universal list that
            can be copied from one type to another.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Pasting the full <code>Content-Type:</code> field is accepted, but
            lookup is performed on the base type/subtype. A wildcard such as{" "}
            <code>image/*</code> is different: it is a media range used in
            negotiation fields such as <code>Accept</code>, not a concrete
            Content-Type for one representation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            archive.tar.gz Describes Two Layers
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The last extension in <code>archive.tar.gz</code> describes the
            outer gzip layer, so <code>.gz</code> maps to{" "}
            <code>application/gzip</code>. The filename still does not prove
            that the decompressed bytes form a TAR archive. Compound names are
            best read as processing hints rather than byte-level evidence.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Registration and Common Web Usage Are Not the Same List
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            IANA maintains the authoritative registry of media-type names, but
            it is not a universal filename-extension database. Some extension
            mappings come from platform or browser conventions, and some widely
            seen web values are not main-registry registrations.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            For example, <code>text/javascript</code> is the registered
            JavaScript type and IANA marks <code>application/javascript</code>
            obsolete in its favor. <code>application/yaml</code> is registered
            for YAML. Values such as <code>audio/wav</code> and{" "}
            <code>video/webm</code> are common in web software but are kept
            clearly separate from claims about IANA registration.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            +json and +xml Tell You About Syntax, Not Registration
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A structured syntax suffix can let generic software recognize an
            underlying representation family. A subtype ending in{" "}
            <code>+json</code> signals JSON-based representation semantics;
            <code>+xml</code> does the same for XML. That suffix does not by
            itself prove that the complete media-type name is registered or
            appropriate for a particular protocol.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            SVG and MIME Sniffing Need Separate Security Decisions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>image/svg+xml</code> is an image media type, but SVG is
            XML-based and can contain active features. Upload rules that treat
            every <code>image/*</code> value as an inert bitmap can therefore
            create a security boundary that is much weaker than it looks.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browsers can also apply MIME-sniffing behavior in some contexts
            when a response type is absent or ambiguous. A filename lookup does
            not reproduce those algorithms. For a live HTTP problem, inspect
            the real <code>Content-Type</code>,{" "}
            <code>X-Content-Type-Options</code>, request context, and browser
            behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            When the Exact Registration Matters
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The{" "}
            <a
              href="https://www.iana.org/assignments/media-types/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              IANA Media Types registry
            </a>{" "}
            is the place to confirm whether a type/subtype is registered,
            obsoleted, or associated with a particular specification. The
            registration framework is described by RFC 6838, while individual
            types often point to their own defining RFC or standards document.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Only the Text You Enter Is Examined
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Lookup runs against bundled mapping data in the browser. A file is
            not uploaded or opened, a URL is not fetched, and no content
            sniffing is performed. If a path or URL is pasted, only its text is
            used to find the apparent extension. Site-wide analytics or
            advertising scripts, if enabled, are separate from that lookup.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Continue From the Content Type
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/mime-type-finder" />
          </div>
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
