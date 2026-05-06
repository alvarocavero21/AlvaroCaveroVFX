"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

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
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1600);
  };

  return (
    <section id="contact" ref={ref} className="relative h-screen bg-[#080808] overflow-hidden flex flex-col justify-center">
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

      <div className="max-w-[1400px] mx-auto px-8 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
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
            LET&apos;S WORK
            <br />
            TOGETHER
          </h2>
          <div className="w-20 h-px bg-gold mx-auto" />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
          {/* Left — links */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 flex flex-col justify-center"
          >
            <p
              className="text-xs tracking-[0.35em] uppercase text-muted mb-8"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Available for freelance & full-time
            </p>

            <div className="space-y-3 mb-10">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.label !== "Email" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 border border-white/[0.06] hover:border-gold/40 hover:bg-gold/[0.04] transition-all duration-400"
                >
                  <span className="text-gold/50 group-hover:text-gold transition-colors duration-300">
                    {s.icon}
                  </span>
                  <div>
                    <p
                      className="text-[9px] tracking-widest uppercase text-muted mb-0.5"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {s.label}
                    </p>
                    <p
                      className="text-sm text-white/60 group-hover:text-white transition-colors duration-300"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {s.value}
                    </p>
                  </div>
                  <svg
                    className="w-3 h-3 ml-auto text-muted/30 group-hover:text-gold/50 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>

            <div className="text-xs text-muted tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>
              <p className="text-white/40 mb-1">Based in</p>
              <p>Madrid, Spain · Available remote worldwide</p>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-3"
          >
            {status === "sent" ? (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center border border-gold/20 bg-gold/[0.03]">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-14 h-14 border border-gold/40 rounded-full flex items-center justify-center mb-6"
                >
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3
                  className="text-3xl tracking-wider text-white mb-1"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  Message Sent
                </h3>
                <p
                  className="text-xs text-muted tracking-wider"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  I&apos;ll get back to you within 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: "name", label: "Name", type: "text", placeholder: "Your name" },
                  { key: "email", label: "Email", type: "email", placeholder: "your@email.com" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label
                      className="block text-[9px] tracking-[0.4em] uppercase text-muted mb-2"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      required
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/8 px-4 py-3.5 text-sm text-white placeholder-white/15 focus:outline-none focus:border-gold/50 transition-colors duration-300"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                ))}

                <div>
                  <label
                    className="block text-[9px] tracking-[0.4em] uppercase text-muted mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell me about your project..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/8 px-4 py-3.5 text-sm text-white placeholder-white/15 focus:outline-none focus:border-gold/50 transition-colors duration-300 resize-none"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-gold hover:bg-[#b8995e] disabled:opacity-60 text-black text-xs tracking-[0.35em] uppercase font-semibold py-4 flex items-center justify-center gap-3 transition-all duration-300"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {status === "sending" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
