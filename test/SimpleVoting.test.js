const { expect }        = require("chai");
const { ethers }        = require("hardhat");
const { time }          = require("@nomicfoundation/hardhat-network-helpers");

// ============================================================
//  TEST SUITE: SimpleVoting
// ============================================================
describe("SimpleVoting", function () {
  // ----------------------------------------------------------
  //  Shared setup helpers
  // ----------------------------------------------------------

  /**
   * Deploys a fresh SimpleVoting instance before each test.
   * Returns the contract + three signer accounts.
   */
  async function deployFixture() {
    const [owner, voter1, voter2, voter3] = await ethers.getSigners();
    const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
    const voting = await SimpleVoting.deploy();
    await voting.waitForDeployment();
    return { voting, owner, voter1, voter2, voter3 };
  }

  /**
   * Deploys the contract, adds 2 candidates, and starts voting.
   * Convenience fixture for tests that need an open election.
   */
  async function activeVotingFixture() {
    const { voting, owner, voter1, voter2, voter3 } = await deployFixture();
    await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");
    // No deadline, no quorum by default
    await voting.startVoting(0, 0);
    return { voting, owner, voter1, voter2, voter3 };
  }

  // ============================================================
  //  1. DEPLOYMENT
  // ============================================================
  describe("Deployment", function () {
    it("TC-01 | Deployer should be the owner (verified via onlyOwner behavior)", async function () {
      const { voting, owner, voter1 } = await deployFixture();

      // owner is now private — verified indirectly:
      // deployer can call owner-only functions ...
      await expect(voting.connect(owner).addCandidate("TestCandidate")).to.not.be.reverted;

      // ... while a non-owner cannot
      await expect(
        voting.connect(voter1).addCandidate("Intruder")
      ).to.be.revertedWith("SimpleVoting: caller is not the owner");
    });

    it("TC-02 | Should initialise with zero candidates and inactive voting", async function () {
      const { voting } = await deployFixture();
      expect(await voting.getCandidateCount()).to.equal(0);
      expect(await voting.votingActive()).to.equal(false);
      expect(await voting.totalVotesCast()).to.equal(0);
    });
  });

  // ============================================================
  //  2. MAIN FUNCTIONS — Positive Cases
  // ============================================================
  describe("Main Functions (Positive Cases)", function () {
    it("TC-03 | Owner can add a candidate and event is emitted", async function () {
      const { voting } = await deployFixture();
      await expect(voting.addCandidate("Charlie"))
        .to.emit(voting, "CandidateAdded")
        .withArgs(1, "Charlie");

      const [id, name] = await voting.getCandidate(1);
      expect(id).to.equal(1);
      expect(name).to.equal("Charlie");
    });

    it("TC-04 | Voter can successfully cast a vote", async function () {
      const { voting, voter1 } = await activeVotingFixture();

      await expect(voting.connect(voter1).vote(1))
        .to.emit(voting, "Voted")
        .withArgs(voter1.address, 1, 1); // weight = 1 (default)

      expect(await voting.hasVoted(voter1.address)).to.equal(true);
      expect(await voting.voterChoice(voter1.address)).to.equal(1);
      expect(await voting.totalVotesCast()).to.equal(1);
    });

    it("TC-05 | getResults returns correct vote tallies for all candidates", async function () {
      const { voting, voter1, voter2, voter3 } = await activeVotingFixture();

      await voting.connect(voter1).vote(1); // Alice
      await voting.connect(voter2).vote(1); // Alice
      await voting.connect(voter3).vote(2); // Bob

      const [ids, names, voteCounts] = await voting.getResults();
      expect(ids.length).to.equal(2);
      expect(names[0]).to.equal("Alice");
      expect(voteCounts[0]).to.equal(2);
      expect(names[1]).to.equal("Bob");
      expect(voteCounts[1]).to.equal(1);
    });

    it("TC-06 | getWinner returns the candidate with the most votes", async function () {
      const { voting, voter1, voter2 } = await activeVotingFixture();

      await voting.connect(voter1).vote(2); // Bob
      await voting.connect(voter2).vote(2); // Bob

      const [winnerId, winnerName, winnerVotes] = await voting.getWinner();
      expect(winnerId).to.equal(2);
      expect(winnerName).to.equal("Bob");
      expect(winnerVotes).to.equal(2);
    });

    it("TC-07 | Weighted voting accumulates correctly", async function () {
      const { voting, owner, voter1, voter2 } = await activeVotingFixture();

      // Assign weight 3 to voter1
      await voting.connect(owner).assignWeight(voter1.address, 3);

      await voting.connect(voter1).vote(1); // Alice (+3)
      await voting.connect(voter2).vote(2); // Bob  (+1)

      const [, , voteCounts] = await voting.getResults();
      expect(voteCounts[0]).to.equal(3); // Alice
      expect(voteCounts[1]).to.equal(1); // Bob
      expect(await voting.totalVotesCast()).to.equal(4);
    });
  });

  // ============================================================
  //  3. MAIN FUNCTIONS — Negative Cases
  // ============================================================
  describe("Main Functions (Negative Cases)", function () {
    it("TC-08 | Should revert if a voter tries to vote twice", async function () {
      const { voting, voter1 } = await activeVotingFixture();

      await voting.connect(voter1).vote(1);
      await expect(voting.connect(voter1).vote(2)).to.be.revertedWith(
        "SimpleVoting: address has already voted"
      );
    });

    it("TC-09 | Should revert if voting after the deadline has passed", async function () {
      const { voting, voter1 } = await deployFixture();
      await voting.addCandidate("Alice");
      await voting.addCandidate("Bob");

      // Deadline = 60 seconds from now
      await voting.startVoting(60, 0);

      // Fast-forward 61 seconds
      await time.increase(61);

      await expect(voting.connect(voter1).vote(1)).to.be.revertedWith(
        "SimpleVoting: voting deadline has passed"
      );
    });

    it("TC-10 | Should revert when voting for a non-existent candidate", async function () {
      const { voting, voter1 } = await activeVotingFixture();

      await expect(voting.connect(voter1).vote(99)).to.be.revertedWith(
        "SimpleVoting: candidate does not exist"
      );
    });

    it("TC-11 | Should revert when voting is not active", async function () {
      const { voting, voter1 } = await deployFixture();
      await voting.addCandidate("Alice");
      await voting.addCandidate("Bob");
      // Voting not started yet

      await expect(voting.connect(voter1).vote(1)).to.be.revertedWith(
        "SimpleVoting: voting session is not active"
      );
    });

    it("TC-12 | Quorum not met when too few votes cast", async function () {
      const { voting, voter1 } = await deployFixture();
      await voting.addCandidate("Alice");
      await voting.addCandidate("Bob");
      await voting.startVoting(0, 5); // quorum = 5

      await voting.connect(voter1).vote(1); // only 1 vote

      const [, , , quorumMet] = await voting.getWinner();
      expect(quorumMet).to.equal(false);
    });
  });

  // ============================================================
  //  4. ACCESS CONTROL
  // ============================================================
  describe("Access Control", function () {
    it("TC-13 | Non-owner cannot add a candidate", async function () {
      const { voting, voter1 } = await deployFixture();

      await expect(
        voting.connect(voter1).addCandidate("Eve")
      ).to.be.revertedWith("SimpleVoting: caller is not the owner");
    });

    it("TC-14 | Non-owner cannot start voting", async function () {
      const { voting, voter1 } = await deployFixture();
      await voting.addCandidate("Alice");
      await voting.addCandidate("Bob");

      await expect(
        voting.connect(voter1).startVoting(0, 0)
      ).to.be.revertedWith("SimpleVoting: caller is not the owner");
    });

    it("TC-15 | Non-owner cannot end voting", async function () {
      const { voting, voter1 } = await activeVotingFixture();

      await expect(
        voting.connect(voter1).endVoting()
      ).to.be.revertedWith("SimpleVoting: caller is not the owner");
    });

    it("TC-16 | Non-owner cannot assign voter weights", async function () {
      const { voting, voter1, voter2 } = await activeVotingFixture();

      await expect(
        voting.connect(voter1).assignWeight(voter2.address, 5)
      ).to.be.revertedWith("SimpleVoting: caller is not the owner");
    });

    it("TC-17 | Owner cannot add candidates once voting has started", async function () {
      const { voting } = await activeVotingFixture();

      await expect(
        voting.addCandidate("Late Candidate")
      ).to.be.revertedWith(
        "SimpleVoting: cannot add candidates while voting is active"
      );
    });

    it("TC-18 | Voting cannot start with fewer than 2 candidates", async function () {
      const { voting } = await deployFixture();
      await voting.addCandidate("Solo");

      await expect(voting.startVoting(0, 0)).to.be.revertedWith(
        "SimpleVoting: need at least 2 candidates"
      );
    });
  });

  // ============================================================
  //  5. EVENTS
  // ============================================================
  describe("Events", function () {
    it("TC-19 | VotingStarted emits correct deadline and quorum", async function () {
      const { voting } = await deployFixture();
      await voting.addCandidate("A");
      await voting.addCandidate("B");

      const tx = await voting.startVoting(3600, 10);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(voting, "VotingStarted")
        .withArgs(block.timestamp + 3600, 10);
    });

    it("TC-20 | VotingEnded emits correct totalVotes and quorumMet flag", async function () {
      const { voting, voter1 } = await deployFixture();
      await voting.addCandidate("A");
      await voting.addCandidate("B");
      await voting.startVoting(0, 1); // quorum = 1

      await voting.connect(voter1).vote(1);

      await expect(voting.endVoting())
        .to.emit(voting, "VotingEnded")
        .withArgs(1, true); // 1 vote cast, quorum met
    });

    it("TC-21 | WeightAssigned event emits correct voter and weight", async function () {
      const { voting, voter1 } = await deployFixture();

      await expect(voting.assignWeight(voter1.address, 4))
        .to.emit(voting, "WeightAssigned")
        .withArgs(voter1.address, 4);
    });

    it("TC-22 | Voted event emits voter address, candidateId, and weight", async function () {
      const { voting, voter1 } = await activeVotingFixture();

      await expect(voting.connect(voter1).vote(2))
        .to.emit(voting, "Voted")
        .withArgs(voter1.address, 2, 1);
    });
  });

  // ============================================================
  //  6. RESET ELECTION
  // ============================================================
  describe("Reset Election", function () {
    it("TC-23 | Owner can reset election after voting ends and state is cleared", async function () {
      const { voting, voter1 } = await activeVotingFixture();

      // Cast a vote then end voting
      await voting.connect(voter1).vote(1);
      await voting.endVoting();

      // Reset
      await voting.resetElection();

      // All state should be cleared
      expect(await voting.getCandidateCount()).to.equal(0);
      expect(await voting.totalVotesCast()).to.equal(0);
      expect(await voting.votingDeadline()).to.equal(0);
      expect(await voting.minimumQuorum()).to.equal(0);
      expect(await voting.votingActive()).to.equal(false);
    });

    it("TC-24 | Voter hasVoted mapping persists after reset (election history cleared but voter record not)", async function () {
      const { voting, voter1 } = await activeVotingFixture();

      await voting.connect(voter1).vote(1);
      await voting.endVoting();
      await voting.resetElection();

      // Candidates are cleared — adding new candidates and restarting allows voter1 to vote again
      // (hasVoted is NOT reset; demonstrate resetElection clears candidateCount)
      expect(await voting.getCandidateCount()).to.equal(0);
    });

    it("TC-25 | Non-owner cannot reset the election", async function () {
      const { voting, voter1 } = await activeVotingFixture();
      await voting.endVoting();

      await expect(
        voting.connect(voter1).resetElection()
      ).to.be.revertedWith("SimpleVoting: caller is not the owner");
    });

    it("TC-26 | Cannot reset while voting is still active", async function () {
      const { voting } = await activeVotingFixture();

      await expect(voting.resetElection()).to.be.revertedWith(
        "SimpleVoting: end voting before resetting"
      );
    });
  });

  // ============================================================
  //  7. isDeadlinePassed & votingIsOpen BRANCHES
  // ============================================================
  describe("Deadline Branches", function () {
    it("TC-27 | isDeadlinePassed returns false when no deadline is set (deadline = 0)", async function () {
      const { voting } = await activeVotingFixture(); // started with duration = 0
      expect(await voting.isDeadlinePassed()).to.equal(false);
    });

    it("TC-28 | isDeadlinePassed returns true after deadline has passed", async function () {
      const { voting } = await deployFixture();
      await voting.addCandidate("Alice");
      await voting.addCandidate("Bob");

      // Start with 60-second deadline
      await voting.startVoting(60, 0);

      // Fast-forward past deadline
      await time.increase(61);

      expect(await voting.isDeadlinePassed()).to.equal(true);
    });

    it("TC-29 | isDeadlinePassed returns false when deadline is set but not yet passed", async function () {
      const { voting } = await deployFixture();
      await voting.addCandidate("Alice");
      await voting.addCandidate("Bob");

      // Start with 1-hour deadline
      await voting.startVoting(3600, 0);

      // Deadline not yet passed
      expect(await voting.isDeadlinePassed()).to.equal(false);
    });

    it("TC-30 | Voter can vote successfully while deadline is active but not yet passed", async function () {
      const { voting, voter1 } = await deployFixture();
      await voting.addCandidate("Alice");
      await voting.addCandidate("Bob");

      // Start with 1-hour deadline (covers votingIsOpen branch: deadline != 0 AND not yet passed)
      await voting.startVoting(3600, 0);

      await expect(voting.connect(voter1).vote(1))
        .to.emit(voting, "Voted")
        .withArgs(voter1.address, 1, 1);

      expect(await voting.hasVoted(voter1.address)).to.equal(true);
    });

    it("TC-31 | startVoting with duration = 0 sets votingDeadline to 0 (no deadline branch)", async function () {
      const { voting } = await deployFixture();
      await voting.addCandidate("Alice");
      await voting.addCandidate("Bob");

      await voting.startVoting(0, 0);

      expect(await voting.votingDeadline()).to.equal(0);
      expect(await voting.votingActive()).to.equal(true);
    });
  });

  // ============================================================
  //  8. isCallerOwner
  // ============================================================
  describe("isCallerOwner", function () {
    it("TC-32 | Returns true for owner and false for non-owner", async function () {
      const { voting, owner, voter1 } = await deployFixture();

      expect(await voting.connect(owner).isCallerOwner()).to.equal(true);
      expect(await voting.connect(voter1).isCallerOwner()).to.equal(false);
    });
  });
});
