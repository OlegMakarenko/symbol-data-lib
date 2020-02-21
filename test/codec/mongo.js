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

describe('mongo', () => {
  // TODO(ahuszagh) Implement...
  describe('accountRestrictions', () => {})

  describe('accounts', () => {
    it('should parse a valid account', () => {
      let item = {
        account: {
          address: new MongoDb.Binary(Buffer.from('98AE5B94F7911CB302FE78E9CFDE21EF5A47174628055AC3AA', 'hex')),
          addressHeight: new MongoDb.Long(1, 0),
          publicKey: new MongoDb.Binary(Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')),
          publicKeyHeight: new MongoDb.Long(0, 0),
          accountType: 0,
          linkedAccountKey: new MongoDb.Binary(Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')),
          importances: [
            {
              value: new MongoDb.Long(2398580345, 86526),
              height: new MongoDb.Long(88846)
            }
          ],
          activityBuckets: [
            {
              startHeight: new MongoDb.Long(88846, 0),
              totalFeesPaid: new MongoDb.Long(0, 0),
              beneficiaryCount: 0,
              rawScore: new MongoDb.Long(2398580345, 86526)
            }
          ],
          mosaics: [
            {
              id: new MongoDb.Long(92423592, 1370066984),
              amount: new MongoDb.Long(833619904, 91176)
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

  describe('addressResolutionStatements', () => {})
  describe('blocks', () => {})

  describe('chainStatistic', () => {
    it('should parse a valid chain statistic', () => {
      let item = {
        current: {
          height: new MongoDb.Long(57549, 0),
          scoreLow: new MongoDb.Long(3899910630, 134312366),
          scoreHigh: new MongoDb.Long(0, 0)
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
