# Changelog

## 1.0.0 — initial release

### What is this?

`orbital-wallet-provider` is extracted from the [Orbital Market](https://github.com/blademaster-888/orbital-market) frontend into a standalone, publishable React library so that any dApp built on the Radiant blockchain can integrate the Orbital Wallet with a single import.

### Contents

| File | Purpose |
|---|---|
| `src/types.ts` | Full TypeScript interface for the injected `window.orbital` provider and all request/response types |
| `src/OrbitalProvider.tsx` | React context provider — detects the extension, manages connection state, exposes all wallet methods |
| `src/OrbitalIcon.tsx` | Inline SVG logo component for use in connect buttons |
| `src/utils.ts` | Helpers: `photonsToRxd`, `rxdToPhotons`, `formatRxd`, `formatToken`, `truncateAddress`, `glyphExplorerUrl`, `explorerTxUrl`, `isValidRxdAddress` |
| `src/index.ts` | Barrel export |

### Key features shipped in 1.0.0

- **Auto-reconnect on page refresh** — `OrbitalProvider` calls `isConnected()` on mount after the extension is detected. If the site was previously authorised, connection state (addresses, `isConnected`) is silently restored without opening a popup.

- **Full TypeScript types** — every wallet method, parameter, and response is typed. `window.orbital` is declared globally so TypeScript projects get correct autocomplete without any extra configuration.

- **Zero runtime dependencies beyond React** — the library only requires `react` as a peer dependency. No wallet SDK, no heavy crypto library is bundled.

- **Framework agnostic** — works with Next.js (app router and pages router), Vite, Create React App, and any React 17+ setup.

- **`OrbitalIcon` component** — drop-in inline SVG logo for connect/disconnect buttons, sized and coloured via props.

- **Utility helpers** — photon ↔ RXD conversion, address truncation, Glyph and block explorer URL builders.

### Build output

Built with [tsup](https://tsup.egoist.dev):
- `dist/index.js` — CommonJS
- `dist/index.esm.js` — ES module
- `dist/index.d.ts` — type declarations
