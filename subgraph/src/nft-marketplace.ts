import {
  ListingCancelled,
  ListingCreated,
  ListingPurchase,
  ListingUpdated
} from "../generated/NFTMarketplace/NFTMarketplace";
import { store } from "@graphprotocol/graph-ts";
import {ListingEntity} from "../generated/schema";


export function handleListingCreated(event: ListingCreated): void {

  //create id with parameters
  const id = event.params.nftAddress.toHex() + "-" + event.params.tokenId.toString() + "-" + event.params.seller.toHex();
  
  //create new entity with id
  let listing = new ListingEntity(id);

  //assign values to entity
  listing.seller = event.params.seller;
  listing.nftAddress = event.params.nftAddress;
  listing.tokenId = event.params.tokenId;
  listing.price = event.params.price;

  //save entity
  listing.save();
}

export function handleListingCancelled(event:ListingCancelled):void {
  const id = event.params.nftAddress.toHex() + "-" + event.params.tokenId.toString() + "-" + event.params.seller.toHex();

  let lisiting = ListingEntity.load(id);

  if (lisiting){
    store.remove("ListingEntity",id);
  }
}

export function handleListingPurchased(event: ListingPurchase): void{
  const id = event.params.nftAddress.toHex() + "-" + event.params.tokenId.toString() + "-" + event.params.seller.toHex();

  let lisiting = ListingEntity.load(id);

  if (lisiting){
    lisiting.buyer = event.params.buyer;

    lisiting.save();
  }
}

export function handleListingUpdated(event: ListingUpdated): void{
  const id = event.params.nftAddress.toHex() + "-" + event.params.tokenId.toString() + "-" + event.params.seller.toHex();

  //load existing entity
  let listing = ListingEntity.load(id);

  //if lisiting exists update it
  if (listing) {
    listing.price = event.params.newPrice;
    listing.save();
  }
}

 