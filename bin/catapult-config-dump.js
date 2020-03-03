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

import yargs from 'yargs'
import { logError, printJson } from './util'
import symbol from '../src'
import defaults from '../src/defaults'

// ARGUMENTS
// ---------

const options = yargs
  .command(
    'catapult-config-dump [OPTION...]',
    'Dump config data to JSON'
  )
  // Example
  .example(
    'catapult-config-dump --collection database',
    'Dump the database configuration file as JSON.'
  )
  // Parameters.
  .option('config-dir', {
    alias: 'd',
    type: 'string',
    describe: 'Directory for the configuration files.',
    default: defaults.configDir()
  })
  .option('collection', {
    alias: 'c',
    type: 'string',
    describe: (
      'Name of collection(s) to dump.\n'
      + 'Multiple collections can be provided with comma separators.\n'
      + 'Valid collections names:\n- all\n- '
      + symbol.config.COLLECTIONS.join('\n- ')
    )
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    describe: 'Write to output file rather than stdout.'
  })
  // Help and verbose.
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
    default: defaults.verbose()
  })
  // Validation.
  .demandOption('collection', 'Please provide a collection name to dump.')
  // Parse arguments.
  .parse()

// Display verbose information.
if (options.verbose) {
  console.info('Running catapult-config-dump with: ')
  console.info(`    collection   = ${options.collection}`)
  console.info(`    config-dir   = ${options.configDir}`)
  console.info(`    output       = ${options.output ? options.output : 'stdout'}`)
}

// Validate the collection name is supported.
if (!symbol.config.isValidCollection(options.collection)) {
  throw new Error(`collection name ${options.collection} is not yet supported`)
}

// Dump the RocksDB data to JSON.
symbol.config.dump(options)
  .then(result => printJson(result, options.output))
  .catch(error => logError(error))
