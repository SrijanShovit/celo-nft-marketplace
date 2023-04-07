require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({path: ".env"});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks:{
    alfajores:{
      url:"https://alfajores-forno.celo-testnet.org",
      accounts:[process.env.MNEMONIC_KEY],
      chainId:44787,
    }
  }
};
