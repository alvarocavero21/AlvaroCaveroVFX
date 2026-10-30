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
