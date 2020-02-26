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

import assert from 'assert'
import catbuffer from './catbuffer'
import constants from './constants'
import shared from '../util/shared'

// READERS

class TcpReader extends catbuffer.Reader {
  static solitary(data, fn) {
    let reader = new TcpReader(data)
    return reader.solitary(fn)
  }

  challenge() {
    return this.hex(constants.challengeSize)
  }

  empty() {
    return {}
  }

  hashes() {
    let hashes = []
    while (this._data.length !== 0) {
      hashes.push(this.hash256())
    }

    return hashes
  }

  node() {
    // Skip the node size.
    this.uint32()
    let version = this.uint32()
    let publicKey = this.key()
    let roles = this.uint32()
    let port = this.uint16()
    let networkIdentifier = this.uint8()
    let hostSize = this.uint8()
    let friendlyNameSize = this.uint8()
    let host = this.ascii(hostSize)
    let friendlyName = this.ascii(friendlyNameSize)

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

  nodes() {
    let nodes = []
    while (this._data.length !== 0) {
      nodes.push(this.node())
    }

    return nodes
  }

  timeSync() {
    let sendTimestamp = this.uint64String()
    let receiveTimestamp = this.uint64String()

    return {
      communicationTimestamps: {
        sendTimestamp,
        receiveTimestamp
      }
    }
  }

  path() {
    // The path consists of 16-bit nibbles, and is aligned to a full byte.
    // Therefore, the number of bytes is `nibbles + 1 // 2`. If the number
    // of nibbles is odd, the low nibble for the last index must be 0.
    let nibbles = this.uint8()
    let alignedPath = this.hex(Math.floor((nibbles + 1) / 2))

    // Verify filler nibble is 0.
    if ((nibbles % 2) === 1) {
      assert(alignedPath[alignedPath.length - 1] === '0', 'non-0 filler byte')
    }

    return alignedPath.slice(0, nibbles)
  }

  branch() {
    let path = this.path()
    let linkMask = this.uint16()
    let links = {}
    for (let index = 0; index < constants.pathMaxLinks; index++) {
      let mask = 1 << index >>> 0
      if ((linkMask & mask) !== 0) {
        links[index] = this.hash256()
      }
    }

    return {
      path,
      links
    }
  }

  leaf() {
    let path = this.path()
    let value = this.hash256()

    return {
      path,
      value
    }
  }

  treeNode() {
    let marker = this.uint8()
    if (marker === 0x0) {
      return this.branch()
    } else if (marker === 0xFF) {
      return this.leaf()
    } else {
      throw new Error(`invalid tree marker, got ${marker}`)
    }
  }

  tree() {
    let tree = []
    while (this._data.length !== 0) {
      tree.push(this.treeNode())
    }
    return tree
  }

  diagnosticCounter() {
    let id = this.uint64String()
    let value = this.uint64String()

    return {
      id,
      value
    }
  }

  diagnosticCounters() {
    let counters = []
    while (this._data.length !== 0) {
      counters.push(this.diagnosticCounter())
    }
    return counters
  }
}

// WRITERS

class TcpWriter extends catbuffer.Writer {
  static solitary(value, fn) {
    let writer = new TcpWriter()
    return writer.solitary(value, fn)
  }

  challenge(challenge) {
    assert(challenge.length === 2 * constants.challengeSize, 'invalid challenge size')
    this.hex(challenge)
  }

  empty(value) {
  }

  hashes(value) {
    this.n(value, 'hash256')
  }

  node(value) {
    // Write the dummy node size and store an index to the start.
    let initial = this.size
    this.uint32(0)
    this.uint32(value.version)
    this.key(value.publicKey)
    this.uint32(value.roles)
    this.uint16(value.port)
    this.uint8(value.networkIdentifier)
    this.uint8(value.host.length)
    this.uint8(value.friendlyName.length)
    this.ascii(value.host)
    this.ascii(value.friendlyName)

    // Re-write the node size
    let length = this.size - initial
    shared.writeUint32(this._data, length, initial)
  }

  nodes(value) {
    this.n(value, 'node')
  }

  timeSync(value) {
    this.uint64String(value.communicationTimestamps.sendTimestamp)
    this.uint64String(value.communicationTimestamps.receiveTimestamp)
  }

