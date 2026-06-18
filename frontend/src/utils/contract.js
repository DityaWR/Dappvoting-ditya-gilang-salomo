/**
 * contract.js
 * Contract address and ABI for the SimpleVoting dApp.
 *
 * After deploying with `npm run deploy`, copy the contract address here.
 * The ABI is auto-generated from the compiled artifact.
 */

export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  "function getCandidateCount() external view returns (uint256)",
  "function getCandidate(uint256 _candidateId) external view returns (uint256 id, string memory name, uint256 voteCount)",
  "function getResults() external view returns (uint256[] memory ids, string[] memory names, uint256[] memory voteCounts)",
  "function getWinner() external view returns (uint256 winnerId, string memory winnerName, uint256 winnerVotes, bool quorumMet)",
  "function vote(uint256 _candidateId) external",
  "function hasVoted(address) external view returns (bool)",
  "function voterChoice(address) external view returns (uint256)",
  "function votingActive() external view returns (bool)",
  "function votingDeadline() external view returns (uint256)",
  "function minimumQuorum() external view returns (uint256)",
  "function totalVotesCast() external view returns (uint256)",
  "function isDeadlinePassed() external view returns (bool)",
  "function isCallerOwner() external view returns (bool)",
  "function addCandidate(string calldata _name) external",
  "function startVoting(uint256 _durationSeconds, uint256 _minimumQuorum) external",
  "function endVoting() external",
  "function assignWeight(address _voter, uint256 _weight) external",
  "function resetElection() external",
  "event CandidateAdded(uint256 indexed candidateId, string name)",
  "event Voted(address indexed voter, uint256 indexed candidateId, uint256 weight)",
  "event VotingStarted(uint256 deadline, uint256 quorum)",
  "event VotingEnded(uint256 totalVotes, bool quorumMet)",
  "event WeightAssigned(address indexed voter, uint256 weight)"
];
