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
 *  Binary writer with helpers for primitive operations.
 */

import assert from 'assert'
import base32 from '../util/base32'
import shared from '../util/shared'

export default class Writer {
  constructor(sizeHint) {
    // Initialize the buffer with a size hint
    this._data = Buffer.alloc(sizeHint || 1024)
    this._index = 0
  }

  /**
   *  Get access to the internal data.
   */
  get data() {
    return this._data.slice(0, this._index)
  }

  /**
   *  Get the current size.
   */
  get size() {
    return this._index
  }

  /**
   *  Get the current capacity.
   */
  get capacity() {
    return this._data.length
  }

  // HELPERS

  grow(size) {
    if (this.capacity < size) {
      // Double the size to avoid many allocations.
      let capacity = Math.max(2 * this.capacity, size)
      let data = Buffer.alloc(capacity)
      this._data.copy(data)
      this._data = data
    }
  }

  callback(fn) {
    if (typeof fn === 'string') {
      return value => this[fn](value)
    } else {
      return fn
    }
  }

  solitary(value, fn) {
    let callback = this.callback(fn)
    callback.call(this, value)
    return this.data
  }

  // ARRAYS

  n(array, fn) {
    let callback = this.callback(fn)
    for (let value of array) {
      callback.call(this, value)
    }
  }

  // PRIMITIVES

  int8(value) {
    this.grow(this.size + 1)
    this._index = shared.writeInt8(this._data, value, this._index)
  }

  int16(value) {
    this.grow(this.size + 2)
    this._index = shared.writeInt16(this._data, value, this._index)
  }

  int32(value) {
    this.grow(this.size + 4)
    this._index = shared.writeInt32(this._data, value, this._index)
  }

  uint8(value) {
    this.grow(this.size + 1)
    this._index = shared.writeUint8(this._data, value, this._index)
  }

  uint16(value) {
    this.grow(this.size + 2)
    this._index = shared.writeUint16(this._data, value, this._index)
  }

  uint32(value) {
    this.grow(this.size + 4)
    this._index = shared.writeUint32(this._data, value, this._index)
  }

  uint64(value) {
    this.grow(this.size + 8)
    this._index = shared.writeUint64(this._data, value, this._index)
  }

  uint64String(value) {
    return this.uint64(shared.stringToUint64(value))
  }

  // CATAPULT TYPES

  binary(value) {
    this.grow(this.size + value.length)
    this._index += value.copy(this._data, this._index)
  }

  ascii(value) {
    this.binary(Buffer.from(value, 'ascii'))
  }

  base32(value) {
    // Base32 codec can't handle string values, requires a buffer.
    if (typeof value === 'string') {
      value = Buffer.from(value, 'ascii')
    }
    this.binary(base32.decode(value))
  }

  hex(value) {
    this.binary(Buffer.from(value, 'hex'))
  }

  address(value) {
    assert(value.length === 40, 'invalid address length')
    this.base32(value)
  }

  hash256(value) {
    assert(value.length === 64, 'invalid hash256 length')
    this.hex(value)
  }

  key(value) {
    assert(value.length === 64, 'invalid key length')
    this.hex(value)
  }

  signature(value) {
    assert(value.length === 128, 'invalid signature length')
    this.hex(value)
  }

  id(value) {
    assert(value.length === 16, 'invalid ID length')
    this.uint64(shared.idToUint64(value))
  }

  entityType(value) {
    this.uint16(value)
  }
}
