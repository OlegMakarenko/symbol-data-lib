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
 *  Codec to transform models returned via TCP requests to JSON.
 */

import CatbufferReader from './catbuffer'
import constants from './constants'

// READERS

class TcpReader extends CatbufferReader {
  static solitary(data, fn) {
    let reader = new TcpReader(data)
    return reader.solitary(fn)
  }

  challenge() {
    return this.hexN(constants.challengeSize)
  }
}

// TODO(ahuszagh) Check catapult-meta/catapult-rest/demo/packet.py
//    Shows how to connect, etc.

// CODEC

/**
 *  Codec for TCP models.
 */
const codec = {
  // Parse a general packet header.
  header: data => {
    let reader = new TcpReader(data)
    let size = reader.uint32()
    let type = reader.uint32()
    let payload = reader.binaryN(size - constants.packetHeaderSize)
    reader.validateEmpty()

    return {
      type,
      payload
    }
  },

  // Parse a server challenge.
  serverChallenge: {
    // Parse a server challenge request.
    request: data => {
      let reader = new TcpReader(data)
      let challenge = reader.challenge()
      reader.validateEmpty()

      return {
        challenge
      }
    },

    // Parse a server challenge response.
    response: data => {
      let reader = new TcpReader(data)
      let challenge = reader.challenge()
      let signature = reader.signature()
      let publicKey = reader.key()
      let securityMode = reader.uint8()
      reader.validateEmpty()

      return {
        challenge,
        signature,
        publicKey,
        securityMode
      }
    }
  },

  // Parse a client challenge.
  clientChallenge: {
    // Parse a client challenge request.
    request: () => {
      throw new Error('client challenge request does not exist.')
    },

    // Parse a client challenge response.
    response: data => {
      let reader = new TcpReader(data)
      let challenge = reader.challenge()
      reader.validateEmpty()

      return {
        challenge
      }
    }
  },

  // Parse pull block information.
  pullBlock: {
    // Parse a pull block request.
    request: data => {
      let reader = new TcpReader(data)
      let height = reader.uint64()
      reader.validateEmpty()

      return {
        height
      }
    },

    // Parse a pull block response.
    response: data => {
      let reader = new TcpReader(data)
      let block = reader.block()
      reader.validateEmpty()

      return block
    }
  },

  // Parse chain information
  chainInfo: {
    // Parse a chain info request.
    request: data => {
      let reader = new TcpReader(data)
      reader.validateEmpty()

      return {}
    },

    // Parse a chain info response.
    response: data => {
      let reader = new TcpReader(data)
      let height = reader.uint64()
      let scoreHigh = reader.uint64()
      let scoreLow = reader.uint64()
      reader.validateEmpty()

      return {
        height,
        scoreHigh,
        scoreLow
      }
    }
  },

  // Parse block hashes information.
  blockHashes: {
    // Parse a block hashes request.
    request: data => {
      let reader = new TcpReader(data)
      let height = reader.uint64()
      let hashes = reader.uint32()
      reader.validateEmpty()

      return {
        height,
        hashes
      }
    },

    // Parse a block hashes response.
    response: data => {
      if (data.length % 32 !== 0) {
        throw new Error('invalid block hashes response.');
      }

      let hashes = []
      let reader = new TcpReader(data)
      while (reader.data.length !== 0) {
        hashes.push(reader.hash256())
      }
      reader.validateEmpty()

      return hashes
    }
  },

  // Parse pull block information.
  pullBlocks: {
    // Parse a pull block request.
    request: data => {
      let reader = new TcpReader(data)
      let height = reader.uint64()
      let blocks = reader.uint32()
      let bytes = reader.uint32()
      reader.validateEmpty()

      return {
        height,
        blocks,
        bytes
      }
    },

    // Parse a pull block response.
    response: data => {
      let reader = new TcpReader(data)
      let blocks = []
      while (reader.data.length !== 0) {
        blocks.push(reader.block())
      }
      reader.validateEmpty()

      return blocks
    }
  },

  // Parse local node information.
  pullNodeInfo: {
    // Parse a node info request.
    request: data => {
      let reader = new TcpReader(data)
      reader.validateEmpty()

      return {}
    },

    // Parse a node info response.
    response: data => {
      let reader = new TcpReader(data)
      // Skip the node size.
      reader.uint32()
      let version = reader.uint32()
      let publicKey = reader.key()
      let roles = reader.uint32()
      let port = reader.uint16()
      let networkIdentifier = reader.uint8()
      let hostSize = reader.uint8()
      let friendlyNameSize = reader.uint8()
      let host = reader.asciiN(hostSize)
      let friendlyName = reader.asciiN(friendlyNameSize)
      reader.validateEmpty()

      return {
        version,
        publicKey,
        roles,
        port,
        networkIdentifier,
        host,
        friendlyName
      }
    }
  },

  // Parse node peers information.
  pullNodePeers: {
    // Parse a node peers request.
    request: data => {
      let reader = new TcpReader(data)
      reader.validateEmpty()

      return {}
    },

    // Parse a node peers response.
    response: data => {
      let reader = new TcpReader(data)
      let peers = []
      while (reader.data.length !== 0) {
        // Skip the node size.
        reader.uint32()
        let version = reader.uint32()
        let publicKey = reader.key()
        let roles = reader.uint32()
        let port = reader.uint16()
        let networkIdentifier = reader.uint8()
        let hostSize = reader.uint8()
        let friendlyNameSize = reader.uint8()
        let host = reader.asciiN(hostSize)
        let friendlyName = reader.asciiN(friendlyNameSize)
        peers.push({
          version,
          publicKey,
          roles,
          port,
          networkIdentifier,
          host,
          friendlyName
        })
      }
      reader.validateEmpty()

      return peers
    }
  },

  // Parse time synchronization information.
  timeSync: {
    // Parse a time synchronization request.
    request: data => {
      let reader = new TcpReader(data)
      reader.validateEmpty()

      return {}
    },

    // Parse a time synchronization response.
    response: data => {
      let reader = new TcpReader(data)
      let sendTimestamp = reader.uint64()
      let receiveTimestamp = reader.uint64()
      reader.validateEmpty()

      return {
        communicationTimestamps: {
          sendTimestamp,
          receiveTimestamp
        }
      }
    }
  },

  // TODO(ahuszagh) Add in a lot more codecs.

  // Parse a generic request or response packet.
  packet: (data, codecName) => {
    let packet = codec.header(data)
    // TODO(ahuszagh) Add in a lot more packet types.
    // May need to handle both push and pull
    // TODO(ahuszagh) need to add the ones mising from above.
    if (packet.type === constants.serverChallenge) {
      return codec.serverChallenge[codecName](packet.payload)
    } else if (packet.type === constants.clientChallenge) {
      return codec.clientChallenge[codecName](packet.payload)
    } else if (packet.type === constants.nodeDiscoveryPullPing) {
      return codec.pullNodeInfo[codecName](packet.payload)
    } else if (packet.type === constants.nodeDiscoveryPullPeers) {
      return codec.pullNodePeers[codecName](packet.payload)
    } else if (packet.type === constants.timeSyncNetworkTime) {
      return codec.timeSync[codecName](packet.payload)
    } else {
      throw new Error(`invalid packet type, got ${packet.type}`)
    }
  },

  // Parse a generic request packet.
  request: data => {
    return codec.packet(data, 'request')
  },

  // Parse a generic response packet.
  response: data => {
    return codec.packet(data, 'response')
  }
}

export default codec
