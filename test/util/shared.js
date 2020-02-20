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
import shared from '../../src/util/shared'

describe('shared', () => {
  it('should convert an ID to hex', () => {
    let uint64 = [3602851589, 1643573176]
    expect(shared.idToHex(uint64)).to.equal('61F6EFB8D6BF2705')
  })

  it('should convert a binary number to int8', () => {
    let buffer = Buffer.from('01', 'hex')
    expect(shared.binaryToInt8(buffer)).to.equal(1)
  })

  it('should convert a binary number to int16', () => {
    let buffer = Buffer.from('0100', 'hex')
    expect(shared.binaryToInt16(buffer)).to.equal(1)
  })

  it('should convert a binary number to int32', () => {
    let buffer = Buffer.from('01000000', 'hex')
    expect(shared.binaryToInt32(buffer)).to.equal(1)
  })

  it('should convert a binary number to uint8', () => {
    let buffer = Buffer.from('01', 'hex')
    expect(shared.binaryToUint8(buffer)).to.equal(1)
  })

  it('should convert a binary number to uint16', () => {
    let buffer = Buffer.from('0100', 'hex')
    expect(shared.binaryToUint16(buffer)).to.equal(1)
  })

  it('should convert a binary number to uint32', () => {
    let buffer = Buffer.from('01000000', 'hex')
    expect(shared.binaryToUint32(buffer)).to.equal(1)
  })

  it('should convert a binary number to uint64', () => {
    let buffer = Buffer.from('0100000000000000', 'hex')
    expect(shared.binaryToUint64(buffer)).to.eql([1, 0])
  })

  it('should convert a binary value to hex', () => {
    let buffer = Buffer.from('0123456789ABCDEF', 'hex')
    expect(shared.binaryToHex(buffer)).to.eql('0123456789ABCDEF')
  })

  it('should convert a binary value to ascii', () => {
    let buffer = Buffer.from('hello world', 'ascii')
    expect(shared.binaryToAscii(buffer)).to.eql('hello world')
  })

  it('should convert a binary value to base32', () => {
    let buffer = Buffer.from('989D619A4C32CCDABE2B498AC1034B3FC8C30E56F183AF2F72', 'hex')
    expect(shared.binaryToBase32(buffer)).to.eql('TCOWDGSMGLGNVPRLJGFMCA2LH7EMGDSW6GB26L3S')
  })
})
