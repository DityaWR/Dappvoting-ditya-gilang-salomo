const { ethers } = require("hardhat");

/**
 * deploy.js
 * ---------
 * Deploys SimpleVoting to the configured network (default: localhost).
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network localhost
 */
async function main() {
  console.log("============================================================");
  console.log("  SimpleVoting — Deployment Script");
  console.log("============================================================\n");

  // Retrieve deployer account
  const [deployer] = await ethers.getSigners();
  const balance    = await ethers.provider.getBalance(deployer.address);

  console.log("Deployer address :", deployer.address);
  console.log("Account balance  :", ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  console.log("Deploying SimpleVoting ...");
  const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
  const voting       = await SimpleVoting.deploy();
  await voting.waitForDeployment();

  const contractAddress = await voting.getAddress();

  console.log("✅ SimpleVoting deployed successfully!");
  console.log("------------------------------------------------------------");
  console.log("Contract address :", contractAddress);
  console.log("Network          :", (await ethers.provider.getNetwork()).name);
  console.log("Block number     :", await ethers.provider.getBlockNumber());
  console.log("------------------------------------------------------------\n");

  // Seed example data so the contract is ready to interact with
  console.log("Seeding initial candidates ...");
  const tx1 = await voting.addCandidate("Alice Johnson");
  await tx1.wait();
  console.log('  ✔ Candidate added: "Alice Johnson"');

  const tx2 = await voting.addCandidate("Bob Smith");
  await tx2.wait();
  console.log('  ✔ Candidate added: "Bob Smith"');

  const tx3 = await voting.addCandidate("Carol White");
  await tx3.wait();
  console.log('  ✔ Candidate added: "Carol White"\n');

  // Start a 1-hour voting session with a quorum of 2
  const ONE_HOUR = 3600;
  const QUORUM   = 2;
  const tx4 = await voting.startVoting(ONE_HOUR, QUORUM);
  await tx4.wait();
  console.log(`✅ Voting session started (deadline: ${ONE_HOUR}s, quorum: ${QUORUM})\n`);

  console.log("============================================================");
  console.log("  NEXT STEPS");
  console.log("============================================================");
  console.log("1. Copy the contract address above into MetaMask or interact.js");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Import account from Hardhat node into MetaMask:");
  console.log("   Network  : http://127.0.0.1:8545  |  Chain ID: 31337");
  console.log("3. Run interaction script:");
  console.log("   npx hardhat run scripts/interact.js --network localhost\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
