// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTMarketplace {
    

    struct Listing {
        uint price;
        address seller;
    }

    //Contract Address -> token ID -> Listing Data
    mapping (address => mapping (uint256 => Listing)) public listings;

    //Caller must be owner of NFT token ID
    modifier isNFTOwner(address nftAddress,uint256 tokenId){
        require(IERC721(nftAddress).ownerOf(tokenId) == msg.sender,"Not the owner");
        _;
    }

    //Price must be more than 0
    modifier validPrice(uint256 _price) {
        require(_price > 0,"Price must be > 0");
        _;
    }

    //Specified NFT must not be already listed
    modifier isNotListed(address nftAddress,uint256 tokenId) {
        require(
            listings[nftAddress][tokenId].price == 0,
            "This NFT is already listed"
        );
        _;
    }

    //Specified NFT must be listed
    modifier isListed(address nftAddress,uint256 tokenId){
        require(listings[nftAddress][tokenId].price > 0,"Not listed till now");
        _;
    }

    //Emitted when a listing created
    event ListingCreated(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        address seller
    );

    //Emitted when a listing is cancelled
    event ListingCancelled(address nftAddress,uint256 tokenId,address seller);

    //Emitted when a listing is updated
    event ListingUpdated(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice,
        address seller
    );

    //Emitted when an NFT purchase is done
    event ListingPurchase(
        address nftAddress,
        uint256 tokenId,
        address seller,
        address buyer
    );

    function createListing(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )  external
        isNotListed(nftAddress,tokenId)
        isNFTOwner(nftAddress,tokenId)
        validPrice(price)
     {
        IERC721 nftContract = IERC721(nftAddress);
        require (
            nftContract.isApprovedForAll(msg.sender , address(this)) ||

            nftContract.getApproved(tokenId) == address(this),

            "No approval for this NFT"
        );

        listings[nftAddress][tokenId] = Listing({
            price:price,
            seller:msg.sender
        });

        emit ListingCreated(nftAddress,tokenId,price,msg.sender);

    }

    function cancelListing(address nftAddress,uint256 tokenId)
    external
    isListed(nftAddress,tokenId)
    isNFTOwner(nftAddress,tokenId)
    {
        //Delete the Listing struct from mapping
        //Freeing up storage saves gas
        delete listings[nftAddress][tokenId];

        emit ListingCancelled(nftAddress,tokenId,msg.sender);  
    }


    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )  external
    isListed(nftAddress,tokenId)
    isNFTOwner(nftAddress,tokenId)
    validPrice(newPrice){
        
        //Update listing price
        listings[nftAddress][tokenId].price = newPrice;

        //Emit the event
        emit ListingUpdated(nftAddress,tokenId,newPrice,msg.sender);
    }

    function purchaseListing(address nftAddress,uint256 tokenId) external payable
    isListed(nftAddress,tokenId)
    {
        Listing memory listing = listings[nftAddress][tokenId];

        require(msg.value == listing.price,"Please pay appropriate ETH");  

        //delete lisitng from storage to save gas
        delete listings[nftAddress][tokenId];

        //Transfer NFT from seller to buyer
        IERC721(nftAddress).safeTransferFrom(
            listing.seller,
            msg.sender,
            tokenId
        );

        //Transfer ETH sent from buyer to seller
        (bool sent, ) = payable(listing.seller).call{value:msg.value}("");
        require(sent,"Failed to transfer ETH");

        emit ListingPurchase(nftAddress,tokenId,listing.seller,msg.sender);


    }





    
}