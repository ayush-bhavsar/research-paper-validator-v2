const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PaperValidator contract...");

  // Get the ContractFactory and Signers here
  const PaperValidator = await ethers.getContractFactory("PaperValidator");
  const paperValidator = await PaperValidator.deploy();

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