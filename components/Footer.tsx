"use client";

export default function Footer() {
  return (
    <footer className="bg-[#040404] border-t border-white/[0.04] py-8">
      <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span
          className="text-xl tracking-[0.2em] text-white"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          AC<span style={{ color: "#c8a96e" }}>VFX</span>
        </span>
        <p
          className="text-[10px] tracking-wider text-muted"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          © {new Date().getFullYear()} Alvaro Cavero. All rights reserved.
        </p>
        <div className="flex gap-6">
          {["Showreel", "Work", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[10px] tracking-[0.3em] uppercase text-muted hover:text-gold transition-colors duration-300"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
