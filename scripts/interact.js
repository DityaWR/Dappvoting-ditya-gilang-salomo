const { ethers } = require("hardhat");

/**
 * interact.js  (optional)
 * -----------------------
 * Demonstrates interaction with a deployed SimpleVoting contract.
 *
 * Set CONTRACT_ADDRESS below (or pass via env variable) after running deploy.js.
 *
 * Usage:
 *   CONTRACT_ADDRESS=0x... npx hardhat run scripts/interact.js --network localhost
 */

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("============================================================");
  console.log("  SimpleVoting — Interaction Script");
  console.log("============================================================\n");

  const signers = await ethers.getSigners();
  const [owner, voter1, voter2, voter3] = signers;

  // Attach to deployed contract
  const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
  const voting = SimpleVoting.attach(CONTRACT_ADDRESS);

  // console.log("Contract address :", CONTRACT_ADDRESS); // hidden
  // console.log("Owner            :", owner.address); // hidden for privacy

  console.log("Voter1           :", voter1.address);
  console.log("Voter2           :", voter2.address);
  console.log("Voter3           :", voter3.address, "\n");

  // ── Query current state ────────────────────────────────────────────────────
  const count  = await voting.getCandidateCount();
  const active = await voting.votingActive();
  console.log(`Candidates registered : ${count}`);
  console.log(`Voting active         : ${active}\n`);

  // ── Display all candidates ─────────────────────────────────────────────────
  console.log("---- Current Candidates ----");
  for (let i = 1; i <= Number(count); i++) {
    const [id, name, votes] = await voting.getCandidate(i);
    console.log(`  [${id}] ${name.padEnd(20)} — ${votes} votes`);
  }
  console.log();

  // ── Cast some votes ────────────────────────────────────────────────────────
  if (active) {
    const alreadyVoted1 = await voting.hasVoted(voter1.address);
    if (!alreadyVoted1) {
      const tx1 = await voting.connect(voter1).vote(1);
      await tx1.wait();
      console.log(`✔ ${voter1.address} voted for candidate #1`);
    } else {
      console.log(`ℹ ${voter1.address} has already voted`);
    }

    const alreadyVoted2 = await voting.hasVoted(voter2.address);
    if (!alreadyVoted2) {
      const tx2 = await voting.connect(voter2).vote(1);
      await tx2.wait();
      console.log(`✔ ${voter2.address} voted for candidate #1`);
    } else {
      console.log(`ℹ ${voter2.address} has already voted`);
    }

    const alreadyVoted3 = await voting.hasVoted(voter3.address);
    if (!alreadyVoted3) {
      const tx3 = await voting.connect(voter3).vote(2);
      await tx3.wait();
      console.log(`✔ ${voter3.address} voted for candidate #2`);
    } else {
      console.log(`ℹ ${voter3.address} has already voted`);
    }
    console.log();
  }

  // ── Fetch results ──────────────────────────────────────────────────────────
  console.log("---- Voting Results ----");
  const [ids, names, voteCounts] = await voting.getResults();
  for (let i = 0; i < ids.length; i++) {
    console.log(`  [${ids[i]}] ${names[i].padEnd(20)} — ${voteCounts[i]} votes`);
  }
  console.log();

  // ── Fetch winner ───────────────────────────────────────────────────────────
  const [winnerId, winnerName, winnerVotes, quorumMet] = await voting.getWinner();
  console.log("---- Current Leader ----");
  console.log(`  🏆 ${winnerName} (ID: ${winnerId}) — ${winnerVotes} votes`);
  console.log(`  Quorum met: ${quorumMet}\n`);

  console.log("Interaction complete ✅");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
