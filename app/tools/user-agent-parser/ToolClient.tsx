"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ParsedUA = {
  browser: string;
  browserVersion: string;
  engine: string;
  operatingSystem: string;
  osVersion: string;
  deviceType: string;
  deviceModel: string;
  architecture: string;
  bot: string;
  reducedSignals: string[];
  notes: string[];
};

const WINDOWS_VERSIONS: Record<string, string> = {
  "10.0": "Windows 10/11",
  "6.3": "Windows 8.1",
  "6.2": "Windows 8",
  "6.1": "Windows 7",
  "6.0": "Windows Vista",
  "5.2": "Windows XP x64 / Server 2003",
  "5.1": "Windows XP",
};

function firstMatch(input: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match;
  }
  return null;
}

function parseUserAgentString(input: string): ParsedUA {
  const ua = input.trim();
  const lower = ua.toLowerCase();
  const notes: string[] = [];
  const reducedSignals: string[] = [];

  let browser = "Unknown";
  let browserVersion = "";

  const browserRules: Array<[string, RegExp[]]> = [
    ["Microsoft Edge", [/EdgA\/([\d.]+)/, /EdgiOS\/([\d.]+)/, /Edg\/([\d.]+)/]],
    ["Opera", [/OPR\/([\d.]+)/, /Opera\/([\d.]+)/]],
    ["Samsung Internet", [/SamsungBrowser\/([\d.]+)/]],
    ["Firefox", [/FxiOS\/([\d.]+)/, /Firefox\/([\d.]+)/]],
    ["Chrome", [/CriOS\/([\d.]+)/, /Chrome\/([\d.]+)/]],
    ["Chromium", [/Chromium\/([\d.]+)/]],
    ["Safari", [/Version\/([\d.]+).*Safari\//]],
    ["Internet Explorer", [/MSIE\s([\d.]+)/, /Trident\/.*rv:([\d.]+)/]],
  ];

  for (const [name, patterns] of browserRules) {
    const match = firstMatch(ua, patterns);
    if (match) {
      browser = name;
      browserVersion = match[1] || "";
      break;
    }
  }

  let engine = "Unknown";
  if (/Trident\//.test(ua)) {
    engine = "Trident";
  } else if (/FxiOS\/|CriOS\/|EdgiOS\//.test(ua)) {
    engine = "WebKit (iOS browser)";
  } else if (/Firefox\//.test(ua)) {
    engine = "Gecko";
  } else if (/AppleWebKit\//.test(ua)) {
    if (/Chrome\//.test(ua) || /Edg\//.test(ua) || /OPR\//.test(ua) || /SamsungBrowser\//.test(ua)) {
      engine = "Blink / Chromium family";
    } else {
      engine = "WebKit";
    }
  }

  let operatingSystem = "Unknown";
  let osVersion = "";
  let deviceModel = "";

  const android = ua.match(/Android\s([\d.]+)/i);
  const ios = ua.match(/(?:CPU (?:iPhone )?OS|iPhone OS)\s([\d_]+)/i);
  const windows = ua.match(/Windows NT\s([\d.]+)/i);
  const mac = ua.match(/Mac OS X\s([\d_]+)/i);
  const chromeOS = ua.match(/CrOS\s[^\s;)]*\s([\d.]+)/i);

  if (android) {
    operatingSystem = "Android";
    osVersion = android[1];
    const model = ua.match(/Android[^;)]*;\s*(?:[a-z]{2}-[A-Z]{2};\s*)?([^;)]+?)(?:\s+Build\/[^;)]*)?(?:;|\))/);
    if (model) {
      deviceModel = model[1].trim();
      if (deviceModel === "K") reducedSignals.push("Android device model appears reduced to the generic value K.");
    }
    if (osVersion === "10" && /;\s*K(?:\s|;|\))/.test(ua)) {
      reducedSignals.push("Android platform version appears reduced to Android 10.");
    }
  } else if (ios || /iPhone|iPad|iPod/.test(ua) || /Macintosh.*Mobile\//.test(ua)) {
    const ipadDesktopMode = /Macintosh.*Mobile\//.test(ua);
    operatingSystem = /iPad/.test(ua) || ipadDesktopMode ? "iPadOS / iOS" : "iOS";
    osVersion = ios ? ios[1].replace(/_/g, ".") : "";
    deviceModel = /iPad/.test(ua) || ipadDesktopMode ? "iPad" : /iPod/.test(ua) ? "iPod" : "iPhone";
  } else if (windows) {
    operatingSystem = WINDOWS_VERSIONS[windows[1]] || "Windows";
    osVersion = windows[1];
  } else if (chromeOS) {
    operatingSystem = "ChromeOS";
    osVersion = chromeOS[1];
  } else if (mac) {
    operatingSystem = "macOS";
    osVersion = mac[1].replace(/_/g, ".");
  } else if (/Linux/.test(ua)) {
    operatingSystem = "Linux";
  }

  let bot = "No obvious bot token detected";
  const botMatch = ua.match(/(?:Googlebot|bingbot|BingPreview|DuckDuckBot|YandexBot|Baiduspider|Slurp|facebookexternalhit|Twitterbot|LinkedInBot|AhrefsBot|SemrushBot|MJ12bot|GPTBot|ChatGPT-User|ClaudeBot|Applebot|bot|crawler|spider)[\/:\s-]*([\d.]*)/i);
  if (botMatch) {
    bot = botMatch[0].trim() || "Bot/crawler token detected";
  }

  let deviceType = "Desktop / unknown form factor";
  if (botMatch) {
    deviceType = "Bot / crawler";
  } else if (/iPad|Tablet|PlayBook|Silk\//i.test(ua) || /Macintosh.*Mobile\//.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    deviceType = "Tablet";
  } else if (/Mobile|iPhone|iPod|Windows Phone|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = "Mobile";
  }

  let architecture = "Unknown / not exposed";
  if (/arm64|aarch64/i.test(ua)) architecture = "ARM64";
  else if (/armv?\d|; arm;/i.test(ua)) architecture = "ARM";
  else if (/x86_64|Win64|x64|amd64/i.test(ua)) architecture = "64-bit x86";
  else if (/i[3-6]86|x86/i.test(ua)) architecture = "32-bit x86";

  if (/Chrome\/\d+\.0\.0\.0/.test(ua)) {
    reducedSignals.push("Chromium minor/build/patch version appears reduced to 0.0.0.");
  }
  if (/Macintosh; Intel Mac OS X 10_15_7/.test(ua) && /Chrome\//.test(ua)) {
    reducedSignals.push("Chromium on macOS may expose the frozen platform token 10_15_7.");
  }
  if (/Windows NT 10\.0/.test(ua) && /Chrome\//.test(ua)) {
    reducedSignals.push("Windows 10 and Windows 11 can share the Windows NT 10.0 token in reduced Chromium User-Agent strings.");
  }

  if (browser === "Unknown") notes.push("No supported browser-family token matched. The string may belong to an app, library, crawler, embedded client, or spoofed UA.");
  if (deviceType === "Desktop / unknown form factor") notes.push("A User-Agent string cannot reliably prove the physical form factor. This is a token-based heuristic.");
  if (!botMatch) notes.push("Absence of a bot token does not prove the client is human; User-Agent strings are easy to change or spoof.");
  notes.push("Use feature detection for browser capabilities. User-Agent parsing is best treated as diagnostics or coarse analytics, not a security boundary.");

  return {
    browser,
    browserVersion,
    engine,
    operatingSystem,
    osVersion,
    deviceType,
    deviceModel,
    architecture,
    bot,
    reducedSignals,
    notes,
  };
}

