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
import Writer from '../../src/codec/writer'

describe('writer', () => {
  it('should grow', () => {
    let writer = new Writer(1)
    writer.ascii('hello world')
    expect(writer.data).to.eql(Buffer.from('hello world', 'ascii'))

    writer.grow(50)
    expect(writer.data).to.eql(Buffer.from('hello world', 'ascii'))
  })

  it('should write an int8 value', () => {
    let writer = new Writer()
    writer.int8(-2)
    expect(writer.data).to.have.length(1)
    expect(writer.data).to.eql(Buffer.from('FE', 'hex'))
  })

  it('should write an int16 value', () => {
    let writer = new Writer()
    writer.int16(-8962)
    expect(writer.data).to.have.length(2)
    expect(writer.data).to.eql(Buffer.from('FEDC', 'hex'))
  })

  it('should write an int32 value', () => {
    let writer = new Writer()
    writer.int32(-1732584194)
    expect(writer.data).to.have.length(4)
    expect(writer.data).to.eql(Buffer.from('FEDCBA98', 'hex'))
  })

  it('should write an uint8 value', () => {
    let writer = new Writer()
    writer.uint8(254)
    expect(writer.data).to.have.length(1)
    expect(writer.data).to.eql(Buffer.from('FE', 'hex'))
  })

  it('should write an uint16 value', () => {
    let writer = new Writer()
    writer.uint16(56574)
    expect(writer.data).to.have.length(2)
    expect(writer.data).to.eql(Buffer.from('FEDC', 'hex'))
  })

  it('should write an uint32 value', () => {
    let writer = new Writer()
    writer.uint32(2562383102)
    expect(writer.data).to.have.length(4)
    expect(writer.data).to.eql(Buffer.from('FEDCBA98', 'hex'))
  })

  it('should write an uint64 value', () => {
    let writer = new Writer()
    writer.uint64([2562383102, 271733878])
    expect(writer.data).to.have.length(8)
    expect(writer.data).to.eql(Buffer.from('FEDCBA9876543210', 'hex'))
  })

  it('should write an uint64 string value', () => {
    let writer = new Writer()
    writer.uint64String('1167088121787636990')
    expect(writer.data).to.have.length(8)
    expect(writer.data).to.eql(Buffer.from('FEDCBA9876543210', 'hex'))
  })

  it('should write multiple integers', () => {
    let writer = new Writer()
    writer.int8(-2)
    writer.uint8(254)
    expect(writer.data).to.have.length(2)
    expect(writer.data).to.eql(Buffer.from('FEFE', 'hex'))
  })

  it('should write a binary value', () => {
    let writer = new Writer()
    writer.binary(Buffer.from('FE', 'hex'))
    expect(writer.data).to.have.length(1)
    expect(writer.data).to.eql(Buffer.from('FE', 'hex'))
  })

  it('should write an ascii value', () => {
    let writer = new Writer()
    writer.ascii('hello world')
    expect(writer.data).to.have.length(11)
    expect(writer.data).to.eql(Buffer.from('hello world', 'ascii'))
  })

  it('should write a base32 value', () => {
    let writer = new Writer()
    writer.base32('TCOWDGSMGLGNVPRLJGFMCA2LH7EMGDSW6GB26L3S')
    expect(writer.data).to.have.length(25)
    expect(writer.data).to.eql(Buffer.from('989D619A4C32CCDABE2B498AC1034B3FC8C30E56F183AF2F72', 'hex'))
  })

  it('should write a hex value', () => {
    let writer = new Writer()
    writer.hex('989D619A4C32CCDABE2B498AC1034B3FC8C30E56F183AF2F72')
    expect(writer.data).to.have.length(25)
    expect(writer.data).to.eql(Buffer.from('989D619A4C32CCDABE2B498AC1034B3FC8C30E56F183AF2F72', 'hex'))
  })

  it('should write an address value', () => {
    let writer = new Writer()
    writer.address('TCOWDGSMGLGNVPRLJGFMCA2LH7EMGDSW6GB26L3S')
    expect(writer.data).to.have.length(25)
    expect(writer.data).to.eql(Buffer.from('989D619A4C32CCDABE2B498AC1034B3FC8C30E56F183AF2F72', 'hex'))
  })

  it('should write a hash value', () => {
    let writer = new Writer()
    writer.hash256('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006')
    expect(writer.data).to.have.length(32)
    expect(writer.data).to.eql(Buffer.from('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006', 'hex'))
  })

  it('should write a key value', () => {
    let writer = new Writer()
    writer.key('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006')
    expect(writer.data).to.have.length(32)
    expect(writer.data).to.eql(Buffer.from('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006', 'hex'))
  })

  it('should write a signature value', () => {
    let writer = new Writer()
    writer.signature('939673209A13FF82397578D22CC96EB8516A6760C894D9B7535E3A1E068007B9255CFA9A914C97142A7AE18533E381C846B69D2AE0D60D1DC8A55AD120E2B606')
    expect(writer.data).to.have.length(64)
    expect(writer.data).to.eql(Buffer.from('939673209A13FF82397578D22CC96EB8516A6760C894D9B7535E3A1E068007B9255CFA9A914C97142A7AE18533E381C846B69D2AE0D60D1DC8A55AD120E2B606', 'hex'))
  })

  it('should write an id value', () => {
    let writer = new Writer()
    writer.id('E43F43D2C5A8F299')
    expect(writer.data).to.have.length(8)
    expect(writer.data).to.eql(Buffer.from('99F2A8C5D2433FE4', 'hex'))
  })

  it('should write an entity type value', () => {
    let writer = new Writer()
    writer.entityType(16718)
    expect(writer.data).to.have.length(2)
    expect(writer.data).to.eql(Buffer.from('4E41', 'hex'))
  })
})
