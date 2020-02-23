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
      let buffer = Buffer.from('41000000590200003900000000000000C1B4E25B491D6552F78EDE5A77CB74BB1743955500FB7FAB610338B639C2F76303000000DC1E9800084331423445323542', 'hex')
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

  describe('pullBlock', () => {
    it('should parse a pull blocks request', () => {
      let buffer = Buffer.from('0200000000000000', 'hex')
      expect(tcp.pullBlock.request(buffer)).to.eql({
        height: '2'
      })
    })

    it('should parse a pull blocks response', () => {
      let buffer = Buffer.from('300100000000000067B4D79E8AE271DD7C3F0A8E8EE34E1AC08659FB200ED79D7A5B24CB0F97894A3FEA8FCEE12876B634284F2BADC2FF9A4C302D806FAABD7777B3E07D9713B201C151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B787000000000198438102000000000000000CD430B00100000000407A10F35A00006E5DC4D3B6027AA2CF77CCD0222DE9E85536385829C72D77189F214C1AC8109800000000000000000000000000000000000000000000000000000000000000002C58E870D91B7FD590C2C5EBB85DE610D6B3C6B65C71CE1CE2EEC207A993640989360E6E1B87FB725DE8A57E98E106C1CB10950BCA29FB3D6D31B7AF025FD8E8C151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B7870000000000000000', 'hex')
      expect(tcp.pullBlock.response(buffer)).to.eql({
        entity: {
          signature: '67B4D79E8AE271DD7C3F0A8E8EE34E1AC08659FB200ED79D7A5B24CB0F97894A3FEA8FCEE12876B634284F2BADC2FF9A4C302D806FAABD7777B3E07D9713B201',
          key: 'C151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B787',
          version: 1,
          network: 0x98,
          type: 0x8143
        },
        block: {
          height: '2',
          timestamp: '7250957324',
          difficulty: '100000000000000',
          previousBlockHash: '6E5DC4D3B6027AA2CF77CCD0222DE9E85536385829C72D77189F214C1AC81098',
          transactionsHash: '0000000000000000000000000000000000000000000000000000000000000000',
          receiptsHash: '2C58E870D91B7FD590C2C5EBB85DE610D6B3C6B65C71CE1CE2EEC207A9936409',
          stateHash: '89360E6E1B87FB725DE8A57E98E106C1CB10950BCA29FB3D6D31B7AF025FD8E8',
          beneficiaryPublicKey: 'C151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B787',
          feeMultiplier: 0
        }
      })
    })
  })

  describe('chainInfo', () => {
    it('should parse a chain info request', () => {
      let buffer = Buffer.from('', 'hex')
      expect(tcp.chainInfo.request(buffer)).to.eql({})
    })

    it('should parse a chain info response', () => {
      let buffer = Buffer.from('D1E80000000000000000000000000000DBE03DB783584A08', 'hex')
      expect(tcp.chainInfo.response(buffer)).to.eql({
        height: '59601',
        scoreHigh: '0',
        scoreLow: '597387223318257883'
      })

      buffer = Buffer.from('E1DD0000000000000000000000000000FA9B88B1A9DEE607', 'hex')
      expect(tcp.chainInfo.response(buffer)).to.eql({
        height: '56801',
        scoreHigh: '0',
        scoreLow: '569387223318305786'
      })
    })
  })

  describe('blockHashes', () => {
    it('should parse a block hashes request', () => {
      let buffer = Buffer.from('040000000000000002000000', 'hex')
      expect(tcp.blockHashes.request(buffer)).to.eql({
        height: '4',
        hashes: 2
      })
    })

    it('should parse a block hashes response', () => {
      let buffer = Buffer.from('6D66277B048C6697530DB6E9DFEE8F468106ED21BC9B087B5327D4DF3027C6F0102B28117C238D208F96CE46B79834D94212DD7C5CC840E9ED1356720393A0BE', 'hex')
      expect(tcp.blockHashes.response(buffer)).to.eql([
        '6D66277B048C6697530DB6E9DFEE8F468106ED21BC9B087B5327D4DF3027C6F0',
        '102B28117C238D208F96CE46B79834D94212DD7C5CC840E9ED1356720393A0BE'
      ])
    })
  })

  describe('pullBlocks', () => {
    it('should parse a pull blocks request', () => {
      let buffer = Buffer.from('040000000000000002000000E8030000', 'hex')
      expect(tcp.pullBlocks.request(buffer)).to.eql({
        height: '4',
        blocks: 2,
        bytes: 1000
      })
    })

    it('should parse a pull blocks response', () => {
      let buffer = Buffer.from('3001000000000000A8B90CE9AF2A5835C04D6069E38F18D5B5055D2B759F2DB2FE8217FF8699D6F3E9322238A88970F9CB34BD4F882F852F7938CF4A539B887BB2D92DAF5E56000DC151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B787000000000198438104000000000000007FE931B00100000000E430F71452000053C22EAD88155FDA9D62AF2CE6DE2208A08443E7BDEDD2B278FCD1E8433C571500000000000000000000000000000000000000000000000000000000000000002C58E870D91B7FD590C2C5EBB85DE610D6B3C6B65C71CE1CE2EEC207A9936409926458EFE34A53659B60718FCC4047B11D77791CE7868F9E4C9CD623D25AF163C151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B78700000000000000003001000000000000549BC4DC8BEA332A9E43D2B06600A460B76E3CA39B114AE26EB0C0DA90927C55872C0E21805A727F643629E251B7E9AF39E9218098535ABFC6963506660CDA0CC151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B787000000000198438105000000000000002E7632B001000000003F3B51FA4D00006D66277B048C6697530DB6E9DFEE8F468106ED21BC9B087B5327D4DF3027C6F000000000000000000000000000000000000000000000000000000000000000002C58E870D91B7FD590C2C5EBB85DE610D6B3C6B65C71CE1CE2EEC207A99364093837BF257F57D37ACE69D74CEC955D710B672A90E5416CB0FFEAAD17BA4599ACC151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B7870000000000000000', 'hex')
      expect(tcp.pullBlocks.response(buffer)).to.eql([
        {
          entity: {
            signature: 'A8B90CE9AF2A5835C04D6069E38F18D5B5055D2B759F2DB2FE8217FF8699D6F3E9322238A88970F9CB34BD4F882F852F7938CF4A539B887BB2D92DAF5E56000D',
            key: 'C151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B787',
            version: 1,
            network: 152,
            type: 33091
          },
          block: {
            height: '4',
            timestamp: '7251028351',
            difficulty: '90250000000000',
            previousBlockHash: '53C22EAD88155FDA9D62AF2CE6DE2208A08443E7BDEDD2B278FCD1E8433C5715',
            transactionsHash: '0000000000000000000000000000000000000000000000000000000000000000',
            receiptsHash: '2C58E870D91B7FD590C2C5EBB85DE610D6B3C6B65C71CE1CE2EEC207A9936409',
            stateHash: '926458EFE34A53659B60718FCC4047B11D77791CE7868F9E4C9CD623D25AF163',
            beneficiaryPublicKey: 'C151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B787',
            feeMultiplier: 0
          }
        },
        {
          entity: {
            signature: '549BC4DC8BEA332A9E43D2B06600A460B76E3CA39B114AE26EB0C0DA90927C55872C0E21805A727F643629E251B7E9AF39E9218098535ABFC6963506660CDA0C',
            key: 'C151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B787',
            version: 1,
            network: 152,
            type: 33091
          },
          block: {
            height: '5',
            timestamp: '7251064366',
            difficulty: '85737500000000',
            previousBlockHash: '6D66277B048C6697530DB6E9DFEE8F468106ED21BC9B087B5327D4DF3027C6F0',
            transactionsHash: '0000000000000000000000000000000000000000000000000000000000000000',
            receiptsHash: '2C58E870D91B7FD590C2C5EBB85DE610D6B3C6B65C71CE1CE2EEC207A9936409',
            stateHash: '3837BF257F57D37ACE69D74CEC955D710B672A90E5416CB0FFEAAD17BA4599AC',
            beneficiaryPublicKey: 'C151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B787',
            feeMultiplier: 0
          }
        }
      ])
    })
  })

  describe('pullNodeInfo', () => {
    it('should parse a node info request', () => {
      let buffer = Buffer.from('', 'hex')
      expect(tcp.pullNodeInfo.request(buffer)).to.eql({})
    })

    it('should parse a node info response', () => {
      let buffer = Buffer.from('3900000000000000C1B4E25B491D6552F78EDE5A77CB74BB1743955500FB7FAB610338B639C2F76303000000DC1E9800084331423445323542', 'hex')
      expect(tcp.pullNodeInfo.response(buffer)).to.eql({
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

  describe('pullNodePeers', () => {
    it('should parse a node peers request', () => {
      let buffer = Buffer.from('', 'hex')
      expect(tcp.pullNodePeers.request(buffer)).to.eql({})
    })

    it('should parse a node peers response', () => {
      let buffer = Buffer.from('54000000000000008D270FA5E8E30D01182E8A339A31818856E30ABD0249662CFBA43CE8610333D303000000DC1E980E1539352E3231362E3231352E323435436F6C6F6D626961546573746E65744E6F646531305500000000000000318FE9A12487C0C518D35C09DE12D2AB8FF194638FA05F71E9E3619DA30E3F5503000000DC1E980E163134302E3232372E3132332E3932282A5E2D5E292F53796D626F6C2D746573746E6F6465', 'hex')
      expect(tcp.pullNodePeers.response(buffer)).to.eql([
        {
          version: 0,
          publicKey: '8D270FA5E8E30D01182E8A339A31818856E30ABD0249662CFBA43CE8610333D3',
          roles: 3,
          port: 7900,
          networkIdentifier: 0x98,
          host: '95.216.215.245',
          friendlyName: 'ColombiaTestnetNode10'
        },
        {
          version: 0,
          publicKey: '318FE9A12487C0C518D35C09DE12D2AB8FF194638FA05F71E9E3619DA30E3F55',
          roles: 3,
          port: 7900,
          networkIdentifier: 0x98,
          host: '140.227.123.92',
          friendlyName: '(*^-^)/Symbol-testnode'
        }
      ])
    })
  })

  describe('timeSync', () => {
    it('should parse a time sync request', () => {
      let buffer = Buffer.from('', 'hex')
      expect(tcp.timeSync.request(buffer)).to.eql({})
    })

    it('should parse a time sync response', () => {
      let buffer = Buffer.from('B11ABF1602000000B11ABF1602000000', 'hex')
      expect(tcp.timeSync.response(buffer)).to.eql({
        communicationTimestamps: {
          sendTimestamp: '8971557553',
          receiveTimestamp: '8971557553'
        }
      })
    })
  })
})
