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

  // Packet types.
  nodeDiscoveryPullPing: 601,
  nodeDiscoveryPullPeers: 603,
  timeSyncNetworkTime: 700
}
