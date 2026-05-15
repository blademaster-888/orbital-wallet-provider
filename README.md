<div align="center">
  <img src="logo.svg" width="80" height="80" alt="Orbital Wallet" />
  <h1>Orbital Wallet Provider</h1>
  <p>React provider and hooks for integrating the <a href="https://github.com/blademaster-888/radiant-orbital-wallet">Orbital Wallet</a> Chrome extension into any React or Next.js application.</p>
  <p>Orbital Wallet is a non-custodial browser wallet for the <a href="https://radiantblockchain.org">Radiant</a> L1 blockchain with Glyph NFT support.</p>
</div>

---

## Installation

```bash
npm install orbital-wallet-provider
# or
pnpm add orbital-wallet-provider
```

React 17+ is required as a peer dependency.

---

## Quick start

### 1. Wrap your app with `OrbitalProvider`

```tsx
import { OrbitalProvider } from "orbital-wallet-provider"

export default function App({ children }) {
  return (
    <OrbitalProvider>
      {children}
    </OrbitalProvider>
  )
}
```

The provider automatically detects the injected `window.orbital` object and **restores connection state on page refresh** if the site was previously authorised — no manual reconnect needed.

### 2. Use the `useOrbitalWallet` hook

```tsx
import { useOrbitalWallet } from "orbital-wallet-provider"

export function ConnectButton() {
  const { isReady, isConnected, connect, disconnect, addresses, balance } = useOrbitalWallet()

  if (!isReady) {
    return (
      <a href="https://github.com/blademaster-888/radiant-orbital-wallet" target="_blank">
        Install Orbital Wallet
      </a>
    )
  }

  if (!isConnected) {
    return <button onClick={() => connect()}>Connect Wallet</button>
  }

  return (
    <div>
      <p>{addresses?.rxdAddress}</p>
      <p>{balance ? (balance.total / 1e8).toFixed(8) : "—"} RXD</p>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}
```

---

## API

### `<OrbitalProvider>`

Wrap your application (or any subtree that needs wallet access) with this provider. It:

- Polls for `window.orbital` for up to 5 seconds after mount (the extension may inject after the page loads)
- Calls `isConnected()` once the extension is detected — if the site was previously authorised, `isConnected` and `addresses` are restored silently without opening a popup
- Listens for `"signedOut"` events from the extension and clears connection state accordingly

### `useOrbitalWallet()`

Returns the full wallet context:

| Property | Type | Description |
|---|---|---|
| `isReady` | `boolean` | Extension detected in the page |
| `isConnected` | `boolean` | Site is connected and authorised |
| `pubKey` | `string \| null` | Identity public key (hex) |
| `addresses` | `OrbitalAddresses \| null` | RXD, Glyph, and identity addresses |
| `balance` | `RxdBalance \| null` | Confirmed + unconfirmed RXD (photons) |
| `connect()` | `() => Promise<PubKey \| undefined>` | Request connection — opens wallet popup |
| `disconnect()` | `() => Promise<void>` | Disconnect and clear state |
| `getAddresses()` | `() => Promise<OrbitalAddresses \| undefined>` | Refresh addresses from extension |
| `getBalance()` | `() => Promise<RxdBalance \| undefined>` | Refresh RXD balance |
| `signMessage(params)` | `(SignMessageParams) => Promise<SignMessageResponse \| undefined>` | Sign a message with the RXD key |
| `sendRxd(params)` | `(SendRxdParams[]) => Promise<SendRxdResponse[] \| undefined>` | Send RXD to one or more addresses |
| `transferGlyphFt(params)` | `(GlyphFtParams) => Promise<GlyphFtResponse \| undefined>` | Transfer a Glyph fungible token |
| `transferGlyphNft(params)` | `(GlyphNftParams) => Promise<GlyphNftResponse \| undefined>` | Transfer a Glyph NFT |
| `purchaseGlyphNft(params)` | `(PurchaseGlyphNftParams) => Promise<PurchaseGlyphNftResponse \| undefined>` | Purchase a listed Glyph NFT |
| `getSignatures(params)` | `(GetSignaturesParams) => Promise<SignatureResponse[] \| undefined>` | Sign specific inputs in a raw tx |
| `broadcast(params)` | `(BroadcastParams) => Promise<BroadcastResponse \| undefined>` | Broadcast a fully signed raw transaction |
| `encrypt(params)` | `(EncryptParams) => Promise<string \| undefined>` | ECIES-encrypt a message |
| `decrypt(params)` | `(DecryptParams) => Promise<string \| undefined>` | ECIES-decrypt a ciphertext |
| `getExchangeRate()` | `() => Promise<ExchangeRateResponse \| undefined>` | RXD/fiat exchange rate |
| `getSocialProfile()` | `() => Promise<OrbitalSocialProfile \| undefined>` | Social profile for the connected account |
| `on(event, handler)` | | Subscribe to a wallet event |
| `off(event, handler)` | | Unsubscribe from a wallet event |

