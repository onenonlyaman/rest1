import { motion } from 'framer-motion'
import { ScrollText, MessageCircle, Star } from 'lucide-react'
import KolamWatermark from './KolamWatermark'
import DishPhoto, { PlateMark } from './DishPhoto'
import OrnateDivider from './OrnateDivider'
import { useLocation } from './LocationContext'
import { useMenu } from './MenuContext'
import { BRAND } from '../lib/constants'
import { buildQuickOrderWhatsAppUrl } from '../lib/utils'

const ease = [0.16, 1, 0.3, 1]

export default function HeroSection() {
  const { location } = useLocation()
  const { heroItems } = useMenu()

  return (
    <section
      id="top"
      className="relative bg-kara p-2 sm:p-3 md:p-4 overflow-hidden w-full max-w-full"
      aria-labelledby="hero-title"
    >
      {/* Outer frame subtle pattern */}
      <div
        className="pointer-events-none absolute inset-0 select-none bg-[url('/heropattern.svg')] bg-repeat opacity-[0.08] mix-blend-luminosity [background-size:280px_280px]"
        aria-hidden="true"
      />

      {/* Inner parchment canvas */}
      <div className="relative flex min-h-[calc(100svh-1rem)] flex-col items-center justify-center overflow-hidden rounded-xl bg-coconut pt-16 sm:min-h-[calc(100svh-1.5rem)] md:min-h-[calc(100svh-2rem)] md:rounded-2xl md:pt-24 w-full">
        {/* European Hero Pattern background texture */}
        <div
          className="pointer-events-none absolute inset-0 select-none bg-[url('/heropattern.svg')] bg-repeat opacity-[0.045] mix-blend-multiply [background-size:360px_360px] sm:[background-size:460px_460px] md:[background-size:560px_560px]"
          aria-hidden="true"
        />

        {/* The emblem, turning slowly behind everything else */}
        <KolamWatermark
          src="/heropattern-transparent.svg"
          opacity={0.09}
          duration={90}
          className="h-auto w-[320px] sm:w-[420px] md:w-[540px] lg:w-[640px]"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 py-[clamp(1.25rem,3vh,2.5rem)] text-center sm:px-8">
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="font-display text-[clamp(3.4rem,min(9vw,13vh),8rem)] leading-[0.92] tracking-tight text-ink"
          >
            {BRAND.name}<span className="text-kara">.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
            className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft sm:text-sm"
          >
            {BRAND.tagline}
          </motion.p>

          <OrnateDivider className="my-3 text-ghee" width={220} />

          {/* The three plates */}
          <motion.ul
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease }}
            className="mb-[clamp(1rem,3vh,2rem)] mt-[clamp(1rem,4vh,3rem)] flex list-none items-end justify-center gap-3 sm:gap-6 md:gap-9"
          >
            {heroItems.map((item, i) => {
              if (!item) return null
              const isCentre = i === 1
              return (
                <li
                  key={item.id}
                  className={`flex flex-col items-center gap-2.5 ${isCentre ? '-mt-6' : ''}`}
                >
                  <div
                    className={`overflow-hidden rounded-full bg-sand ${
                      isCentre
                        ? 'h-32 w-32 shadow-[0_18px_38px_-12px_rgba(31,26,23,0.35)] ring-2 ring-ghee/30 sm:h-44 sm:w-44 md:h-[min(14rem,25vh)] md:w-[min(14rem,25vh)]'
                        : 'h-24 w-24 shadow-[0_12px_26px_-10px_rgba(31,26,23,0.28)] ring-1 ring-ink/10 sm:h-32 sm:w-32 md:h-[min(10rem,18vh)] md:w-[min(10rem,18vh)]'
                    }`}
                  >
                    {item.image ? (
                      <DishPhoto
                        item={item}
                        priority
                        sizes="(min-width: 768px) 224px, 128px"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PlateMark item={item} />
                    )}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs text-center max-w-[110px] sm:max-w-[140px] truncate ${
                      isCentre ? 'font-semibold text-ink' : 'font-medium text-ink-soft'
                    }`}
                  >
                    {item.name}
                  </span>
                </li>
              )
            })}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease }}
            className="mb-[clamp(1rem,3vh,2rem)] max-w-lg"
          >
            <p className="font-display text-xl italic leading-snug text-ink sm:text-2xl md:text-3xl">
              {BRAND.heroQuote || 'Butter on the tawa before the batter.'}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted sm:text-sm">
              {BRAND.heroStory || 'Pure white butter on sizzling cast iron. The authentic soul of Davangere, made fresh every morning.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#menu"
              className="flex min-h-11 items-center gap-2 rounded-full bg-kaapi px-6 py-3 text-sm font-semibold text-cream shadow-md transition-all duration-200 hover:bg-kaapi/88 hover:shadow-lg active:scale-[0.97]"
            >
              <ScrollText size={16} aria-hidden="true" />
              See the menu
            </a>
            <a
              href={buildQuickOrderWhatsAppUrl(location)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-whatsapp-dark hover:shadow-lg active:scale-[0.97]"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Order on WhatsApp
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5, ease }}
            className="mt-[clamp(1rem,3vh,2rem)] flex items-center gap-1.5 text-xs text-ink-soft"
          >
            <Star size={13} className="fill-ghee text-ghee" aria-hidden="true" />
            <span>
              {BRAND.rating} out of 5 from {BRAND.reviewCount} Google reviews
            </span>
          </motion.p>
        </div>
      </div>
    </section>
  )
}
