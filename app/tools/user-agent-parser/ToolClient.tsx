"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ParsedUA = {
  clientFamily: string;
  clientVersion: string;
  browserLikeFamily: string;
  browserLikeVersion: string;
  engine: string;
  operatingSystem: string;
  osVersion: string;
  deviceType: string;
  deviceModel: string;
  architecture: string;
  botSignal: string;
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
  for (let index = 0; index < patterns.length; index += 1) {
    const match = input.match(patterns[index]);
    if (match) return match;
  }

  return null;
}

function detectNonBrowserClient(ua: string) {
  const rules: Array<[string, RegExp]> = [
    ["curl", /\bcurl\/([\d.]+)/i],
    ["Wget", /\bWget\/([\d.]+)/i],
    ["PostmanRuntime", /\bPostmanRuntime\/([\d.]+)/i],
    ["python-requests", /\bpython-requests\/([\d.]+)/i],
    ["okhttp", /\bokhttp\/([\d.]+)/i],
    ["Go-http-client", /\bGo-http-client\/([\d.]+)/i],
    ["Java HTTP client", /\bJava\/([\d._]+)/i],
    ["Apache-HttpClient", /\bApache-HttpClient\/([\d.]+)/i],
  ];

  for (let index = 0; index < rules.length; index += 1) {
    const match = ua.match(rules[index][1]);

    if (match) {
      return {
        family: rules[index][0],
        version: match[1] || "",
      };
    }
  }

  return null;
}

function detectBot(ua: string) {
  const named = ua.match(
    /(?:Googlebot(?:-Image|-Video|-News|-Smartphone)?|Google-InspectionTool|AdsBot-Google(?:-Mobile)?|bingbot|BingPreview|DuckDuckBot|YandexBot|Baiduspider|facebookexternalhit|Twitterbot|LinkedInBot|Applebot|AhrefsBot|SemrushBot|MJ12bot|GPTBot|ChatGPT-User|ClaudeBot|Bytespider|PetalBot)[\/:\s-]*([\d.]*)/i
  );

  if (named) {
    return named[0].trim() || "Named bot token detected";
  }

  const generic = ua.match(
    /\b[A-Za-z0-9._-]*(?:bot|crawler|spider)\b[\/:\s-]*([\d.]*)|\bslurp\b[\/:\s-]*([\d.]*)/i
  );

  return generic
    ? generic[0].trim() || "Generic bot/crawler token detected"
    : "No obvious bot token detected";
}

