require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.ETH_PUBLIC_KEY
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../../artifacts/contracts/ksm.sol/AltStorage.json")
const nftContract = new web3.eth.Contract(contract.abi, process.env.ALTSTORAGE_CONTRACT_ADDRESS)

async function setKsmAddress() {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce
  // const balance = await nftContract.methods.shares(PUBLIC_KEY).call();
  // console.log(balance);
  //the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: process.env.ALTSTORAGE_CONTRACT_ADDRESS,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.setAddress('H4EeouHL5LawTqq2itu6auF62hDRX2LEBYk1TxS6QMrn9Hg', 1).encodeABI(),
  }
}

(async () => {

  await setKsmAddress();
})();