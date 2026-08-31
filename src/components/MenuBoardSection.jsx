import { motion } from 'framer-motion'
import { Plus, ShoppingBag } from 'lucide-react'
import { useMenu } from './MenuContext'
import { formatPrice } from '../lib/utils'
import { useCart } from './CartContext'
import { SpiceMeter, VegMark } from './DishMeta'
import OrnateDivider from './OrnateDivider'
import { BRAND } from '../lib/constants'

const ease = [0.16, 1, 0.3, 1]

export default function MenuBoardSection() {
  const { setCartOpen, itemCount } = useCart()
  const { items: menuItems, courses } = useMenu()

  return (
    <section id="craft" className="relative overflow-hidden bg-temple" aria-labelledby="menu-title">
      {/* European Pattern repeating wallpaper on temple canvas */}
      <div
        className="pointer-events-none absolute inset-0 select-none bg-[url('/pattern.svg')] bg-repeat opacity-[0.065] mix-blend-luminosity [background-size:360px_240px] sm:[background-size:480px_320px] md:[background-size:600px_400px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease }}
          className="mb-14 text-center sm:mb-20"
        >
          <h2
            id="menu-title"
            className="font-display text-4xl leading-tight text-cream sm:text-5xl"
          >
            {BRAND.menuBoardTitle || 'The board'}
          </h2>
          <OrnateDivider className="my-3 text-ghee-light" width={220} />
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream-muted sm:text-base">
            {BRAND.menuBoardSubtitle || 'Everything we make, in the order it comes off the line. Tap add to build a takeaway order, which goes out as a WhatsApp message you send yourself.'}
          </p>
        </motion.div>

        <div className="space-y-12 sm:space-y-14">
          {courses.map(course => {
            const courseItems = menuItems.filter(i => i.category === course.key && i.isAvailable !== false)
            if (!courseItems.length) return null
            return <Course key={course.key} course={course} items={courseItems} />
          })}
        </div>

        <p className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-cream/15 pt-6 text-xs text-cream-soft">
          <VegMark />
          <span>{BRAND.taxNote || 'Prices in rupees, taxes included'}</span>
          <span>{BRAND.packagingNote || 'Takeaway packed to stay crisp'}</span>
        </p>

        {itemCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="sticky bottom-20 z-30 mt-10 md:bottom-6"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="mx-auto flex min-h-12 items-center gap-3 rounded-full bg-ghee px-6 py-3.5 text-kaapi shadow-[0_16px_36px_-12px_rgba(0,0,0,0.6)] transition-all hover:bg-ghee-light active:scale-[0.97]"
            >
              <ShoppingBag size={18} aria-hidden="true" />
              <span className="text-sm font-bold">
                Review order · {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

function Course({ course, items }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease }}
      aria-labelledby={`course-${course.key}`}
    >
      <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-cream/20 pb-2">
        <h3
          id={`course-${course.key}`}
          className="font-display text-2xl text-ghee-light sm:text-3xl"
        >
          {course.title}
        </h3>
        <p className="hidden text-right text-xs text-cream-soft sm:block">{course.note}</p>
      </div>
      <ul className="list-none">
        {items.map(item => (
          <MenuRow key={item.id} item={item} />
        ))}
      </ul>
    </motion.section>
  )
}

function MenuRow({ item }) {
  const { addItem } = useCart()

  return (
    <li className="flex items-start gap-4 border-b border-cream/10 py-4 last:border-0 sm:gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h4 className="font-display text-lg leading-tight text-cream sm:text-xl">
            {item.name}
          </h4>
          <span className="text-xs italic text-cream-soft" lang={BRAND.languageCode || 'kn'}>
            {item.subtitle}
          </span>
          <SpiceMeter level={item.spiceLevel} />
        </div>
        <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-cream-muted">
          {item.description}
        </p>
        {item.prep && (
          <p className="mt-1.5 text-xs tracking-wide text-cream-soft">{item.prep}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="font-display text-lg text-ghee-light tabular-nums sm:text-xl">
          {formatPrice(item.price)}
        </span>
        <button
          onClick={() => addItem(item)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:border-ghee hover:bg-ghee hover:text-kaapi active:scale-90"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="sr-only">Add {item.name} to takeaway cart</span>
        </button>
      </div>
    </li>
  )
}
