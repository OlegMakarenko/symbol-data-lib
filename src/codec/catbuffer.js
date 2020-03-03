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
import constants from './constants'
import BaseReader from './reader'
import BaseWriter from './writer'
import shared from '../util/shared'

// HELPERS

// Align size to boundary.
const align = (size, alignment) => {
  let mod = size % alignment
  return mod === 0 ? size : size + (alignment - mod)
}

// READERS

class Reader extends BaseReader {
  // Size-prefix for an entity.
  sizePrefix(ignoreSize=false) {
    let size = this.uint32()
    if (!ignoreSize && this._data.length < size - 4) {
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

    return {
      signature: this.signature()
    }
  }

  // Verifiable entity with a signature and signer key.
  // Used for transactions and blocks.
  verifiableEntity(ignoreSize=false) {
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
    this.sizePrefix(ignoreSize)
    let {signature} = this.entityVerification()
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
  embeddedEntity(ignoreSize=false) {
    this.sizePrefix(ignoreSize)
    // Skip reserved value.
    this.uint32()

    return this.entityBody()
  }

  // General entity
  entity(embedded=false, ignoreSize=false) {
    if (embedded) {
      return this.embeddedEntity(ignoreSize)
    } else {
      return this.verifiableEntity(ignoreSize)
    }
  }

  mosaic() {
    let id = this.id()
    let amount = this.uint64String()

    return {
      id,
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
    if ((this._data.length % 96) !== 0) {
      throw new Error('invalid trailing data after cosignatures.')
    }

    let cosignatures = []
    while (this._data.length !== 0) {
      cosignatures.push(this.cosignature())
    }

    return cosignatures
  }

  baseTransaction(embedded=false) {
    let transaction = {}
    if (!embedded) {
      transaction.maxFee = this.uint64String()
      transaction.deadline = this.uint64String()
    }

    return transaction
  }

  transfer(embedded=false) {
    // Parse the fixed data.
    let transaction = this.baseTransaction(embedded)
    transaction.recipientAddress = this.address()
    let mosaicsCount = this.uint8()
    let messageSize = this.uint16()
    // Skip reserved value.
    this.uint32()

    // Parse the mosaics.
    transaction.mosaics = []
    this.n(transaction.mosaics, mosaicsCount, 'mosaic')

    // Parse the message
    transaction.message = this.hex(messageSize)

    this.validateEmpty()

    return transaction
  }

  registerNamespace(embedded=false) {
    // Parse the fixed data.
    let transaction = this.baseTransaction(embedded)
    let union = this.uint64()
    transaction.namespaceId = this.id()
    transaction.namespaceType = this.uint8()
    let nameSize = this.uint8()
    transaction.name = this.ascii(nameSize)

    // Parse the union data
    if (transaction.namespaceType === constants.namespaceType.root) {
      transaction.duration = shared.uint64ToString(union)
    } else if (transaction.namespaceType === constants.namespaceType.child) {
      transaction.parentId = shared.uint64ToId(union)
    } else {
      throw new Error(`invalid namespace type, got ${transaction.namespaceType}`)
    }
    this.validateEmpty()

    return transaction
  }

  addressAlias(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.namespaceId = this.id()
    transaction.address = this.address()
    transaction.aliasAction = this.uint8()
    this.validateEmpty()

    return transaction
  }

  mosaicAlias(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.namespaceId = this.id()
    transaction.mosaicId = this.id()
    transaction.aliasAction = this.uint8()
    this.validateEmpty()

    return transaction
  }

  mosaicDefinition(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.mosaicId = this.id()
    transaction.duration = this.uint64String()
    transaction.nonce = this.uint32()
    transaction.flags = this.uint8()
    transaction.divisibility = this.uint8()
    this.validateEmpty()

    return transaction
  }

  mosaicSupplyChange(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.mosaicId = this.id()
    transaction.delta = this.uint64String()
    transaction.action = this.uint8()
    this.validateEmpty()

    return transaction
  }

  modifyMultisigAccount(embedded=false) {
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
  aggregate(embedded=false) {
    assert(!embedded, 'aggregate transaction cannot be embedded')

    let transaction = this.baseTransaction()
    transaction.aggregateHash = this.hash256()
    let transactionsSize = this.uint32()
    // Skip reserved value.
    this.uint32()

    // Read the transactions.
    // May not be present, but `transactions` handles empty data.
    let transactionData = this._data.slice(0, transactionsSize)
    this._data = this._data.slice(transactionsSize)
    let transactionReader = new Reader(transactionData)
    transaction.innerTransactions = transactionReader.transactions(true)

    // Read the remaining data as cosignatures.
    // May not be present, but `cosignatures` handles empty data.
    transaction.cosignatures = this.cosignatures()

    this.validateEmpty()

    return transaction
  }

  aggregateComplete(embedded=false) {
    return this.aggregate(embedded)
  }

  aggregateBonded(embedded=false) {
    return this.aggregate(embedded)
  }

  lock(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.mosaic = this.mosaic()
    transaction.duration = this.uint64String()
    transaction.hash = this.hash256()
    this.validateEmpty()

    return transaction
  }

  secretLock(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.secret = this.hash256()
    transaction.mosaic = this.mosaic()
    transaction.duration = this.uint64String()
    transaction.hashAlgorithm = this.uint8()
    transaction.recipientAddress = this.address()
    this.validateEmpty()

    return transaction
  }

  secretProof(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.secret = this.hash256()
    let proofSize = this.uint16()
    transaction.hashAlgorithm = this.uint8()
    transaction.recipientAddress = this.address()
    transaction.proof = this.hex(proofSize)
    this.validateEmpty()

    return transaction
  }

  accountRestrictionTransaction(restriction, embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.restrictionFlags = this.uint16()
    let additionsCount = this.uint8()
    let deletionsCount = this.uint8()
    // Skip reserved value.
    this.uint32()

    // Parse the additions.
    transaction.restrictionAdditions = []
    this.n(transaction.restrictionAdditions, additionsCount, restriction)

    // Parse the deletions.
    transaction.restrictionDeletions = []
    this.n(transaction.restrictionDeletions, deletionsCount, restriction)

    this.validateEmpty()

    return transaction
  }

  accountRestrictionAddress(embedded=false) {
    return this.accountRestrictionTransaction('address', embedded)
  }

  accountRestrictionMosaic(embedded=false) {
    return this.accountRestrictionTransaction('id', embedded)
  }

  accountRestrictionOperation(embedded=false) {
    return this.accountRestrictionTransaction('entityType', embedded)
  }

  linkAccount(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.remotePublicKey = this.key()
    transaction.linkAction = this.uint8()
    this.validateEmpty()

    return transaction
  }

  mosaicAddressRestriction(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.mosaicId = this.id()
    transaction.restrictionKey = this.uint64String()
    transaction.previousRestrictionValue = this.uint64String()
    transaction.newRestrictionValue = this.uint64String()
    transaction.targetAddress = this.address()
    this.validateEmpty()

    return transaction
  }

  mosaicGlobalRestriction(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.mosaicId = this.id()
    transaction.referenceMosaicId = this.id()
    transaction.restrictionKey = this.uint64String()
    transaction.previousRestrictionValue = this.uint64String()
    transaction.newRestrictionValue = this.uint64String()
    transaction.previousRestrictionType = this.uint8()
    transaction.newRestrictionType = this.uint8()
    this.validateEmpty()

    return transaction
  }

  accountMetadata(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.targetPublicKey = this.key()
    transaction.scopedMetadataKey = this.uint64String()
    transaction.valueSizeDelta = this.int16()
    let valueSize = this.uint16()
    transaction.value = this.hex(valueSize)
    this.validateEmpty()

    return transaction
  }

  mosaicMetadata(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.targetPublicKey = this.key()
    transaction.scopedMetadataKey = this.uint64String()
    transaction.targetMosaicId = this.id()
    transaction.valueSizeDelta = this.int16()
    let valueSize = this.uint16()
    transaction.value = this.hex(valueSize)
    this.validateEmpty()

    return transaction
  }

  namespaceMetadata(embedded=false) {
    let transaction = this.baseTransaction(embedded)
    transaction.targetPublicKey = this.key()
    transaction.scopedMetadataKey = this.uint64String()
    transaction.targetNamespaceId = this.id()
    transaction.valueSizeDelta = this.int16()
    let valueSize = this.uint16()
    transaction.value = this.hex(valueSize)
    this.validateEmpty()

    return transaction
  }

  transactionHeader(type, embedded=false) {
    let method = constants.transactionType.inv[type]
    if (method === undefined) {
      throw new Error(`invalid transaction type, got ${type}`)
    }
    return this[method](embedded)
  }

  transaction(embedded=false, ignoreSize=false) {
    // First, get our entity data so we can parse the verifiable entity and block.
    let size = shared.readUint32(this._data.slice(0, 4))
    let alignedSize = align(size, 8)
    let entityData = this._data.slice(0, size)
    this._data = this._data.slice(alignedSize)

    // Create a reader for the transaction entity.
    let entityReader = new Reader(entityData)
    let entity = entityReader.entity(embedded, ignoreSize)
    let transaction = entityReader.transactionHeader(entity.type, embedded)

    return {
      entity,
      transaction
    }
  }

  transactions(embedded=false, ignoreSize=false) {
    // Read transaction data while we still have remaining data.
    // It will either completely parse or throw an error.
    let transactions = []
    while (this._data.length !== 0) {
      transactions.push(this.transaction(embedded, ignoreSize))
    }

    return transactions
  }

  blockHeader() {
    let height = this.uint64String()
    let timestamp = this.uint64String()
    let difficulty = this.uint64String()
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

  block(ignoreSize=false) {
    // First, get our entity data so we can parse the verifiable entity and block.
    let size = shared.readUint32(this._data.slice(0, 4))
    if (ignoreSize) {
      // Only have a block header published, but the entity size does not reflect
      // this. The block header size will always be 304 bytes.
      //  https://github.com/nemtech/catapult-server/issues/62
      size = constants.entitySize.blockHeader
    }
    let entityData = this._data.slice(0, size)
    this._data = this._data.slice(size)

    // Create a dependent reader.
    let entityReader = new Reader(entityData)
    let entity = entityReader.verifiableEntity(ignoreSize)
    let block = entityReader.blockHeader()
    if (entityReader.data.length !== 0) {
      // Add the embedded transactions.
      block.transactions = entityReader.transactions(false, ignoreSize)
    }
    entityReader.validateEmpty()

    return {
      entity,
      block
    }
  }

  blocks(ignoreSize=false) {
    // Read transaction data while we still have remaining data.
    // It will either completely parse or throw an error.
    let blocks = []
    while (this._data.length !== 0) {
      blocks.push(this.block(ignoreSize))
    }

    return blocks
  }
}

// WRITERS

class Writer extends BaseWriter {
  // Size-prefix for an entity
  sizePrefix(value) {
    this.uint32(value)
  }

  // Body of an entity.
  entityBody(value) {
    this.key(value.key)
    // Write the reserved value
    this.uint32(0)
    this.uint8(value.version)
    this.uint8(value.network)
    this.uint16(value.type)
  }

  // Verification of an entity
  entityVerification(value) {
    // Write the reserved value
    this.uint32(0)
    this.signature(value.signature)
  }

  // Verifiable entity with a signature and signer key.
  // Used for transactions and blocks.
  verifiableEntity(value) {
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
    // Write a dummy size, we need to fix it after.
    this.sizePrefix(0)
    this.entityVerification(value)
    this.entityBody(value)
  }

  // Size-prefixed entity.
  // Used for embedded transactions.
  embeddedEntity(value) {
    // Write a dummy size, we need to fix it after.
    this.sizePrefix(0)
    // Write the reserved value
    this.uint32(0)
    this.entityBody(value)
  }

  entity(value, embedded) {
    if (embedded) {
      this.embeddedEntity(value)
    } else {
      this.verifiableEntity(value)
    }
  }

  mosaic(value) {
    this.id(value.id)
    this.uint64String(value.amount)
  }

  cosignature(value) {
    this.key(value.signerPublicKey)
    this.signature(value.signature)
  }

  cosignatures(value) {
    this.n(value, 'cosignature')
  }

  baseTransaction(value, embedded) {
    if (!embedded) {
      this.uint64String(value.maxFee)
      this.uint64String(value.deadline)
    }
  }

  transfer(value, embedded) {
    this.baseTransaction(value, embedded)
    this.address(value.recipientAddress)
    this.uint8(value.mosaics.length)
    this.uint16(Math.floor(value.message.length / 2))
    // Write the reserved value.
    this.uint32(0)
    this.n(value.mosaics, 'mosaic')
    this.hex(value.message)
  }

  registerNamespace(value, embedded) {
    this.baseTransaction(value, embedded)
    if (value.namespaceType === constants.namespaceType.root) {
      this.uint64String(value.duration)
    } else if (value.namespaceType === constants.namespaceType.child) {
      this.id(value.parentId)
    } else {
      throw new Error(`invalid namespace type, got ${value.namespaceType}`)
    }
    this.id(value.namespaceId)
    this.uint8(value.namespaceType)
    this.uint8(value.name.length)
    this.ascii(value.name)
  }

  addressAlias(value, embedded) {
    this.baseTransaction(value, embedded)
    this.id(value.namespaceId)
    this.address(value.address)
    this.uint8(value.aliasAction)
  }

  mosaicAlias(value, embedded) {
    this.baseTransaction(value, embedded)
    this.id(value.namespaceId)
    this.id(value.mosaicId)
    this.uint8(value.aliasAction)
  }

  mosaicDefinition(value, embedded) {
    this.baseTransaction(value, embedded)
    this.id(value.mosaicId)
    this.uint64String(value.duration)
    this.uint32(value.nonce)
    this.uint8(value.flags)
    this.uint8(value.divisibility)
  }

  mosaicSupplyChange(value, embedded) {
    this.baseTransaction(value, embedded)
    this.id(value.mosaicId)
    this.uint64String(value.delta)
    this.uint8(value.action)
  }

  modifyMultisigAccount(value, embedded) {
    this.baseTransaction(value, embedded)
    this.int8(value.minRemovalDelta)
    this.int8(value.minApprovalDelta)
    this.int8(value.publicKeyAdditions.length)
    this.int8(value.publicKeyDeletions.length)
    // Write reserved value.
    this.uint32(0)
    this.n(value.publicKeyAdditions, 'key')
    this.n(value.publicKeyDeletions, 'key')
  }

  // Both aggregate transactions have the same layout.
  aggregate(value, embedded) {
    assert(!embedded, 'aggregate transaction cannot be embedded')

    this.baseTransaction(value, embedded)
    this.hash256(value.aggregateHash)

    // Create an embedded writer
    let writer = new Writer()
    // Write a dummy transactions size and re-write it later.
    writer.uint32(0)
    // Write the reserved value
    writer.uint32(0)
    let initial = writer.size

    // Write the embedded transactions, and re-write the size, and then
    // copy the data over.
    writer.transactions(value.innerTransactions, true)
    let length = writer.size - initial
    shared.writeUint32(writer._data, length, 0)
    this.binary(writer.data)

    // Now, write the remaining cosignatures.
    this.cosignatures(value.cosignatures)
  }

  aggregateComplete(value, embedded) {
    return this.aggregate(value, embedded)
  }

  aggregateBonded(value, embedded) {
    return this.aggregate(value, embedded)
  }

  lock(value, embedded) {
    this.baseTransaction(value, embedded)
    this.mosaic(value.mosaic)
    this.uint64String(value.duration)
    this.hash256(value.hash)
  }

  secretLock(value, embedded) {
    this.baseTransaction(value, embedded)
    this.hash256(value.secret)
    this.mosaic(value.mosaic)
    this.uint64String(value.duration)
    this.uint8(value.hashAlgorithm)
    this.address(value.recipientAddress)
  }

  secretProof(value, embedded) {
    this.baseTransaction(value, embedded)
    this.hash256(value.secret)
    this.uint16(Math.floor(value.proof.length / 2))
    this.uint8(value.hashAlgorithm)
    this.address(value.recipientAddress)
    this.hex(value.proof)
  }

  accountRestrictionTransaction(value, restriction, embedded) {
    this.baseTransaction(value, embedded)
    this.uint16(value.restrictionFlags)
    this.uint8(value.restrictionAdditions.length)
    this.uint8(value.restrictionDeletions.length)
    // Write the reserved value
    this.uint32(0)
    this.n(value.restrictionAdditions, restriction)
    this.n(value.restrictionDeletions, restriction)
  }

  accountRestrictionAddress(value, embedded) {
    return this.accountRestrictionTransaction(value, 'address', embedded)
  }

  accountRestrictionMosaic(value, embedded) {
    return this.accountRestrictionTransaction(value, 'id', embedded)
  }

  accountRestrictionOperation(value, embedded) {
    return this.accountRestrictionTransaction(value, 'entityType', embedded)
  }

  linkAccount(value, embedded) {
    this.baseTransaction(value, embedded)
    this.key(value.remotePublicKey)
    this.uint8(value.linkAction)
  }

  mosaicAddressRestriction(value, embedded) {
    this.baseTransaction(value, embedded)
    this.id(value.mosaicId)
    this.uint64String(value.restrictionKey)
    this.uint64String(value.previousRestrictionValue)
    this.uint64String(value.newRestrictionValue)
    this.address(value.targetAddress)
  }

  mosaicGlobalRestriction(value, embedded) {
    this.baseTransaction(value, embedded)
    this.id(value.mosaicId)
    this.id(value.referenceMosaicId)
    this.uint64String(value.restrictionKey)
    this.uint64String(value.previousRestrictionValue)
    this.uint64String(value.newRestrictionValue)
    this.uint8(value.previousRestrictionType)
    this.uint8(value.newRestrictionType)
  }

  accountMetadata(value, embedded) {
    this.baseTransaction(value, embedded)
    this.key(value.targetPublicKey)
    this.uint64String(value.scopedMetadataKey)
    this.int16(value.valueSizeDelta)
    this.uint16(Math.floor(value.value.length / 2))
    this.hex(value.value)
  }

  mosaicMetadata(value, embedded) {
    this.baseTransaction(value, embedded)
    this.key(value.targetPublicKey)
    this.uint64String(value.scopedMetadataKey)
    this.id(value.targetMosaicId)
    this.int16(value.valueSizeDelta)
    this.uint16(Math.floor(value.value.length / 2))
    this.hex(value.value)
  }

  namespaceMetadata(value, embedded) {
    this.baseTransaction(value, embedded)
    this.key(value.targetPublicKey)
    this.uint64String(value.scopedMetadataKey)
    this.id(value.targetNamespaceId)
    this.int16(value.valueSizeDelta)
    this.uint16(Math.floor(value.value.length / 2))
    this.hex(value.value)
  }

  transactionHeader(value, type, embedded) {
    let method = constants.transactionType.inv[type]
    if (method === undefined) {
      throw new Error(`invalid transaction type, got ${type}`)
    }
    this[method](value, embedded)
  }

  transaction(value, embedded) {
    // Store a cursor to the index prior, so we can re-write the size later.
    let initial = this.size

    // Write the entity and header.
    this.entity(value.entity, embedded)
    this.transactionHeader(value.transaction, value.entity.type, embedded)

    // Now, re-write the size.
    let length = this.size - initial
    shared.writeUint32(this._data, length, initial)

    // Now, need to write the aligned size.
    let alignedLength = align(length, 8)
    let difference = alignedLength - length
    let fill = Buffer.alloc(difference)
    this.binary(fill)
  }

  transactions(value, embedded) {
    this.n(value, transaction => this.transaction(transaction, embedded))
  }

  blockHeader(value) {
    this.uint64String(value.height)
    this.uint64String(value.timestamp)
    this.uint64String(value.difficulty)
    this.hash256(value.previousBlockHash)
    this.hash256(value.transactionsHash)
    this.hash256(value.receiptsHash)
    this.hash256(value.stateHash)
    this.key(value.beneficiaryPublicKey)
    this.uint32(value.feeMultiplier)
    // Write the reserved value
    this.uint32(0)
  }

  block(value) {
    // Store a cursor to the index prior, so we can re-write the size later.
    let initial = this.size

    // Write the data, with a verifiable entity using a size of 0.
    this.verifiableEntity(value.entity)
    this.blockHeader(value.block)
    if (value.block.transactions !== undefined) {
      this.transactions(value.block.transactions)
    }

    // Now, re-write the size.
    let length = this.size - initial
    shared.writeUint32(this._data, length, initial)
  }

  blocks(value) {
    this.n(value, 'block')
  }
}

export default {
  Reader,
  Writer
}
