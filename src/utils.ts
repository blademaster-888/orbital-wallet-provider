/**
 * orbital-wallet-provider — utils.ts
 * Helper functions for working with Radiant/Glyph values.
 */

/** Convert photons (base unit) to RXD */
export const photonsToRxd = (photons: number): number => photons / 1e8

/** Convert RXD to photons */
export const rxdToPhotons = (rxd: number): number => Math.round(rxd * 1e8)

/**
 * Format a photon amount as a human-readable RXD string.
 * e.g. formatRxd(100000000) → "1.00000000 RXD"
 */
export const formatRxd = (photons: number, decimals = 8): string =>
  `${photonsToRxd(photons).toFixed(decimals)} RXD`

/**
 * Format a Glyph token amount using its decimals.
 * e.g. formatToken(1000000, "BNET", 0) → "1000000 BNET"
 */
export const formatToken = (
  amount: number,
  ticker: string,
  decimals = 0
): string => {
  const val = decimals > 0 ? amount / Math.pow(10, decimals) : amount
  return `${val.toLocaleString(undefined, { maximumFractionDigits: decimals })} ${ticker}`
}

/**
 * Truncate a Radiant address for display.
 * e.g. "1AbCd...xYz9"
 */
export const truncateAddress = (
  address: string,
  prefixLen = 6,
  suffixLen = 4
): string => {
  if (address.length <= prefixLen + suffixLen + 3) return address
  return `${address.slice(0, prefixLen)}…${address.slice(-suffixLen)}`
}

/**
 * Returns the Glyph explorer URL for a given token ref.
 */
export const glyphExplorerUrl = (ref: string): string =>
  `https://glyph-explorer.rxd-radiant.com/glyph/${ref}`

/**
 * Returns the block explorer TX URL.
 */
export const explorerTxUrl = (txid: string): string =>
  `https://explorer2.rxd-radiant.com/tx/${txid}`

/**
 * Validate a Radiant P2PKH address (basic check).
 * Radiant addresses start with '1' (mainnet).
 */
export const isValidRxdAddress = (address: string): boolean =>
  /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)
