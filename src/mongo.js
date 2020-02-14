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

import MongoDb from 'mongodb'
import shared from './shared'

// FORMATTER

const idToHex = id => shared.idToHex([id.getLowBitsUnsigned(), id.getHighBits() >>> 0])
const binaryToHex = data => shared.binaryToHex(data)
const binaryToBase32 = data => shared.binaryToBase32(data.buffer)

const balanceChangeReceipt = entry => ({
  version: entry.version,
  type: entry.type,
  targetPublicKey : binaryToHex(entry.targetPublicKey),
  mosaicId : idToHex(entry.mosaicId),
  amount : entry.amount.toString()
})

const balanceTransferReceipt = entry => ({
  version: entry.version,
  type: entry.type,
  senderPublicKey : binaryToHex(entry.senderPublicKey),
  recipientAddress : binaryToBase32(entry.recipientAddress),
  mosaicId : idToHex(entry.mosaicId),
  amount : entry.amount.toString()
})

const artifactExpiryReceipt = entry => ({
  version: entry.version,
  type: entry.type,
  artifactId : idToHex(entry.artifactId)
})

const inflationReceipt = entry => ({
  version: entry.version,
  type: entry.type,
  mosaicId : idToHex(entry.mosaicId),
  amount : entry.amount.toString()
})

const unknownReceipt = entry => ({
  version: entry.version,
  type: entry.type
})

const RECEIPT_TYPE = {
  1: balanceTransferReceipt,
  2: balanceChangeReceipt,
  3: balanceChangeReceipt,
  4: artifactExpiryReceipt,
  5: inflationReceipt
};

const basicReceipt = entry => {
  let callback = RECEIPT_TYPE[(entry.type & 0xF000) >> 12] || unknownReceipt
  return callback(entry)
}

/**
 *  Formatter for MongoDB collections.
 */
