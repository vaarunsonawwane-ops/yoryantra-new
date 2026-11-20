"use client";

import { lazy, Suspense, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Operation = "build" | "json" | "parse" | "encode";
type Incoming = { id: number; text: string; format: "query" | "json"; to: Operation };

const BuilderPanel = lazy(() => import("./_panels/BuilderPanel"));
const JsonQueryPanel = lazy(() => import("./_panels/JsonQueryPanel"));
const QueryParserPanel = lazy(() => import("./_panels/QueryParserPanel"));
const QueryEncoderPanel = lazy(() => import("./_panels/QueryEncoderPanel"));

const OPERATIONS = [
  { label: "Build query string", value: "build" },
  { label: "JSON ↔ query string", value: "json" },
  { label: "Parse URL or query", value: "parse" },
  { label: "Encode / decode query", value: "encode" },
];

export default function ToolClient() {
  const [operation, setOperation] = useState<Operation>("build");
  const [visited, setVisited] = useState<Operation[]>(["build"]);
  const [incoming, setIncoming] = useState<Incoming | null>(null);

  const select = (next: Operation) => {
    setOperation(next);
    setVisited((current) => current.includes(next) ? current : [...current, next]);
  };

  const transfer = (to: Operation, text: string, format: "query" | "json") => {
    setIncoming((prev) => ({ id: (prev?.id ?? 0) + 1, text, format, to }));
    select(to);
  };

  return (
    <ToolShell
      title="Query String Builder"
      description="Build, encode, decode and inspect URL query parameters. Convert JSON into query strings, work with repeated keys, and edit the result without opening another tool."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm leading-relaxed text-gray-600">
          Build query strings, convert between JSON and query strings, parse URLs or queries, or encode and decode queries.
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
          Build a query, convert JSON, inspect a URL, or check encoding. Use the buttons under each result to move it into another operation here. Your work stays available when you switch operations.
        </p>
      </div>
      <div className="mt-7 min-w-0">
        <Suspense fallback={<p className="text-sm text-gray-600">Loading this operation...</p>}>
          {visited.includes("build") ? (
            <div className={operation === "build" ? "block" : "hidden"}>
              <BuilderPanel incoming={incoming?.to === "build" ? incoming : undefined} onTransfer={transfer} />
            </div>
          ) : null}
          {visited.includes("json") ? (
            <div className={operation === "json" ? "block" : "hidden"}>
              <JsonQueryPanel incoming={incoming?.to === "json" ? incoming : undefined} onTransfer={transfer} />
            </div>
          ) : null}
          {visited.includes("parse") ? (
            <div className={operation === "parse" ? "block" : "hidden"}>
              <QueryParserPanel incoming={incoming?.to === "parse" ? incoming : undefined} onTransfer={transfer} />
            </div>
          ) : null}
          {visited.includes("encode") ? (
            <div className={operation === "encode" ? "block" : "hidden"}>
              <QueryEncoderPanel incoming={incoming?.to === "encode" ? incoming : undefined} onTransfer={transfer} />
            </div>
          ) : null}
        </Suspense>
      </div>
      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900">Related Tools</h2>
        <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/query-string-builder" /></div>
      </div>
    </ToolShell>
  );
}
