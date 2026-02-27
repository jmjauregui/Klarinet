"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Registrar el SW después de que la página cargue
    window.addEventListener("load", registerSW);
    // En caso de que 'load' ya haya disparado
    if (document.readyState === "complete") {
      registerSW();
    }

    return () => {
      window.removeEventListener("load", registerSW);
    };
  }, []);

  return null;
}

async function registerSW() {
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // Verificar actualizaciones periódicamente (cada hora)
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    console.log("[Klarinet] Service Worker registrado:", registration.scope);
  } catch (error) {
    console.error("[Klarinet] Error registrando Service Worker:", error);
  }
}
