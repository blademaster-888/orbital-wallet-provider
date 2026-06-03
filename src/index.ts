// ─── Provider & hook ─────────────────────────────────────────────────────────
export { OrbitalProvider, useOrbitalWallet } from "./OrbitalProvider";
export type { OrbitalProviderProps, OrbitalWalletContextState } from "./OrbitalProvider";

// ─── Icon ────────────────────────────────────────────────────────────────────
export { OrbitalIcon } from "./OrbitalIcon";
export type { OrbitalIconProps } from "./OrbitalIcon";

// ─── Utilities ───────────────────────────────────────────────────────────────
export {
  photonsToRxd,
  rxdToPhotons,
  formatRxd,
  formatToken,
  truncateAddress,
  glyphExplorerUrl,
  explorerTxUrl,
  isValidRxdAddress,
} from "./utils";

// ─── All types ───────────────────────────────────────────────────────────────
export type {
  // Primitives
  Photons,
  RxdAddress,
  PubKey,
  RawTx,
  TxID,
  GlyphRef,

  // Addresses & balance
  OrbitalAddresses,
  RxdBalance,

  // Send RXD
  SendRxdParams,
  SendRxdResponse,

  // Glyph FT
  GlyphFtParams,
  GlyphFtResponse,

  // Glyph NFT
  GlyphNftParams,
  GlyphNftResponse,

  // Purchase NFT
  PurchaseGlyphNftParams,
  PurchaseGlyphNftResponse,

  // Signing
  SignMessageParams,
  SignMessageResponse,
  SignatureRequest,
  SignatureResponse,
  GetSignaturesParams,

  // Broadcast
  BroadcastParams,
  BroadcastResponse,

  // Encrypt/decrypt
  EncryptParams,
  DecryptParams,

  // Misc
  ExchangeRateResponse,
  OrbitalSocialProfile,
  WalletToken,
  OrbitalWalletEventName,
  OrbitalWalletEventHandler,

  // Atomic swap (PSBT) — FT
  CreateTokenSwapOfferParams,
  CreateTokenSwapOfferResponse,
  CompleteTokenSwapOfferParams,
  CompleteTokenSwapOfferResponse,

  // Atomic swap (PSBT) — NFT
  CreateNftSwapOfferParams,
  CreateNftSwapOfferResponse,
  CompleteNftSwapOfferParams,
  CompleteNftSwapOfferResponse,

  // Full provider interface (for advanced use)
  OrbitalWalletProvider,
} from "./types";
