"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useIntroDone } from "@/lib/intro";

const links = [
  { label: "Showreel", section: 1 },
  { label: "Work",     section: 2 },
  { label: "Contact",  section: 3 },
];

const goto = (section: number) =>
  window.dispatchEvent(new CustomEvent("snap-goto", { detail: section }));

export default function Navbar() {
  const [currentSection, setCurrentSection] = useState(0);
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const onSection = (e: Event) => setCurrentSection((e as CustomEvent<number>).detail);
    // snap-goto = clicked nav link; snap-section = scroll/keyboard navigation
    window.addEventListener("snap-goto",    onSection);
    window.addEventListener("snap-section", onSection);
    return () => {
      window.removeEventListener("snap-goto",    onSection);
      window.removeEventListener("snap-section", onSection);
    };
  }, []);

  const scrolled = currentSection > 0;
  // the bar slides in after the ACJ STUDIOS intro, not hidden underneath it (lib/intro.ts)
  const introDone = useIntroDone();
  if (!introDone) return null;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 2.2, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-[99998] transition-all duration-500 ${
        scrolled ? "backdrop-blur-md border-b border-white/5" : ""
      }`}
      style={scrolled ? { background: "var(--bg-nav)" } : {}}
    >
      {/* pr-32 leaves room for the fixed theme toggle (layout.tsx) so it never covers Contact / the mobile menu button */}
      <div className="max-w-[1400px] mx-auto pl-8 pr-32 py-5 flex items-center justify-between">
        {/* ACJ | STUDIOS mark (public/brand, generated from the logo); STUDIOS follows the theme */}
        <button
          onClick={() => goto(0)}
          aria-label="ACJ Studios — home"
          className="btn-press opacity-90 hover:opacity-100 transition-opacity duration-300"
        >
          <img
            src={theme === "light" ? "/brand/marca_nav_claro.png" : "/brand/marca_nav_oscuro.png"}
            alt="ACJ Studios"
            height={28}
            style={{ height: 28, width: "auto", display: "block" }}
          />
        </button>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => goto(l.section)}
              className={`link-underline btn-press text-[11px] tracking-[0.35em] uppercase transition-colors duration-300 ${
                currentSection === l.section ? "text-gold" : "text-muted hover:text-gold"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-[5px] p-1"
          aria-label="menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`block h-px bg-white transition-all duration-300 ${
                i === 0
                  ? open ? "w-5 rotate-45 translate-y-[6px]" : "w-5"
                  : i === 1
                  ? open ? "opacity-0 w-5" : "w-3"
                  : open ? "w-5 -rotate-45 -translate-y-[6px]" : "w-5"
              }`}
            />
          ))}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-white/5"
            style={{ background: "var(--bg-nav-mobile)" }}
          >
            <div className="px-8 py-6 flex flex-col gap-5">
              {links.map((l) => (
                <button
                  key={l.label}
                  onClick={() => { goto(l.section); setOpen(false); }}
                  className="text-sm tracking-[0.3em] uppercase text-muted hover:text-gold transition-colors text-left"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
