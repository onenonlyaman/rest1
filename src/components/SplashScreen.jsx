import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import KolamSVG from './KolamSVG'
import { BRAND } from '../lib/constants'

const ease = [0.16, 1, 0.3, 1]

// Logo settles by 1.0s, the wordmark finishes emerging by ~1.5s, then a short
// hold before the curtain lifts.
const HOLD_MS = 2200

/**
 * SplashScreen: the kolam draws itself into place, then the wordmark slides out
 * from behind it to form the lockup, and the whole plate lifts away.
 *
 * The overlay is decorative: the real heading sits in the page underneath, so
 * this is hidden from assistive tech rather than announced. Any key or pointer
 * dismisses it early, and it is skipped outright when motion is reduced.
 */
export default function SplashScreen() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (reduceMotion) {
      setVisible(false)
      return
    }
    const id = setTimeout(() => setVisible(false), HOLD_MS)
    return () => clearTimeout(id)
  }, [reduceMotion])

  // Hold the page still underneath, and let anyone skip straight past.
  useEffect(() => {
    if (!visible) return

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const skip = () => setVisible(false)
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)

    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.65, ease }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-kara"
        >
          {/* The lockup is centred as a unit, so the mark drifts left as the
              name takes up its share of the width. */}
          <div className="flex items-center px-6">
            <motion.div
              initial={{ rotate: -160, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 1.05, ease }}
              className="shrink-0"
            >
              <KolamSVG
                className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28"
                color="#FAF5ED"
                strokeWidth={4}
              />
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              transition={{ duration: 0.75, ease, delay: 0.7 }}
              className="overflow-hidden"
            >
              <motion.span
                initial={{ opacity: 0, x: -32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.75, ease, delay: 0.74 }}
                className="block whitespace-nowrap pl-4 font-display text-4xl text-cream sm:pl-5 sm:text-5xl md:text-6xl"
              >
                {BRAND.name}
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
