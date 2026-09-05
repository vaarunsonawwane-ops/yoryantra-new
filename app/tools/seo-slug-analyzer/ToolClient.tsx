"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type InputMode = "url" | "slug" | "list";
type CheckingStyle = "balanced" | "strict" | "relaxed";

type Issue = {
 severity: "info" | "warning" | "high";
 title: string;
 message: string;
};

type SlugRow = {
 input: string;
 slug: string;
 cleanedSuggestion: string;
 wordCount: number;
 length: number;
 status: "good" | "short" | "long" | "review" | "problem";
 score: number;
 issues: Issue[];
};

type Result = {
 rows: SlugRow[];
 issues: Issue[];
 output: string;
 totalSlugs: number;
 goodCount: number;
 shortCount: number;
 longCount: number;
 reviewCount: number;
 problemCount: number;
 averageLength: number;
 averageScore: number;
};

const sampleInput = `https://example.com/blog/Best_SEO_Slug_Analyzer_Tool?utm_source=test
/title-tag-length-checker
meta-description-length-checker
This Is A Blog Post Title With Extra Stop Words And Symbols!!!
/tools//canonical-url-checker/`;

const stopWords = new Set([
 "a",
 "an",
 "and",
 "are",
 "as",
 "at",
 "be",
 "by",
 "for",
 "from",
 "how",
 "in",
 "is",
 "it",
 "of",
 "on",
 "or",
 "that",
 "the",
 "this",
 "to",
 "with",
 "your",
]);

