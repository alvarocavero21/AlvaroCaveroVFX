"use client";

import { useEffect, useState } from "react";

// The ACJ STUDIOS intro (public/acj-intro) keeps <html class="acj-intro-activa"> while it plays and fires
// "acj-intro-fin" when the page starts to show. Components with entrance animations wait for it; otherwise those
// animations run hidden under the intro. Without the intro (already seen this visit) they start right away.
export function useIntroDone() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!document.documentElement.classList.contains("acj-intro-activa")) {
      setDone(true);
      return;
    }
    const finish = () => setDone(true);
    window.addEventListener("acj-intro-fin", finish);
    const fallback = setTimeout(finish, 10000); // never keep the page empty
    return () => {
      window.removeEventListener("acj-intro-fin", finish);
      clearTimeout(fallback);
    };
  }, []);

  return done;
}

// True when the intro flew its logo onto the Hero logo (public/acj-intro/acj-intro.js sets it right before
// "acj-intro-fin"): the Hero logo must then appear already in place, without its own entrance animation.
export function introRelay(): boolean {
  return typeof window !== "undefined" && (window as unknown as { __acjRelevo?: boolean }).__acjRelevo === true;
}
