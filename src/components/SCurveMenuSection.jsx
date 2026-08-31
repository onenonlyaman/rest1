import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useMenu } from './MenuContext'
import { formatPrice } from '../lib/utils'
import { useCart } from './CartContext'
import DishPhoto, { PlateMark } from './DishPhoto'
import { SpiceMeter, VegMark } from './DishMeta'
import OrnateDivider from './OrnateDivider'
import { BRAND } from '../lib/constants'

const ease = [0.16, 1, 0.3, 1]

/*
 * The wave divides the section into a kara half and a coconut half. Its
 * horizontal travel is deliberately bounded to 46–54% of the viewport so it
 * stays inside the grid's centre gutter: text always lands on the ground it
 * was coloured for, at any width. An unbounded S looked better empty and
 * rendered ink-on-red once real copy sat under it.
 */
const WAVE = 'M50,0 C57,11 44,21 50,32 C56,43 43,54 50,65 C57,76 44,88 50,100 L100,100 L100,0 Z'

export default function SCurveMenuSection() {
  const { signatureItems } = useMenu()

  return (
    <section id="menu" className="relative overflow-hidden bg-kara" aria-labelledby="signatures-title">
      {/* Coconut half, desktop only; the stacked mobile layout stays all-kara */}
      <div className="absolute inset-0 hidden md:block" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={WAVE} fill="#FAF5ED" />
        </svg>
      </div>

      {/* European Hero Pattern texture overlay, subtle and luxurious */}
      <div
        className="pointer-events-none absolute inset-0 select-none bg-[url('/heropattern.svg')] bg-repeat opacity-[0.065] mix-blend-luminosity [background-size:320px_320px] md:[background-size:420px_420px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease }}
          className="mb-14 max-w-md sm:mb-20 md:max-w-[42%]"
        >
          <h2
            id="signatures-title"
            className="font-display text-4xl leading-[1.05] text-cream sm:text-5xl md:text-6xl"
          >
            {BRAND.signaturesTitle || 'Three reasons to visit'}
          </h2>
          <OrnateDivider className="my-3 text-ghee-light !justify-start" width={200} />
          <p className="mt-3 text-sm leading-relaxed text-cream-muted sm:text-base">
            {BRAND.signaturesSubtitle || 'A Nutella cheesecake that holds its shape, a cold brew that lingers, and a brownie tub built for one — these are what the regulars come back for.'}
          </p>
        </motion.div>

        {/* The centre column is empty on purpose: it is the gutter the wave
            travels through, and it keeps every text block on one ground. */}
        <ol className="grid list-none gap-y-14 md:grid-cols-[1fr_16%_1fr] md:gap-y-24">
          {signatureItems.map((item, idx) => (
            <DishRow key={item.id} item={item} index={idx} />
          ))}
        </ol>
      </div>
    </section>
  )
}

function DishRow({ item, index }) {
  const { addItem } = useCart()

  // Rows alternate across the wave. Odd rows land on the coconut half, where
  // the copy switches to ink from the `md` breakpoint up; below `md` the whole
  // section is kara, so everything stays cream.
  const onCream = index % 2 === 1

  const heading = onCream ? 'text-cream md:text-ink' : 'text-cream'
  const body = onCream ? 'text-cream-muted md:text-ink-muted' : 'text-cream-muted'
  const meta = onCream ? 'text-cream-soft md:text-ink-soft' : 'text-cream-soft'

  return (
    <motion.li
      initial={{ opacity: 0, x: onCream ? 28 : -28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease }}
      style={{ gridRow: index + 1 }}
      className={`flex items-start gap-5 sm:gap-7 ${
        onCream ? 'md:col-start-3 md:flex-row-reverse md:text-right' : 'md:col-start-1'
      }`}
    >
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full shadow-[0_20px_44px_-16px_rgba(31,26,23,0.55)] ring-1 ring-white/15 sm:h-36 sm:w-36 md:h-44 md:w-44 bg-sand">
        {item.image ? (
          <DishPhoto
            item={item}
            sizes="(min-width: 768px) 176px, 112px"
            className="h-full w-full object-cover"
          />
        ) : (
          <PlateMark item={item} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className={`font-display text-xl leading-tight sm:text-2xl ${heading}`}>
          {item.name}
        </h3>
        <p className={`mt-1 text-xs italic sm:text-sm ${meta}`} lang={BRAND.languageCode || 'kn'}>
          {item.subtitle}
        </p>
        <p className={`mt-3 text-sm leading-relaxed ${body}`}>{item.description}</p>
        <p className={`mt-2 text-xs ${meta}`}>{item.prep}</p>

        <div
          className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 ${
            onCream ? 'md:justify-end' : ''
          }`}
        >
          <span className="rounded-full bg-ghee px-3.5 py-1.5 text-sm font-bold text-kaapi">
            {formatPrice(item.price)}
          </span>
          <span className={`flex items-center gap-3 text-xs ${meta}`}>
            <VegMark />
            <SpiceMeter level={item.spiceLevel} />
          </span>
          <button
            onClick={() => addItem(item)}
            className={`flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors active:scale-95 ${
              onCream
                ? 'bg-cream text-kara hover:bg-cream-muted md:bg-kara md:text-cream md:hover:bg-kara-dark'
                : 'bg-cream text-kara hover:bg-cream-muted'
            }`}
          >
            <Plus size={15} aria-hidden="true" />
            Add
            <span className="sr-only">{item.name} to takeaway cart</span>
          </button>
        </div>
      </div>
    </motion.li>
  )
}
