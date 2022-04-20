require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.ETH_PUBLIC_KEY
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../../artifacts/contracts/alcheneko.sol/Alcheneko.json")
const nftContract = new web3.eth.Contract(contract.abi,process.env.CONTRACT_ADDRESS)

async function withdraw() {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce
  // const balance = await nftContract.methods.shares(PUBLIC_KEY).call();
  // console.log(balance);
  //the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: process.env.CONTRACT_ADDRESS,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.setMerkleRoot('0x13ae56173d280a7f5bcb8206c07518de6d111cbfd4ad3ef1ca0b4f448c30172c').encodeABI(),
  }
  console.log(tx);
}


(async () => {

  await withdraw();
})();
