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

// Endian-dependent serialization
let writeInt8 = (data, value, offset = 0) => data.writeInt8(value, offset)
let writeUint8 = (data, value, offset = 0) => data.writeUInt8(value, offset)
let writeInt16
let writeInt32
let writeUint16
let writeUint32
let writeUint64
if (os.endianness() == 'LE') {
  // Little-endian
  writeInt16 = (data, value, offset = 0) => data.writeInt16LE(value, offset)
  writeInt32 = (data, value, offset = 0) => data.writeInt32LE(value, offset)
  writeUint16 = (data, value, offset = 0) => data.writeUInt16LE(value, offset)
  writeUint32 = (data, value, offset = 0) => data.writeUInt32LE(value, offset)
  writeUint64 = (data, value, offset = 0) => {
    writeUint32(data, value[0], offset)
    writeUint32(data, value[1], offset+4)
    return offset + 8
  }
} else {
  // Big-endian
  writeInt16 = (data, value, offset = 0) => data.writeInt16BE(value, offset)
  writeInt32 = (data, value, offset = 0) => data.writeInt32BE(value, offset)
  writeUint16 = (data, value, offset = 0) => data.writeUInt16BE(value, offset)
  writeUint32 = (data, value, offset = 0) => data.writeUInt32BE(value, offset)
  writeUint64 = (data, value, offset = 0) => {
    writeUint32(data, value[0], offset+4)
    writeUint32(data, value[1], offset)
    return offset + 8
  }
}

// Endian-dependent deserialization.
let readInt8 = (data, offset = 0) => data.readInt8(offset)
let readUint8 = (data, offset = 0) => data.readUInt8(offset)
let readInt16
let readInt32
let readUint16
let readUint32
let readUint64
if (os.endianness() == 'LE') {
  // Little-endian
  readInt16 = (data, offset = 0) => data.readInt16LE(offset)
  readInt32 = (data, offset = 0) => data.readInt32LE(offset)
  readUint16 = (data, offset = 0) => data.readUInt16LE(offset)
  readUint32 = (data, offset = 0) => data.readUInt32LE(offset)
  readUint64 = (data, offset = 0) => [readUint32(data, offset), readUint32(data, offset+4)]
} else {
  // Big-endian
  readInt16 = (data, offset = 0) => data.readInt16BE(offset)
  readInt32 = (data, offset = 0) => data.readInt32BE(offset)
  readUint16 = (data, offset = 0) => data.readUInt16BE(offset)
  readUint32 = (data, offset = 0) => data.readUInt32BE(offset)
  readUint64 = (data, offset = 0) => [readUint32(data, offset+4), readUint32(data, offset)]
}

/**
 *  Read binary data as hex.
 */
const writeHex = (data, value, offset = 0) => {
  return data.write(value, offset, 'hex')
}

/**
 *  Read binary data as ASCII.
 */
const writeAscii = (data, value, offset = 0) => {
  return data.write(value, offset, 'ascii')
}

/**
 *  Read binary data as base32.
 */
const writeBase32 = (data, value, offset = 0) => {
  let decoded = base32.decode(Buffer.from(value, 'ascii'))
  return decoded.copy(data, offset)
}

/**
 *  Read binary data as hex.
 */
const readHex = data => data.toString('hex').toUpperCase()

/**
 *  Read binary data as ASCII.
 */
const readAscii = data => data.toString('ascii')

/**
 *  Read binary data as base32.
 */
const readBase32 = data => base32.encode(data)

/**
 *  Pad value with zeros until desired length.
 */
const pad0 = (str, length) => str.padStart(length, '0')

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
 *  Convert MongoDB long to uint64.
 */
const longToUint64 = long => {
  return [long.getLowBitsUnsigned(), long.getHighBits() >>> 0]
}

/**
 *  Convert MongoDB long to string.
 */
const longToString = long => {
  return uint64ToString(longToUint64(long))
}

/**
 *  Convert 64-bit, unsigned integer to an ID.
 */
const uint64ToId = id => {
  let part1 = id[1].toString(16)
  let part2 = id[0].toString(16)

  return (pad0(part1, 8) + pad0(part2, 8)).toUpperCase()
}

/**
 *  Convert MongoDB long to an ID.
 */
const longToId = long => {
  return uint64ToId(longToUint64(long))
}

export default {
  // Writers
  writeInt8,
  writeUint8,
  writeInt16,
  writeInt32,
  writeUint16,
  writeUint32,
  writeUint64,
  writeHex,
  writeAscii,
  writeBase32,

  // Readers
  readInt8,
  readUint8,
  readInt16,
  readInt32,
  readUint16,
  readUint32,
  readUint64,
  readHex,
  readAscii,
  readBase32,

  // Uint64 support
  longToUint64,
  uint64ToString,
  longToString,
  uint64ToId,
  longToId
}
