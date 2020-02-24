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
 *  Cryptographic hash and signature functions.
 */

import hashlib from 'js-sha3'
import nacl from './nacl'

// HELPERS

const KEY_SIZE = 32
const SIGNATURE_SIZE = 64
const HALF_SIGNATURE_SIZE = SIGNATURE_SIZE / 2
const HASH_SIZE = 64
const HALF_HASH_SIZE = HASH_SIZE / 2

/**
 *  Mask 3 bits (clamp) for key derivation.
 */
const clamp = array => {
  array[0] &= 248
  array[31] &= 127
  array[31] |= 64
}

/**
 *  Calculate the public key from the signing key seed.
 */
const extractPublicKey = (seed, hash512) => {
  let d = hash512(seed)
  clamp(d)

  let p = [nacl.gf(), nacl.gf(), nacl.gf(), nacl.gf()]
  let pk = new Uint8Array(KEY_SIZE)
  nacl.scalarbase(p, d)
  nacl.pack(pk, p)

  return Buffer.from(pk)
}

/**
 *  Sign message and generate digital signature.
 */
const sign = (message, privateKey, publicKey, hash512) => {
  let d = hash512(privateKey)
  clamp(d)

  let length = HALF_HASH_SIZE + message.length
  let buffers = [
    d.subarray(HALF_HASH_SIZE),
    message
  ]
  let r = hash512(Buffer.concat(buffers, length))

  let p = [nacl.gf(), nacl.gf(), nacl.gf(), nacl.gf()]
  let signature = new Uint8Array(SIGNATURE_SIZE)
  nacl.reduce(r)
  nacl.scalarbase(p, r)
  nacl.pack(signature, p)

  length = HALF_SIGNATURE_SIZE + KEY_SIZE + message.length
  buffers = [
    signature.subarray(0, HALF_SIGNATURE_SIZE),
    publicKey,
    message
  ]
  let h = hash512(Buffer.concat(buffers, length))
  nacl.reduce(h)

  // multiply-add
  let x = new Float64Array(HASH_SIZE)
  for (let i = 0; i < HALF_HASH_SIZE; ++i) {
    x[i] = r[i]
  }
  for (let i = 0; i < HALF_HASH_SIZE; ++i) {
    for (let j = 0; j < HALF_HASH_SIZE; ++j) {
      x[i + j] += h[i] * d[j]
    }
  }

  nacl.modL(signature.subarray(HALF_SIGNATURE_SIZE), x)

  return Buffer.from(signature)
}

// API

/**
 *  Calculate the Keccak family of hash functions.
 */
const keccak = {
  '224': data => Buffer.from(hashlib.keccak224.arrayBuffer(data)),
  '256': data => Buffer.from(hashlib.keccak256.arrayBuffer(data)),
  '384': data => Buffer.from(hashlib.keccak384.arrayBuffer(data)),
  '512': data => Buffer.from(hashlib.keccak512.arrayBuffer(data))
}

/**
 *  Calculate the SHA3 family of hash functions.
 */
const sha3 = {
  '224': data => Buffer.from(hashlib.sha3_224.arrayBuffer(data)),
  '256': data => Buffer.from(hashlib.sha3_256.arrayBuffer(data)),
  '384': data => Buffer.from(hashlib.sha3_384.arrayBuffer(data)),
  '512': data => Buffer.from(hashlib.sha3_512.arrayBuffer(data))
}

/**
 *  Signing (secret) key for the ED25519 digital signature algorithm.
 *
 *  @param key {Buffer}         - Signing key or key seed.
 *  @param hash512 {Function}   - Hash function that generates a 512-bit output.
 */
class SigningKey {
  constructor(key, hash512) {
    this.hash512 = hash512
    if (key.length === 64) {
      this.key = key
    } else if (key.length === 32) {
      this.key = Buffer.concat([key, extractPublicKey(key, hash512)], 64)
    } else {
      throw new Error('invalid signing key or seed length')
    }
  }

  /**
   *  Get signing key buffer from class.
   */
  get buffer() {
    return this.key
  }

  /**
   *  Get verifying key from signing key.
   */
  get verifyingKey() {
    return new VerifyingKey(this.key.slice(32), this.hash512)
  }

  /**
   *  Get seed from signing key.
   */
  get seed() {
    return this.key.slice(0, 32)
  }

  /**
   *  Determine if 2 signing keys are equivalent.
   */
  equals(other) {
    if (!this.constructor === other.constructor) {
      return false
    }
    return this.hash512 === other.hash512 && this.key === other.key
  }

  /**
   *  Sign a message.
   *
   *  @param message {Buffer}   - Message as buffer to sign
   */
  sign(message) {
    let privateKey = this.seed
    let publicKey = this.verifyingKey.buffer
    return sign(message, privateKey, publicKey, this.hash512)
  }
}

/**
 *  Verifying (public) key for the ED25519 digital signature algorithm.
 *
 *  @param key {Buffer}         - Verifying (public) key.
 *  @param hash512 {Function}   - Hash function that generates a 512-bit output.
 */

class VerifyingKey {
  constructor(key, hash512) {
    this.hash512 = hash512
    if (key.length === 32) {
      this.key = key
    } else {
      throw new Error('invalid verifying key length')
    }
  }

  /**
   *  Get verifying key buffer from class.
   */
  get buffer() {
    return this.key
  }

  /**
   *  Determine if 2 verifying keys are equivalent.
   */
  equals(other) {
    if (!this.constructor === other.constructor) {
      return false
    }
    return this.hash512 === other.hash512 && this.key === other.key
  }

  /**
   *  Verify signature from message.
   *
   *  @param signature {Buffer} - Signature generated from message.
   *  @param message {Buffer}   - Message as buffer to sign.
   */
  verify(signature, message) {
    // TODO(ahuszagh) Implement...
  }
}

// TODO(ahuszagh) Need an ed25519 digital signature algorithm here...


export default {
  keccak,
  sha3,
  SigningKey,
  VerifyingKey
}
