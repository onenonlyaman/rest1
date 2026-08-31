import { Flame, Leaf } from 'lucide-react'
import { spiceLabel } from '../lib/utils'

/**
 * SpiceMeter: heat as three drawn flames, filled to the dish's level, with
 * the level named in text for screen readers. Replaces the chilli emoji, which
 * rendered differently on every platform and carried no label.
 *
 * Both marks inherit their colour from the surrounding text, so a row that
 * changes ground at a breakpoint only has to restate one colour class.
 */
export function SpiceMeter({ level, className = '' }) {
  if (level === 0) return null

  return (
    <span className={`inline-flex items-center gap-px align-middle ${className}`}>
      <span className="sr-only">{spiceLabel(level)}</span>
      {[1, 2, 3].map(step => (
        <Flame
          key={step}
          size={12}
          aria-hidden="true"
          className={step <= level ? 'fill-current' : 'opacity-35'}
        />
      ))}
    </span>
  )
}

/**
 * VegMark: the kitchen is fully vegetarian, so this is a standing fact about
 * the menu rather than a per-dish attribute. Drawn, not an emoji.
 */
export function VegMark({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 align-middle ${className}`}>
      <Leaf size={12} aria-hidden="true" />
      Pure veg
    </span>
  )
}
