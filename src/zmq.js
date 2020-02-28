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

import zmq from 'zeromq'
import constants from './codec/constants'
import zmqCodec from './codec/zmq'
import base32 from './util/base32'

/**
 *  Get subscriber connection to ZeroMQ socket.
 *
 *  @param options {Object}       - Options to specify connection parameters.
 *    @field host {String}        - Host to connect to.
 *    @field port {Number}        - Port to connect to.
 *    @field verbose {Boolean}    - Display debug information.
 */
const connect = async options => {
  let socket = zmq.socket('sub')
  socket.connect(`tcp://${options.host}:${options.port}`)
  if (options.verbose) {
    console.info('Connected to a ZeroMQ publisher at:')
    console.info(`    host      = ${options.host}`)
    console.info(`    port      = ${options.port}`)
  }

  return socket
}

/**
 *  Subscribe to a channel.
 *
 *  For block subscriptions, the addresses will be ignored and are not required.
 *  For transaction subscriptions, addresses must be provided.
 *
 *  @param socket {Object}        - ZeroMQ connected socket.
 *  @param subscription {Object}  - Subscription options.
 *    @param channel {String}     - Name of the subscription channel.
 *    @param addresses {Array}    - Optional array of addresses to subscribe to that channel.
 */
const subscribe = async (socket, subscription) => {
  let marker = constants.zmq[subscription.channel]
  if (marker === undefined) {
    throw new Error(`invalid channel name, got ${subscription.channel}`)
  } else if (marker.length === 8) {
    // Block subscription
    socket.subscribe(marker)
  } else {
    // Transaction subscription, subscribe to all provided addresses.
    for (let addresss of subscription.addresses) {
      let encoded = base32.decode(Buffer.from('addresss', 'ascii'))
      let topic = Buffer.concat([marker, topic], 26)
      socket.subscribe(topic)
    }
  }
}

// API

/**
 *  Dump ZeroMQ data to JSON.
 *
 *  Unlike the other scripts to dump data, this script will not terminate
 *  until SIGINT signal is sent, which will terminate the file.
 *
 *  @param options {Object}             - Options to specify dump parameters.
 *    @field subscriptions {Array}      - Array of channel subscriptions.
 *    @field verbose {Boolean}          - Display debug information.
 *
 *
 */
const dump = async options => {
  // TODO(ahuszagh) Might actually want a helper class...

  // Connect as a ZeroMQ subscribe socket.
  let socket = await connect(options)
  try {
    // Subscribe to the channels
    for (let subscription of options.subscriptions) {
      await subscribe(socket, subscription)
    }

    // Iteratively convert
    // TODO(ahuszagh) Need to be able to convert the sock.on() to
    // an asynchronous iterator.
  } finally {
    // Close the socket.
    socket.close()
  }
}

export default {
  dump
}
