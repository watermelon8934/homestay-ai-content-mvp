import { useEffect, useState, useCallback } from "react";
import type { NoteDraft, Property } from "./types";

const PROPERTY_KEY = "msai_property_v1";
const QUOTA_KEY = "msai_quota_v1";
const HISTORY_KEY = "msai_history_v1";
const CURRENT_KEY = "msai_current_v1";

const DAILY_LIMIT = 5;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ---------- Property ----------
export function useProperty() {
  const [property, setProperty] = useState<Property>({ name: "", city: "" });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProperty(readJSON<Property>(PROPERTY_KEY, { name: "", city: "" }));
    setLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<Property>) => {
    setProperty((prev) => {
      const next = { ...prev, ...patch };
      writeJSON(PROPERTY_KEY, next);
      return next;
    });
  }, []);

  return { property, update, loaded };
}

// ---------- Quota ----------
export function useQuota() {
  const [used, setUsed] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = readJSON<{ date: string; used: number }>(QUOTA_KEY, {
      date: todayStr(),
      used: 0,
    });
    if (data.date !== todayStr()) {
      writeJSON(QUOTA_KEY, { date: todayStr(), used: 0 });
      setUsed(0);
    } else {
      setUsed(data.used);
    }
    setLoaded(true);
  }, []);

  const consume = useCallback(() => {
    setUsed((prev) => {
      const next = Math.min(DAILY_LIMIT, prev + 1);
      writeJSON(QUOTA_KEY, { date: todayStr(), used: next });
      return next;
    });
  }, []);

  return {
    used,
    limit: DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - used),
    exhausted: used >= DAILY_LIMIT,
    consume,
    loaded,
  };
}

// ---------- History ----------
const MAX_HISTORY = 20;

export function useHistory() {
  const [history, setHistory] = useState<NoteDraft[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHistory(readJSON<NoteDraft[]>(HISTORY_KEY, []));
    setLoaded(true);
  }, []);

  const add = useCallback((draft: NoteDraft) => {
    setHistory((prev) => {
      const next = [draft, ...prev].slice(0, MAX_HISTORY);
      writeJSON(HISTORY_KEY, next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((d) => d.id !== id);
      writeJSON(HISTORY_KEY, next);
      return next;
    });
  }, []);

  return { history, add, remove, loaded };
}

export function getHistoryItem(id: string): NoteDraft | undefined {
  return readJSON<NoteDraft[]>(HISTORY_KEY, []).find((d) => d.id === id);
}

// ---------- Current draft (for /result page) ----------
export function setCurrentDraft(draft: NoteDraft) {
  writeJSON(CURRENT_KEY, draft);
}

export function getCurrentDraft(): NoteDraft | null {
  return readJSON<NoteDraft | null>(CURRENT_KEY, null);
}
