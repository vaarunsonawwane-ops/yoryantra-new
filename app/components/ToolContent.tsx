import { ReactNode } from "react";

export function ToolContent({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="mt-14 border-t border-gray-200 pt-12 space-y-16">
      {children}
    </section>
  );
}

export function ToolExampleCard({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-7">
      {children}
    </div>
  );
}

export function ToolInsightBox({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-700">
      {children}
    </div>
  );
}