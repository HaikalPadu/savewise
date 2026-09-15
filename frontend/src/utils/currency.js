// The API returns money as two-decimal strings, e.g. "4000.00".

const numberFormatter = new Intl.NumberFormat('en-MY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Turns an API value ("4000.00", 4000, null) into a safe number. */
export function toNumber(value) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Formats an amount in Ringgit Malaysia, e.g. RM 4,000.00 */
export function formatRM(value) {
  return `RM ${numberFormatter.format(toNumber(value))}`
}
