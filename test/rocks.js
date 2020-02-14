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

import expect from 'expect.js'
import rocksCodec from '../src/rocksCodec'

describe('rocks', () => {
  // TODO(ahuszagh) Need to implement.
  describe('AccountRestrictionCache', () => {})
  describe('AccountStateCache', () => {})

  describe('HashCache', () => {
    it('should parse a valid key', () => {
      let key = Buffer.from('938EBAEC010000009D403172F37D47B9099345D8034742493AD10FCB4350CF9904AA4B63D3CC7C79', 'hex')
      let actual = rocksCodec.HashCache.key(key)
      expect(actual).to.equal('8266616467@9D403172F37D47B9099345D8034742493AD10FCB4350CF9904AA4B63D3CC7C79')
    })

    it('should parse a valid value', () => {
      let value = Buffer.from('', 'hex')
      let actual = rocksCodec.HashCache.value(value)
      expect(actual).to.equal(null)
    })
  })

  // TODO(ahuszagh) Here...
  describe('HashLockInfoCache', () => {})
  describe('MetadataCache', () => {})
  describe('MosaicCache', () => {})
  describe('MosaicRestrictionCache', () => {})
  describe('MultisigCache', () => {})
  describe('NamespaceCache', () => {})
  describe('SecretLockInfoCache', () => {})
})
