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
 *  Codec to transform configuration files to JSON.
 *
 *  The configuration files are an INI format,
 *  with a C++-like grammar.
 */

import fs from 'fs'
import path from 'path'
import shared from '../util/shared'

// HELPERS

/**
 *  Split string on first instance of character.
 */
const splitOne = (string, character) => {
  let index = string.indexOf(character)
  if (index === -1) {
    return [string]
  } else {
    return [string.slice(0, index), string.slice(index+1)]
  }
}

// TODO(ahuszagh) Need specialized ways to parse integers, etc.

// PARSERS

/**
 *  Parse a generic file size from an INI value.
 */
const parseFileSize = value => {
  // Check the value matches the correct regular expression, then return it.
  if (!/^\d+[KMG]?B$/i.test(value)) {
    throw new Error(`invalid file size, got ${value}`)
  }
  return value
}

/**
 *  Parse a big integer from an INI value.
 */
const parseBigInteger= value => {
  let str = value.replace(/'/g, '')
  if (str.length === 0) {
    throw new Error('invalid integer, got empty string')
  } else if (!/^\d+$/.test(str)) {
    throw new Error(`unexpected integer string, got ${value}`)
  }
  return str
}

/**
 *  Parse a generic integer from an INI value.
 */
const parseInteger = value => {
  return parseInt(parseBigInteger(value))
}

/**
 *  Parse a generic hex integer from an INI value.
 */
const parseHexInteger = value => {
  let str = value.replace(/'/g, '')
  if (!/^0x[A-Fa-f0-9]+$/.test(str)) {
    throw new Error(`unexpected hex integer string, got ${value}`)
  }
  let digits = str.slice(2)
  let high = parseInt(digits.slice(0, 8), 16)
  let low = parseInt(digits.slice(8), 16)

  return shared.idToHex([low, high])
}

/**
 *  Parse a generic boolean value.
 */
const parseBoolean = value => {
  if (value === 'false') {
    return false
  } else if (value === 'true') {
    return true
  } else {
    throw new Error(`unexpected boolean string, got ${value}`)
  }
}

/**
 *  Parse a generic string (identity operation).
 */
const parseString = value => value

/**
 *  Parse a list of strings.
 */
const parseStringList = value => {
  let list = []
  for (let item of value.split(',')) {
    let trimmed = item.trim()
    if (trimmed.length === 0) {
      throw new Error('unexpected empty string in list')
    }
    list.push(trimmed)
  }
  return list
}

const DELEGATION_POLICIES = new Set(['Age', 'Importance'])

/**
 *  Parse the harvesting delegation policy.
 */
const parseDelegationPolicy = value => {
  if (!DELEGATION_POLICIES.has(value)) {
    throw new Error(`invalid harvesting delegation policy, got ${value}`)
  }
  return value
}

const SINK_TYPES = new Set(['Sync', 'Async'])

/**
 *  Parse the logging sync type.
 */
const parseSinkType = value => {
  if (!SINK_TYPES.has(value)) {
    throw new Error(`invalid sink type, got ${value}`)
  }
  return value
}

const LOG_LEVELS = new Set(['Trace', 'Debug', 'Info', 'Warning', 'Error', 'Fatal', 'Min', 'Max'])

/**
 *  Parse the logging level.
 */
const parseLogLevel = value => {
  if (!LOG_LEVELS.has(value)) {
    throw new Error(`invalid log level, got ${value}`)
  }
  return value
}

const COLOR_MODES = new Set(['Ansi', 'AnsiBold', 'None'])

/**
 *  Parse the logging color mode.
 */
const parseColorMode = value => {
  if (!COLOR_MODES.has(value)) {
    throw new Error(`invalid color mode, got ${value}`)
  }
  return value
}

const NETWORK_IDENTIFIERS = new Set(['mijin', 'mijin-test', 'public', 'public-test'])

/**
 *  Parse the network identifier.
 */
const parseNetworkIdentifier = value => {
  if (!NETWORK_IDENTIFIERS.has(value)) {
    throw new Error(`invalid network identifier, got ${value}`)
  }
  return value
}

const NODE_EQUALITY = new Set(['public-key', 'host'])

/**
 *  Parse the network identifier.
 */
const parseNodeEqualityStrategy = value => {
  if (!NODE_EQUALITY.has(value)) {
    throw new Error(`invalid node equality strategy, got ${value}`)
  }
  return value
}

/**
 *  Parse a time span.
 */
const parseTimeSpan = value => {
  // Check the value matches the correct regular expression, then return it.
  if (!/^\d+(?:(?:ms)|[smh])$/i.test(value)) {
    throw new Error(`invalid time span, got ${value}`)
  }
  return value
}

/**
 *  Parse a block span.
 */
const parseBlockSpan = value => {
  // Check the value matches the correct regular expression, then return it.
  if (!/^\d+[mhd]$/i.test(value)) {
    throw new Error(`invalid block span, got ${value}`)
  }
  return value
}

const LOGGING_SECTIONS = new Set(['console', 'console.component.levels', 'file', 'file.component.levels'])

/**
 *  Get if the logging section is valid.
 */
const isValidLoggingSection = key => {
  return LOGGING_SECTIONS.has(key)
}

/**
 *  Get if the plugin name is valid.
 */
const isValidPluginName = name => {
  return /[A-Za-z.]/.test(name)
}

// TODO(ahuszagh) Need parsers for specialized values
//   Etc...

/**
 *  Parse a general INI file from a UTF-8 string.
 */
const parseIni = ini => {
  // Create a result, and store a reference to the current hierarchy.
  let result = {}
  let current = result

  // Split data into lines, then iteratively process each line.
  let lines = ini.split(/\r?\n/)
  for (let line of lines) {
    let trimmed = line.trim()
    if (trimmed.length === 0) {
      // Empty, skip the line
      continue
    } else if (trimmed[0] === '#' || trimmed[0] === ';') {
      // Comment, skip the line
      continue
    } else if (trimmed[0] === '[') {
      // Have a section.
      if (trimmed.length < 2 || trimmed[trimmed.length - 1] !== ']') {
        throw new Error('invalid section in INI file, no ending bracket.')
      }
      let section = trimmed.slice(1, trimmed.length - 1).trim()
      if (result.hasOwnProperty(section)) {
        throw new Error(`section ${section} already defined, cannot have duplicate sections.`)
      }
      result[section] = current = {}
    } else {
      // Have a value, split by the value.
      let split = splitOne(trimmed, '=')
      if (split.length === 1) {
        throw new Error('invalid key/value pair in INI file, no "=" character found.')
      }
      let [key, value] = split.map(item => item.trim())
      if (current.hasOwnProperty(key)) {
        throw new Error(`section has duplicate key ${key}, cannot have duplicate keys.`)
      }
      current[key] = value
    }
  }

  return result
}

// CODEC

/**
 *  Codec for well-known plugin stores.
 */
const plugin = {
  'catapult.plugins.accountlink': data => {
    // Sometimes a dummy value will be kept to ensure it loads.
    if (Object.keys(data).length > 1) {
      throw new Error('invalid catapult.plugins.accountlink plugin, got unexpected keys.')
    }

    return {}
  },

  'catapult.plugins.aggregate': data => {
    let maxTransactionsPerAggregate = parseInteger(data.maxTransactionsPerAggregate)
    let maxCosignaturesPerAggregate = parseInteger(data.maxCosignaturesPerAggregate)
    let enableStrictCosignatureCheck = parseBoolean(data.enableStrictCosignatureCheck)
    let enableBondedAggregateSupport = parseBoolean(data.enableBondedAggregateSupport)
    let maxBondedTransactionLifetime = parseTimeSpan(data.maxBondedTransactionLifetime)
    if (Object.keys(data).length !== 5) {
      throw new Error('invalid catapult.plugins.aggregate plugin, got unexpected keys.')
    }

    return {
      maxTransactionsPerAggregate,
      maxCosignaturesPerAggregate,
      enableStrictCosignatureCheck,
      enableBondedAggregateSupport,
      maxBondedTransactionLifetime
    }
  },

  'catapult.plugins.lockhash': data => {
    let lockedFundsPerAggregate = parseBigInteger(data.lockedFundsPerAggregate)
    let maxHashLockDuration = parseBlockSpan(data.maxHashLockDuration)
    if (Object.keys(data).length !== 2) {
      throw new Error('invalid catapult.plugins.lockhash plugin, got unexpected keys.')
    }

    return {
      lockedFundsPerAggregate,
      maxHashLockDuration
    }
  },

  'catapult.plugins.locksecret': data => {
    let maxSecretLockDuration = parseBlockSpan(data.maxSecretLockDuration)
    let minProofSize = parseInteger(data.minProofSize)
    let maxProofSize = parseInteger(data.maxProofSize)
    if (Object.keys(data).length !== 3) {
      throw new Error('invalid catapult.plugins.locksecret plugin, got unexpected keys.')
    }

    return {
      maxSecretLockDuration,
      minProofSize,
      maxProofSize
    }
  },

  'catapult.plugins.metadata': data => {
    let maxValueSize = parseInteger(data.maxValueSize)
    if (Object.keys(data).length !== 1) {
      throw new Error('invalid catapult.plugins.locksecret metadata, got unexpected keys.')
    }

    return {
      maxValueSize
    }
  },

  'catapult.plugins.mosaic': data => {
    let maxMosaicsPerAccount = parseInteger(data.maxMosaicsPerAccount)
    let maxMosaicDuration = parseBlockSpan(data.maxMosaicDuration)
    let maxMosaicDivisibility = parseInteger(data.maxMosaicDivisibility)
    let mosaicRentalFeeSinkPublicKey = parseString(data.mosaicRentalFeeSinkPublicKey)
    let mosaicRentalFee = parseBigInteger(data.mosaicRentalFee)
    if (Object.keys(data).length !== 5) {
      throw new Error('invalid catapult.plugins.mosaic metadata, got unexpected keys.')
    }

    return {
      maxMosaicsPerAccount,
      maxMosaicDuration,
      maxMosaicDivisibility,
      mosaicRentalFeeSinkPublicKey,
      mosaicRentalFee
    }
  },

  'catapult.plugins.multisig': data => {
    let maxMultisigDepth = parseInteger(data.maxMultisigDepth)
    let maxCosignatoriesPerAccount = parseInteger(data.maxCosignatoriesPerAccount)
    let maxCosignedAccountsPerAccount = parseInteger(data.maxCosignedAccountsPerAccount)
    if (Object.keys(data).length !== 3) {
      throw new Error('invalid catapult.plugins.multisig metadata, got unexpected keys.')
    }

    return {
      maxMultisigDepth,
      maxCosignatoriesPerAccount,
      maxCosignedAccountsPerAccount
    }
  },

  'catapult.plugins.namespace': data => {
    let maxNameSize = parseInteger(data.maxNameSize)
    let maxChildNamespaces = parseInteger(data.maxChildNamespaces)
    let maxNamespaceDepth = parseInteger(data.maxNamespaceDepth)
    let minNamespaceDuration = parseBlockSpan(data.minNamespaceDuration)
    let maxNamespaceDuration = parseBlockSpan(data.maxNamespaceDuration)
    let namespaceGracePeriodDuration = parseBlockSpan(data.namespaceGracePeriodDuration)
    let reservedRootNamespaceNames = parseStringList(data.reservedRootNamespaceNames)
    let namespaceRentalFeeSinkPublicKey = parseString(data.namespaceRentalFeeSinkPublicKey)
    let rootNamespaceRentalFeePerBlock = parseBigInteger(data.rootNamespaceRentalFeePerBlock)
    let childNamespaceRentalFee = parseBigInteger(data.childNamespaceRentalFee)
    if (Object.keys(data).length !== 10) {
      throw new Error('invalid catapult.plugins.namespace metadata, got unexpected keys.')
    }

    return {
      maxNameSize,
      maxChildNamespaces,
      maxNamespaceDepth,
      minNamespaceDuration,
      maxNamespaceDuration,
      namespaceGracePeriodDuration,
      reservedRootNamespaceNames,
      namespaceRentalFeeSinkPublicKey,
      rootNamespaceRentalFeePerBlock,
      childNamespaceRentalFee
    }
  },

  'catapult.plugins.restrictionaccount': data => {
    let maxAccountRestrictionValues = parseInteger(data.maxAccountRestrictionValues)
    if (Object.keys(data).length !== 1) {
      throw new Error('invalid catapult.plugins.restrictionaccount metadata, got unexpected keys.')
    }

    return {
      maxAccountRestrictionValues
    }
  },

  'catapult.plugins.restrictionmosaic': data => {
    let maxMosaicRestrictionValues = parseInteger(data.maxMosaicRestrictionValues)
    if (Object.keys(data).length !== 1) {
      throw new Error('invalid catapult.plugins.restrictionmosaic metadata, got unexpected keys.')
    }

    return {
      maxMosaicRestrictionValues
    }
  },

  'catapult.plugins.transfer': data => {
    let maxMessageSize = parseInteger(data.maxMessageSize)
    if (Object.keys(data).length !== 1) {
      throw new Error('invalid catapult.plugins.transfer metadata, got unexpected keys.')
    }

    return {
      maxMessageSize
    }
  }
}

/**
 *  Codec for the config stores.
 */
const codec = {
  // Parse the database config file from data.
  database: data => {
    let ini = parseIni(data)
    let databaseUri = parseString(ini.database.databaseUri)
    let databaseName = parseString(ini.database.databaseName)
    let maxWriterThreads = parseInteger(ini.database.maxWriterThreads)
    let plugins = {}
    for (let [key, value] of Object.entries(ini.plugins)) {
      plugins[key] = parseBoolean(value)
    }
    if (Object.keys(ini).length !== 2 || Object.keys(ini.database).length !== 3) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    return {
      databaseUri,
      databaseName,
      maxWriterThreads,
      plugins
    }
  },

  // Parse the general extensions config file from data.
  extensions: data => {
    let ini = parseIni(data)
    let extensions = {}
    for (let [key, value] of Object.entries(ini.extensions)) {
      extensions[key] = parseBoolean(value)
    }
    if (Object.keys(ini).length !== 1) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    return extensions
  },

  // Parse the extensions broker config file from data.
  extensionsBroker: data => codec.extensions(data),

  // Parse the extensions recovery config file from data.
  extensionsRecovery: data => codec.extensions(data),

  // Parse the extensions server config file from data.
  extensionsServer: data => codec.extensions(data),

  // Parse the harvesting config file from data.
  harvesting: data => {
    let ini = parseIni(data)
    let harvesterPrivateKey = parseString(ini.harvesting.harvesterPrivateKey)
    let enableAutoHarvesting = parseBoolean(ini.harvesting.enableAutoHarvesting)
    let maxUnlockedAccounts = parseInteger(ini.harvesting.maxUnlockedAccounts)
    let delegatePrioritizationPolicy = parseDelegationPolicy(ini.harvesting.delegatePrioritizationPolicy)
    let beneficiaryPublicKey  = parseString(ini.harvesting.beneficiaryPublicKey)
    if (Object.keys(ini).length !== 1 || Object.keys(ini.harvesting).length != 5) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    return {
      harvesterPrivateKey,
      enableAutoHarvesting,
      maxUnlockedAccounts,
      delegatePrioritizationPolicy,
      beneficiaryPublicKey
    }
  },

  // Parse the inflation config file from data.
  inflation: data => {
    let ini = parseIni(data)
    let keyPrefix = 'starting-at-height-'
    let inflation = {}
    for (let [key, value] of Object.entries(ini.inflation)) {
      if (!key.startsWith(keyPrefix)) {
        throw new Error(`invalid inflation key, got ${key}`)
      }
      let height = parseBigInteger(key.slice(keyPrefix.length))
      let amount = parseBigInteger(value)
      inflation[height] = amount
    }
    if (Object.keys(ini).length !== 1) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    return inflation
  },

  // Parse the general logging config file from data.
  logging: data => {
    let ini = parseIni(data)

    // Console
    let console = {
      sinkType: parseSinkType(ini.console.sinkType),
      level: parseLogLevel(ini.console.level),
      colorMode: parseColorMode(ini.console.colorMode),
      levels: []
    }
    let consoleLevels = ini['console.component.levels'] || {}
    for (let [key, value] of Object.entries(consoleLevels)) {
      console.levels[parseString(key)] = parseLogLevel(value)
    }
    if (Object.keys(ini.console).length !== 3) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    // File
    let file = {
      sinkType: parseSinkType(ini.file.sinkType),
      level: parseLogLevel(ini.file.level),
      directory: parseString(ini.file.directory),
      filePattern: parseString(ini.file.filePattern),
      rotationSize: parseFileSize(ini.file.rotationSize),
      maxTotalSize: parseFileSize(ini.file.maxTotalSize),
      minFreeSpace: parseFileSize(ini.file.minFreeSpace),
      levels: []
    }
    let fileLevels = ini['file.component.levels'] || {}
    for (let [key, value] of Object.entries(fileLevels)) {
      file.levels[parseString(key)] = parseLogLevel(value)
    }
    if (Object.keys(ini.file).length !== 7) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    // Need to check if any of the keys are invalid.
    if (!Object.keys(ini).every(isValidLoggingSection)) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    return {
      console,
      file
    }
  },

  // Parse the logging broker config file from data.
  loggingBroker: data => codec.logging(data),

  // Parse the logging recovery config file from data.
  loggingRecovery: data => codec.logging(data),

  // Parse the logging server config file from data.
  loggingServer: data => codec.logging(data),

  // Parse the messaging config file from data.
  messaging: data => {
    let ini = parseIni(data)
    let subscriberPort = parseInteger(ini.messaging.subscriberPort)
    if (Object.keys(ini).length !== 1 || Object.keys(ini.messaging).length !== 1) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    return {
      subscriberPort
    }
  },

  // Parse the network config file from data.
  network: data => {
    let ini = parseIni(data)

    // Network
    let network = {
      identifier: parseNetworkIdentifier(ini.network.identifier),
      nodeEqualityStrategy: parseNodeEqualityStrategy(ini.network.nodeEqualityStrategy),
      publicKey: parseString(ini.network.publicKey),
      generationHash: parseString(ini.network.generationHash),
      epochAdjustment: parseTimeSpan(ini.network.epochAdjustment)
    }
    if (Object.keys(ini.network).length !== 5) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    // Chain
    let enableVerifiableState = parseBoolean(ini.chain.enableVerifiableState)
    let enableVerifiableReceipts = parseBoolean(ini.chain.enableVerifiableReceipts)
    let currencyMosaicId = parseHexInteger(ini.chain.currencyMosaicId)
    let harvestingMosaicId = parseHexInteger(ini.chain.harvestingMosaicId)
    let blockGenerationTargetTime = parseTimeSpan(ini.chain.blockGenerationTargetTime)
    let blockTimeSmoothingFactor = parseInteger(ini.chain.blockTimeSmoothingFactor)
    let importanceGrouping = parseBigInteger(ini.chain.importanceGrouping)
    let importanceActivityPercentage = parseInteger(ini.chain.importanceActivityPercentage)
    let maxRollbackBlocks = parseInteger(ini.chain.maxRollbackBlocks)
    let maxDifficultyBlocks = parseInteger(ini.chain.maxDifficultyBlocks)
    let defaultDynamicFeeMultiplier = parseInteger(ini.chain.defaultDynamicFeeMultiplier)
    let maxTransactionLifetime = parseTimeSpan(ini.chain.maxTransactionLifetime)
    let maxBlockFutureTime = parseTimeSpan(ini.chain.maxBlockFutureTime)
    let initialCurrencyAtomicUnits = parseBigInteger(ini.chain.initialCurrencyAtomicUnits)
    let maxMosaicAtomicUnits = parseBigInteger(ini.chain.maxMosaicAtomicUnits)
    let totalChainImportance = parseBigInteger(ini.chain.totalChainImportance)
    let minHarvesterBalance = parseBigInteger(ini.chain.minHarvesterBalance)
    let maxHarvesterBalance = parseBigInteger(ini.chain.maxHarvesterBalance)
    let harvestBeneficiaryPercentage = parseInteger(ini.chain.harvestBeneficiaryPercentage)
    let blockPruneInterval = parseInteger(ini.chain.blockPruneInterval)
    let maxTransactionsPerBlock = parseInteger(ini.chain.maxTransactionsPerBlock)
    if (Object.keys(ini.chain).length !== 21) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    // Parse the plugins.
    let pluginPrefix = 'plugin:'
    let plugins = {}
    for (let [key, value] of Object.entries(ini)) {
      // Validate the key and skip the network and chain keys.
      if (key === 'network' || key === 'chain') {
        continue
      } else if (!key.startsWith(pluginPrefix)) {
        throw new Error('invalid configuration file, got unexpected keys.')
      }

      // Parse and validate the plugin name.
      let name = key.slice(pluginPrefix.length)
      if (!isValidPluginName(name)) {
        throw new Error('invalid configuration file, got invalid plugin name.')
      }

      // Parse the plugin data.
      let callback = plugin[name]
      if (callback !== undefined) {
        // Well-known plugin, use it.
        plugins[name] = callback(value)
      } else {
        // Custom plugin, just keep the default data.
        plugins[name] = value
      }
    }

    return {
      network,
      enableVerifiableState,
      enableVerifiableReceipts,
      currencyMosaicId,
      harvestingMosaicId,
      blockGenerationTargetTime,
      blockTimeSmoothingFactor,
      importanceGrouping,
      importanceActivityPercentage,
      maxRollbackBlocks,
      maxDifficultyBlocks,
      defaultDynamicFeeMultiplier,
      maxTransactionLifetime,
      maxBlockFutureTime,
      initialCurrencyAtomicUnits,
      maxMosaicAtomicUnits,
      totalChainImportance,
      minHarvesterBalance,
      maxHarvesterBalance,
      harvestBeneficiaryPercentage,
      blockPruneInterval,
      maxTransactionsPerBlock,
      plugins
    }
  },

  // Parse the network height config file from data.
  networkHeight: data => {
    let ini = parseIni(data)
    let maxNodes = parseInteger(ini.networkheight.maxNodes)
    if (Object.keys(ini).length !== 1 || Object.keys(ini.networkheight).length !== 1) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    return {
      maxNodes
    }
  },

  // Parse the node config file from data.
  node: data => {
    // TODO(ahuszagh) Implement
  },

  // Parse the partial transactions config file from data.
  partialTransactions: data => {
    let ini = parseIni(data)
    let cacheMaxResponseSize = parseFileSize(ini.partialtransactions.cacheMaxResponseSize)
    let cacheMaxSize = parseInteger(ini.partialtransactions.cacheMaxSize)
    if (Object.keys(ini).length !== 1 || Object.keys(ini.partialtransactions).length !== 2) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    return {
      cacheMaxResponseSize,
      cacheMaxSize
    }
  },

  // Parse the task config file from data.
  task: data => {
    // TODO(ahuszagh) Implement
  },

  // Parse the time sync config file from data.
  timeSync: data => {
    let ini = parseIni(data)
    let maxNodes = parseInteger(ini.timesynchronization.maxNodes)
    if (Object.keys(ini).length !== 1 || Object.keys(ini.timesynchronization).length !== 1) {
      throw new Error('invalid configuration file, got unexpected keys.')
    }

    return {
      maxNodes
    }
  },

  // Parse the user config file from data.
  user: data => {
    // TODO(ahuszagh) Implement
  },

  // TODO(ahuszagh) Add more config file types...

  // Parse the peers API config file from data.
  peersApi: data => {
    // TODO(ahuszagh) Implement
  },

  // Parse the peers P2P config file from data.
  peersP2p: data => {
    // TODO(ahuszagh) Implement
  },

  // Read a generic configuration file.
  file: file => {
    let data = fs.readFileSync(file, 'utf8')
    let basename = path.basename(file)
    if (basename === 'config-database.properties') {
      return codec.database(data)
    } else if (basename === 'config-extensions-broker.properties') {
      return codec.extensionsBroker(data)
    } else if (basename === 'config-extensions-recovery.properties') {
      return codec.extensionsRecovery(data)
    } else if (basename === 'config-extensions-server.properties') {
      return codec.extensionsServer(data)
    } else if (basename === 'config-harvesting.properties') {
      return codec.harvesting(data)
    } else if (basename === 'config-inflation.properties') {
      return codec.inflation(data)
    } else if (basename === 'config-logging-broker.properties') {
      return codec.loggingBroker(data)
    } else if (basename === 'config-logging-recovery.properties') {
      return codec.loggingRecovery(data)
    } else if (basename === 'config-logging-server.properties') {
      return codec.loggingServer(data)
    } else if (basename === 'config-messaging.properties') {
      return codec.messaging(data)
    } else if (basename === 'config-network.properties') {
      return codec.network(data)
    } else if (basename === 'config-networkheight.properties') {
      return codec.networkHeight(data)
    } else if (basename === 'config-node.properties') {
      return codec.node(data)
    } else if (basename === 'config-pt.properties') {
      return codec.partialTransactions(data)
    } else if (basename === 'config-task.properties') {
      return codec.task(data)
    } else if (basename === 'config-timesync.properties') {
      return codec.timeSync(data)
    } else if (basename === 'config-user.properties') {
      return codec.user(data)
    } else if (basename === 'peers-api.json') {
      return codec.peersApi(data)
    } else if (basename === 'peers-p2p.json') {
      return codec.peersP2p(data)
    } else {
      throw new Error(`invalid configuration file, got ${basename}`)
    }
  },

  // Read all configuration files in a directory.
  directory: directory => {
    // Get all our files.
    let files = fs.readdirSync(directory)
      .filter(file => file.endsWith('.properties') || file.endsWith('.json'))
      .map(file => path.join(directory, file))

    // Parse all the configuration files and return the data.
    let result = {}
    for (let file of files) {
      result[path.basename(file)] = codec.file(file)
    }
    return result
  },
}

export default codec
