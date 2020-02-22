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
 *  Codec to transform RocksDB models to JSON.
 */

import constants from './constants'
import Reader from './reader'

// CONSTANTS
const ROLLBACK_BUFFER_SIZE = 2
const IMPORTANCE_HISTORY_SIZE = 1 + ROLLBACK_BUFFER_SIZE
const ACTIVITY_BUCKET_HISTORY_SIZE = 5 + ROLLBACK_BUFFER_SIZE

// HELPERS

/**
 *  Format child namespace to the traditionally displayed format.
 */
const childNamespace = (child, root) => ({
  registrationType: constants.namespaceChild,
  depth: child.levels.length,
  levels: child.levels,
  alias: child.alias,
  parentId: child.levels[child.levels.length - 2],
  ownerPublicKey: root.owner,
  startHeight: root.lifetimeStart,
  endHeight: root.lifetimeEnd
})

/**
 *  Format root namespace to the traditionally displayed format.
 */
const rootNamespace = (root, namespaceId) => ({
  registrationType: constants.namespaceRoot,
  depth: 1,
  levels: [namespaceId],
  alias: root.alias,
  parentId: '0000000000000000',
  ownerPublicKey: root.owner,
  startHeight: root.lifetimeStart,
  endHeight: root.lifetimeEnd,
  children: root.children.map(child => childNamespace(child, root))
})

// READERS

class RocksReader extends Reader {
  static solitary(data, fn) {
    let reader = new RocksReader(data)
    return reader.solitary(fn)
  }

  // STATE VERSION

  validateStateVersion(expected) {
    let version = this.uint16()
    if (version != expected) {
      throw new Error(`invalid state version, got ${version}`)
    }
  }

  accountRestriction() {
    let restrictionFlags = this.uint16()
    let valuesCount = this.long()
    let values = []
    if ((restrictionFlags & constants.accountRestrictionAddress) !== 0) {
      this.nLong(values, valuesCount, 'address')
    } else if ((restrictionFlags & constants.accountRestrictionMosaic) !== 0) {
      this.nLong(values, valuesCount, 'id')
    } else if ((restrictionFlags & constants.accountRestrictionTransactionType) !== 0) {
      this.nLong(values, valuesCount, 'entityType')
    } else {
      throw new Error(`invalid account restriction flags, got ${restrictionFlags}`)
    }

    return {
      restrictionFlags,
      values
    }
  }

  mosaic() {
    let id = this.id()
    let amount = this.uint64()

    return {
      id,
      amount
    }
  }

  importance() {
    let value = this.uint64()
    let height = this.uint64()

    return {
      value,
      height
    }
  }

  activityBucket() {
    let startHeight = this.uint64()
    let totalFeesPaid = this.uint64()
    let beneficiaryCount = this.uint32()
    let rawScore = this.uint64()

    return {
      startHeight,
      totalFeesPaid,
      beneficiaryCount,
      rawScore
    }
  }

  timestampedHash() {
    let time = this.uint64()
    let hash = this.hash256()
    return `${time}@${hash}`
  }

  empty() {
    return null
  }

  mosaicRestrictions(valueName, valueFn) {
    // Create the generic callback for all restriction types.
    let valueCallback = this.callback(valueFn)
    let callback = () => {
      let key = this.uint64()
      let value = valueCallback()
      return {
        key,
        [valueName]: value
      }
    }

    // Read the restrictions.
    let keyCount = this.uint8()
    let restrictions = []
    this.n(restrictions, keyCount, callback)
    return restrictions
  }

  mosaicAddressRestrictionValue() {
    return this.uint64()
  }

  mosaicAddressRestriction() {
    const entryType = constants.mosaicRestrictionAddress
    let mosaicId = this.id()
    let targetAddress = this.address()
    let restrictions = this.mosaicRestrictions('value', 'mosaicAddressRestrictionValue')

    return {
      entryType,
      mosaicId,
      targetAddress,
      restrictions
    }
  }

  mosaicGlobalRestrictionValue() {
    let referenceMosaicId = this.id()
    let restrictionValue = this.uint64()
    let restrictionType = this.uint8()

    return {
      referenceMosaicId,
      restrictionValue,
      restrictionType
    }
  }

  mosaicGlobalRestriction() {
    const entryType = constants.mosaicRestrictionGlobal
    let mosaicId = this.id()
    let restrictions = this.mosaicRestrictions('restriction', 'mosaicGlobalRestrictionValue')

    return {
      entryType,
      mosaicId,
      restrictions
    }
  }

