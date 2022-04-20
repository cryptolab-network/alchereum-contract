// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
require("dotenv").config()
const hre = require("hardhat");

const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.ETH_PUBLIC_KEY_DEPLOY_CONTRACT
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY_DEPLOY_CONTRACT

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
  // const web3 = createAlchemyWeb3(API_URL)
  const Web3 = require('web3');
  const web3 = new Web3(new Web3.providers.HttpProvider(API_URL));

  const contract = require("../artifacts/contracts/altStorage.sol/AltStorage.json")
  const WhiteListVerifier = await hre.ethers.getContractFactory("WhiteListVerifier");
  const wlv = await WhiteListVerifier.deploy();

  await wlv.deployed();

  const Alchereum = await hre.ethers.getContractFactory("Alcheneko", {
    libraries: {
      WhiteListVerifier: wlv.address,
    },
  });

  const nft = await Alchereum.deploy();

  await nft.deployed();

  console.log("Alcheneko deployed to:", nft.address);
  console.log("Whitelist Verifier deployed to:", wlv.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });