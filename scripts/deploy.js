const hre = require("hardhat");

async function main() {
  console.log("Deploying PaperValidator contract...");

  // Get the signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get the ContractFactory
  const PaperValidator = await hre.ethers.getContractFactory("PaperValidator");
  console.log("Deploying contract...");
  const paperValidator = await PaperValidator.connect(deployer).deploy();

  await paperValidator.deployed();

  console.log("PaperValidator deployed to:", paperValidator.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });