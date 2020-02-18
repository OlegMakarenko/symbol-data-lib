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
      size,
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

  // TODO(ahuszagh) Add more...
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

/**
 *  Codec for the spool stores.
 */
export default {
  // Stores a uint64 value containing the index of the next value.
  // This denotes the filenames stored, which may or may not be present.
  // For example, if the value is 7270 (0x1c66), then we have data
  // files for [0000000000000000.dat, 0000000000001C65.dat].
  // These values may be pruned (often are), and therefore may not be present.
  index: data => SpoolReader.solitary(data, 'long'),

  block_change: data => {
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

  block_sync: data => {
    console.log(data)
    throw new Error('not yet implemented...')
  }
}
