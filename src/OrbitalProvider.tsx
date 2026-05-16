import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  OrbitalAddresses,
  OrbitalSocialProfile,
  OrbitalWalletEventHandler,
  OrbitalWalletEventName,
  OrbitalWalletProvider,
  PubKey,
  RxdBalance,
  SendRxdParams,
  SendRxdResponse,
  GlyphFtParams,
  GlyphFtResponse,
  GlyphNftParams,
  GlyphNftResponse,
  PurchaseGlyphNftParams,
  PurchaseGlyphNftResponse,
  SignMessageParams,
  SignMessageResponse,
  GetSignaturesParams,
  SignatureResponse,
  BroadcastParams,
  BroadcastResponse,
  EncryptParams,
  DecryptParams,
  ExchangeRateResponse,
  WalletToken,
  CreateTokenSwapOfferParams,
  CreateTokenSwapOfferResponse,
  CompleteTokenSwapOfferParams,
  CompleteTokenSwapOfferResponse,
} from "./types";

// ─── Context shape ────────────────────────────────────────────────────────────

export interface OrbitalWalletContextState {
  /**
   * True when the Orbital Wallet extension is installed and unlocked.
   * Check this before calling connect().
   */
  isReady: boolean;

  /**
   * True when the user has actively connected this site in the wallet.
   */
  isConnected: boolean;

  /**
   * The identity public key returned by connect(), null when not connected.
   */
  pubKey: PubKey | null;

  /**
   * Addresses for the connected account, null when not connected.
   */
  addresses: OrbitalAddresses | null;

  /**
   * Confirmed + unconfirmed RXD balance, null when not connected.
   */
  balance: RxdBalance | null;

  /** Request connection. Opens the Orbital Wallet popup. */
  connect: () => Promise<PubKey | undefined>;

  /** Disconnect this site from the wallet. */
  disconnect: () => Promise<void>;

  /** Refresh addresses from the wallet. */
  getAddresses: () => Promise<OrbitalAddresses | undefined>;

  /** Refresh balance from the wallet. */
  getBalance: () => Promise<RxdBalance | undefined>;

  /** Send RXD to one or more recipients. */
  sendRxd: (params: SendRxdParams[]) => Promise<SendRxdResponse[] | undefined>;

  /** Transfer a Glyph fungible token (FT/BNET/etc). */
  transferGlyphFt: (params: GlyphFtParams) => Promise<GlyphFtResponse | undefined>;

  /** Transfer a Glyph NFT. */
  transferGlyphNft: (params: GlyphNftParams) => Promise<GlyphNftResponse | undefined>;

  /** Purchase a listed Glyph NFT from a P2P listing. */
  purchaseGlyphNft: (params: PurchaseGlyphNftParams) => Promise<PurchaseGlyphNftResponse | undefined>;

  /** Sign a human-readable message. */
  signMessage: (params: SignMessageParams) => Promise<SignMessageResponse | undefined>;

  /** Sign specific inputs in a raw tx (PSBT-style). */
  getSignatures: (params: GetSignaturesParams) => Promise<SignatureResponse[] | undefined>;

  /** Broadcast a fully signed raw transaction. */
  broadcast: (params: BroadcastParams) => Promise<BroadcastResponse | undefined>;

  /** ECIES-encrypt a message to a public key. */
  encrypt: (params: EncryptParams) => Promise<string | undefined>;

  /** ECIES-decrypt a ciphertext with the wallet private key. */
  decrypt: (params: DecryptParams) => Promise<string | undefined>;

  /** Get the current RXD/fiat exchange rate. */
  getExchangeRate: () => Promise<ExchangeRateResponse | undefined>;

  /** Get social/profile info for the connected account. */
  getSocialProfile: () => Promise<OrbitalSocialProfile | undefined>;

  /** Get all tokens from the wallet's internal DB. */
  getTokens: () => Promise<WalletToken[] | undefined>;

  /** Create a partial (PSBT-style) atomic swap offer as the seller. */
  createTokenSwapOffer: (
    params: CreateTokenSwapOfferParams,
  ) => Promise<CreateTokenSwapOfferResponse | undefined>;

  /** Complete an atomic swap offer as the buyer — broadcasts immediately. */
  completeTokenSwapOffer: (
    params: CompleteTokenSwapOfferParams,
  ) => Promise<CompleteTokenSwapOfferResponse | undefined>;

  /** Register an event listener on the wallet. */
  on: (event: OrbitalWalletEventName, handler: OrbitalWalletEventHandler) => void;

  /** Remove an event listener from the wallet. */
  off: (event: OrbitalWalletEventName, handler: OrbitalWalletEventHandler) => void;
}

// ─── Default context (no-op stubs) ───────────────────────────────────────────

const noop = async () => undefined;

