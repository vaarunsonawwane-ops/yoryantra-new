"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

type Option = {
  label: string;
  value: string;
};

type YoryantraSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  /** Optional stable trigger id, for existing external <label htmlFor="..."> labels. */
  id?: string;
  /** Task selectors retain the green outline; all dropdowns use compact sizing. */
  variant?: "default" | "task";
  /** Optional content-sized width for operation settings. Existing callers retain full width. */
  width?: "short" | "medium" | "wide";
};

export default function YoryantraSelect({
  value,
  onChange,
  options,
  label,
  id: providedId,
  variant = "default",
  width,
}: YoryantraSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const labelId = `${id}-label`;
  const triggerId = providedId ?? `${id}-trigger`;
  const listboxId = `${id}-options`;
  const isTask = variant === "task";
  const widthClass = width === "short" ? "max-w-44" : width === "medium" ? "max-w-64" : width === "wide" ? "max-w-80" : "";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleFocusOutside(event: FocusEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("focusin", handleFocusOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("focusin", handleFocusOutside);
    };
  }, []);

  // When opening by mouse or keyboard, focus the currently selected option.
  useEffect(() => {
    if (!open) return;
    const index = Math.max(0, options.findIndex((option) => option.value === value));
    optionRefs.current[index]?.focus();
  }, [open]);

  const selected = options.find((option) => option.value === value);

  function selectOption(option: Option) {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  function onOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      optionRefs.current[(index + 1) % options.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      optionRefs.current[(index - 1 + options.length) % options.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      optionRefs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      optionRefs.current[options.length - 1]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className={`relative w-full ${widthClass}`}>
      {label && (
        <span id={labelId} className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </span>
      )}

      <button
        id={triggerId}
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={label ? `${labelId} ${triggerId}` : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
        className={
          isTask
            ? "relative flex min-h-11 w-full items-center rounded-lg border border-[var(--green)] bg-white px-3 pr-9 text-left text-sm font-medium text-[var(--dark)] outline-none transition-colors hover:bg-[rgba(47,125,83,0.03)] focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2 sm:min-h-10"
            : "relative flex min-h-11 w-full items-center rounded-lg border border-gray-300 bg-white px-3 pr-9 text-left text-sm text-[var(--dark)] outline-none transition-colors hover:border-gray-400 focus-visible:border-[var(--green)] focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-1 sm:min-h-10"
        }
      >
        <span className="min-w-0 flex-1 truncate" title={selected?.label}>
          {selected?.label || "Select option"}
        </span>
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-500 ${isTask ? "right-3" : "right-4"}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={label ? labelId : triggerId}
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          {options.map((option, index) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                ref={(node) => { optionRefs.current[index] = node; }}
                id={`${id}-option-${index}`}
                type="button"
                role="option"
                aria-selected={active}
                tabIndex={-1}
                onKeyDown={(event) => onOptionKeyDown(event, index)}
                onClick={() => selectOption(option)}
                className={`block min-h-11 w-full whitespace-normal break-words px-3 py-2 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--green)] sm:min-h-9 ${
                  active
                    ? "bg-[rgba(47,125,83,0.12)] font-medium text-[var(--green)]"
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
