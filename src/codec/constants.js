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

// Facility code to differentiate packet types.
const facilityCode = {
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
}

export default {
  // Transaction type.
  transactionTransfer: 0x4154,
  transactionRegisterNamespace: 0x414E,
  transactionAddressAlias: 0x424E,
  transactionMosaicAlias: 0x434E,
  transactionMosaicDefinition: 0x414D,
  transactionMosaicSupplyChange: 0x424D,
  transactionModifyMultisigAccount: 0x4155,
  transactionAggregateComplete: 0x4141,
  transactionAggregateBonded: 0x4241,
  transactionLock: 0x4148,
  transactionSecretLock: 0x4152,
  transactionSecretProof: 0x4252,
  transactionAccountRestrictionAddress: 0x4150,
  transactionAccountRestrictionMosaic: 0x4250,
  transactionAccountRestrictionOperation: 0x4350,
  transactionLinkAccount: 0x414C,
  transactionMosaicAddressRestriction: 0x4251,
  transactionMosaicGlobalRestriction: 0x4151,
  transactionAccountMetadataTransaction: 0x4144,
  transactionMosaicMetadataTransaction: 0x4244,
  transactionNamespaceMetadataTransaction: 0x4344,

  // Namespace registration type.
  namespaceRoot: 0,
  namespaceChild: 1,

  // Alias type.
  aliasNone: 0,
  aliasMosaic: 1,
  aliasAddress: 2,

  // Account restriction type.
  accountRestrictionAddress: 0x0001,
  accountRestrictionMosaic: 0x0002,
  accountRestrictionTransactionType: 0x0004,

  // Mosaic restriction type.
  mosaicRestrictionAddress: 0,
  mosaicRestrictionGlobal: 1,

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
  removeUnconfirmedTransactions: 1,

  // Basic receipt type.
  receiptOther: 0x0,
  receiptBalanceTransfer: 0x1,
  receiptBalanceCredit: 0x2,
  receiptBalanceDebit: 0x3,
  receiptArtifactExpiry: 0x4,
  receiptInflation: 0x5,
  receiptAggregate: 0xE,
  receiptAliasResolution: 0xF,

  // Alias resolution receipt type.
  receiptAddressResolution: 1,
  receiptMosaicResolution: 2,

  // Packet information and types.
  packetHeaderSize: 8,
  challengeSize: 64,
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
}
