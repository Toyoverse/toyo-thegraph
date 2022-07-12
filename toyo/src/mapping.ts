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
  let entityId = event.transaction.hash.toHex() + tokenId.toString();

  /* Purchase */
  let purchased = TokenPurchasedEntity.load(entityId)
  if (purchased == null) {
    purchased = new TokenPurchasedEntity(entityId)
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
  let tokenId = event.params.toTokenId;
  let entityId = event.transaction.hash.toHex() + tokenId.toString();

  let entity = TokenSwappedEntity.load(entityId)
  if (entity == null) {
    entity = new TokenSwappedEntity(entityId)
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