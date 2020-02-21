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
 *  Shared utilities between codecs.
 */

import os from 'os'
import base32 from './base32'

// Endian-dependent deserialization.
let readInt8 = (data, offset) => data.readInt8(offset)
let readUint8 = (data, offset) => data.readUInt8(offset)
let readInt16
let readInt32
let readUint16
let readUint32
let readUint64
if (os.endianness() == 'LE') {
  // Little-endian
  readInt16 = (data, offset) => data.readInt16LE(offset)
  readInt32 = (data, offset) => data.readInt32LE(offset)
  readUint16 = (data, offset) => data.readUInt16LE(offset)
  readUint32 = (data, offset) => data.readUInt32LE(offset)
  readUint64 = (data, offset) => [readUint32(data, offset), readUint32(data, offset+4)]
} else {
  // Big-endian
  readInt16 = (data, offset) => data.readInt16BE(offset)
  readInt32 = (data, offset) => data.readInt32BE(offset)
  readUint16 = (data, offset) => data.readUInt16BE(offset)
  readUint32 = (data, offset) => data.readUInt32BE(offset)
  readUint64 = (data, offset) => [readUint32(data, offset+4), readUint32(data, offset)]
}

/**
 *  Pad value with zeros until desired length.
 */
const pad0 = (str, length) => str.padStart(length, '0')

/**
 *  Convert 64-bit, unsigned integer to an ID.
 */
const idToHex = id => {
  let part1 = id[1].toString(16)
  let part2 = id[0].toString(16)

  return (pad0(part1, 8) + pad0(part2, 8)).toUpperCase()
}

/**
 *  Convert binary data to int8.
 */
const binaryToInt8 = data => {
  if (data.length !== 1) {
    throw Error(`encoded size must be equal to 1`)
  }
  return readInt8(data, 0)
}

/**
 *  Convert binary data to int16.
 */
const binaryToInt16 = data => {
  if (data.length !== 2) {
    throw Error(`encoded size must be equal to 2`)
  }
  return readInt16(data, 0)
}

/**
 *  Convert binary data to int32.
 */
const binaryToInt32 = data => {
  if (data.length !== 4) {
    throw Error(`encoded size must be equal to 4`)
  }
  return readInt32(data, 0)
}

/**
 *  Convert binary data to uint8.
 */
const binaryToUint8 = data => {
  if (data.length !== 1) {
    throw Error(`encoded size must be equal to 1`)
  }
  return readUint8(data, 0)
}

/**
 *  Convert binary data to uint16.
 */
const binaryToUint16 = data => {
  if (data.length !== 2) {
    throw Error(`encoded size must be equal to 2`)
  }
  return readUint16(data, 0)
}

/**
 *  Convert binary data to uint32.
 */
const binaryToUint32 = data => {
  if (data.length !== 4) {
    throw Error(`encoded size must be equal to 4`)
  }
  return readUint32(data, 0)
}

/**
 *  Convert binary data to uint64.
 */
const binaryToUint64 = data => {
  if (data.length !== 8) {
    throw Error(`encoded size must be equal to 8`)
  }
  return readUint64(data, 0)
}

/**
 *  Serialize 64-bit integer to string, with radix.
 */
const uint64ToString = uint64 => {
  let low = uint64[0]
  let high = uint64[1]
  let result = ''
  for (;;) {
    let mod = (high % 10) * 0x100000000 + low
    high = Math.floor(high / 10)
    low = Math.floor(mod / 10)
    result = (mod % 10).toString(10) + result
    if (!high && !low) {
      break
    }
  }
  return result
}

/**
 *  Convert binary data to hex.
 */
const binaryToHex = data => data.toString('hex').toUpperCase()

/**
 *  Convert binary data to ASCII.
 */
const binaryToAscii = data => data.toString('ascii')

/**
 *  Convert binary data to base32.
 */
const binaryToBase32 = data => base32.encode(data)

export default {
  idToHex,
  binaryToInt8,
  binaryToInt16,
  binaryToInt32,
  binaryToUint8,
  binaryToUint16,
  binaryToUint32,
  binaryToUint64,
  binaryToHex,
  binaryToAscii,
  binaryToBase32,
  uint64ToString
}
