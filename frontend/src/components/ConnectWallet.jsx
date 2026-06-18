import { shortenAddress, HARDHAT_CHAIN_ID } from "../utils/helpers";
import "./ConnectWallet.css";

export default function ConnectWallet({
  account,
  isConnected,
  isConnecting,
  chainId,
  onConnect,
  onDisconnect,
  error,
}) {
  const isMetaMask = Boolean(window.ethereum?.isMetaMask);

  if (!isMetaMask) {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary btn-lg"
      >
        🦊 Install MetaMask
      </a>
    );
  }

  if (!isConnected) {
    return (
      <div className="wallet-connect-wrap">
        <button
          className="btn btn-primary btn-lg"
          onClick={onConnect}
          disabled={isConnecting}
          id="btn-connect-wallet"
        >
          {isConnecting ? (
            <><span className="spinner" /> Connecting...</>
          ) : (
            <><span>🦊</span> Connect Wallet</>
          )}
        </button>
        {error && <p className="wallet-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="wallet-info card animate-fadeIn">
      <div className="wallet-info__row">
        <div className="wallet-info__account">
          <span className="wallet-avatar">{account.slice(2, 4).toUpperCase()}</span>
          <div>
            <p className="wallet-info__label">Connected</p>
            <p className="wallet-info__address" title={account}>
              {shortenAddress(account)}
            </p>
          </div>
        </div>
        <div className="wallet-info__network">
          <span className={`badge ${chainId === HARDHAT_CHAIN_ID ? "badge-active" : "badge-warning"}`}>
            <span className={`dot ${chainId === HARDHAT_CHAIN_ID ? "dot-active" : "dot-inactive"}`} />
            {chainId === HARDHAT_CHAIN_ID ? "Hardhat Local" : `Chain ${chainId}`}
          </span>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={onDisconnect}
          id="btn-disconnect-wallet"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
