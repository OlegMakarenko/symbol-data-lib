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
import mongoCodec from '../src/mongoCodec'

describe('mongo', () => {
  // TODO(ahuszagh) Implement...
  describe('accountRestrictions', () => {})
  describe('accounts', () => {})
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
      expect(mongoCodec.chainStatistic(item)).to.eql({
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
