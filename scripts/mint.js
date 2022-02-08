require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.ETH_PUBLIC_KEY
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../artifacts/contracts/alchereum.sol/Alchereum.json")
const nftContract = new web3.eth.Contract(contract.abi, process.env.CONTRACT_ADDRESS)

async function _mintNFT() {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce

  //the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: process.env.CONTRACT_ADDRESS,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.mintNFT(PUBLIC_KEY).encodeABI(),
    value: 80000000000000000, // 0.08 ether
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
