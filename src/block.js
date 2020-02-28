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
 *  Codec to transform block models to JSON.
 */

import fs from 'fs'
import path from 'path'
import defaults from './defaults'
import blockCodec from './codec/block'

// Determine if a string contains only numbers.
const isNumeric = str => /^\d+$/.test(str)

// Get all subdirectories that are 5 digits long.
const blockDirectories = directory => {
  let files = fs.readdirSync(directory)
  return files
    .filter(file => file.length === 5 && isNumeric(file))
    .sort()
    .reverse()
}

// API

/**
 *  Dump config data to JSON.
 *
 *  @param options {Object}       - Options to specify dump parameters.
 *    @field dataDir {String}     - Path to the catapult data directory.
 *    @field limit {Number}       - Maximum number of files to dump.
 *    @field verbose {Boolean}    - Display debug information.
 */
const dump = async options => {
  // Config
  let dataDir = defaults.dataDir(options)
  let limit = defaults.limit(options) || Number.MAX_SAFE_INTEGER

  // Process all files in the block directories.
  let result = {}
  let directories = blockDirectories(dataDir)
  for (let directory of directories) {
    result[directory] = {}
    let files = fs.readdirSync(path.join(dataDir, directory))
      .sort()
      .reverse()
    for (let file of files) {
      result[directory][file] = blockCodec.file(path.join(dataDir, directory, file))
      --limit

      // Exhausted our limit, return early.
      if (limit === 0) {
        return result
      }
    }
  }

  return result
}

export default {
  dump
}
