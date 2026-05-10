'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// Deterministic pseudo-random — avoids SSR/client hydration mismatch
const det = (i: number) => ((i * 2654435761) % 2 ** 32) / 2 ** 32

export function FloatingPaths({ position }: { position: number }) {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // 20 paths (down from 36) for better performance
  const paths = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 9 * position} -${189 + i * 10}C-${
      380 - i * 9 * position
    } -${189 + i * 10} -${312 - i * 9 * position} ${216 - i * 8} ${
      152 - i * 9 * position
    } ${343 - i * 3}C${616 - i * 9 * position} ${470 - i * 8} ${
      684 - i * 9 * position
    } ${875 - i * 8} ${684 - i * 9 * position} ${875 - i * 8}`,
    width: 0.5 + i * 0.05,
    duration: 20 + det(i) * 10,
    opacity: 0.08 + i * 0.045,
  }))

  const idleState  = { pathLength: 0.3, opacity: 0.6 }
  const liveState  = { pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        style={{ pointerEvents: 'none' }}
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={path.opacity}
            initial={idleState}
            animate={paused ? idleState : liveState}
            transition={{
              duration: path.duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export function BackgroundPaths({ title = 'Background Paths' }: { title?: string }) {
  const words = title.split(' ')
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-6 tracking-tighter">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split('').map((letter, letterIndex) => (
                  <motion.span
                    key={letterIndex}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: 'spring',
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700/80 dark:from-white dark:to-white/80"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
        </motion.div>
      </div>
    </div>
  )
}
