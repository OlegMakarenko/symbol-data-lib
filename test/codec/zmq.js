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
import zmq from '../../src/codec/zmq'

describe('zmq', () => {
  it('should parse a block topic', () => {
    let topic = Buffer.from('496ACA80E4D8F29F', 'hex')
    expect(zmq.topic(topic)).to.eql({channel: 'block'})

    topic = Buffer.from('B0B025EE8AD6205C', 'hex')
    expect(zmq.topic(topic)).to.eql({channel: 'dropBlocks'})
  })

  it('should parse a transaction topic', () => {
    let topic = Buffer.from('61984811DA06C4DDEC900173CF63375D9BF53D1594AF00E6F650', 'hex')
    expect(zmq.topic(topic)).to.eql({
      channel: 'transaction',
      address: 'TBEBDWQGYTO6ZEABOPHWGN25TP2T2FMUV4AON5SQ'
    })

    topic = Buffer.from('75984811DA06C4DDEC900173CF63375D9BF53D1594AF00E6F650', 'hex')
    expect(zmq.topic(topic)).to.eql({
      channel: 'addUnconfirmedTransaction',
      address: 'TBEBDWQGYTO6ZEABOPHWGN25TP2T2FMUV4AON5SQ'
    })

    topic = Buffer.from('72984811DA06C4DDEC900173CF63375D9BF53D1594AF00E6F650', 'hex')
    expect(zmq.topic(topic)).to.eql({
      channel: 'removeUnconfirmedTransaction',
      address: 'TBEBDWQGYTO6ZEABOPHWGN25TP2T2FMUV4AON5SQ'
    })

    topic = Buffer.from('73984811DA06C4DDEC900173CF63375D9BF53D1594AF00E6F650', 'hex')
    expect(zmq.topic(topic)).to.eql({
      channel: 'transactionStatus',
      address: 'TBEBDWQGYTO6ZEABOPHWGN25TP2T2FMUV4AON5SQ'
    })

    topic = Buffer.from('70984811DA06C4DDEC900173CF63375D9BF53D1594AF00E6F650', 'hex')
    expect(zmq.topic(topic)).to.eql({
      channel: 'addPartialTransaction',
      address: 'TBEBDWQGYTO6ZEABOPHWGN25TP2T2FMUV4AON5SQ'
    })

    topic = Buffer.from('71984811DA06C4DDEC900173CF63375D9BF53D1594AF00E6F650', 'hex')
    expect(zmq.topic(topic)).to.eql({
      channel: 'removePartialTransaction',
      address: 'TBEBDWQGYTO6ZEABOPHWGN25TP2T2FMUV4AON5SQ'
    })

    topic = Buffer.from('63984811DA06C4DDEC900173CF63375D9BF53D1594AF00E6F650', 'hex')
    expect(zmq.topic(topic)).to.eql({
      channel: 'cosignature',
      address: 'TBEBDWQGYTO6ZEABOPHWGN25TP2T2FMUV4AON5SQ'
    })
  })

  it('should parse a block message', () => {
    let message = Buffer.from('300100000000000071FF0F37B85E130C8E06B929FA260CE1D5675AB0F23699C913C9D2C55810156790CA679E19AC30835F2AD7B71DCCA4511E15055C6C1C616D682EFA7ABFB113014BADBBB46F335534C8F2DA93CDCEA7C74452188D6A8E322720AF30A6FB42DABF0000000001984381B1DE0100000000004E277E300200000000A0724E18090000D428507F41E329E61218BB03F19F98F723FBB9C4BA3E876F62E5B6C17F8C69F60000000000000000000000000000000000000000000000000000000000000000089F01600FDCD862676CBBD554BA795E2706D4A5D0CE8CD64E7660D9CED01CE872CCB5EC4058D1F74B1A40F9566C426E80B1E375D7F2CA34E41BBB5CE0BC4D4F3D7FD669DB90879C3AF7EEA98EA8C24460E2F6C0AAF71111C61E5F303949004B0000000000000000', 'hex')
    expect(zmq.block(message)).to.eql({
      entity: {
        signature: '71FF0F37B85E130C8E06B929FA260CE1D5675AB0F23699C913C9D2C55810156790CA679E19AC30835F2AD7B71DCCA4511E15055C6C1C616D682EFA7ABFB11301',
        key: '4BADBBB46F335534C8F2DA93CDCEA7C74452188D6A8E322720AF30A6FB42DABF',
        version: 1,
        network: 152,
        type: 33091
      },
      block: {
        height: '122545',
        timestamp: '9403508558',
        difficulty: '10000000000000',
        previousBlockHash: 'D428507F41E329E61218BB03F19F98F723FBB9C4BA3E876F62E5B6C17F8C69F6',
        transactionsHash: '0000000000000000000000000000000000000000000000000000000000000000',
        receiptsHash: '089F01600FDCD862676CBBD554BA795E2706D4A5D0CE8CD64E7660D9CED01CE8',
        stateHash: '72CCB5EC4058D1F74B1A40F9566C426E80B1E375D7F2CA34E41BBB5CE0BC4D4F',
        beneficiaryPublicKey: '3D7FD669DB90879C3AF7EEA98EA8C24460E2F6C0AAF71111C61E5F303949004B',
        feeMultiplier: 0
      }
    })
  })

  it('should parse a block message with an invalid size-prefix', () => {
    let message = Buffer.from('E101000000000000F065EFCD1A9A4AC749558B2F97852295BAF7A9C9F4777D353456778B7813D3DC831B9973A0E890E7D06D3C5A5D1C871B0315C7314176918FF99FE52A0525090E4BADBBB46F335534C8F2DA93CDCEA7C74452188D6A8E322720AF30A6FB42DABF00000000019843819AB901000000000097E5BF260200000000A0724E18090000333FBC686B10C902AC9F4BF2B8E0C23242228898753308DA997F807FEFD8BCEF40DF5F4DA93CBF7999CAC4AD8B9BD98FC4228A58981E1BA829E599F47FCF8AA657A75593C1EDDA09AC3DFCEFD72847EDC8A3C17AD03331C069E7348415F99B4BE89558325DA0B8263039DBA8FD0ED5B041697377327D433EA67F51827F44BFF13D7FD669DB90879C3AF7EEA98EA8C24460E2F6C0AAF71111C61E5F303949004B1116000000000000', 'hex')
    expect(zmq.block(message)).to.eql({
      entity: {
        signature: 'F065EFCD1A9A4AC749558B2F97852295BAF7A9C9F4777D353456778B7813D3DC831B9973A0E890E7D06D3C5A5D1C871B0315C7314176918FF99FE52A0525090E',
        key: '4BADBBB46F335534C8F2DA93CDCEA7C74452188D6A8E322720AF30A6FB42DABF',
        version: 1,
        network: 152,
        type: 33091
      },
      block: {
        height: '113050',
        timestamp: '9240044951',
        difficulty: '10000000000000',
        previousBlockHash: '333FBC686B10C902AC9F4BF2B8E0C23242228898753308DA997F807FEFD8BCEF',
        transactionsHash: '40DF5F4DA93CBF7999CAC4AD8B9BD98FC4228A58981E1BA829E599F47FCF8AA6',
        receiptsHash: '57A75593C1EDDA09AC3DFCEFD72847EDC8A3C17AD03331C069E7348415F99B4B',
        stateHash: 'E89558325DA0B8263039DBA8FD0ED5B041697377327D433EA67F51827F44BFF1',
        beneficiaryPublicKey: '3D7FD669DB90879C3AF7EEA98EA8C24460E2F6C0AAF71111C61E5F303949004B',
        feeMultiplier: 5649
      }
    })
  })

  it('should parse a drop blocks message', () => {
    let message = Buffer.from('DADE010000000000', 'hex')
    expect(zmq.dropBlocks(message)).to.eql({
      height: '122586'
    })
  })

  it('should parse a transaction message', () => {
    let message = Buffer.from('98000000000000002879de1383ef60810e30b4f563b7cca420b195ff2d202097560f1acce6b70ce5be05037ce82d382bd3de51ff0586e40172eebd828412a26847cb367439495b099be93593c699867f1b4f624fd37bc7fb93499cdec9929088f2ff1031293960ff0000000001984e41000000000000000001000000000000000000000000000000169515968a1f5fa9000673796d626f6cB6CC1792D5CB2B95765961E34AC1B938055154B8E0514B0944B1ACE547A4E181074211776A2CEBBB80F25FED1240B1E198726851049DAC3A53E64D8E2278C99F0200000000000000', 'hex')
    expect(zmq.transaction(message)).to.eql({
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
      },
      entityHash: 'B6CC1792D5CB2B95765961E34AC1B938055154B8E0514B0944B1ACE547A4E181',
      merkleComponentHash: '074211776A2CEBBB80F25FED1240B1E198726851049DAC3A53E64D8E2278C99F',
      height: '2'
    })
  })

  it('should parse an add unconfirmed transaction message', () => {
    let message = Buffer.from('98000000000000002879de1383ef60810e30b4f563b7cca420b195ff2d202097560f1acce6b70ce5be05037ce82d382bd3de51ff0586e40172eebd828412a26847cb367439495b099be93593c699867f1b4f624fd37bc7fb93499cdec9929088f2ff1031293960ff0000000001984e41000000000000000001000000000000000000000000000000169515968a1f5fa9000673796d626f6cB6CC1792D5CB2B95765961E34AC1B938055154B8E0514B0944B1ACE547A4E181074211776A2CEBBB80F25FED1240B1E198726851049DAC3A53E64D8E2278C99F0200000000000000', 'hex')
    expect(zmq.addUnconfirmedTransaction(message)).to.eql({
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
      },
      entityHash: 'B6CC1792D5CB2B95765961E34AC1B938055154B8E0514B0944B1ACE547A4E181',
      merkleComponentHash: '074211776A2CEBBB80F25FED1240B1E198726851049DAC3A53E64D8E2278C99F',
      height: '2'
    })
  })

  it('should parse a remove unconfirmed transaction message', () => {
    let message = Buffer.from('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006', 'hex')
    expect(zmq.removeUnconfirmedTransaction(message)).to.eql({
      hash: '3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006'
    })
  })

  it('should parse a transaction status message', () => {
    let message = Buffer.from('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006000000004407C6DE01000000', 'hex')
    expect(zmq.transactionStatus(message)).to.eql({
      hash: '3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006',
      status: 0,
      timestamp: '8032487236'
    })
  })

  it('should parse an add partial transaction message', () => {
    let message = Buffer.from('98000000000000002879de1383ef60810e30b4f563b7cca420b195ff2d202097560f1acce6b70ce5be05037ce82d382bd3de51ff0586e40172eebd828412a26847cb367439495b099be93593c699867f1b4f624fd37bc7fb93499cdec9929088f2ff1031293960ff0000000001984e41000000000000000001000000000000000000000000000000169515968a1f5fa9000673796d626f6cB6CC1792D5CB2B95765961E34AC1B938055154B8E0514B0944B1ACE547A4E181074211776A2CEBBB80F25FED1240B1E198726851049DAC3A53E64D8E2278C99F0200000000000000', 'hex')
    expect(zmq.addPartialTransaction(message)).to.eql({
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
      },
      entityHash: 'B6CC1792D5CB2B95765961E34AC1B938055154B8E0514B0944B1ACE547A4E181',
      merkleComponentHash: '074211776A2CEBBB80F25FED1240B1E198726851049DAC3A53E64D8E2278C99F',
      height: '2'
    })
  })

  it('should parse a remove partial transaction message', () => {
    let message = Buffer.from('3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006', 'hex')
    expect(zmq.removePartialTransaction(message)).to.eql({
      hash: '3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006'
    })
  })

  it('should parse a cosignature message', () => {
    let message = Buffer.from('A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF6305780C8DF9D46BA2BCF029DCC5D3BF55FE1CB5BE7ABCF30387C4637DDEDFC2152703CA0AD95F21BB9B942F3CC52FCFC2064C7B84CF60D1A9E69195F1943156C073D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006', 'hex')
    expect(zmq.cosignature(message)).to.eql({
      signerPublicKey: 'A5F82EC8EBB341427B6785C8111906CD0DF18838FB11B51CE0E18B5E79DFF630',
      signature: '5780C8DF9D46BA2BCF029DCC5D3BF55FE1CB5BE7ABCF30387C4637DDEDFC2152703CA0AD95F21BB9B942F3CC52FCFC2064C7B84CF60D1A9E69195F1943156C07',
      parentHash: '3D28C804EDD07D5A728E5C5FFEC01AB07AFA5766AE6997B38526D36015A4D006'
    })
  })
})
