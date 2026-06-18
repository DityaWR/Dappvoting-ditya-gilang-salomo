import "./WinnerDisplay.css";

export default function WinnerDisplay({ winner, votingActive, candidateCount }) {
  if (votingActive || !winner || candidateCount === 0) return null;

  return (
    <div className="winner-card card card--glow animate-fadeInUp">
      <div className="winner-card__crown">👑</div>
      <p className="winner-card__label">Current Leader</p>
      <h2 className="winner-card__name">{winner.name}</h2>
      <p className="winner-card__votes">{Number(winner.votes)} votes</p>
      <span className={`badge ${winner.quorumMet ? "badge-active" : "badge-warning"} winner-card__quorum`}>
        {winner.quorumMet ? "✅ Quorum Met" : "⏳ Quorum Not Met"}
      </span>
      <p className="winner-card__note text-muted text-sm mt-1">
        Results are final — recorded permanently on the blockchain.
      </p>
    </div>
  );
}