  alias() {
    let type = this.uint8()
    if (type === constants.aliasMosaic) {
      let mosaicId = this.id()
      return {type, mosaicId}
    } else if (type === constants.aliasAddress) {
      let address = this.address()
      return {type, address}
    } else if (type === constants.aliasNone) {
      return {type}
    } else {
      throw new Error(`invalid alias type ${type}`)
    }
  }

  childNamespace(rootId) {
    // Read the fully qualified path.
    let depth = this.uint8()
    let levels = [rootId]
    this.n(levels, depth, 'id')

    // Read the alias
    let alias = this.alias()

    return {
      levels,
      alias
    }
  }

  rootNamespace(rootId) {
    let owner = this.key()
    let lifetimeStart = this.uint64()
    let lifetimeEnd = this.uint64()
    let alias = this.alias()
    let childrenCount = this.long()
    let children = []
    let callback = () => this.childNamespace(rootId)
    this.nLong(children, childrenCount, callback)

    return {
      owner,
      lifetimeStart,
      lifetimeEnd,
      alias,
      children
    }
  }
}

// CODEC

/**
 *  Codec for RocksDB collections.
 *
 *  # Shared Types
 *  Address = uint8_t[25];
 *  Key = uint8_t[32];
 *  Height = uint64_t;
 *  MosaicId = uint64_t;
 *  NamespaceId = uint64_t;
 *  AccountType = uint8_t;
 *  Hash256 = uint8_t[32];
 */
