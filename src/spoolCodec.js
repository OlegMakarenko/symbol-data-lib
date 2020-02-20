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
 *  Codec to transform spool models to JSON.
 */

import MongoDb from 'mongodb'
import fs from 'fs'
import path from 'path'
import Reader from './reader'
import shared from './shared'

// CONSTANTS
const BLOCK_SAVED = 0
const BLOCKS_DROPPED = 1
const ADD_PARTIAL_TRANSACTIONS = 0
const REMOVE_PARTIAL_TRANSACTIONS = 1
const ADD_COSIGNATURE = 2
const SCORE_CHANGE = 0
const STATE_CHANGE = 1
const ADD_UNCONFIRMED_TRANSACTIONS = 0
const REMOVE_UNCONFIRMED_TRANSACTIONS = 1
const RECEIPT_OTHER = 0x0
const RECEIPT_BALANCE_TRANSFER = 0x1
const RECEIPT_BALANCE_CREDIT = 0x2
const RECEIPT_BALANCE_DEBIT = 0x3
const RECEIPT_ARTIFACT_EXPIRY = 0x4
const RECEIPT_INFLATION = 0x5
const RECEIPT_AGGREGATE = 0xE
const RECEIPT_ALIAS_RESOLUTION = 0xF
const RECEIPT_ADDRESS_RESOLUTION = 1
const RECEIPT_MOSAIC_RESOLUTION = 2
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

class SpoolReader extends Reader {
  static solitary(data, fn) {
    let reader = new SpoolReader(data)
    return reader.solitary(fn)
  }

  // READERS

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
    let size = this.uint32()
    if (this.data.length < size - 4) {
      throw new Error('invalid sized-prefixed entity: data is too short')
    }
    // Skip reserved value.
    this.uint32()
    let signature = this.signature()
    let key = this.key()
    // Skip reserved value.
    this.uint32()
    let version = this.uint8()
    let network = this.uint8()
    let type = this.uint16()

    return {
      signature,
      key,
      version,
      network,
      type
    }
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

  baseTransaction() {
    let maxFee = this.uint64()
    let deadline = this.uint64()

    return {
      maxFee,
      deadline
    }
  }

