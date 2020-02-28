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
 *  Asynchronous API that wraps the NodeJS net API.
 */

import assert from 'assert'
import net from 'net'
import shared from './shared'

/**
 *  General error type for connection errors.
 */
class ConnectionError extends Error {
  constructor() {
    super('connection failed')
    this.name = 'ConnectionError'
  }
}

/**
 *  General error type when we receive unexpected data.
 */
class DataError extends Error {
  constructor(bytes) {
    super(`not expecting data, received ${bytes} bytes`)
    this.name = 'ConnectionError'
  }
}

/**
 *  Client class.
 *
 *  Wraps the event-driven NodeJS net API into an asynchronous, call-based API.
 */
class Client {
  constructor(connection) {
    this.connection = connection
  }

  /**
   *  Connect to host.
   */
  static connect(...args) {
    return new Promise((resolve, reject) => {
      let rejectOnClose = () => reject(new ConnectionError())
      let rejectOnError = error => reject(error)
      let client = net.connect(...args)
      client.on('close', rejectOnClose)
      client.on('error', rejectOnError)
      client.on('connect', () => {
        client.removeListener('close', rejectOnClose)
        client.removeListener('error', rejectOnError)
        resolve(new Client(client))
      })
    })
  }

  /**
   *  Receive data from socket.
   */
  receive() {
    assert(this.isOpen, 'socket must be open')
    return new Promise((resolve, reject) => {
      let size
      let buffer = Buffer.alloc(0)

      let rejectOnClose = () => reject(new ConnectionError())
      let rejectOnError = error => reject(error)
      this.connection.on('close', rejectOnClose)
      this.connection.on('error', rejectOnError)
      this.connection.on('data', data => {
        // Merge the buffers, and if we don't yet know the packet size,
        // calculate it.
        buffer = Buffer.concat([buffer, data], buffer.length + data.length)
        if (size === undefined && buffer.length >= 4) {
          size = shared.readUint32(buffer.slice(0, 4))
        }

        // We've extracted the full packet.
        if (buffer.length === size) {
          this.connection.removeListener('close', rejectOnClose)
          this.connection.removeListener('error', rejectOnError)
          resolve(buffer)
        } else if (buffer.length > size) {
          // Invalid packet, received too much data.
          reject(new Error('invalid packet, got more bytes than expected'))
        }
      })
    })
  }

  /**
   *  Send data to socket.
   */
  send(payload) {
    assert(this.isOpen, 'socket must be open')
    return new Promise((resolve, reject) => {
      let rejectOnClose = () => reject(new ConnectionError())
      let rejectOnError = error => reject(error)
      let rejectOnData = data => reject(new DataError(data.length))
      this.connection.on('close', rejectOnClose)
      this.connection.on('error', rejectOnError)
      this.connection.on('data', rejectOnData)
      this.connection.write(payload, () => {
        this.connection.removeListener('close', rejectOnClose)
        this.connection.removeListener('error', rejectOnError)
        this.connection.removeListener('data', rejectOnData)
        resolve()
      })
    })
  }

  /**
   *  Get the address the socket is connected to.
   */
  address() {
    assert(this.isOpen, 'socket must be open')
    return this.connection.address()
  }

  /**
   *  Close socket.
   */
  close() {
    assert(this.isOpen, 'socket must be open')
    return new Promise(resolve => {
      this.connection.end(() => {
        this.connection = undefined
        resolve()
      })
    })
  }

  /**
   *  Get if the socket connection is open.
   */
  get isOpen() {
    return this.connection !== undefined
  }

  /**
   *  Get if the socket connection is closed.
   */
  get isClosed() {
    return this.connection === undefined
  }
}

export default {
  Client
}
