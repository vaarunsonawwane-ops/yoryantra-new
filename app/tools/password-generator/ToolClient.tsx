"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}:,.?";
const ALL_CHARACTERS = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;

export default function ToolClient() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    if (!Number.isFinite(length)) {
      setError("Enter a password length between 4 and 64.");
      setPassword("");
      return;
    }

    const safeLength = Math.floor(length);

    if (safeLength < 4 || safeLength > 64) {
      setError("Password length must be between 4 and 64 characters.");
      setPassword("");
      return;
    }

    const characters = [
      randomCharacter(UPPERCASE),
      randomCharacter(LOWERCASE),
      randomCharacter(NUMBERS),
      randomCharacter(SYMBOLS),
    ];

    while (characters.length < safeLength) {
      characters.push(randomCharacter(ALL_CHARACTERS));
    }

    secureShuffle(characters);
    setLength(safeLength);
    setPassword(characters.join(""));
    setError("");
    setCopied(false);
  };

  const copyPassword = async () => {
    if (!password) {
      return;
    }

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
    setLength(16);
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Password Generator"
      description="Generate a random password locally with uppercase and lowercase letters, numbers, and symbols."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Password Length
        </label>

        <input
          type="number"
          min="4"
          max="64"
          step="1"
          value={length}
          onChange={(event) => {
            setLength(Number(event.target.value));
            setPassword("");
            setError("");
            setCopied(false);
          }}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          The generator includes at least one uppercase letter, lowercase letter,
          number, and symbol. Very short passwords are available for testing but
          may not be suitable for real accounts.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generatePassword} className="yoryantra-btn">
          Generate Password
        </button>

        <button
          onClick={copyPassword}
          disabled={!password}
          className="yoryantra-btn-outline"
        >
          {copied ? "Copied" : "Copy Password"}
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Generated Password
        </h3>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[160px] whitespace-pre-wrap break-words">
          {password || "Generated password will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Privacy and Handling Note</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Generation happens locally with crypto.getRandomValues. This tool does
          not send the generated password to a server. The password can still be
          exposed through your screen, clipboard history, browser extensions, or
          the device itself, so store and share it carefully.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Creating a Unique Random Password
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Reusing one password across services allows a breach at one service to
            affect other accounts. A randomly generated password can help you use
            a different credential for each account, system, or test environment.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This generator uses the browser cryptography API, selects characters
            without modulo bias, includes all four character groups, and shuffles
            the final result. A website may still reject some symbols or impose a
            different maximum length.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Generate a Password</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose a length from 4 to 64 characters.</li>
            <li>Generate a new random value.</li>
            <li>Check that the destination accepts the included symbols and length.</li>
            <li>Copy the password and save it in a trusted password manager or approved secret store.</li>
            <li>Generate another value instead of reusing the same password elsewhere.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Where Random Passwords Are Useful</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating a unique login credential for an online account.</li>
            <li>Generating temporary values for local development or testing.</li>
            <li>Replacing a reused password during an account-security review.</li>
            <li>Creating database, dashboard, or service credentials when passwords are supported.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Important Limits</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>A generated password is not safe if it is stored or shared insecurely.</li>
            <li>Some systems use passkeys, API keys, tokens, or key pairs instead of passwords.</li>
            <li>Account protection also depends on phishing resistance, recovery controls, and multi-factor authentication.</li>
            <li>A four-character password may be useful for testing but should not be described as strong.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq
              question="How does the generator choose characters?"
              answer="It uses crypto.getRandomValues and rejection sampling so every character in the selected set has an equal chance of being chosen."
            />
            <Faq
              question="Does every generated password contain each character group?"
              answer="Yes. For lengths of four or more, the result includes at least one uppercase letter, lowercase letter, number, and symbol."
            />
            <Faq
              question="Is the generated password uploaded?"
              answer="No. Generation happens in your browser. Copying or storing the password may still expose it through the clipboard, device, browser extensions, or another application."
            />
            <Faq
              question="What length should I choose?"
              answer="Use the longest unique password the destination accepts and that your password manager can store reliably. Required length and character rules vary by system."
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/password-generator" />
        </div>
      </section>
    </ToolShell>
  );
}

function randomCharacter(characters: string) {
  return characters[randomIndex(characters.length)];
}

function randomIndex(limit: number) {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("The character set must not be empty.");
  }

  const range = 0x100000000;
  const maximumAccepted = range - (range % limit);
  const randomValue = new Uint32Array(1);

  do {
    crypto.getRandomValues(randomValue);
  } while (randomValue[0] >= maximumAccepted);

  return randomValue[0] % limit;
}

function secureShuffle(values: string[]) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{question}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{answer}</p>
    </div>
  );
}
