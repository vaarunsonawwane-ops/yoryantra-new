"use client";

import { useMemo, useState } from "react";
import ToolCard from "@/app/components/ToolCard";

type ToolItem = {
  title: string;
  description: string;
  href: string;
  category?: string;
};

type ToolsClientProps = {
  tools: ToolItem[];
};

const preferredCategoryOrder = [
  "Developer Tools",
  "DevOps Tools",
  "Encoding Tools",
  "JSON & Data Tools",
  "Security Tools",
  "SEO Tools",
];

export default function ToolsClient({ tools }: ToolsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = useMemo(() => {
    const foundCategories = Array.from(
      new Set(
        tools
          .map((tool) => tool.category)
          .filter((category): category is string => Boolean(category))
      )
    );

    return foundCategories.sort((a, b) => {
      const aIndex = preferredCategoryOrder.indexOf(a);
      const bIndex = preferredCategoryOrder.indexOf(b);

      if (aIndex === -1 && bIndex === -1) {
        return a.localeCompare(b);
      }

      if (aIndex === -1) {
        return 1;
      }

      if (bIndex === -1) {
        return -1;
      }

      return aIndex - bIndex;
    });
  }, [tools]);

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesSearch =
        !query ||
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.href.toLowerCase().includes(query) ||
        (tool.category || "").toLowerCase().includes(query);

      const matchesCategory =
        selectedCategories.length === 0 ||
        (tool.category && selectedCategories.includes(tool.category));

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategories, tools]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedCategories.length > 0;

  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Search tools
          </label>

          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by tool name, category, or keyword..."
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="mt-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-medium text-gray-700">
              Filter by category
            </p>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-fit text-sm font-medium text-[var(--green)] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {categories.map((category) => {
              const checked = selectedCategories.includes(category);

              return (
                <label
                  key={category}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
                    checked
                      ? "border-[var(--green)] bg-[rgba(47,125,83,0.08)] text-[var(--dark)]"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 accent-[var(--green)]"
                  />

                  <span>{category}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredTools.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900">{tools.length}</span>{" "}
          tools
        </p>

        {selectedCategories.length > 0 && (
          <p className="text-sm text-gray-500">
            Active categories: {selectedCategories.join(", ")}
          </p>
        )}
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.href}
              title={tool.title}
              description={tool.description}
              href={tool.href}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            No matching tools found
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Try a different keyword or remove one of the selected categories.
          </p>

          <button onClick={clearFilters} className="yoryantra-btn mt-5">
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
