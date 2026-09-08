"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

const GROUPS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}:,.?",
} as const;

type GroupKey = keyof typeof GROUPS;
type GroupSelection = Record<GroupKey, boolean>;

const DEFAULT_GROUPS: GroupSelection = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

const GROUP_LABELS: Record<GroupKey, string> = {
  uppercase: "Uppercase A–Z",
  lowercase: "Lowercase a–z",
  numbers: "Numbers 0–9",
  symbols: "Symbols",
};

function randomIndex(limit: number): number {
  if (!Number.isInteger(limit) || limit <= 0 || limit > 0x100000000) {
    throw new Error("The character set size is outside the supported random range.");
  }

  const range = 0x100000000;
  const maximumAccepted = range - (range % limit);
  const randomValue = new Uint32Array(1);

  do {
    crypto.getRandomValues(randomValue);
  } while (randomValue[0] >= maximumAccepted);

  return randomValue[0] % limit;
}

function randomCharacter(characters: string): string {
  return characters[randomIndex(characters.length)];
}

function selectedEntries(selection: GroupSelection): Array<[GroupKey, string]> {
  return (Object.keys(GROUPS) as GroupKey[])
    .filter((key) => selection[key])
    .map((key) => [key, GROUPS[key]]);
}

function containsEverySelectedGroup(candidate: string, groups: Array<[GroupKey, string]>): boolean {
  return groups.every(([, characters]) => Array.from(candidate).some((character) => characters.includes(character)));
}

function generateUniformPassword(
  length: number,
  selection: GroupSelection,
  requireEveryGroup: boolean,
): string {
  const groups = selectedEntries(selection);
  if (!groups.length) throw new Error("Select at least one character group.");
  if (requireEveryGroup && length < groups.length) {
    throw new Error(`Length must be at least ${groups.length} to include every selected character group.`);
  }

  const alphabet = groups.map(([, characters]) => characters).join("");
  const maxAttempts = 10_000;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let candidate = "";
    for (let index = 0; index < length; index += 1) {
      candidate += randomCharacter(alphabet);
    }
    if (!requireEveryGroup || containsEverySelectedGroup(candidate, groups)) {
      return candidate;
    }
  }

  throw new Error("Could not satisfy the selected character rules after many secure random attempts. Increase the length or relax the group requirement.");
}

