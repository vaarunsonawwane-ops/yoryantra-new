"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

type YoryantraSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
};

export default function YoryantraSelect({
  value,
  onChange,
  options,
  label,
}: YoryantraSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
  

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-full rounded-xl border border-gray-300 bg-white p-4 pr-10 text-left text-sm text-[var(--dark)] outline-none transition focus:ring-2 focus:ring-[var(--green)] focus:border-transparent"
      >
        {selected?.label || "Select option"}

        <span className="pointer-events-none absolute right-4 bottom-1/2 translate-y-1/2 text-gray-500">
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-3 text-left text-sm transition ${
                  active
                    ? "bg-[rgba(47,125,83,0.12)] text-[var(--green)] font-medium"
                    : "bg-white text-[var(--dark)] hover:bg-[rgba(47,125,83,0.06)]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}