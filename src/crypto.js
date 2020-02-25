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

import crypto from './util/crypto'
import shared from './util/shared'

/**
 *  High-level cryptographic functions for key-pair extraction.
 *
 *  @param privateKey {String}     - Hex-encoded private key.
 *  @param hashAlgorithm {String}  - Hash algorithm ('keccak' or 'sha3').
 *
 *  Returns {String} Hex-encoded public key.
 */
const privateKeyToPublicKey = (privateKey, hashAlgorithm) => {
  let hash512 = crypto[hashAlgorithm]['512']
  let signingKey = new crypto.SigningKey(privateKey, hash512)
  let verifyingKey = signingKey.verifyingKey

  return shared.readHex(verifyingKey.buffer)
}


export default {
  privateKeyToPublicKey
}
