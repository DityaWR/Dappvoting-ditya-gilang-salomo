import { useEffect } from "react";
import "./TransactionToast.css";

export default function TransactionToast({ txStatus, txMessage, onClose }) {
  useEffect(() => {
    if (txStatus === "success" || txStatus === "error") {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [txStatus, txMessage, onClose]);

  if (txStatus === "idle") return null;

  const icon = txStatus === "pending" ? "⏳" : txStatus === "success" ? "✅" : "❌";
  const cls  = txStatus === "pending" ? "toast--pending" : txStatus === "success" ? "toast--success" : "toast--error";

  return (
    <div className={`toast animate-fadeInUp ${cls}`} role="alert" aria-live="polite">
      <span className="toast__icon">{icon}</span>
      <div className="toast__body">
        <p className="toast__title">
          {txStatus === "pending" ? "Transaction Pending" : txStatus === "success" ? "Success" : "Transaction Failed"}
        </p>
        <p className="toast__msg">{txMessage}</p>
      </div>
      {txStatus !== "pending" && (
        <button className="toast__close" onClick={onClose} aria-label="Close">✕</button>
      )}
      {txStatus === "pending" && <span className="toast__spinner spinner" />}
    </div>
  );
}
