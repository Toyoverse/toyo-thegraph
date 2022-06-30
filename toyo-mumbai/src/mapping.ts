import { BigInt, json, JSONValueKind, Address } from "@graphprotocol/graph-ts"

import {
  TokenPaused,
  TokenPurchased,
  TokenTypeAdded,
} from "../generated/NftTokenCrowdsale-v1/NftTokenCrowdsale"

import {
  TokenSwapped
} from "../generated/NftTokenSwap-v1/NftTokenSwap"

import {
  NftToken,
  Transfer
} from "../generated/NftToken-v1/NftToken"

import {
  TokenPausedEntity,
  TokenPurchasedEntity,
  TokenTypeEntity,
  TokenOwnerEntity,
  TokenSwappedEntity,
  TokenTransferEntity,
} from "../generated/schema"

export function handleTokenPaused(event: TokenPaused): void {
  let entity = TokenPausedEntity.load(event.transaction.hash.toHex())
  if (entity == null) {
    entity = new TokenPausedEntity(event.transaction.hash.toHex())
  }
  entity.changer = event.params.changer
  entity.typeId = event.params.typeId
  entity.save()
}

export function handleTokenPurchased(event: TokenPurchased): void {
  let tokenId = event.params.tokenId;

  /* Purchase */
  let purchased = TokenPurchasedEntity.load(event.transaction.hash.toHex())
  if (purchased == null) {
    purchased = new TokenPurchasedEntity(event.transaction.hash.toHex())
  }
  purchased.beneficiary = event.params.beneficiary
  purchased.spender = event.params.spender
  purchased.tokenId = tokenId
  purchased.totalSupply = event.params.totalSupply
  purchased.typeId = event.params.typeId
  purchased.value = event.params.value
  purchased.blockNumber = event.block.number
  purchased.blockTimestamp = event.block.timestamp
  purchased.transactionHash = event.transaction.hash
  
  purchased.save()

  let type = TokenTypeEntity.load(event.params.typeId.toString())
  if (type != null) {
    type.count = type.count + BigInt.fromI32(1)
    type.save()
  }

  let owner = TokenOwnerEntity.load(tokenId.toString())
  if (owner == null) {
    owner = new TokenOwnerEntity(tokenId.toString())
  }

  /* Owner */
  owner.currentOwner = event.params.beneficiary
  owner.tokenId = tokenId
  owner.typeId = event.params.typeId
  owner.blockNumber = event.block.number
  owner.blockTimestamp = event.block.timestamp
  owner.transactionHash = event.transaction.hash
  owner.save()

  /* Metadata */

  // const NFTTOKEN_ADDRESS = Address.fromString("0xaf5107e0a3Ea679B6Fc23A9756075559e2e4649b");

  // let contract = NftToken.bind(NFTTOKEN_ADDRESS)
  // let metadata = contract.tokenURI(tokenId)

  // let parsed = json.fromString(metadata)
  // if(parsed.kind == JSONValueKind.OBJECT){
  //  let entry = parsed.toObject()
  //  owner.tokenName = entry.name
  //}

  // owner.metadata = metadata;
}

export function handleTokenTypeAdded(event: TokenTypeAdded): void {
  let entity = TokenTypeEntity.load(event.params.newValue.toString())
  if (entity == null) {
    entity = new TokenTypeEntity(event.params.newValue.toString())
  }
  entity.changer = event.params.changer
  entity.newValue = event.params.newValue
  entity.count = BigInt.fromI32(0)
  entity.save()
}

export function handleTokenSwapped(event: TokenSwapped): void {
  let entity = TokenSwappedEntity.load(event.transaction.hash.toHex())
  if (entity == null) {
    entity = new TokenSwappedEntity(event.transaction.hash.toHex())
  }
  entity.sender = event.params.sender
  entity.fromTypeId = event.params.fromTypeId
  entity.toTypeId = event.params.toTypeId
  entity.fromTokenId = event.params.fromTokenId
  entity.toTokenId = event.params.toTokenId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleTransfer(event: Transfer): void {
  /* Transfer */
  let transfer = TokenTransferEntity.load(event.transaction.hash.toHex())
  if (transfer == null) {
    transfer = new TokenTransferEntity(event.transaction.hash.toHex())
  }
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.tokenId = event.params.tokenId
  transfer.blockNumber = event.block.number
  transfer.blockTimestamp = event.block.timestamp
  transfer.transactionHash = event.transaction.hash
  transfer.save()

  /* Owner */
  let owner = TokenOwnerEntity.load(event.params.tokenId.toString())
  if (owner == null) {
    owner = new TokenOwnerEntity(event.params.tokenId.toString())
  }

  owner.currentOwner = event.params.to
  owner.tokenId = event.params.tokenId
  owner.blockNumber = event.block.number
  owner.blockTimestamp = event.block.timestamp
  owner.transactionHash = event.transaction.hash
  owner.save()
}