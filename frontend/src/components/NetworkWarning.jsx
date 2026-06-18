import { HARDHAT_CHAIN_ID } from "../utils/helpers";

export default function NetworkWarning({ chainId, isConnected }) {
  if (!isConnected || chainId === HARDHAT_CHAIN_ID) return null;
  return (
    <div className="network-warning animate-fadeInUp">
      <span className="network-warning__icon">⚠️</span>
      <div>
        <strong>Wrong Network</strong>
        <p>Please switch MetaMask to <strong>Hardhat Local</strong> (Chain ID: 31337 / localhost:8545).</p>
      </div>
    </div>
  );
}
