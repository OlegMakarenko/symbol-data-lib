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

// TODO(ahuszagh) Remove this code
//
//  The request code, in JS:
//  const packetBuffer = packetHeader.createBuffer(PacketType.nodeDiscoveryPullPing, packetHeader.size);
//  const packetHeader = {
//    /**
//     * @property {numeric} size The size (in bytes) of a packet header.
//     */
//    size: 8,
//
//    /**
//     * Creates a packet header buffer.
//     * @param {module:packet/types} type The packet type.
//     * @param {numeric} size The packet size.
//     * @returns {Buffer} The packet header buffer.
//     */
//    createBuffer: (type, size) => {
//      const header = Buffer.alloc(packetHeader.size);
//      header.writeInt32LE(size, 0);
//      header.writeInt32LE(type, 4);
//      return header;
//    }
//  };
//
//  How do I connect?
//    Assuming I need to authenticate, then send something? Hmmm
//    Anyway, in the meantime, I can just use the REST gateway for all of this....

/**
 *  Codec for TCP models.
 */
const codec = {

  // TODO(ahuszagh) Going to need the correct data for this :D
  // TODO(ahuszagh) Implement...
}


export default codec
