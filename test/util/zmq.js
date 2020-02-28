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

import nodeZmq from 'zeromq'
import expect from 'expect.js'
import zmq from '../../src/util/zmq'

describe('zmq', () => {
  it('should properly handle a simple publisher', async () => {
    // Config options (use an ephemeral port)
    let port = 52487
    let interval = 10
    let topic1 = Buffer.from('topic1', 'ascii')
    let topic2 = Buffer.from('topic2', 'ascii')
    let msg1 = Buffer.from('msg1', 'ascii')
    let msg2 = Buffer.from('msg2', 'ascii')

    // Create the publisher.
    let publisher = nodeZmq.socket('pub')
    publisher.bindSync(`tcp://*:${port}`)
    let id = setInterval(() => {
      publisher.send([topic1, msg1])
      publisher.send([topic2, msg2])
    }, interval)

    // Create the subscriber.
    let subscriber = await zmq.Subscriber.connect('localhost', port, interval)

    // Subscribe to topic1 and validate that's all we get.
    await subscriber.subscribe(topic1)
    let index = 0
    for await (let item of subscriber) {
      index++
      if (index == 3) {
        break
      }
      expect(item.topic).to.eql(topic1)
      expect(item.message).to.eql(msg1)
    }

    // Unsubscribe from topic1 and subscribe to topic2.
    await subscriber.unsubscribe(topic1)
    await subscriber.subscribe(topic2)
    index = 0
    for await (let item of subscriber) {
      index++
      if (index == 3) {
        break
      }
      expect(item.topic).to.eql(topic2)
      expect(item.message).to.eql(msg2)
    }

    // Close our connections.
    clearInterval(id)
    publisher.close()
    await subscriber.close()
  })
})
