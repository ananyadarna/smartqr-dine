"use client";

import { useEffect, useState } from "react";

/**
 * Extracts the subdomain from a given hostname.
 * Returns null if it is the root domain, www, localhost, or an IP address.
 */
export function getSubdomain(hostname: string): string | null {
  if (!hostname) return null;

  // Handle localhost development
  if (hostname.endsWith("localhost")) {
    const parts = hostname.split(".");
    // e.g. bistro.localhost
    if (parts.length > 1 && parts[parts.length - 1] === "localhost") {
      const sub = parts[0];
      if (sub === "www" || sub === "localhost") return null;
      return sub.toLowerCase();
    }
    return null;
  }

  // Check if it's an IP address
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (ipRegex.test(hostname)) return null;

  // Split by '.'
  const parts = hostname.split(".");

  // If there are at least 3 parts, the first part is the subdomain
  // e.g., bistro.smartqr-dine.com -> parts = ['bistro', 'smartqr-dine', 'com']
  // We ignore 'www' as a subdomain.
  if (parts.length >= 3) {
    // If the hostname ends with a known development domain like vercel.app, we should handle it.
    // e.g. if we are on smartqr-dine.vercel.app, parts.length is 3, parts[0] is 'smartqr-dine'.
    // In that case, we should treat smartqr-dine.vercel.app as the root domain (no subdomain).
    const mainDomainIndex = hostname.indexOf("smartqr-dine");
    if (mainDomainIndex !== -1) {
      // Find the part that contains smartqr-dine
      const rootIndex = parts.findIndex(p => p.includes("smartqr-dine"));
      if (rootIndex > 0) {
        const sub = parts[0];
        if (sub === "www") return null;
        return sub.toLowerCase();
      }
      return null;
    }

    const sub = parts[0];
    if (sub === "www") return null;
    return sub.toLowerCase();
  }

  return null;
}

/**
 * Custom hook to get the active subdomain in a client-side component.
 * Handles client-side mounting safely.
 */
export function useSubdomain() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sub = getSubdomain(window.location.hostname);
      setSubdomain(sub);
      setIsReady(true);
    }
  }, []);

  return { subdomain, isReady };
}

/**
 * Dynamically applies the restaurant theme preset to CSS variables on the document root.
 */
export function applyTheme(themeName: string | undefined | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const normalized = (themeName || "modern").toLowerCase();

  switch (normalized) {
    case "cafe":
      // Earthy, warm cafe vibes
      root.style.setProperty("--brand-orange", "#8b5a2b");
      root.style.setProperty("--brand-orange-hover", "#724a23");
      root.style.setProperty("--brand-orange-light", "#fdf6e2");
      root.style.setProperty("--brand-navy", "#2c2421");
      root.style.setProperty("--brand-navy-light", "#3d322e");
      break;
    case "luxury":
      // Elegant gold and deep charcoal
      root.style.setProperty("--brand-orange", "#d4af37");
      root.style.setProperty("--brand-orange-hover", "#b8942b");
      root.style.setProperty("--brand-orange-light", "#faf6f0");
      root.style.setProperty("--brand-navy", "#111111");
      root.style.setProperty("--brand-navy-light", "#222222");
      break;
    case "fastfood":
      // High-energy fastfood red
      root.style.setProperty("--brand-orange", "#dc2626");
      root.style.setProperty("--brand-orange-hover", "#b91c1c");
      root.style.setProperty("--brand-orange-light", "#fff1f2");
      root.style.setProperty("--brand-navy", "#0f172a");
      root.style.setProperty("--brand-navy-light", "#1e293b");
      break;
    case "modern":
    default:
      // Default vibrant orange and navy
      root.style.setProperty("--brand-orange", "#f97316");
      root.style.setProperty("--brand-orange-hover", "#ea580c");
      root.style.setProperty("--brand-orange-light", "#ffedd5");
      root.style.setProperty("--brand-navy", "#0a0f1d");
      root.style.setProperty("--brand-navy-light", "#151e36");
      break;
  }
}
