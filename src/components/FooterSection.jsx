import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Navigation, Instagram } from 'lucide-react'
import KolamWatermark from './KolamWatermark'
import OrnateDivider from './OrnateDivider'
import { BRAND, HOURS } from '../lib/constants'
import { getOpenStatus } from '../lib/utils'

const ease = [0.16, 1, 0.3, 1]

export default function FooterSection() {
  const status = getOpenStatus()
  const shifts = HOURS.shifts || [
    { name: 'Morning batch', time: '8:00 AM – 3:00 PM', dot: 'bg-open-dot' },
    { name: 'Evening batch', time: '6:00 PM – 10:00 PM', dot: 'bg-ghee' },
  ]
  const addressLines = BRAND.addressLines || [
    'Shop 1, Pandit Park-2',
    'Near Cycle Circle, Parijat Nagar',
    'Nashik, Maharashtra 422005',
  ]

  return (
    <footer
      id="footer"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-kaapi"
      aria-labelledby="visit-title"
    >
      {/*
        * The bar watches this line, not the footer itself. The footer is a
        * full viewport tall and is the last thing on the page, so once it
        * enters the observer's root it never leaves again and the callback
        * fires exactly once. A zero-height marker on its top edge crosses the
        * root boundary in both directions, so scrolling back down re-fires it.
        */}
      <div
        id="footer-top"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
      />

      {/* European Pattern texture overlay in footer */}
      <div
        className="pointer-events-none absolute inset-0 select-none bg-[url('/pattern.svg')] bg-repeat opacity-[0.055] mix-blend-luminosity [background-size:360px_240px] md:[background-size:480px_320px]"
        aria-hidden="true"
      />

      {/* Fine-line frame */}
      <div
        className="pointer-events-none absolute inset-3 rounded-lg border border-cream/12 sm:inset-4 md:inset-6"
        aria-hidden="true"
      />

      {/* European Baroque corner filigrees */}
      {[
        { pos: 'left-3 top-3 sm:left-4 sm:top-4 md:left-6 md:top-6', rotate: '' },
        { pos: 'right-3 top-3 sm:right-4 sm:top-4 md:right-6 md:top-6', rotate: 'scale-x-[-1]' },
        { pos: 'bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6', rotate: 'scale-[-1]' },
        { pos: 'bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6', rotate: 'scale-y-[-1]' },
      ].map(({ pos, rotate }, idx) => (
        <div
          key={idx}
          className={`pointer-events-none absolute ${pos} h-12 w-12 opacity-35 sm:h-16 sm:w-16 md:h-20 md:w-20 ${rotate}`}
          aria-hidden="true"
        >
          <img
            src="/patterns/european-corner.svg"
            alt=""
            width={200}
            height={200}
            loading="lazy"
            decoding="async"
            className="h-full w-full text-cream filter invert brightness-200"
          />
        </div>
      ))}

      <KolamWatermark
        src="/heropattern-transparent.svg"
        opacity={0.07}
        duration={120}
        className="h-auto w-[360px] sm:w-[460px] md:w-[560px] lg:w-[640px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20 pt-12 sm:px-8 sm:py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease }}
          className="mb-6 text-center sm:mb-14"
        >
          <h2 id="visit-title" className="font-display text-4xl leading-tight text-cream sm:text-5xl">
            {BRAND.visitTitle || 'Come by the circle'}
          </h2>
          <OrnateDivider className="my-3 text-ghee-light" width={220} />
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-cream-muted sm:text-base">
            {BRAND.visitDescription || 'A small, food-first kitchen with a fast takeaway counter. The morning rush runs 8:30 to 10:30, so order ahead on WhatsApp and skip it.'}
          </p>
        </motion.div>

        <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:mb-14 sm:gap-8 lg:grid-cols-3 lg:gap-10">
          {/* Location */}
          <div className="text-left">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cream">
              <MapPin size={16} className="text-ghee" aria-hidden="true" />
              Where
            </h3>
            <address className="text-sm not-italic leading-relaxed text-cream-muted">
              {addressLines.map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </address>
            <a
              href={BRAND.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-cream/12 px-4 text-xs font-semibold text-cream transition-colors hover:bg-cream/20"
            >
              <Navigation size={13} aria-hidden="true" />
              Open in Maps
            </a>
          </div>

          {/* Hours */}
          <div className="text-left">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cream">
              <Clock size={16} className="text-ghee" aria-hidden="true" />
              When
            </h3>
            <ul className="list-none space-y-2.5">
              {shifts.map(shift => (
                <li key={shift.name} className="flex items-start gap-2">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${shift.dot}`} aria-hidden="true" />
                  <span className="text-left">
                    <span className="block text-sm font-medium text-cream">{shift.name}</span>
                    <span className="block text-xs text-cream-muted">{shift.time}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-semibold text-ghee-light">
              {HOURS.holidayLabel || 'Closed all day Tuesday'}
            </p>
            <p className="mt-1 text-xs text-cream-muted">Right now: {status.label}</p>
          </div>

          {/* Contact */}
          <div className="col-span-2 text-center sm:text-left lg:col-span-1">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cream">
              <Phone size={16} className="text-ghee" aria-hidden="true" />
              Reach us
            </h3>
            <a
              href={`tel:${BRAND.phoneClean}`}
              className="inline-flex min-h-11 items-center font-display text-xl text-cream transition-colors hover:text-ghee-light sm:text-2xl"
            >
              {BRAND.phone}
            </a>
            <p className="mt-2 text-sm leading-relaxed text-cream-muted">
              {BRAND.cateringNote || 'Same number on WhatsApp. Bulk breakfast boxes for poojas, offices and celebrations, called in a day ahead.'}
            </p>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-cream-muted transition-colors hover:text-cream"
            >
              <Instagram size={14} aria-hidden="true" />
              {BRAND.instagramHandle || '@brandinstagram'}
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-cream/15 pt-6 sm:flex-row">
          <p className="text-xs text-cream-soft">
            © {new Date().getFullYear()} {BRAND.name}, {BRAND.city || 'Nashik'}
          </p>
          <p className="hidden text-xs text-cream-soft sm:block">
            {BRAND.rating} out of 5 · {BRAND.reviewCount} Google reviews
          </p>
        </div>
      </div>

    </footer>
  )
}
