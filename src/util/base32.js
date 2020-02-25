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
 *  Encode and decode base32 data without padding.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const DECODED_BLOCK_SIZE = 5
const ENCODED_BLOCK_SIZE = 8
const INVERSE_ALPHABET = {}
for (let index = 0; index < ALPHABET.length; index++) {
  INVERSE_ALPHABET[ALPHABET.charCodeAt(index)] = index
}

const encodeBlock = (input, inputOffset, output, outputOffset) => {
  output[outputOffset + 0] = ALPHABET[input[inputOffset + 0] >> 3]
  output[outputOffset + 1] = ALPHABET[((input[inputOffset + 0] & 0x07) << 2) | (input[inputOffset + 1] >> 6)]
  output[outputOffset + 2] = ALPHABET[(input[inputOffset + 1] & 0x3E) >> 1]
  output[outputOffset + 3] = ALPHABET[((input[inputOffset + 1] & 0x01) << 4) | (input[inputOffset + 2] >> 4)]
  output[outputOffset + 4] = ALPHABET[((input[inputOffset + 2] & 0x0F) << 1) | (input[inputOffset + 3] >> 7)]
  output[outputOffset + 5] = ALPHABET[(input[inputOffset + 3] & 0x7F) >> 2]
  output[outputOffset + 6] = ALPHABET[((input[inputOffset + 3] & 0x03) << 3) | (input[inputOffset + 4] >> 5)]
  output[outputOffset + 7] = ALPHABET[input[inputOffset + 4] & 0x1F]
}

const decodeChar = c => {
  const decodedChar = INVERSE_ALPHABET[c]
  if (undefined === decodedChar) {
    throw Error(`illegal base32 character ${c}`);
  }

  return decodedChar
}

const decodeBlock = (input, inputOffset, output, outputOffset) => {
  const bytes = new Uint8Array(ENCODED_BLOCK_SIZE)
  for (let i = 0; i < ENCODED_BLOCK_SIZE; ++i)
    bytes[i] = decodeChar(input[inputOffset + i])

  output[outputOffset + 0] = (bytes[0] << 3) | (bytes[1] >> 2)
  output[outputOffset + 1] = ((bytes[1] & 0x03) << 6) | (bytes[2] << 1) | (bytes[3] >> 4)
  output[outputOffset + 2] = ((bytes[3] & 0x0F) << 4) | (bytes[4] >> 1)
  output[outputOffset + 3] = ((bytes[4] & 0x01) << 7) | (bytes[5] << 2) | (bytes[6] >> 3)
  output[outputOffset + 4] = ((bytes[6] & 0x07) << 5) | bytes[7]
};

/**
 *  Encode buffer to base32.
 */
const encode = data => {
  if (data.length % DECODED_BLOCK_SIZE !== 0) {
    throw Error(`decoded size must be multiple of ${DECODED_BLOCK_SIZE}`)
  }

  const output = new Array(data.length / DECODED_BLOCK_SIZE * ENCODED_BLOCK_SIZE)
  for (let i = 0; i < data.length / DECODED_BLOCK_SIZE; ++i) {
    encodeBlock(data, i * DECODED_BLOCK_SIZE, output, i * ENCODED_BLOCK_SIZE)
  }

  return output.join('')
}

/**
 *  Decode base32 to buffer.
 */
const decode = encoded => {
  if (encoded.length % ENCODED_BLOCK_SIZE !== 0) {
    throw Error(`encoded size must be multiple of ${ENCODED_BLOCK_SIZE}`)
  }

  const output = new Uint8Array(encoded.length / ENCODED_BLOCK_SIZE * DECODED_BLOCK_SIZE)
  for (let i = 0; i < encoded.length / ENCODED_BLOCK_SIZE; ++i) {
    decodeBlock(encoded, i * ENCODED_BLOCK_SIZE, output, i * DECODED_BLOCK_SIZE)
  }

  return Buffer.from(output)
}

export default {
  encode,
  decode
}