function parseUserAgentString(input: string): ParsedUA {
  const ua = input.trim();
  const notes: string[] = [];
  const reducedSignals: string[] = [];

  const botSignal = detectBot(ua);
  const hasBotSignal =
    botSignal !== "No obvious bot token detected";

  const nonBrowser = detectNonBrowserClient(ua);

  let browserLikeFamily = "Unknown";
  let browserLikeVersion = "";

  const browserRules: Array<[string, RegExp[]]> = [
    [
      "Microsoft Edge",
      [
        /EdgA\/([\d.]+)/,
        /EdgiOS\/([\d.]+)/,
        /Edg\/([\d.]+)/,
      ],
    ],
    [
      "Opera",
      [
        /OPR\/([\d.]+)/,
        /Opera\/([\d.]+)/,
      ],
    ],
    [
      "Samsung Internet",
      [/SamsungBrowser\/([\d.]+)/],
    ],
    [
      "Firefox",
      [
        /FxiOS\/([\d.]+)/,
        /Firefox\/([\d.]+)/,
      ],
    ],
    [
      "Chrome",
      [
        /CriOS\/([\d.]+)/,
        /Chrome\/([\d.]+)/,
      ],
    ],
    [
      "Chromium",
      [/Chromium\/([\d.]+)/],
    ],
    [
      "Safari",
      [/Version\/([\d.]+).*Safari\//],
    ],
    [
      "Internet Explorer",
      [
        /MSIE\s([\d.]+)/,
        /Trident\/.*rv:([\d.]+)/,
      ],
    ],
  ];

  for (
    let index = 0;
    index < browserRules.length;
    index += 1
  ) {
    const match = firstMatch(
      ua,
      browserRules[index][1]
    );

    if (match) {
      browserLikeFamily = browserRules[index][0];
      browserLikeVersion = match[1] || "";
      break;
    }
  }

  let clientFamily = browserLikeFamily;
  let clientVersion = browserLikeVersion;

  if (nonBrowser) {
    clientFamily = nonBrowser.family;
    clientVersion = nonBrowser.version;
  } else if (hasBotSignal) {
    clientFamily = "Bot / crawler";
    clientVersion = "";
  }

  let engine = "Unknown";

  if (/Trident\//.test(ua)) {
    engine = "Trident";
  } else if (
    /FxiOS\/|CriOS\/|EdgiOS\//.test(ua)
  ) {
    engine = "WebKit-based iOS browser";
  } else if (/Firefox\//.test(ua)) {
    engine = "Gecko";
  } else if (/AppleWebKit\//.test(ua)) {
    if (
      /Chrome\//.test(ua) ||
      /Edg\//.test(ua) ||
      /OPR\//.test(ua) ||
      /SamsungBrowser\//.test(ua)
    ) {
      engine = "Blink / Chromium family";
    } else {
      engine = "WebKit";
    }
  }

  let operatingSystem = "Unknown";
  let osVersion = "";
  let deviceModel = "";

  const android = ua.match(/Android\s([\d.]+)/i);
  const ios = ua.match(
    /(?:CPU (?:iPhone )?OS|iPhone OS)\s([\d_]+)/i
  );
  const windows = ua.match(
    /Windows NT\s([\d.]+)/i
  );
  const mac = ua.match(
    /Mac OS X\s([\d_]+)/i
  );
  const chromeOS = ua.match(
    /CrOS\s[^\s;)]*\s([\d.]+)/i
  );

  if (android) {
    operatingSystem = "Android";
    osVersion = android[1];

    const model = ua.match(
      /Android[^;)]*;\s*(?:[a-z]{2}-[A-Z]{2};\s*)?([^;)]+?)(?:\s+Build\/[^;)]*)?(?:;|\))/
    );

    if (model) {
      deviceModel = model[1].trim();
    }

    if (deviceModel === "K") {
      reducedSignals.push(
        "Android device model appears frozen/reduced to the generic value K."
      );
    }

    if (
      osVersion === "10" &&
      /;\s*K(?:\s|;|\))/.test(ua)
    ) {
      reducedSignals.push(
        "Android platform version appears reduced to the frozen Android 10 token."
      );
    }
  } else if (
    ios ||
    /iPhone|iPad|iPod/.test(ua) ||
    /Macintosh.*Mobile\//.test(ua)
  ) {
    const ipadDesktopMode =
      /Macintosh.*Mobile\//.test(ua);

    operatingSystem =
      /iPad/.test(ua) || ipadDesktopMode
        ? "iPadOS / iOS"
        : "iOS";
    osVersion = ios
      ? ios[1].replace(/_/g, ".")
      : "";

    deviceModel =
      /iPad/.test(ua) || ipadDesktopMode
        ? "iPad"
        : /iPod/.test(ua)
        ? "iPod"
        : "iPhone";
  } else if (windows) {
    operatingSystem =
      WINDOWS_VERSIONS[windows[1]] || "Windows";
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

  let architecture = "Unknown / not exposed";

  if (/arm64|aarch64/i.test(ua)) {
    architecture = "ARM64";
  } else if (/armv?\d|; arm;/i.test(ua)) {
    architecture = "ARM";
  } else if (
    /x86_64|Win64|x64|amd64/i.test(ua)
  ) {
    architecture = "64-bit x86";
  } else if (/i[3-6]86|x86/i.test(ua)) {
    architecture = "32-bit x86";
  }

  let deviceType = "Desktop / unknown form factor";

  if (hasBotSignal) {
    deviceType = "Bot / crawler";
  } else if (nonBrowser) {
    deviceType = "Software client / library";
  } else if (
    /iPad|Tablet|PlayBook|Silk\//i.test(ua) ||
    /Macintosh.*Mobile\//.test(ua) ||
    (/Android/i.test(ua) && !/Mobile/i.test(ua))
  ) {
    deviceType = "Tablet";
  } else if (
    /Mobile|iPhone|iPod|Windows Phone|IEMobile|Opera Mini/i.test(
      ua
    )
  ) {
    deviceType = "Mobile";
  }

  if (
    /Chrome\/\d+\.0\.0\.0/.test(ua) ||
    /Chromium\/\d+\.0\.0\.0/.test(ua)
  ) {
    reducedSignals.push(
      "Chromium minor/build/patch version appears reduced to 0.0.0."
    );
  }

  if (
    /Macintosh; Intel Mac OS X 10_15_7/.test(ua) &&
    /Chrome\/|Chromium\/|Edg\/|OPR\//.test(ua)
  ) {
    reducedSignals.push(
      "The macOS 10_15_7 platform token may be frozen by Chromium User-Agent reduction."
    );
  }

  if (
    /Windows NT 10\.0/.test(ua) &&
    /Chrome\/|Chromium\/|Edg\/|OPR\//.test(ua)
  ) {
    reducedSignals.push(
      "Windows 10 and Windows 11 can share the Windows NT 10.0 token, so this string cannot reliably distinguish them."
    );
  }

  if (
    browserLikeFamily === "Unknown" &&
    !nonBrowser &&
    !hasBotSignal
  ) {
    notes.push(
      "No supported browser or software-client token matched. The string may belong to an app, embedded client, uncommon library, or custom/spoofed User-Agent."
    );
  }

  if (
    hasBotSignal &&
    browserLikeFamily !== "Unknown"
  ) {
    notes.push(
      `The string also contains ${browserLikeFamily} ${browserLikeVersion || ""} compatibility tokens. Bot User-Agents often include browser-like tokens; they do not mean the crawler is that desktop browser.`
    );
  }

  if (
    deviceType === "Desktop / unknown form factor"
  ) {
    notes.push(
      "Desktop / unknown is a token-based fallback, not proof of a physical desktop device."
    );
  }

  if (!hasBotSignal) {
    notes.push(
      "No bot token was detected, but a User-Agent string is self-declared and easy to spoof. This does not prove the visitor is human."
    );
  }

  notes.push(
    "Use feature detection for browser capabilities. User-Agent parsing is best suited to diagnostics, logging, compatibility analysis, and coarse reporting—not authentication or authorization."
  );

  if (!reducedSignals.length) {
    notes.push(
      "No well-known reduced/frozen pattern was detected. That does not guarantee every reported detail is precise."
    );
  }

  return {
    clientFamily,
    clientVersion,
    browserLikeFamily,
    browserLikeVersion,
    engine,
    operatingSystem,
    osVersion,
    deviceType,
    deviceModel,
    architecture,
    botSignal,
    reducedSignals,
    notes,
  };
}

