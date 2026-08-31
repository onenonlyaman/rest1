import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Menu, X, Phone, Navigation, MessageCircle } from 'lucide-react'
import { getOpenStatus, buildQuickOrderWhatsAppUrl } from '../lib/utils'
import { useCart } from './CartContext'
import { useLocation } from './LocationContext'
import { BRAND } from '../lib/constants'
import KolamSVG from './KolamSVG'

const NAV_LINKS = [
  { label: 'Signatures', href: '#menu' },
  { label: 'Full menu', href: '#craft' },
  { label: 'Visit', href: '#footer' },
]

const STATUS_DOT = {
  green: 'bg-open-dot',
  yellow: 'bg-break',
  red: 'bg-shut',
}

const STATUS_TEXT = {
  green: 'text-open',
  yellow: 'text-break',
  red: 'text-shut',
}

// Roughly the bar's own height. Once the footer's top edge crosses this, the
// footer frame and its corner motifs would sit under the header, so it leaves.
const BAR_HEIGHT = 104

const ease = [0.16, 1, 0.3, 1]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [status, setStatus] = useState(getOpenStatus)
  const { itemCount, setCartOpen } = useCart()
  const { location } = useLocation()
  const overlayRef = useRef(null)

  /*
   * Both states come from one rAF-throttled read.
   *
   * An IntersectionObserver on the footer could not do this job: the footer is
   * a full viewport tall and is the last thing on the page, so once it enters
   * the observer's root it never leaves, the callback fires exactly once, and
   * scrolling back down to it never re-fired. Measuring the marker on its top
   * edge is symmetric by construction, and correct on resize and on restored
   * scroll positions too.
   */
  useEffect(() => {
    const marker = document.getElementById('footer-top')

    const measure = () => {
      setScrolled(window.scrollY > 50)
      const markerTop = marker?.getBoundingClientRect().top
      setHidden(markerTop !== undefined && markerTop <= BAR_HEIGHT)
    }

    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure, { passive: true })
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Keep the open/closed pill honest without a reload.
  useEffect(() => {
    const id = setInterval(() => setStatus(getOpenStatus()), 60_000)
    return () => clearInterval(id)
  }, [])

  // A menu left open while the bar slides away would strand its links.
  useEffect(() => {
    if (hidden) setMobileOpen(false)
  }, [hidden])

  // Full-screen menu: lock the page, close on Escape, move focus into it.
  useEffect(() => {
    if (!mobileOpen) return

    const opener = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    overlayRef.current?.querySelector('a, button')?.focus()

    const onKeyDown = event => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      opener?.focus?.()
    }
  }, [mobileOpen])

  return (
    <>
      <header
        inert={hidden || undefined}
        className={`fixed inset-x-0 top-0 z-50 transition-[translate,opacity,padding,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          hidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        } ${
          scrolled
            ? 'bg-coconut/92 pt-0 shadow-sm backdrop-blur-md'
            : 'bg-transparent pt-3 sm:pt-5 md:pt-8'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 md:h-18">
            {/* Brand mark: the shop's own kolam, at full strength */}
            <a
              href="#top"
              className="flex min-h-11 shrink-0 items-center gap-2.5"
              aria-label={`${BRAND.name}, back to top`}
            >
              <KolamSVG className="h-8 w-8 shrink-0 md:h-9 md:w-9" color="#6B3A2A" strokeWidth={5} />
              <span className="font-display text-lg leading-none text-ink md:text-xl">
                {BRAND.name}
              </span>
            </a>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-7 md:flex" aria-label="Sections">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-ink-muted transition-colors duration-200 hover:text-kara"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-3">
              {/* Live open/closed status */}
              <p className="hidden items-center gap-2 sm:flex">
                <span
                  className={`h-2 w-2 rounded-full ${STATUS_DOT[status.color]} ${
                    status.status === 'open' ? 'motion-safe:animate-pulse' : ''
                  }`}
                  aria-hidden="true"
                />
                <span className={`text-xs font-semibold tracking-wide ${STATUS_TEXT[status.color]}`}>
                  {status.label}
                </span>
              </p>

              <button
                onClick={() => setCartOpen(true)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-ink/5"
                aria-label={
                  itemCount > 0
                    ? `Open takeaway cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
                    : 'Open takeaway cart'
                }
              >
                <ShoppingBag size={20} className="text-ink" aria-hidden="true" />
                {itemCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-kara px-1 text-[10px] font-bold text-cream">
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(true)}
                className="flex h-11 w-11 items-center justify-center md:hidden"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                aria-label="Open menu"
              >
                <Menu size={24} className="text-ink" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen menu for mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="fixed inset-0 z-[60] flex flex-col bg-coconut md:hidden overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden select-none bg-[url('/heropattern.svg')] bg-repeat opacity-[0.04] mix-blend-multiply [background-size:320px_320px]" aria-hidden="true">
              <img
                src="/kolam-kara.svg"
                alt=""
                aria-hidden="true"
                width={630}
                height={650}
                className="absolute left-1/2 top-1/2 h-auto w-[320px] sm:w-[420px] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.05]"
              />
            </div>

            <div className="relative z-10 flex h-16 shrink-0 items-center justify-between px-4">
              <span className="flex items-center gap-2.5">
                <KolamSVG className="h-8 w-8" color="#6B3A2A" strokeWidth={5} />
                <span className="font-display text-lg leading-none text-ink">{BRAND.name}</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="-mr-2 flex h-11 w-11 items-center justify-center"
                aria-label="Close menu"
              >
                <X size={24} className="text-ink" aria-hidden="true" />
              </button>
            </div>

            <nav
              className="relative z-10 flex flex-1 flex-col justify-center px-8"
              aria-label="Sections"
            >
              <ul className="list-none">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + i * 0.06, duration: 0.4, ease }}
                    className="border-b border-ink/10 last:border-0"
                  >
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-4 font-display text-3xl text-ink transition-colors hover:text-kara"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="relative z-10 shrink-0 px-8 pb-10 pt-4">
              <p className="mb-4 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${STATUS_DOT[status.color]}`}
                  aria-hidden="true"
                />
                <span className={`text-sm font-semibold ${STATUS_TEXT[status.color]}`}>
                  {status.label}
                </span>
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`tel:${BRAND.phoneClean}`}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-kaapi px-4 text-sm font-semibold text-cream"
                >
                  <Phone size={15} aria-hidden="true" />
                  Call
                </a>
                <a
                  href={BRAND.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-ink/20 px-4 text-sm font-semibold text-ink"
                >
                  <Navigation size={15} aria-hidden="true" />
                  Directions
                </a>
                <a
                  href={buildQuickOrderWhatsAppUrl(location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-4 text-sm font-semibold text-white"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  Order on WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
