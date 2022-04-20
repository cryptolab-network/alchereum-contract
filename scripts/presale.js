require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.ETH_PUBLIC_KEY_PRESALE
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY_PRESALE

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../artifacts/contracts/alcheneko.sol/Alcheneko.json")
const nftContract = new web3.eth.Contract(contract.abi, process.env.CONTRACT_ADDRESS)

async function _mintNFT() {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce

  //the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: process.env.CONTRACT_ADDRESS,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.presale(PUBLIC_KEY,
      "0x90109dd37c9cc170f829532051b215afab8ad77b1eabfadedc37a070426840d239c59f981c6340113ee36b23c59f0425cc7bd1717a0df865e8d0c25163e171121c").encodeABI(),
    value: 70000000000000000, // 0.07 ether
  }

  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY)
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
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
      )
    })
    .catch((err) => {
      console.log(" Promise failed:", err)
    });
  }

(async () => {
  // const tokenURI = await pinSingleMetadataFromDir('./metadata', 'test.json', `test_${1}`, // nft name
  // {
  //   description: 'test', // description
  //   external_url: 'www.google.com',
  //   attributes: [
  //     {
  //       "trait_type": "Base", 
  //       "value": "Starfish"
  //     }
  //   ], 
  // });
  await _mintNFT();
})();
