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
import { logError, printJson, readJson } from './util'
import symbol from '../src'
import defaults from '../src/defaults'

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
    type: 'string',
    describe: 'Host for the TCP API.',
    default: defaults.host()
  })
  .option('port', {
    alias: 'p',
    type: 'number',
    describe: 'Port for the TCP API.',
    default: defaults.tcpPort()
  })
  .options('hash-algorithm', {
    alias: 'a',
    type: 'string',
    describe: 'Hash algorithm for key derivation.',
    default: defaults.hashAlgorithm()
  })
  .options('client-private-key', {
    alias: 'c',
    type: 'string',
    describe: 'Hex-encoded private key for the client.'
  })
  .options('node-public-key', {
    alias: 'n',
    type: 'string',
    describe: 'Hex-encoded public key for the node.'
  })
  .options('requests', {
    alias: 'r',
    type: 'string',
    describe: 'Requests to make to TCP API, as JSON, or as a path to a JSON file.'
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
  .demandOption('requests', 'Please provide TCP requests.')
  .demandOption('clientPrivateKey', 'Please provide the private key of the client.')
  .demandOption('nodePublicKey', 'Please provide the public key of the node.')
  // Parse arguments.
  .parse()

options.requests = readJson(options.requests)

// Display verbose information.
if (options.verbose) {
  console.info('Running catapult-tcp-dump with: ')
  console.info(`    host                = ${options.host}`)
  console.info(`    port                = ${options.port}`)
  console.info(`    hash-algorithm      = ${options.hashAlgorithm}`)
  console.info(`    client-private-key  = ${options.clientPrivateKey}`)
  console.info(`    node-public-key     = ${options.nodePublicKey}`)
  console.info(`    requests            = ${JSON.stringify(options.requests, null, 4)}`)
  console.info(`    output              = ${options.output ? options.output : 'stdout'}`)
}

// Dump the tcp data to JSON.
symbol.tcp.dump(options)
  .then(result => printJson(result, options.output))
  .catch(error => logError(error))
