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
import base32 from '../src/base32'

describe('base32', () => {
  describe('encode', () => {
    it('should error with invalid lengths', () => {
      let buffer = Buffer.from('hello world')
      expect(() => base32.encode(buffer)).to.throwException()
    })

    it('should encode valid data', () => {
      let buffer = Buffer.from('hello')
      expect(base32.encode(buffer)).to.eql('NBSWY3DP')
    })
  })

  describe('decode', () => {
    it('should error with invalid lengths', () => {
      let buffer = Buffer.from('hello world')
      expect(() => base32.decode(buffer)).to.throwException()
    })

    it('should decode valid data', () => {
      let buffer = Buffer.from('NBSWY3DP')
      expect(base32.decode(buffer)).to.eql(Buffer.from('hello'))
    })

    it('should fail to decode invalid data', () => {
      let buffer = Buffer.from('nbswy3dp')
      expect(() => base32.decode(buffer)).to.throwException()
    })
  })
})