  path(value) {
    // Write the number of 16-bit nibbles.
    // The returned value is in hex, but doesn't necessarily actually
    // an even number of bytes.
    this.uint8(Math.floor(value.length + 1 / 2))
    let path = value
    if (value.length % 2 === 1) {
      path += '0'
    }
    this.hex(path)
  }

  branch(value) {
    this.path(value.path)

    // Write the mask
    let mask = 0
    for (let key of Object.keys(value.links)) {
      mask |= (1 << key >>> 0)
    }
    this.uint16(mask)

    // Write the links.
    for (let value of Object.values(value.links)) {
      this.hash256(value)
    }
  }

  leaf(value) {
    this.path(value.path)
    this.hash256(value.value)
  }

  treeNode(value) {
    if (value.links !== undefined) {
      this.uint8(0x0)
      this.branch(value)
    } else{
      this.uint8(0xFF)
      this.leaf(value)
    }
  }

  tree(value) {
    this.n(value, 'treeNode')
  }

  diagnosticCounter(value) {
    this.uint64String(value.id)
    this.uint64String(value.value)
  }

  diagnosticCounters(value) {
    this.n(value, 'diagnosticCounter')
  }
}

// CODEC

/**
 *  Codec for TCP models.
 */
const codec = {
  // Unlike the  other codecs, this has both serialize and deserialize
  // support. This is because we need to serialize data to the binary
  // format in order to communicate with the TCP protocol.

  // Process a general packet header.
  header: {
    serialize: packet => {
      let size = constants.packetHeaderSize + packet.payload.length
      let writer = new TcpWriter(size)
      writer.uint32(size)
      writer.uint32(packet.type)
      writer.binary(packet.payload)

      return writer.data
    },

    deserialize: data => {
      let reader = new TcpReader(data)
      let size = reader.uint32()
      let type = reader.uint32()
      let payload = reader.binary(size - constants.packetHeaderSize)
      reader.validateEmpty()

      return {
        type,
        payload
      }
    }
  },

  // Process a server challenge.
  serverChallenge: {
    request: {
      serialize: data => TcpWriter.solitary(data.challenge, 'challenge'),
      deserialize: data => ({
        challenge: TcpReader.solitary(data, 'challenge')
      })
    },

    response: {
      serialize: data => {
        let writer = new TcpWriter(200)
        writer.challenge(data.challenge)
        writer.signature(data.signature)
        writer.key(data.publicKey)
        writer.uint8(data.securityMode)

        return writer.data
      },

      deserialize: data => {
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
    }
  },

  // Process a client challenge.
  clientChallenge: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: data => TcpWriter.solitary(data.challenge, 'challenge'),
      deserialize: data => ({
        challenge: TcpReader.solitary(data, 'challenge')
      })
    }
  },

  // Process push block information.
  pushBlock: {
    request: {
      serialize: data => TcpWriter.solitary(data, 'block'),
      deserialize: data => TcpReader.solitary(data, 'block')
    },

    response: {
      serialize: () => {
        throw new Error('push block response does not exist.')
      },

      deserialize: () => {
        throw new Error('push block response does not exist.')
      }
    }
  },

  // Process pull block information.
  pullBlock: {
    request: {
      serialize: data => TcpWriter.solitary(data.height, 'uint64String'),
      deserialize: data => ({
        height: TcpReader.solitary(data, 'uint64String')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'block'),
      deserialize: data => TcpReader.solitary(data, 'block')
    }
  },

  // Process chain information
  chainInfo: {
    request: {
      serialize: data => TcpWriter.solitary(data, 'empty'),
      deserialize: data => TcpReader.solitary(data, 'empty')
    },

    response: {
      serialize: data => {
        let writer = new TcpWriter(24)
        writer.uint64String(data.height)
        writer.uint64String(data.scoreHigh)
        writer.uint64String(data.scoreLow)

        return writer.data
      },

      deserialize: data => {
        let reader = new TcpReader(data)
        let height = reader.uint64String()
        let scoreHigh = reader.uint64String()
        let scoreLow = reader.uint64String()
        reader.validateEmpty()

        return {
          height,
          scoreHigh,
          scoreLow
        }
      }
    }
  },

  // Process block hashes information.
  blockHashes: {
    request: {
      serialize: data => {
        let writer = new TcpWriter(12)
        writer.uint64String(data.height)
        writer.uint32(data.hashes)

        return writer.data
      },

      deserialize: data => {
        let reader = new TcpReader(data)
        let height = reader.uint64String()
        let hashes = reader.uint32()
        reader.validateEmpty()

        return {
          height,
          hashes
        }
      }
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'hashes'),
      deserialize: data => TcpReader.solitary(data, 'hashes')
    }
  },

