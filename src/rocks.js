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
 *  Utilities to process data from catapult's RocksDB store.
 */

import path from 'path'
import defaults from './defaults'
import rocksCodec from './codec/rocks'
import Level from './util/level'
import name from './util/name'

const COLLECTION_LOOKUP = new Set([
  'AccountRestrictionCache',
  'AccountStateCache',
  'HashCache',
  'HashLockInfoCache',
  'MetadataCache',
  'MosaicCache',
  'MosaicRestrictionCache',
  'MultisigCache',
  'NamespaceCache',
  'SecretLockInfoCache'
])

// API

/**
 *  List of all known RocksDB collections.
 */
const COLLECTIONS = Array.from(COLLECTION_LOOKUP).sort()

/**
 *  Get if the collection name(s) are valid.
 *
 *  @param collection {String}     - Comma-separated list of collection names.
 */
const isValidCollection = collection => {
  return name.isValid(collection, COLLECTIONS, COLLECTION_LOOKUP)
}

/**
 *  Dump single RocksDB collection to JSON.
 */
const dumpOne = async options => {
  // Config
  let dataDir = defaults.dataDir(options)
  let directory = path.join(dataDir, 'statedb', options.collection)
  let limit = defaults.limit(options) || Number.MAX_SAFE_INTEGER
  let verbose = defaults.verbose(options)

  // Create a new rocksdb, read-only handle.
  let level = new Level(directory)
  if (verbose) {
    console.info(`Connected to rocks at ${directory}`)
  }

  let result = {}
  try {
    // Iterate up to limit values, and assign to result.
    let codec = rocksCodec[options.collection]
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
      let key = codec.key(item.encodedKey)
      let value = codec.value(item.encodedValue)
      result[key] = value

      // Decrement our limit on a successful iteration.
      --limit
    } while (limit !== 0)
  } finally {
    // Close the rocksdb handle.
    await level.close()
  }

  // Process the extracted data.
  if (options.collection === 'HashCache') {
    result = Object.keys(result)
  }

  return result
}

/**
 *  Dump all RocksDB collections to JSON.
 */
const dumpMany = async (options, collections) => {
  let result = {}
  for (let collection of collections) {
    result[collection] = await dumpOne({...options, collection})
  }
  return result
}

/**
 *  Dump RocksDB data to JSON.
 *
 *  @param options {Object}       - Options to specify dump parameters.
 *    @field collection {String}  - Collection name(s) (required).
 *    @field dataDir {String}     - Path to the catapult data directory (default '/data').
 *    @field limit {Number}       - Maximum number of items to dump (default 0).
 *    @field verbose {Boolean}    - Display debug information (default false).
 */
const dump = async options => {
  let collections = name.parse(options.collection, COLLECTIONS)
  if (collections.length !== 1) {
    return dumpMany(options, collections)
  } else {
    return dumpOne(options)
  }
}

export default {
  COLLECTIONS,
  isValidCollection,
  dump
}
