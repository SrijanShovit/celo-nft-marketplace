const { ethers } = require("hardhat");

async function main() {
  const CeloNFTFactory = await ethers.getContractFactory("CeloNFT");

  const celoNftContract = await CeloNFTFactory.deploy();
  await celoNftContract.deployed();

  console.log("Celo NFT deployed to:",celoNftContract.address);

  const NFTMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");

  const nftMarketplaceContract = await NFTMarketplaceFactory.deploy();
  await nftMarketplaceContract.deployed();

  console.log("NFT Marketplace deployed to:",nftMarketplaceContract.address);
}

main().catch((error)=>{
  console.error(error);
  process.exitCode = 1;
})

/**
Celo NFT deployed to: 0x3355aA7a09E188F232ef860Acad8Bf69621AB03C
NFT Marketplace deployed to: 0xB87134828E0aB7169767b64436BB8587c2F6c17C
 */