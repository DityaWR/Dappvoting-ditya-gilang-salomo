import { useState, useEffect } from "react";
import { getCountdownParts } from "../utils/helpers";
import "./DeadlineCountdown.css";

export default function DeadlineCountdown({ deadline }) {
  const [parts, setParts] = useState(() => getCountdownParts(deadline));

  useEffect(() => {
    const id = setInterval(() => {
      setParts(getCountdownParts(deadline));
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!parts) {
    return <p className="countdown-expired">⏰ Deadline has passed</p>;
  }

  return (
    <div className="countdown">
      <span className="countdown__label">Time remaining</span>
      <div className="countdown__boxes">
        {parts.days > 0 && (
          <div className="countdown__unit">
            <span className="countdown__value">{String(parts.days).padStart(2, "0")}</span>
            <span className="countdown__sub">days</span>
          </div>
        )}
        <div className="countdown__unit">
          <span className="countdown__value">{String(parts.hours).padStart(2, "0")}</span>
          <span className="countdown__sub">hrs</span>
        </div>
        <div className="countdown__unit">
          <span className="countdown__value">{String(parts.minutes).padStart(2, "0")}</span>
          <span className="countdown__sub">min</span>
        </div>
        <div className="countdown__unit">
          <span className="countdown__value">{String(parts.seconds).padStart(2, "0")}</span>
          <span className="countdown__sub">sec</span>
        </div>
      </div>
    </div>
  );
}
