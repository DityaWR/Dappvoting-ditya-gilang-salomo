import { getVotePercent } from "../utils/helpers";
import "./CandidateList.css";

function CandidateCard({ candidate, totalVotes, selectedId, onSelect, hasVoted, myChoice, votingActive, isConnected }) {
  const pct = getVotePercent(candidate.voteCount, totalVotes);
  const isMyVote = hasVoted && Number(myChoice) === candidate.id;
  const isSelected = selectedId === candidate.id;

  return (
    <div
      className={`candidate-card card ${isSelected ? "candidate-card--selected" : ""} ${isMyVote ? "candidate-card--myvote" : ""}`}
      onClick={() => {
        if (votingActive && isConnected && !hasVoted) onSelect(candidate.id);
      }}
      id={`candidate-${candidate.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && votingActive && isConnected && !hasVoted) onSelect(candidate.id);
      }}
    >
      <div className="candidate-card__header">
        <div className="candidate-card__avatar">
          {candidate.name.charAt(0).toUpperCase()}
        </div>
        <div className="candidate-card__info">
          <h3 className="candidate-card__name">{candidate.name}</h3>
          <p className="text-muted text-sm">Candidate #{candidate.id}</p>
        </div>
        <div className="candidate-card__votes">
          <span className="candidate-votes__count">{Number(candidate.voteCount)}</span>
          <span className="candidate-votes__label">votes</span>
        </div>
      </div>

      <div className="candidate-card__progress">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${pct}%` }}
            aria-valuenow={pct}
          />
        </div>
        <span className="candidate-card__pct">{pct}%</span>
      </div>

      {isMyVote && (
        <span className="candidate-card__yourvote">✅ Your vote</span>
      )}
      {isSelected && !hasVoted && (
        <span className="candidate-card__selected-label">Selected ✓</span>
      )}
    </div>
  );
}

export default function CandidateList({
  candidates,
  totalVotesCast,
  selectedId,
  onSelect,
  hasVoted,
  myChoice,
  votingActive,
  isConnected,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="candidates-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card candidate-skeleton" />
        ))}
      </div>
    );
  }

  if (!candidates.length) {
    return (
      <div className="card text-center" style={{ padding: "2.5rem" }}>
        <p style={{ fontSize: "2rem" }}>🗳️</p>
        <p className="text-muted mt-1">No candidates registered yet.</p>
      </div>
    );
  }

  return (
    <div className="candidates-grid">
      {candidates.map((c, i) => (
        <div key={c.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s` }}>
          <CandidateCard
            candidate={c}
            totalVotes={totalVotesCast}
            selectedId={selectedId}
            onSelect={onSelect}
            hasVoted={hasVoted}
            myChoice={myChoice}
            votingActive={votingActive}
            isConnected={isConnected}
          />
        </div>
      ))}
    </div>
  );
}