const format = {
  accountRestrictions: item => {
    // TODO(ahuszagh) Implement...
    console.log(item)
    throw new Error('not yet implemented')
  },

  accounts: item => ({
    account: {
      address: binaryToBase32(item.account.address),
      addressHeight: item.account.addressHeight.toString(),
      publicKey: binaryToHex(item.account.publicKey),
      publicKeyHeight: item.account.publicKeyHeight.toString(),
      accountType: item.account.accountType,
      linkedAccountKey: binaryToHex(item.account.linkedAccountKey),
      importances: item.account.importances.map(importance => ({
        value: importance.value.toString(),
        height: importance.height.toString()
      })),
      activityBuckets: item.account.activityBuckets.map(bucket => ({
        startHeight: bucket.startHeight.toString(),
        totalFeesPaid: bucket.totalFeesPaid.toString(),
        beneficiaryCount: bucket.beneficiaryCount,
        rawScore: bucket.rawScore.toString()
      })),
      mosaics: item.account.mosaics.map(mosaic => ({
        mosaicId: idToHex(mosaic.id),
        amount: mosaic.amount.toString()
      }))
    }
  }),

  addressResolutionStatements: item => {
    // TODO(ahuszagh) Implement...
    console.log(item)
    throw new Error('not yet implemented')
  },

  blocks: item => ({
    meta: {
      hash: binaryToHex(item.meta.hash),
      generationHash: binaryToHex(item.meta.generationHash),
      totalFee: item.meta.totalFee.toString(),
      stateHashSubCacheMerkleRoots: item.meta.stateHashSubCacheMerkleRoots.map(hash => binaryToHex(hash)),
      numTransactions: item.meta.numTransactions,
      transactionMerkleTree: item.meta.transactionMerkleTree.map(hash => binaryToHex(hash)),
      numStatements: item.meta.numStatements,
      statementMerkleTree: item.meta.statementMerkleTree.map(hash => binaryToHex(hash))
    },
    block: {
      signature: binaryToHex(item.block.signature),
      signerPublicKey: binaryToHex(item.block.signerPublicKey),
      version: item.block.version,
      network: item.block.network,
      type: item.block.type,
      height: item.block.height.toString(),
      timestamp: item.block.timestamp.toString(),
      difficulty: item.block.difficulty.toString(),
      feeMultiplier: item.block.feeMultiplier,
      previousBlockHash: binaryToHex(item.block.previousBlockHash),
      transactionsHash: binaryToHex(item.block.transactionsHash),
      receiptsHash: binaryToHex(item.block.receiptsHash),
      stateHash: binaryToHex(item.block.stateHash),
      beneficiaryPublicKey: binaryToHex(item.block.beneficiaryPublicKey)
    }
  }),

  chainStatistic: item => ({
    current: {
      height: item.current.height.toString(),
      scoreLow: item.current.scoreLow.toString(),
      scoreHigh: item.current.scoreHigh.toString()
    }
  }),

  hashLocks: item => ({
    lock: {
      senderPublicKey: binaryToHex(item.lock.senderPublicKey),
      senderAddress: binaryToBase32(item.lock.senderAddress),
      mosaicId: idToHex(item.lock.mosaicId),
      amount: item.lock.amount.toString(),
      endHeight: item.lock.endHeight.toString(),
      hash: binaryToHex(item.lock.hash),
    }
  }),

  metadata: item => {
    // TODO(ahuszagh) Implement...
    console.log(item)
    throw new Error('not yet implemented')
  },

  mosaicResolutionStatements: item => ({
    statement: {
      height: item.statement.height.toString(),
      unresolved: idToHex(item.statement.unresolved),
      resolutionEntries: item.statement.resolutionEntries.map(entry => ({
        source: entry.source,
        resolved: idToHex(entry.resolved)
      }))
    }
  }),

  mosaicRestrictions: item => {
    // TODO(ahuszagh) Implement...
    console.log(item)
    throw new Error('not yet implemented')
  },

  mosaics: item => ({
    mosaic: {
      id: idToHex(item.mosaic.id),
      supply: item.mosaic.supply.toString(),
      startHeight: item.mosaic.startHeight.toString(),
      owner: {
        publicKey: binaryToHex(item.mosaic.ownerPublicKey),
        address: binaryToBase32(item.mosaic.ownerAddress)
      },
      revision: item.mosaic.revision,
      flags: item.mosaic.flags,
      divisibility: item.mosaic.divisibility,
      duration: item.mosaic.duration.toString()
    }
  }),

  multisigs: item => ({
    multisig: {
      account: {
        publicKey: binaryToHex(item.multisig.accountPublicKey),
        address: binaryToBase32(item.multisig.accountAddress)
      },
      minApproval: item.multisig.minApproval,
      minRemoval: item.multisig.minRemoval,
      cosignatoryPublicKeys: item.multisig.cosignatoryPublicKeys.map(binaryToHex),
      multisigPublicKeys: item.multisig.multisigPublicKeys.map(binaryToHex)
    }
  }),

  namespaces: item => {
    const aliasNone = 0
    const aliasMosaic = 1
    const aliasAddress = 2

    let result = {
      meta: item.meta,
      namespace: {
        registrationType: item.namespace.registrationType,
        depth: item.namespace.depth,
        levels: [],
        alias: {
          type: item.namespace.alias.type
        },
        parentId: idToHex(item.namespace.parentId),
        owner: {
          publicKey: binaryToHex(item.namespace.ownerPublicKey),
          address: binaryToBase32(item.namespace.ownerAddress)
        },
        startHeight: item.namespace.startHeight.toString(),
        endHeight: item.namespace.endHeight.toString(),
      }
    }

    // Add the levels.
    for (let index = 0; index < item.namespace.depth; index++) {
      result.namespace.levels.push(idToHex(item.namespace['level' + index.toString()]))
    }

    // Add the alias.
    let aliasType = item.namespace.alias.type
    if (aliasType === aliasNone) {
      // No-op
    } else if (aliasType === aliasMosaic) {
      result.namespace.alias.mosaicId = idToHex(item.namespace.alias.mosaicId)
    } else if (aliasType === aliasAddress) {
      result.namespace.alias.address = binaryToBase32(item.namespace.alias.address)
    } else {
      throw new Error(`invalid AliasType, got ${aliasType}`)
    }

    return result
  },

  partialTransactions: item => {
    // TODO(ahuszagh) Implement...
    console.log(item)
    throw new Error('not yet implemented')
  },

  secretLocks: item => {
    // TODO(ahuszagh) Implement...
    console.log(item)
    throw new Error('not yet implemented')
  },

  transactionStatements: item => ({
    statement: {
      height: item.statement.height.toString(),
      source: item.statement.source,
      receipts: item.statement.receipts.map(basicReceipt)
    }
  }),

  transactionStatuses: item => {
    // TODO(ahuszagh) Implement...
    console.log(item)
    throw new Error('not yet implemented')
  },

  transactions: item => {
    // TODO(ahuszagh) Implement...
    console.log(item)
    throw new Error('not yet implemented')
  },

  unconfirmedTransactions: item => {
    // TODO(ahuszagh) Implement...
    console.log(item)
    throw new Error('not yet implemented')
  }
}

// API

/**
 *  Get connection to MongoDB.
 *
 *  @param options {Object}       - Options to specify dump parameters.
 *    @field database {String}    - Database connection path.
 *    @field verbose {Boolean}    - Display debug information.
 */
const connect = async options => {
  let client = await MongoDb.MongoClient.connect(options.database, {
    promoteLongs: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  if (options.verbose) {
    console.info(`Connected to mongo at ${options.database}`)
  }
  return client
}

/**
 *  Dump MongoDB data to JSON.
 *
 *  @param options {Object}       - Options to specify dump parameters.
 *    @field database {String}    - Database connection path.
 *    @field collection {String}  - Collection name.
 *    @field limit {Number}       - Maximum number of items to dump.
 *    @field verbose {Boolean}    - Display debug information.
 */
const dump = async options => {
  let client = await connect(options)
  let db = client.db()
  let formatter = format[options.collection]
  let data = await db.collection(options.collection)
    .find()
    .limit(options.limit)
    .sort({ _id: -1 })
    .map(formatter)
    .toArray()

  client.close()

  return data
}

export default {
  dump
}
