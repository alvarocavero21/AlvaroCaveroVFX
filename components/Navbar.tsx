"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    const onSection = (e: Event) => setCurrentSection((e as CustomEvent<number>).detail);
    window.addEventListener("snap-goto", onSection);
    return () => window.removeEventListener("snap-goto", onSection);
  }, []);

  const scrolled = currentSection > 0;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 2.2, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-[99998] transition-all duration-500 ${
        scrolled ? "bg-[#080808]/90 backdrop-blur-md border-b border-white/5" : ""
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-8 py-5 flex items-center justify-between">
        <button
          onClick={() => goto(0)}
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          className="text-2xl tracking-[0.2em] text-white hover:text-gold transition-colors duration-300"
        >
          AC<span className="text-gold">VFX</span>
        </button>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => goto(l.section)}
              className={`text-[11px] tracking-[0.35em] uppercase transition-colors duration-300 ${
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
            className="md:hidden overflow-hidden bg-[#080808]/95 border-t border-white/5"
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
