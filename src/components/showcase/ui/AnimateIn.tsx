'use client'

/**
 * AnimateIn — Scroll-triggered fade + slide-up animation wrapper.
 *
 * Wraps any content and animates it in when it enters the viewport.
 * Uses framer-motion's useInView hook for reliable detection.
 *
 * Usage:
 *   <AnimateIn>
 *     <MyContent />
 *   </AnimateIn>
 *
 *   <AnimateIn delay={0.2} direction="left">
 *     <MyCard />
 *   </AnimateIn>
 */

import { useRef, ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'

interface AnimateInProps {
  children: ReactNode
  /** Delay in seconds before the animation starts */
  delay?: number
  /** Direction the element slides in from */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  /** Additional Tailwind classes for the wrapper */
  className?: string
  /** How much of the element must be visible before animating (0–1) */
  threshold?: number
}

export default function AnimateIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  threshold = 0.15,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null)
  // once: true means it only animates in once, not every time it scrolls in/out
  const isInView = useInView(ref, { once: true, amount: threshold })

  // Initial offset — keep these subtle (24px) so animations feel refined, not "template-y"
  const offsets = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { y: 0, x: 32 },
    right: { y: 0, x: -32 },
    none: { y: 0, x: 0 },
  }

  const { y, x } = offsets[direction]

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, x }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y, x }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
