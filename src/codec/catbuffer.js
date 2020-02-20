/*
 *
 * Copyright (c) 2019-present for NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License ");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 *  Shared codecs that use catbuffer formats.
 */

import assert from 'assert'
import MongoDb from 'mongodb'
import Reader from './reader'
import shared from '../util/shared'

// CONSTANTS
const TRANSACTION_TRANSFER = 0x4154
const TRANSACTION_REGISTER_NAMESPACE = 0x414E
const TRANSACTION_ADDRESS_ALIAS = 0x424E
const TRANSACTION_MOSAIC_ALIAS = 0x434E
const TRANSACTION_MOSAIC_DEFINITION = 0x414D
const TRANSACTION_MOSAIC_SUPPLY_CHANGE = 0x424D
const TRANSACTION_MODIFY_MULTISIG_ACCOUNT = 0x4155
const TRANSACTION_AGGREGATE_COMPLETE = 0x4141
const TRANSACTION_AGGREGATE_BONDED = 0x4241
const TRANSACTION_LOCK = 0x4148
const TRANSACTION_SECRET_LOCK = 0x4152
const TRANSACTION_SECRET_PROOF = 0x4252
const TRANSACTION_ACCOUNT_RESTRICTION_ADDRESS = 0x4150
const TRANSACTION_ACCOUNT_RESTRICTION_MOSAIC = 0x4250
const TRANSACTION_ACCOUNT_RESTRICTION_OPERATION = 0x4350
const TRANSACTION_LINK_ACCOUNT = 0x414C
const TRANSACTION_MOSAIC_ADDRESS_RESTRICTION = 0x4251
const TRANSACTION_MOSAIC_GLOBAL_RESTRICTION = 0x4151
const TRANSACTION_ACCOUNT_METADATA_TRANSACTION = 0x4144
const TRANSACTION_MOSAIC_METADATA_TRANSACTION = 0x4244
const TRANSACTION_NAMESPACE_METADATA_TRANSACTION = 0x4344
const NAMESPACE_ROOT = 0
const NAMESPACE_CHILD = 1

// HELPERS

// Align size to boundary.
const align = (size, alignment) => {
  let mod = size % alignment
  return mod === 0 ? size : size + (alignment - mod)
}

// READERS

export default class CatbufferReader extends Reader {
  // Size-prefix for an entity
  sizePrefix() {
    let size = this.uint32()
    if (this.data.length < size - 4) {
      throw new Error('invalid sized-prefixed entity: data is too short')
    }
    return size
  }

  // Body of an entity.
  entityBody() {
    let key = this.key()
    // Skip reserved value.
    this.uint32()
    let version = this.uint8()
    let network = this.uint8()
    let type = this.uint16()

    return {
      key,
      version,
      network,
      type
    }
  }

  // Verification of an entity
  entityVerification() {
    // Skip reserved value.
    this.uint32()

    return this.signature()
  }

  // Verifiable entity with a signature and signer key.
  // Used for transactions and blocks.
  verifiableEntity() {
    // Model:
    //  struct VerifiableEntity {
    //    uint32_t size;
    //    uint32_t reserved;
    //    Signature Signature;
    //    Key key;
    //    uint32_t reserved;
    //    uint8_t version;
    //    NetworkIdentifier network;
    //    EntityType type;
    //  }
    this.sizePrefix()
    let signature = this.entityVerification()
    let {key, version, network, type} = this.entityBody()

    return {
      signature,
      key,
      version,
      network,
      type
    }
  }

  // Size-prefixed entity.
  // Used for embedded transactions.
  embeddedEntity() {
    this.sizePrefix()
    // Skip reserved value.
    this.uint32()

    return this.entityBody()
  }

  mosaic() {
    let mosaicId = this.id()
    let amount = this.uint64()

    return {
      mosaicId,
      amount
    }
  }

  cosignature() {
    let signerPublicKey = this.key()
    let signature = this.signature()

    return {
      signerPublicKey,
      signature
    }
  }

  cosignatures() {
    if ((this.data.length % 96) !== 0) {
      throw new Error('invalid trailing data after cosignatures.')
    }

    let cosignatures = []
    while (this.data.length !== 0) {
      cosignatures.push(this.cosignature())
    }

    return cosignatures
  }

