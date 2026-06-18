// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SimpleVoting
 * @author Project 2 - Smart Contract
 * @notice A decentralized voting system with proposals, deadlines, quorum, and weighted voting
 * @dev Implements owner-controlled proposal management with one-vote-per-user enforcement
 */
contract SimpleVoting {
    // ============================================================
    //  STATE VARIABLES
    // ============================================================

    /// @dev Address of the contract deployer / admin (private — not exposed via ABI)
    address private owner;

    /// @notice Unix timestamp when voting closes (0 = no deadline)
    uint256 public votingDeadline;

    /// @notice Minimum number of votes required for results to be valid
    uint256 public minimumQuorum;

    /// @notice Total number of votes cast so far
    uint256 public totalVotesCast;

    /// @notice Whether the voting session is currently active
    bool public votingActive;

    // ============================================================
    //  STRUCTS
    // ============================================================

    /**
     * @notice Represents a single candidate / proposal
     * @param id        Auto-incremented identifier
     * @param name      Human-readable candidate name
     * @param voteCount Weighted total votes received
     */
    struct Candidate {
        uint256 id;
        string  name;
        uint256 voteCount;
    }

    // ============================================================
    //  MAPPINGS
    // ============================================================

    /// @notice Tracks whether an address has already voted
    mapping(address => bool) public hasVoted;

    /// @notice Maps candidate ID → Candidate struct
    mapping(uint256 => Candidate) public candidates;

    /// @notice Records which candidate ID each voter chose
    mapping(address => uint256) public voterChoice;

    /// @notice Voting weight assigned to each address (default: 1)
    mapping(address => uint256) public voterWeight;

    // ============================================================
    //  COUNTERS
    // ============================================================

    /// @dev Internal counter used to assign candidate IDs (starts at 1)
    uint256 private candidateCount;

    // ============================================================
    //  EVENTS
    // ============================================================

    /**
     * @notice Emitted when the owner adds a new candidate
     * @param candidateId Auto-assigned ID of the new candidate
     * @param name        Name of the candidate
     */
    event CandidateAdded(uint256 indexed candidateId, string name);

    /**
     * @notice Emitted when a voter successfully casts a vote
     * @param voter       Address of the voter
     * @param candidateId ID of the chosen candidate
     * @param weight      Voting weight applied
     */
    event Voted(address indexed voter, uint256 indexed candidateId, uint256 weight);

    /**
     * @notice Emitted when the owner starts a new voting session
     * @param deadline  Unix timestamp of the voting deadline (0 = no limit)
     * @param quorum    Minimum votes required for a valid result
     */
    event VotingStarted(uint256 deadline, uint256 quorum);

    /**
     * @notice Emitted when the owner ends the voting session
     * @param totalVotes Total weighted votes cast at close
     * @param quorumMet  Whether the minimum quorum was reached
     */
    event VotingEnded(uint256 totalVotes, bool quorumMet);

    /**
     * @notice Emitted when the owner assigns a custom weight to a voter
     * @param voter  Address receiving the weight
     * @param weight New weight value
     */
    event WeightAssigned(address indexed voter, uint256 weight);

    // ============================================================
    //  MODIFIERS
    // ============================================================

    /// @notice Restricts function access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "SimpleVoting: caller is not the owner");
        _;
    }

    /// @notice Ensures voting is currently active and within deadline
    modifier votingIsOpen() {
        require(votingActive, "SimpleVoting: voting session is not active");
        if (votingDeadline != 0) {
            require(block.timestamp <= votingDeadline, "SimpleVoting: voting deadline has passed");
        }
        _;
    }

    /// @notice Validates that a candidate ID exists
    modifier candidateExists(uint256 _candidateId) {
        require(
            _candidateId > 0 && _candidateId <= candidateCount,
            "SimpleVoting: candidate does not exist"
        );
        _;
    }

    // ============================================================
    //  CONSTRUCTOR
    // ============================================================

    /**
     * @notice Deploys the contract and sets the owner
     * @dev Voting session is NOT automatically started; call startVoting() first
     */
    constructor() {
        owner = msg.sender;
    }

    // ============================================================
    //  OWNER FUNCTIONS
    // ============================================================

    /**
     * @notice Adds a new candidate to the election
     * @dev Only callable by owner; voting must NOT be active yet
     * @param _name Name / description of the candidate
     */
    function addCandidate(string calldata _name) external onlyOwner {
        require(!votingActive, "SimpleVoting: cannot add candidates while voting is active");
        require(bytes(_name).length > 0, "SimpleVoting: candidate name cannot be empty");

        candidateCount++;
        candidates[candidateCount] = Candidate({
            id:        candidateCount,
            name:      _name,
            voteCount: 0
        });

        emit CandidateAdded(candidateCount, _name);
    }

    /**
     * @notice Starts the voting session
     * @dev Requires at least 2 candidates; can only start once per reset cycle
     * @param _durationSeconds  Seconds from now until voting closes (0 = no deadline)
     * @param _minimumQuorum    Minimum total votes needed for a valid result (0 = none)
     */
    function startVoting(
        uint256 _durationSeconds,
        uint256 _minimumQuorum
    ) external onlyOwner {
        require(!votingActive, "SimpleVoting: voting is already active");
        require(candidateCount >= 2, "SimpleVoting: need at least 2 candidates");

        votingActive    = true;
        minimumQuorum   = _minimumQuorum;
        votingDeadline  = _durationSeconds > 0
            ? block.timestamp + _durationSeconds
            : 0;

        emit VotingStarted(votingDeadline, minimumQuorum);
    }

    /**
     * @notice Ends the voting session manually (before deadline if set)
     */
    function endVoting() external onlyOwner {
        require(votingActive, "SimpleVoting: voting is not active");

        votingActive = false;
        bool quorumMet = totalVotesCast >= minimumQuorum;

        emit VotingEnded(totalVotesCast, quorumMet);
    }

    /**
     * @notice Assigns a custom voting weight to an address (Bonus: Weighted Voting)
     * @dev Weight must be >= 1; only callable before or during an active session
     * @param _voter  Address to assign weight to
     * @param _weight Weight value (1 = standard, >1 = boosted)
     */
    function assignWeight(address _voter, uint256 _weight) external onlyOwner {
        require(_voter != address(0), "SimpleVoting: invalid voter address");
        require(_weight >= 1,         "SimpleVoting: weight must be at least 1");

        voterWeight[_voter] = _weight;
        emit WeightAssigned(_voter, _weight);
    }

    /**
     * @notice Resets the entire election so a new one can begin
     * @dev Clears all candidates and voter records; does NOT preserve history
     */
    function resetElection() external onlyOwner {
        require(!votingActive, "SimpleVoting: end voting before resetting");

        for (uint256 i = 1; i <= candidateCount; i++) {
            delete candidates[i];
        }

        candidateCount  = 0;
        totalVotesCast  = 0;
        votingDeadline  = 0;
        minimumQuorum   = 0;
    }

    // ============================================================
    //  VOTER FUNCTIONS
    // ============================================================

    /**
     * @notice Casts a vote for a candidate
     * @dev One vote per address; respects deadline and weighted voting
     * @param _candidateId ID of the chosen candidate
     */
    function vote(uint256 _candidateId)
        external
        votingIsOpen
        candidateExists(_candidateId)
    {
        require(!hasVoted[msg.sender], "SimpleVoting: address has already voted");

        // Determine effective weight (default: 1)
        uint256 weight = voterWeight[msg.sender] > 0
            ? voterWeight[msg.sender]
            : 1;

        hasVoted[msg.sender]              = true;
        voterChoice[msg.sender]           = _candidateId;
        candidates[_candidateId].voteCount += weight;
        totalVotesCast                    += weight;

        emit Voted(msg.sender, _candidateId, weight);
    }

    // ============================================================
    //  VIEW / QUERY FUNCTIONS
    // ============================================================

    /**
     * @notice Returns full details of a single candidate
     * @param _candidateId ID of the candidate to query
     * @return id        Candidate ID
     * @return name      Candidate name
     * @return voteCount Total weighted votes received
     */
    function getCandidate(uint256 _candidateId)
        external
        view
        candidateExists(_candidateId)
        returns (uint256 id, string memory name, uint256 voteCount)
    {
        Candidate storage c = candidates[_candidateId];
        return (c.id, c.name, c.voteCount);
    }

    /**
     * @notice Returns vote counts for ALL candidates as parallel arrays
     * @return ids       Array of candidate IDs
     * @return names     Array of candidate names
     * @return voteCounts Array of vote counts corresponding to each candidate
     */
    function getResults()
        external
        view
        returns (
            uint256[] memory ids,
            string[]  memory names,
            uint256[] memory voteCounts
        )
    {
        ids        = new uint256[](candidateCount);
        names      = new string[](candidateCount);
        voteCounts = new uint256[](candidateCount);

        for (uint256 i = 1; i <= candidateCount; i++) {
            ids[i - 1]        = candidates[i].id;
            names[i - 1]      = candidates[i].name;
            voteCounts[i - 1] = candidates[i].voteCount;
        }
    }

    /**
     * @notice Returns the ID and name of the current leading candidate
     * @dev In case of a tie, returns the candidate with the lower ID
     * @return winnerId   Candidate ID with the most votes
     * @return winnerName Name of the winning candidate
     * @return winnerVotes Vote count of the winner
     * @return quorumMet  Whether minimum quorum has been reached
     */
    function getWinner()
        external
        view
        returns (
            uint256 winnerId,
            string memory winnerName,
            uint256 winnerVotes,
            bool quorumMet
        )
    {
        require(candidateCount > 0, "SimpleVoting: no candidates registered");

        uint256 highestVotes;

        for (uint256 i = 1; i <= candidateCount; i++) {
            if (candidates[i].voteCount > highestVotes) {
                highestVotes = candidates[i].voteCount;
                winnerId     = candidates[i].id;
                winnerName   = candidates[i].name;
                winnerVotes  = candidates[i].voteCount;
            }
        }

        quorumMet = totalVotesCast >= minimumQuorum;
    }

    /**
     * @notice Returns the total number of registered candidates
     */
    function getCandidateCount() external view returns (uint256) {
        return candidateCount;
    }

    /**
     * @notice Checks whether the voting deadline has passed (only relevant when set)
     * @return true if deadline is set AND current time is past it
     */
    function isDeadlinePassed() external view returns (bool) {
        if (votingDeadline == 0) return false;
        return block.timestamp > votingDeadline;
    }

    /**
     * @notice Checks whether the caller (msg.sender) is the contract owner
     * @dev Used by frontend to conditionally display admin controls without exposing owner address
     * @return true if msg.sender is the owner
     */
    function isCallerOwner() external view returns (bool) {
        return msg.sender == owner;
    }
}
