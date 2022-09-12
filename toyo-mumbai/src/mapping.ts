import {
  BigInt,
  json,
  JSONValueKind,
  Address,
  Bytes,
} from "@graphprotocol/graph-ts";

import {
  TokenPaused,
  TokenPurchased,
  TokenTypeAdded,
} from "../generated/NftTokenCrowdsale-v1/NftTokenCrowdsale";

import { TokenSwapped } from "../generated/NftTokenSwap-v1/NftTokenSwap";

import { NftToken, Transfer } from "../generated/NftToken-v1/NftToken";

import {
  TokenStaked,
  TokenClaimed,
} from "../generated/NftTokenStake-v1/NftTokenStake";

import {
  TokenPausedEntity,
  TokenPurchasedEntity,
  TokenTypeEntity,
  TokenOwnerEntity,
  TokenWalletEntity,
  TokenSwappedEntity,
  TokenTransferEntity,
  TokenStakedEntity,
  TokenClaimedEntity,
} from "../generated/schema";

export function handleTokenPaused(event: TokenPaused): void {
  let entity = TokenPausedEntity.load(event.transaction.hash.toHex());
  if (entity == null) {
    entity = new TokenPausedEntity(event.transaction.hash.toHex());
  }
  entity.changer = event.params.changer;
  entity.typeId = event.params.typeId;
  entity.save();
}

export function handleTokenPurchased(event: TokenPurchased): void {
  let tokenId = event.params.tokenId;

  /* Purchase */
  let purchased = TokenPurchasedEntity.load(tokenId.toString());
  if (purchased == null) {
    purchased = new TokenPurchasedEntity(tokenId.toString());
  }

  purchased.beneficiary = event.params.beneficiary;
  purchased.spender = event.params.spender;
  purchased.tokenId = tokenId;
  purchased.totalSupply = event.params.totalSupply;
  purchased.typeId = event.params.typeId;
  purchased.value = event.params.value;
  purchased.blockNumber = event.block.number;
  purchased.blockTimestamp = event.block.timestamp;
  purchased.transactionHash = event.transaction.hash;

  purchased.save();

  let type = TokenTypeEntity.load(event.params.typeId.toString());
  if (type != null) {
    type.count = type.count.plus(BigInt.fromI32(1));
    type.save();
  }

  let owner = TokenOwnerEntity.load(tokenId.toString());
  if (owner == null) {
    owner = new TokenOwnerEntity(tokenId.toString());
  }

  /* Owner */
  owner.currentOwner = event.params.beneficiary;
  owner.currentOwnerOrStaker = event.params.beneficiary;
  owner.isStaked = false;
  owner.tokenId = tokenId;
  owner.typeId = event.params.typeId;
  owner.blockNumber = event.block.number;
  owner.blockTimestamp = event.block.timestamp;
  owner.transactionHash = event.transaction.hash;
  owner.save();

  /* Wallet */
  let wallet = TokenWalletEntity.load(
    event.params.beneficiary.toHexString() + event.params.typeId.toString()
  );
  if (wallet == null) {
    wallet = new TokenWalletEntity(
      event.params.beneficiary.toHexString() + event.params.typeId.toString()
    );
  }
  wallet.currentOwner = event.params.beneficiary;
  wallet.typeId = event.params.typeId;
  wallet.count = wallet.count.plus(BigInt.fromI32(1));
  wallet.save();
}

export function handleTokenTypeAdded(event: TokenTypeAdded): void {
  let type = TokenTypeEntity.load(event.params.newValue.toString());
  if (type == null) {
    type = new TokenTypeEntity(event.params.newValue.toString());
  }
  type.changer = event.params.changer;
  type.newValue = event.params.newValue;
  type.count = BigInt.fromI32(0);
  type.save();
}

