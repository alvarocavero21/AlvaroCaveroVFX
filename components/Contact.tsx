"use client";

import { useRef, useEffect } from "react";
import { SplitScramble } from "@/components/ui/split-text";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Magnetic pull toward cursor within RADIUS px
function MagneticLink({ href, target, rel, children, className }: {
  href: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const RADIUS = 80;
    const STRENGTH = 0.28;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < RADIUS) {
        const pull = (RADIUS - dist) / RADIUS;
        el.style.transform = `translate(${dx * pull * STRENGTH}px, ${dy * pull * STRENGTH}px)`;
      } else {
        el.style.transform = "translate(0,0)";
      }
    };
    const onLeave = () => { el.style.transform = "translate(0,0)"; };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      className={className}
      style={{ transition: "transform 0.35s cubic-bezier(0.23,1,0.32,1)", display: "block" }}
    >
      {children}
    </a>
  );
}

const socials = [
  {
    label: "Email",
    value: "alvarocavero21@gmail.com",
    href: "mailto:alvarocavero21@gmail.com",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    value: "/in/alvaro-cavero",
    href: "https://www.linkedin.com/in/alvaro-cavero/",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "ArtStation",
    value: "/alvarocavero",
    href: "https://www.artstation.com/alvarocavero",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 002.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 00-2.164-1.333H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zm-11.129-3.462L7.428 4.858l-5.444 9.428h10.887z" />
      </svg>
    ),
  },
];

export default function Contact() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section
      id="contact"
      ref={ref}
      className="relative h-screen overflow-hidden flex flex-col justify-center pt-20 pb-8"
      style={{ backgroundColor: "var(--bg-primary)", transition: "background-color 0.4s ease" }}
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Large background text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="text-[clamp(6rem,18vw,16rem)] leading-none tracking-widest text-white/[0.02]"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          CONTACT
        </span>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-center">

          {/* LEFT COLUMN — Profile photo (40% = 2/5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-2 flex justify-center lg:justify-end"
          >
            <div className="relative w-[200px] h-[200px] lg:w-[280px] lg:h-[280px]">
              {/* Gold glow ring */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  boxShadow:
                    "0 0 30px rgba(200,169,110,0.20), 0 0 60px rgba(200,169,110,0.08)",
                }}
              />
              {/* Circular frame */}
              <div
                className="relative w-full h-full rounded-full overflow-hidden"
                style={{ border: "1px solid rgba(200,169,110,0.5)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/profile.jpg"
                  alt="Alvaro Cavero"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 5%",
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN — Contact info (60% = 3/5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3 flex flex-col"
          >
            {/* Heading */}
            <div className="mb-6">
              <p
                className="text-[10px] tracking-[0.5em] uppercase text-gold mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Get In Touch
              </p>
              <h2
                className="text-[clamp(3rem,8vw,7rem)] leading-none text-white tracking-wide mb-4"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <SplitScramble text="LET'S WORK" stagger={0.05} />
                <br />
                <SplitScramble text="TOGETHER" stagger={0.05} />
              </h2>
              <div className="w-20 h-px bg-gold" />
            </div>

            {/* Availability */}
            <p
              className="text-xs tracking-[0.35em] uppercase text-muted mb-4"
              style={{
                fontFamily: "Inter, sans-serif",
                fontVariationSettings: inView ? "'wght' 500" : "'wght' 300",
                transition: "font-variation-settings 0.8s ease",
              }}
            >
              Available for freelance &amp; full-time
            </p>
            <div className="flex items-center gap-2.5 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span
                className="text-[9px] tracking-[0.3em] uppercase"
                style={{ fontFamily: "Inter, sans-serif", color: "var(--text-muted)" }}
              >
                Available for projects
              </span>
            </div>

            {/* Social links */}
            <div className="space-y-3 mb-8">
              {socials.map((s) => (
                <MagneticLink
                  key={s.label}
                  href={s.href}
                  target={s.label !== "Email" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 border border-white/[0.06] hover:border-gold/40 hover:bg-gold/[0.04] transition-all duration-300"
                >
                  <span className="flex-shrink-0 w-9 h-9 rounded-full border border-gold/0 group-hover:border-gold/40 flex items-center justify-center text-gold/50 group-hover:text-gold transition-all duration-300">
                    {s.icon}
                  </span>
                  <div>
                    <p className="text-[9px] tracking-widest uppercase text-muted mb-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                      {s.label}
                    </p>
                    <p
                      className="text-sm text-white/60 group-hover:text-white transition-colors duration-300"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontVariationSettings: inView ? "'wght' 450" : "'wght' 300",
                        transition: "font-variation-settings 0.8s ease, color 0.3s ease",
                      }}
                    >
                      {s.value}
                    </p>
                  </div>
                  <svg className="w-3 h-3 ml-auto text-muted/30 group-hover:text-gold/50 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </MagneticLink>
              ))}
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 text-xs text-muted tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-gold/40" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-white/40 mb-0.5 text-[9px] tracking-[0.3em] uppercase">Based in</p>
                <p>Madrid, Spain</p>
                <p className="text-white/30 text-[10px] mt-0.5">Available remote worldwide</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
