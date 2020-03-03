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
 *  Shared constants from catapult enumerations.
 */

/**
 *  Determine if the object has a given key.
 */
const hasKey = (object, key) => {
  return Object.prototype.hasOwnProperty.call(object, key)
}

/**
 *  Create a bidirectional, constant object.
 */
const bimap = object => {
  if (hasKey(object, 'inv') || hasKey(object, 'inverse')) {
    throw new Error('invalid inverse mapping, has conflicting key')
  }
  object.inv = object.inverse = {}
  for (let [key, value] of Object.entries(object)) {
    object.inverse[value] = key
  }
  return object
}

// Facility code to differentiate packet types.
const facilityCode = bimap({
  accountLink: 0x4C,
  aggregate: 0x41,
  core: 0x43,
  lockHash: 0x48,
  lockSecret: 0x52,
  metadata: 0x44,
  mosaic: 0x4D,
  multisig: 0x55,
  namespace: 0x4E,
  restrictionAccount: 0x50,
  restrictionMosaic: 0x51,
  transfer: 0x54
})

// Transaction type.
const transactionType = bimap({
  transfer: 0x4154,
  registerNamespace: 0x414E,
  addressAlias: 0x424E,
  mosaicAlias: 0x434E,
  mosaicDefinition: 0x414D,
  mosaicSupplyChange: 0x424D,
  modifyMultisigAccount: 0x4155,
  aggregateComplete: 0x4141,
  aggregateBonded: 0x4241,
  lock: 0x4148,
  secretLock: 0x4152,
  secretProof: 0x4252,
  accountRestrictionAddress: 0x4150,
  accountRestrictionMosaic: 0x4250,
  accountRestrictionOperation: 0x4350,
  linkAccount: 0x414C,
  mosaicAddressRestriction: 0x4251,
  mosaicGlobalRestriction: 0x4151,
  accountMetadata: 0x4144,
  mosaicMetadata: 0x4244,
  namespaceMetadata: 0x4344
})

// Namespace registration type.
const namespaceType = bimap({
  root: 0,
  child: 1
})

// Alias type.
const aliasType = bimap({
  none: 0,
  mosaic: 1,
  address: 2
})

// Account restriction type.
const accountRestrictionType = bimap({
  address: 0x0001,
  mosaic: 0x0002,
  transactionType: 0x0004
})

// Mosaic restriction type.
const mosaicRestrictionType = bimap({
  address: 0,
  global: 1
})

// Spool data type.
const spoolType = {
  // Spool block_change type.
  blocksSaved: 0,
  blocksDropped: 1,

  // Spool partial_transactions_change type.
  addPartialTransactions: 0,
  removePartialTransactions: 1,
  addCosignature: 2,

  // Spool state_change type.
  scoreChange: 0,
  stateChange: 1,

  // Spool unconfirmed_transactions_change type.
  addUnconfirmedTransactions: 0,
  removeUnconfirmedTransactions: 1
}

// Receipt and basic receipt types.
const receiptType = bimap({
  // Basic receipt types.
  other: 0x0,
  balanceTransfer: 0x1,
  balanceCredit: 0x2,
  balanceDebit: 0x3,
  artifactExpiry: 0x4,
  inflation: 0x5,
  aggregate: 0xE,
  aliasResolution: 0xF,

  // Alias resolution receipt type.
  addressResolution: 1,
  mosaicResolution: 2
})

// Path constants.
const path = {
  maxLinks: 16
}

// RocksDB constants.
const ROLLBACK_BUFFER_SIZE = 2
const IMPORTANCE_SIZE = 1
const ACTIVITY_BUCKET_SIZE = 5
const rocks = {
  rollbackBufferSize: ROLLBACK_BUFFER_SIZE,
  importanceSize: IMPORTANCE_SIZE,
  importanceHistorySize: IMPORTANCE_SIZE + ROLLBACK_BUFFER_SIZE,
  activityBucketSize: ACTIVITY_BUCKET_SIZE,
  activityBucketHistorySize: ACTIVITY_BUCKET_SIZE + ROLLBACK_BUFFER_SIZE
}

// Security mode.
const securityMode = bimap({
  none: 1,
  signed: 2
})

