import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, MessageCircle, MapPin, RefreshCw, User, Phone } from 'lucide-react'
import { useCart } from './CartContext'
import { useLocation } from './LocationContext'
import { formatPrice, buildWhatsAppUrl } from '../lib/utils'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function CartDrawer() {
  const { items, isOpen, setCartOpen, total, itemCount, addItem, removeItem, clearCart } =
    useCart()
  const { location, status: locationStatus, requestLocation, hasLocation } = useLocation()
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [customerName, setCustomerName] = useState(() => {
    if (typeof window === 'undefined') return 'Aman Mahadeo Bele'
    return localStorage.getItem('benne-saaram.customer.name') || 'Aman Mahadeo Bele'
  })
  const [customerPhone, setCustomerPhone] = useState(() => {
    if (typeof window === 'undefined') return '9767453980'
    return localStorage.getItem('benne-saaram.customer.phone') || '9767453980'
  })

  const handleNameChange = (e) => {
    const val = e.target.value
    setCustomerName(val)
    try { localStorage.setItem('benne-saaram.customer.name', val) } catch {}
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value
    setCustomerPhone(val)
    try { localStorage.setItem('benne-saaram.customer.phone', val) } catch {}
  }

  const handleProceedToWhatsApp = (e) => {
    e?.preventDefault?.()
    const name = customerName.trim() || 'Aman Mahadeo Bele'
    const phone = customerPhone.trim() || '9767453980'
    try {
      localStorage.setItem('benne-saaram.customer.name', name)
      localStorage.setItem('benne-saaram.customer.phone', phone)
    } catch {}

    const url = buildWhatsAppUrl(items, location, { name, phone })
    window.open(url, '_blank', 'noopener,noreferrer')
    setShowDetailsModal(false)
  }

  const panelRef = useRef(null)
  const restoreFocusRef = useRef(null)

  // Escape closes, Tab stays inside the panel, the page behind stops scrolling,
  // and focus returns to whatever opened the drawer.
  useEffect(() => {
    if (!isOpen) return

    restoreFocusRef.current = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    panel?.querySelector(FOCUSABLE)?.focus()

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setCartOpen(false)
        return
      }
      if (event.key !== 'Tab' || !panel) return

      const nodes = [...panel.querySelectorAll(FOCUSABLE)].filter(
        node => node.offsetParent !== null
      )
      if (!nodes.length) return

      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      restoreFocusRef.current?.focus?.()
    }
  }, [isOpen, setCartOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-kaapi/50 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-coconut shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink/12 px-5 py-4">
              <div>
                <h2 id="cart-title" className="font-display text-xl text-ink">
                  Takeaway order
                </h2>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                  <span>{itemCount} {itemCount === 1 ? 'item' : 'items'} ·</span>
                  <MapPin
                    size={17}
                    className={`shrink-0 ${hasLocation ? 'text-kara' : 'text-ink-muted'}`}
                    aria-hidden="true"
                  />
                  {hasLocation ? (
                    <span className="font-semibold text-kara">
                      {location.sevenCharCode || location.shortCode}
                    </span>
                  ) : (
                    'pickup at Cycle Circle'
                  )}
                </p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-ink/5"
                aria-label="Close takeaway order"
              >
                <X size={20} className="text-ink" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-display text-xl text-ink">Nothing added yet</p>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
                    Pick dishes from the board and they will collect here, ready to send
                    to the kitchen on WhatsApp.
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-5 flex min-h-11 items-center rounded-full bg-kara px-5 text-sm font-semibold text-cream transition-colors hover:bg-kara-dark"
                  >
                    Browse the menu
                  </button>
                </div>
              ) : (
                <ul className="list-none space-y-3">
                  {items.map(item => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl bg-sand p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-ink">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {formatPrice(item.price)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-coconut transition-colors hover:bg-kara/8 active:scale-90"
                          aria-label={
                            item.quantity === 1
                              ? `Remove ${item.name}`
                              : `One fewer ${item.name}`
                          }
                        >
                          <Minus size={13} className="text-ink" aria-hidden="true" />
                        </button>
                        <span
                          className="w-7 text-center text-sm font-bold tabular-nums text-ink"
                          aria-label={`Quantity ${item.quantity}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addItem(item)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-coconut transition-colors hover:bg-malli/8 active:scale-90"
                          aria-label={`One more ${item.name}`}
                        >
                          <Plus size={13} className="text-ink" aria-hidden="true" />
                        </button>
                      </div>

                      <span className="w-16 shrink-0 text-right text-sm font-bold tabular-nums text-ink">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="mt-4 flex min-h-11 items-center gap-1.5 text-xs font-semibold text-kara transition-colors hover:text-kara-dark"
                >
                  <Trash2 size={13} aria-hidden="true" />
                  Empty the order
                </button>
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t border-ink/12 px-5 py-4 pb-safe">
                {/* Location indicator & selector */}
                <div className="rounded-xl border border-ink/10 bg-sand/80 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <MapPin
                        size={17}
                        className={`mt-0.5 shrink-0 ${hasLocation ? 'text-kara' : 'text-ink-muted'}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink">
                          {hasLocation ? 'Sending with your location' : 'Pickup Location'}
                        </p>
                        {hasLocation ? (
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                            <span>Google Tag:</span>
                            <span className="rounded bg-coconut px-1.5 py-0.5 font-mono text-[11px] font-bold text-ink shadow-xs">
                              {location.sevenCharCode || location.shortCode}
                            </span>
                            {location.accuracy && (
                              <span className="text-[10px] text-ink-muted">
                                (±{Math.round(location.accuracy)}m)
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {locationStatus === 'requesting'
                              ? 'Requesting GPS location...'
                              : 'Default: Near Cycle Circle, Nashik'}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => requestLocation({ enableHighAccuracy: true })}
                      disabled={locationStatus === 'requesting'}
                      className="flex shrink-0 items-center gap-1 rounded-full border border-ink/15 bg-coconut px-2.5 py-1 text-[11px] font-semibold text-ink shadow-xs transition-all hover:bg-sand active:scale-95 disabled:opacity-50"
                      title={hasLocation ? 'Update GPS coordinates' : 'Enable GPS location'}
                    >
                      <RefreshCw
                        size={11}
                        className={locationStatus === 'requesting' ? 'animate-spin' : ''}
                        aria-hidden="true"
                      />
                      <span>{hasLocation ? 'Update' : 'Use GPS'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-muted">Total</span>
                  <span className="font-display text-2xl tabular-nums text-ink">
                    {formatPrice(total)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetailsModal(true)}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-6 text-sm font-semibold text-white shadow-lg shadow-whatsapp/25 transition-colors hover:bg-whatsapp-dark active:scale-[0.97]"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  Send order on WhatsApp
                </button>

                <p className="text-center text-xs text-ink-muted">
                  Opens whatsapp with your order summary.
                </p>
              </div>
            )}
          </motion.div>

          {/* Name & Phone Number Popup Modal */}
          <AnimatePresence>
            {showDetailsModal && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-kaapi/60 backdrop-blur-xs"
                  onClick={() => setShowDetailsModal(false)}
                  aria-hidden="true"
                />

                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="details-modal-title"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className="relative z-[71] w-full max-w-sm rounded-2xl border border-ink/10 bg-coconut p-5 shadow-2xl"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-3 border-b border-ink/10 pb-3">
                    <div>
                      <h3 id="details-modal-title" className="font-display text-lg text-ink">
                        Order Details
                      </h3>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Enter your name and number for dispatch.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDetailsModal(false)}
                      className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
                      aria-label="Close details popup"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>

                  <form onSubmit={handleProceedToWhatsApp} className="mt-4 space-y-3.5">
                    <div>
                      <label htmlFor="modal-name" className="block text-xs font-semibold text-ink">
                        Name
                      </label>
                      <div className="relative mt-1">
                        <User
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                          aria-hidden="true"
                        />
                        <input
                          id="modal-name"
                          type="text"
                          required
                          autoFocus
                          value={customerName}
                          onChange={handleNameChange}
                          placeholder="Aman Mahadeo Bele"
                          className="w-full rounded-xl border border-ink/15 bg-sand/50 py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted/50 focus:border-kara focus:bg-coconut focus:outline-none focus:ring-1 focus:ring-kara"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="modal-phone" className="block text-xs font-semibold text-ink">
                        Contact Number
                      </label>
                      <div className="relative mt-1">
                        <Phone
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                          aria-hidden="true"
                        />
                        <input
                          id="modal-phone"
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={handlePhoneChange}
                          placeholder="9767453980"
                          className="w-full rounded-xl border border-ink/15 bg-sand/50 py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted/50 focus:border-kara focus:bg-coconut focus:outline-none focus:ring-1 focus:ring-kara"
                        />
                      </div>
                    </div>

                    {/* Summary box */}
                    <div className="space-y-1 rounded-xl border border-ink/8 bg-sand/70 p-2.5 text-xs text-ink-muted">
                      <div className="flex justify-between font-semibold text-ink">
                        <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin size={12} className="shrink-0 text-kara" aria-hidden="true" />
                        <span className="truncate">
                          {hasLocation
                            ? `Location: ${location.sevenCharCode || location.shortCode}`
                            : 'Pickup: Near Cycle Circle, Nashik'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="submit"
                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-semibold text-white shadow-md shadow-whatsapp/25 transition-all hover:bg-whatsapp-dark active:scale-[0.97]"
                      >
                        <MessageCircle size={17} aria-hidden="true" />
                        Proceed to WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDetailsModal(false)}
                        className="w-full py-1 text-center text-xs font-semibold text-ink-muted transition-colors hover:text-ink"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
