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

const validateStateInformation = (data, expected) => {
  var [stateVersion, data] = readUint16(data)
  if (stateVersion != expected) {
    throw new Error(`invalid StateVersion, got ${stateVersion}`)
  }
  return data
}

const readAddress = data => {
  let address = shared.binaryToBase32(data.slice(0, 25))
  return [address, data.slice(25)]
}

const readUint8 = data => {
  let value = shared.binaryToUint8(data.slice(0, 1))
  return [value, data.slice(1)]
}

const readUint16 = data => {
  let value = shared.binaryToUint16(data.slice(0, 2))
  return [value, data.slice(2)]
}

const readUint32 = data => {
  let value = shared.binaryToUint32(data.slice(0, 4))
  return [value, data.slice(4)]
}

const readUint64 = data => {
  let uint64 = shared.binaryToUint64(data.slice(0, 8))
  let long = new MongoDb.Long(uint64[0], uint64[1])
  let value = long.toString()
  return [value, data.slice(8)]
}

const readHexN = (data, n) => {
  let key = shared.binaryToHex(data.slice(0, n))
  return [key, data.slice(n)]
}

const readHash256 = data => readHexN(data, 32)

const readId = data => {
  let uint64 = shared.binaryToUint64(data.slice(0, 8))
  let value = shared.idToHex(uint64)
  return [value, data.slice(8)]
}

const readKey = data => readHexN(data, 32)

const readEntityType = data => {
  return readUint16(data)
}

const readAccountRestriction = data => {
  var [flags, data] = readUint16(data)
  var [valuesCount, data] = readUint64(data)
  let values = []
  if ((flags & ACCOUNT_RESTRICTION_ADDRESS) !== 0) {
    data = readN(data, values, valuesCount, readAddress)
  } else if ((flags & ACCOUNT_RESTRICTION_MOSAIC_ID) !== 0) {
    data = readN(data, values, valuesCount, readId)
  } else if ((flags & ACCOUNT_RESTRICTION_TRANSACTION_TYPE) !== 0) {
    data = readN(data, values, valuesCount, readEntityType)
  } else {
    throw new Error(`invalid account restriction flags, got ${flags}`)
  }

  let value = {flags, values}
  return [value, data]
}

const readMosaic = data => {
  var [mosaicId, data] = readId(data)
  var [amount, data] = readUint64(data)
  return [{mosaicId, amount}, data]
}

const readImportance = data => {
  var [value, data] = readUint64(data)
  var [height, data] = readUint64(data)
  return [{value, height}, data]
}

const readActivityBucket = data => {
  var [startHeight, data] = readUint64(data)
  var [totalFeesPaid, data] = readUint64(data)
  var [beneficiaryCount, data] = readUint32(data)
  var [rawScore, data] = readUint64(data)
  let value = {startHeight, totalFeesPaid, beneficiaryCount, rawScore}
  return [value, data]
}

const readTimestampedHash = data => {
  var [time, data] = readUint64(data)
  var [hash, data] = readHash256(data)
  let value = `${time}@${hash}`
  return [value, data]
}

const readEmpty = data => {
  return [null, data]
}

const readAlias = data => {
  var [type, data] = readUint8(data)
  if (type === ALIAS_MOSAIC) {
    var [mosaicId, data] = readId(data)
    return [{type, mosaicId}, data]
  } else if (type === ALIAS_ADDRESS) {
    var [address, data] = readAddress(data)
    return [{type, address}, data]
  } else {
    return [{type}, data]
  }
}

const readChildrenNamespace = (data, rootId) => {
  // Read the path
  var [childDepth, data] = readUint8(data)
  let path = [rootId]
  data = readN(data, path, childDepth, readId)
  let namespace = path.join('.')

  // Read the alias.
  var [alias, data] = readAlias(data)

  return [{namespace, alias}, data]
}

const readRootNamespace = (data, rootId) => {
  var [owner, data] = readKey(data)
  var [lifetimeStart, data] = readUint64(data)
  var [lifetimeEnd, data] = readUint64(data)
  var [alias, data] = readAlias(data)
  var [childrenCount, data] = readUint64(data)
  let children = []
  let callback = x => readChildrenNamespace(x, rootId)
  data = readN(data, children, parseInt(childrenCount), callback)
  let value = {
    owner,
    lifetimeStart,
    lifetimeEnd,
    alias,
    children
  }

  return [value, data]
}