function resultText(result: ParsedUA) {
  const lines = [
    `Client family: ${result.clientFamily}${
      result.clientVersion
        ? ` ${result.clientVersion}`
        : ""
    }`,
    `Browser-like token: ${
      result.browserLikeFamily === "Unknown"
        ? "Not detected"
        : `${result.browserLikeFamily}${
            result.browserLikeVersion
              ? ` ${result.browserLikeVersion}`
              : ""
          }`
    }`,
    `Engine heuristic: ${result.engine}`,
    `Operating system: ${result.operatingSystem}${
      result.osVersion ? ` ${result.osVersion}` : ""
    }`,
    `Device type: ${result.deviceType}`,
    `Device model: ${
      result.deviceModel || "Not exposed / not detected"
    }`,
    `Architecture: ${result.architecture}`,
    `Bot signal: ${result.botSignal}`,
  ];

  if (result.reducedSignals.length) {
    lines.push(
      "",
      "Reduced / frozen signals:",
      ...result.reducedSignals.map(
        (item) => `- ${item}`
      )
    );
  }

  lines.push(
    "",
    "Interpretation notes:",
    ...result.notes.map((item) => `- ${item}`)
  );

  return lines.join("\n");
}

export default function ToolClient() {
  const [userAgent, setUserAgent] = useState("");
  const [result, setResult] =
    useState<ParsedUA | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const parse = () => {
    if (!userAgent.trim()) {
      setError(
        "Enter a User-Agent string to inspect."
      );
      setResult(null);
      setCopied(false);
      return;
    }

    setResult(parseUserAgentString(userAgent));
    setError("");
    setCopied(false);
  };

  const useCurrentBrowser = () => {
    const current = navigator.userAgent;

    setUserAgent(current);
    setResult(parseUserAgentString(current));
    setError("");
    setCopied(false);
  };

  const loadCrawlerExample = () => {
    const example =
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/143.0.0.0 Safari/537.36";

    setUserAgent(example);
    setResult(parseUserAgentString(example));
    setError("");
    setCopied(false);
  };

  const reset = () => {
    setUserAgent("");
    setResult(null);
    setError("");
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        resultText(result)
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ToolShell
      title="User Agent Parser"
      description="Read the clues inside a User-Agent string without treating them as ground truth: browser or software client, OS, device type, engine, architecture, bot tokens, and reduced/frozen values."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          User-Agent string
        </label>
        <textarea
          value={userAgent}
          onChange={(event: { target: { value: string } }) => {
            setUserAgent(event.target.value);
            setResult(null);
            setError("");
            setCopied(false);
          }}
          placeholder="Mozilla/5.0 (...) Chrome/143.0.0.0 Safari/537.36"
          spellCheck={false}
          className="w-full min-h-[230px] rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={parse}
          className="yoryantra-btn"
        >
          Parse User Agent
        </button>
        <button
          type="button"
          onClick={useCurrentBrowser}
          className="yoryantra-btn-outline"
        >
          Use Current Browser
        </button>
        <button
          type="button"
          onClick={loadCrawlerExample}
          className="yoryantra-btn-outline"
        >
          Load Crawler Example
        </button>
        <button
          type="button"
          onClick={reset}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing is performed on the supplied string in your browser. Choosing
        “Use Current Browser” reads <code>navigator.userAgent</code> locally;
        the parser itself does not send the value to a User-Agent lookup API.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this parsing operation.
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Parsed Signals
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Treat every field as a heuristic derived from self-declared text.
            </p>
          </div>

          {result ? (
            <button
              type="button"
              onClick={copyResult}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {result
            ? resultText(result)
            : "Browser/software client, OS, device, engine, architecture, bot, and reduction clues will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Why a User-Agent Can Say “Windows 10” on Windows 11
            </h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              Modern User-Agent strings are not a clean hardware inventory. Chromium-based browsers deliberately freeze or reduce several values to limit passive fingerprinting. On Windows, the old <code>Windows NT 10.0</code> token can represent both Windows 10 and Windows 11. On reduced Android strings, the platform may appear as Android 10 and the model as a generic <code>K</code> even when the real device is newer.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              That means a parser should sometimes say “unknown” or “Windows 10/11” instead of manufacturing precision that the string does not contain.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <h3 className="font-semibold text-yellow-900">
              Do not turn this into a security identity
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-yellow-900/90">
              User-Agent is supplied by the client and can be copied, modified, or completely fabricated. A browser-looking string does not prove that request came from that browser, and a Googlebot-looking string does not verify Googlebot. Authentication, authorization, fraud controls, and crawler verification need stronger evidence.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Browser Tokens Are Full of Historical Compatibility Baggage
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Many browser User-Agents start with <code>Mozilla/5.0</code> even though the browser is not Mozilla Firefox. Chromium browsers also contain AppleWebKit and Safari-looking tokens for compatibility. Edge, Opera, and Samsung Internet can contain Chrome tokens because they are Chromium-family browsers.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Detection order therefore matters. This parser looks for the more specific Edge, Opera, Samsung Internet, Firefox, Chrome, Chromium, Safari, and Internet Explorer tokens before assigning a browser-like family.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Not Every User-Agent Belongs to a Browser
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            APIs and server logs often contain User-Agent values from command-line tools, SDKs, monitoring agents, crawlers, mobile apps, or HTTP libraries. A string such as <code>curl/8.7.1</code> should not be forced into a fake browser classification simply because the page is called a User Agent Parser.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The tool recognizes several common non-browser clients—including curl, Wget, PostmanRuntime, python-requests, okhttp, Go’s HTTP client, and Apache HttpClient—and reports them as software clients rather than desktops or mobiles.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900">
              Good use: support diagnostics
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              A copied UA can help support staff understand the broad browser/OS family involved in a compatibility report.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900">
              Good use: coarse log analysis
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              User-Agent families can help group traffic by browser, bot, library, or broad device class when exact device identity is not required.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900">
              Poor use: feature gating
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              If you need to know whether a browser supports a web API or CSS feature, feature detection is generally more reliable than guessing from a UA version.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Bot Detection From the String Is Only a Hint
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Recognizable crawler tokens are useful when scanning logs, but they are not verification. Anyone can send a request whose User-Agent contains <code>Googlebot</code>, <code>bingbot</code>, or another crawler name. Conversely, automation can use a normal browser UA and avoid obvious bot words.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For decisions such as allowing privileged crawler access or investigating SEO crawl behavior, use the verification method documented by the crawler operator rather than trusting this field alone.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            iPhone Browsers Are a Special Parsing Case
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Firefox, Chrome, and Edge on iOS use tokens such as <code>FxiOS</code>, <code>CriOS</code>, and <code>EdgiOS</code>. Their product branding differs, but their engine situation on iOS is not the same as the desktop versions of those browsers. That is why the parser separates browser-like family from the engine heuristic instead of assuming “Chrome” always means Blink.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            When You Need More Detail Than the Reduced String Provides
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Supporting browsers can expose additional User-Agent Client Hint data when the site requests appropriate hints. That is a different mechanism from parsing the legacy User-Agent string, and it comes with privacy and permissions considerations of its own.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            MDN’s User-Agent reduction guide is useful for this particular tool because it documents the frozen Android, macOS, Windows, ChromeOS, Linux, and minor-version patterns that explain why some parsed values are intentionally imprecise.
          </p>
          <p className="mt-4 text-sm">
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/User-agent_reduction"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              MDN — User-Agent reduction
            </a>
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/user-agent-parser" />
        </div>
      </section>
    </ToolShell>
  );
}
