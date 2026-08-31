/**
 * LogoBrandSVG: The Bakerman Cafe emblem rendered from heropattern.svg
 */
export default function KolamSVG({
  className = '',
  opacity = 1,
  title,
}) {
  return (
    <img
      src="/heropattern-transparent.svg"
      alt={title || ''}
      aria-hidden={title ? undefined : true}
      className={`object-contain select-none ${className}`}
      style={{ opacity }}
      loading="eager"
      decoding="async"
    />
  )
}
