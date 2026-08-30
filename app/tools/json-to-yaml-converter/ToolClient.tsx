"use client";

import { useState } from "react";
import * as yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Options = { indent: number; lineWidth: number; forceQuotes: boolean; sortKeys: boolean };
type Result = { output: string; error: string; warnings: string[] };

function compareIntegerMagnitude(token: string) {
  const digits = token.replace(/^-/, "").replace(/^0+/, "") || "0";
  const max = "9007199254740991";
  if (digits.length !== max.length) return digits.length > max.length;
  return digits > max;
}

function findUnsafeIntegerTokens(source: string) {
  const tokens: string[] = [];
  let inString = false;
  let escaped = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') { inString = true; continue; }
    if (char === "-" || /\d/.test(char)) {
      const match = source.slice(i).match(/^-?(?:0|[1-9]\d*)(?![.eE\d])/);
      if (match) {
        if (compareIntegerMagnitude(match[0])) tokens.push(match[0]);
        i += match[0].length - 1;
      }
    }
  }
  return tokens;
}


function findDuplicateKeys(source: string) {
  let index = 0;
  const duplicates: string[] = [];
  const skipWhitespace = () => { while (index < source.length && /[\x20\x09\x0a\x0d]/.test(source[index])) index += 1; };
  const parseString = () => {
    const start = index;
    index += 1;
    let escaped = false;
    while (index < source.length) {
      const character = source[index];
      index += 1;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') break;
    }
    return JSON.parse(source.slice(start, index)) as string;
  };
  const parseNumber = () => { while (index < source.length && !/[\x20\x09\x0a\x0d,\]}]/.test(source[index])) index += 1; };
  const parseValue = (): void => {
    skipWhitespace();
    const character = source[index];
    if (character === "{") { parseObject(); return; }
    if (character === "[") { parseArray(); return; }
    if (character === '"') { parseString(); return; }
    if (character === "t") { index += 4; return; }
    if (character === "f") { index += 5; return; }
    if (character === "n") { index += 4; return; }
    parseNumber();
  };
  const parseObject = (): void => {
    index += 1; skipWhitespace();
    const seen = new Set<string>();
    if (source[index] === "}") { index += 1; return; }
    while (index < source.length) {
      skipWhitespace();
      const key = parseString();
      if (seen.has(key)) duplicates.push(key);
      seen.add(key);
      skipWhitespace(); index += 1; parseValue(); skipWhitespace();
      if (source[index] === "}") { index += 1; return; }
      index += 1;
    }
  };
  const parseArray = (): void => {
    index += 1; skipWhitespace();
    if (source[index] === "]") { index += 1; return; }
    while (index < source.length) {
      parseValue(); skipWhitespace();
      if (source[index] === "]") { index += 1; return; }
      index += 1;
    }
  };
  parseValue();
  return duplicates;
}

