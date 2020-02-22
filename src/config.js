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
 *  Utilities to process data from catapult's configuration files.
 */

import path from 'path'
import configCodec from './codec/config'
import name from './util/name'

// Map collection names to paths.
const COLLECTION_FILES = {
  'database': 'config-database.properties',
  'extensions-broker': 'config-extensions-broker.properties',
  'extensions-recovery': 'config-extensions-recovery.properties',
  'extensions-server': 'config-extensions-server.properties',
  'harvesting': 'config-harvesting.properties',
  'inflation': 'config-inflation.properties',
  'logging-broker': 'config-logging-broker.properties',
  'logging-recovery': 'config-logging-recovery.properties',
  'logging-server': 'config-logging-server.properties',
  'messaging': 'config-messaging.properties',
  'network': 'config-network.properties',
  'network-height': 'config-networkheight.properties',
  'node': 'config-node.properties',
  'partial-transactions': 'config-pt.properties',
  'task': 'config-task.properties',
  'time-sync': 'config-timesync.properties',
  'user': 'config-user.properties',
  'peers-api': 'peers-api.json',
  'peers-p2p': 'peers-p2p.json'
}

const COLLECTION_LOOKUP = new Set(Object.keys(COLLECTION_FILES))

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
  let basename = COLLECTION_FILES[options.collection]
  return configCodec.file(path.join(options.configDir, basename))
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
 *    @field configDir {String}     - Path to the catapult config directory.
 *    @field collection {String}  - Collection name(s).
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
