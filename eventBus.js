// eventBus.js — ESM, minimal + robust
import { Events, EventAliases } from './events.js';

const DEV = !!window.__DEV__;
const lastEvents = new Map();                 // sticky payloads
const listeners  = new Map();                 // Map<event, Map<id, fn>>

const mapName = (name) => (EventAliases && EventAliases[name]) || name;

export const EventBus = {
  emit(name, detail = {}) {
    const n = mapName(name);
    if (DEV) console.debug('[emit]', n, detail);
    lastEvents.set(n, detail);
    window.dispatchEvent(new CustomEvent(n, { detail }));
  },

  // on: optional id + async replay (Re-Entrancy vermeiden)
  on(name, handler, opts = {}) {
    const { replay = true, id } = opts;
    const n  = mapName(name);
    const fn = (e) => handler(e.detail ?? {});
    window.addEventListener(n, fn);

    if (id) {
      if (!listeners.has(n)) listeners.set(n, new Map());
      listeners.get(n).set(id, fn);
    }

    if (replay && lastEvents.has(n)) {
      const payload = lastEvents.get(n);
      // async replay to avoid re-entrancy loops
      (queueMicrotask
        ? queueMicrotask(() => { try { handler(payload); } catch {} })
        : setTimeout(() => { try { handler(payload); } catch {} }, 0));
    }

    // unsubscribe function (weiter verfügbar)
    return () => window.removeEventListener(n, fn);
  },

  // off: per id (bevorzugt) oder direkt mit fn
  off(name, idOrFn) {
    const n = mapName(name);
    if (typeof idOrFn === 'function') {
      try { window.removeEventListener(n, idOrFn); } catch {}
      return;
    }
    const m = listeners.get(n);
    if (m && m.has(idOrFn)) {
      const fn = m.get(idOrFn);
      try { window.removeEventListener(n, fn); } catch {}
      m.delete(idOrFn);
      if (!m.size) listeners.delete(n);
    }
  },

  // once: exakt 1x ausführen, dann off (nutzt obige off/on)
  once(name, handler, opts = {}) {
  const id = opts.id || `__once_${Math.random().toString(36).slice(2)}`;
  let fired = false;
  return this.on(name, (payload) => {
    if (fired) return;          // ← mehrfaches Auslösen verhindern (Replay + Emit)
    fired = true;
    try { this.off(name, id); } catch {}
    try { handler(payload); } catch {}
  }, { ...opts, id });
},

  // Entfernt alle Listener, deren ID mit prefix beginnt (seitenweiter Cleanup)
  offByPattern(prefix = '') {
    if (!prefix) return 0;
    let removed = 0;
    for (const [evt, map] of Array.from(listeners.entries())) {
      if (!map || !map.size) continue;
      for (const [id, fn] of Array.from(map.entries())) {
        if (!id || !id.startsWith(prefix)) continue;
        try { window.removeEventListener(mapName(evt), fn); } catch {}
        map.delete(id);
        removed++;
      }
      if (!map.size) listeners.delete(evt);
    }
    if (DEV) console.debug('[offByPattern]', prefix, 'removed', removed);
    return removed;
  }


};
