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

  empty() {
    return {}
  }

  hashes() {
    let hashes = []
    while (this.data.length !== 0) {
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
    let host = this.asciiN(hostSize)
    let friendlyName = this.asciiN(friendlyNameSize)

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
    while (this.data.length !== 0) {
      nodes.push(this.node())
    }

    return nodes
  }

  timeSync() {
    let sendTimestamp = this.uint64()
    let receiveTimestamp = this.uint64()

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
    let alignedPath = this.hexN(Math.floor((nibbles + 1) / 2))

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
    // May need to know the value type.
    let tree = []
    while (this.data.length !== 0) {
      tree.push(this.treeNode())
    }
    return tree
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
    request: data => ({
      challenge: TcpReader.solitary(data, 'challenge')
    }),

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
      height: TcpReader.solitary(data, 'uint64')
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
    response: data => TcpReader.solitary(data, 'hashes')
  },

  // Parse pull blocks information.
  pullBlocks: {
    // Parse a pull blocks request.
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

    // Parse a pull blocks response.
    response: data => TcpReader.solitary(data, 'blocks')
  },

  // Parse push transactions information.
  pushTransactions: {
    // Parse a push transactions request.
    request: data => {
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
      height: TcpReader.solitary(data, 'uint64')
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

  // Parsepull  local node information.
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
    request: data => {
      throw new Error('not yet implemented')
    },

    // Parse a diagnostic counters response.
    response: data => {
      throw new Error('not yet implemented')
    }
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
      height: TcpReader.solitary(data, 'uint64')
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
  },

  // Parse a generic request or response packet.
  packet: (data, codecName) => {
    let packet = codec.header(data)
    if (packet.type === constants.serverChallenge) {
      return codec.serverChallenge[codecName](packet.payload)
    } else if (packet.type === constants.clientChallenge) {
      return codec.clientChallenge[codecName](packet.payload)
    } else if (packet.type === constants.pushBlock) {
      return codec.pushBlock[codecName](packet.payload)
    } else if (packet.type === constants.pullBlock) {
      return codec.pullBlock[codecName](packet.payload)
    } else if (packet.type === constants.chainInfo) {
      return codec.chainInfo[codecName](packet.payload)
    } else if (packet.type === constants.blockHashes) {
      return codec.blockHashes[codecName](packet.payload)
    } else if (packet.type === constants.pullBlocks) {
      return codec.pullBlocks[codecName](packet.payload)
    } else if (packet.type === constants.pushTransactions) {
      return codec.pushTransactions[codecName](packet.payload)
    } else if (packet.type === constants.pullTransactions) {
      return codec.pullTransactions[codecName](packet.payload)
    } else if (packet.type === constants.secureSigned) {
      return codec.secureSigned[codecName](packet.payload)
    } else if (packet.type === constants.subCacheMerkleRoots) {
      return codec.subCacheMerkleRoots[codecName](packet.payload)
    } else if (packet.type === constants.pushPartialTransactions) {
      return codec.pushPartialTransactions[codecName](packet.payload)
    } else if (packet.type === constants.pushDetachedCosignatures) {
      return codec.pushDetachedCosignatures[codecName](packet.payload)
    } else if (packet.type === constants.pullPartialTransactionInfos) {
      return codec.pullPartialTransactionInfos[codecName](packet.payload)
    } else if (packet.type === constants.nodeDiscoveryPushPing) {
      return codec.pushNodeInfo[codecName](packet.payload)
    } else if (packet.type === constants.nodeDiscoveryPullPing) {
      return codec.pullNodeInfo[codecName](packet.payload)
    } else if (packet.type === constants.nodeDiscoveryPushPeers) {
      return codec.pushNodePeers[codecName](packet.payload)
    } else if (packet.type === constants.nodeDiscoveryPullPeers) {
      return codec.pullNodePeers[codecName](packet.payload)
    } else if (packet.type === constants.timeSyncNetworkTime) {
      return codec.timeSync[codecName](packet.payload)
    } else if (packet.type === constants.accountStatePath) {
      return codec.accountStatePath[codecName](packet.payload)
    } else if (packet.type === constants.hashLockStatePath) {
      return codec.hashLockStatePath[codecName](packet.payload)
    } else if (packet.type === constants.secretLockStatePath) {
      return codec.secretLockStatePath[codecName](packet.payload)
    } else if (packet.type === constants.metadataStatePath) {
      return codec.metadataStatePath[codecName](packet.payload)
    } else if (packet.type === constants.mosaicStatePath) {
      return codec.mosaicStatePath[codecName](packet.payload)
    } else if (packet.type === constants.multisigStatePath) {
      return codec.multisigStatePath[codecName](packet.payload)
    } else if (packet.type === constants.namespaceStatePath) {
      return codec.namespaceStatePath[codecName](packet.payload)
    } else if (packet.type === constants.accountRestrictionsStatePath) {
      return codec.accountRestrictionsStatePath[codecName](packet.payload)
    } else if (packet.type === constants.mosaicRestrictionsStatePath) {
      return codec.mosaicRestrictionsStatePath[codecName](packet.payload)
    } else if (packet.type === constants.diagnosticCounters) {
      return codec.diagnosticCounters[codecName](packet.payload)
    } else if (packet.type === constants.confirmTimestampedHashes) {
      return codec.confirmTimestampedHashes[codecName](packet.payload)
    } else if (packet.type === constants.activeNodeInfos) {
      return codec.activeNodeInfos[codecName](packet.payload)
    } else if (packet.type === constants.blockStatement) {
      return codec.blockStatement[codecName](packet.payload)
    } else if (packet.type === constants.unlockedAccounts) {
      return codec.unlockedAccounts[codecName](packet.payload)
    } else if (packet.type === constants.accountInfos) {
      return codec.accountInfos[codecName](packet.payload)
    } else if (packet.type === constants.hashLockInfos) {
      return codec.hashLockInfos[codecName](packet.payload)
    } else if (packet.type === constants.secretLockInfos) {
      return codec.secretLockInfos[codecName](packet.payload)
    } else if (packet.type === constants.metadataInfos) {
      return codec.metadataInfos[codecName](packet.payload)
    } else if (packet.type === constants.mosaicInfos) {
      return codec.mosaicInfos[codecName](packet.payload)
    } else if (packet.type === constants.multisigInfos) {
      return codec.multisigInfos[codecName](packet.payload)
    } else if (packet.type === constants.namespaceInfos) {
      return codec.namespaceInfos[codecName](packet.payload)
    } else if (packet.type === constants.accountRestrictionsInfos) {
      return codec.accountRestrictionsInfos[codecName](packet.payload)
    } else if (packet.type === constants.mosaicRestrictionsInfos) {
      return codec.mosaicRestrictionsInfos[codecName](packet.payload)
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
