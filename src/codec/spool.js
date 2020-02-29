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
import catbuffer from './catbuffer'
import constants from './constants'

// READERS

class SpoolReader extends catbuffer.Reader {
  static solitary(data, fn, ...args) {
    let reader = new SpoolReader(data)
    return reader.solitary(fn, ...args)
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
    let receiptBuffer = this.binary(receiptSize - 8)
    let basicType = (type >> 12) & 0xF
    let code = (type >> 8) & 0xF
    let receipt = {type, version}

    // The receipt format depends on the type.
    // We create a nested reader, ensure it fully reads the buffer,
    // and define the type accordingly.
    let receiptReader = new SpoolReader(receiptBuffer)
    if (basicType === constants.receiptType.other) {
      // Unknown basic type, just return the hex data.
      receipt.data = receiptReader.hex(receiptSize - 8)
    } else if (basicType === constants.receiptType.balanceTransfer) {
      receipt.mosaic = receiptReader.mosaic()
      receipt.senderPublicKey = receiptReader.key()
      receipt.recipientAddress = receiptReader.address()
    } else if (basicType === constants.receiptType.balanceCredit) {
      receipt.mosaic = receiptReader.mosaic()
      receipt.targetPublicKey = receiptReader.key()
    } else if (basicType === constants.receiptType.balanceDebit) {
      // Currently not used: shouldn't contained anything.
    } else if (basicType === constants.receiptType.artifactExpiry) {
      receipt.artifactId = receiptReader.hex(receiptSize - 8)
    } else if (basicType === constants.receiptType.inflation) {
      receipt.mosaic = receiptReader.mosaic()
    } else if (basicType === constants.receiptType.aggregate) {
      // Should be empty.
    } else if (basicType === constants.receiptType.aliasResolution) {
      // Contains either an address or a mosaic ID, depending on the type.
      if (code === constants.receiptType.addressResolution) {
        receipt.address = receiptReader.address()
      } else if (code === constants.receiptType.mosaicResolution) {
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
    let scoreHigh = this.uint64String()
    let scoreLow = this.uint64String()

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
    while (this._data.length > 0) {
      let count = this.long()
      console.log(count)
      if (count.notEquals(zero)) {
        console.log(this._data.toString('hex'))
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
 *  Read file from path.
 */
const readFile = (file, codecName) => {
  let data = fs.readFileSync(file)
  return codec[codecName].data(data)
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
      result[basename] = readFile(file, codecName)
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
    data: data => SpoolReader.solitary(data, 'long'),

    // Read an index file.
    file: file => readFile(file, 'index'),

    // Read from a list of pre-classified files.
    fromFiles: files => {
      let result = {}
      for (let file of files.index) {
        result[path.basename(file)] = codec.index.file(file)
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
    // Read blocks saved or dropped from data.
    data: data => {
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

      if (type === constants.spoolType.blocksSaved) {
        Object.assign(value, reader.blockElement())
        value.blockStatement = reader.optionalBlockStatement()
      } else if (type === constants.spoolType.blocksDropped) {
        value.height = reader.uint64String()
      } else {
        throw new Error(`invalid block change operation type, got ${type}`)
      }

      reader.validateEmpty()

      return value
    },

    // Read a block change file.
    file: file => readFile(file, 'block_change'),

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

    // Read a block sync file.
    file: file => {
      let basename = path.basename(file)
      let data = fs.readFileSync(file)
      if (basename === 'hashes.dat') {
        return codec.block_sync.hashes(data)
      } else if (basename.endsWith('.dat')) {
        return codec.block_sync.block(data)
      } else if (basename.endsWith('.stmt')) {
        return codec.block_sync.blockStatement(data)
      } else {
        throw new Error(`invalid block sync file, got ${basename}`)
      }
    },

    // Read from a list of pre-classified directories.
    fromDirectories: directories => {
      let result = {}
      let subResult
      for (let directory of directories) {
        result[path.basename(directory)] = subResult = {}
        let files = fs.readdirSync(directory)
        for (let file of files) {
          subResult[file] = codec.block_sync.file(path.join(directory, file))
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
    // Read partial transactions change from data.
    data: data => {
      let reader = new SpoolReader(data)
      let type = reader.uint8()
      let value = {type}

      if (type === constants.spoolType.addPartialTransactions) {
        value.transactionInfos = reader.transactionInfos()
      } else if (type === constants.spoolType.removePartialTransactions) {
        value.transactionInfos = reader.transactionInfos()
      } else if (type === constants.spoolType.addCosignature) {
        value.signer = reader.key()
        value.signature = reader.signature()
        value.transactionInfo = reader.transactionInfo()
      } else {
        throw new Error(`invalid block change operation type, got ${type}`)
      }

      reader.validateEmpty()

      return value
    },

    // Read a partial transactions change file.
    file: file => readFile(file, 'partial_transactions_change'),

    // Read all files in directory
    directory: directory => readIndexedDirectory(directory, 'partial_transactions_change')
  },

  state_change: {
    // Read generic file.
    data: data => {
      let reader = new SpoolReader(data)
      let type = reader.uint8()
      let value = {type}
      if (type === constants.spoolType.scoreChange) {
        value.chainScore = reader.chainScore()
      } else if (type === constants.spoolType.stateChange) {
        value.chainScore = reader.chainScore()
        value.height = reader.uint64String()
        value.cacheChanges = reader.cacheChanges()
      } else {
        throw new Error(`invalid state change operation type, got ${type}`)
      }

      reader.validateEmpty()

      return value
    },

    // Read a state change file.
    file: file => readFile(file, 'state_change'),

    // Read all files in directory
    directory: directory => readIndexedDirectory(directory, 'state_change')
  },

  transaction_status: {
    // Read transaction status from data.
    data: data => {
      let reader = new SpoolReader(data)
      let hash = reader.hash256()
      let status = reader.uint32()
      let transaction = reader.transaction()
      reader.validateEmpty()

      return {
        hash,
        status,
        transaction
      }
    },

    // Read a transaction status file.
    file: file => readFile(file, 'transaction_status'),

    // Read all files in directory
    directory: directory => readIndexedDirectory(directory, 'transaction_status')
  },

  unconfirmed_transactions_change: {
    // Read unconfirmed transactions change from data.
    data: data => {
      let reader = new SpoolReader(data)
      let type = reader.uint8()
      let value = {type}

      if (type === constants.spoolType.addUnconfirmedTransactions) {
        value.transactionInfos = reader.transactionInfos()
      } else if (type === constants.spoolType.removeUnconfirmedTransactions) {
        value.transactionInfos = reader.transactionInfos()
      } else {
        throw new Error(`invalid block change operation type, got ${type}`)
      }

      reader.validateEmpty()

      return value
    },

    // Read a unconfirmed transactions change file.
    file: file => readFile(file, 'unconfirmed_transactions_change'),

    // Read all files in directory
    directory: directory => readIndexedDirectory(directory, 'unconfirmed_transactions_change')
  }
}

export default codec
