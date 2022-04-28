require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.ETH_PUBLIC_KEY_DEPLOY_CONTRACT
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY_DEPLOY_CONTRACT

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../../artifacts/contracts/alcheneko.sol/Alcheneko.json")
const nftContract = new web3.eth.Contract(contract.abi,process.env.CONTRACT_ADDRESS)

async function transferOwnership() {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce
  // const balance = await nftContract.methods.shares(PUBLIC_KEY).call();
  // console.log(balance);
  //the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: process.env.CONTRACT_ADDRESS,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.transferOwnership("0x4918688624945E4008Fbca40B1018743979C5Eee").encodeABI(),
  }
  console.log(tx);
}

(async () => {

  await transferOwnership();
})();