  transferTransaction() {
    // Parse the fixed data.
    let transaction = this.baseTransaction()
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

  registerNamespaceTransaction() {
    // Parse the fixed data.
    let transaction = this.baseTransaction()
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

  addressAliasTransaction() {
    console.log(`addressAliasTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  mosaicAliasTransaction() {
    console.log(`mosaicAliasTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  mosaicDefinitionTransaction() {
    console.log(`mosaicDefinitionTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  mosaicSupplyChangeTransaction() {
    console.log(`mosaicSupplyChangeTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  modifyMultisigTransaction() {
    console.log(`modifyMultisigTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  aggregateCompleteTransaction() {
    console.log(`aggregateCompleteTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  aggregateBondedTransaction() {
    console.log(`aggregateBondedTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  lockTransaction() {
    console.log(`lockTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  secretLockTransaction() {
    console.log(`secretLockTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  secretProofTransaction() {
    console.log(`secretProofTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  accountRestrictionAddressTransaction() {
    console.log(`accountRestrictionAddressTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  accountRestrictionMosaicTransaction() {
    console.log(`accountRestrictionMosaicTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  accountRestrictionOperationTransaction() {
    console.log(`accountRestrictionOperationTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  linkAccountTransaction() {
    console.log(`linkAccountTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  mosaicAddressRestrictionTransaction() {
    console.log(`mosaicAddressRestrictionTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  mosaicGlobalRestrictionTransaction() {
    console.log(`mosaicGlobalRestrictionTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  accountMetadataTransaction() {
    console.log(`accountMetadataTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  mosaicMetadataTransaction() {
    console.log(`mosaicMetadataTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  namespaceMetadataTransaction() {
    console.log(`namespaceMetadataTransaction data.length=${this.data.length}`)
    // TODO(ahuszagh) Implement...
  }

  transactionHeader(type) {
    if (type === TRANSACTION_TRANSFER) {
      return this.transferTransaction()
    } else if (type === TRANSACTION_REGISTER_NAMESPACE) {
      return this.registerNamespaceTransaction()
    } else if (type === TRANSACTION_ADDRESS_ALIAS) {
      return this.addressAliasTransaction()
    } else if (type === TRANSACTION_MOSAIC_ALIAS) {
      return this.mosaicAliasTransaction()
    } else if (type === TRANSACTION_MOSAIC_DEFINITION) {
      return this.mosaicDefinitionTransaction()
    } else if (type === TRANSACTION_MOSAIC_SUPPLY_CHANGE) {
      return this.mosaicSupplyChangeTransaction()
    } else if (type === TRANSACTION_MODIFY_MULTISIG_ACCOUNT) {
      return this.modifyMultisigTransaction()
    } else if (type === TRANSACTION_AGGREGATE_COMPLETE) {
      return this.aggregateCompleteTransaction()
    } else if (type === TRANSACTION_AGGREGATE_BONDED) {
      return this.aggregateBondedTransaction()
    } else if (type === TRANSACTION_LOCK) {
      return this.lockTransaction()
    } else if (type === TRANSACTION_SECRET_LOCK) {
      return this.secretLockTransaction()
    } else if (type === TRANSACTION_SECRET_PROOF) {
      return this.secretProofTransaction()
    } else if (type === TRANSACTION_ACCOUNT_RESTRICTION_ADDRESS) {
      return this.accountRestrictionAddressTransaction()
    } else if (type === TRANSACTION_ACCOUNT_RESTRICTION_MOSAIC) {
      return this.accountRestrictionMosaicTransaction()
    } else if (type === TRANSACTION_ACCOUNT_RESTRICTION_OPERATION) {
      return this.accountRestrictionOperationTransaction()
    } else if (type === TRANSACTION_LINK_ACCOUNT) {
      return this.linkAccountTransaction()
    } else if (type === TRANSACTION_MOSAIC_ADDRESS_RESTRICTION) {
      return this.mosaicAddressRestrictionTransaction()
    } else if (type === TRANSACTION_MOSAIC_GLOBAL_RESTRICTION) {
      return this.mosaicGlobalRestrictionTransaction()
    } else if (type === TRANSACTION_ACCOUNT_METADATA_TRANSACTION) {
      return this.accountMetadataTransaction()
    } else if (type === TRANSACTION_MOSAIC_METADATA_TRANSACTION) {
      return this.mosaicMetadataTransaction()
    } else if (type === TRANSACTION_NAMESPACE_METADATA_TRANSACTION) {
      return this.namespaceMetadataTransaction()
    } else {
      throw new Error(`invalid transaction type, got ${type}`)
    }
  }

  transaction() {
    // First, get our entity data so we can parse the verifiable entity and block.
    let size = shared.binaryToUint32(this.data.slice(0, 4))
    let alignedSize = align(size, 8)
    let entityData = this.data.slice(0, size)
    this.data = this.data.slice(alignedSize)

    // Create a dependent reader.
    let entityReader = new SpoolReader(entityData)
    let entity = entityReader.verifiableEntity()
    let transaction = entityReader.transactionHeader(entity.type)

    return {
      entity,
      transaction
    }
  }

  transactions() {
    // Read transaction data while we still have remaining data.
    // It will either completely parse or throw an error.
    let transactions = []
    while (this.data.length !== 0) {
      transactions.push(this.transaction())
    }

    return transactions
  }

  block() {
    // First, get our entity data so we can parse the verifiable entity and block.
    let size = shared.binaryToUint32(this.data.slice(0, 4))
    let entityData = this.data.slice(0, size)
    this.data = this.data.slice(size)

    // Create a dependent reader.
    let entityReader = new SpoolReader(entityData)
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

  transactionHash() {
    let entityHash = this.hash256()
    let merkleComponentHash = this.hash256()

    return {
      entityHash,
      merkleComponentHash
    }
  }

  transactionsHashes() {
    let transactionsCount = this.uint32()
    let transactions = []
    this.n(transactions, transactionsCount, 'transactionHash')
    return transactions
  }

  merkleRoots() {
    let merkleCount = this.uint32()
    let merkleRoots = []
    this.n(merkleRoots, merkleCount, 'hash256')
    return merkleRoots
  }

  blockElement() {
    let {entity, block} = this.block()
    let entityHash = this.hash256()
    let generationHash = this.hash256()
    let transactions = this.transactionsHashes()
    let merkleRoots = this.merkleRoots()

    return {
      entity,
      block,
      entityHash,
      generationHash,
      transactions,
      merkleRoots
    }
  }

  mosaic() {
    let mosaicId = this.id()
    let amount = this.uint64()

    return {
      mosaicId,
      amount
    }
  }

  receiptSource() {
    let primaryId = this.uint32()
    let secondaryId = this.uint32()

    return {
      primaryId,
      secondaryId
    }
  }

  receipt() {
    // First 4 bytes are always the receipt size, in bytes.
    // The receipt size includes the header size, version, and type, so skip
    // sizeof(uint32_t) + sizeof(uint16_t) + sizeof(uint16_t), or 8 bytes.
    let receiptSize = this.uint32()
    let version = this.uint16()
    let type = this.uint16()
    let receiptBuffer = this.binaryN(receiptSize - 8)
    let basicType = (type >> 12) & 0xF
    let code = (type >> 8) & 0xF
    let receipt = {type, version}

    // The receipt format depends on the type.
    // We create a nested reader, ensure it fully reads the buffer,
    // and define the type accordingly.
    let receiptReader = new SpoolReader(receiptBuffer)
    if (basicType === RECEIPT_OTHER) {
      // Unknown basic type, just return the hex data.
      receipt.data = receiptReader.hexN(receiptSize - 8)
    } else if (basicType === RECEIPT_BALANCE_TRANSFER) {
      receipt.mosaic = receiptReader.mosaic()
      receipt.senderPublicKey = receiptReader.key()
      receipt.receipientAddress = receiptReader.address()
    } else if (basicType === RECEIPT_BALANCE_CREDIT) {
      receipt.mosaic = receiptReader.mosaic()
      receipt.targetPublicKey = receiptReader.key()
    } else if (basicType === RECEIPT_BALANCE_DEBIT) {
      // Currently not used: shouldn't contained anything.
    } else if (basicType === RECEIPT_ARTIFACT_EXPIRY) {
      receipt.artifactId = receiptReader.hexN(receiptSize - 8)
    } else if (basicType === RECEIPT_INFLATION) {
      receipt.mosaic = receiptReader.mosaic()
    } else if (basicType === RECEIPT_AGGREGATE) {
      // Should be empty.
    } else if (basicType === RECEIPT_ALIAS_RESOLUTION) {
      // Contains either an address or a mosaic ID, depending on the type.
      if (code === RECEIPT_ADDRESS_RESOLUTION) {
        receipt.address = receiptReader.address()
      } else if (code === RECEIPT_MOSAIC_RESOLUTION) {
        receipt.mosaicId = receiptReader.id()
      } else {
        throw new Error(`invalid alias resolution code, got ${code}`)
      }
    } else {
      throw new Error(`invalid receipt type, got ${type}`)
    }
    receiptReader.validateEmpty()

    return receipt
  }

  transactionStatement() {
    let source = this.receiptSource()
    let receiptCount = this.uint32()
    let receipts = []
    this.n(receipts, receiptCount, 'receipt')

    return {
      source,
      receipts
    }
  }

  transactionStatements() {
    let statementCount = this.uint32()
    let statements = []
    this.n(statements, statementCount, 'transactionStatement')
    return statements
  }

  addressResolution() {
    let source = this.receiptSource()
    let value = this.address()

    return {
      source,
      value
    }
  }

  addressResolutionStatement() {
    let source = this.address()
    let resolutionCount = this.uint32()
    let resolutions = []
    this.n(resolutions, resolutionCount, 'addressResolution')

    return {
      source,
      resolutions
    }
  }

  addressResolutionStatements() {
    let statementCount = this.uint32()
    let statements = []
    this.n(statements, statementCount, 'addressResolutionStatement')
    return statements
  }

  mosaicResolution() {
    let source = this.receiptSource()
    let value = this.id()

    return {
      source,
      value
    }
  }

  mosaicResolutionStatement() {
    let source = this.id()
    let resolutionCount = this.uint32()
    let resolutions = []
    this.n(resolutions, resolutionCount, 'mosaicResolution')

    return {
      source,
      resolutions
    }
  }

  mosaicResolutionStatements() {
    let statementCount = this.uint32()
    let statements = []
    this.n(statements, statementCount, 'mosaicResolutionStatement')
    return statements
  }

  blockStatement() {
    let transactionStatements = this.transactionStatements()
    let addressResolutionStatements = this.addressResolutionStatements()
    let mosaicResolutionStatements = this.mosaicResolutionStatements()

    return {
      transactionStatements,
      addressResolutionStatements,
      mosaicResolutionStatements
    }
  }

  optionalBlockStatement() {
    let sentinel = this.uint8()
    if (sentinel === 0xFF) {
      return this.blockStatement()
    } else if (sentinel === 0) {
      return null
    } else {
      throw new Error(`invalid sentinel for an optional block statement, got ${sentinel}`)
    }
  }

  transactionInfo() {
    let entityHash = this.hash256()
    let merkleComponentHash = this.hash256()

    let addressCount = this.long()
    let minus1 = MongoDb.Long.fromInt(-1)
    let extractedAddresses
    if (addressCount.notEquals(minus1)) {
      extractedAddresses = []
      this.nLong(extractedAddresses, addressCount, 'address')
    } else {
      extractedAddresses = null
    }
    let {entity, transaction} = this.transaction()

    return {
      entityHash,
      merkleComponentHash,
      extractedAddresses,
      entity,
      transaction
    }
  }

  transactionInfos() {
    let infoCount = this.uint32()
    let infos = []
    this.n(infos, infoCount, 'transactionInfo')
    return infos
  }

  chainScore() {
    let scoreHigh = this.uint64()
    let scoreLow = this.uint64()

    return {
      scoreHigh,
      scoreLow
    }
  }


// TODO(ahuszagh) These are the 11 plugins.
//  They are loaded in sorted order.
// accountlink
// aggregate
// lockhash
// locksecret
// metadata
// mosaic
// multisig
//  key = Key
// namespace
// restrictionaccount
//  key = Address
// restrictionmosaic
//  key = Hash256
// transfer
//
// Full Trace:
//     FileStateChangeStorage::notifyStateChange
//       pStorage->saveAll(stateChangeInfo.CacheChanges, *m_pOutputStream);
//       virtual CacheChangesStorage::saveAll
//         CacheChangesStorageAdapter::saveAll
//         WriteCacheChanges<TStorageTraits>(changes.sub<TCache>(), output);
//
//  Data:
//    type = 01
//    chainScoreHigh = 0000000000000000
//    chainScoreLow = 8836b1641b380000
//    height = 510e000000000000
//    index 0:
//      CountBytes = 0000000000000000
//      Count = 0
//      Type = Unknown
//    index 1:
//      CountBytes = 0000000000000000
//      Count = 0
//      Type = Unknown
//    index 2:
//      CountBytes = 0100000000000000
//      Count = 1
//      Type = Address
//      Data = 989d619a4c32ccdabe2b498ac1034b3fc8c30e56f183af2f72
//    index 3:
//      CountBytes = 0100000000000000
//      Count = 1
//      Type = Key/Hash256
//      Data = b35833b6ddf147deee0f659335ee4331eeae80670f45d29ff4ec02c46303866b
//    index 4:
//      CountBytes = 0200000000000000
//      Count = 2
//    Trailing Data:
//      00000000000000000000000000000000000000000000000000000000000000000001b4cd410000000000320b000000000000320b00000000000000000000000000001f030000b4cd4100000000009905000000000000000000000000000099050000b4cd4100000000000100000000000000000000000000000098050000703839000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000527bfd6b8eff66102000527bfd6b8eff6616025e9253a99010098177a9e2a9fe922703839000000000070383900000000009905000000000000703839000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000510e000000000000d87290e9010000009d36b1641b38000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

  cacheChanges() {
    let cacheChanges = []
    let zero = MongoDb.Long.fromInt(0)  // TODO(ahuszagh) Remove
    while (this.data.length > 0) {
      let count = this.long()
      console.log(count)
      if (count.notEquals(zero)) {
        console.log(this.data.toString('hex'))
        // TODO(ahuszagh) Need to consider here..
        break
      }
    }

    return cacheChanges
  }

  // TODO(ahuszagh) Add more...
}

// DIRECTORY UTILITIES

// Get the current index, or 0 if no index is provided.
const getIndex = index => {
  if (index['index.dat'] !== undefined) {
    return index['index.dat']
  }
  return MongoDb.Long.fromInt(0)
}

// Get the default max filename, which is a 16-bit hex filename.
const maxFile = index => {
  let id = index.toString(16)
    .padStart(16, '0')
    return `${id}.dat`
}

/**
 *  Classify all paths in the directory as either index or non-index paths.
 */
const classifyIndexedPaths = directory => {
  let files = fs.readdirSync(directory)
  let index = files.filter(file => file.startsWith('index'))
  let data = files.filter(file => !file.startsWith('index'))

  return {
    index: index.map(file => path.join(directory, file)),
    data: data.map(file => path.join(directory, file))
  }
}

/**
 *  Read all files in an indexed directory.
 *
 *  Uses the codec to provide the callback.
 */
const readIndexedDirectory = (directory, codecName) => {
  let files = classifyIndexedPaths(directory)
  let index = getIndex(codec.index.fromFiles(files))
  let max = maxFile(index)

  let result = {}
  for (let file of files.data) {
    let basename = path.basename(file).toLowerCase()
    if (basename < max) {
      let data = fs.readFileSync(file)
      let value = codec[codecName].file(data)
      result[basename] = value
    }
  }

  return result
}

// CODEC

/**
 *  Codec for the spool stores.
 */
const codec = {
  index: {
    // Stores a uint64 value containing the index of the next value.
    // This denotes the filenames stored, which may or may not be present.
    // For example, if the value is 7270 (0x1c66), then we have data
    // files for [0000000000000000.dat, 0000000000001C65.dat].
    // These values may be pruned (often are), and therefore may not be present.
    file: data => SpoolReader.solitary(data, 'long'),

    // Read from a list of pre-classified files.
    fromFiles: files => {
      let result = {}
      for (let file of files.index) {
        let data = fs.readFileSync(file)
        let key = path.basename(file)
        let value = codec.index.file(data)
        result[key] = value
      }

      return result
    },

    // Read the index values from the directory.
    // Checks all:
    //    index.dat
    //    index_server.dat
    //    index_broker_r.dat
    directory: directory => {
      return codec.index.fromFiles(classifyIndexedPaths(directory))
    }
  },

  block_change: {
    // Read generic file.
    file: data => {
      // Model:
      //  Note: blockStatement can either be a BlockStatement, or empty.
      //
      //  struct Transaction {
      //    Hash256 entityHash;
      //    Hash256 merkleComponentHash;
      //  }
      //
      //  struct BlocksSaved {
      //    // Verifiable Entity Data
      //
      //
      //    // Block Header
      //    uint8_t type;
      //    Height height;
      //    uint64_t timestamp;
      //    uint64_t difficulty;
      //    Hash256 previousBlockHash;
      //    Hash256 transactionHash;
      //    Hash256 receiptsHash;
      //    Hash256 stateHash;
      //    Key beneficiaryPublicKey;
      //    uint32_t feeMultiplier;
      //    uint32_t _reserved;
      //
      //    // Remaining Constant-Sized Data
      //    Hash256 entityHash;
      //    Hash256 generationHash;
      //
      //    // Variable-Length Data
      //    uint32_t transactionsCount;
      //    Transaction[transactionsCount] transactions;
      //
      //    uint32_t merkleCount;
      //    Hash256[merkleCount] merkleRoots;
      //
      //    // Block Statement
      //    uint8_t sentinel;
      //    OptionalBlockStatement blockStatement;
      //  }
      //
      //  struct BlocksDropped {
      //    uint8_t type;
      //    Height height;
      //  }

      let reader = new SpoolReader(data)
      let type = reader.uint8()
      let value = {type}

      if (type === BLOCK_SAVED) {
        Object.assign(value, reader.blockElement())
        value.blockStatement = reader.optionalBlockStatement()
      } else if (type === BLOCKS_DROPPED) {
        value.height = reader.uint64()
      } else {
        throw new Error(`invalid block change operation type, got ${type}`)
      }

      reader.validateEmpty()

      return value
    },

    // Read all files in directory.
    directory: directory => readIndexedDirectory(directory, 'block_change')
  },

  block_sync: {
    // Read a block or block element (both formats are the same).
    block: data => SpoolReader.solitary(data, 'blockElement'),

    // Read a block statement.
    blockStatement: data => SpoolReader.solitary(data, 'blockStatement'),

    // Read a hashes data file.
    hashes: data => {
      if (data.length % 32 !== 0) {
        throw new Error('Hashes file does not contain only hashes.')
      }
      let reader = new SpoolReader(data)
      let hashes = []
      while (reader.data.length !== 0) {
        hashes.push(reader.hash256())
      }
      return hashes
    },

    // Read from a list of pre-classified directories.
    fromDirectories: directories => {
      let result = {}
      let subResult
      for (let directory of directories) {
        result[path.basename(directory)] = subResult = {}
        let files = fs.readdirSync(directory)
        for (let file of files) {
          let data = fs.readFileSync(path.join(directory, file))
          if (file === 'hashes.dat') {
            subResult[file] = codec.block_sync.hashes(data)
          } else if (file.endsWith('.dat')) {
            subResult[file] = codec.block_sync.block(data)
          } else if (file.endsWith('.stmt')) {
            subResult[file] = codec.block_sync.blockStatement(data)
          } else {
            throw new Error(`invalid block sync file, got ${file}`)
          }
        }
      }

      return result
    },

    // Read all files in directory.
    directory: directory => {
      let directories = fs.readdirSync(directory).map(file => path.join(directory, file))
      return codec.block_sync.fromDirectories(directories)
    }
  },

  partial_transactions_change: {
    // Read generic file.
    file: data => {

      let reader = new SpoolReader(data)
      let type = reader.uint8()
      let value = {type}

      if (type === ADD_PARTIAL_TRANSACTIONS) {
        value.transactionInfos = reader.transactionInfos()
      } else if (type === REMOVE_PARTIAL_TRANSACTIONS) {
        value.transactionInfos = reader.transactionInfos()
      } else if (type === ADD_COSIGNATURE) {
        value.signer = reader.key()
        value.signature = reader.signature()
        value.transactionInfo = reader.transactionInfo()
      } else {
        throw new Error(`invalid block change operation type, got ${type}`)
      }

      reader.validateEmpty()

      return value
    },

    // Read all files in directory
    directory: directory => readIndexedDirectory(directory, 'partial_transactions_change')
  },

  state_change: {
    // Read generic file.
    file: data => {
      let reader = new SpoolReader(data)
      let type = reader.uint8()
      let value = {type}
      if (type === SCORE_CHANGE) {
        value.chainScore = reader.chainScore()
      } else if (type === STATE_CHANGE) {
        value.chainScore = reader.chainScore()
        value.height = reader.uint64()
        value.cacheChanges = reader.cacheChanges()
      } else {
        throw new Error(`invalid state change operation type, got ${type}`)
      }

      reader.validateEmpty()

      return value
    },

    // Read all files in directory
    directory: directory => readIndexedDirectory(directory, 'state_change')
  },

  transaction_status: {
    // Read generic file.
    file: data => {
      // TODO(ahuszagh) Implement...
    },

    // Read all files in directory
    directory: directory => readIndexedDirectory(directory, 'state_change')
  },

  unconfirmed_transactions_change: {
    // Read generic file.
    file: data => {
      // TODO(ahuszagh) Implement...
    },

    // Read all files in directory
    directory: directory => readIndexedDirectory(directory, 'unconfirmed_transactions_change')
  }
}

export default codec
