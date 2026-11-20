"use client";

import { lazy, Suspense, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Operation = "parse" | "encode" | "analyze";
type Incoming = { id: number; text: string; to: Operation; context?: "url" | "query" | "text" };

const UrlParserPanel = lazy(() => import("./_panels/UrlParserPanel"));
const UrlEncoderPanel = lazy(() => import("./_panels/UrlEncoderPanel"));
const PercentAnalyzerPanel = lazy(() => import("./_panels/PercentAnalyzerPanel"));

const OPERATIONS = [
  { label: "Parse URL parts", value: "parse" },
  { label: "Encode / decode URL", value: "encode" },
  { label: "Analyze percent encoding", value: "analyze" },
];

export default function ToolClient() {
  const [operation, setOperation] = useState<Operation>("parse");
  const [visited, setVisited] = useState<Operation[]>(["parse"]);
  const [incoming, setIncoming] = useState<Incoming | null>(null);

  const select = (next: Operation) => {
    setOperation(next);
    setVisited((current) => current.includes(next) ? current : [...current, next]);
  };

  const transfer = (to: Operation, text: string, context?: Incoming["context"]) => {
    setIncoming((previous) => ({ id: (previous?.id ?? 0) + 1, to, text, context }));
    select(to);
  };

  return (
    <ToolShell
      title="URL Parts Parser"
      description="Parse URL components, encode or decode URL text, and inspect percent escapes, UTF-8 errors and reserved characters in one place."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm leading-relaxed text-gray-600">
          Parse URL parts, encode or decode URL text, or analyze percent encoding.
        </p>
        <div className="mt-3 w-full max-w-[20rem]">
          <YoryantraSelect
            label="What do you want to do?"
            value={operation}
            onChange={(value: string) => select(value as Operation)}
            options={OPERATIONS}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Parse URL parts, encode or decode a value, and inspect percent-encoded bytes. Use the buttons under a result to continue with another operation here. Your input stays available when you switch operations.
        </p>
      </div>

      <div className="mt-7 min-w-0">
        <Suspense fallback={<p className="text-sm text-gray-600">Loading this operation...</p>}>
          {visited.includes("parse") ? (
            <div className={operation === "parse" ? "block" : "hidden"}>
              <UrlParserPanel incoming={incoming?.to === "parse" ? incoming : undefined} onTransfer={transfer} />
            </div>
          ) : null}
          {visited.includes("encode") ? (
            <div className={operation === "encode" ? "block" : "hidden"}>
              <UrlEncoderPanel incoming={incoming?.to === "encode" ? incoming : undefined} onTransfer={transfer} />
            </div>
          ) : null}
          {visited.includes("analyze") ? (
            <div className={operation === "analyze" ? "block" : "hidden"}>
              <PercentAnalyzerPanel incoming={incoming?.to === "analyze" ? incoming : undefined} onTransfer={transfer} />
            </div>
          ) : null}
        </Suspense>
      </div>

      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900">Related Tools</h2>
        <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/url-parts-parser" /></div>
      </div>
    </ToolShell>
  );
}
