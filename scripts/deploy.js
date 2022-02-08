// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Alchereum = await hre.ethers.getContractFactory("Alchereum");
  const nft = await Alchereum.deploy(["0x44541A6c3ed49bC7D36CFB464f986899Fa567753", "0x0c1cf31A3260c4F5c1e79ba2196617Eb070b6EE5"], [80, 20]);

  await nft.deployed();

  console.log("Alchereum deployed to:", nft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });