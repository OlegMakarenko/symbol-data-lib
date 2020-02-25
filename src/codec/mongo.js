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

const readBase32 = data => shared.readBase32(data.buffer)
const objectIdToHex = id => id.toHexString().toUpperCase()

const balanceChangeReceipt = entry => ({
  version: entry.version,
  type: entry.type,
  targetPublicKey : shared.readHex(entry.targetPublicKey),
  mosaicId : shared.longToId(entry.mosaicId),
  amount : shared.longToString(entry.amount)
})

const balanceTransferReceipt = entry => ({
  version: entry.version,
  type: entry.type,
  senderPublicKey : shared.readHex(entry.senderPublicKey),
  recipientAddress : readBase32(entry.recipientAddress),
  mosaicId : shared.longToId(entry.mosaicId),
  amount : shared.longToString(entry.amount)
})

const artifactExpiryReceipt = entry => ({
  version: entry.version,
  type: entry.type,
  artifactId : shared.longToId(entry.artifactId)
})

const inflationReceipt = entry => ({
  version: entry.version,
  type: entry.type,
  mosaicId : shared.longToId(entry.mosaicId),
  amount : shared.longToString(entry.amount)
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
    return shared.readBase32(buffer)
  } else if (buffer.length === 8) {
    // Mosaic ID
    return shared.uint64ToId(shared.readUint64(buffer))
  } else if (buffer.length === 2) {
    // Entity type
    return shared.readUint16(buffer)
  } else {
    throw new Error(`invalid account restriction, got ${buffer.toString('hex')}`)
  }
}

const isEmbedded = transaction => transaction.meta.aggregateHash !== undefined

const transactionMetaShared = meta => ({
  height: shared.longToString(meta.height),
  index: meta.index
})

const transactionMetaAggregate = meta => ({
  ...transactionMetaShared(meta),
  aggregateHash: shared.readHex(meta.aggregateHash),
  aggregateId: objectIdToHex(meta.aggregateId)
})

const transactionMetaStandalone = meta => ({
  ...transactionMetaShared(meta),
  hash: shared.readHex(meta.hash),
  merkleComponentHash: shared.readHex(meta.merkleComponentHash),
  addresses: meta.addresses.map(readBase32)
})

const transactionMeta = (meta, embedded) => {
  if (embedded) {
    return transactionMetaAggregate(meta)
  } else {
    return transactionMetaStandalone(meta)
  }
}

const basicEntity = entity => ({
  signerPublicKey: shared.readHex(entity.signerPublicKey),
  version: entity.version,
  network: entity.network,
  type: entity.type
})

const verifiableEntity = entity => ({
  ...basicEntity(entity),
  signature: shared.readHex(entity.signature)
})

const transactionBaseAggregate = transaction => ({
  ...basicEntity(transaction)
})

const transactionBaseStandalone = transaction => ({
  ...verifiableEntity(transaction),
  maxFee: shared.longToString(transaction.maxFee),
  deadline: shared.longToString(transaction.deadline)
})

const transactionBase = (transaction, embedded) => {
  if (embedded) {
    return transactionBaseAggregate(transaction)
  } else {
    return transactionBaseStandalone(transaction)
  }
}

const mosaic = mosaic => ({
  id: shared.longToId(mosaic.id),
  amount: shared.longToString(mosaic.amount)
})

const transferTransaction = transaction => {
  let result = {
    recipientAddress: readBase32(transaction.recipientAddress),
    mosaics: transaction.mosaics.map(mosaic)
  }
  if (transaction.message !== undefined) {
    result.message = {
      type: transaction.message.type,
      payload: shared.readHex(transaction.message.payload)
    }
  }

  return result
}

const registerNamespaceTransaction = transaction => {
  let result = {
    namespaceType: transaction.registrationType,
    namespaceId: shared.longToId(transaction.id),
    name: shared.readAscii(transaction.name)
  }

  if (result.namespaceType === constants.namespaceRoot) {
    result.duration = shared.longToString(transaction.duration)
  } else if (transaction.namespaceType === constants.namespaceChild) {
    result.parentId = shared.longToId(transaction.parentId)
  } else {
    throw new Error(`invalid namespace type, got ${result.namespaceType}`)
  }

  return result
}

const addressAliasTransaction = transaction => ({
  namespaceId: shared.longToId(transaction.namespaceId),
  address: readBase32(transaction.address),
  aliasAction: transaction.aliasAction
})

const mosaicAliasTransaction = transaction => ({
  namespaceId: shared.longToId(transaction.namespaceId),
  mosaicId: shared.longToId(transaction.mosaicId),
  aliasAction: transaction.aliasAction
})

const mosaicDefinitionTransaction = transaction => ({
  mosaicId: shared.longToId(transaction.id),
  duration: shared.longToString(transaction.duration),
  nonce: transaction.nonce,
  flags: transaction.flags,
  divisibility: transaction.divisibility
})

const mosaicSupplyChangeTransaction = transaction => ({
  mosaicId: shared.longToId(transaction.mosaicId),
  delta: shared.longToString(transaction.delta),
  action: transaction.action
})

const modifyMultisigTransaction = transaction => ({
  minRemovalDelta: transaction.minRemovalDelta,
  minApprovalDelta: transaction.minApprovalDelta,
  publicKeyAdditions: transaction.publicKeyAdditions.map(shared.readHex),
  publicKeyDeletions: transaction.publicKeyDeletions.map(shared.readHex)
})

const aggregateTransaction = transaction => ({
  transactionsHash: shared.readHex(transaction.transactionsHash),
  cosignatures: transaction.cosignatures.map(cosignature => ({
    signerPublicKey: shared.readHex(cosignature.signerPublicKey),
    signature: shared.readHex(cosignature.signature)
  }))
})

const aggregateCompleteTransaction = transaction => aggregateTransaction(transaction)

const aggregateBondedTransaction = transaction => aggregateTransaction(transaction)

const lockTransaction = transaction => ({
  mosaic: {
    mosaicId: shared.longToId(transaction.mosaicId),
    amount: shared.longToString(transaction.amount)
  },
  duration: shared.longToString(transaction.duration),
  hash: shared.readHex(transaction.hash)
})

const secretLockTransaction = transaction => ({
  mosaic: {
    mosaicId: shared.longToId(transaction.mosaicId),
    amount: shared.longToString(transaction.amount)
  },
  duration: shared.longToString(transaction.duration),
  secret: shared.readHex(transaction.secret),
  hashAlgorithm: transaction.hashAlgorithm,
  recipientAddress: readBase32(transaction.recipientAddress)
})

const secretProofTransaction = transaction => ({
  secret: shared.readHex(transaction.secret),
  hashAlgorithm: transaction.hashAlgorithm,
  recipientAddress: readBase32(transaction.recipientAddress),
  proof: shared.readHex(transaction.proof)
})

const accountRestrictionAddressTransaction = transaction => ({
  restrictionFlags: transaction.restrictionFlags,
  restrictionAdditions: transaction.restrictionAdditions.map(readBase32),
  restrictionDeletions: transaction.restrictionDeletions.map(readBase32)
})

const accountRestrictionMosaicTransaction = transaction => ({
  restrictionFlags: transaction.restrictionFlags,
  restrictionAdditions: transaction.restrictionAdditions.map(data => shared.uint64ToId(shared.readUint64(data.buffer))),
  restrictionDeletions: transaction.restrictionDeletions.map(data => shared.uint64ToId(shared.readUint64(data.buffer)))
})

const accountRestrictionOperationTransaction = transaction => ({
  restrictionFlags: transaction.restrictionFlags,
  restrictionAdditions: transaction.restrictionAdditions.map(data => shared.readUint16(data.buffer)),
  restrictionDeletions: transaction.restrictionDeletions.map(data => shared.readUint16(data.buffer))
})

