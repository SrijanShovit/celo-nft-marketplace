import { Contract } from "ethers";
import { isAddress,parseEther } from "ethers/lib/utils.js";
import { useState } from "react";
import Link from "next/link";
import { useSigner,erc721ABI } from "wagmi";
import MarketPlaceABI from "../abis/NFTMarketplace.json";
import Navbar from "../components/Navbar";
import styles from "../styles/Create.module.css";
import { MARKETPLACE_ADDRESS } from "../constants";

export default function Create(){
    const [nftAddress,setNftAddress] = useState("");
    const [tokenId,setTokenId] = useState("");
    const [price,setPrice] = useState("");
    const [loading,setLoading] = useState(false);
    const [showListingLink, setShowListingLink] = useState(false);

    //get signer from wagmi
    const {data: signer} = useSigner();

    async function handleCreateListing() {
        setLoading(true);

        try {
            //making sure if address is valid contract
            const isValidAddress = isAddress(nftAddress);

            if (!isValidAddress){
                throw new Error('Invalid contract address');
            }

            //request approval for NFTs then create listing
            await requestApproval();
            await createListing();

            //show button to view NFT details
            setShowListingLink(true);
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    }


    //Function to check NFT approval
    async function requestApproval() {
        
        //Get signer address
        const address = await signer.getAddress();

        //Contract instance
        const ERC721Contract = new Contract(nftAddress,erc721ABI,signer);

        //confirm if user is owner of current nft
        const tokenOwner = await ERC721Contract.ownerOf(tokenId);
        if (tokenOwner.toLowerCase() !== address.toLowerCase()){
            throw new Error('You do not own this NFT');
        }

        //check for approval to marketplace
        const isApproved = await ERC721Contract.isApprovedForAll(
            address,
            MARKETPLACE_ADDRESS
        );

        if (!isApproved){
            console.log("Requesting approval for NFTs...");

            const approvalTxn = await ERC721Contract.setApprovalForAll(
                MARKETPLACE_ADDRESS,true
            );
            await approvalTxn.wait();
        }
    }

    
    //Function to call creatListing from marketplace contract
    async function createListing(){
        const MarketplaceContract = new Contract(
            MARKETPLACE_ADDRESS,
            MarketPlaceABI,
            signer
        );

        const createListingTxn = await MarketplaceContract.createListing(
            nftAddress,
            tokenId,
            parseEther(price)
        );
        await createListingTxn.wait();
    }

    return (
        <>
            <Navbar/>

            <div className={styles.container}>
                <input 
                    type="text"
                    placeholder="NFT Address 0x..."
                    value={nftAddress}
                    onChange={(e) => setNftAddress(e.target.value)}
                />

                <input 
                    type="text"
                    placeholder="Token ID"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                />

                <input 
                    type="text"
                    placeholder="Price in CELO"
                    value={price}
                    onChange={(e) => {
                        if (e.target.value === ""){
                            setPrice("0");
                        }else{
                            setPrice(e.target.value);
                        }
                    }}
                />

                <button onClick={handleCreateListing}
                disabled = {loading && isAddress}
                >
                    {loading ? "Loading..." : "Create"}
                </button>

                {showListingLink && (
                    <Link href={`/${nftAddress}/${tokenId}`}>
                        <button>View Listing</button>
                    </Link>
                )}
            </div>
        </>
    );
}