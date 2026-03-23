"use client";

import { useEffect } from "react";

const SW_CLEANUP_KEY = "sw-cleanup-done-v1";

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Run once per browser session to avoid repeated cache churn.
    if (sessionStorage.getItem(SW_CLEANUP_KEY) === "1") {
      return;
    }
    sessionStorage.setItem(SW_CLEANUP_KEY, "1");

    const cleanup = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
        }
      } catch (error) {
        // Keep this silent in production because failure here is non-fatal.
        console.warn("Service worker cleanup failed:", error);
      }
    };

    cleanup();
  }, []);

  return null;
}
