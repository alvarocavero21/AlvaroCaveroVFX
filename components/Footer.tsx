"use client";

export default function Footer() {
  return (
    <footer className="border-t py-8" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
      <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span
          className="text-xl tracking-[0.2em]"
          style={{ fontFamily: "'Bebas Neue', sans-serif", color: "var(--text-primary)" }}
        >
          AC<span style={{ color: "var(--accent)" }}>VFX</span>
        </span>
        <p
          className="text-[10px] tracking-wider"
          style={{ fontFamily: "Inter, sans-serif", color: "var(--text-muted)" }}
        >
          © {new Date().getFullYear()} Alvaro Cavero. All rights reserved.
        </p>
        <div className="flex gap-6">
          {["Showreel", "Work", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[10px] tracking-[0.3em] uppercase hover:text-gold transition-colors duration-300"
              style={{ fontFamily: "Inter, sans-serif", color: "var(--text-muted)" }}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
