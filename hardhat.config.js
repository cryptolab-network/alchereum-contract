/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-etherscan");
const { API_URL, ETH_PRIVATE_KEY } = process.env;
module.exports = {
   solidity: "0.8.4",
   defaultNetwork: "rinkeby",
   networks: {
      hardhat: {},
      rinkeby: {
         url: API_URL,
         accounts: [`0x${ETH_PRIVATE_KEY}`]
      }
   },
   contractSizer: {
      alphaSort: true,
      disambiguatePaths: false,
      runOnCompile: true,
      strict: true,
   },
   etherscan: {
   // Your API key for Etherscan
   // Obtain one at https://etherscan.io/
      apiKey: ""
   }
}