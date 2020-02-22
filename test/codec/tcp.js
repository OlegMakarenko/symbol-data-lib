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
import constants from '../../src/codec/constants'
import tcp from '../../src/codec/tcp'

describe('tcp', () => {
  describe('header', () => {
    it('should parse a server challenge request', () => {
      let buffer = Buffer.from('4800000001000000CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', 'hex')
      expect(tcp.header(buffer)).to.eql({
        type: constants.serverChallenge,
        payload: Buffer.from('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', 'hex')
      })
    })

    it('should parse a server challenge response', () => {
      let buffer = Buffer.from('A900000001000000CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE01', 'hex')
      expect(tcp.header(buffer)).to.eql({
        type: constants.serverChallenge,
        payload: Buffer.from('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE01', 'hex')
      })
    })

    it('should parse a client challenge request', () => {
      let buffer = Buffer.from('4800000002000000CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', 'hex')
      expect(tcp.header(buffer)).to.eql({
        type: constants.clientChallenge,
        payload: Buffer.from('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', 'hex')
      })
    })

    it('should parse a node info request', () => {
      let buffer = Buffer.from('0800000059020000', 'hex')
      expect(tcp.header(buffer)).to.eql({
        type: constants.nodeDiscoveryPullPing,
        payload: Buffer.from('', 'hex')
      })
    })

    it('should parse a node info response', () => {
      let buffer = Buffer.from('41000000590200003900000000000000c1b4e25b491d6552f78ede5a77cb74bb1743955500fb7fab610338b639c2f76303000000dc1e9800084331423445323542', 'hex')
      expect(tcp.header(buffer)).to.eql({
        type: constants.nodeDiscoveryPullPing,
        payload: Buffer.from('3900000000000000C1B4E25B491D6552F78EDE5A77CB74BB1743955500FB7FAB610338B639C2F76303000000DC1E9800084331423445323542', 'hex')
      })
    })
  })

  describe('serverChallenge', () => {
    it('should parse a server challenge request', () => {
      let buffer = Buffer.from('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', 'hex')
      expect(tcp.serverChallenge.request(buffer)).to.eql({
        challenge: 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'
      })
    })

    it('should parse a server challenge response', () => {
      let buffer = Buffer.from('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE01', 'hex')
      expect(tcp.serverChallenge.response(buffer)).to.eql({
        challenge: 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
        signature: 'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        publicKey: 'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
        securityMode: 1
      })
    })
  })

  describe('clientChallenge', () => {
    it('should parse a client challenge request', () => {
      expect(() => tcp.clientChallenge.request(undefined)).to.throwException()
    })

    it('should parse a client challenge response', () => {
      let buffer = Buffer.from('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', 'hex')
      expect(tcp.clientChallenge.response(buffer)).to.eql({
        challenge: 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'
      })
    })
  })

  describe('nodeInfo', () => {
    it('should parse a node info request', () => {
      let buffer = Buffer.from('', 'hex')
      expect(tcp.nodeInfo.request(buffer)).to.eql({})
    })

    it('should parse a node info response', () => {
      let buffer = Buffer.from('3900000000000000C1B4E25B491D6552F78EDE5A77CB74BB1743955500FB7FAB610338B639C2F76303000000DC1E9800084331423445323542', 'hex')
      expect(tcp.nodeInfo.response(buffer)).to.eql({
        version: 0,
        publicKey: 'C1B4E25B491D6552F78EDE5A77CB74BB1743955500FB7FAB610338B639C2F763',
        roles: 3,
        port: 7900,
        networkIdentifier: 0x98,
        host: '',
        friendlyName: 'C1B4E25B'
      })
    })
  })

  describe('nodePeers', () => {
    it('should parse a node peers request', () => {
      let buffer = Buffer.from('', 'hex')
      expect(tcp.nodePeers.request(buffer)).to.eql({})
    })

    it('should parse a node peers response', () => {
      let buffer = Buffer.from('54000000000000008D270FA5E8E30D01182E8A339A31818856E30ABD0249662CFBA43CE8610333D303000000DC1E980E1539352E3231362E3231352E323435436F6C6F6D626961546573746E65744E6F646531305500000000000000318FE9A12487C0C518D35C09DE12D2AB8FF194638FA05F71E9E3619DA30E3F5503000000DC1E980E163134302E3232372E3132332E3932282A5E2D5E292F53796D626F6C2D746573746E6F6465', 'hex')
      expect(tcp.nodePeers.response(buffer)).to.eql([
        {
          version: 0,
          publicKey: '8D270FA5E8E30D01182E8A339A31818856E30ABD0249662CFBA43CE8610333D3',
          roles: 3,
          port: 7900,
          networkIdentifier: 152,
          host: '95.216.215.245',
          friendlyName: 'ColombiaTestnetNode10'
        },
        {
          version: 0,
          publicKey: '318FE9A12487C0C518D35C09DE12D2AB8FF194638FA05F71E9E3619DA30E3F55',
          roles: 3,
          port: 7900,
          networkIdentifier: 152,
          host: '140.227.123.92',
          friendlyName: '(*^-^)/Symbol-testnode'
        }
      ])
    })
  })
})
