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

import base32 from './base32'

// TODO(ahuszagh) Likely should consider this here...

/**
 *  Pad value with zeros until desired length.
 */
const pad0 = (str, length) => str.length < length ? pad0(`0${str}`, length) : str

/**
 *  Convert 64-bit, unsigned integer to an ID.
 */
const idToHex = id => {
  let part1 = id[1].toString(16)
  let part2 = id[0].toString(16)

  return (pad0(part1, 8) + pad0(part2, 8)).toUpperCase()
}

/**
 *  Convert binary data to uint8.
 */
const binaryToUint8 = data => {
  if (data.length !== 1) {
    throw Error(`encoded size must be equal to 1`)
  }
  return data.readUInt8(0)
}

/**
 *  Convert binary data to uint16.
 */
const binaryToUint16 = data => {
  if (data.length !== 2) {
    throw Error(`encoded size must be equal to 2`)
  }
  return data.readUInt16LE(0)
}

/**
 *  Convert binary data to uint32.
 */
const binaryToUint32 = data => {
  if (data.length !== 4) {
    throw Error(`encoded size must be equal to 4`)
  }
  return data.readUInt32LE(0)
}

/**
 *  Convert binary data to uint64.
 */
const binaryToUint64 = data => {
  if (data.length !== 8) {
    throw Error(`encoded size must be equal to 8`)
  }
  let lo = data.readUInt32LE(0)
  let hi = data.readUInt32LE(4)
  return [lo, hi]
}

/**
 *  Convert binary data to hex.
 */
const binaryToHex = data => data.toString('hex').toUpperCase()

/**
 *  Convert binary data to base32.
 */
const binaryToBase32 = data => base32.encode(data)

export default {
  idToHex,
  binaryToUint8,
  binaryToUint16,
  binaryToUint32,
  binaryToUint64,
  binaryToHex,
  binaryToBase32
}