// Packet constants.
const packet = {
  headerSize: 8,
  challengeSize: 64,
  signatureSize: 64
}

// Packet type.
const packetType = bimap({
  serverChallenge: 1,
  clientChallenge: 2,
  pushBlock: 3,
  pullBlock: 4,
  chainInfo: 5,
  blockHashes: 7,
  pullBlocks: 8,
  pushTransactions: 9,
  pullTransactions: 10,
  secureSigned: 11,
  subCacheMerkleRoots: 12,
  pushPartialTransactions: 500,
  pushDetachedCosignatures: 501,
  pullPartialTransactionInfos: 502,
  nodeDiscoveryPushPing: 600,
  nodeDiscoveryPullPing: 601,
  nodeDiscoveryPushPeers: 602,
  nodeDiscoveryPullPeers: 603,
  timeSyncNetworkTime: 700,
  accountStatePath: 800 + facilityCode.core,
  hashLockStatePath: 800 + facilityCode.lockHash,
  secretLockStatePath: 800 + facilityCode.lockSecret,
  metadataStatePath: 800 + facilityCode.metadata,
  mosaicStatePath: 800 + facilityCode.mosaic,
  multisigStatePath: 800 + facilityCode.multisig,
  namespaceStatePath: 800 + facilityCode.namespace,
  accountRestrictionsStatePath: 800 + facilityCode.restrictionAccount,
  mosaicRestrictionsStatePath: 800 + facilityCode.restrictionMosaic,
  diagnosticCounters: 1100,
  confirmTimestampedHashes: 1101,
  activeNodeInfos: 1102,
  blockStatement: 1103,
  unlockedAccounts: 1104,
  accountInfos: 1200 + facilityCode.core,
  hashLockInfos: 1200 + facilityCode.lockHash,
  secretLockInfos: 1200 + facilityCode.lockSecret,
  metadataInfos: 1200 + facilityCode.metadata,
  mosaicInfos: 1200 + facilityCode.mosaic,
  multisigInfos: 1200 + facilityCode.multisig,
  namespaceInfos: 1200 + facilityCode.namespace,
  accountRestrictionsInfos: 1200 + facilityCode.restrictionAccount,
  mosaicRestrictionsInfos: 1200 + facilityCode.restrictionMosaic
})

// ZeroMQ marker constants.
const zmq = {
  block: Buffer.from('496ACA80E4D8F29F', 'hex'),
  dropBlocks: Buffer.from('B0B025EE8AD6205C', 'hex'),
  transaction: Buffer.of(0x61),
  unconfirmedTransactionAdd: Buffer.of(0x75),
  unconfirmedTransactionRemove: Buffer.of(0x72),
  transactionStatus: Buffer.of(0x73),
  partialTransactionAdd: Buffer.of(0x70),
  partialTransactionRemove: Buffer.of(0x71),
  cosignature: Buffer.of(0x63)
}

// Configuration collection to file names.
const config = bimap({
  'database': 'config-database.properties',
  'extensionsBroker': 'config-extensions-broker.properties',
  'extensionsRecovery': 'config-extensions-recovery.properties',
  'extensionsServer': 'config-extensions-server.properties',
  'harvesting': 'config-harvesting.properties',
  'inflation': 'config-inflation.properties',
  'loggingBroker': 'config-logging-broker.properties',
  'loggingRecovery': 'config-logging-recovery.properties',
  'loggingServer': 'config-logging-server.properties',
  'messaging': 'config-messaging.properties',
  'network': 'config-network.properties',
  'networkHeight': 'config-networkheight.properties',
  'node': 'config-node.properties',
  'partialTransactions': 'config-pt.properties',
  'task': 'config-task.properties',
  'timeSync': 'config-timesync.properties',
  'user': 'config-user.properties',
  'peersApi': 'peers-api.json',
  'peersP2p': 'peers-p2p.json'
})

// Hard-coded entity sizes.
const entitySize = {
  blockHeader: 304
}

export default {
  facilityCode,
  transactionType,
  namespaceType,
  aliasType,
  accountRestrictionType,
  mosaicRestrictionType,
  spoolType,
  receiptType,
  path,
  rocks,
  securityMode,
  packet,
  packetType,
  zmq,
  config,
  entitySize
}
