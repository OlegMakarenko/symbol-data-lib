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

  it('should parse a drop blocks message', () => {
    let message = Buffer.from('DADE010000000000', 'hex')
    expect(zmq.dropBlocks(message)).to.eql({
      height: '122586'
    })
  })

  it('should parse a transaction message', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a add unconfirmed transaction message', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a remove unconfirmed transaction message', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a transaction status message', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a add partial transaction message', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a remove partial transaction message', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse a cosignature message', () => {
    // TODO(ahuszagh) Implement...
  })
})
