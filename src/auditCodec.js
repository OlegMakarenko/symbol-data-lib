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
 *  Codec to transform audit models to JSON.
 */

import CatbufferReader from './catbuffer'

// READERS

class AuditReader extends CatbufferReader {
  static solitary(data, fn) {
    let reader = new AuditReader(data)
    return reader.solitary(fn)
  }
}

// DIRECTORY UTILITIES

/**
 *  Read all files nested within folders in a directory.
 */
const readDirectory = (directory, codecName) => {
  let result = {}
  let subResult
  let directories = fs.readdirSync(directory).map(file => path.join(directory, file))
  for (let directory of directories) {
    result[path.basename(directory)] = subResult = {}
    let files = fs.readdirSync(directory)
    for (let file of files) {
      let data = fs.readFileSync(path.join(directory, file))
      subResult[file] = codec[codecName].file(data)
    }
  }

  return result
}

// CODEC

/**
 *  Codec for the spool stores.
 */
const codec = {
  block: {
    // Read a list of blocks from the file.
    file: data => {
      let reader = new AuditReader(data)
      let source = reader.uint32()
      let sourcePublicKey = reader.key()
      let blocks = reader.blocks()

      return {
        source,
        sourcePublicKey,
        blocks
      }
    },

    // Read all files in directory
    directory: directory => readDirectory(directory, 'block')
  },

  transaction: {
    // Read a list of transactions from the file.
    file: data => {
      let reader = new AuditReader(data)
      let source = reader.uint32()
      let sourcePublicKey = reader.key()
      let transactions = reader.transactions()

      return {
        source,
        sourcePublicKey,
        transactions
      }
    },

    // Read all files in directory
    directory: directory => readDirectory(directory, 'transaction')
  }
}

export default codec
