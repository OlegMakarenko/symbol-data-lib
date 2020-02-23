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
 *  Codec to transform spool models to JSON.
 */

import fs from 'fs'
import path from 'path'
import spoolCodec from './codec/spool'
import name from './util/name'

const COLLECTION_LOOKUP = new Set([
  'block_change',
  'block_sync',
  'partial_transactions_change',
  'state_change',
  'transaction_status',
  'unconfirmed_transactions_change'
])

// API

/**
 *  List of all known config collections.
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
 *  Dump single config collection to JSON.
 */
const dumpOne = async options => {
  // Config
  let directory = path.join(options.dataDir, 'spool', options.collection)
  let limit = options.limit || Number.MAX_SAFE_INTEGER
  let codec = spoolCodec[options.collection]

  // Iterate over the directories in reverse order, to parse the largest values
  // first. The order is based on 16-bit hex identifiers, so they can be
  // trivially sorted.
  let result = {}
  let files = fs.readdirSync(directory).reverse()
  for (let file of files) {
    if (!file.startsWith('index')) {
      result[file] = codec.file(path.join(directory, file))
      --limit

      // Exhausted our limit, return early.
      if (limit === 0) {
        return result
      }
    }
  }

  return result
}

/**
 *  Dump all config collections to JSON.
 */
const dumpMany = async (options, collections) => {
  let result = {}
  for (let collection of collections) {
    result[collection] = await dumpOne({...options, collection})
  }
  return result
}

/**
 *  Dump config data to JSON.
 *
 *  @param options {Object}       - Options to specify dump parameters.
 *    @field dataDir {String}     - Path to the catapult data directory.
 *    @field collection {String}  - Collection name(s).
 *    @field limit {Number}       - Maximum number of files to dump.
 *    @field verbose {Boolean}    - Display debug information.
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