export default function ToolClient() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(20);
  const [groups, setGroups] = useState<GroupSelection>(DEFAULT_GROUPS);
  const [requireEveryGroup, setRequireEveryGroup] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const activeGroups = useMemo(() => selectedEntries(groups), [groups]);
  const alphabetSize = useMemo(
    () => activeGroups.reduce((total, [, characters]) => total + characters.length, 0),
    [activeGroups],
  );

  const generatePassword = () => {
    if (!Number.isFinite(length)) {
      setError("Enter a password length between 4 and 128.");
      setPassword("");
      return;
    }

    const safeLength = Math.floor(length);
    if (safeLength < 4 || safeLength > 128) {
      setError("Password length must be between 4 and 128 characters.");
      setPassword("");
      return;
    }

    try {
      const generated = generateUniformPassword(safeLength, groups, requireEveryGroup);
      setLength(safeLength);
      setPassword(generated);
      setError("");
      setCopied(false);
    } catch (caught) {
      setPassword("");
      setError(caught instanceof Error ? caught.message : "Unable to generate a password with these settings.");
    }
  };

  const copyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The password could not be copied. Select and copy it manually.");
    }
  };

  const resetAll = () => {
    setPassword("");
    setLength(20);
    setGroups(DEFAULT_GROUPS);
    setRequireEveryGroup(true);
    setError("");
    setCopied(false);
  };

  const toggleGroup = (key: GroupKey) => {
    setGroups((current) => ({ ...current, [key]: !current[key] }));
    setPassword("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Password Generator"
      description="Choose length and character sets, then sample a browser-generated password with cryptographic randomness."
    >
      <div className="grid items-start gap-5 md:grid-cols-2">
        <div className="self-start">
          <label className="mb-2 block text-sm font-medium text-gray-700">Password Length</label>
          <input
            type="number"
            min="4"
            max="128"
            step="1"
            value={length}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setLength(Number(event.target.value));
              setPassword("");
              setError("");
              setCopied(false);
            }}
            className="min-h-11 w-full rounded-xl border border-gray-300 p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            The page allows 4–128 characters so you can reproduce destination-specific rules. For real single-factor passwords,
            current NIST guidance requires verifiers to accept at least 15 characters as the minimum.
          </p>
        </div>

        <fieldset className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <legend className="px-1 text-sm font-semibold text-gray-900">Character set</legend>
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            {(Object.keys(GROUPS) as GroupKey[]).map((key) => (
              <label key={key} className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={groups[key]}
                  onChange={() => toggleGroup(key)}
                  className="mt-1 shrink-0"
                />
                <span>{GROUP_LABELS[key]}</span>
              </label>
            ))}
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-2 border-t border-gray-200 pt-4 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={requireEveryGroup}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setRequireEveryGroup(event.target.checked);
                setPassword("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 shrink-0"
            />
            <span>Require at least one character from every selected group</span>
          </label>
        </fieldset>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generatePassword} className="yoryantra-btn min-h-11 whitespace-nowrap">Generate Password</button>
        <button onClick={copyPassword} disabled={!password} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">
          {copied ? "Copied" : "Copy Password"}
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Generated Password</h3>
        <pre className="yoryantra-output min-h-[150px] overflow-auto whitespace-pre-wrap break-all text-sm">
          {password || "A generated value will appear here."}
        </pre>
      </div>

      <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Generation settings</h3>
          <dl className="mt-3 space-y-2 text-sm text-gray-700">
            <div className="flex justify-between gap-4"><dt>Length</dt><dd>{Math.floor(Number.isFinite(length) ? length : 0)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Selected groups</dt><dd>{activeGroups.length}</dd></div>
            <div className="flex justify-between gap-4"><dt>Alphabet size</dt><dd>{alphabetSize}</dd></div>
            <div className="flex justify-between gap-4"><dt>Every group required</dt><dd>{requireEveryGroup ? "Yes" : "No"}</dd></div>
          </dl>
        </div>

        <div className="self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-sm font-semibold text-yellow-900">Handle the result as a secret</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-yellow-800">
            {length < 15 && <li>The selected length is below the current NIST minimum for a single-factor password verifier.</li>}
            <li>Copying can leave the value in clipboard history or expose it to software that can read the clipboard.</li>
            <li>A random password cannot protect an account from phishing, malware, insecure recovery, or a compromised password manager.</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Where randomness comes from</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Characters are sampled locally with <code>crypto.getRandomValues()</code>. Rejection sampling avoids modulo bias. When the
          “every selected group” option is on, whole candidates are rejected until the generated password contains each group,
          instead of forcing characters into particular positions after generation.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Length and uniqueness do more work than decorative complexity</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A machine-generated password is different from a human-chosen one: it does not need to be memorable, and it should not be reused.
            A longer independent value gives an attacker a larger space to search. Character-category requirements are often destination rules,
            not a substitute for sufficient length, secure storage, rate limiting, and phishing-resistant authentication where available.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Current NIST SP 800-63B guidance tells password verifiers not to impose composition rules on subscriber-chosen passwords. It instead
            emphasizes minimum length, acceptance of broad character sets, blocklists for common passwords, rate limiting, and salted password hashing.
            The group controls here exist because many real systems still impose their own acceptance rules.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why the generator does not “pick one of each, then shuffle”</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            That common technique guarantees categories but changes the probability distribution: some final strings can be produced through more
            construction paths than others. This implementation samples complete candidates uniformly from the selected alphabet. If every group is
            required, it discards candidates that miss a group and samples again. The accepted strings therefore retain a clean, explainable random process.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Storage and recovery are part of password security</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The generated value is only one piece of the account's security. Store unique credentials in a trusted password manager or an approved
            secret store rather than a note, source file, chat message, or screenshot. For application passwords stored by a server, the verifier should
            store a salted password hash using a suitable password-hashing scheme—not a reversible copy and not a fast plain SHA digest.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Current NIST password guidance</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <a href="https://pages.nist.gov/800-63-4/sp800-63b.html" target="_blank" rel="noreferrer" className="underline decoration-gray-300 underline-offset-4 hover:decoration-gray-500">NIST SP 800-63B</a>
            {" "}sets a 15-character minimum for passwords used as a single authentication factor, allows an 8-character minimum when the password is
            used only as part of multi-factor authentication, recommends permitting at least 64 characters, and rejects mandatory composition rules for subscriber-chosen passwords.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/password-generator" /></div>
        </div>
      </section>
    </ToolShell>
  );
}
