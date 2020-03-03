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

import fs from 'fs'
import yargs from 'yargs'
import { logError, readJson } from './util'
import symbol from '../src'
import defaults from '../src/defaults'

// ARGUMENTS
// ---------

const options = yargs
  .command(
    'catapult-zmq-dump [OPTION...]',
    'Dump ZMQ data to JSON'
  )
  // Example.
  .example(
    'catapult-zmq-dump --subscriptions \'[{"channel": "block"}, {"channel": "dropBlocks"}]\'',
    'Dump the block and drop blocks data as JSON.'
  )
  // Parameters.
  .option('host', {
    alias: 'h',
    type: 'string',
    describe: 'Host for the ZMQ API.',
    default: defaults.host()
  })
  .option('port', {
    alias: 'p',
    type: 'number',
    describe: 'Port for the ZMQ API.',
    default: defaults.zmqPort()
  })
  .options('subscriptions', {
    alias: 's',
    type: 'string',
    describe: 'Channel to subscribe to, as JSON, or as a path to a JSON file.'
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
  .demandOption('subscriptions', 'Please provide ZMQ subscriptions.')
  // Parse arguments.
  .parse()

options.subscriptions = readJson(options.subscriptions)

// Display verbose information.
if (options.verbose) {
  console.info('Running catapult-zmq-dump with: ')
  console.info(`    host                = ${options.host}`)
  console.info(`    port                = ${options.port}`)
  console.info(`    subscriptions       = ${JSON.stringify(options.subscriptions, null, 4)}`)
  console.info(`    output              = ${options.output ? options.output : 'stdout'}`)
}

// Open handle to file, or get fd to stdout.
const openFile = path => {
  if (path === undefined) {
    return process.stdout.fd
  } else {
    return fs.openFileSync(path, 'w')
  }
}

// Close handle to file, if not stdout.
const closeFile = fd => {
  if (fd !== process.stdout.fd) {
    fs.closeSync(fd)
  }
}

// Dump the zmq data to JSON.
const run = async () => {
  let fd = openFile(options.output)
  let count = 0
  let finishFile = () => {
    if (count === 0) {
      // Nothing written, just do an empty bracket.
      fs.appendFileSync(fd, '[]\n', 'utf8')
    } else {
      // Write the trailing bracket.
      fs.appendFileSync(fd, '\n]\n', 'utf8')
    }
    closeFile(fd)
  }
  let onSigInt = () => {
    finishFile()
    process.exit(0)
  }

  try {
    // Initialize file and register on-end handler.
    process.on('SIGINT', onSigInt)
    for await (let message of symbol.zmq.dump(options)) {
      // Get the JSON, indent it by 4, then append the data.
      let json = JSON.stringify(message, null, 4)
        .split('\n')
        .map(x => '    ' + x)
        .join('\n')

      // Write data to file.
      if (count === 0) {
        // First item, no comma and leading bracket.
        fs.appendFileSync(fd, '[\n' + json, 'utf8')
      } else {
        // Trailing item, write a comma before the item.
        fs.appendFileSync(fd, ',\n' + json, 'utf8')
      }

      // Increment our counter.
      ++count
    }
  } catch (error) {
    // Catch error and remove the onSigInt handler.
    process.removeListener('SIGINT', onSigInt)
    finishFile()
    throw error
  }
}

// Run and catch any errors.
run().catch(error => logError(error))