const readMosaicRestrictions = (data, valueCallback) => {
  // Create the generic callback for all restriction types.
  let callback = data => {
    var [key, data] = readUint64(data)
    var [value, data] = valueCallback(data)
    return [{key, value}, data]
  }

  // Read the restrictions.
  var [keyCount, data] = readUint8(data)
  let restrictions = []
  data = readN(data, restrictions, keyCount, callback)

  return [restrictions, data]
}

const readMosaicAddressRestrictionValue = data => readUint64(data)

const readMosaicAddressRestriction = data => {
  const entryType = MOSAIC_RESTRICTION_ADDRESS
  var [mosaicId, data] = readId(data)
  var [targetAddress, data] = readAddress(data)
  var [restrictions, data] = readMosaicRestrictions(data, readMosaicAddressRestrictionValue)
  let value = {entryType, mosaicId, targetAddress, restrictions}

  return [value, data]
}

const readMosaicGlobalRestrictionValue = data => {
  var [mosaicId, data] = readId(data)
  var [value, data] = readUint64(data)
  var [type, data] = readUint8(data)
  return [{mosaicId, value, type}, data]
}

const readMosaicGlobalRestriction = data => {
  const entryType = MOSAIC_RESTRICTION_GLOBAL
  var [mosaicId, data] = readId(data)
  var [restrictions, data] = readMosaicRestrictions(data, readMosaicGlobalRestrictionValue)
  let value = {entryType, mosaicId, restrictions}

  return [value, data]
}

const readN = (data, array, count, callback) => {
  for (let index = 0; index < count; index++) {
    let result = callback(data)
    array.push(result[0])
    data = result[1]
  }
  return data
}

