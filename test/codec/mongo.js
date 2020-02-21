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
import MongoDb from 'mongodb'
import mongo from '../../src/codec/mongo'

// Create MongoDB binary from hex
const binary = hex => new MongoDb.Binary(Buffer.from(hex, 'hex'))

// Create MongoDB long.
const long = (lo, hi) => new MongoDb.Long(lo, hi)

describe('mongo', () => {
  describe('accountRestrictions', () => {
    it('should parse a valid account restriction', () => {
      let item = {
        accountRestrictions: {
            address: binary('98AE5B94F7911CB302FE78E9CFDE21EF5A47174628055AC3AA'),
            restrictions: [
              {
                restrictionFlags: 0x1,
                values: [
                  binary('983DA4AEC0AE94124F3BC0147615FA6FF1E095DA58C815DB53')
                ]
              },
              {
                restrictionFlags: 0x8002,
                values: [
                  binary('2FF881484A4D817D'),
                  binary('80781853CA114345')
                ]
              },
              {
                restrictionFlags: 0xC004,
                values: [
                  binary('4E42')
                ]
              }
            ]
        }
      }
      expect(mongo.accountRestrictions(item)).to.eql({
        accountRestrictions: {
          address: 'TCXFXFHXSEOLGAX6PDU47XRB55NEOF2GFACVVQ5K',
          restrictions: [
            {
              restrictionFlags: 1,
              values: [
                'TA62JLWAV2KBETZ3YAKHMFP2N7Y6BFO2LDEBLW2T'
              ]
            },
            {
              restrictionFlags: 0x8002,
              values: [
                '7D814D4A4881F82F',
                '454311CA53187880'
              ]
            },
            {
              restrictionFlags: 0xC004,
              values: [
                0x424E
              ]
            }
          ]
        }
      })
    })
  })

  describe('accounts', () => {
    it('should parse a valid account', () => {
      let item = {
        account: {
          address: binary('98AE5B94F7911CB302FE78E9CFDE21EF5A47174628055AC3AA'),
          addressHeight: long(1, 0),
          publicKey: binary('0000000000000000000000000000000000000000000000000000000000000000'),
          publicKeyHeight: long(0, 0),
          accountType: 0,
          linkedAccountKey: binary('0000000000000000000000000000000000000000000000000000000000000000'),
          importances: [
            {
              value: long(2398580345, 86526),
              height: long(88846)
            }
          ],
          activityBuckets: [
            {
              startHeight: long(88846, 0),
              totalFeesPaid: long(0, 0),
              beneficiaryCount: 0,
              rawScore: long(2398580345, 86526)
            }
          ],
          mosaics: [
            {
              id: long(92423592, 1370066984),
              amount: long(833619904, 91176)
            }
          ]
        }
      }
      expect(mongo.accounts(item)).to.eql({
        account: {
          address: 'TCXFXFHXSEOLGAX6PDU47XRB55NEOF2GFACVVQ5K',
          addressHeight: '1',
          publicKey: '0000000000000000000000000000000000000000000000000000000000000000',
          publicKeyHeight: '0',
          accountType: 0,
          linkedAccountKey: '0000000000000000000000000000000000000000000000000000000000000000',
          importances: [
            {
              height: '88846',
              value: '371628738834041'
            }
          ],
          activityBuckets: [
            {
              beneficiaryCount: 0,
              rawScore: '371628738834041',
              startHeight: '88846',
              totalFeesPaid: '0'
            }
          ],
          mosaics: [
            {
              amount: '391598771800000',
              mosaicId: '51A99028058245A8'
            }
          ]
        }
      })
    })
  })

  describe('addressResolutionStatements', () => {
    it('should parse a valid address resolution statement', () => {
      let item = {
        statement : {
          height : long(31929, 0),
          unresolved : binary('992BE6B9E9B101B8BB00000000000000000000000000000000'),
          resolutionEntries : [
            {
              source: {
                primaryId: 1,
                secondaryId: 0
              },
              resolved: binary('987FE7471CC37FB9D896B8B22F777F43B329C5C1C266C6D5B7')
            }
          ]
        }
      }
      expect(mongo.addressResolutionStatements(item)).to.eql({
        statement : {
          height: '31929',
          unresolved : 'TEV6NOPJWEA3ROYAAAAAAAAAAAAAAAAAAAAAAAAA',
          resolutionEntries : [
            {
              source: {
                primaryId: 1,
                secondaryId: 0
              },
              resolved: 'TB76ORY4YN73TWEWXCZC6537IOZSTROBYJTMNVNX'
            }
          ]
        }
      })
    })
  })

  // TODO(ahuszagh) Implement...
  describe('blocks', () => {})

  describe('chainStatistic', () => {
    it('should parse a valid chain statistic', () => {
      let item = {
        current: {
          height: long(57549, 0),
          scoreLow: long(3899910630, 134312366),
          scoreHigh: long(0, 0)
        }
      }
      expect(mongo.chainStatistic(item)).to.eql({
        current: {
          height: '57549',
          scoreLow: '576867223318292966',
          scoreHigh: '0'
        }
      })
    })
  })

  // TODO(ahuszagh) Implement...
  describe('hashLocks', () => {})
  describe('metadata', () => {})
  describe('mosaicResolutionStatements', () => {})
  describe('mosaicRestrictions', () => {})
  describe('mosaics', () => {})
  describe('multisigs', () => {})
  describe('namespaces', () => {})
  describe('partialTransactions', () => {})
  describe('secretLocks', () => {})
  describe('transactionStatements', () => {})
  describe('transactionStatuses', () => {})
  describe('transactions', () => {})
  describe('unconfirmedTransactions', () => {})
})
