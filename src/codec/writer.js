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

export default class Writer {
  constructor(sizeHint) {
    // Initialize the buffer with a size hint
    this._data = Buffer(sizeHint || 1024)
    this._index = 0
  }

  /**
   *  Get access to the internal data.
   */
  get data() {
    return this._data.slice(0, this._index)
  }

  // HELPERS

  callback(fn) {
    if (typeof fn === 'string') {
      return () => this[fn]()
    } else {
      return fn
    }
  }

  solitary(value, fn) {
    let callback = this.callback(fn)
    callback.call(value)
    return this.data
  }

  // ARRAYS

  n(array, fn) {
    let callback = this.callback(fn)
    for (let value of array) {
      callback.call(value)
    }
  }

  // PRIMITIVES

  int8() {
    // TODO(ahuszagh) Implement...
  }
}
