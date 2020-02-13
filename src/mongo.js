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

/**
 *  Formatter for MongoDB collections.
 */
const format = {
  // TODO(ahuszagh) Implement formatters...
//  "accountRestrictions",
//  "addressResolutionStatements",
//  "chainStatistic",
//  "hashLocks",
//  "metadata",
//  "mosaicResolutionStatements",
//  "mosaicRestrictions",
//  "multisigs",
//  "namespaces",
//  "partialTransactions",
//  "secretLocks",
//  "system.profile",
//  "transactionStatements",
//  "transactionStatuses",
//  "transactions",
//  "unconfirmedTransactions"

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
        startHeight: idToHex(mosaic.id),
        amount: mosaic.amount.toString()
      }))
    }
  }),

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
  })
}

/**
 *  Create new formatter, or default if not implemented.
 */
const createFormatter = collection => {
  const formatter = format[collection]
  if (formatter === undefined) {
    return x => x
  }
  return formatter
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
  let opts = { promoteLongs: false, useNewUrlParser: true, useUnifiedTopology: true }
  let client = await MongoDb.MongoClient.connect(options.database, opts)
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
  let formatter = createFormatter(options.collection)
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
