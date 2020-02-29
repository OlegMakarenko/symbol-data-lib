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
 *  Default values for options.
 */

// Hard-coded default values.
const DEFAULTS = {
  configDir: '/userconfig/resources',
  dataDir: '/data',
  database: 'mongodb://db:27017/catapult',
  limit: 0,
  verbose: false,
  hashAlgorithm: 'keccak',
  host: 'localhost',
  tcpPort: 7900,
  zmqPort: 7902,
  interval: 1000
}

/**
 *  Get value if present, otherwise get default.
 */
const getValue = (options, optionsKey, defaultsKey) => {
  // Defaults key is optional, only if it differs from the options key.
  if (defaultsKey === undefined) {
    defaultsKey = optionsKey
  }

  // Return the defaults if options is undefined or not-specified.
  if (options === undefined || options[optionsKey] === undefined) {
    return DEFAULTS[defaultsKey]
  } else {
    return options[optionsKey]
  }
}

export default {
  configDir: (options) => getValue(options, 'configDir'),
  dataDir: (options) => getValue(options, 'dataDir'),
  database: (options) => getValue(options, 'database'),
  limit: (options) => getValue(options, 'limit'),
  verbose: (options) => getValue(options, 'verbose'),
  hashAlgorithm: (options) => getValue(options, 'hashAlgorithm'),
  host: (options) => getValue(options, 'host'),
  tcpPort: (options) => getValue(options, 'port', 'tcpPort'),
  zmqPort: (options) => getValue(options, 'port', 'zmqPort'),
  interval: (options) => getValue(options, 'interval')
}