function convertJsonToYaml(source: string, options: Options): Result {
  if (!source.trim()) return { output: "", error: "Enter JSON to convert.", warnings: [] };
  const warnings: string[] = [];
  const unsafe = findUnsafeIntegerTokens(source);
  if (unsafe.length) warnings.push(`Integer token${unsafe.length === 1 ? "" : "s"} outside JavaScript's safe-integer range detected: ${unsafe.slice(0, 4).join(", ")}${unsafe.length > 4 ? " …" : ""}. JSON.parse uses JavaScript numbers, so precision may already be lost before YAML is generated.`);

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    return { output: "", error: error instanceof Error ? error.message : "Invalid JSON input.", warnings };
  }

  const duplicates = findDuplicateKeys(source);
  if (duplicates.length) warnings.push(`Duplicate JSON object name${duplicates.length === 1 ? "" : "s"} detected: ${Array.from(new Set(duplicates)).slice(0, 5).join(", ")}. JSON.parse keeps the later value, so earlier duplicate values cannot be preserved in YAML.`);

  try {
    const output = yaml.dump(parsed, {
      indent: options.indent,
      lineWidth: options.lineWidth,
      noRefs: true,
      forceQuotes: options.forceQuotes,
      sortKeys: options.sortKeys,
    }).replace(/\s+$/, "");
    return { output, error: "", warnings };
  } catch (error) {
    return { output: "", error: error instanceof Error ? error.message : "Unable to convert this JSON value to YAML.", warnings };
  }
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<Options>({ indent: 2, lineWidth: -1, forceQuotes: false, sortKeys: false });
  const [result, setResult] = useState<Result | null>(null);

  const convert = () => setResult(convertJsonToYaml(input, options));
  const loadExample = () => {
    const example = `{
  "app": "Yoryantra",
  "enabled": true,
  "ports": [80, 443],
  "metadata": {
    "environment": "production",
    "note": "value: with colon"
  }
}`;
    setInput(example);
    setResult(convertJsonToYaml(example, options));
  };
  const reset = () => { setInput(""); setOptions({ indent: 2, lineWidth: -1, forceQuotes: false, sortKeys: false }); setResult(null); };

  return (
    <ToolShell title="JSON to YAML Converter" description="Convert any valid JSON value to YAML with indentation, wrapping, quoting, and key-order controls plus number-precision diagnostics.">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">JSON input</label>
        <textarea value={input} onChange={(event: { target: { value: string } }) => setInput(event.target.value)} placeholder='{"app":"Yoryantra","enabled":true}' className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div><label className="block mb-2 text-sm font-medium text-gray-700">Indent</label><select value={options.indent} onChange={(event: { target: { value: string } }) => setOptions((current) => ({ ...current, indent: Number(event.target.value) }))} className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"><option value={2}>2 spaces</option><option value={4}>4 spaces</option></select></div>
        <div><label className="block mb-2 text-sm font-medium text-gray-700">Line width</label><select value={options.lineWidth} onChange={(event: { target: { value: string } }) => setOptions((current) => ({ ...current, lineWidth: Number(event.target.value) }))} className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"><option value={-1}>No wrapping</option><option value={80}>80</option><option value={120}>120</option></select></div>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 text-sm text-gray-700"><input type="checkbox" checked={options.forceQuotes} onChange={(event: { target: { checked: boolean } }) => setOptions((current) => ({ ...current, forceQuotes: event.target.checked }))} />Quote all strings</label>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 text-sm text-gray-700"><input type="checkbox" checked={options.sortKeys} onChange={(event: { target: { checked: boolean } }) => setOptions((current) => ({ ...current, sortKeys: event.target.checked }))} />Sort object keys</label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3"><button onClick={convert} className="yoryantra-btn">Convert to YAML</button><button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button><button onClick={reset} className="yoryantra-btn-outline">Reset</button></div>

      {result?.error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{result.error}</div>}
      {result?.warnings.length ? <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900"><strong>Conversion notes:</strong><ul className="mt-2 list-disc list-inside space-y-1">{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div> : null}

      <div className="mt-8"><div className="flex items-center justify-between gap-3 mb-3"><h3 className="text-lg font-semibold text-gray-900">YAML Output</h3>{result?.output && <button onClick={() => navigator.clipboard.writeText(result.output)} className="yoryantra-btn-outline text-sm">Copy</button>}</div><pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">{result?.output || "Converted YAML will appear here."}</pre></div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">JSON Values Map Cleanly Into YAML—but Presentation Is New</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">JSON objects, arrays, strings, numbers, booleans, and null all have natural YAML representations. The converter can therefore preserve the parsed data value while choosing a new YAML presentation such as indentation, wrapping, and string quoting.</p>
          <p className="mt-4 text-gray-600 leading-relaxed">Comments, anchors, custom tags, and YAML-specific scalar styles cannot be recovered because they were never present in the JSON input. Duplicate JSON object names are also lossy in JavaScript parsing because the later value wins; this tool reports them before conversion. Turning on key sorting changes presentation order and should be used deliberately.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Large JSON Integers Need Extra Care in JavaScript</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">JavaScript's JSON parser represents JSON numbers as IEEE-754 numbers. Integer tokens beyond ±9,007,199,254,740,991 may not retain exact precision. This tool scans the source and warns before conversion when it sees an integer token beyond that safe range.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Formatting Controls</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">Use two or four spaces depending on the target project's style. Line wrapping only affects YAML presentation. “Quote all strings” is useful when you want string intent to be visually explicit, while unquoted output is usually more compact and readable.</p>
        </div>
        <div><h2 className="text-xl font-semibold text-gray-900">References</h2><p className="mt-3 text-gray-600 leading-relaxed">The output follows the data model described by the <a className="underline" href="https://yaml.org/spec/1.2.2/" target="_blank" rel="noreferrer">YAML 1.2.2 specification</a> and is serialized with the bundled <a className="underline" href="https://github.com/nodeca/js-yaml" target="_blank" rel="noreferrer">js-yaml</a> library.</p></div>
        <div><h2 className="text-xl font-semibold text-gray-900">Explore Related Tools</h2><YoryantraRelatedTools currentHref="/tools/json-to-yaml-converter" /></div>
      </section>
    </ToolShell>
  );
}
