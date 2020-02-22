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
    this.data = data
  }

  // EMPTY

  validateEmpty() {
    if (this.data.length !== 0) {
      throw new Error('invalid trailing data')
    }
  }

  // READERS

  callback(fn) {
    if (typeof fn === 'string') {
      return () => this[fn]()
    } else {
      return fn
    }
  }

  solitary(fn) {
    let callback = this.callback(fn)
    let value = callback()
    this.validateEmpty()
    return value
  }

  n(array, count, fn) {
    let callback = this.callback(fn)
    for (let index = 0; index < count; index++) {
      array.push(callback.call())
    }
  }

  // Like N, but count uses a 64-bit Long.
  nLong(array, count, fn) {
    let callback = this.callback(fn)
    let start = MongoDb.Long.fromInt(0)
    let increment = MongoDb.Long.fromInt(1)
    for (let index = start; index.lessThan(count); index = index.add(increment)) {
      array.push(callback.call())
    }
  }

  int8() {
    let value = shared.binaryToInt8(this.data.slice(0, 1))
    this.data = this.data.slice(1)
    return value
  }

  int16() {
    let value = shared.binaryToInt16(this.data.slice(0, 2))
    this.data = this.data.slice(2)
    return value
  }

  int32() {
    let value = shared.binaryToInt32(this.data.slice(0, 4))
    this.data = this.data.slice(4)
    return value
  }

  uint8() {
    let value = shared.binaryToUint8(this.data.slice(0, 1))
    this.data = this.data.slice(1)
    return value
  }

  uint16() {
    let value = shared.binaryToUint16(this.data.slice(0, 2))
    this.data = this.data.slice(2)
    return value
  }

  uint32() {
    let value = shared.binaryToUint32(this.data.slice(0, 4))
    this.data = this.data.slice(4)
    return value
  }

  rawUint64() {
    let value = shared.binaryToUint64(this.data.slice(0, 8))
    this.data = this.data.slice(8)
    return value
  }

  long() {
    let uint64 = this.rawUint64()
    return new MongoDb.Long(uint64[0], uint64[1])
  }

  uint64() {
    return shared.uint64ToString(this.rawUint64())
  }

  binaryN(n) {
    if (this.data.length < n) {
      throw new Error(`cannot extract ${n} bytes, buffer only contains ${this.data.length}`)
    }
    let value = this.data.slice(0, n)
    this.data = this.data.slice(n)
    return value
  }

  asciiN(n) {
    return shared.binaryToAscii(this.binaryN(n))
  }

  base32N(n) {
    return shared.binaryToBase32(this.binaryN(n))
  }

  hexN(n) {
    return shared.binaryToHex(this.binaryN(n))
  }

  address() {
    return this.base32N(25)
  }

  hash256() {
    return this.hexN(32)
  }

  key() {
    return this.hexN(32)
  }

  signature() {
    return this.hexN(64)
  }

  id() {
    return shared.idToHex(this.rawUint64())
  }

  entityType() {
    return this.uint16()
  }
}
