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
 *  Codec to transform MongoDB models to JSON.
 */

import constants from './constants'
import shared from '../util/shared'

const longToUint64 = long => [long.getLowBitsUnsigned(), long.getHighBits() >>> 0]
const longToString = long => shared.uint64ToString(longToUint64(long))
const idToHex = id => shared.idToHex(longToUint64(id))
const binaryToAscii = data => shared.binaryToAscii(data)
const binaryToHex = data => shared.binaryToHex(data)
const binaryToBase32 = data => shared.binaryToBase32(data.buffer)
const binaryToId = data => shared.idToHex(shared.binaryToUint64(data))
const objectIdToHex = id => id.toHexString().toUpperCase()

const balanceChangeReceipt = entry => ({
  version: entry.version,
  type: entry.type,
  targetPublicKey : binaryToHex(entry.targetPublicKey),
  mosaicId : idToHex(entry.mosaicId),
  amount : longToString(entry.amount)
})

const balanceTransferReceipt = entry => ({
  version: entry.version,
  type: entry.type,
  senderPublicKey : binaryToHex(entry.senderPublicKey),
  recipientAddress : binaryToBase32(entry.recipientAddress),
  mosaicId : idToHex(entry.mosaicId),
  amount : longToString(entry.amount)
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
  amount : longToString(entry.amount)
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

const accountRestriction = restriction => {
  let buffer = restriction.buffer
  if (buffer.length === 25) {
    // Address
    return shared.binaryToBase32(buffer)
  } else if (buffer.length === 8) {
    // Mosaic ID
    return binaryToId(buffer)
  } else if (buffer.length === 2) {
    // Entity type
    return shared.binaryToUint16(buffer)
  } else {
    throw new Error(`invalid account restriction, got ${buffer.toString('hex')}`)
  }
}

const isEmbedded = transaction => transaction.meta.aggregateHash !== undefined

const transactionMetaShared = meta => ({
  height: longToString(meta.height),
  index: meta.index
})

const transactionMetaAggregate = meta => ({
  ...transactionMetaShared(meta),
  aggregateHash: binaryToHex(meta.aggregateHash),
  aggregateId: objectIdToHex(meta.aggregateId)
})

const transactionMetaStandalone = meta => ({
  ...transactionMetaShared(meta),
  hash: binaryToHex(meta.hash),
  merkleComponentHash: binaryToHex(meta.merkleComponentHash),
  addresses: meta.addresses.map(binaryToBase32)
})

const transactionMeta = (meta, embedded) => {
  if (embedded) {
    return transactionMetaAggregate(meta)
  } else {
    return transactionMetaStandalone(meta)
  }
}

const basicEntity = entity => ({
  signerPublicKey: binaryToHex(entity.signerPublicKey),
  version: entity.version,
  network: entity.network,
  type: entity.type
})

const verifiableEntity = entity => ({
  ...basicEntity(entity),
  signature: binaryToHex(entity.signature)
})

const transactionBaseAggregate = transaction => ({
  ...basicEntity(transaction)
})

const transactionBaseStandalone = transaction => ({
  ...verifiableEntity(transaction),
  maxFee: longToString(transaction.maxFee),
  deadline: longToString(transaction.deadline)
})

const transactionBase = (transaction, embedded) => {
  if (embedded) {
    return transactionBaseAggregate(transaction)
  } else {
    return transactionBaseStandalone(transaction)
  }
}

const mosaic = mosaic => ({
  id: idToHex(mosaic.id),
  amount: longToString(mosaic.amount)
})

const transferTransaction = transaction => {
  let result = {
    recipientAddress: binaryToBase32(transaction.recipientAddress),
    mosaics: transaction.mosaics.map(mosaic)
  }
  if (transaction.message !== undefined) {
    result.message = {
      type: transaction.message.type,
      payload: binaryToHex(transaction.message.payload)
    }
  }

  return result
}

const registerNamespaceTransaction = transaction => {
  let result = {
    namespaceType: transaction.registrationType,
    namespaceId: idToHex(transaction.id),
    name: binaryToAscii(transaction.name)
  }

  if (result.namespaceType === constants.namespaceRoot) {
    result.duration = longToString(transaction.duration)
  } else if (transaction.namespaceType === constants.namespaceChild) {
    result.parentId = idToHex(transaction.parentId)
  } else {
    throw new Error(`invalid namespace type, got ${result.namespaceType}`)
  }

  return result
}

const addressAliasTransaction = transaction => ({
  namespaceId: idToHex(transaction.namespaceId),
  address: binaryToBase32(transaction.address),
  aliasAction: transaction.aliasAction
})

const mosaicAliasTransaction = transaction => ({
  namespaceId: idToHex(transaction.namespaceId),
  mosaicId: idToHex(transaction.mosaicId),
  aliasAction: transaction.aliasAction
})

const mosaicDefinitionTransaction = transaction => ({
  mosaicId: idToHex(transaction.id),
  duration: longToString(transaction.duration),
  nonce: transaction.nonce,
  flags: transaction.flags,
  divisibility: transaction.divisibility
})

const mosaicSupplyChangeTransaction = transaction => ({
  mosaicId: idToHex(transaction.mosaicId),
  delta: longToString(transaction.delta),
  action: transaction.action
})

const modifyMultisigTransaction = transaction => ({
  minRemovalDelta: transaction.minRemovalDelta,
  minApprovalDelta: transaction.minApprovalDelta,
  publicKeyAdditions: transaction.publicKeyAdditions.map(binaryToHex),
  publicKeyDeletions: transaction.publicKeyDeletions.map(binaryToHex)
})

const aggregateTransaction = transaction => ({
  transactionsHash: binaryToHex(transaction.transactionsHash),
  cosignatures: transaction.cosignatures.map(cosignature => ({
    signerPublicKey: binaryToHex(cosignature.signerPublicKey),
    signature: binaryToHex(cosignature.signature)
  }))
})

const aggregateCompleteTransaction = transaction => aggregateTransaction(transaction)

const aggregateBondedTransaction = transaction => aggregateTransaction(transaction)

const lockTransaction = transaction => ({
  mosaic: {
    mosaicId: idToHex(transaction.mosaicId),
    amount: longToString(transaction.amount)
  },
  duration: longToString(transaction.duration),
  hash: binaryToHex(transaction.hash)
})

const secretLockTransaction = transaction => ({
  mosaic: {
    mosaicId: idToHex(transaction.mosaicId),
    amount: longToString(transaction.amount)
  },
  duration: longToString(transaction.duration),
  secret: binaryToHex(transaction.secret),
  hashAlgorithm: transaction.hashAlgorithm,
  recipientAddress: binaryToBase32(transaction.recipientAddress)
})

const secretProofTransaction = transaction => ({
  secret: binaryToHex(transaction.secret),
  hashAlgorithm: transaction.hashAlgorithm,
  recipientAddress: binaryToBase32(transaction.recipientAddress),
  proof: binaryToHex(transaction.proof)
})

const accountRestrictionAddressTransaction = transaction => ({
  restrictionFlags: transaction.restrictionFlags,
  restrictionAdditions: transaction.restrictionAdditions.map(binaryToBase32),
  restrictionDeletions: transaction.restrictionDeletions.map(binaryToBase32)
})

const accountRestrictionMosaicTransaction = transaction => ({
  restrictionFlags: transaction.restrictionFlags,
  restrictionAdditions: transaction.restrictionAdditions.map(data => binaryToId(data.buffer)),
  restrictionDeletions: transaction.restrictionDeletions.map(data => binaryToId(data.buffer))
})

const accountRestrictionOperationTransaction = transaction => ({
  restrictionFlags: transaction.restrictionFlags,
  restrictionAdditions: transaction.restrictionAdditions.map(data => shared.binaryToUint16(data.buffer)),
  restrictionDeletions: transaction.restrictionDeletions.map(data => shared.binaryToUint16(data.buffer))
})

const linkAccountTransaction = transaction => ({
  remotePublicKey: binaryToHex(transaction.remotePublicKey),
  linkAction: transaction.linkAction
})

const mosaicAddressRestrictionTransaction = transaction => ({
  mosaicId: idToHex(transaction.mosaicId),
  restrictionKey: longToString(transaction.restrictionKey),
  targetAddress: binaryToBase32(transaction.targetAddress),
  previousRestrictionValue: longToString(transaction.previousRestrictionValue),
  newRestrictionValue: longToString(transaction.newRestrictionValue)
})

const mosaicGlobalRestrictionTransaction = transaction => ({
  mosaicId: idToHex(transaction.mosaicId),
  referenceMosaicId: idToHex(transaction.referenceMosaicId),
  restrictionKey: longToString(transaction.restrictionKey),
  previousRestrictionValue: longToString(transaction.previousRestrictionValue),
  previousRestrictionType: transaction.previousRestrictionType,
  newRestrictionValue: longToString(transaction.newRestrictionValue),
  newRestrictionType: transaction.newRestrictionType
})

const accountMetadataTransaction = transaction => {
  let result = {
    targetPublicKey: binaryToHex(transaction.targetPublicKey),
    scopedMetadataKey: longToString(transaction.scopedMetadataKey),
    valueSizeDelta: transaction.valueSizeDelta,
    valueSize: transaction.valueSize,
  }
  if (transaction.value !== undefined) {
    result.value = binaryToHex(transaction.value)
  }

  return result
}

const mosaicMetadataTransaction = transaction => {
  let result = {
    targetPublicKey: binaryToHex(transaction.targetPublicKey),
    scopedMetadataKey: longToString(transaction.scopedMetadataKey),
    targetMosaicId: idToHex(transaction.targetMosaicId),
    valueSizeDelta: transaction.valueSizeDelta,
    valueSize: transaction.valueSize,
  }
  if (transaction.value !== undefined) {
    result.value = binaryToHex(transaction.value)
  }

  return result
}

const namespaceMetadataTransaction = transaction => {
  let result = {
    targetPublicKey: binaryToHex(transaction.targetPublicKey),
    scopedMetadataKey: longToString(transaction.scopedMetadataKey),
    targetNamespaceId: idToHex(transaction.targetNamespaceId),
    valueSizeDelta: transaction.valueSizeDelta,
    valueSize: transaction.valueSize,
  }
  if (transaction.value !== undefined) {
    result.value = binaryToHex(transaction.value)
  }

  return result
}

/**
 *  Codec for MongoDB collections.
 */
const codec = {
  accountRestrictions: item => ({
    accountRestrictions: {
      address: binaryToBase32(item.accountRestrictions.address),
      restrictions: item.accountRestrictions.restrictions.map(restriction => ({
        restrictionFlags: restriction.restrictionFlags,
        values: restriction.values.map(accountRestriction)
      }))
    }
  }),

  accounts: item => ({
    account: {
      address: binaryToBase32(item.account.address),
      addressHeight: longToString(item.account.addressHeight),
      publicKey: binaryToHex(item.account.publicKey),
      publicKeyHeight: longToString(item.account.publicKeyHeight),
      accountType: item.account.accountType,
      linkedAccountKey: binaryToHex(item.account.linkedAccountKey),
      importances: item.account.importances.map(importance => ({
        value: longToString(importance.value),
        height: longToString(importance.height)
      })),
      activityBuckets: item.account.activityBuckets.map(bucket => ({
        startHeight: longToString(bucket.startHeight),
        totalFeesPaid: longToString(bucket.totalFeesPaid),
        beneficiaryCount: bucket.beneficiaryCount,
        rawScore: longToString(bucket.rawScore)
      })),
      mosaics: item.account.mosaics.map(mosaic)
    }
  }),

  addressResolutionStatements: item => ({
    statement: {
      height: longToString(item.statement.height),
      unresolved: binaryToBase32(item.statement.unresolved),
      resolutionEntries: item.statement.resolutionEntries.map(entry => ({
        source: entry.source,
        resolved: binaryToBase32(entry.resolved)
      }))
    }
  }),

  blocks: item => ({
    meta: {
      hash: binaryToHex(item.meta.hash),
      generationHash: binaryToHex(item.meta.generationHash),
      totalFee: longToString(item.meta.totalFee),
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
      height: longToString(item.block.height),
      timestamp: longToString(item.block.timestamp),
      difficulty: longToString(item.block.difficulty),
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
      height: longToString(item.current.height),
      scoreLow: longToString(item.current.scoreLow),
      scoreHigh: longToString(item.current.scoreHigh)
    }
  }),

  hashLocks: item => ({
    meta: {
      id: objectIdToHex(item._id)
    },
    lock: {
      sender: {
        publicKey: binaryToHex(item.lock.senderPublicKey),
        address: binaryToBase32(item.lock.senderAddress)
      },
      mosaicId: idToHex(item.lock.mosaicId),
      amount: longToString(item.lock.amount),
      endHeight: longToString(item.lock.endHeight),
      status: item.lock.status,
      hash: binaryToHex(item.lock.hash),
    }
  }),

  metadata: item => {
    let result = {
      metadataEntry: {
        compositeHash: binaryToHex(item.metadataEntry.compositeHash),
        senderPublicKey: binaryToHex(item.metadataEntry.senderPublicKey),
        targetPublicKey: binaryToHex(item.metadataEntry.targetPublicKey),
        scopedMetadataKey: longToString(item.metadataEntry.scopedMetadataKey),
        targetId: idToHex(item.metadataEntry.targetId),
        metadataType: item.metadataEntry.metadataType,
        valueSize: item.metadataEntry.valueSize
      }
    }

    // Value is optional if empty.
    if (item.metadataEntry.value !== undefined) {
      result.metadataEntry.value = binaryToHex(item.metadataEntry.value)
    }

    return result
  },

  mosaicResolutionStatements: item => ({
    statement: {
      height: longToString(item.statement.height),
      unresolved: idToHex(item.statement.unresolved),
      resolutionEntries: item.statement.resolutionEntries.map(entry => ({
        source: entry.source,
        resolved: idToHex(entry.resolved)
      }))
    }
  }),

  mosaicRestrictions: item => {
    let entryType = item.mosaicRestrictionEntry.entryType
    let result = {
      mosaicRestrictionEntry: {
        compositeHash: binaryToHex(item.mosaicRestrictionEntry.compositeHash),
        entryType: entryType,
        mosaicId: idToHex(item.mosaicRestrictionEntry.mosaicId)
      }
    }

    // Specialize for the address or global
    if (entryType === 0) {
      // Address
      result.mosaicRestrictionEntry.targetAddress = binaryToBase32(item.mosaicRestrictionEntry.targetAddress)
      result.mosaicRestrictionEntry.restrictions = item.mosaicRestrictionEntry.restrictions.map(restriction => ({
        key: idToHex(restriction.key),
        value: idToHex(restriction.value)
      }))
    } else if (entryType === 1) {
      // Global
      result.mosaicRestrictionEntry.restrictions = item.mosaicRestrictionEntry.restrictions.map(subitem => ({
        key: idToHex(subitem.key),
        restriction: {
          referenceMosaicId: idToHex(subitem.restriction.referenceMosaicId),
          restrictionValue: longToString(subitem.restriction.restrictionValue),
          restrictionType: subitem.restriction.restrictionType
        }
      }))
    } else {
      throw new Error(`invalid MosaicRestrictionEntryType, got ${entryType}`)
    }

    return result
  },

  mosaics: item => ({
    mosaic: {
      id: idToHex(item.mosaic.id),
      supply: longToString(item.mosaic.supply),
      startHeight: longToString(item.mosaic.startHeight),
      owner: {
        publicKey: binaryToHex(item.mosaic.ownerPublicKey),
        address: binaryToBase32(item.mosaic.ownerAddress)
      },
      revision: item.mosaic.revision,
      flags: item.mosaic.flags,
      divisibility: item.mosaic.divisibility,
      duration: longToString(item.mosaic.duration)
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
      meta: {
        ...item.meta,
        id: objectIdToHex(item._id)
      },
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
        startHeight: longToString(item.namespace.startHeight),
        endHeight: longToString(item.namespace.endHeight)
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

  // Same as transactions, just for only partial transactions.
  partialTransactions: item => codec.transactions(item),

  secretLocks: item => ({
    meta: {
      id: objectIdToHex(item._id)
    },
    lock: {
      sender: {
        publicKey: binaryToHex(item.lock.senderPublicKey),
        address: binaryToBase32(item.lock.senderAddress)
      },
      mosaicId: idToHex(item.lock.mosaicId),
      amount: longToString(item.lock.amount),
      endHeight: longToString(item.lock.endHeight),
      status: item.lock.status,
      hashAlgorithm: item.lock.hashAlgorithm,
      secret: binaryToHex(item.lock.secret),
      recipientAddress: binaryToBase32(item.lock.recipientAddress),
      compositeHash: binaryToHex(item.lock.compositeHash)
    }
  }),

  transactionStatements: item => ({
    statement: {
      height: longToString(item.statement.height),
      source: item.statement.source,
      receipts: item.statement.receipts.map(basicReceipt)
    }
  }),

  transactionStatuses: item => ({
    status: {
      hash: binaryToHex(item.status.hash),
      code: item.status.code,
      deadline: longToString(item.status.deadline)
    }
  }),

  transactions: item => {
    let embedded = isEmbedded(item)
    let meta = transactionMeta(item.meta, embedded)
    meta.id = objectIdToHex(item._id)
    let transaction = transactionBase(item.transaction, embedded)
    if (transaction.type === constants.transactionTransfer) {
      Object.assign(transaction, transferTransaction(item.transaction))
    } else if (transaction.type === constants.transactionRegisterNamespace) {
      Object.assign(transaction, registerNamespaceTransaction(item.transaction))
    } else if (transaction.type === constants.transactionAddressAlias) {
      Object.assign(transaction, addressAliasTransaction(item.transaction))
    } else if (transaction.type === constants.transactionMosaicAlias) {
      Object.assign(transaction, mosaicAliasTransaction(item.transaction))
    } else if (transaction.type === constants.transactionMosaicDefinition) {
      Object.assign(transaction, mosaicDefinitionTransaction(item.transaction))
    } else if (transaction.type === constants.transactionMosaicSupplyChange) {
      Object.assign(transaction, mosaicSupplyChangeTransaction(item.transaction))
    } else if (transaction.type === constants.transactionModifyMultisigAccount) {
      Object.assign(transaction, modifyMultisigTransaction(item.transaction))
    } else if (transaction.type === constants.transactionAggregateComplete) {
      Object.assign(transaction, aggregateCompleteTransaction(item.transaction))
    } else if (transaction.type === constants.transactionAggregateBonded) {
      Object.assign(transaction, aggregateBondedTransaction(item.transaction))
    } else if (transaction.type === constants.transactionLock) {
      Object.assign(transaction, lockTransaction(item.transaction))
    } else if (transaction.type === constants.transactionSecretLock) {
      Object.assign(transaction, secretLockTransaction(item.transaction))
    } else if (transaction.type === constants.transactionSecretProof) {
      Object.assign(transaction, secretProofTransaction(item.transaction))
    } else if (transaction.type === constants.transactionAccountRestrictionAddress) {
      Object.assign(transaction, accountRestrictionAddressTransaction(item.transaction))
    } else if (transaction.type === constants.transactionAccountRestrictionMosaic) {
      Object.assign(transaction, accountRestrictionMosaicTransaction(item.transaction))
    } else if (transaction.type === constants.transactionAccountRestrictionOperation) {
      Object.assign(transaction, accountRestrictionOperationTransaction(item.transaction))
    } else if (transaction.type === constants.transactionLinkAccount) {
      Object.assign(transaction, linkAccountTransaction(item.transaction))
    } else if (transaction.type === constants.transactionMosaicAddressRestriction) {
      Object.assign(transaction, mosaicAddressRestrictionTransaction(item.transaction))
    } else if (transaction.type === constants.transactionMosaicGlobalRestriction) {
      Object.assign(transaction, mosaicGlobalRestrictionTransaction(item.transaction))
    } else if (transaction.type === constants.transactionAccountMetadataTransaction) {
      Object.assign(transaction, accountMetadataTransaction(item.transaction))
    } else if (transaction.type === constants.transactionMosaicMetadataTransaction) {
      Object.assign(transaction, mosaicMetadataTransaction(item.transaction))
    } else if (transaction.type === constants.transactionNamespaceMetadataTransaction) {
      Object.assign(transaction, namespaceMetadataTransaction(item.transaction))
    } else {
      throw new Error(`invalid transaction type, got ${transaction.type}`)
    }

    return {
      meta,
      transaction
    }
  },

  // Same as transactions, just for only unconfirmed transactions.
  unconfirmedTransactions: item => codec.transactions(item)
}

export default codec
