import "./VotePanel.css";

export default function VotePanel({
  selectedId,
  candidates,
  hasVoted,
  myChoice,
  votingActive,
  isConnected,
  txStatus,
  onVote,
}) {
  const selectedCandidate = candidates.find((c) => c.id === selectedId);

  if (!isConnected) {
    return (
      <div className="card vote-panel vote-panel--info animate-fadeInUp">
        <p className="vote-panel__icon">🔒</p>
        <p className="vote-panel__title">Connect wallet to vote</p>
        <p className="text-muted text-sm">You need to connect your MetaMask wallet to participate.</p>
      </div>
    );
  }

  if (hasVoted) {
    const votedFor = candidates.find((c) => c.id === Number(myChoice));
    return (
      <div className="card vote-panel vote-panel--voted animate-fadeInUp">
        <p className="vote-panel__icon">✅</p>
        <p className="vote-panel__title">Vote Recorded!</p>
        <p className="text-muted text-sm">
          You voted for <strong>{votedFor?.name ?? `#${myChoice}`}</strong>. Your vote is recorded on-chain and cannot be changed.
        </p>
      </div>
    );
  }

  if (!votingActive) {
    return (
      <div className="card vote-panel vote-panel--info animate-fadeInUp">
        <p className="vote-panel__icon">🚫</p>
        <p className="vote-panel__title">Voting is closed</p>
        <p className="text-muted text-sm">The voting session is not currently active.</p>
      </div>
    );
  }

  const isPending = txStatus === "pending";

  return (
    <div className="card vote-panel animate-fadeInUp">
      <h3 className="vote-panel__title">Cast Your Vote</h3>
      <p className="text-muted text-sm mt-1">
        {selectedId
          ? <>Selected: <strong className="vote-panel__highlight">{selectedCandidate?.name}</strong></>
          : "Click a candidate card above to select, then confirm."}
      </p>
      <button
        id="btn-cast-vote"
        className="btn btn-primary btn-lg btn-full mt-2"
        disabled={!selectedId || isPending}
        onClick={() => onVote(selectedId)}
      >
        {isPending ? (
          <><span className="spinner" /> Processing on blockchain...</>
        ) : selectedId ? (
          <>🗳️ Vote for {selectedCandidate?.name}</>
        ) : (
          "Select a candidate first"
        )}
      </button>
      <p className="vote-panel__notice mt-1">
        ⚡ This will open MetaMask for confirmation. Gas fee applies.
      </p>
    </div>
  );
}
