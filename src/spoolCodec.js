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

/**
 *  Codec to transform spool models to JSON.
 */

import Reader from './reader'

// CONSTANTS
const BLOCK_SAVED = 0
const BLOCKS_DROPPED = 1
const ADD_PARTIAL_TRANSACTIONS = 0
const REMOVE_PARTIAL_TRANSACTIONS = 1
const ADD_COSIGNATURE = 2
const SCORE_CHANGE = 0
const STATE_CHANGE = 1
const ADD_UNCONFIRMED_TRANSACTIONS = 0
const REMOVE_UNCONFIRMED_TRANSACTIONS = 1

// READERS

class SpoolReader extends Reader {
  // TODO(ahuszagh) here...
}

// CODEC

/**
 *  Codec for the spool stores.
 */
export default {
  block_change: data => {
    // TODO(ahuszagh) There's some sort of header I'm missing
    //  Hmmmm
    let reader = new SpoolReader(data)
    let type = reader.uint8()
    let value = {type}

    if (type === BLOCK_SAVED) {
      console.log(data)
//// 1. write constant size data
//outputStream.write({ reinterpret_cast<const uint8_t*>(&blockElement.Block), blockElement.Block.Size });
//outputStream.write(blockElement.EntityHash);
//outputStream.write(blockElement.GenerationHash);
//
//// 2. write transaction hashes
//WriteTransactionHashes(outputStream, blockElement.Transactions);
//
//// 3. write sub cache merkle roots
//WriteSubCacheMerkleRoots(outputStream, blockElement.SubCacheMerkleRoots);
      // if (blockElement.OptionalStatement) {
      // } else {
      // }
      // TODO(ahuszagh) Here...
    } else if (type === BLOCKS_DROPPED) {
      value.height = reader.uint64()
    } else {
      throw new Error(`invalid block change operation type, got ${type}`)
    }
    reader.validateEmpty()

    return value
  }
}

// TODO(ahuszagh) Here...

//0000000 e34d 0000 0000 0000
//0000008
