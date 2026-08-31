import { HOURS, BRAND } from './constants.js'

/**
 * Helper to format minutes from midnight into 12-hour AM/PM string
 */
function formatTimeMin(min) {
  const hours = Math.floor(min / 60)
  const mins = min % 60
  const period = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  return mins === 0 ? `${h12}:00 ${period}` : `${h12}:${mins.toString().padStart(2, '0')} ${period}`
}

/**
 * Returns real-time open/closed status based on timezone.
 * Accounts for morning shift, afternoon break, evening shift, and weekly holiday.
 */
export function getOpenStatus() {
  const now = new Date()
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const day = ist.getDay()
  const timeMin = ist.getHours() * 60 + ist.getMinutes()

  if (HOURS.holidayDay !== null && day === HOURS.holidayDay) {
    const dayLabel = HOURS.holidayName ? ` (${HOURS.holidayName})` : ''
    return { status: 'holiday', label: `Closed Today${dayLabel}`, color: 'red' }
  }

  if (HOURS.morning && timeMin >= HOURS.morning.openMin && timeMin < HOURS.morning.closeMin) {
    const shiftLabel = HOURS.morning.label || 'Morning Batch'
    return { status: 'open', label: `Open Now · ${shiftLabel}`, color: 'green' }
  }

  if (HOURS.evening && HOURS.morning && timeMin >= HOURS.morning.closeMin && timeMin < HOURS.evening.openMin) {
    return { status: 'break', label: `Reopens at ${formatTimeMin(HOURS.evening.openMin)}`, color: 'yellow' }
  }

  if (HOURS.evening && timeMin >= HOURS.evening.openMin && timeMin < HOURS.evening.closeMin) {
    const shiftLabel = HOURS.evening.label || 'Evening Batch'
    return { status: 'open', label: `Open Now · ${shiftLabel}`, color: 'green' }
  }

  const opensAt = HOURS.morning ? formatTimeMin(HOURS.morning.openMin) : '8:00 AM'
  return { status: 'closed', label: `Opens at ${opensAt}`, color: 'red' }
}

/**
 * Generates a WhatsApp wa.me URL with the requested order details format.
 */
export function buildWhatsAppUrl(items, location = null, customer = null) {
  if (!items.length) return BRAND.whatsappBase

  const brandTitle = BRAND.name || 'Benne Saaram'
  const lines = [
    `*${brandTitle} - Order Details*`,
    '',
    'Order Items:',
  ]

  items.forEach(item => {
    lines.push(`* _${item.name}_ - ${item.quantity}`)
  })

  lines.push('')

  const name = customer?.name?.trim() || 'Aman Mahadeo Bele'
  const phone = customer?.phone?.trim() || '9767453980'

  lines.push(`*Name* : ${name}`)
  lines.push(`*Contact Number* : ${phone}`)
  lines.push('')

  if (location && (location.sevenCharCode || location.shortCode || location.fullCode)) {
    const locTag = location.sevenCharCode || location.shortCode || location.fullCode
    const mapLink = location.mapsUrl || `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    lines.push(`*Location* : *${locTag}* and ${mapLink}`)
  } else {
    lines.push(`*Location* : ${BRAND.address || 'Near Cycle Circle, Parijat Nagar, Nashik'}`)
  }

  return `${BRAND.whatsappBase}?text=${encodeURIComponent(lines.join('\n'))}`
}

/**
 * Generates a quick order WhatsApp URL, optionally appending location if available.
 */
export function buildQuickOrderWhatsAppUrl(location = null) {
  const brandTitle = BRAND.name || 'Benne Saaram'
  if (location && (location.sevenCharCode || location.shortCode || location.fullCode)) {
    const locTag = location.sevenCharCode || location.shortCode || location.fullCode
    const mapsUrl = location.mapsUrl || `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    const lines = [
      `*${brandTitle} - Takeaway Inquiry*`,
      '',
      "Hi! I'd like to place a takeaway order.",
      '',
      `*Location* : *${locTag}* and ${mapsUrl}`,
    ]
    return `${BRAND.whatsappBase}?text=${encodeURIComponent(lines.join('\n'))}`
  }
  return `${BRAND.whatsappBase}?text=${encodeURIComponent(`*${brandTitle}*\nHi! I'd like to place a takeaway order.`)}`
}

/**
 * Formats a number as Indian Rupee price string.
 */
export function formatPrice(n) {
  return `₹${n}`
}

/**
 * Plain-language name for a spice level, used as the accessible label
 * beside the drawn flame icons.
 */
export const SPICE_LABELS = ['Not spicy', 'Mild heat', 'Medium heat', 'Hot']

export function spiceLabel(level) {
  return SPICE_LABELS[Math.min(level, 3)]
}
