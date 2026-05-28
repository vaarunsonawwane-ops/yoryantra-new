"use client";

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
  return (
    <div>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-300 bg-white p-4 pr-10 text-sm text-[var(--dark)] outline-none transition hover:border-[var(--green)] focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green)]"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-white text-[var(--dark)]"
            >
              {option.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
          ▾
        </span>
      </div>
    </div>
  );
}