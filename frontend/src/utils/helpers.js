/**
 * helpers.js
 * Utility functions for the Voting dApp frontend.
 */

/**
 * Shortens an Ethereum address for display.
 * e.g. 0xf39Fd6...92266
 */
export function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formats a Unix timestamp into a human-readable date/time string.
 */
export function formatDeadline(timestamp) {
  if (!timestamp || timestamp === 0n || timestamp === 0) return "No deadline";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Returns countdown parts { days, hours, minutes, seconds } from a Unix deadline.
 * Returns null if deadline is 0 or has passed.
 */
export function getCountdownParts(deadline) {
  if (!deadline || deadline === 0n || deadline === 0) return null;
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(deadline) - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  return { days, hours, minutes, seconds };
}

/**
 * Calculates the percentage of votes a candidate has.
 */
export function getVotePercent(candidateVotes, totalVotes) {
  if (!totalVotes || totalVotes === 0n || totalVotes === 0) return 0;
  return Math.round((Number(candidateVotes) / Number(totalVotes)) * 100);
}

/**
 * Truncates an error message for user-friendly display.
 */
export function parseError(error) {
  if (!error) return "An unknown error occurred.";
  // MetaMask user rejection
  if (error.code === 4001 || error.message?.includes("user rejected")) {
    return "Transaction cancelled by user.";
  }
  // Contract revert with reason
  const revertMatch = error.message?.match(/reason="([^"]+)"/);
  if (revertMatch) return revertMatch[1];
  const revertMatch2 = error.message?.match(/reverted with reason string '([^']+)'/);
  if (revertMatch2) return revertMatch2[1];
  // Generic
  if (error.message && error.message.length < 120) return error.message;
  return "Transaction failed. Check console for details.";
}

/** Hardhat local network chain ID */
export const HARDHAT_CHAIN_ID = 31337;
export const HARDHAT_CHAIN_ID_HEX = "0x7a69";
