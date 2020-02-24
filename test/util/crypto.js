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
import crypto from '../../src/util/crypto'

describe('crypto', () => {
  describe('keccak', () => {
    it('should calculate a keccak 224-bit hash', () => {
      let result = crypto.keccak['224']('hello world')
      expect(result.toString('hex')).to.equal('25f3ecfebabe99686282f57f5c9e1f18244cfee2813d33f955aae568')
    })

    it('should calculate a keccak 256-bit hash', () => {
      let result = crypto.keccak['256']('hello world')
      expect(result.toString('hex')).to.equal('47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad')
    })

    it('should calculate a keccak 384-bit hash', () => {
      let result = crypto.keccak['384']('hello world')
      expect(result.toString('hex')).to.equal('65fc99339a2a40e99d3c40d695b22f278853ca0f925cde4254bcae5e22ece47e6441f91b6568425adc9d95b0072eb49f')
    })

    it('should calculate a keccak 512-bit hash', () => {
      let result = crypto.keccak['512']('hello world')
      expect(result.toString('hex')).to.equal('3ee2b40047b8060f68c67242175660f4174d0af5c01d47168ec20ed619b0b7c42181f40aa1046f39e2ef9efc6910782a998e0013d172458957957fac9405b67d')
    })
  })

  describe('sha3', () => {
    it('should calculate a sha3 224-bit hash', () => {
      let result = crypto.sha3['224']('hello world')
      expect(result.toString('hex')).to.equal('dfb7f18c77e928bb56faeb2da27291bd790bc1045cde45f3210bb6c5')
    })

    it('should calculate a sha3 256-bit hash', () => {
      let result = crypto.sha3['256']('hello world')
      expect(result.toString('hex')).to.equal('644bcc7e564373040999aac89e7622f3ca71fba1d972fd94a31c3bfbf24e3938')
    })

    it('should calculate a sha3 384-bit hash', () => {
      let result = crypto.sha3['384']('hello world')
      expect(result.toString('hex')).to.equal('83bff28dde1b1bf5810071c6643c08e5b05bdb836effd70b403ea8ea0a634dc4997eb1053aa3593f590f9c63630dd90b')
    })

    it('should calculate a sha3 512-bit hash', () => {
      let result = crypto.sha3['512']('hello world')
      expect(result.toString('hex')).to.equal('840006653e9ac9e95117a15c915caab81662918e925de9e004f774ff82d7079a40d4d27b1b372657c61d46d470304c88c788b3a4527ad074d1dccbee5dbaa99a')
    })
  })

  describe('SigningKey', () => {
    it('should generate a signing key from seed', () => {
      let seed = Buffer.from('3BC0820D9B9552C0805A28C9E4314961C9AC415D580F13D330BE88F82FE5770D', 'hex')
      let signingKey = new crypto.SigningKey(seed, crypto.keccak['512'])
      expect(signingKey.seed).to.eql(Buffer.from('3BC0820D9B9552C0805A28C9E4314961C9AC415D580F13D330BE88F82FE5770D', 'hex'))
      expect(signingKey.buffer).to.eql(Buffer.from('3BC0820D9B9552C0805A28C9E4314961C9AC415D580F13D330BE88F82FE5770DFAF429DA9CEC65953289365AC4DAD59EB26F948110BE125A52DFC0CF741B31DC', 'hex'))
    })

    it('should sign a message', () => {
      let key = Buffer.from('3BC0820D9B9552C0805A28C9E4314961C9AC415D580F13D330BE88F82FE5770DFAF429DA9CEC65953289365AC4DAD59EB26F948110BE125A52DFC0CF741B31DC', 'hex')
      let signature = Buffer.from('C6CA8F653034BD468219726DBD7C859ED172834A45D2F25248A536F413630D7678A329B17052425D9B68EA1FF61B31C9ABF7EC5D64E9E47D91EB9C14DDA6CE04', 'hex')
      let message = Buffer.from('hello world', 'ascii')
      let signingKey = new crypto.SigningKey(key, crypto.keccak['512'])
      expect(signingKey.sign(message)).to.eql(signature)
    })

    // TODO(ahuszagh) Need stuff to sign, etc.
  })

  describe('VerifyingKey', () => {
    it('should verify a signed message', () => {
      let key = Buffer.from('FAF429DA9CEC65953289365AC4DAD59EB26F948110BE125A52DFC0CF741B31DC', 'hex')
      let signature = Buffer.from('C6CA8F653034BD468219726DBD7C859ED172834A45D2F25248A536F413630D7678A329B17052425D9B68EA1FF61B31C9ABF7EC5D64E9E47D91EB9C14DDA6CE04', 'hex')
      let message = Buffer.from('hello world', 'ascii')
      let verifyingKey = new crypto.VerifyingKey(key, crypto.keccak['512'])
      expect(verifyingKey.verify(signature, message)).to.equal(true)
    })

    // TODO(ahuszagh) Need stuff to verify, etc.
    // TODO(ahuszagh) Here...
  })
})
