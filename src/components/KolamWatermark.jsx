import { motion, useReducedMotion } from 'framer-motion'

/**
 * KolamWatermark: the heropattern emblem turning slowly behind a section.
 *
 * Fully contained in an overflow-hidden wrapper with separated
 * centering and rotation transforms to prevent horizontal viewport
 * overflow or layout stretching on all devices.
 */
export default function KolamWatermark({
  src = '/heropattern-transparent.svg',
  className = '',
  opacity = 0.08,
  duration = 90,
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <motion.img
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className={`select-none max-w-none origin-center ${className}`}
          style={{ opacity, willChange: reduceMotion ? 'auto' : 'transform' }}
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}
