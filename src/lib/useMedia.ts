import { useEffect, useState } from "react";

export function useMedia(query: string, fallback = false): boolean {
  const get = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : fallback);
  const [match, setMatch] = useState(get);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(query);
    const on = (e: MediaQueryListEvent) => setMatch(e.matches);
    setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}
