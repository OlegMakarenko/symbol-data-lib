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

import MongoDb from 'mongodb'
import expect from 'expect.js'
import shared from '../../src/util/shared'

describe('shared', () => {
  it('should write an int8 to binary', () => {
    let buffer = Buffer.alloc(1)
    expect(shared.writeInt8(buffer, 1)).to.equal(1)
    expect(buffer).to.eql(Buffer.from('01', 'hex'))
  })

  it('should write an int16 to binary', () => {
    let buffer = Buffer.alloc(2)
    expect(shared.writeInt16(buffer, 1)).to.equal(2)
    expect(buffer).to.eql(Buffer.from('0100', 'hex'))
  })

  it('should write an int32 to binary', () => {
    let buffer = Buffer.alloc(4)
    expect(shared.writeInt32(buffer, 1)).to.equal(4)
    expect(buffer).to.eql(Buffer.from('01000000', 'hex'))
  })

  it('should write an uint8 to binary', () => {
    let buffer = Buffer.alloc(1)
    expect(shared.writeUint8(buffer, 1)).to.equal(1)
    expect(buffer).to.eql(Buffer.from('01', 'hex'))
  })

  it('should write an uint16 to binary', () => {
    let buffer = Buffer.alloc(2)
    expect(shared.writeUint16(buffer, 1)).to.equal(2)
    expect(buffer).to.eql(Buffer.from('0100', 'hex'))
  })

  it('should write an uint32 to binary', () => {
    let buffer = Buffer.alloc(4)
    expect(shared.writeUint32(buffer, 1)).to.equal(4)
    expect(buffer).to.eql(Buffer.from('01000000', 'hex'))
  })

  it('should write an uint64 to binary', () => {
    let buffer = Buffer.alloc(8)
    expect(shared.writeUint64(buffer, [1, 0])).to.equal(8)
    expect(buffer).to.eql(Buffer.from('0100000000000000', 'hex'))
  })

  it('should read a binary number to int8', () => {
    let buffer = Buffer.from('01', 'hex')
    expect(shared.readInt8(buffer)).to.equal(1)
  })

  it('should read a binary number to int16', () => {
    let buffer = Buffer.from('0100', 'hex')
    expect(shared.readInt16(buffer)).to.equal(1)
  })

  it('should read a binary number to int32', () => {
    let buffer = Buffer.from('01000000', 'hex')
    expect(shared.readInt32(buffer)).to.equal(1)
  })

  it('should read a binary number to uint8', () => {
    let buffer = Buffer.from('01', 'hex')
    expect(shared.readUint8(buffer)).to.equal(1)
  })

  it('should read a binary number to uint16', () => {
    let buffer = Buffer.from('0100', 'hex')
    expect(shared.readUint16(buffer)).to.equal(1)
  })

  it('should read a binary number to uint32', () => {
    let buffer = Buffer.from('01000000', 'hex')
    expect(shared.readUint32(buffer)).to.equal(1)
  })

  it('should read a binary number to uint64', () => {
    let buffer = Buffer.from('0100000000000000', 'hex')
    expect(shared.readUint64(buffer)).to.eql([1, 0])
  })

  it('should read a binary value to hex', () => {
    let buffer = Buffer.from('0123456789ABCDEF', 'hex')
    expect(shared.readHex(buffer)).to.eql('0123456789ABCDEF')
  })

  it('should read a binary value to ascii', () => {
    let buffer = Buffer.from('hello world', 'ascii')
    expect(shared.readAscii(buffer)).to.eql('hello world')
  })

  it('should read a binary value to base32', () => {
    let buffer = Buffer.from('989D619A4C32CCDABE2B498AC1034B3FC8C30E56F183AF2F72', 'hex')
    expect(shared.readBase32(buffer)).to.eql('TCOWDGSMGLGNVPRLJGFMCA2LH7EMGDSW6GB26L3S')
  })

  it('should read a 64-bit integer from string', () => {
    expect(shared.stringToUint64('18446744073709551615')).to.eql([4294967295, 4294967295])
  })

  it('should convert a 64-bit integer to string', () => {
    let uint64 = [4294967295, 4294967295]
    expect(shared.uint64ToString(uint64)).to.equal('18446744073709551615')
  })

  it('should convert a long to uint64', () => {
    let long = MongoDb.Long.fromInt(-1)
    expect(shared.longToUint64(long)).to.eql([4294967295, 4294967295])
  })

  it('should convert a long to string', () => {
    let long = MongoDb.Long.fromInt(-1)
    expect(shared.longToString(long)).to.equal('18446744073709551615')
  })

  it('should convert an uint64 to ID', () => {
    let uint64 = [3602851589, 1643573176]
    expect(shared.uint64ToId(uint64)).to.equal('61F6EFB8D6BF2705')
  })

  it('should convert an ID to uint64', () => {
    expect(shared.idToUint64('61F6EFB8D6BF2705')).to.eql([3602851589, 1643573176])
  })

  it('should convert a long to ID', () => {
    let long = new MongoDb.Long(3602851589, 1643573176)
    expect(shared.longToId(long)).to.equal('61F6EFB8D6BF2705')
  })
})
