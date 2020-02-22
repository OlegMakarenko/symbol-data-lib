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
 *  Utilities to facilitate processing collection names.
 */

/**
 *  Parse comma-separated collection names to array.
 */
const parse = (collection, all) => {
  if (collection === 'all') {
    return all
  }

  return collection.split(',')
    .map(name => name.trim())
}

/**
 *  Get if the collection name(s) are valid.
 */
const isValid = (collection, all, lookup) => {
  return parse(collection, all)
    .every(name => lookup.has(name))
}

export default {
  parse,
  isValid
}
