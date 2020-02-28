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

import assert from 'assert'
import zmq from 'zeromq'

// Default timeout for message requests.
const DEFAULT_TIMEOUT = 1000

/**
 *  Handle an error thrown from the ZMQ library.
 */
const handleError = (error, closed, resolve, reject) => {
  if (!Object.prototype.hasOwnProperty.call(error, 'code')) {
    // No error code, not a lower-level NodeJS error.
    reject(error)
  } else if (closed && error.code === 'EAGAIN') {
    // No data currently available, but the socket is closed. Done.
    resolve({done: true})
  } else {
    reject(error)
  }
}

/**
 *  Asynchronous API that wraps the NodeJS zeromq@5 API.
 *
 *  This is effectively implementing a zeromq@6 API for older
 *  NodeJS versions.
 *
 *  Although the actual API is synchronous, this API is implemented
 *  asynchronously to be similar to the socket wrapper.
 */
class Subscriber {
  constructor(socket, timeout=DEFAULT_TIMEOUT) {
    this.socket = socket
    this.messages = []
    this.error = null
    this.timeout = timeout
    this.socket.on('message', (topic, message) => {
      this.messages.push({topic, message})
    })
    this.socket.on('error', error => {
      this.error = error
    })
  }

  /**
   *  Connect to host.
   */
  static connect(host, port, timeout=DEFAULT_TIMEOUT) {
    let socket = zmq.socket('sub')
    socket.connect(`tcp://${host}:${port}`)

    return new Promise(resolve => {
      resolve(new Subscriber(socket, timeout))
    })
  }

  /**
   *  Subscribe to topic.
   */
  subscribe(topic) {
    return new Promise(resolve => {
      this.socket.subscribe(topic)
      resolve()
    })
  }

  /**
   *  Unsubscribe from topic.
   */
  unsubscribe(topic) {
    return new Promise(resolve => {
      this.socket.unsubscribe(topic)
      // Remove any backlogged messages.
      this.messages = this.messages.filter(message => !message.topic.equals(topic))
      resolve()
    })
  }

  /**
   *  Internal method to asynchronously fetch the next item.
   *
   *  This may not resolve or reject the Promise immediately.
   *  Returns if the next item was successfully processed.
   */
  _next(resolve, reject) {
    try {
      if (this.messages.length > 0) {
        // Have a backlog of messages, return the first one.
        resolve({value: this.messages.shift(), done: false})
        return true
      } else if (this.error !== null) {
        handleError(error, this.isClosed, resolve, reject)
        return true
      } else if (this.isClosed) {
        // Socket has been closed, resolve with a stop iteration.
        resolve({done: true})
        return true
      } else {
        // Unable to process the next item, not yet ready.
        return false
      }
    } catch (error) {
      handleError(error, this.isClosed, resolve, reject)
      return true
    }
  }

  /**
   *  Make class an asynchronous iterable.
   */
  [Symbol.asyncIterator]() {
    return {
      /**
       *  Get the next message.
       */
      next: () => {
        return new Promise((resolve, reject) => {
          if (!this._next(resolve, reject)) {
            // Unable to process the next item, set an interval.
            let interval = setInterval(() => {
              if (this._next(resolve, reject)) {
                clearInterval(interval)
              }
            }, this.timeout)
          }
        })
      }
    }
  }

  /**
   *  Close subscriber.
   */
  close() {
    assert(this.isOpen, 'subscriber must be open')
    return new Promise(resolve => {
      this.socket.close()
      resolve()
    })
  }

  /**
   *  Get if the subscriber socket is open.
   */
  get isOpen() {
    return !this.socket.closed
  }

  /**
   *  Get if the subscriber socket is closed.
   */
  get isClosed() {
    return this.socket.closed
  }
}

export default {
  Subscriber
}
