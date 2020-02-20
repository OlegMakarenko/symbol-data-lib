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
import spool from '../../src/codec/spool'

const DATA_DIR = path.resolve(__dirname, '..', 'data')

describe('spool', () => {
  describe('index', () => {
    it('should parse valid index data', () => {
      let buffer = Buffer.from('661c000000000000', 'hex')
      let actual = spool.index.data(buffer)
      expect(actual.toString(16)).to.equal('1c66')
    })

    it('should parse a valid index file', () => {
      let file = path.join(DATA_DIR, 'spool', 'block_change', 'index.dat')
      let actual = spool.index.file(file)
      expect(actual.toString(16)).to.equal('1c66')
    })

    it('should parse a valid directory', () => {
      let directory = path.join(DATA_DIR, 'spool', 'block_change')
      let actual = spool.index.directory(directory)
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
    it('should parse blocks saved from data', () => {
      let buffer = Buffer.from('003001000000000000588d98e62b6d924a8bc88fa6d33eb406face78eccd92e1ae836ec1bbbef3d4b79256aaa93a4492cc81b5e0710df055c7f5b2529b6c8bff507dabd6f05f49790eb35833b6ddf147deee0f659335ee4331eeae80670f45d29ff4ec02c46303866b00000000019843812b0100000000000072eb70e201000000e39b7a26701600000a2f5e778ac7c24908a9ebf7b74a39f60a5ac3ba86fdec72cde3918961424f360000000000000000000000000000000000000000000000000000000000000000074211776a2cebbb80f25fed1240b1e198726851049dac3a53e64d8e2278c99f3414b0bae56f08700da6f801b9779bc83ffa4e2088ccfe877eeff554ef27ce6eb35833b6ddf147deee0f659335ee4331eeae80670f45d29ff4ec02c46303866b0000000000000000ec99d24702425716f5f0ecd73e3105d1d7c74c19ba060897f5c4c430354fd8ee5d26388461468abb0744d02f349d6f70ad99777ee96eff7e56727cbf015e74980000000009000000df827c72cc1353744faf61f62131298a273d425fa5b7f95c1be9d494241383027eca4cbcaae5bb32bdeef6772be7f3be2d763c48039a40c09bb215717c6b3a894013692d1beeb8f511c8259d4ce8c012672385372d863064b6d520a016479af1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff0100000000000000000000000100000038000000010043210527bfd6b8eff6610000000000000000b35833b6ddf147deee0f659335ee4331eeae80670f45d29ff4ec02c46303866b0000000000000000', 'hex')
      let actual = spool.block_change.data(buffer)
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

    it('should parse a blocks saved file', () => {
      let file = path.join(DATA_DIR, 'spool', 'block_change', '000000000000012B.dat')
      let actual = spool.block_change.file(file)
      expect(actual.block.height).to.equal('299')
    })

    it('should parse blocks dropped from data', () => {
      let buffer = Buffer.from('012b01000000000000', 'hex')
      let actual = spool.block_change.data(buffer)
      expect(actual).to.eql({
        type: 1,
        height: '299'
      })
    })

    it('should parse a blocks dropped file', () => {
      let file = path.join(DATA_DIR, 'spool', 'block_change', '000000000000012C.dat')
      let actual = spool.block_change.file(file)
      expect(actual.height).to.equal('300')
    })

    it('should parse a directory', () => {
      let directory = path.join(DATA_DIR, 'spool', 'block_change')
      let actual = spool.block_change.directory(directory)
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

  describe('block_sync', () => {
    it('should parse the nemesis block data', () => {
      let buffer = Buffer.from('981400000000000071dfd852808d83b1dae4a9331b66e01ea82f0cce8b348e61dadaf9b0a26780bb64f1d44e91d8fa12605af8cabea96bb7497b8497298b8964ea62d82708dda50df7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019843800100000000000000000000000000000000407a10f35a0000000000000000000000000000000000000000000000000000000000000000000051a062cf4cdeca3507c811cfa2fe1c4bb84e5d2ed17249e0a9e5758f1cb788af38269b44428efaa0f222f949857b7ac4ce88084262e90b807e9502543ae083664a6aca7a70be343772eb7799e6a3fa8e8df20ed87cf0a2a7161b437ccdda6f0ff7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000000000009500000000000000d6f61602680356b7d1db9329132988c1786eb5c6920edb9b4f8cbdc6fd009f33cd6403b0372eeb30b747bca06f388427883935f01334ada7e9d94e8144f07e0bf7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001984e410000000000000000010000000000000000000000000000004f1b65ba5f7f49b100036361740000009900000000000000cf4306251fad48c66f106f8b23d3f0878976fd0ea988b035cc3ef70fd31e033823c2d95e24bc5d675a0cdeab01fc7e481ea47587a4daf7934e6314e332c9280ef7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001984e41000000000000000001000000000000004f1b65ba5f7f49b11c29e1b7b2991294010768617276657374000000000000009a00000000000000b4a2250a964bd08b85aad3057b7e16fb2d759e163a29e9b8e6bbf7b2f240b9722506e7ecb933562c583dd8cdf2a15d238c530682217107aad1e82768750e8101f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001984e41000000000000000001000000000000004f1b65ba5f7f49b144b262c46ceabb85010863757272656e63790000000000009600000000000000c889d20062e2863478c66a59dc7281f8d7862b58a69310ac1970d0531213f61fff01c7efb3a54705a189dab9db302e87978ee5d344cc90db100fd1c74476a801f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001984d41000000000000000001000000000000000527bfd6b8eff661000000000000000000000000020600009100000000000000156f3cd141305ea6b13ba8b785e54fa045a6c4f99b524794969b1e1bb2ce970fc595e5272fc64329d05da0f28997e28131aea48aa3e3029f0a4a29b6d4d69a0cf7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001984e430000000000000000010000000000000044b262c46ceabb850527bfd6b8eff661010000000000000091000000000000004a47e449dd5c656b33b6a34c3c689c47aaa1eb77f3f4600da1b797600fa30ed7f9f13c39a0969e135085c632ee8d7f7431164218505ea08fed01154791b01705f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001984d420000000000000000010000000000000044b262c46ceabb8580eb36f68af81f00010000000000000096000000000000009a574daef05c0bed6b83853882584d8ae62c2e4c2fbd8f84fac7286f74b391ebad40daee7fecfcfa96aa503cc52e343741240f963c4208363e83f7b72f761008f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001984d410000000000000000010000000000000098177a9e2a9fe92200000000000000000100000003030000910000000000000086ef4b24e2a65d14702bbdc9944a1397d3b0ebe24064726ffb5fdd89631f63c519b19419afe7e917e9cf933e6d97ab086e6df9694ed2e0185e90395e45f98c01f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001984e43000000000000000001000000000000001c29e1b7b299129498177a9e2a9fe92201000000000000009100000000000000b0c9bf69f21077ce644445fe2527ac6c750bb99642a4e511a2ac95b71f76ea45a31bc140fb8bf995fa7e3fc9b1cd0e36c1eb3528c52351d373c6fa715d289006f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001984d42000000000000000001000000000000001c29e1b7b2991294c0e1e400000000000100000000000000c000000000000000dfd5a0ae2ca3b6397f31820cce91001b7de00dd2107822eab9b1d2c4781670165d2b343f77cb7a4751b5a345fe5b0db3e7323a6dff222998205e95d3349e8508f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b4000000000198544100000000000000000100000000000000989d619a4c32ccdabe2b498ac1034b3fc8c30e56f183af2f720200000000000044b262c46ceabb856025e9253a9901001c29e1b7b29912947038390000000000c000000000000000733019a6e664bfa99831c55c059d2702385e6f3ad067ea214f3cdef2713e97225aec943d47134781a0bc89c39cb3498f4350c756b4bb678d33726ad0a83eff08f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001985441000000000000000001000000000000009862fadc64108f8f9eeb30615167e3b0112133e79266385a4c0200000000000044b262c46ceabb856025e9253a9901001c29e1b7b29912947038390000000000c000000000000000d728b7e0c8a26873cc0f8093dbcba63971632193c8d4219d8665b8a4e4deaf0433eb298ff465859741dbbfcc96f53acd344a1e5e3cf0f41377f0a53259a8bf0cf7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019854410000000000000000010000000000000098f7725f805b181e79edd7342eade4c12b9952e8832eded9310200000000000044b262c46ceabb856025e9253a9901001c29e1b7b29912947038390000000000c0000000000000002e0b656e65647f1cf0a4ffc05d115b144c7b1bc63a1c98ba1ea3a626daefa645ccfb87df1ee94ed41df8d940a7b6ab92e0d86d2aa4637ec5a75fdae7e9e6ec01f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001985441000000000000000001000000000000009884c1b4cebcccc66c3986f1970d70f8e5451066a1dee84e3c0200000000000044b262c46ceabb856025e9253a9901001c29e1b7b29912947038390000000000b0000000000000003d25f70c8d949e1c6e7c670e5c0b994c2c689dd1e7a9f03bf371621c22bb4a2c8c52fa1c018f0d338aeb397c531673b56976eaf4a247710f096997ceb0add00af7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001985441000000000000000001000000000000009867d816bc07646d80c8cb1d121ef2aa6084dd091ee9c069510100000000000044b262c46ceabb856025e9253a990100b000000000000000ea43c40a4e1734f15d0d0b7cd7dc7dadefbdf3323bab3c0ba43d787306f26b43b0a8d39066ca805e626654cb1e28bf3a6cc30941738f81f14bd35f3a6df7c304f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019854410000000000000000010000000000000098179aac9c79e1a15359705cb0f5524a6cf5a0c3338092f7cd0100000000000044b262c46ceabb856025e9253a990100b000000000000000ab49c365eb2ddab3a5c5b732c57381edcb74b1dc416ca307741b2c3c8a33e02a780b8fee03a45b83635aed818adce82cabe45dd47142a6117e73ae3f00d4d801f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019854410000000000000000010000000000000098b7848d6c352374585287afd434d350f616e486a57b55dbc90100000000000044b262c46ceabb856025e9253a990100b000000000000000e18cd69244a47207a9eff6e430005dec54b45b7fe09824384f7f2e50895479a3254df6f03a80c63a7702dd4c72d6d0f3cd6bad2931139b6062f8c72da86eb508f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b4000000000198544100000000000000000100000000000000980469fa493512e136b0f53a1eb67458eee40b6994cf2a60650100000000000044b262c46ceabb856025e9253a990100b000000000000000df38fe2d75e12866ba64ab8631c8f7bbb3a9ecb55a50e0aa0cf7c3c222ff220a1f899d5e947174b39329003f29a3ae0c8f49172545671b1cc0222d2924b8b804f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b4000000000198544100000000000000000100000000000000986c450f4201b5090ce541d1f079bebb27ee098c260e8e76ad0100000000000044b262c46ceabb856025e9253a990100b000000000000000d3918511fe6faf280b18754ee6987b206b191748e4881bf952976ccf14bd306641bf2aeee67489d8d47755c08cfbc4de79e54cdf4bbd4a789c5c02242b132305f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019854410000000000000000010000000000000098fc1bb850dce0e512ca33b84057c37703f9ca4367d9e0ffc20100000000000044b262c46ceabb856025e9253a990100b000000000000000b485707ec18be65684c8db6bd536990de93ac1d971a15be587d01d093b582b0e531dada55f6f5d0ecaf3e48f77db482193328cd61c7384ad1488950187eb0009f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001985441000000000000000001000000000000009833e84cdf39e56aa25500a4d1460c79a79ab1cb9298e6db2a0100000000000044b262c46ceabb856025e9253a990100b0000000000000001c2f391747455576eabd2f690e890e12eeba8c55c54e08dae47efc598b581fd03cf2b125d3041cf96852d1926837a9a725368fb642580733e890f5ea615e1203f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001985441000000000000000001000000000000009861b87ec9fee00eb65fc9048d3ec6f1f011cfb11f3359bcfc0100000000000044b262c46ceabb856025e9253a990100b0000000000000000c5832042b88596e8777764c6f04fbbb9531aec62bb51a8154dd91fb09fe2cebb2de84ff6260682f1beaaa7c14be302088771382548dc3d0bc037a7d4ab8eb01f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019854410000000000000000010000000000000098e160cea6847d5dc57064d5a9185ac72751bbf67ea593e1990100000000000044b262c46ceabb856025e9253a990100b00000000000000083d2b7bdea2862ee1d937ab75844ed5fd7c863101e29aa0d6e3d144b7d09252d8c9bec86b18da658254e421f6e027f22033c389db55ff64364f0e0940b38c603f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019854410000000000000000010000000000000098d9165c3bb889314b9d7cc6b4333b13cd09756fd60590aa440100000000000044b262c46ceabb856025e9253a990100b00000000000000000f8f9034c17a85f0ee3ef3d4715e6c701a579ed891a76367fcc844adcae2eb03929a3ad959080fa662bdeaa79fea9abbd267d57e817aff9b180a56de0db9b0cf7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019854410000000000000000010000000000000098fa1e3f0e453e603068076c41dc00f4eff74ddd19e7adb4ef0100000000000044b262c46ceabb856025e9253a990100b000000000000000fdcf32552179ef989ba3d261d581bac38cc289a93baec4723822bdecff74ec42d678a4523a56ad07b64d1c845c74ef4ca8aea6945bc3b5b0f2474a7ee847000bf7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019854410000000000000000010000000000000098d5f837ded087f859a174daa69182cf385647c3a92ea20ac10100000000000044b262c46ceabb856025e9253a990100b00000000000000025b53244df3dbe58784026e896c2c7ec75e2fc2d0edb66405b08f4b417c5963772f4db01d4c776c2b3da254cdbed6f97bb8a9c5bef48b31b220bc724e9b63708f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019854410000000000000000010000000000000098a49d8c9b4cad0af51e3512cf8a0984b9173c01fe996396060100000000000044b262c46ceabb856025e9253a990100b00000000000000054d26d9ddfa9334999c4058506b1f67d22644b5ad2936ba5dd0b1ca393eb57efd03414913781c7c5ed4587d09d2a2a53b0309f2f3789450e8804d69e790b870df7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019854410000000000000000010000000000000098bffe63a54574d7d5df7455ed3734ab13d5b4c60d5b0d6bea0100000000000044b262c46ceabb856025e9253a990100b000000000000000f97eade9dabe0c55f2cb4c2d9e9b75ad346d69ad5fa9748ddba5de266a95104c0a3906817e4d32d91e89301e9fef2090372d9294b7356c30479075dc178ce30cf7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b400000000019854410000000000000000010000000000000098203c65cb973438ee54dc694de043120ccdb242d26a151b090100000000000044b262c46ceabb856025e9253a990100b000000000000000d6e920abd04f36391455f215ca9f166ea83db6710b9ba14dbfba5c878fe166b3b1167762f6673b03a6e0f34f70387131f3d586257dfd90f1b29434e685b2e90cf7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b40000000001985441000000000000000001000000000000009867ffcd9f96848db2a5a900493236a6053a86cd9f6d2e12270100000000000044b262c46ceabb856025e9253a990100b6cc1792d5cb2b95765961e34ac1b938055154b8e0514b0944b1ace547a4e1812ca12c9f076c9a6637e6e8f967c196cc5bb047f1773317f6dccfb6792adc424c1d0000008d224f3dabc142b254686ca29684fa9d764f542425d004904bc23c898cf896358d224f3dabc142b254686ca29684fa9d764f542425d004904bc23c898cf896356e36b3ad23e4e139ff10eb35003309ffa9598cca5eb27b8dd91dc497028d63db6e36b3ad23e4e139ff10eb35003309ffa9598cca5eb27b8dd91dc497028d63db87dfaa09a51f828c877b2fd9240744916b0282b2d8b208c40ed1a30c38fd463087dfaa09a51f828c877b2fd9240744916b0282b2d8b208c40ed1a30c38fd4630f3a855087dcf6c79b22d58b55e936a27a612ecfb650d34bb3e8aef541db34e35f3a855087dcf6c79b22d58b55e936a27a612ecfb650d34bb3e8aef541db34e35eebd9002b3fa9c21d5dcd137c40cd93884e7d459675df882154112c3760b9838eebd9002b3fa9c21d5dcd137c40cd93884e7d459675df882154112c3760b983842fa68f2927096890b07e54563228f9c16495437d92673b817a6c5e45544e35c42fa68f2927096890b07e54563228f9c16495437d92673b817a6c5e45544e35c12ff3b9f027a26c8446c8a796f9781d405e36ca5d5404dfe0e9309d1557641fe12ff3b9f027a26c8446c8a796f9781d405e36ca5d5404dfe0e9309d1557641fe5e38d9c408953dad9742c660cff1f69a41fefb1fad89db181c1742a7ff1aa64c5e38d9c408953dad9742c660cff1f69a41fefb1fad89db181c1742a7ff1aa64cda2bf476739b6e5fe7f6edc7eb577a9af61c70610294bf48c7325cb9c92ae89fda2bf476739b6e5fe7f6edc7eb577a9af61c70610294bf48c7325cb9c92ae89fce9d27be7ffe7929529ff3f41015a5d6086793e7194fc4ee4724b13190909a0dce9d27be7ffe7929529ff3f41015a5d6086793e7194fc4ee4724b13190909a0d5789d4bba96ace563cd2db38a1967f466dd442d162de8c1e1e09a341e71c26735789d4bba96ace563cd2db38a1967f466dd442d162de8c1e1e09a341e71c26736bf9e3e42a4b4db298172b755a21738b6e1ab930bca694713cb4d4c6b663e3876bf9e3e42a4b4db298172b755a21738b6e1ab930bca694713cb4d4c6b663e3874327ce1be10b88394e2653122f1f1a12d596d88f7ac1fb84b0ce2ce03c7cfbfa4327ce1be10b88394e2653122f1f1a12d596d88f7ac1fb84b0ce2ce03c7cfbfaac9bb91ee13696b3eacf8f2d6906184d629716cf71b24ce44d283cb42a4cbabfac9bb91ee13696b3eacf8f2d6906184d629716cf71b24ce44d283cb42a4cbabfbea5d9ae7fd06968dbb06bd5b27dbe83c3d4217332d852398368e7ecd08b24d1bea5d9ae7fd06968dbb06bd5b27dbe83c3d4217332d852398368e7ecd08b24d12ec32734cd22d6ea06a9f5fc71058731f1ce129826c9d0f12dc3c1d37719b13e2ec32734cd22d6ea06a9f5fc71058731f1ce129826c9d0f12dc3c1d37719b13e286152d94284f65b476ddaf49eb2ae274277a7165894a50822dd673eeb0dab08286152d94284f65b476ddaf49eb2ae274277a7165894a50822dd673eeb0dab08dcfed6f2bd4b4f83325e15bd732d4fea5653b210fff0885173df094bdbf3ba2edcfed6f2bd4b4f83325e15bd732d4fea5653b210fff0885173df094bdbf3ba2e99cd7262b1c2fc395621f3d8d05d96c991615f883bafd2bf0a661234cdd67e5399cd7262b1c2fc395621f3d8d05d96c991615f883bafd2bf0a661234cdd67e5382ca3cab823943f1f9b9bddd1ab56d6eaab3b88472409e37e6d2b695faf8813e82ca3cab823943f1f9b9bddd1ab56d6eaab3b88472409e37e6d2b695faf8813e82f7f6f3c599abf3fdc85d39f82191ccb48fb32a6174ff97fd2739a3d59cd5fd82f7f6f3c599abf3fdc85d39f82191ccb48fb32a6174ff97fd2739a3d59cd5fd0547ed38cd7e921dbc15caad29adb5efba4afc07a427996858684bb0a9618dbf0547ed38cd7e921dbc15caad29adb5efba4afc07a427996858684bb0a9618dbf2847748b8dcbaa2608420d1d439995fc4ac805de711f2fb43686885e1dd2365b2847748b8dcbaa2608420d1d439995fc4ac805de711f2fb43686885e1dd2365bdca150b145f8d44103ca326b00d0f4db5abe486e508f45139ab875aabcd62feadca150b145f8d44103ca326b00d0f4db5abe486e508f45139ab875aabcd62fea4ca2275243db96d62bd107561f73350382f025e227b2fc079dec3375ba6ab8dc4ca2275243db96d62bd107561f73350382f025e227b2fc079dec3375ba6ab8dcc1b7f4259f3c0dd91a269bd6e61f0ef2d667544c827012e924198931d27fb643c1b7f4259f3c0dd91a269bd6e61f0ef2d667544c827012e924198931d27fb643ebbb14dc1b02de7cbb8cc6e8e3a9b344152cf5074d7d1e0a0b25a539b24bf5f4ebbb14dc1b02de7cbb8cc6e8e3a9b344152cf5074d7d1e0a0b25a539b24bf5f4b45cdb5cb9a85764753b3b6ee8261d3488217c1e96b4b3040e888d0d65688711b45cdb5cb9a85764753b3b6ee8261d3488217c1e96b4b3040e888d0d65688711f97eb64db469ec92ff4b021ec1375ce3fcfb76129438c30e16668219e6d7edebf97eb64db469ec92ff4b021ec1375ce3fcfb76129438c30e16668219e6d7edeb09000000b36bff355ca9b047738421bff2f763f444144062b1192836738987f8e22eb1267eca4cbcaae5bb32bdeef6772be7f3be2d763c48039a40c09bb215717c6b3a894013692d1beeb8f511c8259d4ce8c012672385372d863064b6d520a016479af1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex')
      let actual = spool.block_sync.block(buffer)
      expect(actual).to.eql({
        entity: {
          signature: '71DFD852808D83B1DAE4A9331B66E01EA82F0CCE8B348E61DADAF9B0A26780BB64F1D44E91D8FA12605AF8CABEA96BB7497B8497298B8964EA62D82708DDA50D',
          key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
          version: 1,
          network: 152,
          type: 32835
        },
        block: {
          height: '1',
          timestamp: '0',
          difficulty: '100000000000000',
          previousBlockHash: '0000000000000000000000000000000000000000000000000000000000000000',
          transactionsHash: '51A062CF4CDECA3507C811CFA2FE1C4BB84E5D2ED17249E0A9E5758F1CB788AF',
          receiptsHash: '38269B44428EFAA0F222F949857B7AC4CE88084262E90B807E9502543AE08366',
          stateHash: '4A6ACA7A70BE343772EB7799E6A3FA8E8DF20ED87CF0A2A7161B437CCDDA6F0F',
          beneficiaryPublicKey: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
          feeMultiplier: 0,
          transactions: [
            {
              entity: {
                signature: 'D6F61602680356B7D1DB9329132988C1786EB5C6920EDB9B4F8CBDC6FD009F33CD6403B0372EEB30B747BCA06F388427883935F01334ADA7E9D94E8144F07E0B',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16718
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                namespaceId: 'B1497F5FBA651B4F',
                namespaceType: 0,
                name: 'cat',
                duration: '0'
              }
            },
            {
              entity: {
                signature: 'CF4306251FAD48C66F106F8B23D3F0878976FD0EA988B035CC3EF70FD31E033823C2D95E24BC5D675A0CDEAB01FC7E481EA47587A4DAF7934E6314E332C9280E',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16718
              },
              transaction: {
                maxFee: "0",
                deadline: "1",
                namespaceId: '941299B2B7E1291C',
                namespaceType: 1,
                name: 'harvest',
                parentId: 'B1497F5FBA651B4F'
              }
            },
            {
              entity: {
                signature: 'B4A2250A964BD08B85AAD3057B7E16FB2D759E163A29E9B8E6BBF7B2F240B9722506E7ECB933562C583DD8CDF2A15D238C530682217107AAD1E82768750E8101',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16718
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                namespaceId: '85BBEA6CC462B244',
                namespaceType: 1,
                name: 'currency',
                parentId: 'B1497F5FBA651B4F'
              }
            },
            {
              entity: {
                signature: 'C889D20062E2863478C66A59DC7281F8D7862B58A69310AC1970D0531213F61FFF01C7EFB3A54705A189DAB9DB302E87978EE5D344CC90DB100FD1C74476A801',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16717
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                mosaicId: '61F6EFB8D6BF2705',
                duration: '0',
                nonce: 0,
                flags: 2,
                divisibility: 6
              }
            },
            {
              entity: {
                signature: '156F3CD141305EA6B13BA8B785E54FA045A6C4F99B524794969B1E1BB2CE970FC595E5272FC64329D05DA0F28997E28131AEA48AA3E3029F0A4A29B6D4D69A0C',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 17230
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                namespaceId: '85BBEA6CC462B244',
                aliased: '61F6EFB8D6BF2705',
                aliasAction: 1
              }
            },
            {
              entity: {
                signature: '4A47E449DD5C656B33B6A34C3C689C47AAA1EB77F3F4600DA1B797600FA30ED7F9F13C39A0969E135085C632EE8D7F7431164218505EA08FED01154791B01705',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16973
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                mosaicId: '85BBEA6CC462B244',
                delta: '8998999998000000',
                action: 1
              }
            },
            {
              entity: {
                signature: '9A574DAEF05C0BED6B83853882584D8AE62C2E4C2FBD8F84FAC7286F74B391EBAD40DAEE7FECFCFA96AA503CC52E343741240F963C4208363E83F7B72F761008',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16717
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                mosaicId: '22E99F2A9E7A1798',
                duration: '0',
                nonce: 1,
                flags: 3,
                divisibility: 3
              }
            },
            {
              entity: {
                signature: '86EF4B24E2A65D14702BBDC9944A1397D3B0EBE24064726FFB5FDD89631F63C519B19419AFE7E917E9CF933E6D97AB086E6DF9694ED2E0185E90395E45F98C01',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 17230
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                namespaceId: '941299B2B7E1291C',
                aliased: '22E99F2A9E7A1798',
                aliasAction: 1
              }
            },
            {
              entity: {
                signature: 'B0C9BF69F21077CE644445FE2527AC6C750BB99642A4E511A2AC95B71F76EA45A31BC140FB8BF995FA7E3FC9B1CD0E36C1EB3528C52351D373C6FA715D289006',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16973
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                mosaicId: '941299B2B7E1291C',
                delta: '15000000',
                action: 1
              }
            },
            {
              entity: {
                signature: 'DFD5A0AE2CA3B6397F31820CCE91001B7DE00DD2107822EAB9B1D2C4781670165D2B343F77CB7A4751B5A345FE5B0DB3E7323A6DFF222998205E95D3349E8508',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TCOWDGSMGLGNVPRLJGFMCA2LH7EMGDSW6GB26L3S',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  },
                  {
                    mosaicId: '941299B2B7E1291C',
                    amount: '3750000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: '733019A6E664BFA99831C55C059D2702385E6F3AD067EA214F3CDEF2713E97225AEC943D47134781A0BC89C39CB3498F4350C756B4BB678D33726AD0A83EFF08',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TBRPVXDECCHY7HXLGBQVCZ7DWAISCM7HSJTDQWSM',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  },
                  {
                    mosaicId: '941299B2B7E1291C',
                    amount: '3750000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: 'D728B7E0C8A26873CC0F8093DBCBA63971632193C8D4219D8665B8A4E4DEAF0433EB298FF465859741DBBFCC96F53ACD344A1E5E3CF0F41377F0A53259A8BF0C',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TD3XEX4ALMMB46PN242C5LPEYEVZSUXIQMXN5WJR',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  },
                  {
                    mosaicId: '941299B2B7E1291C',
                    amount: '3750000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: '2E0B656E65647F1CF0A4FFC05D115B144C7B1BC63A1C98BA1EA3A626DAEFA645CCFB87DF1EE94ED41DF8D940A7B6AB92E0D86D2AA4637EC5A75FDAE7E9E6EC01',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TCCMDNGOXTGMM3BZQ3YZODLQ7DSUKEDGUHPOQTR4',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  },
                  {
                    mosaicId: '941299B2B7E1291C',
                    amount: '3750000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: '3D25F70C8D949E1C6E7C670E5C0B994C2C689DD1E7A9F03BF371621C22BB4A2C8C52FA1C018F0D338AEB397C531673B56976EAF4A247710F096997CEB0ADD00A',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TBT5QFV4A5SG3AGIZMOREHXSVJQIJXIJD3U4A2KR',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: 'EA43C40A4E1734F15D0D0B7CD7DC7DADEFBDF3323BAB3C0BA43D787306F26B43B0A8D39066CA805E626654CB1E28BF3A6CC30941738F81F14BD35F3A6DF7C304',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TALZVLE4PHQ2CU2ZOBOLB5KSJJWPLIGDGOAJF56N',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: 'AB49C365EB2DDAB3A5C5B732C57381EDCB74B1DC416CA307741B2C3C8A33E02A780B8FEE03A45B83635AED818ADCE82CABE45DD47142A6117E73AE3F00D4D801',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TC3YJDLMGURXIWCSQ6X5INGTKD3BNZEGUV5VLW6J',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: 'E18CD69244A47207A9EFF6E430005DEC54B45B7FE09824384F7F2E50895479A3254DF6F03A80C63A7702DD4C72D6D0F3CD6BAD2931139B6062F8C72DA86EB508',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TACGT6SJGUJOCNVQ6U5B5NTULDXOIC3JSTHSUYDF',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: 'DF38FE2D75E12866BA64AB8631C8F7BBB3A9ECB55A50E0AA0CF7C3C222FF220A1F899D5E947174B39329003F29A3AE0C8F49172545671B1CC0222D2924B8B804',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TBWEKD2CAG2QSDHFIHI7A6N6XMT64CMMEYHI45VN',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: 'D3918511FE6FAF280B18754EE6987B206B191748E4881BF952976CCF14BD306641BF2AEEE67489D8D47755C08CFBC4DE79E54CDF4BBD4A789C5C02242B132305',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TD6BXOCQ3TQOKEWKGO4EAV6DO4B7TSSDM7M6B76C',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: 'B485707EC18BE65684C8DB6BD536990DE93AC1D971A15BE587D01D093B582B0E531DADA55F6F5D0ECAF3E48F77DB482193328CD61C7384AD1488950187EB0009',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TAZ6QTG7HHSWVISVACSNCRQMPGTZVMOLSKMONWZK',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: '1C2F391747455576EABD2F690E890E12EEBA8C55C54E08DAE47EFC598B581FD03CF2B125D3041CF96852D1926837A9A725368FB642580733E890F5EA615E1203',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TBQ3Q7WJ73QA5NS7ZECI2PWG6HYBDT5RD4ZVTPH4',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: '0C5832042B88596E8777764C6F04FBBB9531AEC62BB51A8154DD91FB09FE2CEBB2DE84FF6260682F1BEAAA7C14BE302088771382548DC3D0BC037A7D4AB8EB01',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TDQWBTVGQR6V3RLQMTK2SGC2Y4TVDO7WP2SZHYMZ',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: '83D2B7BDEA2862EE1D937AB75844ED5FD7C863101E29AA0D6E3D144B7D09252D8C9BEC86B18DA658254E421F6E027F22033C389DB55FF64364F0E0940B38C603',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TDMRMXB3XCETCS45PTDLIMZ3CPGQS5LP2YCZBKSE',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: '00F8F9034C17A85F0EE3EF3D4715E6C701A579ED891A76367FCC844ADCAE2EB03929A3AD959080FA662BDEAA79FEA9ABBD267D57E817AFF9B180A56DE0DB9B0C',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TD5B4PYOIU7GAMDIA5WEDXAA6TX7OTO5DHT23NHP',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: 'FDCF32552179EF989BA3D261D581BAC38CC289A93BAEC4723822BDECFF74EC42D678A4523A56AD07B64D1C845C74EF4CA8AEA6945BC3B5B0F2474A7EE847000B',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TDK7QN662CD7QWNBOTNKNEMCZ44FMR6DVEXKECWB',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: '25B53244DF3DBE58784026E896C2C7EC75E2FC2D0EDB66405B08F4B417C5963772F4DB01D4C776C2B3DA254CDBED6F97BB8A9C5BEF48B31B220BC724E9B63708',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TCSJ3DE3JSWQV5I6GUJM7CQJQS4ROPAB72MWHFQG',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: '54D26D9DDFA9334999C4058506B1F67D22644B5AD2936BA5DD0B1CA393EB57EFD03414913781C7C5ED4587D09D2A2A53B0309F2F3789450E8804D69E790B870D',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TC774Y5FIV2NPVO7ORK62NZUVMJ5LNGGBVNQ227K',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: 'F97EADE9DABE0C55F2CB4C2D9E9B75AD346D69AD5FA9748DDBA5DE266A95104C0A3906817E4D32D91E89301E9FEF2090372D9294B7356C30479075DC178CE30C',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TAQDYZOLS42DR3SU3RUU3YCDCIGM3MSC2JVBKGYJ',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            },
            {
              entity: {
                signature: 'D6E920ABD04F36391455F215CA9F166EA83DB6710B9BA14DBFBA5C878FE166B3B1167762F6673B03A6E0F34F70387131F3D586257DFD90F1B29434E685B2E90C',
                key: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4',
                version: 1,
                network: 152,
                type: 16724
              },
              transaction: {
                maxFee: '0',
                deadline: '1',
                receipientAddress: 'TBT77TM7S2CI3MVFVEAESMRWUYCTVBWNT5WS4ERH',
                mosaics: [
                  {
                    mosaicId: '85BBEA6CC462B244',
                    amount: '449949999900000'
                  }
                ],
                message: ''
              }
            }
          ]
        },
        entityHash: 'B6CC1792D5CB2B95765961E34AC1B938055154B8E0514B0944B1ACE547A4E181',
        generationHash: '2CA12C9F076C9A6637E6E8F967C196CC5BB047F1773317F6DCCFB6792ADC424C',
        transactions: [
          {
            entityHash: '8D224F3DABC142B254686CA29684FA9D764F542425D004904BC23C898CF89635',
            merkleComponentHash: '8D224F3DABC142B254686CA29684FA9D764F542425D004904BC23C898CF89635'
          },
          {
            entityHash: '6E36B3AD23E4E139FF10EB35003309FFA9598CCA5EB27B8DD91DC497028D63DB',
            merkleComponentHash: '6E36B3AD23E4E139FF10EB35003309FFA9598CCA5EB27B8DD91DC497028D63DB'
          },
          {
            entityHash: '87DFAA09A51F828C877B2FD9240744916B0282B2D8B208C40ED1A30C38FD4630',
            merkleComponentHash: '87DFAA09A51F828C877B2FD9240744916B0282B2D8B208C40ED1A30C38FD4630'
          },
          {
            entityHash: 'F3A855087DCF6C79B22D58B55E936A27A612ECFB650D34BB3E8AEF541DB34E35',
            merkleComponentHash: 'F3A855087DCF6C79B22D58B55E936A27A612ECFB650D34BB3E8AEF541DB34E35'
          },
          {
            entityHash: 'EEBD9002B3FA9C21D5DCD137C40CD93884E7D459675DF882154112C3760B9838',
            merkleComponentHash: 'EEBD9002B3FA9C21D5DCD137C40CD93884E7D459675DF882154112C3760B9838'
          },
          {
            entityHash: '42FA68F2927096890B07E54563228F9C16495437D92673B817A6C5E45544E35C',
            merkleComponentHash: '42FA68F2927096890B07E54563228F9C16495437D92673B817A6C5E45544E35C'
          },
          {
            entityHash: '12FF3B9F027A26C8446C8A796F9781D405E36CA5D5404DFE0E9309D1557641FE',
            merkleComponentHash: '12FF3B9F027A26C8446C8A796F9781D405E36CA5D5404DFE0E9309D1557641FE'
          },
          {
            entityHash: '5E38D9C408953DAD9742C660CFF1F69A41FEFB1FAD89DB181C1742A7FF1AA64C',
            merkleComponentHash: '5E38D9C408953DAD9742C660CFF1F69A41FEFB1FAD89DB181C1742A7FF1AA64C'
          },
          {
            entityHash: 'DA2BF476739B6E5FE7F6EDC7EB577A9AF61C70610294BF48C7325CB9C92AE89F',
            merkleComponentHash: 'DA2BF476739B6E5FE7F6EDC7EB577A9AF61C70610294BF48C7325CB9C92AE89F'
          },
          {
            entityHash: 'CE9D27BE7FFE7929529FF3F41015A5D6086793E7194FC4EE4724B13190909A0D',
            merkleComponentHash: 'CE9D27BE7FFE7929529FF3F41015A5D6086793E7194FC4EE4724B13190909A0D'
          },
          {
            entityHash: '5789D4BBA96ACE563CD2DB38A1967F466DD442D162DE8C1E1E09A341E71C2673',
            merkleComponentHash: '5789D4BBA96ACE563CD2DB38A1967F466DD442D162DE8C1E1E09A341E71C2673'
          },
          {
            entityHash: '6BF9E3E42A4B4DB298172B755A21738B6E1AB930BCA694713CB4D4C6B663E387',
            merkleComponentHash: '6BF9E3E42A4B4DB298172B755A21738B6E1AB930BCA694713CB4D4C6B663E387'
          },
          {
            entityHash: '4327CE1BE10B88394E2653122F1F1A12D596D88F7AC1FB84B0CE2CE03C7CFBFA',
            merkleComponentHash: '4327CE1BE10B88394E2653122F1F1A12D596D88F7AC1FB84B0CE2CE03C7CFBFA'
          },
          {
            entityHash: 'AC9BB91EE13696B3EACF8F2D6906184D629716CF71B24CE44D283CB42A4CBABF',
            merkleComponentHash: 'AC9BB91EE13696B3EACF8F2D6906184D629716CF71B24CE44D283CB42A4CBABF'
          },
          {
            entityHash: 'BEA5D9AE7FD06968DBB06BD5B27DBE83C3D4217332D852398368E7ECD08B24D1',
            merkleComponentHash: 'BEA5D9AE7FD06968DBB06BD5B27DBE83C3D4217332D852398368E7ECD08B24D1'
          },
          {
            entityHash: '2EC32734CD22D6EA06A9F5FC71058731F1CE129826C9D0F12DC3C1D37719B13E',
            merkleComponentHash: '2EC32734CD22D6EA06A9F5FC71058731F1CE129826C9D0F12DC3C1D37719B13E'
          },
          {
            entityHash: '286152D94284F65B476DDAF49EB2AE274277A7165894A50822DD673EEB0DAB08',
            merkleComponentHash: '286152D94284F65B476DDAF49EB2AE274277A7165894A50822DD673EEB0DAB08'
          },
          {
            entityHash: 'DCFED6F2BD4B4F83325E15BD732D4FEA5653B210FFF0885173DF094BDBF3BA2E',
            merkleComponentHash: 'DCFED6F2BD4B4F83325E15BD732D4FEA5653B210FFF0885173DF094BDBF3BA2E'
          },
          {
            entityHash: '99CD7262B1C2FC395621F3D8D05D96C991615F883BAFD2BF0A661234CDD67E53',
            merkleComponentHash: '99CD7262B1C2FC395621F3D8D05D96C991615F883BAFD2BF0A661234CDD67E53'
          },
          {
            entityHash: '82CA3CAB823943F1F9B9BDDD1AB56D6EAAB3B88472409E37E6D2B695FAF8813E',
            merkleComponentHash: '82CA3CAB823943F1F9B9BDDD1AB56D6EAAB3B88472409E37E6D2B695FAF8813E'
          },
          {
            entityHash: '82F7F6F3C599ABF3FDC85D39F82191CCB48FB32A6174FF97FD2739A3D59CD5FD',
            merkleComponentHash: '82F7F6F3C599ABF3FDC85D39F82191CCB48FB32A6174FF97FD2739A3D59CD5FD'
          },
          {
            entityHash: '0547ED38CD7E921DBC15CAAD29ADB5EFBA4AFC07A427996858684BB0A9618DBF',
            merkleComponentHash: '0547ED38CD7E921DBC15CAAD29ADB5EFBA4AFC07A427996858684BB0A9618DBF'
          },
          {
            entityHash: '2847748B8DCBAA2608420D1D439995FC4AC805DE711F2FB43686885E1DD2365B',
            merkleComponentHash: '2847748B8DCBAA2608420D1D439995FC4AC805DE711F2FB43686885E1DD2365B'
          },
          {
            entityHash: 'DCA150B145F8D44103CA326B00D0F4DB5ABE486E508F45139AB875AABCD62FEA',
            merkleComponentHash: 'DCA150B145F8D44103CA326B00D0F4DB5ABE486E508F45139AB875AABCD62FEA'
          },
          {
            entityHash: '4CA2275243DB96D62BD107561F73350382F025E227B2FC079DEC3375BA6AB8DC',
            merkleComponentHash: '4CA2275243DB96D62BD107561F73350382F025E227B2FC079DEC3375BA6AB8DC'
          },
          {
            entityHash: 'C1B7F4259F3C0DD91A269BD6E61F0EF2D667544C827012E924198931D27FB643',
            merkleComponentHash: 'C1B7F4259F3C0DD91A269BD6E61F0EF2D667544C827012E924198931D27FB643'
          },
          {
            entityHash: 'EBBB14DC1B02DE7CBB8CC6E8E3A9B344152CF5074D7D1E0A0B25A539B24BF5F4',
            merkleComponentHash: 'EBBB14DC1B02DE7CBB8CC6E8E3A9B344152CF5074D7D1E0A0B25A539B24BF5F4'
          },
          {
            entityHash: 'B45CDB5CB9A85764753B3B6EE8261D3488217C1E96B4B3040E888D0D65688711',
            merkleComponentHash: 'B45CDB5CB9A85764753B3B6EE8261D3488217C1E96B4B3040E888D0D65688711'
          },
          {
            entityHash: 'F97EB64DB469EC92FF4B021EC1375CE3FCFB76129438C30E16668219E6D7EDEB',
            merkleComponentHash: 'F97EB64DB469EC92FF4B021EC1375CE3FCFB76129438C30E16668219E6D7EDEB'
          }
        ],
        merkleRoots: [
          'B36BFF355CA9B047738421BFF2F763F444144062B1192836738987F8E22EB126',
          '7ECA4CBCAAE5BB32BDEEF6772BE7F3BE2D763C48039A40C09BB215717C6B3A89',
          '4013692D1BEEB8F511C8259D4CE8C012672385372D863064B6D520A016479AF1',
          '0000000000000000000000000000000000000000000000000000000000000000',
          '0000000000000000000000000000000000000000000000000000000000000000',
          '0000000000000000000000000000000000000000000000000000000000000000',
          '0000000000000000000000000000000000000000000000000000000000000000',
          '0000000000000000000000000000000000000000000000000000000000000000',
          '0000000000000000000000000000000000000000000000000000000000000000'
        ]
      })
    })

    it('should parse the nemesis block statement', () => {
      let buffer = Buffer.from('0100000000000000000000000100000038000000010043210527bfd6b8eff6610000000000000000f7e69e0a1e1d00459d6b1d315986a60b582bdef8bb51ea6498a0eca59ab7a2b4000000000200000044b262c46ceabb850100000006000000000000000527bfd6b8eff6611c29e1b7b299129401000000090000000000000098177a9e2a9fe922', 'hex')
      let actual = spool.block_sync.blockStatement(buffer)
      expect(actual).to.eql({
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
                targetPublicKey: 'F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4'
              }
            ]
          }
        ],
        addressResolutionStatements: [],
        mosaicResolutionStatements: [
          {
            source: '85BBEA6CC462B244',
            resolutions: [
              {
                source: {
                  primaryId: 6,
                  secondaryId: 0
                },
                value:'61F6EFB8D6BF2705'
              }
            ]
          },
          {
            source: '941299B2B7E1291C',
            resolutions: [
              {
                source: {
                  primaryId: 9,
                  secondaryId: 0
                },
                value: '22E99F2A9E7A1798'
              }
            ]
          }
        ]
      })
    })

    it('should parse a general block data file', () => {
      let buffer = Buffer.from('3001000000000000ae26165d9470f4c672d8fbb14fb240081d863169ec5e412b11919a9cd7957c51d6208c7797332995aa470da741de3ff6f8690f5f5414392d7f566c5d9ac88e08b35833b6ddf147deee0f659335ee4331eeae80670f45d29ff4ec02c46303866b000000000198438102000000000000004407c6de0100000000407a10f35a0000b6cc1792d5cb2b95765961e34ac1b938055154b8e0514b0944b1ace547a4e1810000000000000000000000000000000000000000000000000000000000000000074211776a2cebbb80f25fed1240b1e198726851049dac3a53e64d8e2278c99fd5762728fd2f5d26c49e5b7601ef56f0ef601f5661d404bcb3f7ae63fca64bd8b35833b6ddf147deee0f659335ee4331eeae80670f45d29ff4ec02c46303866b0000000000000000adf34ddcb924e5403d0e59ed244b616485f765403752d9e1ffb4cd39d2f1bf89f3bafc6d0211783d428885850be10c9ad95dbac489db256eed95a548e75844010000000009000000a816805b4484b55795cbc2ff1ed95061f8968760404f320da32c81d3017c86e67eca4cbcaae5bb32bdeef6772be7f3be2d763c48039a40c09bb215717c6b3a894013692d1beeb8f511c8259d4ce8c012672385372d863064b6d520a016479af1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex')
      let actual = spool.block_sync.block(buffer)
      expect(actual).to.eql({
        entity: {
          signature: 'AE26165D9470F4C672D8FBB14FB240081D863169EC5E412B11919A9CD7957C51D6208C7797332995AA470DA741DE3FF6F8690F5F5414392D7F566C5D9AC88E08',
          key: 'B35833B6DDF147DEEE0F659335EE4331EEAE80670F45D29FF4EC02C46303866B',
          version: 1,
          network: 152,
          type: 33091
        },
        block: {
          height: '2',
          timestamp: '8032487236',
          difficulty: '100000000000000',
          previousBlockHash: 'B6CC1792D5CB2B95765961E34AC1B938055154B8E0514B0944B1ACE547A4E181',
          transactionsHash: '0000000000000000000000000000000000000000000000000000000000000000',
          receiptsHash: '074211776A2CEBBB80F25FED1240B1E198726851049DAC3A53E64D8E2278C99F',
          stateHash: 'D5762728FD2F5D26C49E5B7601EF56F0EF601F5661D404BCB3F7AE63FCA64BD8',
          beneficiaryPublicKey: 'B35833B6DDF147DEEE0F659335EE4331EEAE80670F45D29FF4EC02C46303866B',
          feeMultiplier: 0
        },
        entityHash: 'ADF34DDCB924E5403D0E59ED244B616485F765403752D9E1FFB4CD39D2F1BF89',
        generationHash: 'F3BAFC6D0211783D428885850BE10C9AD95DBAC489DB256EED95A548E7584401',
        transactions: [],
        merkleRoots: [
          'A816805B4484B55795CBC2FF1ED95061F8968760404F320DA32C81D3017C86E6',
          '7ECA4CBCAAE5BB32BDEEF6772BE7F3BE2D763C48039A40C09BB215717C6B3A89',
          '4013692D1BEEB8F511C8259D4CE8C012672385372D863064B6D520A016479AF1',
          '0000000000000000000000000000000000000000000000000000000000000000',
          '0000000000000000000000000000000000000000000000000000000000000000',
          '0000000000000000000000000000000000000000000000000000000000000000',
          '0000000000000000000000000000000000000000000000000000000000000000',
          '0000000000000000000000000000000000000000000000000000000000000000',
          '0000000000000000000000000000000000000000000000000000000000000000'
        ]
      })
    })

    it('should parse a general block statement', () => {
      let buffer = Buffer.from('0100000000000000000000000100000038000000010043210527bfd6b8eff6610000000000000000b35833b6ddf147deee0f659335ee4331eeae80670f45d29ff4ec02c46303866b0000000000000000', 'hex')
      let actual = spool.block_sync.blockStatement(buffer)
      expect(actual).to.eql({
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

    it('should parse hashes from data', () => {
      let buffer = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000b6cc1792d5cb2b95765961e34ac1b938055154b8e0514b0944b1ace547a4e181adf34ddcb924e5403d0e59ed244b616485f765403752d9e1ffb4cd39d2f1bf890819de1ae69f72135d11525258b69b32793feee65d750ca2821981cf2e7788748df8542e0ea7dbcf4828aebcaab2f826b6b8031ed86b6ca7bb9807a54dd89e28592b9aacc8d677cdc56e4a2208578382542727ae911aeef1d8a91cb413dd5dd38825df83d6ac3c16448d44014530d9c1c4a11d7050d4db8cb96ec68efe65c991e8202d75d98fc6523b39a22ba854e10c93fd003becff55cce799c599b21181e035d0a42b26546fc11ccebb3ea6abdcd478cd25e9681aeacb377a742f68b1eaba7b78df2209fa4021e98baef737f346e673dd294fc3763f72af2238306826ce9fedeb94787e91d86aeab1fe6297eebf96314a1856be86c872c77174d9091d3ef20acb6fc0965baf93fdd811753fb8ca91527415046cf93ad781eee459c6694a2d22776844f2ad7649ef8098655cd594bdc819f42c1d6bdecc2c0a7250a1c6bec23d0b0ae2b97167c10f72a0d59934be407d3dff7efb0a8eef4fc25dde3d43b834ff3b4a13067e68666fe19d95494a296a7246aae565f80966d648895dd53252fc273c09aec87f3f4905ca96f2356bbab48c0e1ed3d77a5b98512643b5d94f8c6f0ef3d4a934130c2bfc362daf39cbd102fb9acca78c8339bd56d405fa9c223089b24f854ec1e39a0fdbdf01a2435694ba6597ed2dbdfbb59ffe95247c4d946831b366b8993e0108a3f3adf91461a86dd3534023959cc99db94159940746ab3e002963f5f4647eb571b0bd612887c1c05b05af9dc3891d470559790dd412f46451f218e9afe5664477aa5074cf81f33789e0778319beff90d4030d98fb3c4907748e584e86de3bfb49db1255acc6c4eee5b8525dc60ae7b1e83a8bf2848900ee14aeb8f40cc19c5f0fd58b7413e5ce44740f6c1510e8f97abfb6060150339c8acb8b4bc2edea275fd48cedc4a842bc265765bbc94ab3fd10de5d05da5f111e829821724057a6c685679089da4265b6e292d00b8dcb11d5d296461df921974187d8448ad1daef8c581e1b566e8d2e34553e2b4eca5406da49086d183916e88226dae3ebd682bdbcedb5afead6251b570d98d7ed9e877264d0e8c8bda35d5d02f55fa75c6fa44e2c68356fa684f91518afc4c724a19a3b54c7f1bdac5b21066894f09939df3fa38a1efe09414a0d881c89d75c512530ea892144595515a2774a78155d8fe17823c2055c4cc2937f4b755dd8676175394038c8e544f06f6c0f04f8ac4c4b90df8805b66325f8178f960281e4babd66c62edb8d0e45e85b0805ca5fed11a0287e108a1989013b483caf003ec727affea8059d48a49ff5a04fe8103a26', 'hex')
      let actual = spool.block_sync.hashes(buffer)
      expect(actual).to.eql([
        '0000000000000000000000000000000000000000000000000000000000000000',
        'B6CC1792D5CB2B95765961E34AC1B938055154B8E0514B0944B1ACE547A4E181',
        'ADF34DDCB924E5403D0E59ED244B616485F765403752D9E1FFB4CD39D2F1BF89',
        '0819DE1AE69F72135D11525258B69B32793FEEE65D750CA2821981CF2E778874',
        '8DF8542E0EA7DBCF4828AEBCAAB2F826B6B8031ED86B6CA7BB9807A54DD89E28',
        '592B9AACC8D677CDC56E4A2208578382542727AE911AEEF1D8A91CB413DD5DD3',
        '8825DF83D6AC3C16448D44014530D9C1C4A11D7050D4DB8CB96EC68EFE65C991',
        'E8202D75D98FC6523B39A22BA854E10C93FD003BECFF55CCE799C599B21181E0',
        '35D0A42B26546FC11CCEBB3EA6ABDCD478CD25E9681AEACB377A742F68B1EABA',
        '7B78DF2209FA4021E98BAEF737F346E673DD294FC3763F72AF2238306826CE9F',
        'EDEB94787E91D86AEAB1FE6297EEBF96314A1856BE86C872C77174D9091D3EF2',
        '0ACB6FC0965BAF93FDD811753FB8CA91527415046CF93AD781EEE459C6694A2D',
        '22776844F2AD7649EF8098655CD594BDC819F42C1D6BDECC2C0A7250A1C6BEC2',
        '3D0B0AE2B97167C10F72A0D59934BE407D3DFF7EFB0A8EEF4FC25DDE3D43B834',
        'FF3B4A13067E68666FE19D95494A296A7246AAE565F80966D648895DD53252FC',
        '273C09AEC87F3F4905CA96F2356BBAB48C0E1ED3D77A5B98512643B5D94F8C6F',
        '0EF3D4A934130C2BFC362DAF39CBD102FB9ACCA78C8339BD56D405FA9C223089',
        'B24F854EC1E39A0FDBDF01A2435694BA6597ED2DBDFBB59FFE95247C4D946831',
        'B366B8993E0108A3F3ADF91461A86DD3534023959CC99DB94159940746AB3E00',
        '2963F5F4647EB571B0BD612887C1C05B05AF9DC3891D470559790DD412F46451',
        'F218E9AFE5664477AA5074CF81F33789E0778319BEFF90D4030D98FB3C490774',
        '8E584E86DE3BFB49DB1255ACC6C4EEE5B8525DC60AE7B1E83A8BF2848900EE14',
        'AEB8F40CC19C5F0FD58B7413E5CE44740F6C1510E8F97ABFB6060150339C8ACB',
        '8B4BC2EDEA275FD48CEDC4A842BC265765BBC94AB3FD10DE5D05DA5F111E8298',
        '21724057A6C685679089DA4265B6E292D00B8DCB11D5D296461DF921974187D8',
        '448AD1DAEF8C581E1B566E8D2E34553E2B4ECA5406DA49086D183916E88226DA',
        'E3EBD682BDBCEDB5AFEAD6251B570D98D7ED9E877264D0E8C8BDA35D5D02F55F',
        'A75C6FA44E2C68356FA684F91518AFC4C724A19A3B54C7F1BDAC5B21066894F0',
        '9939DF3FA38A1EFE09414A0D881C89D75C512530EA892144595515A2774A7815',
        '5D8FE17823C2055C4CC2937F4B755DD8676175394038C8E544F06F6C0F04F8AC',
        '4C4B90DF8805B66325F8178F960281E4BABD66C62EDB8D0E45E85B0805CA5FED',
        '11A0287E108A1989013B483CAF003EC727AFFEA8059D48A49FF5A04FE8103A26'
      ])
    })

    it('should parse a file', () => {
      let directory = path.join(DATA_DIR, 'spool', 'block_sync', '00000')

      // Block file
      let file = path.join(directory, '00001.dat')
      let actual = spool.block_sync.file(file)
      expect(actual.block.height).to.equal('1')

      // Block statement
      file = path.join(directory, '00001.stmt')
      actual = spool.block_sync.file(file)
      expect(actual).to.have.key('transactionStatements')

      // Hashes
      file = path.join(directory, 'hashes.dat')
      actual = spool.block_sync.file(file)
      expect(actual[0]).to.equal('0000000000000000000000000000000000000000000000000000000000000000')
    })

    it('should parse a directory', () => {
      const directory = path.join(DATA_DIR, 'spool', 'block_sync')
      let actual = spool.block_sync.directory(directory)
      expect(Object.keys(actual)).to.eql(['00000', '00001'])
      expect(Object.keys(actual['00000'])).to.eql([
        '00001.dat',
        '00001.stmt',
        '00002.dat',
        '00002.stmt',
        '00003.dat',
        '00003.stmt',
        'hashes.dat'
      ])
      expect(Object.keys(actual['00001'])).to.eql([
        '00000.dat',
        '00000.stmt',
        '00001.dat',
        '00001.stmt',
        '00002.dat',
        '00002.stmt',
        'hashes.dat'
      ])
      expect(actual['00000']['00001.dat'].block.height).to.equal('1')
      expect(actual['00000']['00002.dat'].block.height).to.equal('2')
      expect(actual['00000']['00003.dat'].block.height).to.equal('3')
      expect(actual['00000']['hashes.dat']).to.have.length(3)
      expect(actual['00001']['00000.dat'].block.height).to.equal('65536')
      expect(actual['00001']['00001.dat'].block.height).to.equal('65537')
      expect(actual['00001']['00002.dat'].block.height).to.equal('65538')
      expect(actual['00001']['hashes.dat']).to.have.length(3)
    })
  })

  describe('partial_transactions_change', () => {
    it('should parse add partial transactions from data', () => {
      // TODO(ahuszagh) Implement...
    })

    it('should parse remove partial transactions from data', () => {
      // TODO(ahuszagh) Implement...
    })

    it('should parse add cosignatures from data', () => {
      // TODO(ahuszagh) Implement...
      // This is the fucking annoying one. Welp.
    })

    // Aggregate Transaction Info
    //  type = 00
    //  transactionInfos:
    //    count = 01000000 (1)
    //    transactionInfo:
    //      entityHash = 671653C94E2254F2A23EFEDB15D67C38332AED1FBD24B063C0A8E675582B6A96
    //      merkleComponentHash = 81E5E7AE49998802DABC816EC10158D3A7879702FF29084C2C992CD1289877A7
    //      addressCount = FFFFFFFFFFFFFFFF
    //      extractedAddresses =
    //      transaction:
    //        entity:
    //          size = TODO(ahuszagh) Need here...
    //          reserved = 00000000
    //          signature = 939673209A13FF82397578D22CC96EB8516A6760C894D9B7535E3A1E068007B9255CFA9A914C97142A7AE18533E381C846B69D2AE0D60D1DC8A55AD120E2B606
    //          key = 7681ED5023141D9CDCF184E5A7B60B7D466739918ED5DA30F7E71EA7B86EFF2D
    //          reserved = 00000000
    //          version = 01
    //          network = 90
    //          type = 4141
    //        transaction:
    //          aggregateHash = 3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006
    //          transactionSize = TODO(ahuszagh) Need here...
    //          reserved = 00000000
    //          maxFee = 0000000000000000
    //          deadline = 0100000000000000
    //          innerTransactions:
    //            embeddedTransaction:
    //              entity:
    //                size = TODO(ahuszagh) Need here...
    //                reserved = 00000000
    //                key = B4F12E7C9F6946091E2CB8B6D3A12B50D17CCBBF646386EA27CE2946A7423DCF
    //                reserved = 00000000
    //                version = 01
    //                network = 90
    //                type = 4E41
    //              transaction:
    //                parentId = 99F2A8C5D2433FE4
    //                namespaceId = 7ABC6C75E58517C4
    //                namespaceType = 01
    //                nameSize = 06
    //                name = 30756E697573
    //          cosignatures:

    // TODO(ahuszagh) Here...
    // Let's create an aggregate bonded transaction with 1 embedded transaction.

    // TODO(ahuszagh)
    //  What's the data we need:
    //

    // TODO(ahuszagh) Here...
    // Need to implement this..
    // Let's create an aggregate bonded transaction.
    // TODO(ahuszagh) Implement...
  })

  describe('state_change', () => {
    it('should parse score changes from data', () => {
      // TODO(ahuszagh) Need these as files too.
      let buffer = Buffer.from('000000000000000000253aecfdfbee4102', 'hex')
      let actual = spool.state_change.data(buffer)
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
//      let actual = spool.state_change.file(buffer)
//      console.log(actual)
//      // TODO(ahuszagh) here..
//    })

    // TODO(ahuszagh) Need a directory test.
  })

  describe('transaction_status', () => {
    it('should parse transaction status from data', () => {
      let buffer = Buffer.from('00000000000000000000000000000000000000000000000000000000000000007856341298000000000000002879de1383ef60810e30b4f563b7cca420b195ff2d202097560f1acce6b70ce5be05037ce82d382bd3de51ff0586e40172eebd828412a26847cb367439495b099be93593c699867f1b4f624fd37bc7fb93499cdec9929088f2ff1031293960ff0000000001984e41000000000000000001000000000000000000000000000000169515968a1f5fa9000673796d626f6c', 'hex')
      let actual = spool.transaction_status.data(buffer)
      expect(actual).to.eql({
        hash: '0000000000000000000000000000000000000000000000000000000000000000',
        status: 0x12345678,
        transaction: {
          entity: {
            signature: '2879DE1383EF60810E30B4F563B7CCA420B195FF2D202097560F1ACCE6B70CE5BE05037CE82D382BD3DE51FF0586E40172EEBD828412A26847CB367439495B09',
            key: '9BE93593C699867F1B4F624FD37BC7FB93499CDEC9929088F2FF1031293960FF',
            version: 1,
            network: 152,
            type: 16718
          },
          transaction: {
            maxFee: '0',
            deadline: '1',
            namespaceId: 'A95F1F8A96159516',
            namespaceType: 0,
            name: 'symbol',
            duration: '0'
          }
        }
      })
    })

    it('should parse a transaction status file', () => {
      let file = path.join(DATA_DIR, 'spool', 'transaction_status', '000000000000012B.dat')
      let actual = spool.transaction_status.file(file)
      expect(actual.status).to.equal(0x12345678)
    })

    it('should parse a transaction status directory', () => {
      let directory = path.join(DATA_DIR, 'spool', 'transaction_status')
      let actual = spool.transaction_status.directory(directory)
      expect(Object.keys(actual)).to.eql(['000000000000012b.dat'])
      expect(actual['000000000000012b.dat'].status).to.equal(0x12345678)
    })
  })

  describe('unconfirmed_transactions_change', () => {
    it('should parse unconfirmed transaction changes from data', () => {
      let buffer = Buffer.from('0001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000989D619A4C32CCDABE2B498AC1034B3FC8C30E56F183AF2F7298000000000000002879de1383ef60810e30b4f563b7cca420b195ff2d202097560f1acce6b70ce5be05037ce82d382bd3de51ff0586e40172eebd828412a26847cb367439495b099be93593c699867f1b4f624fd37bc7fb93499cdec9929088f2ff1031293960ff0000000001984e41000000000000000001000000000000000000000000000000169515968a1f5fa9000673796d626f6c', 'hex')
      let actual = spool.unconfirmed_transactions_change.data(buffer)
      expect(actual).to.eql({
        type: 0,
        transactionInfos: [
          {
            entityHash: '0000000000000000000000000000000000000000000000000000000000000000',
            merkleComponentHash: '0000000000000000000000000000000000000000000000000000000000000000',
            extractedAddresses: [
              'TCOWDGSMGLGNVPRLJGFMCA2LH7EMGDSW6GB26L3S'
            ],
            entity: {
              signature: '2879DE1383EF60810E30B4F563B7CCA420B195FF2D202097560F1ACCE6B70CE5BE05037CE82D382BD3DE51FF0586E40172EEBD828412A26847CB367439495B09',
              key: '9BE93593C699867F1B4F624FD37BC7FB93499CDEC9929088F2FF1031293960FF',
              version: 1,
              network: 152,
              type: 16718
            },
            transaction: {
              maxFee: '0',
              deadline: '1',
              namespaceId: 'A95F1F8A96159516',
              namespaceType: 0,
              name: 'symbol',
              duration: '0'
            }
          }
        ]
      })
    })

    it('should parse a unconfirmed transaction changes file', () => {
      let file = path.join(DATA_DIR, 'spool', 'unconfirmed_transactions_change', '000000000000012B.dat')
      let actual = spool.unconfirmed_transactions_change.file(file)
      expect(actual.transactionInfos[0].extractedAddresses[0]).to.equal('TCOWDGSMGLGNVPRLJGFMCA2LH7EMGDSW6GB26L3S')
    })

    it('should parse a unconfirmed transaction changes directory', () => {
      let directory = path.join(DATA_DIR, 'spool', 'unconfirmed_transactions_change')
      let actual = spool.unconfirmed_transactions_change.directory(directory)
      expect(Object.keys(actual)).to.eql(['000000000000012b.dat'])
      expect(actual['000000000000012b.dat'].transactionInfos[0].extractedAddresses[0]).to.equal('TCOWDGSMGLGNVPRLJGFMCA2LH7EMGDSW6GB26L3S')
    })
  })
})
