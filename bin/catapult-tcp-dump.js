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
import fs from 'fs'
import yargs from 'yargs'
import symbolData from '../src'

// ARGUMENTS
// ---------

const options = yargs
  .command(
    'catapult-tcp-dump [OPTION...]',
    'Dump TCP data to JSON'
  )
  // Example.
  .example(
    'catapult-tcp-dump --client-private-key 3BC0820D9B9552C0805A28C9E4314961C9AC415D580F13D330BE88F82FE5770D --node-public-key C1B4E25B491D6552F78EDE5A77CB74BB1743955500FB7FAB610338B639C2F763 --requests \'[{"type": "pullBlock", "params": {"height": "64"}}]\'',
    'Dump the block change spool data as JSON.'
  )
  // Parameters.
  .option('host', {
    alias: 'h',
    describe: 'Host for the TCP API.',
    default: 'localhost'
  })
  .option('port', {
    alias: 'p',
    describe: 'Port for the TCP API.',
    default: 7900
  })
  .options('hash-algorithm', {
    alias: 'a',
    describe: 'Hash algorithm for key derivation.',
    default: 'keccak'
  })
  .options('client-private-key', {
    alias: 'c',
    describe: 'Hex-encoded private key for the client.'
  })
  .options('node-public-key', {
    alias: 'n',
    describe: 'Hex-encoded public key for the node.'
  })
  .options('requests', {
    alias: 'r',
    describe: 'Requests to make to TCP API, as JSON, or as a path to a JSON file.'
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
  .demandOption('requests', 'Please provide TCP requests.')
  .demandOption('clientPrivateKey', 'Please provide the private key of the client.')
  .demandOption('nodePublicKey', 'Please provide the public key of the node.')
  // Parse arguments.
  .parse()

// REQUESTS
// --------

try {
  // Try parsing the data as a JSON literal.
  options.requests = JSON.parse(options.requests)
} catch {
  // Not a valid JSON literal, provide a file.
  options.requests = JSON.parse(fs.readFileSync(options.requests, 'utf8'))
}

// VERBOSE
// -------

// Display verbose information.
if (options.verbose) {
  console.info('Running catapult-tcp-dump with: ')
  console.info(`    host                = ${options.host}`)
  console.info(`    port                = ${options.port}`)
  console.info(`    hash-algorithm      = ${options.hashAlgorithm}`)
  console.info(`    client-private-key  = ${options.clientPrivateKey}`)
  console.info(`    node-public-key     = ${options.nodePublicKey}`)
  console.info(`    requests            = ${JSON.stringify(options.requests, null, 2)}`)
  console.info(`    output              = ${options.output ? options.output : 'stdout'}`)
}

// DUMP
// ----

// Dump the tcp data to JSON.
symbolData.tcp.dump(options).then(result => {
  let json = JSON.stringify(result, null, 4) + '\n'
  if (options.output !== undefined) {
    fs.writeFileSync(options.output, json)
  } else {
    process.stdout.write(json)
  }
})