const readSolitaryValue = (data, callback) => {
  var [key, data] = callback(data)
  if (data.length !== 0) {
    throw new Error('invalid trailing data')
  }
  return key
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
    key: key => readRocksKey(key, readAddress),
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
      data = validateStateInformation(data, 1)
      var [address, data] = readAddress(data)
      let restrictions = []
      var [restrictionsCount, data] = readUint64(data)
      data = readN(data, restrictions, restrictionsCount, readAccountRestriction)

      if (data.length !== 0) {
        throw new Error('invalid trailing data')
      }

      return {
        address,
        restrictions
      }
    }
  },

  AccountStateCache: {
    key: key => readRocksKey(key, readAddress),
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
      data = validateStateInformation(data, 1)
      var [address, data] = readAddress(data)
      var [addressHeight, data] = readUint64(data)
      var [publicKey, data] = readKey(data)
      var [publicKeyHeight, data] = readUint64(data)
      var [accountType, data] = readUint8(data)
      var [linkedAccountKey, data] = readKey(data)
      var [format, data] = readUint8(data)
      let importances = []
      let activityBuckets = []
      let mosaics = []
      if (format == regular) {
        // No-op, no non-historical data
      } else if (format === highValue) {
        // Read non-historical data.
        data = readN(data, importances, importanceSize, readImportance)
        data = readN(data, activityBuckets, activityBucketsSize, readActivityBucket)
      } else {
        throw new Error(`invalid AccountStateFormat ${format}`)
      }
      // Skip 8 bytes for the optimized mosaic ID.
      var [optimizedId, data] = readId(data)
      var [mosaicsCount, data] = readUint16(data)
      data = readN(data, mosaics, mosaicsCount, readMosaic)

      // Parse Historical Information
      if (format == regular) {
        data = readN(data, importances, IMPORTANCE_HISTORY_SIZE, readImportance)
        data = readN(data, activityBuckets, ACTIVITY_BUCKET_HISTORY_SIZE, readActivityBucket)
      } else {
        data = readN(data, importances, ROLLBACK_BUFFER_SIZE, readImportance)
        data = readN(data, activityBuckets, ROLLBACK_BUFFER_SIZE, readActivityBucket)
      }

      if (data.length !== 0) {
        throw new Error('invalid trailing data')
      }

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
    key: key => readSolitaryValue(key, readTimestampedHash),
    value: value => readSolitaryValue(value, readEmpty)
  },

  HashLockInfoCache: {
    key: key => readSolitaryValue(key, readHash256),
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
      data = validateStateInformation(data, 1)
      var [senderPublicKey, data] = readKey(data)
      var [mosaicId, data] = readId(data)
      var [amount, data] = readUint64(data)
      var [endHeight, data] = readUint64(data)
      var [status, data] = readUint8(data)
      var [hash, data] = readHash256(data)

      if (data.length !== 0) {
        throw new Error('invalid trailing data')
      }

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
    key: key => readSolitaryValue(key, readHash256),
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
      data = validateStateInformation(data, 1)
      var [sourcePublicKey, data] = readKey(data)
      var [targetPublicKey, data] = readKey(data)
      var [scopedMetadataKey, data] = readUint64(data)
      var [targetId, data] = readId(data)
      var [metadataType, data] = readUint8(data)
      var [valueSize, data] = readUint16(data)
      var [value, data] = readHexN(data, valueSize)
      let key = {sourcePublicKey, targetPublicKey, scopedMetadataKey, targetId, metadataType}

      if (data.length !== 0) {
        throw new Error('invalid trailing data')
      }

      return {
        key,
        value
      }
    }
  },

  MosaicCache: {
    key: key => readSolitaryValue(key, readId),
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
      data = validateStateInformation(data, 1)
      var [mosaicId, data] = readId(data)
      var [supply, data] = readUint64(data)
      var [height, data] = readUint64(data)
      var [ownerPublicKey, data] = readKey(data)
      var [revision, data] = readUint32(data)
      var [flags, data] = readUint8(data)
      var [divisibility, data] = readUint8(data)
      var [duration, data] = readUint64(data)

      if (data.length !== 0) {
        throw new Error('invalid trailing data')
      }

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
    key: key => readSolitaryValue(key, readHash256),
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
      data = validateStateInformation(data, 1)
      var [entryType, data] = readUint8(data)
      if (entryType === MOSAIC_RESTRICTION_ADDRESS) {
        return readSolitaryValue(data, readMosaicAddressRestriction)
      } else if (entryType === MOSAIC_RESTRICTION_GLOBAL) {
        return readSolitaryValue(data, readMosaicGlobalRestriction)
      } else {
        throw new Error(`invalid mosaic restriction type, got ${entryType}`)
      }
    }
  },

  MultisigCache: {
    key: key => readSolitaryValue(key, readKey),
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
      data = validateStateInformation(data, 1)
      var [minApproval, data] = readUint32(data)
      var [minRemoval, data] = readUint32(data)
      var [key, data] = readKey(data)
      let cosignatoryPublicKeys = []
      var [cosignatoryPublicKeysCount, data] = readUint64(data)
      data = readN(data, cosignatoryPublicKeys, parseInt(cosignatoryPublicKeysCount), readKey)
      let multisigPublicKeys = []
      var [multisigPublicKeysCount, data] = readUint64(data)
      data = readN(data, multisigPublicKeys, parseInt(multisigPublicKeysCount), readKey)

      if (data.length !== 0) {
        throw new Error('invalid trailing data')
      }

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
    key: key => readSolitaryValue(key, readId),
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
      data = validateStateInformation(data, 1)
      var [historyDepth, data] = readUint64(data)
      var [namespaceId, data] = readId(data)
      let rootNamespace = []
      let callback = x => readRootNamespace(x, namespaceId)
      data = readN(data, rootNamespace, parseInt(historyDepth), callback)

      if (data.length !== 0) {
        throw new Error('invalid trailing data')
      }

      return {
        namespaceId,
        rootNamespace
      }
    }
  },

  SecretLockInfoCache: {
    key: key => readSolitaryValue(key, readHash256),
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
      data = validateStateInformation(data, 1)
      var [senderPublicKey, data] = readKey(data)
      var [mosaicId, data] = readId(data)
      var [amount, data] = readUint64(data)
      var [endHeight, data] = readUint64(data)
      var [status, data] = readUint8(data)
      var [hashAlgorithm, data] = readUint8(data)
      var [secret, data] = readHash256(data)
      var [recipientAddress, data] = readAddress(data)

      if (data.length !== 0) {
        throw new Error('invalid trailing data')
      }

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
