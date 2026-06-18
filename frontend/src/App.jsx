import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./hooks/useWallet";
import { useContract } from "./hooks/useContract";
import ConnectWallet from "./components/ConnectWallet";
import NetworkWarning from "./components/NetworkWarning";
import VotingStatus from "./components/VotingStatus";
import CandidateList from "./components/CandidateList";
import VotePanel from "./components/VotePanel";
import WinnerDisplay from "./components/WinnerDisplay";
import AdminPanel from "./components/AdminPanel";
import TransactionToast from "./components/TransactionToast";
import { shortenAddress } from "./utils/helpers";
import "./App.css";

export default function App() {
  const wallet = useWallet();
  const contract = useContract(wallet.account);
  const [selectedId, setSelectedId] = useState(null);

  // Load blockchain data whenever account or connection changes
  useEffect(() => {
    if (wallet.isConnected && wallet.isCorrectNetwork) {
      contract.loadData(wallet.account);
    }
  }, [wallet.account, wallet.isConnected, wallet.isCorrectNetwork]);

  // Auto-refresh every 15 seconds when connected
  useEffect(() => {
    if (!wallet.isConnected || !wallet.isCorrectNetwork) return;
    const id = setInterval(() => contract.loadData(wallet.account), 15000);
    return () => clearInterval(id);
  }, [wallet.account, wallet.isConnected, wallet.isCorrectNetwork]);

  const handleVote = useCallback(async (candidateId) => {
    const ok = await contract.castVote(candidateId);
    if (ok) {
      setSelectedId(null);
      await contract.loadData(wallet.account);
    }
  }, [contract, wallet.account]);

  const handleAddCandidate = useCallback(async (name) => {
    const ok = await contract.addCandidate(name);
    if (ok) await contract.loadData(wallet.account);
    return ok;
  }, [contract, wallet.account]);

  const handleStartVoting = useCallback(async (dur, quo) => {
    const ok = await contract.startVoting(dur, quo);
    if (ok) await contract.loadData(wallet.account);
    return ok;
  }, [contract, wallet.account]);

  const handleEndVoting = useCallback(async () => {
    const ok = await contract.endVoting();
    if (ok) await contract.loadData(wallet.account);
    return ok;
  }, [contract, wallet.account]);

  const handleReset = useCallback(async () => {
    const ok = await contract.resetElection();
    if (ok) {
      setSelectedId(null);
      await contract.loadData(wallet.account);
    }
    return ok;
  }, [contract, wallet.account]);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header__inner container">
          <div className="app-header__brand">
            <span className="app-header__logo">🗳️</span>
            <div>
              <h1 className="app-header__title">VoteChain</h1>
              <p className="app-header__sub">Decentralized Voting on Ethereum</p>
            </div>
          </div>
          <div className="app-header__wallet">
            <ConnectWallet
              account={wallet.account}
              isConnected={wallet.isConnected}
              isConnecting={wallet.isConnecting}
              chainId={wallet.chainId}
              onConnect={wallet.connectWallet}
              onDisconnect={wallet.disconnectWallet}
              error={wallet.error}
            />
          </div>
        </div>
      </header>

      {/* ── Network Warning ── */}
      <NetworkWarning chainId={wallet.chainId} isConnected={wallet.isConnected} />

      {/* ── Main Content ── */}
      <main className="app-main container">
        {!wallet.isConnected ? (
          <section className="hero animate-fadeInUp">
            <div className="hero__glow" />
            <h2 className="hero__title">Transparent. Trustless. On-Chain.</h2>
            <p className="hero__desc">
              A decentralized voting system where every vote is recorded permanently on the Ethereum blockchain.
              No central authority. No manipulation. Just math.
            </p>
            <div className="hero__cta">
              <ConnectWallet
                account={wallet.account}
                isConnected={wallet.isConnected}
                isConnecting={wallet.isConnecting}
                chainId={wallet.chainId}
                onConnect={wallet.connectWallet}
                onDisconnect={wallet.disconnectWallet}
                error={wallet.error}
              />
            </div>
            <div className="hero__features">
              {[
                { icon: "🔒", label: "Anti-Double Vote" },
                { icon: "📊", label: "Live Results" },
                { icon: "⛓️", label: "Blockchain Verified" },
                { icon: "👁️", label: "Fully Transparent" },
              ].map((f) => (
                <div key={f.label} className="hero__feature">
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="app-grid">
            {/* Left column */}
            <div className="app-col app-col--left">
              <VotingStatus
                votingActive={contract.votingActive}
                votingDeadline={contract.votingDeadline}
                minimumQuorum={contract.minimumQuorum}
                totalVotesCast={contract.totalVotesCast}
                isLoading={contract.isLoading}
              />

              <VotePanel
                selectedId={selectedId}
                candidates={contract.candidates}
                hasVoted={contract.hasVoted}
                myChoice={contract.myChoice}
                votingActive={contract.votingActive}
                isConnected={wallet.isConnected}
                txStatus={contract.txStatus}
                onVote={handleVote}
              />

              {!contract.votingActive && contract.winner && (
                <WinnerDisplay
                  winner={contract.winner}
                  votingActive={contract.votingActive}
                  candidateCount={contract.candidates.length}
                />
              )}

              <AdminPanel
                isOwner={contract.isOwner}
                votingActive={contract.votingActive}
                candidateCount={contract.candidates.length}
                onAddCandidate={handleAddCandidate}
                onStartVoting={handleStartVoting}
                onEndVoting={handleEndVoting}
                onReset={handleReset}
                txStatus={contract.txStatus}
              />
            </div>

            {/* Right column */}
            <div className="app-col app-col--right">
              <div className="section-header">
                <h2 className="section-title">Candidates</h2>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => contract.loadData(wallet.account)}
                  disabled={contract.isLoading}
                  id="btn-refresh"
                >
                  {contract.isLoading ? <span className="spinner" /> : "↻ Refresh"}
                </button>
              </div>

              <CandidateList
                candidates={contract.candidates}
                totalVotesCast={contract.totalVotesCast}
                selectedId={selectedId}
                onSelect={setSelectedId}
                hasVoted={contract.hasVoted}
                myChoice={contract.myChoice}
                votingActive={contract.votingActive}
                isConnected={wallet.isConnected}
                isLoading={contract.isLoading}
              />

              {/* Recent Activity */}
              {contract.recentVotes.length > 0 && (
                <div className="recent-activity card mt-2">
                  <h3 className="section-title" style={{ fontSize: "1rem", marginBottom: "1rem" }}>
                    🔔 Recent Votes
                  </h3>
                  <ul className="activity-list">
                    {contract.recentVotes.map((v, i) => (
                      <li key={i} className="activity-item">
                        <span className="activity-item__voter" title={v.voter}>
                          {shortenAddress(v.voter)}
                        </span>
                        <span className="activity-item__action">
                          voted for candidate #{v.candidateId}
                          {v.weight > 1 && <span className="badge badge-primary" style={{ marginLeft: "0.4rem" }}>×{v.weight}</span>}
                        </span>
                        <span className="activity-item__block text-muted text-xs">
                          Block #{v.block}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <p className="text-muted text-sm text-center">
          SimpleVoting Smart Contract · Solidity 0.8.28 · Hardhat v2 · ethers.js v6
        </p>
        <p className="text-muted text-xs text-center mt-1">
          Gilang Raya Kurniawan (5027220145) &amp; Ditya Wahyu Ramadhan (5027221051)
        </p>
      </footer>

      {/* ── Toast Notification ── */}
      <TransactionToast
        txStatus={contract.txStatus}
        txMessage={contract.txMessage}
        onClose={contract.clearTxStatus}
      />
    </div>
  );
}
