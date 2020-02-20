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
 *  Utilities to process data from catapult's MongoDB store.
 */

import MongoDb from 'mongodb'
import mongoCodec from './codec/mongo'

/**
 *  Get connection to MongoDB.
 *
 *  @param options {Object}       - Options to specify dump parameters.
 *    @field database {String}    - Database connection path.
 *    @field verbose {Boolean}    - Display debug information.
 */
const connect = async options => {
  let client = await MongoDb.MongoClient.connect(options.database, {
    promoteLongs: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  if (options.verbose) {
    console.info(`Connected to mongo at ${options.database}`)
  }
  return client
}

/**
 *  Dump MongoDB data to JSON.
 *
 *  @param options {Object}       - Options to specify dump parameters.
 *    @field database {String}    - Database connection path.
 *    @field collection {String}  - Collection name.
 *    @field limit {Number}       - Maximum number of items to dump.
 *    @field verbose {Boolean}    - Display debug information.
 */
const dump = async options => {
  let client = await connect(options)
  let db = client.db()
  let codec = mongoCodec[options.collection]
  let data = await db.collection(options.collection)
    .find()
    .limit(options.limit)
    .sort({ _id: -1 })
    .map(codec)
    .toArray()

  client.close()

  return data
}

export default {
  dump
}
