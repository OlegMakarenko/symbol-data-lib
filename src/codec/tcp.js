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

  // TODO(ahuszagh) Change all the use serialize/deserialize

  // Parse sub cache merkle roots.
  subCacheMerkleRoots: {
    // Parse a sub cache merkle request.
    request: data => ({
      height: TcpReader.solitary(data, 'uint64String')
    }),

    // Parse a sub cache merkle response.
    response: data => TcpReader.solitary(data, 'hashes')
  },

  // Parse push partial transactions information.
  pushPartialTransactions: {
    // Parse a push partial transactions request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a push partial transactions response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse push detached cosignatures information.
  pushDetachedCosignatures: {
    // Parse a push detached cosignatures request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a push detached cosignatures response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse push partial transaction information.
  pullPartialTransactionInfos: {
    // Parse a push partial transaction info request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a push partial transaction info response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse push local node information.
  pushNodeInfo: {
    // Parse a push local node request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a push local node response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse pull  local node information.
  pullNodeInfo: {
    // Parse a pull node info request.
    request: data => TcpReader.solitary(data, 'empty'),

    // Parse a pull node info response.
    response: data => TcpReader.solitary(data, 'node')
  },

  // Parse push node peers information.
  pushNodePeers: {
    // Parse a push node peers request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a push node peers response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse pull node peers information.
  pullNodePeers: {
    // Parse a pull node peers request.
    request: data => TcpReader.solitary(data, 'empty'),

    // Parse a pull node peers response.
    response: data => TcpReader.solitary(data, 'nodes')
  },

  // Parse time synchronization information.
  timeSync: {
    // Parse a time synchronization request.
    request: data => TcpReader.solitary(data, 'empty'),

    // Parse a time synchronization response.
    response: data => TcpReader.solitary(data, 'timeSync')
  },

  // Parse account state path information.
  accountStatePath: {
    // Parse an account state path request.
    request: data => ({
      address: TcpReader.solitary(data, 'address')
    }),

    // Parse an account state path response.
    response: data => TcpReader.solitary(data, 'tree')
  },

  // Parse hash lock state path information.
  hashLockStatePath: {
    // Parse a hash lock state path request.
    request: data => ({
      hash: TcpReader.solitary(data, 'hash256')
    }),

    // Parse a hash lock state path response.
    response: data => TcpReader.solitary(data, 'tree')
  },

  // Parse secret lock state path information.
  secretLockStatePath: {
    // Parse a secret lock state path request.
    request: data => ({
      secret: TcpReader.solitary(data, 'hash256')
    }),

    // Parse a secret lock state path response.
    response: data => TcpReader.solitary(data, 'tree')
  },

  // Parse metadata state path information.
  metadataStatePath: {
    // Parse a metadata state path request.
    request: data => ({
      hash: TcpReader.solitary(data, 'hash256')
    }),

    // Parse a metadata state path response.
    response: data => TcpReader.solitary(data, 'tree')
  },

  // Parse mosaic state path information.
  mosaicStatePath: {
    // Parse a mosaic state path request.
    request: data => ({
      mosaicId: TcpReader.solitary(data, 'id')
    }),

    // Parse a mosaic state path response.
    response: data => TcpReader.solitary(data, 'tree')
  },

  // Parse multisig state path information.
  multisigStatePath: {
    // Parse a multisig state path request.
    request: data => ({
      publicKey: TcpReader.solitary(data, 'key')
    }),

    // Parse a multisig state path response.
    response: data => TcpReader.solitary(data, 'tree')
  },

  // Parse namespace state path information.
  namespaceStatePath: {
    // Parse a namespace state path request.
    request: data => ({
      namespaceId: TcpReader.solitary(data, 'id')
    }),

    // Parse a namespace state path response.
    response: data => TcpReader.solitary(data, 'tree')
  },

  // Parse account restrictions state path information.
  accountRestrictionsStatePath: {
    // Parse an account restrictions state path request.
    request: data => ({
      address: TcpReader.solitary(data, 'address')
    }),

    // Parse an account restrictions state path response.
    response: data => TcpReader.solitary(data, 'tree')
  },

  // Parse mosaic restrictions state path information.
  mosaicRestrictionsStatePath: {
    // Parse a mosaic restrictions state path request.
    request: data => ({
      hash: TcpReader.solitary(data, 'hash256')
    }),

    // Parse a mosaic restrictions state path response.
    response: data => TcpReader.solitary(data, 'tree')
  },

  // Parse diagnostic counters information.
  diagnosticCounters: {
    // Parse a diagnostic counters request.
    request: data => TcpReader.solitary(data, 'empty'),

    // Parse a diagnostic counters response.
    response: data => TcpReader.solitary(data, 'diagnosticCounters')
  },

  // Parse confirm timestamp hashes information.
  confirmTimestampedHashes: {
    // Parse a confirm timestamp hashes request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a confirm timestamp hashes response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse active node information.
  activeNodeInfos: {
    // Parse a active node request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a active node response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse block statement information.
  blockStatement: {
    // Parse a block statement request.
    request: data => ({
      height: TcpReader.solitary(data, 'uint64String')
    }),

    // Parse a block statement response.
    response: data => TcpReader.solitary(data, 'blockStatement')
  },

  // Parse unlocked accounts information.
  unlockedAccounts: {
    // Parse an unlocked accounts request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse an unlocked accounts response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse account information.
  accountInfos: {
    // Parse an accounts request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse an accounts response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse hash lock information.
  hashLockInfos: {
    // Parse a hash lock request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a hash lock response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse secret lock information.
  secretLockInfos: {
    // Parse a secret lock request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a secret lock response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse metadata information.
  metadataInfos: {
    // Parse a metadata request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a metadata response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse mosaic information.
  mosaicInfos: {
    // Parse a mosaic request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a mosaic response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse multisig information.
  multisigInfos: {
    // Parse a multisig request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a multisig response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse namespace information.
  namespaceInfos: {
    // Parse a namespace request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a namespace response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse account restriction information.
  accountRestrictionsInfos: {
    // Parse an account restriction request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse an account restriction response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse mosaic restriction information.
  mosaicRestrictionsInfos: {
    // Parse a mosaic restriction request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a mosaic restriction response.
    response: data => {
      throw new Error('not yet implemented')
    }
  }
}

export default codec