const defaultContext: OrbitalWalletContextState = {
  isReady: false,
  isConnected: false,
  pubKey: null,
  addresses: null,
  balance: null,
  connect: noop,
  disconnect: noop as any,
  getAddresses: noop,
  getBalance: noop,
  sendRxd: noop,
  transferGlyphFt: noop,
  transferGlyphNft: noop,
  purchaseGlyphNft: noop,
  signMessage: noop,
  getSignatures: noop,
  broadcast: noop,
  encrypt: noop,
  decrypt: noop,
  getExchangeRate: noop,
  getSocialProfile: noop,
  getTokens: noop,
  createTokenSwapOffer: noop,
  completeTokenSwapOffer: noop,
  on: () => {},
  off: () => {},
};

// ─── Context ─────────────────────────────────────────────────────────────────

const OrbitalWalletContext =
  createContext<OrbitalWalletContextState>(defaultContext);

// ─── Provider ────────────────────────────────────────────────────────────────

export interface OrbitalProviderProps {
  children: React.ReactNode;
}

export const OrbitalProvider: React.FC<OrbitalProviderProps> = ({
  children,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pubKey, setPubKey] = useState<PubKey | null>(null);
  const [addresses, setAddresses] = useState<OrbitalAddresses | null>(null);
  const [balance, setBalance] = useState<RxdBalance | null>(null);

  // Keep a stable ref to the injected provider so callbacks don't stale-close
  const providerRef = useRef<OrbitalWalletProvider | null>(null);
  const connectingRef = useRef(false);
  const autoReconnectDone = useRef(false);

  // ── Detect the injected orbital object ─────────────────────────────────
  useEffect(() => {
    const checkProvider = () => {
      const p = (window as any).orbital as OrbitalWalletProvider | undefined;
      if (p && typeof p.connect === "function") {
        providerRef.current = p;
        setIsReady(true);
      }
    };

    // The extension may inject after the page loads; poll briefly
    checkProvider();
    const interval = setInterval(() => {
      if (providerRef.current) {
        clearInterval(interval);
        return;
      }
      checkProvider();
    }, 300);

    // Stop polling after 5 s — if it's not there by then, it's not installed
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // ── Auto-reconnect on page refresh ─────────────────────────────────────
  // If the site was already authorized in a previous session, silently restore
  // connection without showing a popup.
  useEffect(() => {
    if (!isReady || autoReconnectDone.current) return;
    const p = providerRef.current;
    if (!p) return;
    autoReconnectDone.current = true;
    let cancelled = false;
    p.isConnected()
      .then(async (connected) => {
        if (cancelled || !connected) return;
        const addrs = await p.getAddresses().catch(() => null);
        if (cancelled) return;
        if (addrs) {
          setAddresses(addrs);
          setIsConnected(true);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isReady]);

  // ── Wire up wallet events ───────────────────────────────────────────────
  useEffect(() => {
    const p = providerRef.current;
    if (!p) return;

    const handleSignedOut = () => {
      setIsConnected(false);
      setPubKey(null);
      setAddresses(null);
      setBalance(null);
    };

    try { p.on?.("signedOut", handleSignedOut); } catch {}

    return () => {
      try { p.off?.("signedOut", handleSignedOut); } catch {}
    };
  }, [isReady]);

  // ── Methods ─────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    const p = providerRef.current ?? ((window as any).orbital as OrbitalWalletProvider | undefined);
    if (!p) {
      window.open(
        "https://github.com/RadiantBlockchain-Community/radiant-orbital-wallet",
        "_blank"
      );
      return undefined;
    }
    providerRef.current = p;  // restore ref if it was cleared by disconnect
    if (connectingRef.current) {
      console.warn("[orbital] connect() called while already connecting — ignored");
      return undefined;
    }
    connectingRef.current = true;
    try {
      console.log("[orbital] calling p.connect()…");
      const key = await p.connect();
      console.log("[orbital] p.connect() resolved →", key);

      if (key) {
        setPubKey(key);
        setIsConnected(true);
        // Fetch addresses immediately so wallet.addresses is available for auth
        try {
          const addrs = await p.getAddresses();
          if (addrs) setAddresses(addrs);
        } catch {}
      }

      return key;
    } catch (err) {
      console.error("[orbital] p.connect() rejected →", err);
      return undefined;
    } finally {
      connectingRef.current = false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    const p = providerRef.current;
    try { await p?.disconnect() } catch {}
    setIsConnected(false);
    setPubKey(null);
    setAddresses(null);
    setBalance(null);
    providerRef.current = null;
  }, []);

  const getAddresses = useCallback(async () => {
    const p = providerRef.current;
    if (!p) return undefined;
    const addrs = await p.getAddresses();
    if (addrs) setAddresses(addrs);
    return addrs;
  }, []);

  const getBalance = useCallback(async () => {
    const p = providerRef.current;
    if (!p) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = (await p.getBalance()) as any;
    if (!raw) return undefined;
    // Normalise: wallet may return { rxd, photons } instead of { confirmed, unconfirmed, total }
    const bal: RxdBalance =
      raw.confirmed !== undefined && raw.total !== undefined
        ? (raw as RxdBalance)
        : {
            confirmed: raw.photons ?? Math.round((raw.rxd ?? 0) * 1e8),
            unconfirmed: 0,
            total: raw.photons ?? Math.round((raw.rxd ?? 0) * 1e8),
          };
    setBalance(bal);
    return bal;
  }, []);

  const sendRxd = useCallback(
    (params: SendRxdParams[]) =>
      providerRef.current ? providerRef.current.sendRxd(params) : Promise.resolve(undefined),
    []
  );

  const transferGlyphFt = useCallback(
    (params: GlyphFtParams) => {
      const p = providerRef.current as any;
      if (!p) return Promise.resolve(undefined);
      // Wallet extension exposes transferToken; fall back if transferGlyphFt not present
      return (p.transferGlyphFt ?? p.transferToken)?.(params);
    },
    []
  );

  const transferGlyphNft = useCallback(
    (params: GlyphNftParams) =>
      providerRef.current ? providerRef.current.transferGlyphNft(params) : Promise.resolve(undefined),
    []
  );

  const purchaseGlyphNft = useCallback(
    (params: PurchaseGlyphNftParams) =>
      providerRef.current ? providerRef.current.purchaseGlyphNft(params) : Promise.resolve(undefined),
    []
  );

  const signMessage = useCallback(
    (params: SignMessageParams) =>
      providerRef.current ? providerRef.current.signMessage(params) : Promise.resolve(undefined),
    []
  );

  const getSignatures = useCallback(
    (params: GetSignaturesParams) =>
      providerRef.current ? providerRef.current.getSignatures(params) : Promise.resolve(undefined),
    []
  );

  const broadcast = useCallback(
    (params: BroadcastParams) =>
      providerRef.current ? providerRef.current.broadcast(params) : Promise.resolve(undefined),
    []
  );

  const encrypt = useCallback(
    (params: EncryptParams) =>
      providerRef.current ? providerRef.current.encrypt(params) : Promise.resolve(undefined),
    []
  );

  const decrypt = useCallback(
    (params: DecryptParams) =>
      providerRef.current ? providerRef.current.decrypt(params) : Promise.resolve(undefined),
    []
  );

  const getExchangeRate = useCallback(
    () =>
      providerRef.current ? providerRef.current.getExchangeRate() : Promise.resolve(undefined),
    []
  );

  const getSocialProfile = useCallback(
    () =>
      providerRef.current ? providerRef.current.getSocialProfile() : Promise.resolve(undefined),
    []
  );

  const getTokens = useCallback(async () => {
    const p = providerRef.current;
    if (!p) return undefined;
    try {
      const raw = await (p as any).getTokens?.();
      if (!Array.isArray(raw)) return undefined;
      return raw as WalletToken[];
    } catch {
      return undefined;
    }
  }, []);

  const createTokenSwapOffer = useCallback(
    (params: CreateTokenSwapOfferParams) =>
      providerRef.current
        ? (providerRef.current as any).createSwapOffer?.(params)
        : Promise.resolve(undefined),
    [],
  );

  const completeTokenSwapOffer = useCallback(
    (params: CompleteTokenSwapOfferParams) =>
      providerRef.current
        ? (providerRef.current as any).completeSwapOffer?.(params)
        : Promise.resolve(undefined),
    [],
  );

  const on = useCallback(
    (event: OrbitalWalletEventName, handler: OrbitalWalletEventHandler) => {
      providerRef.current?.on(event, handler);
    },
    []
  );

  const off = useCallback(
    (event: OrbitalWalletEventName, handler: OrbitalWalletEventHandler) => {
      providerRef.current?.off(event, handler);
    },
    []
  );

  return (
    <OrbitalWalletContext.Provider
      value={{
        isReady,
        isConnected,
        pubKey,
        addresses,
        balance,
        connect,
        disconnect,
        getAddresses,
        getBalance,
        sendRxd,
        transferGlyphFt,
        transferGlyphNft,
        purchaseGlyphNft,
        signMessage,
        getSignatures,
        broadcast,
        encrypt,
        decrypt,
        getExchangeRate,
        getSocialProfile,
        getTokens,
        createTokenSwapOffer,
        completeTokenSwapOffer,
        on,
        off,
      }}
    >
      {children}
    </OrbitalWalletContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useOrbitalWallet — access the connected Orbital Wallet state and methods.
 *
 * Must be used inside <OrbitalProvider>.
 *
 * @example
 * const { isReady, connect, balance, transferGlyphFt } = useOrbitalWallet();
 */
export const useOrbitalWallet = (): OrbitalWalletContextState => {
  const ctx = useContext(OrbitalWalletContext);
  if (!ctx) {
    throw new Error("useOrbitalWallet must be used within an <OrbitalProvider>");
  }
  return ctx;
};
