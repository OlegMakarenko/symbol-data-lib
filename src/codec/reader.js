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
import shared from '../util/shared'

/**
 *  Binary reader with helpers for primitive operations.
 */

export default class Reader {
  constructor(data) {
    this._data = data
  }

  /**
   *  Get access to the remaining data.
   */
  get data() {
    return this._data
  }

  // EMPTY

  validateEmpty() {
    if (this._data.length !== 0) {
      throw new Error('invalid trailing data')
    }
  }

  // HELPERS

  callback(fn) {
    if (typeof fn === 'string') {
      return (...args) => this[fn](...args)
    } else {
      return fn
    }
  }

  solitary(fn, ...args) {
    let callback = this.callback(fn)
    let value = callback.call(this, ...args)
    this.validateEmpty()
    return value
  }

  // ARRAYS

  n(array, count, fn) {
    let callback = this.callback(fn)
    for (let index = 0; index < count; index++) {
      array.push(callback.call(this))
    }
  }

  // Like N, but count uses a 64-bit Long.
  nLong(array, count, fn) {
    let callback = this.callback(fn)
    let start = MongoDb.Long.fromInt(0)
    let increment = MongoDb.Long.fromInt(1)
    for (let index = start; index.lessThan(count); index = index.add(increment)) {
      array.push(callback.call(this))
    }
  }

  // PRIMITIVES

  int8() {
    let value = shared.readInt8(this._data)
    this._data = this._data.slice(1)
    return value
  }

  int16() {
    let value = shared.readInt16(this._data)
    this._data = this._data.slice(2)
    return value
  }

  int32() {
    let value = shared.readInt32(this._data)
    this._data = this._data.slice(4)
    return value
  }

  uint8() {
    let value = shared.readUint8(this._data)
    this._data = this._data.slice(1)
    return value
  }

  uint16() {
    let value = shared.readUint16(this._data)
    this._data = this._data.slice(2)
    return value
  }

  uint32() {
    let value = shared.readUint32(this._data)
    this._data = this._data.slice(4)
    return value
  }

  uint64() {
    let value = shared.readUint64(this._data)
    this._data = this._data.slice(8)
    return value
  }

  long() {
    let uint64 = this.uint64()
    return new MongoDb.Long(uint64[0], uint64[1])
  }

  uint64String() {
    return shared.uint64ToString(this.uint64())
  }

  // CATAPULT TYPES

  binary(n) {
    if (this._data.length < n) {
      throw new Error(`cannot extract ${n} bytes, buffer only contains ${this._data.length}`)
    }
    let value = this._data.slice(0, n)
    this._data = this._data.slice(n)
    return value
  }

  ascii(n) {
    return shared.readAscii(this.binary(n))
  }

  base32(n) {
    return shared.readBase32(this.binary(n))
  }

  hex(n) {
    return shared.readHex(this.binary(n))
  }

  address() {
    return this.base32(25)
  }

  hash256() {
    return this.hex(32)
  }

  key() {
    return this.hex(32)
  }

  signature() {
    return this.hex(64)
  }

  id() {
    return shared.uint64ToId(this.uint64())
  }

  entityType() {
    return this.uint16()
  }
}
