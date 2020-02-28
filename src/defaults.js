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
  // TODO(ahuszagh) Here...
}

/**
 *  Get value if present, otherwise get default.
 */
const getValue = (options, key) => {
  if (options === undefined || options[key] === undefined) {
    return DEFAULTS[key]
  } else {
    return options[key]
  }
}

// Create a map of the getters for each default value.
const defaults = {}
for (let key of Object.keys(DEFAULTS)) {
  defaults[key] = (options) => getValue(options, key)
}

export default defaults
