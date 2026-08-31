import { Phone, MapPin, ScrollText, MessageCircle } from 'lucide-react'
import { BRAND } from '../lib/constants'
import { buildQuickOrderWhatsAppUrl } from '../lib/utils'
import { useLocation } from './LocationContext'

export default function MobileBottomBar() {
  const { location } = useLocation()

  const actions = [
    { icon: Phone, label: 'Call', href: `tel:${BRAND.phoneClean}` },
    { icon: MapPin, label: 'Directions', href: BRAND.mapsLink, external: true },
    { icon: ScrollText, label: 'Menu', href: '#craft' },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      href: buildQuickOrderWhatsAppUrl(location),
      external: true,
    },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/12 bg-coconut/97 pb-safe backdrop-blur-md md:hidden"
      aria-label="Quick actions"
    >
      <ul className="flex list-none items-stretch justify-around">
        {actions.map(action => (
          <li key={action.label} className="flex-1">
            <a
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 transition-transform active:scale-90"
            >
              <action.icon size={19} className="text-kara" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-ink">{action.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