export function handleTokenSwapped(event: TokenSwapped): void {
  let tokenId = event.params.toTokenId;
  let entityId = event.transaction.hash.toHex() + tokenId.toString();

  let swapped = TokenSwappedEntity.load(entityId);
  if (swapped == null) {
    swapped = new TokenSwappedEntity(entityId);
  }
  swapped.sender = event.params.sender;
  swapped.fromTypeId = event.params.fromTypeId;
  swapped.toTypeId = event.params.toTypeId;
  swapped.fromTokenId = event.params.fromTokenId;
  swapped.toTokenId = event.params.toTokenId;
  swapped.blockNumber = event.block.number;
  swapped.blockTimestamp = event.block.timestamp;
  swapped.transactionHash = event.transaction.hash;
  swapped.save();
}

export function handleTransfer(event: Transfer): void {
  /* Transfer */
  let transfer = TokenTransferEntity.load(event.transaction.hash.toHex());
  if (transfer == null) {
    transfer = new TokenTransferEntity(event.transaction.hash.toHex());
  }
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.tokenId = event.params.tokenId;
  transfer.blockNumber = event.block.number;
  transfer.blockTimestamp = event.block.timestamp;
  transfer.transactionHash = event.transaction.hash;
  transfer.save();

  /* Owner */
  let owner = TokenOwnerEntity.load(event.params.tokenId.toString());
  if (owner == null) {
    owner = new TokenOwnerEntity(event.params.tokenId.toString());
    owner.isStaked = false;
  }

  owner.currentOwner = event.params.to;
  if (!owner.isStaked) {
    owner.currentOwnerOrStaker = event.params.to;
  }
  owner.tokenId = event.params.tokenId;
  owner.blockNumber = event.block.number;
  owner.blockTimestamp = event.block.timestamp;
  owner.transactionHash = event.transaction.hash;
  owner.save();

  /* Wallet */
  let purchased = TokenPurchasedEntity.load(event.params.tokenId.toString());
  if (purchased != null) {
    let walletTo = TokenWalletEntity.load(
      event.params.to.toHexString() + purchased.typeId.toString()
    );
    if (walletTo == null) {
      walletTo = new TokenWalletEntity(
        event.params.to.toHexString() + purchased.typeId.toString()
      );
      walletTo.currentOwner = event.params.to;
      walletTo.typeId = purchased.typeId;
    }

    walletTo.count = walletTo.count.plus(BigInt.fromI32(1));
    walletTo.save();

    let walletFrom = TokenWalletEntity.load(
      event.params.from.toHexString() + purchased.typeId.toString()
    );
    if (walletFrom == null) {
      walletFrom = new TokenWalletEntity(
        event.params.from.toHexString() + purchased.typeId.toString()
      );
      walletFrom.currentOwner = event.params.from;
      walletFrom.typeId = purchased.typeId;
    }

    walletFrom.count = walletFrom.count.plus(BigInt.fromI32(1));
    walletFrom.save();
  }
}

export function handleTokenStaked(event: TokenStaked): void {
  let stake = TokenStakedEntity.load(event.transaction.hash.toHex());
  if (stake == null) {
    stake = new TokenStakedEntity(event.transaction.hash.toHex());
  }
  stake.currentOwner = event.params.owner;
  stake.tokenId = event.params.tokenId;
  stake.save();

  /* Owner */
  let owner = TokenOwnerEntity.load(event.params.tokenId.toString());
  if (owner == null) {
    owner = new TokenOwnerEntity(event.params.tokenId.toString());
  }

  owner.currentStaker = event.params.owner;
  owner.currentOwnerOrStaker = event.params.owner;
  owner.isStaked = true;
  owner.save();
}

export function handleTokenClaimed(event: TokenClaimed): void {
  let claim = TokenClaimedEntity.load(event.transaction.hash.toHex());
  if (claim == null) {
    claim = new TokenClaimedEntity(event.transaction.hash.toHex());
  }

  claim.claimId = event.params.claimId.toString();
  claim.owner = event.params.owner;
  claim.tokenId = event.params.tokenId;
  claim.bondAmount = event.params.bondAmount;
  claim.cardCode = event.params.cardCode;
  claim.save();

  /* Owner */
  let owner = TokenOwnerEntity.load(event.params.tokenId.toString());
  if (owner == null) {
    owner = new TokenOwnerEntity(event.params.tokenId.toString());
  }

  owner.currentStaker = null;
  owner.currentOwnerOrStaker = event.params.owner;
  owner.isStaked = false;
  owner.save();
}
