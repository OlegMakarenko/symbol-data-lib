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
import catapultScripts from '../src'

// ARGUMENTS
// ---------

//dist/bin/catapult-rocks-dump.js --data-dir /home/ahuszagh/git/catapult-service-bootstrap/data --collection AccountRestrictionCache

const options = yargs
  .command(
    'catapult-rocks-dump [OPTION...]',
    'Dump RocksDB data to JSON'
  )
  // Example
  .example(
    'catapult-rocks-dump --collection AccountRestrictionCache --limit 50',
    'Dump the latest 50 values from AccountRestrictionCache as JSON.'
  )
  // Parameters.
  .option('data-dir', {
    alias: 'd',
    describe: 'Data directory for the RocksDB store.',
    default: '/data'
  })
  .option('node', {
    alias: 'n',
    describe: 'Name of node to fetch data from.',
    default: 'api-node-0'
  })
  .option('collection', {
    alias: 'c',
    describe: 'Name of collection to dump.'
  })
  .option('limit', {
    alias: 'l',
    describe: 'Maximum number of items from collection to dump.',
    default: 0
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
  console.info('Running catapult-rocks-dump with: ')
  console.info(`    data-dir     = ${options.dataDir}`)
  console.info(`    node         = ${options.node}`)
  console.info(`    collection   = ${options.collection}`)
  console.info(`    limit        = ${options.limit}`)
  console.info(`    output       = ${options.output ? options.output : 'stdout'}`)
}

// Dump the RocksDB data to JSON.
catapultScripts.rocks.dump(options).then(result => {
  let json = JSON.stringify(result, null, 4) + '\n'
  if (options.output !== undefined) {
    fs.writeFileSync(options.output, json)
  } else {
    process.stdout.write(json)
  }
})
