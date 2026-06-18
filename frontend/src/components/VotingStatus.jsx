import { formatDeadline } from "../utils/helpers";
import DeadlineCountdown from "./DeadlineCountdown";
import "./VotingStatus.css";

export default function VotingStatus({ votingActive, votingDeadline, minimumQuorum, totalVotesCast, isLoading }) {
  if (isLoading) {
    return (
      <div className="card status-card">
        <div className="status-skeleton" />
      </div>
    );
  }

  return (
    <div className={`card status-card animate-fadeInUp ${votingActive ? "status-card--active" : "status-card--closed"}`}>
      <div className="status-card__header">
        <div>
          <h2 className="status-card__title">Voting Session</h2>
          <p className="text-muted text-sm">On-chain decentralized election</p>
        </div>
        <span className={`badge ${votingActive ? "badge-active" : "badge-inactive"}`}>
          <span className={`dot ${votingActive ? "dot-active" : "dot-inactive"}`} />
          {votingActive ? "Active" : "Closed"}
        </span>
      </div>

      <hr className="divider" />

      <div className="status-card__stats">
        <div className="stat-item">
          <span className="stat-value">{totalVotesCast?.toString() ?? "0"}</span>
          <span className="stat-label">Total Votes</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{minimumQuorum?.toString() ?? "0"}</span>
          <span className="stat-label">Min. Quorum</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {Number(totalVotesCast) >= Number(minimumQuorum) && Number(minimumQuorum) > 0
              ? "✅"
              : Number(minimumQuorum) === 0
              ? "—"
              : "⏳"}
          </span>
          <span className="stat-label">Quorum Met</span>
        </div>
      </div>

      {votingDeadline && votingDeadline !== 0n && (
        <>
          <hr className="divider" />
          <div className="status-card__deadline">
            <p className="text-muted text-sm">
              🗓 Deadline: <strong>{formatDeadline(votingDeadline)}</strong>
            </p>
            {votingActive && <DeadlineCountdown deadline={votingDeadline} />}
          </div>
        </>
      )}
    </div>
  );
}
