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

import catbuffer from './catbuffer'
import constants from './constants'
import shared from '../util/shared'

/**
 *  Codec to parse the ZMQ subscriber messages.
 */

// READERS

class ZmqReader extends catbuffer.Reader {
  static solitary(data, fn) {
    let reader = new ZmqReader(data)
    return reader.solitary(fn)
  }

  transactionStatus() {
    let hash = this.hash256()
    let status = this.uint32()
    let timestamp = this.uint64String()

    return {
      hash,
      status,
      timestamp
    }
  }

  detachedCosignature() {
    let {signerPublicKey, signature} = this.cosignature()
    let parentHash = this.hash256()

    return {
      signerPublicKey,
      signature,
      parentHash
    }
  }

  transactionInfo() {
    let {entity, transaction} = this.transaction()
    let entityHash = this.hash256()
    let merkleComponentHash = this.hash256()
    let height = this.uint64String()

    return {
      entity,
      transaction,
      entityHash,
      merkleComponentHash,
      height
    }
  }
}

export default {
  // Parse the topic marker. Returns the name of the message type, and other metadata.
  topic: topic => {
    if (topic.length === 8) {
      // Block marker.
      if (topic.equals(constants.zmq.block)) {
        return { channel: 'block' }
      } else if (topic.equals(constants.zmq.dropBlocks)) {
        return { channel: 'dropBlocks' }
      } else {
        throw new Error('invalid block topic marker')
      }
    } else if (topic.length === 26) {
      // Transaction marker.
      let byte = topic.slice(0, 1)
      let address = shared.readBase32(topic.slice(1))
      if (byte.equals(constants.zmq.transaction)) {
        return { channel: 'transaction', address }
      } else if (byte.equals(constants.zmq.unconfirmedTransactionAdd)) {
        return { channel: 'addUnconfirmedTransaction', address }
      } else if (byte.equals(constants.zmq.unconfirmedTransactionRemove)) {
        return { channel: 'removeUnconfirmedTransaction', address }
      } else if (byte.equals(constants.zmq.transactionStatus)) {
        return { channel: 'transactionStatus', address }
      } else if (byte.equals(constants.zmq.partialTransactionAdd)) {
        return { channel: 'addPartialTransaction', address }
      } else if (byte.equals(constants.zmq.partialTransactionRemove)) {
        return { channel: 'removePartialTransaction', address }
      } else if (byte.equals(constants.zmq.cosignature)) {
        return { channel: 'cosignature', address }
      } else {
        throw new Error('invalid transaction topic marker')
      }
    } else {
      throw new Error(`invalid topic marker, got topic with length ${topic.length}`)
    }
  },

  // Parse a block message.
  block: data => ZmqReader.solitary(data, 'block'),

  // Parse a drop blocks message.
  dropBlocks: data => ({
    height: ZmqReader.solitary(data, 'uint64String')
  }),

  // Parse a transaction message.
  transaction: data => ZmqReader.solitary(data, 'transactionInfo'),

  addUnconfirmedTransaction: data => ZmqReader.solitary(data, 'transactionInfo'),

  // Parse a remove unconfirmed transaction message.
  removeUnconfirmedTransaction: data => ({
    hash: ZmqReader.solitary(data, 'hash256')
  }),

  // Parse a transaction status message.
  transactionStatus: data => ZmqReader.solitary(data, 'transactionStatus'),

  addPartialTransaction: data => ZmqReader.solitary(data, 'transactionInfo'),

  // Parse a remove partial transaction message.
  removePartialTransaction: data => ({
    hash: ZmqReader.solitary(data, 'hash256')
  }),

  // Parse a detached cosignature message.
  cosignature: data => ZmqReader.solitary(data, 'detachedCosignature')
}
