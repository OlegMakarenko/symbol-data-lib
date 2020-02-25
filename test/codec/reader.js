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
import Reader from '../../src/codec/reader'

describe('reader', () => {
  it('should validate empty', () => {
    // Validates empty
    let reader = new Reader(Buffer.from('', 'hex'))
    reader.validateEmpty()

    // Throws on exception
    reader = new Reader(Buffer.from('12345678', 'hex'))
    expect(() => reader.validateEmpty()).to.throwException()
  })

  it('should read an int8 value', () => {
    let reader = new Reader(Buffer.from('FEDCBA9876543210', 'hex'))
    expect(reader.int8()).to.equal(-2)
    expect(reader.data).to.have.length(7)
  })

  it('should read an int16 value', () => {
    let reader = new Reader(Buffer.from('FEDCBA9876543210', 'hex'))
    expect(reader.int16()).to.equal(-8962)
    expect(reader.data).to.have.length(6)
  })

  it('should read an int32 value', () => {
    let reader = new Reader(Buffer.from('FEDCBA9876543210', 'hex'))
    expect(reader.int32()).to.equal(-1732584194)
    expect(reader.data).to.have.length(4)
  })

  it('should read an uint8 value', () => {
    let reader = new Reader(Buffer.from('FEDCBA9876543210', 'hex'))
    expect(reader.uint8()).to.equal(254)
    expect(reader.data).to.have.length(7)
  })

  it('should read an uint16 value', () => {
    let reader = new Reader(Buffer.from('FEDCBA9876543210', 'hex'))
    expect(reader.uint16()).to.equal(56574)
    expect(reader.data).to.have.length(6)
  })

  it('should read an uint32 value', () => {
    let reader = new Reader(Buffer.from('FEDCBA9876543210', 'hex'))
    expect(reader.uint32()).to.equal(2562383102)
    expect(reader.data).to.have.length(4)
  })

  it('should read an uint64 value', () => {
    let reader = new Reader(Buffer.from('FEDCBA9876543210', 'hex'))
    expect(reader.uint64()).to.eql([2562383102, 271733878])
    expect(reader.data).to.have.length(0)
  })

  it('should read a long value', () => {
    let reader = new Reader(Buffer.from('FEDCBA9876543210', 'hex'))
    expect(reader.long().toString()).to.equal('1167088121787636990')
    expect(reader.data).to.have.length(0)
  })

  it('should read an uint64 string value', () => {
    let reader = new Reader(Buffer.from('FEDCBA9876543210', 'hex'))
    expect(reader.uint64String()).to.equal('1167088121787636990')
    expect(reader.data).to.have.length(0)
  })

  it('should read an ascii value', () => {
    let reader = new Reader(Buffer.from('hello world', 'ascii'))
    expect(reader.ascii(5)).to.equal('hello')
    expect(reader.data).to.have.length(6)
  })

  it('should read an base32 value', () => {
    let reader = new Reader(Buffer.from('989D619A4C32CCDABE2B498AC1034B3FC8C30E56F183AF2F72', 'hex'))
    expect(reader.base32(25)).to.equal('TCOWDGSMGLGNVPRLJGFMCA2LH7EMGDSW6GB26L3S')
    expect(reader.data).to.have.length(0)
  })

  it('should read an hex value', () => {
    let reader = new Reader(Buffer.from('989D619A4C32CCDABE2B498AC1034B3FC8C30E56F183AF2F72', 'hex'))
    expect(reader.hex(20)).to.equal('989D619A4C32CCDABE2B498AC1034B3FC8C30E56')
    expect(reader.data).to.have.length(5)
  })

  it('should read an address value', () => {
    let reader = new Reader(Buffer.from('989D619A4C32CCDABE2B498AC1034B3FC8C30E56F183AF2F72', 'hex'))
    expect(reader.address()).to.equal('TCOWDGSMGLGNVPRLJGFMCA2LH7EMGDSW6GB26L3S')
    expect(reader.data).to.have.length(0)
  })

  it('should read a hash value', () => {
    let reader = new Reader(Buffer.from('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006', 'hex'))
    expect(reader.hash256()).to.equal('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006')
    expect(reader.data).to.have.length(0)
  })

  it('should read a key value', () => {
    let reader = new Reader(Buffer.from('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006', 'hex'))
    expect(reader.key()).to.equal('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006')
    expect(reader.data).to.have.length(0)
  })

  it('should read a signature value', () => {
    let reader = new Reader(Buffer.from('939673209A13FF82397578D22CC96EB8516A6760C894D9B7535E3A1E068007B9255CFA9A914C97142A7AE18533E381C846B69D2AE0D60D1DC8A55AD120E2B606', 'hex'))
    expect(reader.signature()).to.equal('939673209A13FF82397578D22CC96EB8516A6760C894D9B7535E3A1E068007B9255CFA9A914C97142A7AE18533E381C846B69D2AE0D60D1DC8A55AD120E2B606')
    expect(reader.data).to.have.length(0)
  })

  it('should read an id value', () => {
    let reader = new Reader(Buffer.from('99F2A8C5D2433FE4', 'hex'))
    expect(reader.id()).to.equal('E43F43D2C5A8F299')
    expect(reader.data).to.have.length(0)
  })

  it('should read an entity type value', () => {
    let reader = new Reader(Buffer.from('4E41', 'hex'))
    expect(reader.entityType()).to.equal(16718)
    expect(reader.data).to.have.length(0)
  })
})
