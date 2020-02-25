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
 *  Codec to transform TCP models to JSON.
 */

import constants from './codec/constants'
import tcpCodec from './codec/tcp'
import crypto from './util/crypto'
import Socket from './util/socket'

/**
 *  Get connection to TCP socket.
 *
 *  @param options {Object}       - Options to specify connection parameters.
 *    @field verbose {Boolean}    - Display debug information.
 */
const connect = async options => {
  let socket = await Socket.connect(options)
  if (options.verbose) {
    let address = socket.connection.address()
    console.info('Connected to a TCP server at:')
    console.info(`    address   = ${address.address}`)
    console.info(`    family    = ${address.family}`)
    console.info(`    port      = ${address.port}`)
  }

  return socket
}

/**
 *  Create a packet header to response to a request.
 */
const createHeader = (size, packetType) => {
  let array = new Uint32Array(2)
  array[0] = size
  array[1] = packetType

  return Buffer.from(array.buffer)
}

/**
 *  Handle the server challenge when connecting to a node.
 */
const serverChallenge = async options => {
  // Read and validate the packet.
  let packet = tcpCodec.header(await options.socket.receive())
  if (packet.type !== constants.serverChallenge) {
    throw new Error('invalid server challenge request packet')
  } else if (packet.payload.length !== constants.challengeSize) {
    throw new Error(`invalid challenge size, got ${packet.payload.length} bytes`)
  }

  // Get our client signing key.
  let hash512 = crypto[options.hashAlgorithm]['512']
  let signingKey = new crypto.SigningKey(options.clientPrivateKey, hash512)
  let verifyingKey = signingKey.verifyingKey
  let publicKey = verifyingKey.buffer

  // Draft a response.
  // Currently, only unsigned packets are used. This will change.
  let challenge = crypto.randomBytes(constants.challengeSize)
  let mode = Buffer.of(constants.connectionSecurityNone)
  let length = constants.challengeSize + 1
  let signature = signingKey.sign(Buffer.concat([packet.payload, mode], length))

  // Create the response packet
  let size = constants.packetHeaderSize +
    constants.challengeSize +
    signature.length +
    publicKey.length +
    mode.length
  let header = createHeader(size, constants.serverChallenge)
  let response = Buffer.concat([header, challenge, signature, publicKey, mode], size)

  // Send the response and return the new challenge data.
  await options.socket.send(response)

  return challenge
}

/**
 *  Handle the client challenge when connecting to a node.
 */
const clientChallenge = async options => {
  // Read and validate the signature packet.
  let packet = tcpCodec.header(await options.socket.receive())
  if (packet.type !== constants.clientChallenge) {
    throw new Error('invalid client challenge response packet')
  } else if (packet.payload.length !== constants.signatureSize) {
    throw new Error(`invalid signayure size, got ${packet.payload.length} bytes`)
  }

  // Get our node verifying key.
  let hash512 = crypto[options.hashAlgorithm]['512']
  let verifyingKey = new crypto.VerifyingKey(options.nodePublicKey, hash512)

  // Verify the signature
  if (!verifyingKey.verify(packet.payload, options.challenge)) {
    throw new Error('unable to validate server signature, could not connect to node')
  }
}

/**
 *  Handle the server and client challenge steps during TCP authorization.
 */
const authorize = async options => {
  let challenge = await serverChallenge(options)
  await clientChallenge({...options, challenge})
}

// API

/**
 *  Dump TCP data to JSON.
 *
 *  The options object supports all the fields in the NodeJS `net.connect` request, which
 *  are enumerated [`here``]. Common fields include `port` and `host`.
 *
 *  @param options {Object}             - Options to specify dump parameters.
 *    @field hashAlgorithm {String}     - Hashing algorithm. Can be `keccak` or `sha3`.
 *    @field clientPrivateKey {String}  - Private key for the client.
 *    @field nodePublicKey {String}     - Public key for the node.
 *    @field verbose {Boolean}          - Display debug information.
 *
 *  [`here`]: https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener
 */
const dump = async options => {
  // Connect and authorize to our node via the TCP API.
  let socket = await connect(options)
  await authorize({...options, socket})

  // Run the desired requests
  // TODO(ahuszagh) Remove this part.
  //let data = spoc
  // TODO(ahuszagh) Need to do the custom requests here...

  // Close the socket and return the data.
  await socket.close()

  // TODO(ahuszagh) Need to process the data
  return undefined
}

// TODO(ahuszagh) Really need a serial sockets API here...

// TODO(ahuszagh) Going to need to have much a more complex API here.
//   May need structured data to be passed to the request.
// But, at the very least, going to need to have a socket that works.
// NTOD

export default {
  dump
}
