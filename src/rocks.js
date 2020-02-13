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
const ACCOUNT_RESTRICTION_ADDRESS = 0x0001
const ACCOUNT_RESTRICTION_MOSAIC_ID = 0x0002
const ACCOUNT_RESTRICTION_TRANSACTION_TYPE = 0x0004

// READERS

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

const readId = data => {
  let uint64 = shared.binaryToUint64(data.slice(0, 8))
  let value = shared.idToHex(uint64)
  return [value, data.slice(8)]
}

const readKey = data => {
  let key = shared.binaryToHex(data.slice(0, 32))
  return [key, data.slice(32)]
}

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

const readN = (data, array, count, callback) => {
  for (let index = 0; index < count; index++) {
    let result = callback(data)
    array.push(result[0])
    data = result[1]
  }
  return data
}

// FORMATTERS

/**
 *  Formatter for RocksDB collections.
 *
 *  # Shared Types
 *  Address = uint8_t[25];
 *  Key = uint8_t[32];
 *  Height = uint64_t;
 *  AccountType = uint8_t;
 */
const format = {
  AccountRestrictionCache: {
    key: key => readAddress(key)[0],
    value: item => {
      // Constants
      const expectedStateVersion = 1

      // Parse Information
      var [stateVersion, data] = readUint16(data)
      if (stateVersion != expectedStateVersion) {
        throw new Error(`invalid StateVersion, got ${stateVersion}`)
      }
      var [address, data] = readAddress(data)
      let restrictions = []
      var [restrictionsCount, data] = readUint64(data)
      data = readN(data, restrictions, restrictionsCount, readAccountRestriction)

      return {
        address,
        restrictions
      }
    }
  },

  AccountStateCache: {
    key: key => readAddress(key)[0],
    value: data => {
      // Constants
      const regular = 0
      const highValue = 1
      const expectedStateVersion = 1
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
      var [stateVersion, data] = readUint16(data)
      if (stateVersion != expectedStateVersion) {
        throw new Error(`invalid StateVersion, got ${stateVersion}`)
      }
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
    key: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    },
    value: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    }
  },

  HashLockInfoCache: {
    key: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    },
    value: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    }
  },

  MetadataCache: {
    key: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    },
    value: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    }
  },

  MosaicCache: {
    key: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    },
    value: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    }
  },

  MosaicRestrictionCache: {
    key: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    },
    value: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    }
  },

  MultisigCache: {
    key: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    },
    value: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    }
  },

  NamespaceCache: {
    key: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    },
    value: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    }
  },

  SecretLockInfoCache: {
    key: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
    },
    value: data => {
      // TODO(ahuszagh) Implement...
      throw new Error('not yet implemented')
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
  let limit = options.limit
  let formatter = format[options.collection]
  let iterator = level.iterator()
  do {
    // Fetch the next item from the map.
    // Break if we've got no more values, or we've reached the SIZE key.
    let item = await iterator.next()
    if (item === null || item.encodedKey.equals(Level.size_key)) {
      break
    }

    // Decode key/value and assign to result.
    let key = formatter.key(item.encodedKey)
    let value = formatter.value(item.encodedValue)
    result[key] = value
  } while (--limit !== 0)

  // Close the rocksdb handle.
  await level.close()

  return result
}

export default {
  dump
}
