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
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let namespaceId = 'F24D0E1AF24D0E1A'
    let address = '906415867F121D037AF447E711B0F5E4D52EBBF066D96860EB'
    let aliasAction = '01'

    // Embedded
    let embeddedTransaction = namespaceId + address + aliasAction
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.addressAliasTransaction(true)).to.eql({
      namespaceId: '1A0E4DF21A0E4DF2',
      address: 'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL',
      aliasAction: 1
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.addressAliasTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      namespaceId: '1A0E4DF21A0E4DF2',
      address: 'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL',
      aliasAction: 1
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x424E).namespaceId).to.equal('1A0E4DF21A0E4DF2')
  })

  it('should parse a mosaic alias transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let namespaceId = 'F24D0E1AF24D0E1A'
    let mosaicId = '5DFB9AC1932C1F2C'
    let aliasAction = '01'

    // Embedded
    let embeddedTransaction = namespaceId + mosaicId + aliasAction
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.mosaicAliasTransaction(true)).to.eql({
      namespaceId: '1A0E4DF21A0E4DF2',
      mosaicId: '2C1F2C93C19AFB5D',
      aliasAction: 1
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.mosaicAliasTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      namespaceId: '1A0E4DF21A0E4DF2',
      mosaicId: '2C1F2C93C19AFB5D',
      aliasAction: 1
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x434E).namespaceId).to.equal('1A0E4DF21A0E4DF2')
  })

  it('should parse a mosaic definition transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let mosaicId = '5DFB9AC1932C1F2C'
    let duration = 'E803000000000000'
    let nonce = '01000000'
    let flags = '07'
    let divisibility = '06'

    // Embedded
    let embeddedTransaction = mosaicId +
      duration +
      nonce +
      flags +
      divisibility
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.mosaicDefinitionTransaction(true)).to.eql({
      mosaicId: '2C1F2C93C19AFB5D',
      duration: '1000',
      nonce: 1,
      flags: 7,
      divisibility: 6
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.mosaicDefinitionTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      mosaicId: '2C1F2C93C19AFB5D',
      duration: '1000',
      nonce: 1,
      flags: 7,
      divisibility: 6
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x414D).duration).to.equal('1000')
  })

  it('should parse a mosaic supply change transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let mosaicId = 'F89E03B7BE7C3FA0'
    let delta = 'A086010000000000'
    let action = '01'

    // Embedded
    let embeddedTransaction = mosaicId + delta + action
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.mosaicSupplyChangeTransaction(true)).to.eql({
      mosaicId: 'A03F7CBEB7039EF8',
      delta: '100000',
      action: 1
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.mosaicSupplyChangeTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      mosaicId: 'A03F7CBEB7039EF8',
      delta: '100000',
      action: 1
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x424D).delta).to.equal('100000')
  })

  it('should parse a modify multisig transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let minRemovalDelta = '01'
    let minApprovalDelta = '01'
    let additionsCount = '00'
    let deletionsCount = '01'
    let reserved1 = '00000000'
    let publicKeyAdditions = ''
    let publicKeyDeletions = '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F'

    // Embedded
    let embeddedTransaction = minRemovalDelta +
      minApprovalDelta +
      additionsCount +
      deletionsCount +
      reserved1 +
      publicKeyAdditions +
      publicKeyDeletions
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.modifyMultisigTransaction(true)).to.eql({
      minRemovalDelta: 1,
      minApprovalDelta: 1,
      publicKeyAdditions: [],
      publicKeyDeletions: [
        '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F'
      ]
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.modifyMultisigTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      minRemovalDelta: 1,
      minApprovalDelta: 1,
      publicKeyAdditions: [],
      publicKeyDeletions: [
        '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F'
      ]
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4155).minRemovalDelta).to.equal(1)
  })

  it('should parse an aggregate complete transaction', () => {
    // Aggregate transaction
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let aggregateHash = '3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006'
    let transactionsSize = '41000000'
    let reserved1 = '00000000'

    // Embedded transaction
    let size = '41000000'
    let reserved2 = '00000000'
    let key = 'B4F12E7C9F6946091E2CB8B6D3A12B50D17CCBBF646386EA27CE2946A7423DCF'
    let reserved3 = '00000000'
    let version = '01'
    let network = '90'
    let type = '4D42'
    let mosaicId = 'F89E03B7BE7C3FA0'
    let delta = 'A086010000000000'
    let action = '01'

    // Transaction
    let transaction = maxFee +
      deadline +
      aggregateHash +
      transactionsSize +
      reserved1 +
      size +
      reserved2 +
      key +
      reserved3 +
      version +
      network +
      type +
      mosaicId +
      delta +
      action
    let reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.aggregateCompleteTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      aggregateHash: '3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006',
      innerTransactions: [
        {
          entity: {
            key: 'B4F12E7C9F6946091E2CB8B6D3A12B50D17CCBBF646386EA27CE2946A7423DCF',
            version: 1,
            network: 0x90,
            type: 0x424D
          },
          transaction: {
            mosaicId: 'A03F7CBEB7039EF8',
            delta: '100000',
            action: 1
          }
        }
      ],
      cosignatures: []
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4141).aggregateHash).to.equal('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006')
  })

  it('should parse an aggregate bonded transaction', () => {
    // Aggregate transaction
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let aggregateHash = '3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006'
    let transactionsSize = '41000000'
    let reserved1 = '00000000'

    // Embedded transaction
    let size = '41000000'
    let reserved2 = '00000000'
    let key = 'B4F12E7C9F6946091E2CB8B6D3A12B50D17CCBBF646386EA27CE2946A7423DCF'
    let reserved3 = '00000000'
    let version = '01'
    let network = '90'
    let type = '4D42'
    let mosaicId = 'F89E03B7BE7C3FA0'
    let delta = 'A086010000000000'
    let action = '01'

    // Transaction
    let transaction = maxFee +
      deadline +
      aggregateHash +
      transactionsSize +
      reserved1 +
      size +
      reserved2 +
      key +
      reserved3 +
      version +
      network +
      type +
      mosaicId +
      delta +
      action
    let reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.aggregateBondedTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      aggregateHash: '3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006',
      innerTransactions: [
        {
          entity: {
            key: 'B4F12E7C9F6946091E2CB8B6D3A12B50D17CCBBF646386EA27CE2946A7423DCF',
            version: 1,
            network: 0x90,
            type: 0x424D
          },
          transaction: {
            mosaicId: 'A03F7CBEB7039EF8',
            delta: '100000',
            action: 1
          }
        }
      ],
      cosignatures: []
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4241).aggregateHash).to.equal('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006')
  })

  it('should parse a hash lock transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let mosaic = 'F89E03B7BE7C3FA0E803000000000000'
    let duration = 'A086010000000000'
    let hash = 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630'

    // Embedded
    let embeddedTransaction = mosaic + duration + hash
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.lockTransaction(true)).to.eql({
      mosaic: {
        mosaicId: 'A03F7CBEB7039EF8',
        amount: '1000'
      },
      duration: '100000',
      hash: 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630'
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.lockTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      mosaic: {
        mosaicId: 'A03F7CBEB7039EF8',
        amount: '1000'
      },
      duration: '100000',
      hash: 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630'
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4148).duration).to.equal('100000')
  })

  it('should parse a secret lock transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let secret = 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630'
    let mosaic = 'F89E03B7BE7C3FA0E803000000000000'
    let duration = 'A086010000000000'
    let hashAlgorithm = '01'
    let address = '906415867F121D037AF447E711B0F5E4D52EBBF066D96860EB'

    // Embedded
    let embeddedTransaction = secret +
      mosaic +
      duration +
      hashAlgorithm +
      address
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.secretLockTransaction(true)).to.eql({
      secret: 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630',
      mosaic: {
        mosaicId: 'A03F7CBEB7039EF8',
        amount: '1000'
      },
      duration: '100000',
      hashAlgorithm: 1,
      recipientAddress: 'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL'
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.secretLockTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      secret: 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630',
      mosaic: {
        mosaicId: 'A03F7CBEB7039EF8',
        amount: '1000'
      },
      duration: '100000',
      hashAlgorithm: 1,
      recipientAddress: 'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL'
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4152).duration).to.equal('100000')
  })

  it('should parse a secret proof transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let secret = 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630'
    let proofSize = '0A00'
    let hashAlgorithm = '01'
    let address = '906415867F121D037AF447E711B0F5E4D52EBBF066D96860EB'
    let proof = 'AE311DAD16F95EBDE866'

    // Embedded
    let embeddedTransaction = secret +
      proofSize +
      hashAlgorithm +
      address +
      proof
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.secretProofTransaction(true)).to.eql({
      secret: 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630',
      hashAlgorithm: 1,
      recipientAddress: 'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL',
      proof: 'AE311DAD16F95EBDE866'
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.secretProofTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      secret: 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630',
      hashAlgorithm: 1,
      recipientAddress: 'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL',
      proof: 'AE311DAD16F95EBDE866'
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4252).proof).to.equal('AE311DAD16F95EBDE866')
  })

  it('should parse an account restriction address transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let restrictionFlags = '0100'
    let additionsCount = '00'
    let deletionsCount = '01'
    let reserved1 = '00000000'
    let restrictionAdditions = ''
    let restrictionDeletions = '906415867F121D037AF447E711B0F5E4D52EBBF066D96860EB'

    // Embedded
    let embeddedTransaction = restrictionFlags +
      additionsCount +
      deletionsCount +
      reserved1 +
      restrictionAdditions +
      restrictionDeletions
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.accountRestrictionAddressTransaction(true)).to.eql({
      restrictionFlags: 1,
      restrictionAdditions: [],
      restrictionDeletions: [
        'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL'
      ]
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.accountRestrictionAddressTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      restrictionFlags: 1,
      restrictionAdditions: [],
      restrictionDeletions: [
        'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL'
      ]
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4150).restrictionFlags).to.equal(1)
  })

  it('should parse an account restriction mosaic transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let restrictionFlags = '0200'
    let additionsCount = '00'
    let deletionsCount = '01'
    let reserved1 = '00000000'
    let restrictionAdditions = ''
    let restrictionDeletions = 'F89E03B7BE7C3FA0'

    // Embedded
    let embeddedTransaction = restrictionFlags +
      additionsCount +
      deletionsCount +
      reserved1 +
      restrictionAdditions +
      restrictionDeletions
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.accountRestrictionMosaicTransaction(true)).to.eql({
      restrictionFlags: 2,
      restrictionAdditions: [],
      restrictionDeletions: [
        'A03F7CBEB7039EF8'
      ]
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.accountRestrictionMosaicTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      restrictionFlags: 2,
      restrictionAdditions: [],
      restrictionDeletions: [
        'A03F7CBEB7039EF8'
      ]
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4250).restrictionFlags).to.equal(2)
  })

  it('should parse an account restriction operation transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let restrictionFlags = '0400'
    let additionsCount = '00'
    let deletionsCount = '01'
    let reserved1 = '00000000'
    let restrictionAdditions = ''
    let restrictionDeletions = '5441'

    // Embedded
    let embeddedTransaction = restrictionFlags +
      additionsCount +
      deletionsCount +
      reserved1 +
      restrictionAdditions +
      restrictionDeletions
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.accountRestrictionOperationTransaction(true)).to.eql({
      restrictionFlags: 4,
      restrictionAdditions: [],
      restrictionDeletions: [
        0x4154
      ]
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.accountRestrictionOperationTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      restrictionFlags: 4,
      restrictionAdditions: [],
      restrictionDeletions: [
        0x4154
      ]
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4350).restrictionFlags).to.equal(4)
  })

  it('should parse a link account transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let remotePublicKey = '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F'
    let linkAction = '00'

    // Embedded
    let embeddedTransaction = remotePublicKey + linkAction
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.linkAccountTransaction(true)).to.eql({
      remotePublicKey: '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F',
      linkAction: 0
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.linkAccountTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      remotePublicKey: '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F',
      linkAction: 0
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x414C).linkAction).to.equal(0)
  })

  it('should parse a mosaic address restriction transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let mosaicId = '5DFB9AC1932C1F2C'
    let restrictionKey = '0123456789ABCDEF'
    let previousRestrictionValue = '02468ACE13579BDF'
    let newRestrictionValue = 'FDB97531ECA86420'
    let targetAddress = '906415867F121D037AF447E711B0F5E4D52EBBF066D96860EB'

    // Embedded
    let embeddedTransaction = mosaicId +
      restrictionKey +
      previousRestrictionValue +
      newRestrictionValue +
      targetAddress
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.mosaicAddressRestrictionTransaction(true)).to.eql({
      mosaicId: '2C1F2C93C19AFB5D',
      restrictionKey: 'EFCDAB8967452301',
      previousRestrictionValue: 'DF9B5713CE8A4602',
      newRestrictionValue: '2064A8EC3175B9FD',
      targetAddress: 'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL'
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.mosaicAddressRestrictionTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      mosaicId: '2C1F2C93C19AFB5D',
      restrictionKey: 'EFCDAB8967452301',
      previousRestrictionValue: 'DF9B5713CE8A4602',
      newRestrictionValue: '2064A8EC3175B9FD',
      targetAddress: 'SBSBLBT7CIOQG6XUI7TRDMHV4TKS5O7QM3MWQYHL'
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4251).restrictionKey).to.equal('EFCDAB8967452301')
  })

  it('should parse a mosaic global restriction transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let mosaicId = '5DFB9AC1932C1F2C'
    let referenceMosaicId = '0000000000000000'
    let restrictionKey = '0123456789ABCDEF'
    let previousRestrictionValue = '02468ACE13579BDF'
    let newRestrictionValue = 'FDB97531ECA86420'
    let previousRestrictionType = '01'
    let newRestrictionType = '03'

    // Embedded
    let embeddedTransaction = mosaicId +
      referenceMosaicId +
      restrictionKey +
      previousRestrictionValue +
      newRestrictionValue +
      previousRestrictionType +
      newRestrictionType
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.mosaicGlobalRestrictionTransaction(true)).to.eql({
      mosaicId: '2C1F2C93C19AFB5D',
      referenceMosaicId: '0000000000000000',
      restrictionKey: 'EFCDAB8967452301',
      previousRestrictionValue: 'DF9B5713CE8A4602',
      newRestrictionValue: '2064A8EC3175B9FD',
      previousRestrictionType: 1,
      newRestrictionType: 3
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.mosaicGlobalRestrictionTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      mosaicId: '2C1F2C93C19AFB5D',
      referenceMosaicId: '0000000000000000',
      restrictionKey: 'EFCDAB8967452301',
      previousRestrictionValue: 'DF9B5713CE8A4602',
      newRestrictionValue: '2064A8EC3175B9FD',
      previousRestrictionType: 1,
      newRestrictionType: 3
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4151).restrictionKey).to.equal('EFCDAB8967452301')
  })

  it('should parse an account metadata transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let targetPublicKey = '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F'
    let scopedMetadataKey = '0123456789ABCDEF'
    let valueSizeDelta = '2800'
    let valueSize = '2800'
    let value = '700B6F624F41EB1A423F735ADA96982D7F2B756F'

    // Embedded
    let embeddedTransaction = targetPublicKey +
      scopedMetadataKey +
      valueSizeDelta +
      valueSize +
      value
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.accountMetadataTransaction(true)).to.eql({
      targetPublicKey: '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F',
      scopedMetadataKey: 'EFCDAB8967452301',
      valueSizeDelta: 40,
      value: '700B6F624F41EB1A423F735ADA96982D7F2B756F'
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.accountMetadataTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      targetPublicKey: '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F',
      scopedMetadataKey: 'EFCDAB8967452301',
      valueSizeDelta: 40,
      value: '700B6F624F41EB1A423F735ADA96982D7F2B756F'
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4144).valueSizeDelta).to.equal(40)
  })

  it('should parse a mosaic metadata transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let targetPublicKey = '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F'
    let scopedMetadataKey = '0123456789ABCDEF'
    let targetMosaicId = '5DFB9AC1932C1F2C'
    let valueSizeDelta = '2800'
    let valueSize = '2800'
    let value = '700B6F624F41EB1A423F735ADA96982D7F2B756F'

    // Embedded
    let embeddedTransaction = targetPublicKey +
      scopedMetadataKey +
      targetMosaicId +
      valueSizeDelta +
      valueSize +
      value
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.mosaicMetadataTransaction(true)).to.eql({
      targetPublicKey: '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F',
      scopedMetadataKey: 'EFCDAB8967452301',
      targetMosaicId: '2C1F2C93C19AFB5D',
      valueSizeDelta: 40,
      value: '700B6F624F41EB1A423F735ADA96982D7F2B756F'
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.mosaicMetadataTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      targetPublicKey: '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F',
      scopedMetadataKey: 'EFCDAB8967452301',
      targetMosaicId: '2C1F2C93C19AFB5D',
      valueSizeDelta: 40,
      value: '700B6F624F41EB1A423F735ADA96982D7F2B756F'
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4244).valueSizeDelta).to.equal(40)
  })

  it('should parse a namespace metadata transaction', () => {
    let maxFee = '0000000000000000'
    let deadline = '0100000000000000'
    let targetPublicKey = '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F'
    let scopedMetadataKey = '0123456789ABCDEF'
    let targetNamespaceId = 'F24D0E1AF24D0E1A'
    let valueSizeDelta = '2800'
    let valueSize = '2800'
    let value = '700B6F624F41EB1A423F735ADA96982D7F2B756F'

    // Embedded
    let embeddedTransaction = targetPublicKey +
      scopedMetadataKey +
      targetNamespaceId +
      valueSizeDelta +
      valueSize +
      value
    let reader = new CatbufferReader(Buffer.from(embeddedTransaction, 'hex'))
    expect(reader.namespaceMetadataTransaction(true)).to.eql({
      targetPublicKey: '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F',
      scopedMetadataKey: 'EFCDAB8967452301',
      targetNamespaceId: '1A0E4DF21A0E4DF2',
      valueSizeDelta: 40,
      value: '700B6F624F41EB1A423F735ADA96982D7F2B756F'
    })

    // Non-embedded
    let transaction = maxFee + deadline + embeddedTransaction
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.namespaceMetadataTransaction()).to.eql({
      maxFee: '0',
      deadline: '1',
      targetPublicKey: '76C1622C7FB58986E500228E8FFB30C606CAAFC1CD78E770E82C73DAB7BD7C9F',
      scopedMetadataKey: 'EFCDAB8967452301',
      targetNamespaceId: '1A0E4DF21A0E4DF2',
      valueSizeDelta: 40,
      value: '700B6F624F41EB1A423F735ADA96982D7F2B756F'
    })

    // Check transaction header
    reader = new CatbufferReader(Buffer.from(transaction, 'hex'))
    expect(reader.transactionHeader(0x4344).valueSizeDelta).to.equal(40)
  })

  // Need:
  //  transaction
  //  transactions
  //  blockHeader
  //  block
  //  blocks

  // TODO(ahuszagh) Continue here...
})
