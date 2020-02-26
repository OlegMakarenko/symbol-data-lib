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
 *  Map packet type name to the enumerated constant.
 */
const PACKET_TYPE_MAP = {
  serverChallenge: constants.serverChallenge,
  clientChallenge: constants.clientChallenge,
  pushBlock: constants.pushBlock,
  pullBlock: constants.pullBlock,
  chainInfo: constants.chainInfo,
  blockHashes: constants.blockHashes,
  pullBlocks: constants.pullBlocks,
  pushTransactions: constants.pushTransactions,
  pullTransactions: constants.pullTransactions,
  secureSigned: constants.secureSigned,
  subCacheMerkleRoots: constants.subCacheMerkleRoots,
  pushPartialTransactions: constants.pushPartialTransactions,
  pushDetachedCosignatures: constants.pushDetachedCosignatures,
  pullPartialTransactionInfos: constants.pullPartialTransactionInfos,
  pushNodeInfo: constants.nodeDiscoveryPushPing,
  pullNodeInfo: constants.nodeDiscoveryPullPing,
  pushNodePeers: constants.nodeDiscoveryPushPeers,
  pullNodePeers: constants.nodeDiscoveryPullPeers,
  timeSync: constants.timeSyncNetworkTime,
  accountStatePath: constants.accountStatePath,
  hashLockStatePath: constants.hashLockStatePath,
  secretLockStatePath: constants.secretLockStatePath,
  metadataStatePath: constants.metadataStatePath,
  mosaicStatePath: constants.mosaicStatePath,
  multisigStatePath: constants.multisigStatePath,
  namespaceStatePath: constants.namespaceStatePath,
  accountRestrictionsStatePath: constants.accountRestrictionsStatePath,
  mosaicRestrictionsStatePath: constants.mosaicRestrictionsStatePath,
  diagnosticCounters: constants.diagnosticCounters,
  confirmTimestampedHashes: constants.confirmTimestampedHashes,
  activeNodeInfos: constants.activeNodeInfos,
  blockStatement: constants.blockStatement,
  unlockedAccounts: constants.unlockedAccounts,
  accountInfos: constants.accountInfos,
  hashLockInfos: constants.hashLockInfos,
  secretLockInfos: constants.secretLockInfos,
  metadataInfos: constants.metadataInfos,
  mosaicInfos: constants.mosaicInfos,
  multisigInfos: constants.multisigInfos,
  namespaceInfos: constants.namespaceInfos,
  accountRestrictionsInfos: constants.accountRestrictionsInfos,
  mosaicRestrictionsInfos: constants.mosaicRestrictionsInfos
}

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
 *  Handle the server challenge when connecting to a node.
 */
const serverChallenge = async options => {
  // Read and validate the packet.
  let packet = tcpCodec.header.deserialize(await options.socket.receive())
  if (packet.type !== constants.serverChallenge) {
    throw new Error('invalid server challenge request packet')
  } else if (packet.payload.length !== constants.challengeSize) {
    throw new Error(`invalid challenge size, got ${packet.payload.length} bytes`)
  }

  // Get our client signing key.
  let hash512 = crypto[options.hashAlgorithm]['512']
  let privateKey = Buffer.from(options.clientPrivateKey, 'hex')
  let signingKey = new crypto.SigningKey(privateKey, hash512)
  let verifyingKey = signingKey.verifyingKey
  let publicKey = verifyingKey.buffer

  // Draft a response.
  // Currently, only unsigned packets are used. This will change.
  let challenge = crypto.randomBytes(constants.challengeSize)
  let mode = Buffer.of(constants.connectionSecurityNone)
  let length = constants.challengeSize + 1
  let signature = signingKey.sign(Buffer.concat([packet.payload, mode], length))

  // Create the response packet
  let type = constants.serverChallenge
  let size = constants.challengeSize + signature.length + publicKey.length + mode.length
  let payload = Buffer.concat([challenge, signature, publicKey, mode], size)
  let response = tcpCodec.header.serialize({type, payload})

  // Send the response and return the new challenge data.
  await options.socket.send(response)

  return challenge
}

/**
 *  Handle the client challenge when connecting to a node.
 */
const clientChallenge = async options => {
  // Read and validate the signature packet.
  let packet = tcpCodec.header.deserialize(await options.socket.receive())
  if (packet.type !== constants.clientChallenge) {
    throw new Error('invalid client challenge response packet')
  } else if (packet.payload.length !== constants.signatureSize) {
    throw new Error(`invalid signayure size, got ${packet.payload.length} bytes`)
  }

  // Get our node verifying key.
  let hash512 = crypto[options.hashAlgorithm]['512']
  let publicKey = Buffer.from(options.nodePublicKey, 'hex')
  let verifyingKey = new crypto.VerifyingKey(publicKey, hash512)

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
 *    @field clientPrivateKey {String}  - Hex-encoded private key for the client.
 *    @field nodePublicKey {String}     - Hex-encoded public key for the node.
 *    @field requests {Array}           - Array of requests to make to the TCP API.
 *    @field verbose {Boolean}          - Display debug information.
 *
 *  # Requests
 *
 *  The requests are an array of objects, where each object contains the
 *  the packet type ('pullBlock', 'nodeInfo', etc.) and the params. For example,
 *  to pull the packet for blocks at height '64', use:
 *
 *  ```javascript
 *  {
 *    type: 'pullBlock',
 *    params: {
 *      height: '64'
 *    }
 *  }
 *  ```
 *
 *  Each request in the TCP codec source code has an example of the
 *  request packet parameters expected.
 *
 *  [`here`]: https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener
 */
const dump = async options => {
  // Connect and authorize to our node via the TCP API.
  let socket = await connect(options)
  await authorize({...options, socket})

  // Run the desired requests.
  let data = []
  try {
    for (let item of options.requests) {
      // Get the config parameters.
      let codec = tcpCodec[item.type]
      let type = PACKET_TYPE_MAP[item.type]
      if (codec === undefined) {
        throw new Error(`invalid request type, got ${item.type}`)
      }

      // Send the request data.
      let payload = codec.request.serialize(item.params)
      let request = tcpCodec.header.serialize({type, payload})
      await socket.send(request)

      // Receive and process the response data.
      let packet = tcpCodec.header.deserialize(await socket.receive())
      if (packet.type !== type) {
        throw new Error(`invalid response type, got packet of type ${packet.type} for request ${item.type}`)
      }
      data.push({
        type: item.type,
        params: item.params,
        response: codec.response.deserialize(packet.payload)
      })
    }
 } finally {
    // Close the socket and return the data.
    await socket.close()
  }

  return data
}

export default {
  dump
}
