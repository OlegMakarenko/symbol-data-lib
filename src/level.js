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
 *  Wrapper around a LevelDB-like database, using RocksDB as the backend.
 */

import encode from 'encoding-down'
import levelup from 'levelup'
import rocksdb from 'rocksdb'
import shared from './shared'

// CONSTANTS

// Denotes the 'size' field.
const SIZE = Buffer.from('size')

/**
 *  Global encoding options.
 */
const ENCODING_OPTIONS = {
  keyEncoding: 'binary',
  valueEncoding: 'binary'
}

/**
 *  Global levelup options.
 */
const LEVEL_OPTIONS = {
  createIfMissing: false,
  readOnly: true
}


/**
 *  Promise-based wrapper on a leveldb-iterator.
 */
class LevelIterator {
  constructor(iterator) {
    this.iterator = iterator
  }

  /**
   *  Get next item in iterator as a promise.
   */
  next() {
    return new Promise((resolve, reject) => {
      this.iterator.next((err, encodedKey, encodedValue) => {
        if (err) {
          // Error occured in finding element.
          return reject(err)
        } else if (encodedKey === undefined) {
          // No suitable item found.
          return resolve(null)
        } else {
          return resolve({ encodedKey, encodedValue })
        }
      })
    })
  }
}

/**
 *  High-level wrapper around a leveldb-like store.
 */
export default class Level {
  constructor(path) {
    this.path = path
    this.db = levelup(encode(rocksdb(path), ENCODING_OPTIONS), LEVEL_OPTIONS)
  }

  /**
   *  Custom callback to encode the key. Defaults to identity.
   */
  encodeKey(key) {
    return key
  }

  /**
   *  Custom callback to encode the value. Defaults to identity.
   */
  encodeValue(key, value) {
    return value
  }

  /**
   *  Custom callback to decode the key. Defaults to identity.
   */
  decodeKey(encodedKey) {
    return encodedKey
  }

  /**
   *  Custom callback to decode the value. Defaults to identity.
   */
  decodeValue(key, encodedValue) {
    return encodedValue
  }

  /**
   *  Get an iterator over items in the store.
   */
  iterator() {
    return new LevelIterator(this.db.iterator({
      keyAsBuffer: true,
      valueAsBuffer: true,
      reverse: true
    }))
  }

  /**
   *  Get value from cache by key.
   */
  async get(key) {
    let encodedKey = this.encodeKey(key)
    let encodedValue = await this.db.get(encodedKey)
    return this.decodeValue(key, encodedValue)
  }

  /**
   *  Get the key to denote the size.
   */
  static get size_key() {
    return SIZE
  }

  /**
   *  Get the number of records in the RocksDB store.
   */
  async size() {
    let value = await this.get(Level.size_key)
    if (value === undefined) {
      return [0, 0]
    }
    return shared.binaryToUint64(value)
  }

  /**
   *  Close the database.
   */
  async close() {
    await this.db.close()
  }

  /**
   *  Get if the database connection is open.
   */
  get isOpen() {
    return this.db.isOpen()
  }

  /**
   *  Get if the database connection is closed.
   */
  get isClosed() {
    return this.db.isClosed()
  }
}