  baseTransaction(embedded) {
    let transaction = {}
    if (!embedded) {
      transaction.maxFee = this.uint64()
      transaction.deadline = this.uint64()
    }

    return transaction
  }

  transferTransaction(embedded) {
    // Parse the fixed data.
    let transaction = this.baseTransaction(embedded)
    transaction.receipientAddress = this.address()
    let mosaicsCount = this.uint8()
    let messageSize = this.uint16()
    // Skip reserved value.
    this.uint32()

    // Parse the mosaics.
    transaction.mosaics = []
    this.n(transaction.mosaics, mosaicsCount, 'mosaic')

    // Parse the message
    transaction.message = this.hexN(messageSize)

    this.validateEmpty()

    return transaction
  }

  registerNamespaceTransaction(embedded) {
    // Parse the fixed data.
    let transaction = this.baseTransaction(embedded)
    let union = this.rawUint64()
    transaction.namespaceId = this.id()
    transaction.namespaceType = this.uint8()
    let nameSize = this.uint8()
    transaction.name = this.asciiN(nameSize)

    // Parse the union data
    if (transaction.namespaceType === NAMESPACE_ROOT) {
      transaction.duration = (new MongoDb.Long(union[0], union[1])).toString()
    } else if (transaction.namespaceType === NAMESPACE_CHILD) {
      transaction.parentId = shared.idToHex(union)
    } else {
      throw new Error(`invalid namespace type, got ${transaction.namespaceType}`)
    }
    this.validateEmpty()

    return transaction
  }

  addressAliasTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.namespaceId = this.id()
    transaction.address = this.address()
    transaction.aliasAction = this.uint8()
    this.validateEmpty()