export default {
  AccountRestrictionCache: {
    key: key => RocksReader.solitary(key, 'address'),
    value: data => {
      // Model:
      //  Note: Restriction can be an address, mosaic ID, or entity type.
      //
      //  struct AccountRestriction {
      //    uint16_t flags;
      //    uint64_t count;
      //    Restriction[count] values;
      //  }
      //
      //  struct AccountRestrictions {
      //    Address address;
      //    uint64_t restrictionsSize;
      //    AccountRestriction[restrictionsSize] restrictions;
      //  }

      // Parse Information
      let reader = new RocksReader(data)
      reader.validateStateVersion(1)
      let address = reader.address()
      let restrictionsCount = reader.uint64()
      let restrictions = []
      reader.n(restrictions, restrictionsCount, 'accountRestriction')
      reader.validateEmpty()

      return {
        address,
        restrictions
      }
    }
  },

  AccountStateCache: {
    key: key => RocksReader.solitary(key, 'address'),
    value: data => {
      // Constants
      const regular = 0
      const highValue = 1
      const importanceSize = IMPORTANCE_HISTORY_SIZE - ROLLBACK_BUFFER_SIZE
      const activityBucketsSize = ACTIVITY_BUCKET_HISTORY_SIZE - ROLLBACK_BUFFER_SIZE

      // Model:
      //  struct AccountState {
      //    Address address;
      //    Height addressHeight;
      //    Key publicKey;
      //    Height publicKeyHeight;
      //    AccountType accountType;
      //    Key linkedAccountKey;
      //    AccountImportanceSnapshots importanceSnapshots;
      //    AccountActivityBuckets activityBuckets;
      //    AccountBalances balances;
      //  }

      // Parse Non-Historical Information
      let reader = new RocksReader(data)
      reader.validateStateVersion(1)
      let address = reader.address()
      let addressHeight = reader.uint64()
      let publicKey = reader.key()
      let publicKeyHeight = reader.uint64()
      let accountType = reader.uint8()
      let linkedAccountKey = reader.key()
      let format = reader.uint8()

      let importances = []
      let activityBuckets = []
      let mosaics = []
      if (format == regular) {
        // No-op, no non-historical data
      } else if (format === highValue) {
        // Read non-historical data.
        reader.n(importances, importanceSize, 'importance')
        reader.n(activityBuckets, activityBucketsSize, 'activityBucket')
      } else {
        throw new Error(`invalid AccountStateFormat ${format}`)
      }
      // Skip 8 bytes for the optimized mosaic ID.
      reader.id()
      let mosaicsCount = reader.uint16()
      reader.n(mosaics, mosaicsCount, 'mosaic')

      // Parse Historical Information
      if (format == regular) {
        reader.n(importances, IMPORTANCE_HISTORY_SIZE, 'importance')
        reader.n(activityBuckets, ACTIVITY_BUCKET_HISTORY_SIZE, 'activityBucket')
      } else {
        reader.n(importances, ROLLBACK_BUFFER_SIZE, 'importance')
        reader.n(activityBuckets, ROLLBACK_BUFFER_SIZE, 'activityBucket')
      }

      reader.validateEmpty()

      return {
        address,
        addressHeight,
        publicKey,
        publicKeyHeight,
        accountType,
        linkedAccountKey,
        importances,
        activityBuckets,
        mosaics
      }
    }
  },

  HashCache: {
    key: key => RocksReader.solitary(key, 'timestampedHash'),
    value: value => RocksReader.solitary(value, 'empty')
  },

  HashLockInfoCache: {
    key: key => RocksReader.solitary(key, 'hash256'),
    value: data => {
      // Model:
      //  struct HashLockInfo {
      //    Key senderPublicKey;
      //    MosaicId mosaicId;
      //    uint64_t amount;
      //    Height endHeight;
      //    uint8_t status;
      //    Hash256 hash;
      //  }

      // Parse Information
      let reader = new RocksReader(data)
      reader.validateStateVersion(1)
      let senderPublicKey = reader.key()
      let mosaicId = reader.id()
      let amount = reader.uint64()
      let endHeight = reader.uint64()
      let status = reader.uint8()
      let hash = reader.hash256()
      reader.validateEmpty()

      return {
        senderPublicKey,
        mosaicId,
        amount,
        endHeight,
        status,
        hash
      }
    }
  },

  MetadataCache: {
    key: key => RocksReader.solitary(key, 'hash256'),
    value: data => {
      // Model:
      //  Note: targetId can be either a MosaicId, a NamespaceId, or all 0s.
      //
      //  struct SecretLockInfo {
      //    Key senderPublicKey;
      //    Key targetPublicKey;
      //    uint64_t scopedMetadataKey;
      //    uint64_t targetId;
      //    uint8_t metadataType;
      //    uint16_t valueSize;
      //    uint8_t[valueSize] value;
      //  }

      // Parse Information
      let reader = new RocksReader(data)
      reader.validateStateVersion(1)
      let senderPublicKey = reader.key()
      let targetPublicKey = reader.key()
      let scopedMetadataKey = reader.uint64()
      let targetId = reader.id()
      let metadataType = reader.uint8()
      let valueSize = reader.uint16()
      let value = reader.hexN(valueSize)
      reader.validateEmpty()

      return {
        senderPublicKey,
        targetPublicKey,
        scopedMetadataKey,
        targetId,
        metadataType,
        valueSize,
        value
      }
    }
  },

  MosaicCache: {
    key: key => RocksReader.solitary(key, 'id'),
    value: data => {
      // Model:
      //  struct Mosaic {
      //    MosaicId id;
      //    uint64_t supply;
      //    Height startHeight;
      //    Key ownerPublicKey;
      //    uint32_t revision;
      //    uint8_t flags;
      //    uint8_t divisibility;
      //    uint64_t duration;
      //  }

      // Parse Information
      let reader = new RocksReader(data)
      reader.validateStateVersion(1)
      let id = reader.id()
      let supply = reader.uint64()
      let startHeight = reader.uint64()
      let ownerPublicKey = reader.key()
      let revision = reader.uint32()
      let flags = reader.uint8()
      let divisibility = reader.uint8()
      let duration = reader.uint64()
      reader.validateEmpty()

      return {
        id,
        supply,
        startHeight,
        owner: {
          publicKey: ownerPublicKey
        },
        revision,
        flags,
        divisibility,
        duration
      }
    }
  },

  MosaicRestrictionCache: {
    key: key => RocksReader.solitary(key, 'hash256'),
    value: data => {
      // Model:
      //  struct MosaicRestrictionMixin {
      //    uint8_t entryType;
      //    MosaicId mosaicId;
      //  }
      //
      //  struct MosaicAddressRestrictionPair {
      //    uint64_t key;
      //    uint64_t value;
      //  }
      //
      //  struct MosaicAddressRestriction: MosaicRestrictionMixin {
      //    Address targetAddress;
      //    uint8_t restrictionsCount;
      //    MosaicAddressRestrictionPair[restrictionsCount] restrictions;
      //  }
      //
      //  struct MosaicGlobalRestrictionPair {
      //    uint64_t key;
      //    struct {
      //      MosaicId mosaicId;
      //      uint64_t value;
      //      uint8_t value;
      //    } value;
      //  }
      //
      //  struct MosaicGlobalRestriction: MosaicRestrictionMixin {
      //    uint8_t restrictionsCount;
      //    MosaicGlobalRestrictionPair[restrictionsCount] restrictions;
      //  }

      // Parse Information
      let reader = new RocksReader(data)
      reader.validateStateVersion(1)
      let entryType = reader.uint8()
      let value
      if (entryType === constants.mosaicRestrictionAddress) {
        value = reader.mosaicAddressRestriction()
      } else if (entryType === constants.mosaicRestrictionGlobal) {
        value = reader.mosaicGlobalRestriction()
      } else {
        throw new Error(`invalid mosaic restriction type, got ${entryType}`)
      }
      reader.validateEmpty()

      return value
    }
  },

  MultisigCache: {
    key: key => RocksReader.solitary(key, 'key'),
    value: data => {
      // Model:
      //  struct MultisigEntry {
      //    uint32_t minApproval;
      //    uint32_t minRemoval;
      //    Key key;
      //    uint64_t cosignatoryCount;
      //    Key[cosignatoryCount] cosignatories;
      //    uint64_t multisigCount;
      //    Key[multisigCount] multisigs;
      //  }

      // Parse Information
      let reader = new RocksReader(data)
      reader.validateStateVersion(1)
      let minApproval = reader.uint32()
      let minRemoval = reader.uint32()
      let publicKey = reader.key()
      let cosignatoryPublicKeys = []
      let cosignatoryCount = reader.long()
      reader.nLong(cosignatoryPublicKeys, cosignatoryCount, 'key')
      let multisigPublicKeys = []
      let multisigCount = reader.long()
      reader.nLong(multisigPublicKeys, multisigCount, 'key')
      reader.validateEmpty()

      return {
        account: {
          publicKey
        },
        minApproval,
        minRemoval,
        cosignatoryPublicKeys,
        multisigPublicKeys
      }
    }
  },

  NamespaceCache: {
    key: key => RocksReader.solitary(key, 'id'),
    value: data => {
      // Model:
      //  Note: Alias can be NoneAlias, AddressAlias, or MosaicAlias.
      //
      //  struct NoneAlias {
      //    uint8_t type;
      //  }
      //
      //  struct AddressAlias {
      //    uint8_t type;
      //    Address address;
      //  }
      //
      //  struct MosaicAlias {
      //    uint8_t type;
      //    MosaicId mosaicId;
      //  }
      //
      //  struct ChildNamespace {
      //    uint8_t childDepth;
      //    MosaicId[childDepth] path;
      //    Alias alias;
      //  }
      //
      //  struct RootNamespace {
      //    Key owner;
      //    Height lifetimeStart;
      //    Height lifetimeEnd;
      //    Alias alias;
      //    uint64_t childrenCount;
      //    ChildNamespace[childrenCount] children;
      //  }
      //
      //  struct NamespaceRootHistory {
      //    uint64_t historyDepth;
      //    NamespaceId namespaceId;
      //    RootNamespace[historyDepth] rootNamespace;
      //  }

      // Parse Information
      let reader = new RocksReader(data)
      reader.validateStateVersion(1)
      let historyDepth = reader.long()
      let namespaceId = reader.id()
      let rootNamespaceHistory = []
      let callback = () => reader.rootNamespace(namespaceId)
      reader.nLong(rootNamespaceHistory, historyDepth, callback)
      reader.validateEmpty()

      // Now we need to process it to the readable format we're used to.
      // Return the entire history.
      return rootNamespaceHistory
        .map(root => rootNamespace(root, namespaceId))
    }
  },

  SecretLockInfoCache: {
    key: key => RocksReader.solitary(key, 'hash256'),
    value: data => {
      // Model:
      //  struct SecretLockInfo {
      //    Key senderPublicKey;
      //    MosaicId mosaicId;
      //    uint64_t amount;
      //    Height endHeight;
      //    uint8_t status;
      //    uint8_t hashAlgorithm;
      //    Hash256 secret;
      //    Address recipientAddress;
      //  }

      // Parse Information
      let reader = new RocksReader(data)
      reader.validateStateVersion(1)
      let senderPublicKey = reader.key()
      let mosaicId = reader.id()
      let amount = reader.uint64()
      let endHeight = reader.uint64()
      let status = reader.uint8()
      let hashAlgorithm = reader.uint8()
      let secret = reader.hash256()
      let recipientAddress = reader.address()
      reader.validateEmpty()

      return {
        sender: {
          publicKey: senderPublicKey
        },
        mosaicId,
        amount,
        endHeight,
        status,
        hashAlgorithm,
        secret,
        recipientAddress
      }
    }
  }
}