const linkAccountTransaction = transaction => ({
  remotePublicKey: shared.readHex(transaction.remotePublicKey),
  linkAction: transaction.linkAction
})

const mosaicAddressRestrictionTransaction = transaction => ({
  mosaicId: shared.longToId(transaction.mosaicId),
  restrictionKey: shared.longToString(transaction.restrictionKey),
  targetAddress: readBase32(transaction.targetAddress),
  previousRestrictionValue: shared.longToString(transaction.previousRestrictionValue),
  newRestrictionValue: shared.longToString(transaction.newRestrictionValue)
})

const mosaicGlobalRestrictionTransaction = transaction => ({
  mosaicId: shared.longToId(transaction.mosaicId),
  referenceMosaicId: shared.longToId(transaction.referenceMosaicId),
  restrictionKey: shared.longToString(transaction.restrictionKey),
  previousRestrictionValue: shared.longToString(transaction.previousRestrictionValue),
  previousRestrictionType: transaction.previousRestrictionType,
  newRestrictionValue: shared.longToString(transaction.newRestrictionValue),
  newRestrictionType: transaction.newRestrictionType
})

const accountMetadataTransaction = transaction => {
  let result = {
    targetPublicKey: shared.readHex(transaction.targetPublicKey),
    scopedMetadataKey: shared.longToString(transaction.scopedMetadataKey),
    valueSizeDelta: transaction.valueSizeDelta,
    valueSize: transaction.valueSize,
  }
  if (transaction.value !== undefined) {
    result.value = shared.readHex(transaction.value)
  }

  return result
}

const mosaicMetadataTransaction = transaction => {
  let result = {
    targetPublicKey: shared.readHex(transaction.targetPublicKey),
    scopedMetadataKey: shared.longToString(transaction.scopedMetadataKey),
    targetMosaicId: shared.longToId(transaction.targetMosaicId),
    valueSizeDelta: transaction.valueSizeDelta,
    valueSize: transaction.valueSize,
  }
  if (transaction.value !== undefined) {
    result.value = shared.readHex(transaction.value)
  }

  return result
}

const namespaceMetadataTransaction = transaction => {
  let result = {
    targetPublicKey: shared.readHex(transaction.targetPublicKey),
    scopedMetadataKey: shared.longToString(transaction.scopedMetadataKey),
    targetNamespaceId: shared.longToId(transaction.targetNamespaceId),
    valueSizeDelta: transaction.valueSizeDelta,
    valueSize: transaction.valueSize,
  }
  if (transaction.value !== undefined) {
    result.value = shared.readHex(transaction.value)
  }

  return result
}

/**
 *  Codec for MongoDB collections.
 */
