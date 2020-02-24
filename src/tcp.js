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
 *  Codec to transform TCP models to JSON.
 */

import socket from './util/socket'

// TODO(ahuszagh) Some of these are optional.
/**
 *  Get connection to MongoDB.
 *
 *  @param options {Object}       - Options to specify connection parameters.
 *    @field host {String}        - Required. Host to connect to.
 *    @field port {Number}        - Port to connect to. **Default** 'localhost'.
 *    @field verbose {Boolean}    - Display debug information.
 */
const connect = async options => {
  let socket = await Socket.connect(options)
  await socket.close()
  // TODO(ahuszagh) Here...
}

// TODO(ahuszagh) Really need a serial sockets API here...

// TODO(ahuszagh) Going to need to have much a more complex API here.
//   May need structured data to be passed to the request.
// But, at the very least, going to need to have a socket that works.
// NTOD