### Key types

```ts
interface OrbitalAddresses {
  rxdAddress:      string  // P2PKH address — used for RXD payments and signing
  glyphAddress:    string  // Address for Glyph NFT/FT operations
  identityAddress: string  // Identity derivation address
}

interface RxdBalance {
  confirmed:   number  // photons (1 RXD = 100_000_000 photons)
  unconfirmed: number
  total:       number
}

interface SignMessageResponse {
  sig:     string  // base64 Bitcoin-style signed message
  address: string  // RXD address that produced the signature
  pubKey:  string  // hex-encoded compressed public key
}
```

### Events

| Event | Fired when |
|---|---|
| `"signedOut"` | User locks the wallet or signs out |
| `"connect"` | Site connection approved |
| `"disconnect"` | Site disconnected from wallet |

### `OrbitalIcon`

Inline SVG of the Orbital Wallet logo — useful for connect buttons and nav bars.

```tsx
import { OrbitalIcon } from "orbital-wallet-provider"

// defaults: size="24px", color="currentColor"
<OrbitalIcon size="32px" color="#00d4ff" />
```

### Utility helpers

```ts
import {
  photonsToRxd,
  rxdToPhotons,
  formatRxd,
  formatToken,
  truncateAddress,
  glyphExplorerUrl,
  explorerTxUrl,
  isValidRxdAddress,
} from "orbital-wallet-provider"

photonsToRxd(100_000_000)           // → 1
rxdToPhotons(1)                     // → 100000000
formatRxd(100_000_000)              // → "1.00000000 RXD"
formatToken(1000000, "BNET", 0)     // → "1,000,000 BNET"
truncateAddress("1AbCdEfGhIjKlMn")  // → "1AbCdE…lMn"
isValidRxdAddress("1AbC...")        // → true / false
```

---

## Sign-in pattern (wallet authentication)

Prove wallet ownership to a backend using a Bitcoin-style signed message. `signMessage` always uses the **RXD key** (`addresses.rxdAddress`) so the address you register with the backend matches the address shown to the user in the wallet.

```tsx
import { useOrbitalWallet } from "orbital-wallet-provider"

const { signMessage, addresses } = useOrbitalWallet()

async function signIn() {
  // 1. Request a nonce from your backend for the user's RXD address
  const { nonce, message } = await fetch("/api/auth/nonce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: addresses?.rxdAddress }),
  }).then(r => r.json())

  // 2. Ask the wallet to sign — opens the Orbital Wallet popup
  //    Returns undefined if the user cancels
  const signed = await signMessage({ message })
  if (!signed) throw new Error("Sign-in cancelled")

  // 3. Verify on your backend
  //    signed.address is the RXD address that produced the signature
  //    signed.sig     is a base64 Bitcoin Signed Message (65 bytes)
  //    signed.pubKey  is the hex-encoded compressed public key
  const { token } = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address:   signed.address,
      message,
      nonce,
      signature: signed.sig,
    }),
  }).then(r => r.json())

  return token
}
```

> **Backend verification**: the signature is a standard Bitcoin Signed Message. Use `coincurve`, `bitcoinjs-message`, or any BSM-compatible library on the server. The message is hashed as `SHA256d("Bitcoin Signed Message:\n" + varint(len) + message)` and the signature is 65 bytes: `[recovery_flag][r][s]`.

---

## License

MIT
