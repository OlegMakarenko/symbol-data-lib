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
import Level from './level'
import shared from './shared'

// CONSTANTS
const ROLLBACK_BUFFER_SIZE = 2
const IMPORTANCE_HISTORY_SIZE = 1 + ROLLBACK_BUFFER_SIZE
const ACTIVITY_BUCKET_HISTORY_SIZE = 5 + ROLLBACK_BUFFER_SIZE
const ALIAS_NONE = 0
const ALIAS_MOSAIC = 1
const ALIAS_ADDRESS = 2
const ACCOUNT_RESTRICTION_ADDRESS = 0x0001
const ACCOUNT_RESTRICTION_MOSAIC_ID = 0x0002
const ACCOUNT_RESTRICTION_TRANSACTION_TYPE = 0x0004
const MOSAIC_RESTRICTION_ADDRESS = 0
const MOSAIC_RESTRICTION_GLOBAL = 1

// READERS

class Reader {
  constructor(data) {
    this.data = data
  }

  // STATE VERSION

  validateStateVersion(expected) {
    let version = this.uint16()
    if (version != expected) {
      throw new Error(`invalid state version, got ${version}`)
    }
  }

  // EMPTY

  validateEmpty() {
    if (this.data.length !== 0) {
      throw new Error('invalid trailing data')
    }
  }

  // READERS

  callback(fn) {
    if (typeof fn === 'string') {
      return () => this[fn]()
    } else {
      return fn
    }
  }

  static solitary(data, fn) {
    let reader = new Reader(data)
    let callback = reader.callback(fn)
    let value = callback()
    reader.validateEmpty()
    return value
  }

  n(array, count, fn) {
    let callback = this.callback(fn)
    for (let index = 0; index < count; index++) {
      array.push(callback.call())
    }
  }

  uint8() {
    let value = shared.binaryToUint8(this.data.slice(0, 1))
    this.data = this.data.slice(1)
    return value
  }

  uint16() {
    let value = shared.binaryToUint16(this.data.slice(0, 2))
    this.data = this.data.slice(2)
    return value
  }

  uint32() {
    let value = shared.binaryToUint32(this.data.slice(0, 4))
    this.data = this.data.slice(4)
    return value
  }

  uint64() {
    let uint64 = shared.binaryToUint64(this.data.slice(0, 8))
    let long = new MongoDb.Long(uint64[0], uint64[1])
    let value = long.toString()
    this.data = this.data.slice(8)
    return value
  }

  base32N(n) {
    let value = shared.binaryToBase32(this.data.slice(0, n))
    this.data = this.data.slice(n)
    return value
  }

  hexN(n) {
    let value = shared.binaryToHex(this.data.slice(0, n))
    this.data = this.data.slice(n)
    return value
  }

  address() {
    return this.base32N(25)
  }

  hash256() {
    return this.hexN(32)
  }

  key() {
    return this.hexN(32)
  }

  id() {
    let uint64 = shared.binaryToUint64(this.data.slice(0, 8))
    let value = shared.idToHex(uint64)
    this.data = this.data.slice(8)
    return value
  }

  entityType() {
    return this.uint16()
  }

  accountRestriction() {
    let flags = this.uint16()
    let valuesCount = this.uint64()
    let values = []
    if ((flags & ACCOUNT_RESTRICTION_ADDRESS) !== 0) {
      this.n(values, parseInt(valuesCount), 'address')
    } else if ((flags & ACCOUNT_RESTRICTION_MOSAIC_ID) !== 0) {
      this.n(values, parseInt(valuesCount), 'id')
    } else if ((flags & ACCOUNT_RESTRICTION_TRANSACTION_TYPE) !== 0) {
      this.n(values, parseInt(valuesCount), 'entityType')
    } else {
      throw new Error(`invalid account restriction flags, got ${flags}`)
    }

    return {
      flags,
      values
    }
  }

