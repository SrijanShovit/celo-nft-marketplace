import { useEffect,useState } from "react";
import { useAccount,useContract,useProvider,erc721ABI } from "wagmi";
import styles from "../styles/Listing.module.css";
import {formatEther} from "ethers/lib/utils";

export default function Listing(props) {
    
    //hold info about nft
    const [imageUrI,setImageUrI] = useState("");
    const [name,setName] = useState("");

    const [loading,setLoading] = useState(true);

    const provider = useProvider();
    const {address} = useAccount();
    const ERC721Contract = useContract({
        address: props.nftAddress,
        abi : erc721ABI,
        signerOrProvider: provider,
    });

    //Check if user is NFT seller
    const isOwner = address===null ? "Not connected" : address.toLowerCase() === props.seller.toLowerCase();
    

    //Fetch NFT details
    async function fetchNFTDetails() {
        try {
            let tokenURI = await ERC721Contract.tokenURI(0);
            console.log(await ERC721Contract.tokenURI(0));
            //we get IPFS url,use http
            console.log("-------",tokenURI)
            tokenURI = tokenURI.replace("ipfs://","https://ipfs.io/ipfs/");

            const metadata = await fetch(tokenURI);
            const metadataJSON = await metadata.json();
            console.log("********",metadataJSON)

            //extract imge URI from metadata
            let image = metadataJSON.imageUrl;
            //we get IPFS url,use http
            image = image.replace("ipfs://","http://ipfs.io/ipfs/");

            setName(metadataJSON.name);
            setImageUrI(image);
            setLoading(false);

        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }


    //fetch NFT details on component loading
    useEffect(() => {
        fetchNFTDetails();
    },[]);


    return(
        <div>
            {loading ? (
                <span>Loading...</span>
            ) : (
                <div className={styles.card}>
                    <img src={imageUrI} />
                    <div className={styles.container}>
                        <span>
                            <b>
                                {name} - #{props.tokenId}
                            </b>
                        </span>
                        <span>
                            Price: {formatEther(props.price)} CELO
                        </span>
                        <span>
                            Seller: {isOwner ? "You" : props.seller.substring(0,6) + "..."}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}