  // Process pull blocks information.
  pullBlocks: {
    request: {
      serialize: data => {
        let writer = new TcpWriter(16)
        writer.uint64String(data.height)
        writer.uint32(data.blocks)
        writer.uint32(data.bytes)

        return writer.data
      },

      deserialize: data => {
        let reader = new TcpReader(data)
        let height = reader.uint64String()
        let blocks = reader.uint32()
        let bytes = reader.uint32()
        reader.validateEmpty()

        return {
          height,
          blocks,
          bytes
        }
      }
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'blocks'),
      deserialize: data => TcpReader.solitary(data, 'blocks')
    }
  },

  // Process push transactions information.
  pushTransactions: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    // Parse a push transactions response.
    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process pull transactions information.
  pullTransactions: {
    request: {
      serialize: data => {
        let writer = new TcpWriter(8 + 4 * data.shortHashes.length)
        writer.uint32(data.minFeeMultiplier)
        writer.uint32(data.shortHashes.length)
        writer.n(data.shortHashes, 'uint32')

        return writer.data
      },

      deserialize: data => {
        let reader = new TcpReader(data)
        let minFeeMultiplier = reader.uint32()
        let shortHashCount = reader.uint32()
        let shortHashes = []
        reader.n(shortHashes, shortHashCount, 'uint32')
        reader.validateEmpty()

        return {
          minFeeMultiplier,
          shortHashes
        }
      }
    },

    // Parse a pull transactions response.
    response: {
      serialize: data => TcpWriter.solitary(data, 'transactions'),
      deserialize: data => TcpReader.solitary(data, 'transactions')
    }
  },

  // Process secure signed information.
  secureSigned: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    // Parse a push transactions response.
    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process sub cache merkle roots.
  subCacheMerkleRoots: {
    request: {
      serialize: data => TcpWriter.solitary(data.height, 'uint64String'),
      deserialize: data => ({
        height: TcpReader.solitary(data, 'uint64String')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'hashes'),
      deserialize: data => TcpReader.solitary(data, 'hashes')
    }
  },

  // Process push partial transactions information.
  pushPartialTransactions: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process push detached cosignatures information.
  pushDetachedCosignatures: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process push partial transaction information.
  pullPartialTransactionInfos: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process push local node information.
  pushNodeInfo: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process pull local node information.
  pullNodeInfo: {
    request: {
      serialize: data => TcpWriter.solitary(data, 'empty'),
      deserialize: data => TcpReader.solitary(data, 'empty')
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'node'),
      deserialize: data => TcpReader.solitary(data, 'node')
    }
  },

  // Process push node peers information.
  pushNodePeers: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process pull node peers information.
  pullNodePeers: {
    request: {
      serialize: data => TcpWriter.solitary(data, 'empty'),
      deserialize: data => TcpReader.solitary(data, 'empty')
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'nodes'),
      deserialize: data => TcpReader.solitary(data, 'nodes')
    }
  },

  // Process time synchronization information.
  timeSync: {
    request: {
      serialize: data => TcpWriter.solitary(data, 'empty'),
      deserialize: data => TcpReader.solitary(data, 'empty')
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'timeSync'),
      deserialize: data => TcpReader.solitary(data, 'timeSync')
    }
  },

  // Process account state path information.
  accountStatePath: {
    request: {
      serialize: data => TcpWriter.solitary(data.address, 'address'),
      deserialize: data => ({
        address: TcpReader.solitary(data, 'address')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'tree'),
      deserialize: data => TcpReader.solitary(data, 'tree')
    }
  },

  // Process hash lock state path information.
  hashLockStatePath: {
    request: {
      serialize: data => TcpWriter.solitary(data.hash, 'hash256'),
      deserialize: data => ({
        hash: TcpReader.solitary(data, 'hash256')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'tree'),
      deserialize: data => TcpReader.solitary(data, 'tree')
    }
  },

  // Process secret lock state path information.
  secretLockStatePath: {
    request: {
      serialize: data => TcpWriter.solitary(data.secret, 'hash256'),
      deserialize: data => ({
        secret: TcpReader.solitary(data, 'hash256')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'tree'),
      deserialize: data => TcpReader.solitary(data, 'tree')
    }
  },

  // Process metadata state path information.
  metadataStatePath: {
    request: {
      serialize: data => TcpWriter.solitary(data.hash, 'hash256'),
      deserialize: data => ({
        hash: TcpReader.solitary(data, 'hash256')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'tree'),
      deserialize: data => TcpReader.solitary(data, 'tree')
    }
  },

  // Process mosaic state path information.
  mosaicStatePath: {
    request: {
      serialize: data => TcpWriter.solitary(data.mosaicId, 'id'),
      deserialize: data => ({
        mosaicId: TcpReader.solitary(data, 'id')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'tree'),
      deserialize: data => TcpReader.solitary(data, 'tree')
    }
  },

  // Process multisig state path information.
  multisigStatePath: {
    request: {
      serialize: data => TcpWriter.solitary(data.publicKey, 'key'),
      deserialize: data => ({
        publicKey: TcpReader.solitary(data, 'key')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'tree'),
      deserialize: data => TcpReader.solitary(data, 'tree')
    }
  },

  // Process namespace state path information.
  namespaceStatePath: {
    request: {
      serialize: data => TcpWriter.solitary(data.namespaceId, 'id'),
      deserialize: data => ({
        namespaceId: TcpReader.solitary(data, 'id')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'tree'),
      deserialize: data => TcpReader.solitary(data, 'tree')
    }
  },

  // Process account restrictions state path information.
  accountRestrictionsStatePath: {
    request: {
      serialize: data => TcpWriter.solitary(data.address, 'address'),
      deserialize: data => ({
        address: TcpReader.solitary(data, 'address')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'tree'),
      deserialize: data => TcpReader.solitary(data, 'tree')
    }
  },

  // Process mosaic restrictions state path information.
  mosaicRestrictionsStatePath: {
    request: {
      serialize: data => TcpWriter.solitary(data.hash, 'hash256'),
      deserialize: data => ({
        hash: TcpReader.solitary(data, 'hash256')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'tree'),
      deserialize: data => TcpReader.solitary(data, 'tree')
    }
  },

  // Process diagnostic counters information.
  diagnosticCounters: {
    request: {
      serialize: data => TcpWriter.solitary(data, 'empty'),
      deserialize: data => TcpReader.solitary(data, 'empty')
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'diagnosticCounters'),
      deserialize: data => TcpReader.solitary(data, 'diagnosticCounters')
    }
  },

  // Process confirm timestamp hashes information.
  confirmTimestampedHashes: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process active node information.
  activeNodeInfos: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process block statement information.
  blockStatement: {
    request: {
      serialize: data => TcpWriter.solitary(data.height, 'uint64String'),
      deserialize: data => ({
        height: TcpReader.solitary(data, 'uint64String')
      })
    },

    response: {
      serialize: data => TcpWriter.solitary(data, 'blockStatement'),
      deserialize: data => TcpReader.solitary(data, 'blockStatement')
    }
  },

  // Process unlocked accounts information.
  unlockedAccounts: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process account information.
  accountInfos: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process hash lock information.
  hashLockInfos: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process secret lock information.
  secretLockInfos: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process metadata information.
  metadataInfos: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process mosaic information.
  mosaicInfos: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process multisig information.
  multisigInfos: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process namespace information.
  namespaceInfos: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process account restriction information.
  accountRestrictionsInfos: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  },

  // Process mosaic restriction information.
  mosaicRestrictionsInfos: {
    request: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    },

    response: {
      serialize: () => {
        throw new Error('client challenge request does not exist.')
      },

      deserialize: () => {
        throw new Error('client challenge request does not exist.')
      }
    }
  }
}

export default codec
