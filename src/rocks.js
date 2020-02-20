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

import rocksCodec from './codec/rocks'
import Level from './util/level'

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

  // Close the rocksdb handle.
  await level.close()

  return result
}

export default {
  dump
}
