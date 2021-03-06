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
 *  Codecs to read data to native Javascript objects.
 */

import audit from './audit'
import block from './block'
import config from './config'
import mongo from './mongo'
import rocks from './rocks'
import spool from './spool'
import tcp from './tcp'
import zmq from './zmq'

export default {
  audit,
  block,
  config,
  mongo,
  rocks,
  spool,
  tcp,
  zmq
}
