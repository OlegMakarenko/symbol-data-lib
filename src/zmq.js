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

import constants from './codec/constants'
import zmqCodec from './codec/zmq'
import base32 from './util/base32'
import zmq from './util/zmq'

/**
 *  Get subscriber connection to ZeroMQ socket.
 *
 *  @param options {Object}       - Options to specify connection parameters.
 *    @field host {String}        - Host to connect to.
 *    @field port {Number}        - Port to connect to.
 *    @field interval {Number}    - Time in milliseconds to query for new messages.
 *    @field verbose {Boolean}    - Display debug information.
 */
const connect = async options => {
  let subscriber = await zmq.Subscriber.connect(options.host, options.port, options.interval)
  if (options.verbose) {
    console.info('Connected to a ZeroMQ publisher at:')
    console.info(`    host      = ${options.host}`)
    console.info(`    port      = ${options.port}`)
  }

  return subscriber
}

/**
 *  Subscribe to a channel.
 *
 *  For block subscriptions, the addresses will be ignored and are not required.
 *  For transaction subscriptions, addresses must be provided.
 *
 *  @param subscriber {Object}    - ZeroMQ subscriber.
 *  @param subscription {Object}  - Subscription options.
 *    @param channel {String}     - Name of the subscription channel.
 *    @param addresses {Array}    - Optional array of addresses to subscribe to that channel.
 */
const subscribe = async (subscriber, subscription) => {
  let marker = constants.zmq[subscription.channel]
  if (marker === undefined) {
    throw new Error(`invalid channel name, got ${subscription.channel}`)
  } else if (marker.length === 8) {
    // Block subscription
    await subscriber.subscribe(marker)
  } else {
    // Transaction subscription, subscribe to all provided addresses.
    for (let address of subscription.addresses) {
      let encoded = base32.decode(Buffer.from(address, 'ascii'))
      let topic = Buffer.concat([marker, encoded], 26)
      await subscriber.subscribe(topic)
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
 *    @field host {String}        - Host to connect to.
 *    @field port {Number}        - Port to connect to.
 *    @field interval {Number}    - Time in milliseconds to query for new messages.
 *    @field subscriptions {Array}      - Array of channel subscriptions.
 *    @field verbose {Boolean}          - Display debug information.
 *
 *
 */
async function* dump(options) {
  // Connect as a ZeroMQ subscribe socket.
  let subscriber = await connect(options)
  try {
    // Subscribe to the channels
    for (let subscription of options.subscriptions) {
      await subscribe(subscriber, subscription)
    }

    // Iteratively iterate over all messages, until we handle some sort of error.
    for await (let {topic, message} of subscriber) {
      let result = zmqCodec.topic(topic)
      Object.assign(result, zmqCodec[result.channel](message))
      yield result
    }
  } finally {
    // Close the socket.
    await subscriber.close()
  }
}

export default {
  dump
}
