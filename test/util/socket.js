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

import net from 'net'
import expect from 'expect.js'
import Socket from '../../src/util/socket'

describe('socket', () => {
  it('should properly handle an echo server', async () => {
    // Config options (use an ephemeral port)
    let port = 52487

    // Create the server
    let server = net.createServer(connection => {
      connection.pipe(connection)
    })
    server.listen(port)

    // Create the socket.
    let socket = await Socket.connect(port)
    expect(socket.isOpen).to.equal(true)
    expect(socket.isClosed).to.equal(false)

    // Test sending and receiving data.
    // All the data requires a size prefix.
    let payload = Buffer.from('0F00000068656C6C6F20776F726C64', 'hex')
    await socket.send(payload)
    let data = await socket.receive()
    expect(data).to.eql(payload)

    // Check the address works
    let address = socket.address()
    expect(address.address).to.be.a('string')
    expect(address.family).to.be.a('string')
    expect(address.port).to.be.a('number')

    // Close our connections.
    await socket.close()
    server.close()
    expect(socket.isOpen).to.equal(false)
    expect(socket.isClosed).to.equal(true)
  })
})