const codec = {
  accountRestrictions: item => ({
    accountRestrictions: {
      address: readBase32(item.accountRestrictions.address),
      restrictions: item.accountRestrictions.restrictions.map(restriction => ({
        restrictionFlags: restriction.restrictionFlags,
        values: restriction.values.map(accountRestriction)
      }))
    }
  }),

  accounts: item => ({
    account: {
      address: readBase32(item.account.address),
      addressHeight: shared.longToString(item.account.addressHeight),
      publicKey: shared.readHex(item.account.publicKey),
      publicKeyHeight: shared.longToString(item.account.publicKeyHeight),
      accountType: item.account.accountType,
      linkedAccountKey: shared.readHex(item.account.linkedAccountKey),
      importances: item.account.importances.map(importance => ({
        value: shared.longToString(importance.value),
        height: shared.longToString(importance.height)
      })),
      activityBuckets: item.account.activityBuckets.map(bucket => ({
        startHeight: shared.longToString(bucket.startHeight),
        totalFeesPaid: shared.longToString(bucket.totalFeesPaid),
        beneficiaryCount: bucket.beneficiaryCount,
        rawScore: shared.longToString(bucket.rawScore)
      })),
      mosaics: item.account.mosaics.map(mosaic)
    }
  }),

  addressResolutionStatements: item => ({
    statement: {
      height: shared.longToString(item.statement.height),
      unresolved: readBase32(item.statement.unresolved),
      resolutionEntries: item.statement.resolutionEntries.map(entry => ({
        source: entry.source,
        resolved: readBase32(entry.resolved)
      }))
    }
  }),

  blocks: item => ({
    meta: {
      hash: shared.readHex(item.meta.hash),
      generationHash: shared.readHex(item.meta.generationHash),
      totalFee: shared.longToString(item.meta.totalFee),
      stateHashSubCacheMerkleRoots: item.meta.stateHashSubCacheMerkleRoots.map(hash => shared.readHex(hash)),
      numTransactions: item.meta.numTransactions,
      transactionMerkleTree: item.meta.transactionMerkleTree.map(hash => shared.readHex(hash)),
      numStatements: item.meta.numStatements,
      statementMerkleTree: item.meta.statementMerkleTree.map(hash => shared.readHex(hash))
    },
    block: {
      signature: shared.readHex(item.block.signature),
      signerPublicKey: shared.readHex(item.block.signerPublicKey),
      version: item.block.version,
      network: item.block.network,
      type: item.block.type,
      height: shared.longToString(item.block.height),
      timestamp: shared.longToString(item.block.timestamp),
      difficulty: shared.longToString(item.block.difficulty),
      feeMultiplier: item.block.feeMultiplier,
      previousBlockHash: shared.readHex(item.block.previousBlockHash),
      transactionsHash: shared.readHex(item.block.transactionsHash),
      receiptsHash: shared.readHex(item.block.receiptsHash),
      stateHash: shared.readHex(item.block.stateHash),
      beneficiaryPublicKey: shared.readHex(item.block.beneficiaryPublicKey)
    }
  }),

  chainStatistic: item => ({
    current: {
      height: shared.longToString(item.current.height),
      scoreLow: shared.longToString(item.current.scoreLow),
      scoreHigh: shared.longToString(item.current.scoreHigh)
    }
  }),

  hashLocks: item => ({
    meta: {
      id: objectIdToHex(item._id)
    },
    lock: {
      sender: {
        publicKey: shared.readHex(item.lock.senderPublicKey),
        address: readBase32(item.lock.senderAddress)
      },
      mosaicId: shared.longToId(item.lock.mosaicId),
      amount: shared.longToString(item.lock.amount),
      endHeight: shared.longToString(item.lock.endHeight),
      status: item.lock.status,
      hash: shared.readHex(item.lock.hash),
    }
  }),

  metadata: item => {
    let result = {
      metadataEntry: {
        compositeHash: shared.readHex(item.metadataEntry.compositeHash),
        senderPublicKey: shared.readHex(item.metadataEntry.senderPublicKey),
        targetPublicKey: shared.readHex(item.metadataEntry.targetPublicKey),
        scopedMetadataKey: shared.longToString(item.metadataEntry.scopedMetadataKey),
        targetId: shared.longToId(item.metadataEntry.targetId),
        metadataType: item.metadataEntry.metadataType,
        valueSize: item.metadataEntry.valueSize
      }
    }

    // Value is optional if empty.
    if (item.metadataEntry.value !== undefined) {
      result.metadataEntry.value = shared.readHex(item.metadataEntry.value)
    }

    return result
  },

  mosaicResolutionStatements: item => ({
    statement: {
      height: shared.longToString(item.statement.height),
      unresolved: shared.longToId(item.statement.unresolved),
      resolutionEntries: item.statement.resolutionEntries.map(entry => ({
        source: entry.source,
        resolved: shared.longToId(entry.resolved)
      }))
    }
  }),

  mosaicRestrictions: item => {
    let entryType = item.mosaicRestrictionEntry.entryType
    let result = {
      mosaicRestrictionEntry: {
        compositeHash: shared.readHex(item.mosaicRestrictionEntry.compositeHash),
        entryType: entryType,
        mosaicId: shared.longToId(item.mosaicRestrictionEntry.mosaicId)
      }
    }

    // Specialize for the address or global
    if (entryType === 0) {
      // Address
      result.mosaicRestrictionEntry.targetAddress = readBase32(item.mosaicRestrictionEntry.targetAddress)
      result.mosaicRestrictionEntry.restrictions = item.mosaicRestrictionEntry.restrictions.map(restriction => ({
        key: shared.longToId(restriction.key),
        value: shared.longToId(restriction.value)
      }))
    } else if (entryType === 1) {
      // Global
      result.mosaicRestrictionEntry.restrictions = item.mosaicRestrictionEntry.restrictions.map(subitem => ({
        key: shared.longToId(subitem.key),
        restriction: {
          referenceMosaicId: shared.longToId(subitem.restriction.referenceMosaicId),
          restrictionValue: shared.longToString(subitem.restriction.restrictionValue),
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
      id: shared.longToId(item.mosaic.id),
      supply: shared.longToString(item.mosaic.supply),
      startHeight: shared.longToString(item.mosaic.startHeight),
      owner: {
        publicKey: shared.readHex(item.mosaic.ownerPublicKey),
        address: readBase32(item.mosaic.ownerAddress)
      },
      revision: item.mosaic.revision,
      flags: item.mosaic.flags,
      divisibility: item.mosaic.divisibility,
      duration: shared.longToString(item.mosaic.duration)
    }
  }),

  multisigs: item => ({
    multisig: {
      account: {
        publicKey: shared.readHex(item.multisig.accountPublicKey),
        address: readBase32(item.multisig.accountAddress)
      },
      minApproval: item.multisig.minApproval,
      minRemoval: item.multisig.minRemoval,
      cosignatoryPublicKeys: item.multisig.cosignatoryPublicKeys.map(shared.readHex),
      multisigPublicKeys: item.multisig.multisigPublicKeys.map(shared.readHex)
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
        parentId: shared.longToId(item.namespace.parentId),
        owner: {
          publicKey: shared.readHex(item.namespace.ownerPublicKey),
          address: readBase32(item.namespace.ownerAddress)
        },
        startHeight: shared.longToString(item.namespace.startHeight),
        endHeight: shared.longToString(item.namespace.endHeight)
      }
    }

    // Add the levels.
    for (let index = 0; index < item.namespace.depth; index++) {
      result.namespace.levels.push(shared.longToId(item.namespace['level' + index.toString()]))
    }

    // Add the alias.
    let aliasType = item.namespace.alias.type
    if (aliasType === aliasNone) {
      // No-op
    } else if (aliasType === aliasMosaic) {
      result.namespace.alias.mosaicId = shared.longToId(item.namespace.alias.mosaicId)
    } else if (aliasType === aliasAddress) {
      result.namespace.alias.address = readBase32(item.namespace.alias.address)
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
        publicKey: shared.readHex(item.lock.senderPublicKey),
        address: readBase32(item.lock.senderAddress)
      },
      mosaicId: shared.longToId(item.lock.mosaicId),
      amount: shared.longToString(item.lock.amount),
      endHeight: shared.longToString(item.lock.endHeight),
      status: item.lock.status,
      hashAlgorithm: item.lock.hashAlgorithm,
      secret: shared.readHex(item.lock.secret),
      recipientAddress: readBase32(item.lock.recipientAddress),
      compositeHash: shared.readHex(item.lock.compositeHash)
    }
  }),

  transactionStatements: item => ({
    statement: {
      height: shared.longToString(item.statement.height),
      source: item.statement.source,
      receipts: item.statement.receipts.map(basicReceipt)
    }
  }),

  transactionStatuses: item => ({
    status: {
      hash: shared.readHex(item.status.hash),
      code: item.status.code,
      deadline: shared.longToString(item.status.deadline)
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
