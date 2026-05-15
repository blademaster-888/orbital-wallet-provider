// ─── Core Radiant types ──────────────────────────────────────────────────────

/** Satoshi-equivalent unit on Radiant. 1 RXD = 100_000_000 photons */
export type Photons = number;

/** A Radiant P2PKH address string */
export type RxdAddress = string;

/** Hex-encoded public key */
export type PubKey = string;

/** Hex-encoded raw transaction */
export type RawTx = string;

/** Hex-encoded transaction ID */
export type TxID = string;

/** Glyph token contract reference (20-byte hex string) */
export type GlyphRef = string;

// ─── Address types ───────────────────────────────────────────────────────────

export interface OrbitalAddresses {
  rxdAddress: RxdAddress;
  glyphAddress: RxdAddress;
  identityAddress: RxdAddress;
}

// ─── Balance types ───────────────────────────────────────────────────────────

export interface RxdBalance {
  confirmed: Photons;
  unconfirmed: Photons;
  total: Photons;
}

// ─── Send RXD ────────────────────────────────────────────────────────────────

export interface SendRxdParams {
  address: RxdAddress;
  satoshis: Photons;
}

export interface SendRxdResponse {
  txid: TxID;
  rawtx: RawTx;
}

// ─── Glyph FT ────────────────────────────────────────────────────────────────

export interface GlyphFtParams {
  tokenRef: GlyphRef;
  address: RxdAddress;
  amount: number;
}

export interface GlyphFtResponse {
  txid: TxID;
  rawtx: RawTx;
}

// ─── Glyph NFT ───────────────────────────────────────────────────────────────

export interface GlyphNftParams {
  tokenRef: GlyphRef;
  address: RxdAddress;
}

export interface GlyphNftResponse {
  txid: TxID;
  rawtx: RawTx;
}

// ─── Purchase Glyph NFT ──────────────────────────────────────────────────────

export interface PurchaseGlyphNftParams {
  listingTxid: TxID;
  priceSatoshis: Photons;
  sellerAddress: RxdAddress;
}

export interface PurchaseGlyphNftResponse {
  txid: TxID;
  rawtx: RawTx;
}

// ─── Sign message ────────────────────────────────────────────────────────────

export interface SignMessageParams {
  message: string;
  address?: RxdAddress;
}

export interface SignMessageResponse {
  sig: string;
  address: RxdAddress;
  pubKey: PubKey;
}

// ─── Raw signatures ──────────────────────────────────────────────────────────

export interface SignatureRequest {
  prevTxid: TxID;
  outputIndex: number;
  inputIndex: number;
  satoshis: Photons;
  address: RxdAddress;
  script: string;
  sigHashType: number;
  csIdx?: number;
  data?: Record<string, unknown>;
}

export interface SignatureResponse {
  sig: string;
  pubKey: PubKey;
  sigHashType: number;
  csIdx?: number;
  data?: Record<string, unknown>;
}

export interface GetSignaturesParams {
  rawtx: RawTx;
  sigRequests: SignatureRequest[];
}

// ─── Broadcast ───────────────────────────────────────────────────────────────

export interface BroadcastParams {
  rawtx: RawTx;
}

export interface BroadcastResponse {
  txid: TxID;
}

// ─── Encrypt / Decrypt ───────────────────────────────────────────────────────

export interface EncryptParams {
  message: string;
  pubKey: PubKey;
}

export interface DecryptParams {
  ciphertext: string;
}

// ─── Exchange rate ───────────────────────────────────────────────────────────

export interface ExchangeRateResponse {
  currency: string;
  rate: number;
}

// ─── Social profile ──────────────────────────────────────────────────────────

export interface OrbitalSocialProfile {
  displayName?: string;
  avatar?: string;
  idAddress?: RxdAddress;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export type OrbitalWalletEventName =
  | "signedOut"
  | "connect"
  | "disconnect";

export type OrbitalWalletEventHandler = () => void;

// ─── Full injected provider interface ────────────────────────────────────────

export interface OrbitalWalletProvider {
  isReady: boolean;
  isConnected: () => Promise<boolean>;
  connect: () => Promise<PubKey | undefined>;
  disconnect: () => Promise<void>;
  getAddresses: () => Promise<OrbitalAddresses | undefined>;
  getBalance: () => Promise<RxdBalance | undefined>;
  sendRxd: (params: SendRxdParams[]) => Promise<SendRxdResponse[] | undefined>;
  transferGlyphFt: (params: GlyphFtParams) => Promise<GlyphFtResponse | undefined>;
  transferGlyphNft: (params: GlyphNftParams) => Promise<GlyphNftResponse | undefined>;
  purchaseGlyphNft: (params: PurchaseGlyphNftParams) => Promise<PurchaseGlyphNftResponse | undefined>;
  signMessage: (params: SignMessageParams) => Promise<SignMessageResponse | undefined>;
  getSignatures: (params: GetSignaturesParams) => Promise<SignatureResponse[] | undefined>;
  broadcast: (params: BroadcastParams) => Promise<BroadcastResponse | undefined>;
  encrypt: (params: EncryptParams) => Promise<string | undefined>;
  decrypt: (params: DecryptParams) => Promise<string | undefined>;
  getExchangeRate: () => Promise<ExchangeRateResponse | undefined>;
  getSocialProfile: () => Promise<OrbitalSocialProfile | undefined>;
  on: (event: OrbitalWalletEventName, handler: OrbitalWalletEventHandler) => void;
  off: (event: OrbitalWalletEventName, handler: OrbitalWalletEventHandler) => void;
}

// ─── Window augmentation ─────────────────────────────────────────────────────

declare global {
  interface Window {
    orbital?: OrbitalWalletProvider;
  }
}
