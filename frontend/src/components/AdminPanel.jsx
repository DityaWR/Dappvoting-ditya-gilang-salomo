import { useState } from "react";
import "./AdminPanel.css";

export default function AdminPanel({
  isOwner,
  votingActive,
  candidateCount,
  onAddCandidate,
  onStartVoting,
  onEndVoting,
  onReset,
  txStatus,
}) {
  const [newName, setNewName] = useState("");
  const [duration, setDuration] = useState("");
  const [quorum, setQuorum] = useState("0");

  if (!isOwner) return null;

  const isPending = txStatus === "pending";

  const handleAddCandidate = async () => {
    if (!newName.trim()) return;
    const ok = await onAddCandidate(newName.trim());
    if (ok) setNewName("");
  };

  const handleStartVoting = async () => {
    const dur = duration ? parseInt(duration, 10) : 0;
    const quo = quorum ? parseInt(quorum, 10) : 0;
    const ok = await onStartVoting(dur, quo);
    if (ok) { setDuration(""); setQuorum("0"); }
  };

  return (
    <div className="admin-panel card animate-fadeInUp">
      <div className="admin-panel__header">
        <span className="admin-panel__badge">👑 Admin Panel</span>
        <span className="text-muted text-sm">Owner only</span>
      </div>

      <hr className="divider" />

      {/* Add Candidate */}
      {!votingActive && (
        <div className="admin-section">
          <h3 className="admin-section__title">Add Candidate</h3>
          <div className="admin-row">
            <input
              id="input-candidate-name"
              className="input"
              placeholder="Candidate name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCandidate()}
              maxLength={60}
            />
            <button
              id="btn-add-candidate"
              className="btn btn-primary"
              disabled={!newName.trim() || isPending}
              onClick={handleAddCandidate}
            >
              {isPending ? <span className="spinner" /> : "Add"}
            </button>
          </div>
          <p className="text-muted text-xs mt-1">
            {candidateCount} candidate(s) registered. Need ≥ 2 to start voting.
          </p>
        </div>
      )}

      {/* Start Voting */}
      {!votingActive && candidateCount >= 2 && (
        <div className="admin-section">
          <h3 className="admin-section__title">Start Voting Session</h3>
          <div className="admin-row">
            <input
              id="input-duration"
              className="input"
              type="number"
              placeholder="Duration (seconds, 0 = no limit)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={0}
            />
            <input
              id="input-quorum"
              className="input"
              type="number"
              placeholder="Min quorum (0 = none)"
              value={quorum}
              onChange={(e) => setQuorum(e.target.value)}
              min={0}
            />
          </div>
          <button
            id="btn-start-voting"
            className="btn btn-success btn-full mt-1"
            disabled={isPending}
            onClick={handleStartVoting}
          >
            {isPending ? <><span className="spinner" /> Starting...</> : "▶ Start Voting"}
          </button>
        </div>
      )}

      {/* End Voting */}
      {votingActive && (
        <div className="admin-section">
          <h3 className="admin-section__title">End Voting Session</h3>
          <button
            id="btn-end-voting"
            className="btn btn-danger btn-full"
            disabled={isPending}
            onClick={onEndVoting}
          >
            {isPending ? <><span className="spinner" /> Ending...</> : "⏹ End Voting"}
          </button>
        </div>
      )}

      {/* Reset */}
      {!votingActive && candidateCount > 0 && (
        <div className="admin-section">
          <h3 className="admin-section__title">Reset Election</h3>
          <button
            id="btn-reset-election"
            className="btn btn-outline btn-full"
            disabled={isPending}
            onClick={onReset}
          >
            🔄 Reset All Data
          </button>
          <p className="text-muted text-xs mt-1">⚠️ This clears all candidates and votes permanently.</p>
        </div>
      )}
    </div>
  );
}