function resultText(result: ParsedUA) {
  const lines = [
    `Browser: ${result.browser}${result.browserVersion ? ` ${result.browserVersion}` : ""}`,
    `Engine: ${result.engine}`,
    `Operating system: ${result.operatingSystem}${result.osVersion ? ` ${result.osVersion}` : ""}`,
    `Device type: ${result.deviceType}`,
    `Device model: ${result.deviceModel || "Not exposed / not detected"}`,
    `Architecture: ${result.architecture}`,
    `Bot signal: ${result.bot}`,
  ];

  if (result.reducedSignals.length) {
    lines.push("", "Reduced/frozen signals:", ...result.reducedSignals.map((item) => `- ${item}`));
  }
  lines.push("", "Interpretation notes:", ...result.notes.map((item) => `- ${item}`));
  return lines.join("\n");
}

export default function ToolClient() {
  const [userAgent, setUserAgent] = useState("");
  const [result, setResult] = useState<ParsedUA | null>(null);
  const [error, setError] = useState("");

  const parse = () => {
    if (!userAgent.trim()) {
      setError("Enter a User-Agent string to inspect.");
      setResult(null);
      return;
    }
    setResult(parseUserAgentString(userAgent));
    setError("");
  };

  const useCurrentBrowser = () => {
    const current = navigator.userAgent;
    setUserAgent(current);
    setResult(parseUserAgentString(current));
    setError("");
  };

  const reset = () => {
    setUserAgent("");
    setResult(null);
    setError("");
  };

  return (
    <ToolShell
      title="User Agent Parser"
      description="Inspect a User-Agent string for browser, OS, device, engine, bot, and reduction signals without sending it anywhere."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">User-Agent string</label>
        <textarea
          value={userAgent}
          onChange={(event: { target: { value: string } }) => setUserAgent(event.target.value)}
          placeholder="Mozilla/5.0 (...) Chrome/143.0.0.0 Safari/537.36"
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parse} className="yoryantra-btn">Parse User Agent</button>
        <button onClick={useCurrentBrowser} className="yoryantra-btn-outline">Use Current Browser</button>
        <button onClick={reset} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Parsed Result</h3>
          {result && (
            <button onClick={() => navigator.clipboard.writeText(resultText(result))} className="yoryantra-btn-outline text-sm">Copy</button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {result ? resultText(result) : "Browser, OS, device, engine, and diagnostic notes will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What a User-Agent String Can—and Cannot—Tell You</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A User-Agent string is an HTTP request header value that usually contains product tokens and comments associated with the client. Browser strings have accumulated compatibility tokens over many years, so parsing them is heuristic rather than a clean feature-detection API.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Modern Chromium-based browsers also reduce parts of the User-Agent string to limit passive fingerprinting. Exact operating-system versions, device models, and minor browser versions may therefore be frozen or replaced with generic values. When more detail is genuinely needed, supporting browsers can expose User-Agent Client Hints after the appropriate opt-in.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How This Parser Classifies a String</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Browser-family rules are ordered so Edge, Opera, Samsung Internet, and iOS variants are not accidentally labeled as plain Chrome or Safari.</li>
            <li>Android is checked before generic Linux, and iPhone/iPad tokens are handled separately.</li>
            <li>Device type and bot status are token-based hints, not proof of a physical device or a human visitor.</li>
            <li>Reduced Chromium patterns are called out because their apparent version or platform detail can be intentionally imprecise.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
          <strong>Implementation note:</strong> do not use User-Agent parsing as an authentication, authorization, anti-fraud, or browser-capability decision by itself. Prefer feature detection for functionality and stronger signals for security decisions.
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">References</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">Useful primary references:</p>
          <ul className="mt-3 list-disc list-inside space-y-2 text-gray-600">
            <li><a className="underline" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent" target="_blank" rel="noreferrer">MDN: User-Agent header</a></li>
            <li><a className="underline" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/User-agent_reduction" target="_blank" rel="noreferrer">MDN: User-Agent reduction</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Explore Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/user-agent-parser" />
        </div>
      </section>
    </ToolShell>
  );
}
