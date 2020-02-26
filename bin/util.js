#!/usr/bin/env node
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
 *  Shared utilities for the symbol-data-lib scripts.
 */

import fs from 'fs'

/**
 *  Log error and terminate with non-zero exit code.
 */
export const logError = error => {
  console.error(error)
  process.exit(1)
}

/**
 *  Print JSON result to output or stdout.
 */
export const printJson = (result, output) => {
  let json = JSON.stringify(result, null, 4) + '\n'
  if (output !== undefined) {
    fs.writeFileSync(output, json)
  } else {
    process.stdout.write(json)
  }
}

/**
 *  Parse JSON from string or file.
 */
export const readJson = data => {
  try {
    // Try parsing the data as a JSON literal.
    return JSON.parse(data)
  } catch {
    // Not a valid JSON literal, provide a file.
    return JSON.parse(fs.readFileSync(data, 'utf8'))
  }
}
