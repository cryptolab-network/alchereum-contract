// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
require("dotenv").config()
const hre = require("hardhat");

const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.ETH_PUBLIC_KEY
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY

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

  const contract = require("../artifacts/contracts/ksm.sol/AltStorage.json")
  const WhiteListVerifier = await hre.ethers.getContractFactory("WhiteListVerifier");
  const wlv = await WhiteListVerifier.deploy();

  await wlv.deployed();

  const Alchereum = await hre.ethers.getContractFactory("Alchereum", {
    libraries: {
      WhiteListVerifier: wlv.address,
    },
  });
  const AltStorage = await hre.ethers.getContractFactory("AltStorage");
  const alt = await AltStorage.deploy();
  await alt.deployed();
  console.log("AltStorage deployed to:", alt.address);

  const nft = await Alchereum.deploy(["0x44541A6c3ed49bC7D36CFB464f986899Fa567753"], [100]);

  await nft.deployed();

  console.log("Alchereum deployed to:", nft.address);
    // transfer ownership of AltStorage to Alchereum
  const nftContract = new web3.eth.Contract(contract.abi, alt.address)
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce
  //the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: alt.address,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.transferOwnership(nft.address).encodeABI(),
  }
  console.log('transfer the ownership of AltStorage to Alchereum');
  const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY)
  await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction,
    function (err, hash) {
      if (!err) {
        console.log(
          "The hash of your transaction is: ",
          hash,
          "\nCheck Alchemy's Mempool to view the status of your transaction!"
        )
      } else {
        console.log(
          "Something went wrong when submitting your transaction:",
          err
        )
      }
    }
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });