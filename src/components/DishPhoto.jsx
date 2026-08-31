import { BRAND } from '../lib/constants'

/**
 * DishPhoto: one place that knows how a dish photograph is served.
 * WebP first, JPEG fallback, intrinsic dimensions so nothing shifts on load.
 *
 * Dishes we have no photograph of get a typeset plate instead of a stand-in
 * graphic, because an honest gap reads better than a fake photo.
 */
export default function DishPhoto({ item, className = '', priority = false, sizes }) {
  if (!item.image) return null

  const webp = item.image.replace(/\.jpe?g$/, '.webp')

  return (
    <picture>
      <source srcSet={webp} type="image/webp" sizes={sizes} />
      <img
        src={item.image}
        alt={`${item.name} as served at ${BRAND.name || 'The Bakerman Cafe'}`}
        width={900}
        height={900}
        sizes={sizes}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  )
}

/**
 * PlateMark: the fallback plate for a dish with no photograph. It sets the
 * dish's Kannada name in the display face on a warm ground, so the slot still
 * carries information rather than a placeholder shape.
 */
export function PlateMark({ item, className = '' }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-coconut-dark px-3 ${className}`}
    >
      <span
        className="font-display text-center text-sm leading-snug text-ink-soft sm:text-base"
        aria-hidden="true"
      >
        {item.subtitle}
      </span>
    </div>
  )
}
