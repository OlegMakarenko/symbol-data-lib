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

import fs from 'fs'
import path from 'path'
import spool from './spool'

// Determine if a string contains only numbers.
const isNumeric = str => /^\d+$/.test(str)

// Get all subdirectories that are 5 digits long.
const blockDirectories = directory => {
  let files = fs.readdirSync(directory)
  return files
    .filter(file => file.length === 5 && isNumeric(file))
    .map(file => path.join(directory, file))
}

export default {
  // The block codec is the exact same as the block_sync one.
  // Only difference is the block codec may contain non-block
  // directories within it, those that do not match the /\d{5}/
  // pattern.
  file: file => spool.block_sync.file(file),

  directory: directory => {
    return spool.block_sync.fromDirectories(blockDirectories(directory))
  }
}