export default function ToolClient() {
 const [input, setInput] = useState("");
 const [targetKeyword, setTargetKeyword] = useState("");
 const [inputMode, setInputMode] = useState<InputMode>("list");
 const [outputMode, setOutputMode] = useState<OutputMode>("summary");
 const [checkingStyle, setCheckingStyle] = useState<CheckingStyle>("balanced");
 const [checkKeyword, setCheckKeyword] = useState(true);
 const [checkStopWords, setCheckStopWords] = useState(true);
 const [checkCase, setCheckCase] = useState(true);
 const [checkSpecialChars, setCheckSpecialChars] = useState(true);
 const [checkDuplicateSeparators, setCheckDuplicateSeparators] = useState(true);
 const [result, setResult] = useState<Result | null>(null);
 const [output, setOutput] = useState("");
 const [error, setError] = useState("");
 const [copied, setCopied] = useState(false);

 const notes = useMemo(() => (result ? getNotes(result) : []), [result]);

 const clearResult = () => {
 setResult(null);
 setOutput("");
 setError("");
 setCopied(false);
 };

 const analyzeSlugs = () => {
 if (!input.trim()) {
 setError("Please enter at least one URL or slug.");
 setResult(null);
 setOutput("");
 return;
 }

 try {
 const next = analyze({
 input,
 targetKeyword,
 inputMode,
 outputMode,
 checkingStyle,
 checkKeyword,
 checkStopWords,
 checkCase,
 checkSpecialChars,
 checkDuplicateSeparators,
 });

 setResult(next);
 setOutput(next.output);
 setError("");
 setCopied(false);
 } catch (err) {
 setError(err instanceof Error ? err.message : "Unable to analyze these URL slugs.");
 setResult(null);
 setOutput("");
 }
 };

 const copyOutput = async () => {
 if (!output) return;
 try {
 await navigator.clipboard.writeText(output);
 setCopied(true);
 window.setTimeout(() => setCopied(false), 1400);
 } catch {
 setError("Copy failed. Select the output and copy it manually.");
 }
 };

 const loadExample = () => {
 setInput(sampleInput);
 setTargetKeyword("seo slug analyzer");
 setInputMode("list");
 setOutputMode("summary");
 setCheckingStyle("balanced");
 setCheckKeyword(true);
 setCheckStopWords(true);
 setCheckCase(true);
 setCheckSpecialChars(true);
 setCheckDuplicateSeparators(true);
 clearResult();
 };

 const resetAll = () => {
 setInput("");
 setTargetKeyword("");
 setInputMode("list");
 setOutputMode("summary");
 setCheckingStyle("balanced");
 setCheckKeyword(true);
 setCheckStopWords(true);
 setCheckCase(true);
 setCheckSpecialChars(true);
 setCheckDuplicateSeparators(true);
 clearResult();
 };

 return (
 <ToolShell
 title="SEO Slug Analyzer"
 description="Review path slugs for readability, separators, casing, encoded text, and optional topic wording."
 >
 <div className="rounded-2xl border border-gray-200 bg-white p-5">
 <label className="block mb-2 text-sm font-medium text-gray-700">
 URLs or Slugs
 </label>

 <textarea
 value={input}
 onChange={(event) => {
 setInput(event.target.value);
 clearResult();
 }}
 placeholder={sampleInput}
 className="w-full min-h-[330px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
 />

 <p className="mt-2 text-sm text-gray-500">
 Paste full URLs, paths, slugs, or page-title-like text. Each line is analyzed separately.
 </p>
 </div>

 <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
 <label className="block mb-2 text-sm font-medium text-gray-700">
 Page Topic
 </label>

 <input
 value={targetKeyword}
 onChange={(event) => {
 setTargetKeyword(event.target.value);
 clearResult();
 }}
 placeholder="seo slug analyzer"
 className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
 />

 <p className="mt-2 text-sm text-gray-500">
 Optional. Compared with the slug as a wording check, not as a ranking requirement.
 </p>
 </div>

 <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
 <h3 className="text-lg font-semibold text-gray-900">Options</h3>

 <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
 <YoryantraSelect
 label="Input"
 value={inputMode}
 onChange={(value) => {
 setInputMode(value as InputMode);
 clearResult();
 }}
 options={[
 { label: "Auto / list", value: "list" },
 { label: "Full URL", value: "url" },
 { label: "Slug only", value: "slug" },
 ]}
 />

 <YoryantraSelect
 label="Readability Profile"
 value={checkingStyle}
 onChange={(value) => {
 setCheckingStyle(value as CheckingStyle);
 clearResult();
 }}
 options={[
 { label: "Balanced heuristic", value: "balanced" },
 { label: "Tighter heuristic", value: "strict" },
 { label: "Looser heuristic", value: "relaxed" },
 ]}
 />

 <YoryantraSelect
 label="Output"
 value={outputMode}
 onChange={(value) => {
 setOutputMode(value as OutputMode);
 clearResult();
 }}
 options={[
 { label: "Summary", value: "summary" },
 { label: "Detailed report", value: "report" },
 { label: "JSON", value: "json" },
 { label: "Markdown table", value: "markdown" },
 { label: "CSV", value: "csv" },
 ]}
 />

 <div className="md:col-span-2 space-y-3">
 <CheckboxRow checked={checkKeyword} label="Compare page topic with slug wording" onChange={(checked) => { setCheckKeyword(checked); clearResult(); }} />
 <CheckboxRow checked={checkStopWords} label="Note unusually wordy helper-language" onChange={(checked) => { setCheckStopWords(checked); clearResult(); }} />
 <CheckboxRow checked={checkCase} label="Flag uppercase path text" onChange={(checked) => { setCheckCase(checked); clearResult(); }} />
 <CheckboxRow checked={checkSpecialChars} label="Flag underscores, spaces, or ASCII punctuation" onChange={(checked) => { setCheckSpecialChars(checked); clearResult(); }} />
 <CheckboxRow checked={checkDuplicateSeparators} label="Flag duplicate slashes or repeated separators" onChange={(checked) => { setCheckDuplicateSeparators(checked); clearResult(); }} />
 </div>
 </div>

 <p className="mt-3 text-sm leading-relaxed text-gray-500">
 Length and word-count thresholds here are readability heuristics, not Google ranking limits. Hyphens and consistent path casing matter more than chasing a perfect score.
 </p>
 </div>

 <div className="mt-5 flex flex-wrap gap-3">
 <button onClick={analyzeSlugs} className="yoryantra-btn whitespace-nowrap">
 Analyze Slugs
 </button>

 <button onClick={copyOutput} className="yoryantra-btn whitespace-nowrap" disabled={!output}>
 {copied ? "Copied" : "Copy Output"}
 </button>

 <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
 Load Example
 </button>

 <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
 Reset
 </button>
 </div>

 {error && (
 <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
 {error}
 </div>
 )}

 {result && (
 <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
 <SummaryCard label="Slugs" value={result.totalSlugs.toLocaleString()} />
 <SummaryCard label="Clean" value={result.goodCount.toLocaleString()} />
 <SummaryCard label="Needs review" value={(result.reviewCount + result.longCount + result.problemCount).toLocaleString()} />
 <SummaryCard label="Readability score" value={`${result.averageScore}/100`} />
 </div>
 )}

 {result && result.rows.length > 0 && (
 <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
 <h3 className="text-lg font-semibold text-gray-900">Slug Review</h3>

 <p className="mt-2 text-sm text-gray-500">
 Slug length, word count, status, score, and suggested clean version.
 </p>

 <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
 <table className="w-full min-w-[920px] text-left text-sm">
 <thead className="bg-gray-50 text-gray-600">
 <tr>
 <th className="px-4 py-3 font-semibold">Slug</th>
 <th className="px-4 py-3 font-semibold">Suggestion</th>
 <th className="px-4 py-3 font-semibold">Words</th>
 <th className="px-4 py-3 font-semibold">Length</th>
 <th className="px-4 py-3 font-semibold">Status</th>
 <th className="px-4 py-3 font-semibold">Readability</th>
 </tr>
 </thead>

 <tbody className="divide-y divide-gray-100">
 {result.rows.slice(0, 100).map((row, index) => (
 <tr key={`${row.input}-${index}`}>
 <td className="px-4 py-3 font-mono text-xs text-gray-800">
 <span className="block max-w-[280px] break-words">{row.slug || "(empty)"}</span>
 </td>
 <td className="px-4 py-3 font-mono text-xs text-gray-800">
 <span className="block max-w-[280px] break-words">{row.cleanedSuggestion || "-"}</span>
 </td>
 <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.wordCount}</td>
 <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.length}</td>
 <td className="px-4 py-3 text-gray-700">
 <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
 row.status === "good"
 ? "bg-green-50 text-green-700"
 : row.status === "problem"
 ? "bg-red-50 text-red-700"
 : row.status === "long" || row.status === "review"
 ? "bg-amber-50 text-amber-800"
 : "bg-gray-100 text-gray-700"
 }`}>
 {row.status}
 </span>
 </td>
 <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.score}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {result && result.issues.length > 0 && (
 <div className="mt-6">
 <h3 className="text-lg font-semibold text-gray-900">What stands out in these paths</h3>
 <div className="mt-4 grid items-start gap-3 md:grid-cols-2">
 {result.issues.slice(0, 24).map((issue, index) => (
 <IssueCard key={`${issue.title}-${index}`} issue={issue} />
 ))}
 </div>
 {result.issues.length > 24 && (
 <p className="mt-3 text-sm text-gray-500">Showing the first 24 observations here; the report output keeps the full per-slug detail.</p>
 )}
 </div>
 )}

 {notes.length > 0 && (
 <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
 {notes.map((note) => (
 <div key={note.title} className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
 <p className="text-sm font-semibold text-gray-900">{note.title}</p>
 <p className="mt-1 text-sm leading-relaxed text-gray-600">{note.message}</p>
 </div>
 ))}
 </div>
 )}

 <div className="mt-8">
 <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
 <h3 className="text-lg font-semibold text-gray-900">Output</h3>
 {output && (
 <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">
 {copied ? "Copied" : "Copy"}
 </button>
 )}
 </div>
 <pre className="yoryantra-output min-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm">
 {output || "Slug analysis output will appear here."}
 </pre>
 </div>

 <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
 Changing an existing slug changes the URL. Map old URLs to their intended new destinations and add redirects before publishing a cleanup at scale.
 </div>

 <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
 <div>
 <h2 className="text-2xl font-semibold text-gray-900">Readable paths beat invented SEO formulas</h2>
 <p className="mt-4 leading-relaxed text-gray-600">
 A useful slug gives people a quick idea of the page topic and stays stable enough to link to for years. Google recommends descriptive URLs, words in the audience&apos;s language, and hyphens between words. It does not publish a magic slug length, word count, or keyword-density score.
 </p>
 <p className="mt-4 leading-relaxed text-gray-600">
 The readability score above is therefore only a local heuristic for comparing the lines you pasted. It is intentionally not presented as a ranking factor.
 </p>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">Hyphens, underscores, and case are not equivalent details</h2>
 <p className="mt-4 leading-relaxed text-gray-600">
 Google recommends hyphens rather than underscores to separate words in URLs. Path casing deserves even more care: URL paths are case-sensitive, so <code>/Shoes</code> and <code>/shoes</code> can identify different resources even when a particular server happens to treat them as equivalent.
 </p>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">Percent encoding is normal; malformed encoding is not</h2>
 <p className="mt-4 leading-relaxed text-gray-600">
 Non-ASCII text and reserved characters may appear percent-encoded in a URL. A sequence such as <code>%E3%83%86</code> can be completely valid, while a stray <code>%</code> or incomplete escape cannot be decoded reliably. Valid encoded text is noted for awareness rather than marked as an error.
 </p>
 <p className="mt-4 leading-relaxed text-gray-600">
 Unicode wording can also be appropriate when it matches the audience&apos;s language. The cleaner suggestion preserves non-ASCII text instead of forcing every slug into English-looking ASCII.
 </p>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">The page topic check is deliberately soft</h2>
 <p className="mt-4 leading-relaxed text-gray-600">
 A descriptive topic phrase can make a path easier to understand, but copying an entire target query into the slug is unnecessary. The comparison only notes when the supplied topic words are not clearly present; it does not lower a page&apos;s search eligibility or predict ranking.
 </p>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">What gets ignored when a full URL is pasted</h2>
 <p className="mt-4 leading-relaxed text-gray-600">
 The analysis focuses on the final path segment. Scheme, hostname, query parameters, and fragment are outside the slug score. A root homepage has no slug by design, and that is treated as a normal case rather than an error.
 </p>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">Before changing an old URL</h2>
 <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-gray-600">
 <li>Confirm the current URL is actually worth changing; cosmetic improvements alone may not justify a migration.</li>
 <li>Create a one-to-one redirect from the old URL to the new destination.</li>
 <li>Update internal links, canonicals, hreflang annotations, and sitemaps to the new URL.</li>
 <li>Keep the redirect in place long enough for users, crawlers, and external links to transition.</li>
 </ol>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">No live URL lookup happens during analysis</h2>
 <p className="mt-4 leading-relaxed text-gray-600">
 Analysis runs in the browser and does not intentionally transmit the pasted URLs, paths, or page-topic text to Yoryantra for processing. No live request is made, so the result cannot tell whether a proposed slug exists, redirects, conflicts with routing, or is already indexed.
 </p>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">Standards and search guidance</h2>
 <p className="mt-4 leading-relaxed text-gray-600">
 The URL recommendations above follow Google&apos;s{' '}
 <a href="https://developers.google.com/search/docs/crawling-indexing/url-structure" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">URL structure guidance</a>. For the underlying syntax, see{' '}
 <a href="https://www.rfc-editor.org/rfc/rfc3986" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">RFC 3986 / STD 66</a>, especially the sections on path components, reserved characters, and percent encoding.
 </p>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
 <div className="mt-4">
 <YoryantraRelatedTools currentHref="/tools/seo-slug-analyzer" />
 </div>
 </div>
 </section>
 </ToolShell>
 );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
 return (
 <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900">
 <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]" />
 <span>{label}</span>
 </label>
 );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
 return (
 <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
 <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
 <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
 </div>
 );
}

function IssueCard({ issue }: { issue: Issue }) {
 const styles = issue.severity === "high"
 ? "border-red-200 bg-red-50 text-red-900"
 : issue.severity === "warning"
 ? "border-amber-200 bg-amber-50 text-amber-900"
 : "border-gray-200 bg-gray-50 text-gray-900";

 return (
 <div className={`self-start rounded-xl border p-4 ${styles}`}>
 <p className="text-sm font-semibold">{issue.title}</p>
 <p className="mt-1 text-sm leading-relaxed opacity-90">{issue.message}</p>
 </div>
 );
}

type ExtractedSlug = {
 slug: string;
 rawSlug: string;
 rootPath: boolean;
 parseError: string;
 malformedPercentEncoding: boolean;
 encodedText: boolean;
};

function analyze(options: {
 input: string;
 targetKeyword: string;
 inputMode: InputMode;
 outputMode: OutputMode;
 checkingStyle: CheckingStyle;
 checkKeyword: boolean;
 checkStopWords: boolean;
 checkCase: boolean;
 checkSpecialChars: boolean;
 checkDuplicateSeparators: boolean;
}): Result {
 const rows = options.input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => analyzeOne(line, options));
 if (rows.length === 0) throw new Error("No URL slugs were found.");

 const issues = rows.reduce<Issue[]>((all, row) => all.concat(row.issues), []);
 const totalLength = rows.reduce((sum, row) => sum + row.length, 0);
 const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
 const base = {
 rows,
 issues,
 totalSlugs: rows.length,
 goodCount: rows.filter((row) => row.status === "good").length,
 shortCount: rows.filter((row) => row.status === "short").length,
 longCount: rows.filter((row) => row.status === "long").length,
 reviewCount: rows.filter((row) => row.status === "review").length,
 problemCount: rows.filter((row) => row.status === "problem").length,
 averageLength: Math.round(totalLength / rows.length),
 averageScore: Math.round(totalScore / rows.length),
 };
 const output = formatOutput(base, options.outputMode);
 return { ...base, output };
}

function analyzeOne(input: string, options: {
 targetKeyword: string;
 inputMode: InputMode;
 checkingStyle: CheckingStyle;
 checkKeyword: boolean;
 checkStopWords: boolean;
 checkCase: boolean;
 checkSpecialChars: boolean;
 checkDuplicateSeparators: boolean;
}): SlugRow {
 const extracted = extractSlug(input, options.inputMode);
 const slug = extracted.slug;
 const words = slug.split(/[-_\s]+/).filter(Boolean);
 const length = slug.length;
 const limits = getLimits(options.checkingStyle);
 const issues: Issue[] = [];
 let status: SlugRow["status"] = "good";

 if (extracted.parseError) {
 status = "problem";
 issues.push({ severity: "high", title: "URL could not be parsed", message: extracted.parseError });
 } else if (extracted.malformedPercentEncoding) {
 status = "problem";
 issues.push({ severity: "high", title: "Malformed percent encoding", message: "A percent sign is not followed by two hexadecimal digits, so the path cannot be decoded reliably." });
 } else if (extracted.rootPath) {
 issues.push({ severity: "info", title: "Root URL has no slug", message: "A homepage path of / has no final slug segment by design." });
 } else if (length < limits.minLength) {
 status = "short";
 issues.push({ severity: "info", title: "Very short path segment", message: "Short can be perfectly fine. Check only that the segment is still understandable in the context of its parent path." });
 } else if (length > limits.maxLength || words.length > limits.maxWords) {
 status = "long";
 issues.push({ severity: "warning", title: "Long path segment under this heuristic", message: `This segment has ${length} characters and ${words.length} words. There is no Google maximum here; the warning is about readability and maintainability.` });
 }

 if (extracted.encodedText && !extracted.malformedPercentEncoding) {
 issues.push({ severity: "info", title: "Percent-encoded text is present", message: "Valid percent encoding is normal in URLs, especially for non-ASCII text and reserved characters." });
 }

 if (options.checkKeyword && options.targetKeyword.trim() && slug) {
 const cleanKeyword = normalizeComparableText(options.targetKeyword);
 const cleanSlug = normalizeComparableText(slug);
 if (cleanKeyword && !cleanSlug.includes(cleanKeyword) && !keywordWordsPresent(cleanSlug, cleanKeyword)) {
 issues.push({ severity: "info", title: "Supplied page topic is not obvious in the slug", message: "That is a wording observation, not a ranking failure. A concise synonym or parent path may already provide enough context." });
 }
 }

 if (options.checkCase && /[A-Z]/.test(slug)) {
 if (status === "good" || status === "short") status = "review";
 issues.push({ severity: "warning", title: "Uppercase path text", message: "Paths are case-sensitive. Mixed casing can create distinct URL variants when routing and linking are inconsistent." });
 }

 if (options.checkSpecialChars && slug) {
 if (slug.includes("_")) {
 if (status === "good" || status === "short") status = "review";
 issues.push({ severity: "warning", title: "Underscore separates words", message: "Google recommends hyphens instead of underscores when separating words in URLs." });
 }
 if (/\s/.test(slug)) {
 if (status === "good" || status === "short") status = "review";
 issues.push({ severity: "warning", title: "Whitespace appears in the decoded segment", message: "Spaces need URL encoding and are usually clearer as hyphens in descriptive path segments." });
 }
 if (/[!"#$&'()*+,.:;<=>?@[\]\\^`{|}~]/.test(slug)) {
 issues.push({ severity: "info", title: "ASCII punctuation appears in the segment", message: "Reserved or punctuation characters may be valid when encoded or meaningful, but they deserve a routing and readability check before being rewritten." });
 }
 }

 if (options.checkDuplicateSeparators) {
 const pathForSeparatorCheck = getPathForSeparatorCheck(input);
 if (/\/\//.test(pathForSeparatorCheck)) {
 if (status === "good" || status === "short") status = "review";
 issues.push({ severity: "warning", title: "Duplicate slash inside the path", message: "Repeated path separators can identify a different route or produce duplicate-looking URLs depending on the server." });
 }
 if (/--|__/.test(extracted.rawSlug)) {
 issues.push({ severity: "info", title: "Repeated word separator", message: "Repeated hyphens or underscores are usually accidental and can make a path harder to scan." });
 }
 }

 if (options.checkStopWords && words.length >= 8) {
 const stopWordCount = words.filter((word) => stopWords.has(word.toLowerCase())).length;
 if (stopWordCount >= 4 && ratio(stopWordCount, words.length) > 0.4) {
 issues.push({ severity: "info", title: "Many helper words in a long slug", message: "This is a readability note only. Keep words that are needed for meaning rather than removing them mechanically." });
 }
 }

 const cleanedSuggestion = extracted.rootPath || extracted.parseError ? "" : makeSlugSuggestion(slug);
 const score = scoreSlug(issues, status);
 return { input, slug, cleanedSuggestion, wordCount: words.length, length, status, score, issues };
}

