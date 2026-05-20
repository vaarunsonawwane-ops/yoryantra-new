"use client";

import { useMemo, useState } from "react";
import LinkA from "next/link";
import ToolShell from "@/app/components/ToolShell";

type RedirectStep = {
  url: string;
  status: number;
  type: string;
};

export default function ToolClient() {
  const [url, setUrl] = useState("");
  const [redirects, setRedirects] = useState<RedirectStep[]>([]);
  const [finalUrl, setFinalUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    ) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  const checkRedirects = async () => {
    const targetUrl = normalizeUrl(url);

    if (!targetUrl) {
      setError("Please enter a website URL.");
      setRedirects([]);
      setFinalUrl("");
      return;
    }

    setLoading(true);
    setError("");
    setRedirects([]);
    setFinalUrl("");

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
      });

      const redirectChain: RedirectStep[] = [];

      redirectChain.push({
        url: targetUrl,
        status: response.redirected ? 301 : response.status,
        type: response.redirected ? "Redirected" : "Direct",
      });

      if (response.redirected) {
        redirectChain.push({
          url: response.url,
          status: response.status,
          type: "Final Destination",
        });
}