    return transaction
  }

  mosaicAliasTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.namespaceId = this.id()
    transaction.aliased = this.id()
    transaction.aliasAction = this.uint8()
    this.validateEmpty()

    return transaction
  }

  mosaicDefinitionTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.mosaicId = this.id()
    transaction.duration = this.uint64()
    transaction.nonce = this.uint32()
    transaction.flags = this.uint8()
    transaction.divisibility = this.uint8()
    this.validateEmpty()

    return transaction
  }

  mosaicSupplyChangeTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.mosaicId = this.id()
    transaction.delta = this.uint64()
    transaction.action = this.uint8()
    this.validateEmpty()

    return transaction
  }

  modifyMultisigTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.minRemovalDelta = this.int8()
    transaction.minApprovalDelta = this.int8()
    let additionsCount = this.uint8()
    let deletionsCount = this.uint8()
    // Skip reserved value.
    this.uint32()

    // Parse the additions.
    transaction.publicKeyAdditions = []
    this.n(transaction.publicKeyAdditions, additionsCount, 'key')

    // Parse the deletions.
    transaction.publicKeyDeletions = []
    this.n(transaction.publicKeyDeletions, deletionsCount, 'key')

    this.validateEmpty()

    return transaction
  }

  // Both aggregate transactions have the same layout.
  aggregateTransaction(embedded) {
    assert(!embedded, 'aggregate transaction cannot be embedded')

    let transaction = this.baseTransaction()
    transaction.aggregateHash = this.hash256()
    let transactionSize = this.uint32()
    // Skip reserved value.
    this.uint32()

    // Read the transactions.
    // May not be present, but `transactions` handles empty data.
    let transactionData = this.data.slice(0, transactionSize)
    this.data = this.data.slice(transactionSize)
    let transactionReader = new CatbufferReader(transactionData)
    transaction.innerTransactions = transactionReader.transactions(true)

    // Read the remaining data as cosignatures.
    // May not be present, but `cosignatures` handles empty data.
    transaction.cosignatures = this.cosignatures()

    this.validateEmpty()

    return transaction
  }

  aggregateCompleteTransaction(embedded) {
    return this.aggregateTransaction(embedded)
  }

  aggregateBondedTransaction(embedded) {
    return this.aggregateTransaction(embedded)
  }

  lockTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.mosaic = this.mosaic()
    transaction.duration = this.uint64()
    transaction.hash = this.hash256()
    this.validateEmpty()

    return transaction
  }

  secretLockTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.secret = this.hash256()
    transaction.mosaic = this.mosaic()
    transaction.duration = this.uint64()
    transaction.hashAlgorithm = this.uint8()
    transaction.recipientAddress = this.address()
    this.validateEmpty()

    return transaction
  }

  secretProofTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.secret = this.hash256()
    let proofSize = this.uint16()
    transaction.hashAlgorithm = this.uint8()
    transaction.recipientAddress = this.address()
    transaction.proof = this.hexN(proofSize)
    this.validateEmpty()

    return transaction
  }

  accountRestrictionTransaction(restriction, embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.restrictionFlags = this.uint16()
    let additionsCount = this.uint8()
    let deletionsCount = this.uint8()
    // Skip reserved value.
    this.uint32()

    // Parse the additions.
    transaction.publicKeyAdditions = []
    this.n(transaction.restrictionAdditions, additionsCount, restriction)

    // Parse the deletions.
    transaction.publicKeyDeletions = []
    this.n(transaction.restrictionDeletions, deletionsCount, restriction)

    this.validateEmpty()

    return transaction
  }

  accountRestrictionAddressTransaction(embedded) {
    return this.accountRestrictionTransaction('address', embedded)
  }

  accountRestrictionMosaicTransaction(embedded) {
    return this.accountRestrictionTransaction('id', embedded)
  }

  accountRestrictionOperationTransaction(embedded) {
    return this.accountRestrictionTransaction('entityType', embedded)
  }

  linkAccountTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.remotePublicKey = this.key()
    transaction.linkAction = this.uint8()
    this.validateEmpty()

    return transaction
  }

  mosaicAddressRestrictionTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.mosaicId = this.id()
    transaction.restrictionKey = this.uint64()
    transaction.previousRestrictionValue = this.uint64()
    transaction.newRestrictionValue = this.uint64()
    transaction.targetAddress = this.address()
    this.validateEmpty()

    return transaction
  }

  mosaicGlobalRestrictionTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.mosaicId = this.id()
    transaction.referenceMosaicId = this.id()
    transaction.restrictionKey = this.uint64()
    transaction.previousRestrictionValue = this.uint64()
    transaction.newRestrictionValue = this.uint64()
    transaction.previousRestrictionType = this.uint8()
    transaction.newRestrictionType = this.uint8()
    this.validateEmpty()

    return transaction
  }

  accountMetadataTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.targetPublicKey = this.key()
    transaction.scopedMetadataKey = this.uint64()
    transaction.valueSizeDelta = this.int16()
    let valueSize = this.uint16()
    transaction.value = this.hexN(valueSize)
    this.validateEmpty()

    return transaction
  }

  mosaicMetadataTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.targetPublicKey = this.key()
    transaction.scopedMetadataKey = this.uint64()
    transaction.targetMosaicId = this.id()
    transaction.valueSizeDelta = this.int16()
    let valueSize = this.uint16()
    transaction.value = this.hexN(valueSize)
    this.validateEmpty()

    return transaction
  }

  namespaceMetadataTransaction(embedded) {
    let transaction = this.baseTransaction(embedded)
    transaction.targetPublicKey = this.key()
    transaction.scopedMetadataKey = this.uint64()
    transaction.targetNamespaceId = this.id()
    transaction.valueSizeDelta = this.int16()
    let valueSize = this.uint16()
    transaction.value = this.hexN(valueSize)
    this.validateEmpty()

    return transaction
  }

  transactionHeader(type, embedded) {
    if (type === TRANSACTION_TRANSFER) {
      return this.transferTransaction(embedded)
    } else if (type === TRANSACTION_REGISTER_NAMESPACE) {
      return this.registerNamespaceTransaction(embedded)
    } else if (type === TRANSACTION_ADDRESS_ALIAS) {
      return this.addressAliasTransaction(embedded)
    } else if (type === TRANSACTION_MOSAIC_ALIAS) {
      return this.mosaicAliasTransaction(embedded)
    } else if (type === TRANSACTION_MOSAIC_DEFINITION) {
      return this.mosaicDefinitionTransaction(embedded)
    } else if (type === TRANSACTION_MOSAIC_SUPPLY_CHANGE) {
      return this.mosaicSupplyChangeTransaction(embedded)
    } else if (type === TRANSACTION_MODIFY_MULTISIG_ACCOUNT) {
      return this.modifyMultisigTransaction(embedded)
    } else if (type === TRANSACTION_AGGREGATE_COMPLETE) {
      return this.aggregateCompleteTransaction(embedded)
    } else if (type === TRANSACTION_AGGREGATE_BONDED) {
      return this.aggregateBondedTransaction(embedded)
    } else if (type === TRANSACTION_LOCK) {
      return this.lockTransaction(embedded)
    } else if (type === TRANSACTION_SECRET_LOCK) {
      return this.secretLockTransaction(embedded)
    } else if (type === TRANSACTION_SECRET_PROOF) {
      return this.secretProofTransaction(embedded)
    } else if (type === TRANSACTION_ACCOUNT_RESTRICTION_ADDRESS) {
      return this.accountRestrictionAddressTransaction(embedded)
    } else if (type === TRANSACTION_ACCOUNT_RESTRICTION_MOSAIC) {
      return this.accountRestrictionMosaicTransaction(embedded)
    } else if (type === TRANSACTION_ACCOUNT_RESTRICTION_OPERATION) {
      return this.accountRestrictionOperationTransaction(embedded)
    } else if (type === TRANSACTION_LINK_ACCOUNT) {
      return this.linkAccountTransaction(embedded)
    } else if (type === TRANSACTION_MOSAIC_ADDRESS_RESTRICTION) {
      return this.mosaicAddressRestrictionTransaction(embedded)
    } else if (type === TRANSACTION_MOSAIC_GLOBAL_RESTRICTION) {
      return this.mosaicGlobalRestrictionTransaction(embedded)
    } else if (type === TRANSACTION_ACCOUNT_METADATA_TRANSACTION) {
      return this.accountMetadataTransaction(embedded)
    } else if (type === TRANSACTION_MOSAIC_METADATA_TRANSACTION) {
      return this.mosaicMetadataTransaction(embedded)
    } else if (type === TRANSACTION_NAMESPACE_METADATA_TRANSACTION) {
      return this.namespaceMetadataTransaction(embedded)
    } else {
      throw new Error(`invalid transaction type, got ${type}`)
    }
  }

  transaction(embedded) {
    // First, get our entity data so we can parse the verifiable entity and block.
    let size = shared.binaryToUint32(this.data.slice(0, 4))
    let alignedSize = align(size, 8)
    let entityData = this.data.slice(0, size)
    this.data = this.data.slice(alignedSize)

    // Create a reader for the transaction entity.
    let entity
    let entityReader = new CatbufferReader(entityData)
    if (embedded) {
      entity = entityReader.embeddedEntity()
    } else {
      entity = entityReader.verifiableEntity()
    }
    let transaction = entityReader.transactionHeader(entity.type, embedded)

    return {
      entity,
      transaction
    }
  }

  transactions(embedded) {
    // Read transaction data while we still have remaining data.
    // It will either completely parse or throw an error.
    let transactions = []
    while (this.data.length !== 0) {
      transactions.push(this.transaction(embedded))
    }

    return transactions
  }

  blockHeader() {
    let height = this.uint64()
    let timestamp = this.uint64()
    let difficulty = this.uint64()
    let previousBlockHash = this.hash256()
    let transactionsHash = this.hash256()
    let receiptsHash = this.hash256()
    let stateHash = this.hash256()
    let beneficiaryPublicKey = this.key()
    let feeMultiplier = this.uint32()
    // Skip reserved value.
    this.uint32()

    return {
      height,
      timestamp,
      difficulty,
      previousBlockHash,
      transactionsHash,
      receiptsHash,
      stateHash,
      beneficiaryPublicKey,
      feeMultiplier
    }
  }

  block() {
    // First, get our entity data so we can parse the verifiable entity and block.
    let size = shared.binaryToUint32(this.data.slice(0, 4))
    let entityData = this.data.slice(0, size)
    this.data = this.data.slice(size)

    // Create a dependent reader.
    let entityReader = new CatbufferReader(entityData)
    let entity = entityReader.verifiableEntity()
    let block = entityReader.blockHeader()
    if (entityReader.data.length !== 0) {
      // Add the embedded transactions.
      block.transactions = entityReader.transactions()
    }

    return {
      entity,
      block
    }
  }

  blocks() {
    // Read transaction data while we still have remaining data.
    // It will either completely parse or throw an error.
    let blocks = []
    while (this.data.length !== 0) {
      blocks.push(this.block())
    }

    return blocks
  }
}
