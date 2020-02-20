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
import Level from '../../src/util/level'

const DATA_DIR = path.resolve(__dirname, '..', 'data')

describe('level', () => {
  it('should properly read data from AccountStateCache', async () => {
    let directory = path.join(DATA_DIR, 'statedb', 'AccountStateCache')
    let level = new Level(directory)
    let iterator = level.iterator()
    let item = await iterator.next()
    let key = Buffer.from('98fc1bb850dce0e512ca33b84057c37703f9ca4367d9e0ffc2', 'hex')
    let value = Buffer.from('010098fc1bb850dce0e512ca33b84057c37703f9ca4367d9e0ffc2010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000527bfd6b8eff66101000527bfd6b8eff6616025e9253a99010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex')
    expect(item.encodedKey).to.eql(key)
    expect(item.encodedValue).to.eql(value)
    expect(await level.get(key)).to.eql(value)
    expect(await level.size()).to.eql([23, 0])

    expect(level.isOpen).to.be.ok()
    expect(level.isClosed).to.not.be.ok()

    await level.close()

    expect(level.isOpen).to.not.be.ok()
    expect(level.isClosed).to.be.ok()
  })
})
