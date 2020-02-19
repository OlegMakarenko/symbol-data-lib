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
import path from 'path'
import spoolCodec from '../src/spoolCodec'

const DATA_DIR = path.resolve(__dirname, 'data')

describe('spool', () => {
  describe('index', () => {
    it('should parse a valid index file', () => {
      let index = Buffer.from('661c000000000000', 'hex')
      let actual = spoolCodec.index.file(index)
      expect(actual.toString(16)).to.equal('1c66')
    })

    it('should parse a valid directory', () => {
      const directory = path.join(DATA_DIR, 'spool', 'block_change')
      let actual = spoolCodec.index.directory(directory)
      let asString = {}
      for (let [key, value] of Object.entries(actual)) {
        asString[key] = value.toString(16)
      }
      expect(asString).to.eql({
        'index.dat': '1c66'
      })
    })
  })

  describe('block_change', () => {
    it('should parse blocks saved', () => {
      let buffer = Buffer.from('003001000000000000588d98e62b6d924a8bc88fa6d33eb406face78eccd92e1ae836ec1bbbef3d4b79256aaa93a4492cc81b5e0710df055c7f5b2529b6c8bff507dabd6f05f49790eb35833b6ddf147deee0f659335ee4331eeae80670f45d29ff4ec02c46303866b00000000019843812b0100000000000072eb70e201000000e39b7a26701600000a2f5e778ac7c24908a9ebf7b74a39f60a5ac3ba86fdec72cde3918961424f360000000000000000000000000000000000000000000000000000000000000000074211776a2cebbb80f25fed1240b1e198726851049dac3a53e64d8e2278c99f3414b0bae56f08700da6f801b9779bc83ffa4e2088ccfe877eeff554ef27ce6eb35833b6ddf147deee0f659335ee4331eeae80670f45d29ff4ec02c46303866b0000000000000000ec99d24702425716f5f0ecd73e3105d1d7c74c19ba060897f5c4c430354fd8ee5d26388461468abb0744d02f349d6f70ad99777ee96eff7e56727cbf015e74980000000009000000df827c72cc1353744faf61f62131298a273d425fa5b7f95c1be9d494241383027eca4cbcaae5bb32bdeef6772be7f3be2d763c48039a40c09bb215717c6b3a894013692d1beeb8f511c8259d4ce8c012672385372d863064b6d520a016479af1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff0100000000000000000000000100000038000000010043210527bfd6b8eff6610000000000000000b35833b6ddf147deee0f659335ee4331eeae80670f45d29ff4ec02c46303866b0000000000000000', 'hex')
      let actual = spoolCodec.block_change.file(buffer)
      expect(actual.type).to.equal(0)
      expect(actual.entity).to.eql({
        signature: '588D98E62B6D924A8BC88FA6D33EB406FACE78ECCD92E1AE836EC1BBBEF3D4B79256AAA93A4492CC81B5E0710DF055C7F5B2529B6C8BFF507DABD6F05F49790E',
        key: 'B35833B6DDF147DEEE0F659335EE4331EEAE80670F45D29FF4EC02C46303866B',
        version: 1,
        network: 0x98,
        type: 0x8143
      })
      expect(actual.block.height).to.equal('299')
      expect(actual.block.timestamp).to.equal('8094018418')
      expect(actual.block.difficulty).to.equal('24670937717731')
      expect(actual.block.previousBlockHash).to.equal('0A2F5E778AC7C24908A9EBF7B74A39F60A5AC3BA86FDEC72CDE3918961424F36')
      expect(actual.block.transactionsHash).to.equal('0000000000000000000000000000000000000000000000000000000000000000')
      expect(actual.block.receiptsHash).to.equal('074211776A2CEBBB80F25FED1240B1E198726851049DAC3A53E64D8E2278C99F')
      expect(actual.block.stateHash).to.equal('3414B0BAE56F08700DA6F801B9779BC83FFA4E2088CCFE877EEFF554EF27CE6E')
      expect(actual.block.beneficiaryPublicKey).to.equal('B35833B6DDF147DEEE0F659335EE4331EEAE80670F45D29FF4EC02C46303866B')
      expect(actual.block.feeMultiplier).to.equal(0)
      expect(actual.entityHash).to.equal('EC99D24702425716F5F0ECD73E3105D1D7C74C19BA060897F5C4C430354FD8EE')
      expect(actual.generationHash).to.equal('5D26388461468ABB0744D02F349D6F70AD99777EE96EFF7E56727CBF015E7498')
      expect(actual.transactions).to.eql([])
      expect(actual.merkleRoots).to.eql([
        'DF827C72CC1353744FAF61F62131298A273D425FA5B7F95C1BE9D49424138302',
        '7ECA4CBCAAE5BB32BDEEF6772BE7F3BE2D763C48039A40C09BB215717C6B3A89',
        '4013692D1BEEB8F511C8259D4CE8C012672385372D863064B6D520A016479AF1',
        '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000'
      ])
      expect(actual.blockStatement).to.eql({
        transactionStatements: [
          {
            source: {
              primaryId: 0,
              secondaryId: 0
            },
            receipts: [
              {
                type: 8515,
                version: 1,
                mosaic: {
                  mosaicId: '61F6EFB8D6BF2705',
                  amount: '0'
                },
                targetPublicKey: 'B35833B6DDF147DEEE0F659335EE4331EEAE80670F45D29FF4EC02C46303866B'
              }
            ]
          }
        ],
        addressResolutionStatements: [],
        mosaicResolutionStatements: []
      })
    })

    it('should parse blocks dropped', () => {
      let buffer = Buffer.from('012b01000000000000', 'hex')
      let actual = spoolCodec.block_change.file(buffer)
      expect(actual).to.eql({
        type: 1,
        height: '299'
      })
    })

    it('should parse a directory', () => {
      const directory = path.join(DATA_DIR, 'spool', 'block_change')
      let actual = spoolCodec.block_change.directory(directory)
      expect(Object.keys(actual).length).to.equal(2)
      expect(actual['000000000000012c.dat']).to.eql({
        type: 1,
        height: '300'
      })
      expect(actual['000000000000012b.dat'].type).to.equal(0)
      expect(actual['000000000000012b.dat'].block.height).to.equal('299')
      expect(actual['000000000000012b.dat'].block.timestamp).to.equal('8094018418')
    })
  })

  describe('state_change', () => {
    describe('it should parse score changes', () => {
      let buffer = Buffer.from('000000000000000000253aecfdfbee4102', 'hex')
      let actual = spoolCodec.state_change(buffer)
      expect(actual).to.eql({
        type: 0,
        chainScore: {
          scoreLow: '162673827626367525',
          scoreHigh: '0'
        }
      })
    })

// TODO(ahuszagh) Restore later.
//    describe('it should parse state changes', () => {
//      let buffer = Buffer.from('0100000000000000008836b1641b380000510e000000000000000000000000000000000000000000000100000000000000989d619a4c32ccdabe2b498ac1034b3fc8c30e56f183af2f720100000000000000b35833b6ddf147deee0f659335ee4331eeae80670f45d29ff4ec02c46303866b020000000000000000000000000000000000000000000000000000000000000000000000000000000001b4cd410000000000320b000000000000320b00000000000000000000000000001f030000b4cd4100000000009905000000000000000000000000000099050000b4cd4100000000000100000000000000000000000000000098050000703839000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000527bfd6b8eff66102000527bfd6b8eff6616025e9253a99010098177a9e2a9fe922703839000000000070383900000000009905000000000000703839000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000510e000000000000d87290e9010000009d36b1641b38000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex')
//      let actual = spoolCodec.state_change(buffer)
//      console.log(actual)
//      // TODO(ahuszagh) here..
//    })
  })

  // TODO(ahuszagh) Add more...
})
