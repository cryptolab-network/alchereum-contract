require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.ETH_PUBLIC_KEY
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../artifacts/contracts/alchereum.sol/Alchereum.json")
const nftContract = new web3.eth.Contract(contract.abi,process.env.CONTRACT_ADDRESS)
nftContract.methods._verifier().call(function(error, result) {
if (error !== null) {
  console.log(error);
} else {
  console.log(result);
}});
