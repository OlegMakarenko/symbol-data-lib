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

// TODO(ahuszagh) Check catapult-meta/catapult-rest/demo/packet.py
//    Shows how to connect, etc.

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
      // TODO(ahuszagh) Here.
      // Need to add the size and the type
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

  // TODO(ahuszagh) Change all the use serialize/deserialize

  // Parse a server challenge.
  serverChallenge: {
    request: data => ({
      challenge: TcpReader.solitary(data, 'challenge')
    }),

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
    response: data => ({
      challenge: TcpReader.solitary(data, 'challenge')
    })
  },

  // Parse push block information.
  pushBlock: {
    // Parse a push block request.
    request: data => TcpReader.solitary(data, 'block'),

    response: () => {
      throw new Error('push block response does not exist.')
    }
  },

  // Parse pull block information.
  pullBlock: {
    // Parse a pull block request.
    request: data => ({
      height: TcpReader.solitary(data, 'uint64String')
    }),

    // Parse a pull block response.
    response: data => TcpReader.solitary(data, 'block')
  },

  // Parse chain information
  chainInfo: {
    // Parse a chain info request.
    request: data => TcpReader.solitary(data, 'empty'),

    // Parse a chain info response.
    response: data => {
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
  },

  // Parse block hashes information.
  blockHashes: {
    // Parse a block hashes request.
    request: data => {
      let reader = new TcpReader(data)
      let height = reader.uint64String()
      let hashes = reader.uint32()
      reader.validateEmpty()

      return {
        height,
        hashes
      }
    },

    // Parse a block hashes response.
    response: data => TcpReader.solitary(data, 'hashes')
  },

  // Parse pull blocks information.
  pullBlocks: {
    // Parse a pull blocks request.
    request: data => {
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
    },

    // Parse a pull blocks response.
    response: data => TcpReader.solitary(data, 'blocks')
  },

  // Parse push transactions information.
  pushTransactions: {
    // TODO(ahuszagh) Here...
    // Parse a push transactions request.
    request: data => {
      // Needs to push transaction infos.
      throw new Error('not yet implemented')
    },

    // Parse a push transactions response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

  // Parse pull transactions information.
  pullTransactions: {
    // Parse a pull transactions request.
    request: data => {
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
    },

    // Parse a pull transactions response.
    response: data => TcpReader.solitary(data, 'transactions')
  },

  // Parse secure signed information.
  secureSigned: {
    // Parse a secure signed request.
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a secure signed response.
    response: data => {
      throw new Error('not yet implemented')
    }
  },

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