function extractSlug(input: string, mode: InputMode): ExtractedSlug {
 const trimmed = input.trim();
 const base: ExtractedSlug = { slug: "", rawSlug: "", rootPath: false, parseError: "", malformedPercentEncoding: false, encodedText: false };

 if (mode === "url") {
 return extractFromAbsoluteUrl(trimmed, base, true);
 }

 if (mode === "slug") {
 const rawSlug = trimmed.replace(/^\/+|\/+$/g, "");
 return finalizeExtracted(rawSlug, base);
 }

 if (/^https?:\/\//i.test(trimmed)) {
 return extractFromAbsoluteUrl(trimmed, base, false);
 }

 const noQuery = trimmed.split("?")[0].split("#")[0];
 const parts = noQuery.split("/").filter(Boolean);
 const rawSlug = parts[parts.length - 1] || "";
 return finalizeExtracted(rawSlug, { ...base, rootPath: /^\/?$/.test(noQuery) });
}

function extractFromAbsoluteUrl(value: string, base: ExtractedSlug, strictMode: boolean): ExtractedSlug {
 try {
 const url = new URL(value);
 if (url.protocol !== "http:" && url.protocol !== "https:") {
 return { ...base, parseError: "Only HTTP and HTTPS URLs are supported in Full URL mode." };
 }
 const parts = url.pathname.split("/").filter(Boolean);
 const rawSlug = parts[parts.length - 1] || "";
 return finalizeExtracted(rawSlug, { ...base, rootPath: parts.length === 0 });
 } catch {
 return strictMode
 ? { ...base, parseError: "Enter an absolute URL such as https://example.com/path in Full URL mode." }
 : finalizeExtracted(value.split("?")[0].split("#")[0].split("/").filter(Boolean).pop() || "", base);
 }
}

