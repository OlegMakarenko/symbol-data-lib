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

import '@babel/polyfill'
import yargs from 'yargs'
import symbolData from '../src'

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
    describe: 'Directory for the configuration files.',
    default: '/userconfig/resources'
  })
  .option('collection', {
    alias: 'c',
    describe: (
      'Name of collection(s) to dump.\n'
      + 'Multiple collections can be provided with comma separators.\n'
      + 'Valid collections names:\n- all\n- '
      + symbolData.config.COLLECTIONS.join('\n- ')
    )
  })
  .option('output', {
    alias: 'o',
    describe: 'Write to output file rather than stdout.'
  })
  // Help and verbose.
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  // Validation.
  .demandOption('collection', 'Please provide a collection name to dump.')
  // Parse arguments.
  .parse()

// Display verbose information.
if (options.verbose) {
  console.info('Running catapult-config-dump with: ')
  console.info(`    config-dir   = ${options.configDir}`)
  console.info(`    collection   = ${options.collection}`)
  console.info(`    output       = ${options.output ? options.output : 'stdout'}`)
}

// Validate the collection name is supported.
if (!symbolData.config.isValidCollection(options.collection)) {
  throw new Error(`collection name ${options.collection} is not yet supported`)
}

// Dump the RocksDB data to JSON.
symbolData.config.dump(options).then(result => {
  let json = JSON.stringify(result, null, 4) + '\n'
  if (options.output !== undefined) {
    fs.writeFileSync(options.output, json)
  } else {
    process.stdout.write(json)
  }
})
