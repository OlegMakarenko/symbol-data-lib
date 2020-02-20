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
import blockCodec from '../src/blockCodec'

const DATA_DIR = path.resolve(__dirname, 'data')

describe('block', () => {
  it('should parse a directory', () => {
    const directory = path.join(DATA_DIR)
    let actual = blockCodec.directory(directory)
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
