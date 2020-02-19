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
    if (this.data.length < size) {
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

  block() {
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

  transaction() {
    let entityHash = this.hash256()
    let merkleComponentHash = this.hash256()

    return {
      entityHash,
      merkleComponentHash
    }
  }

  transactions() {
    let transactionsCount = this.uint32()
    let transactions = []
    this.n(transactions, transactionsCount, 'transaction')
    return transactions
  }

  merkleRoots() {
    let merkleCount = this.uint32()
    let merkleRoots = []
    this.n(merkleRoots, merkleCount, 'hash256')
    return merkleRoots
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
    } else {
      return null
    }
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
const maxFileDefault = index => {
  let id = index.toString(16)
    .padStart(16, '0')
    return `${id}.dat`
}

// Get the max filename for the maxFileBlockChange.
const maxFileBlockChange = index => maxFileDefault(index)

/**
 *  Classify all paths in the directory as either index or non-index paths.
 */
const classifyPaths = directory => {
  let files = fs.readdirSync(directory)
  let index = files.filter(file => file.startsWith('index'))
  let data = files.filter(file => !file.startsWith('index'))

  return {
    index: index.map(file => path.join(directory, file)),
    data: data.map(file => path.join(directory, file))
  }
}

// CODEC

// TODO(ahuszagh) Implement this at a higher level.
// readdirSync(directory, { withFileTypes: true })
// Filter for only files and those containing hex data.
//   Can ignore:
//     index.dat
//     index_server.dat
//     index_broker_r.dat

// TODO(ahuszagh) Need a way to list directory contents...

// TODO(ahuszagh) These should likely read the the entire directories, etd.
// Need to have a file and directory reader.
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
      return codec.index.fromFiles(classifyPaths(directory))
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
        value.entity = reader.verifiableEntity()
        value.block = reader.block()
        value.entityHash = reader.hash256()
        value.generationHash = reader.hash256()
        value.transactions = reader.transactions()
        value.merkleRoots = reader.merkleRoots()
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
    directory: directory => {
      let files = classifyPaths(directory)
      let index = getIndex(codec.index.fromFiles(files))
      let maxFile = maxFileBlockChange(index)

      let result = {}
      for (let file of files.data) {
        let basename = path.basename(file).toLowerCase()
        if (basename < maxFile) {
          let data = fs.readFileSync(file)
          let value = codec.block_change.file(data)
          result[basename] = value
        }
      }

      return result
    }
  },

  block_sync: data => {
// loadBlock
// loadBlockElement
// loadBlockStatementData
    console.log(data)
    throw new Error('not yet implemented...')
  },

  partial_transactions_change: data => {
//notifyAddPartials
//notifyRemovePartials
//notifyAddCosignature

    console.log(data)
    throw new Error('not yet implemented...')
  },

  state_change: data => {
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

  transaction_status: data => {
    console.log(data)
    throw new Error('not yet implemented...')
  },

  unconfirmed_transactions_change: data => {
    console.log(data)
    throw new Error('not yet implemented...')
  }
}

export default codec
