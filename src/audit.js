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

import fs from 'fs'
import path from 'path'
import defaults from './defaults'
import auditCodec from './codec/audit'
import name from './util/name'

// Map collection names to directory names.
const COLLECTION_DIRECTORIES = {
  'block': 'block dispatcher',
  'transaction': 'transaction dispatcher'
}

const COLLECTION_LOOKUP = new Set(Object.keys(COLLECTION_DIRECTORIES))

// Stable sort based on timestamps.
const sortTimestamp = (x, y) => {
  let xPad = x.padStart(20, '0')
  let yPad = y.padStart(20, '0')

  if (xPad < yPad) {
    return -1
  } else if (xPad > yPad) {
    return 1
  } else {
    return 0
  }
}

// Stable sort based on small integers.
const sortInteger = (x, y) => {
  let xInt = parseInt(x)
  let yInt = parseInt(y)

  if (xInt < yInt) {
    return -1
  } else if (xInt > yInt) {
    return 1
  } else {
    return 0
  }
}

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
  let dataDir = defaults.dataDir(options)
  let directory = path.join(dataDir, 'audit', COLLECTION_DIRECTORIES[options.collection])
  let limit = defaults.limit(options) || Number.MAX_SAFE_INTEGER
  let codec = auditCodec[options.collection]

  // Iterate over the directories in reverse order, to parse the largest values
  // first. The order is based off the timestamps in the file, which are 64-bit
  // integers. Pad them to 20 digits, and
  let result = {}
  let timestamps = fs.readdirSync(directory)
    .sort(sortTimestamp)
    .reverse()

  for (let timestamp of timestamps) {
    result[timestamp] = {}
    let files = fs.readdirSync(path.join(directory, timestamp))
      .sort(sortInteger)
      .reverse()
    for (let file of files) {
      result[timestamp][file] = codec.file(path.join(directory, timestamp, file))
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
 *    @field collection {String}  - Collection name(s) (required).
 *    @field dataDir {String}     - Path to the catapult data directory (default '/data').
 *    @field limit {Number}       - Maximum number of files to dump (default 0).
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
