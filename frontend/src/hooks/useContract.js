import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";
import { parseError } from "../utils/helpers";

export function useContract(account) {
  const [candidates, setCandidates] = useState([]);
  const [votingActive, setVotingActive] = useState(false);
  const [votingDeadline, setVotingDeadline] = useState(0n);
  const [minimumQuorum, setMinimumQuorum] = useState(0n);
  const [totalVotesCast, setTotalVotesCast] = useState(0n);
  const [hasVoted, setHasVoted] = useState(false);
  const [myChoice, setMyChoice] = useState(0n);
  const [winner, setWinner] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("idle"); // idle | pending | success | error
  const [txMessage, setTxMessage] = useState("");
  const [recentVotes, setRecentVotes] = useState([]);

  const getProvider = () => new ethers.BrowserProvider(window.ethereum);

  const getReadContract = async () => {
    const provider = await getProvider();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  };

  const getWriteContract = async () => {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  const loadData = useCallback(async (currentAccount) => {
    try {
      setIsLoading(true);
      const contract = await getReadContract();

      const [active, deadline, quorum, totalVotes, count] = await Promise.all([
        contract.votingActive(),
        contract.votingDeadline(),
        contract.minimumQuorum(),
        contract.totalVotesCast(),
        contract.getCandidateCount(),
      ]);

      setVotingActive(active);
      setVotingDeadline(deadline);
      setMinimumQuorum(quorum);
      setTotalVotesCast(totalVotes);

      // Load candidates
      if (count > 0n) {
        const [ids, names, voteCounts] = await contract.getResults();
        const candidateList = ids.map((id, i) => ({
          id: Number(id),
          name: names[i],
          voteCount: voteCounts[i],
        }));
        setCandidates(candidateList);

        // Winner info
        try {
          const [wId, wName, wVotes, qMet] = await contract.getWinner();
          setWinner({ id: Number(wId), name: wName, votes: wVotes, quorumMet: qMet });
        } catch {
          setWinner(null);
        }
      } else {
        setCandidates([]);
        setWinner(null);
      }

      // Per-account data
      if (currentAccount) {
        const [voted, choice, ownerCheck] = await Promise.all([
          contract.hasVoted(currentAccount),
          contract.voterChoice(currentAccount),
          contract.isCallerOwner(),
        ]);
        setHasVoted(voted);
        setMyChoice(choice);
        setIsOwner(ownerCheck);
      } else {
        setHasVoted(false);
        setMyChoice(0n);
        setIsOwner(false);
      }

      // Load recent Voted events (last 20)
      const provider = await getProvider();
      const filter = contract.filters.Voted();
      const latest = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latest - 500);
      try {
        const events = await contract.queryFilter(filter, fromBlock, "latest");
        const recent = events.slice(-20).reverse().map((e) => ({
          voter: e.args.voter,
          candidateId: Number(e.args.candidateId),
          weight: Number(e.args.weight),
          txHash: e.transactionHash,
          block: e.blockNumber,
        }));
        setRecentVotes(recent);
      } catch {
        setRecentVotes([]);
      }
    } catch (e) {
      console.error("loadData error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const castVote = useCallback(async (candidateId) => {
    setTxStatus("pending");
    setTxMessage("Waiting for MetaMask confirmation...");
    try {
      const contract = await getWriteContract();
      const tx = await contract.vote(candidateId);
      setTxMessage("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      setTxStatus("success");
      setTxMessage(`✅ Vote cast successfully for candidate #${candidateId}!`);
      return true;
    } catch (e) {
      setTxStatus("error");
      setTxMessage(parseError(e));
      return false;
    }
  }, []);

  const addCandidate = useCallback(async (name) => {
    setTxStatus("pending");
    setTxMessage("Adding candidate...");
    try {
      const contract = await getWriteContract();
      const tx = await contract.addCandidate(name);
      await tx.wait();
      setTxStatus("success");
      setTxMessage(`✅ Candidate "${name}" added!`);
      return true;
    } catch (e) {
      setTxStatus("error");
      setTxMessage(parseError(e));
      return false;
    }
  }, []);

  const startVoting = useCallback(async (durationSeconds, quorum) => {
    setTxStatus("pending");
    setTxMessage("Starting voting session...");
    try {
      const contract = await getWriteContract();
      const tx = await contract.startVoting(durationSeconds, quorum);
      await tx.wait();
      setTxStatus("success");
      setTxMessage("✅ Voting session started!");
      return true;
    } catch (e) {
      setTxStatus("error");
      setTxMessage(parseError(e));
      return false;
    }
  }, []);

  const endVoting = useCallback(async () => {
    setTxStatus("pending");
    setTxMessage("Ending voting session...");
    try {
      const contract = await getWriteContract();
      const tx = await contract.endVoting();
      await tx.wait();
      setTxStatus("success");
      setTxMessage("✅ Voting session ended!");
      return true;
    } catch (e) {
      setTxStatus("error");
      setTxMessage(parseError(e));
      return false;
    }
  }, []);

  const resetElection = useCallback(async () => {
    setTxStatus("pending");
    setTxMessage("Resetting election...");
    try {
      const contract = await getWriteContract();
      const tx = await contract.resetElection();
      await tx.wait();
      setTxStatus("success");
      setTxMessage("✅ Election reset!");
      return true;
    } catch (e) {
      setTxStatus("error");
      setTxMessage(parseError(e));
      return false;
    }
  }, []);

  const clearTxStatus = useCallback(() => {
    setTxStatus("idle");
    setTxMessage("");
  }, []);

  return {
    candidates,
    votingActive,
    votingDeadline,
    minimumQuorum,
    totalVotesCast,
    hasVoted,
    myChoice,
    winner,
    isOwner,
    isLoading,
    txStatus,
    txMessage,
    recentVotes,
    loadData,
    castVote,
    addCandidate,
    startVoting,
    endVoting,
    resetElection,
    clearTxStatus,
  };
}
