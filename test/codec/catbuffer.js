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
import CatbufferReader from '../../src/codec/catbuffer'

describe('catbuffer', () => {
  it('should parse a size prefix', () => {
    // Works when the size >= the prefix.
    let reader = new CatbufferReader(Buffer.from('04000000', 'hex'))
    expect(reader.sizePrefix()).to.equal(4)

    // Throws on exception otherwise.
    reader = new CatbufferReader(Buffer.from('08000000', 'hex'))
    expect(() => reader.sizePrefix()).to.throwException()
  })

  it('should parse an entity body', () => {
    let reader = new CatbufferReader(Buffer.from('B4F12E7C9F6946091E2CB8B6D3A12B50D17CCBBF646386EA27CE2946A7423DCF0000000001904E41', 'hex'))
    expect(reader.entityBody()).to.eql({
      key: 'B4F12E7C9F6946091E2CB8B6D3A12B50D17CCBBF646386EA27CE2946A7423DCF',
      version: 1,
      network: 0x90,
      type: 0x414E
    })
    expect(reader.data).to.have.length(0)
  })

  it('should parse an entity verification', () => {
    let reader = new CatbufferReader(Buffer.from('00000000939673209A13FF82397578D22CC96EB8516A6760C894D9B7535E3A1E068007B9255CFA9A914C97142A7AE18533E381C846B69D2AE0D60D1DC8A55AD120E2B606', 'hex'))
    expect(reader.entityVerification()).to.equal('939673209A13FF82397578D22CC96EB8516A6760C894D9B7535E3A1E068007B9255CFA9A914C97142A7AE18533E381C846B69D2AE0D60D1DC8A55AD120E2B606')
    expect(reader.data).to.have.length(0)
  })

  it('should parse a verifiable entity', () => {
    let reader = new CatbufferReader(Buffer.from('7000000000000000939673209A13FF82397578D22CC96EB8516A6760C894D9B7535E3A1E068007B9255CFA9A914C97142A7AE18533E381C846B69D2AE0D60D1DC8A55AD120E2B606B4F12E7C9F6946091E2CB8B6D3A12B50D17CCBBF646386EA27CE2946A7423DCF0000000001904E41', 'hex'))
    expect(reader.verifiableEntity()).to.eql({
      signature: '939673209A13FF82397578D22CC96EB8516A6760C894D9B7535E3A1E068007B9255CFA9A914C97142A7AE18533E381C846B69D2AE0D60D1DC8A55AD120E2B606',
      key: 'B4F12E7C9F6946091E2CB8B6D3A12B50D17CCBBF646386EA27CE2946A7423DCF',
      version: 1,
      network: 0x90,
      type: 0x414E
    })
    expect(reader.data).to.have.length(0)
  })

  it('should parse an embedded entity', () => {
    let reader = new CatbufferReader(Buffer.from('3000000000000000B4F12E7C9F6946091E2CB8B6D3A12B50D17CCBBF646386EA27CE2946A7423DCF0000000001904E41', 'hex'))
    expect(reader.embeddedEntity()).to.eql({
      key: 'B4F12E7C9F6946091E2CB8B6D3A12B50D17CCBBF646386EA27CE2946A7423DCF',
      version: 1,
      network: 0x90,
      type: 0x414E
    })
    expect(reader.data).to.have.length(0)
  })

  it('should parse a mosaic', () => {
    let reader = new CatbufferReader(Buffer.from('99F2A8C5D2433FE4FEDCBA9876543210', 'hex'))
    expect(reader.mosaic()).to.eql({
      mosaicId: 'E43F43D2C5A8F299',
      amount: '1167088121787636990'
    })
    expect(reader.data).to.have.length(0)
  })


  it('should parse a cosignature', () => {
    let reader = new CatbufferReader(Buffer.from('A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF6305780C8DF9D46BA2BCF029DCC5D3BF55FE1CB5BE7ABCF30387C4637DDEDFC2152703CA0AD95F21BB9B942F3CC52FCFC2064C7B84CF60D1A9E69195F1943156C07', 'hex'))
    expect(reader.cosignature()).to.eql({
      signerPublicKey: 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630',
      signature: '5780C8DF9D46BA2BCF029DCC5D3BF55FE1CB5BE7ABCF30387C4637DDEDFC2152703CA0AD95F21BB9B942F3CC52FCFC2064C7B84CF60D1A9E69195F1943156C07'
    })
    expect(reader.data).to.have.length(0)
  })

  it('should parse a cosignature list', () => {
    let reader = new CatbufferReader(Buffer.from('A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF6305780C8DF9D46BA2BCF029DCC5D3BF55FE1CB5BE7ABCF30387C4637DDEDFC2152703CA0AD95F21BB9B942F3CC52FCFC2064C7B84CF60D1A9E69195F1943156C07', 'hex'))
    expect(reader.cosignatures()).to.eql([
      {
        signerPublicKey: 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630',
        signature: '5780C8DF9D46BA2BCF029DCC5D3BF55FE1CB5BE7ABCF30387C4637DDEDFC2152703CA0AD95F21BB9B942F3CC52FCFC2064C7B84CF60D1A9E69195F1943156C07'
      }
    ])
    expect(reader.data).to.have.length(0)
  })

  it('should parse a base transaction', () => {
    // Non-embedded
    let reader = new CatbufferReader(Buffer.from('00000000000000000100000000000000', 'hex'))
    expect(reader.baseTransaction()).to.eql({
      maxFee: '0',
      deadline: '1'
    })
    expect(reader.data).to.have.length(0)

    // Embedded
    reader = new CatbufferReader(Buffer.from('00000000000000000100000000000000', 'hex'))
    expect(reader.baseTransaction(true)).to.eql({})
    expect(reader.data).to.have.length(16)
  })

  it('should parse a transfer transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '76A86BC816000000'
    let recipient = '906415867F121D037AF447E711B0F5E4D52EBBF066D96860EB'
    let mosaicsCount = '01'
    let messageSize = '0C00'
    let reserved1 = '00000000'
    let mosaics = '44B262C46CEABB850A00000000000000'
    let message = '746573742D6D657373616765'

    // Embedded
    let embeddedTransaction = recipient +
      mosaicsCount +
      messageSize +
      reserved1 +
      mosaics +
      message
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.transferTransaction(true)).to.eql({
      receipientAddress: 'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL',
      mosaics: [
        {
          mosaicId: '85BBEA6CC462B244',
          amount: '10'
        }
      ],
      message: '746573742D6D657373616765'
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transferTransaction()).to.eql({
      maxFee: '0',
      deadline: '97851779190',
      receipientAddress: 'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL',
      mosaics: [
        {
          mosaicId: '85BBEA6CC462B244',
          amount: '10'
        }
      ],
      message: '746573742D6D657373616765'
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4154).receipientAddress).to.equal('SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL')
  })

  it('should parse a register namespace transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let duration = 'E803000000000000'
    let namespaceId = 'F24D0E1AF24D0E1A'
    let namespaceType = '00'
    let nameSize = '06'
    let name = '613270316D67'

    // Embedded
    let embeddedTransaction = duration +
      namespaceId +
      namespaceType +
      nameSize +
      name
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.registerNamespaceTransaction(true)).to.eql({
      duration: '1000',
      namespaceId: '1A0E4DF21A0E4DF2',
      namespaceType: 0,
      name: 'a2p1mg'
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.registerNamespaceTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      duration: '1000',
      namespaceId: '1A0E4DF21A0E4DF2',
      namespaceType: 0,
      name: 'a2p1mg'
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x414E).duration).to.equal('1000')
  })

  it('should parse an address alias transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a mosaic alias transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a mosaic definition transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a mosaic supply change transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a modify multisig transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse an aggregate complete transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse an aggregate bonded transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a hash lock transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a secret lock transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a secret proof transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse an account restriction address transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse an account restriction mosaic transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse an account restriction operation transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a link account transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a mosaic address restriction transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a mosaic global restriction transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse an account metadata transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a mosaic metadata transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a namespace metadata transaction', () => {
    // TODO(ahuszagh) Implement...
  })

  // TODO(ahuszagh) Continue here...
})