function finalizeExtracted(rawSlug: string, base: ExtractedSlug): ExtractedSlug {
 const malformedPercentEncoding = /%(?![0-9A-Fa-f]{2})/.test(rawSlug);
 const encodedText = /%[0-9A-Fa-f]{2}/.test(rawSlug);
 let slug = rawSlug;
 if (encodedText && !malformedPercentEncoding) {
 try { slug = decodeURIComponent(rawSlug); } catch { return { ...base, rawSlug, slug: rawSlug, encodedText, malformedPercentEncoding: true }; }
 }
 return { ...base, rawSlug, slug, encodedText, malformedPercentEncoding };
}

function getPathForSeparatorCheck(value: string) {
 try { return new URL(value).pathname; } catch { return value.split("?")[0].split("#")[0]; }
}

function makeSlugSuggestion(value: string) {
 return value
 .normalize("NFKC")
 .toLowerCase()
 .replace(/&/g, " and ")
 .replace(/[!"#$'()*+,./:;<=>?@[\]\\^`{|}~]+/g, "-")
 .replace(/[\s_]+/g, "-")
 .replace(/-{2,}/g, "-")
 .replace(/^-+|-+$/g, "");
}

function normalizeComparableText(value: string) {
 return makeSlugSuggestion(value).replace(/-+/g, "-");
}

function keywordWordsPresent(slug: string, keyword: string) {
 const slugWords = new Set(slug.split("-").filter(Boolean));
 const keywordWords = keyword.split("-").filter(Boolean);
 if (keywordWords.length === 0) return true;
 return keywordWords.every((word) => slugWords.has(word));
}

function getLimits(style: CheckingStyle) {
 if (style === "strict") return { minLength: 6, maxLength: 55, maxWords: 6 };
 if (style === "relaxed") return { minLength: 3, maxLength: 85, maxWords: 10 };
 return { minLength: 4, maxLength: 70, maxWords: 8 };
}

function ratio(a: number, b: number) {
 return b === 0 ? 0 : a / b;
}

function scoreSlug(issues: Issue[], status: SlugRow["status"]) {
 let score = 100;
 issues.forEach((issue) => {
 if (issue.severity === "high") score -= 25;
 else if (issue.severity === "warning") score -= 9;
 else score -= 2;
 });
 if (status === "long") score -= 4;
 return Math.max(0, score);
}

function formatOutput(result: Omit<Result, "output">, outputMode: OutputMode) {
 if (outputMode === "json") return JSON.stringify(result, null, 2);
 if (outputMode === "csv") {
 const rows = [["input", "slug", "suggestion", "words", "length", "status", "readability_score", "observations"], ...result.rows.map((row) => [row.input, row.slug, row.cleanedSuggestion, String(row.wordCount), String(row.length), row.status, String(row.score), String(row.issues.length)])];
 return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
 }
 if (outputMode === "markdown") {
 return ["| Slug | Suggestion | Words | Length | Status | Readability |", "| --- | --- | ---: | ---: | --- | ---: |", ...result.rows.map((row) => `| ${escapeMarkdown(row.slug || "(root)")} | ${escapeMarkdown(row.cleanedSuggestion || "-")} | ${row.wordCount} | ${row.length} | ${row.status} | ${row.score} |`)].join("\n");
 }
 if (outputMode === "report") {
 return result.rows.map((row, index) => {
 const observations = row.issues.length ? row.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`) : ["- No selected readability or syntax concern found."];
 return [`Slug ${index + 1}`, "------", `Input: ${row.input}`, `Slug: ${row.slug || "(root path)"}`, `Suggestion: ${row.cleanedSuggestion || "-"}`, `Words: ${row.wordCount}`, `Length: ${row.length}`, `Status: ${row.status}`, `Readability score: ${row.score}/100`, "", "Observations:", ...observations].join("\n");
 }).join("\n\n");
 }
 const observations = result.issues.length ? result.issues.slice(0, 15).map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`) : ["- No selected readability or syntax concern found."];
 return [
 "SEO Slug Readability Summary",
 "----------------------------",
 `Slugs checked: ${result.totalSlugs}`,
 `Clean: ${result.goodCount}`,
 `Short: ${result.shortCount}`,
 `Long: ${result.longCount}`,
 `Review: ${result.reviewCount}`,
 `Errors: ${result.problemCount}`,
 `Average length: ${result.averageLength}`,
 `Average readability score: ${result.averageScore}/100`,
 "",
 "Observations:",
 ...observations,
 ].join("\n");
}

function csvEscape(value: string) {
 if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
 return value;
}

function escapeMarkdown(value: string) {
 return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result) {
 const notes: { title: string; message: string }[] = [];
 if (result.longCount > 0) notes.push({ title: "Length is a readability prompt, not a cutoff", message: "Trim only words that do not add meaning. There is no published Google maximum slug length represented by these thresholds." });
 if (result.reviewCount > 0 || result.problemCount > 0) notes.push({ title: "Separate syntax problems from style preferences", message: "Malformed percent encoding is an actual parsing problem; casing, separators, and wording require context from the live routing setup." });
 if (result.averageScore >= 90) notes.push({ title: "Most paths need little intervention", message: "Avoid changing stable URLs just to chase a cleaner-looking score. Existing links and redirects can matter more than cosmetic improvement." });
 return notes;
}