  mosaic() {
    let mosaicId = this.id()
    let amount = this.uint64()

    return {
      mosaicId,
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

  mosaicRestrictions(valueFn) {
    // Create the generic callback for all restriction types.
    let valueCallback = this.callback(valueFn)
    let callback = () => {
      let key = this.uint64()
      let value = valueCallback()
      return {key, value}
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
    const entryType = MOSAIC_RESTRICTION_ADDRESS
    let mosaicId = this.id()
    let targetAddress = this.address()
    let restrictions = this.mosaicRestrictions('mosaicAddressRestrictionValue')

    return {
      entryType,
      mosaicId,
      targetAddress,
      restrictions
    }
  }

  mosaicGlobalRestrictionValue() {
    let mosaicId = this.id()
    let value = this.uint64()
    let type = this.uint8()

    return {
      mosaicId,
      value,
      type
    }
  }

  mosaicGlobalRestriction() {
    const entryType = MOSAIC_RESTRICTION_GLOBAL
    let mosaicId = this.id()
    let restrictions = this.mosaicRestrictions('mosaicGlobalRestrictionValue')

    return {
      entryType,
      mosaicId,
      restrictions
    }
  }

  alias() {
    let type = this.uint8()
    if (type === ALIAS_MOSAIC) {
      let mosaicId = this.id()
      return {type, mosaicId}
    } else if (type === ALIAS_ADDRESS) {
      let address = this.address()
      return {type, address}
    } else if (type === ALIAS_NONE) {
      return {type}
    } else {
      throw new Error(`invalid alias type ${type}`)
    }
  }

  childNamespace(rootId) {
    // Read the fully qualified path.
    let depth = this.uint8()
    let path = [rootId]
    this.n(path, depth, 'id')
    let namespace = path.join('.')

    // Read the alias
    let alias = this.alias()

    return {
      namespace,
      alias
    }
  }

  rootNamespace(rootId) {
    let owner = this.key()
    let lifetimeStart = this.uint64()
    let lifetimeEnd = this.uint64()
    let alias = this.alias()
    let childrenCount = this.uint64()
    let children = []
    let callback = () => this.childNamespace(rootId)
    this.n(children, parseInt(childrenCount), callback)

    return {
      owner,
      lifetimeStart,
      lifetimeEnd,
      alias,
      children
    }
  }
}

// FORMATTERS

/**
 *  Formatter for RocksDB collections.
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
const format = {
  AccountRestrictionCache: {
    key: key => Reader.solitary(key, 'address'),
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
      let reader = new Reader(data)
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
    key: key => Reader.solitary(key, 'address'),
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
      let reader = new Reader(data)
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
    key: key => Reader.solitary(key, 'timestampedHash'),
    value: value => Reader.solitary(value, 'empty')
  },

  HashLockInfoCache: {
    key: key => Reader.solitary(key, 'hash256'),
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
      let reader = new Reader(data)
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
    key: key => Reader.solitary(key, 'hash256'),
    value: data => {
      // Model:
      //  Note: targetId can be either a MosaicId, a NamespaceId, or all 0s.
      //
      //  struct SecretLockInfo {
      //    Key sourcePublicKey;
      //    Key targetPublicKey;
      //    uint64_t scopedMetadataKey;
      //    uint64_t targetId;
      //    uint8_t metadataType;
      //    uint16_t valueSize;
      //    uint8_t[valueSize] value;
      //  }

      // Parse Information
      let reader = new Reader(data)
      reader.validateStateVersion(1)
      let sourcePublicKey = reader.key()
      let targetPublicKey = reader.key()
      let scopedMetadataKey = reader.uint64()
      let targetId = reader.id()
      let metadataType = reader.uint8()
      let valueSize = reader.uint16()
      let value = reader.hexN(valueSize)
      reader.validateEmpty()

      let key = {
        sourcePublicKey,
        targetPublicKey,
        scopedMetadataKey,
        targetId,
        metadataType
      }

      return {
        key,
        value
      }
    }
  },

  MosaicCache: {
    key: key => Reader.solitary(key, 'id'),
    value: data => {
      // Model:
      //  struct Mosaic {
      //    MosaicId mosaicId;
      //    uint64_t supply;
      //    Height height;
      //    Key ownerPublicKey;
      //    uint32_t revision;
      //    uint8_t flags;
      //    uint8_t divisibility;
      //    uint64_t duration;
      //  }

      // Parse Information
      let reader = new Reader(data)
      reader.validateStateVersion(1)
      let mosaicId = reader.id()
      let supply = reader.uint64()
      let height = reader.uint64()
      let ownerPublicKey = reader.key()
      let revision = reader.uint32()
      let flags = reader.uint8()
      let divisibility = reader.uint8()
      let duration = reader.uint64()
      reader.validateEmpty()

      return {
        mosaicId,
        supply,
        height,
        ownerPublicKey,
        revision,
        flags,
        divisibility,
        duration
      }
    }
  },

  MosaicRestrictionCache: {
    key: key => Reader.solitary(key, 'hash256'),
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
      let reader = new Reader(data)
      reader.validateStateVersion(1)
      let entryType = reader.uint8()
      let value
      if (entryType === MOSAIC_RESTRICTION_ADDRESS) {
        value = reader.mosaicAddressRestriction()
      } else if (entryType === MOSAIC_RESTRICTION_GLOBAL) {
        value = reader.mosaicGlobalRestriction()
      } else {
        throw new Error(`invalid mosaic restriction type, got ${entryType}`)
      }
      reader.validateEmpty()

      return value
    }
  },

  MultisigCache: {
    key: key => Reader.solitary(key, 'key'),
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
      let reader = new Reader(data)
      reader.validateStateVersion(1)
      let minApproval = reader.uint32()
      let minRemoval = reader.uint32()
      let key = reader.key()
      let cosignatoryPublicKeys = []
      let cosignatoryCount = reader.uint64()
      reader.n(cosignatoryPublicKeys, parseInt(cosignatoryCount), 'key')
      let multisigPublicKeys = []
      let multisigCount = reader.uint64()
      reader.n(multisigPublicKeys, parseInt(multisigCount), 'key')
      reader.validateEmpty()

      return {
        minApproval,
        minRemoval,
        key,
        cosignatoryPublicKeys,
        multisigPublicKeys
      }
    }
  },

  NamespaceCache: {
    key: key => Reader.solitary(key, 'id'),
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
      let reader = new Reader(data)
      reader.validateStateVersion(1)
      let historyDepth = reader.uint64()
      let namespaceId = reader.id()
      let rootNamespace = []
      let callback = () => reader.rootNamespace(namespaceId)
      reader.n(rootNamespace, parseInt(historyDepth), callback)
      reader.validateEmpty()

      return {
        namespaceId,
        rootNamespace
      }
    }
  },

  SecretLockInfoCache: {
    key: key => Reader.solitary(key, 'hash256'),
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
      let reader = new Reader(data)
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
        senderPublicKey,
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

// API

/**
 *  Dump RocksDB data to JSON.
 *
 *  @param options {Object}       - Options to specify dump parameters.
 *    @field dataDir {String}     - Path to the catapult data directory.
 *    @field node {String}        - Name of the node (api-node-0).
 *    @field collection {String}  - Collection name.
 *    @field limit {Number}       - Maximum number of items to dump.
 *    @field verbose {Boolean}    - Display debug information.
 */
const dump = async options => {
  // Create a new rocksdb, read-only handle.
  let path = `${options.dataDir}/statedb/${options.collection}`
  let level = new Level(path)
  if (options.verbose) {
    console.info(`Connected to rocks at ${path}`)
  }

  // Iterate up to limit values, and assign to result.
  let result = {}
  let limit = options.limit || Number.MAX_SAFE_INTEGER
  let formatter = format[options.collection]
  let iterator = level.iterator()
  do {
    // Fetch the next item from the map.
    // Break if we've got no more values, or we've reached the SIZE key.
    let item = await iterator.next()
    if (item === null) {
      break
    } else if (item.encodedKey.equals(Level.size_key)) {
      continue
    }

    // Decode key/value and assign to result.
    let key = formatter.key(item.encodedKey)
    let value = formatter.value(item.encodedValue)
    result[key] = value

    // Decrement our limit on a successful iteration.
    --limit
  } while (limit !== 0)

  // Close the rocksdb handle.
  await level.close()

  return result
}

export default {
  dump
}
