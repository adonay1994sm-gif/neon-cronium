(() => {
  "use strict";

  const ALLOWED_EVENTS = new Set([
    "app_open", "game_start", "level_start", "level_complete", "death", "death_reason",
    "continue_used", "rewarded_ad", "abandon", "session_duration", "progression",
    "ability_used", "boss_started", "boss_completed",
    // Caja negra del enlace de prueba (09/11/2026): tramo, golpes y fluidez.
    "stage_start", "hit_taken", "perf"
  ]);
  const sessionStartedAt = performance.now();
  const sessionId = globalThis.crypto?.randomUUID?.() || `session-${Date.now().toString(36)}`;
  const buffer = [];
  let provider = null;

  function sanitizedProperties(properties) {
    if (!properties || typeof properties !== "object" || Array.isArray(properties)) return {};
    return Object.fromEntries(
      Object.entries(properties)
        .filter(([key, value]) => typeof key === "string" && ["string", "number", "boolean"].includes(typeof value))
        .slice(0, 16)
    );
  }

  function track(name, properties = {}) {
    if (!ALLOWED_EVENTS.has(name)) return false;
    const event = Object.freeze({
      name,
      properties: sanitizedProperties(properties),
      sessionId,
      timestamp: new Date().toISOString()
    });
    buffer.push(event);
    if (buffer.length > 100) buffer.shift();
    window.dispatchEvent(new CustomEvent("neon-analytics", { detail: event }));
    try { provider?.track?.(event.name, event.properties); } catch {}
    return true;
  }

  window.AnalyticsManager = Object.freeze({
    track,
    setProvider(adapter) {
      provider = adapter && typeof adapter.track === "function" ? adapter : null;
      return Boolean(provider);
    },
    snapshot: () => buffer.map((event) => ({ ...event, properties: { ...event.properties } })),
    sessionDurationSeconds: () => Math.max(0, (performance.now() - sessionStartedAt) / 1000)
  });
})();
