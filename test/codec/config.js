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

import expect from 'expect.js'
import path from 'path'
import config from '../../src/codec/config'

const CONFIG_DIR = path.resolve(__dirname, '..', 'config')

describe('config', () => {
  it('should parse database data', () => {
    let data = '[database]\n\ndatabaseUri = mongodb://db:27017\ndatabaseName = catapult\nmaxWriterThreads = 8\n\n[plugins]\n\ncatapult.mongo.plugins.accountlink = true\ncatapult.mongo.plugins.aggregate = true\ncatapult.mongo.plugins.lockhash = true\ncatapult.mongo.plugins.locksecret = true\ncatapult.mongo.plugins.metadata = true\ncatapult.mongo.plugins.mosaic = true\ncatapult.mongo.plugins.multisig = true\ncatapult.mongo.plugins.namespace = true\ncatapult.mongo.plugins.restrictionaccount = true\ncatapult.mongo.plugins.restrictionmosaic = true\ncatapult.mongo.plugins.transfer = true\n'
    let actual = config.database(data)
    expect(actual).to.eql({
      databaseUri: 'mongodb://db:27017',
      databaseName: 'catapult',
      maxWriterThreads: 8,
      plugins: {
        'catapult.mongo.plugins.accountlink': true,
        'catapult.mongo.plugins.aggregate': true,
        'catapult.mongo.plugins.lockhash': true,
        'catapult.mongo.plugins.locksecret': true,
        'catapult.mongo.plugins.metadata': true,
        'catapult.mongo.plugins.mosaic': true,
        'catapult.mongo.plugins.multisig': true,
        'catapult.mongo.plugins.namespace': true,
        'catapult.mongo.plugins.restrictionaccount': true,
        'catapult.mongo.plugins.restrictionmosaic': true,
        'catapult.mongo.plugins.transfer': true
      }
    })

    let file = path.join(CONFIG_DIR, 'config-database.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse extensions broker data', () => {
    let data = '[extensions]\n\n# api extensions\nextension.filespooling = false\nextension.partialtransaction = false\n\n# addressextraction must be first because mongo and zeromq depend on extracted addresses\nextension.addressextraction = true\nextension.mongo = true\nextension.zeromq = true\n\n# p2p extensions\nextension.eventsource = false\nextension.harvesting = false\nextension.syncsource = false\n\n# common extensions\nextension.diagnostics = false\nextension.hashcache = true\nextension.networkheight = false\nextension.nodediscovery = false\nextension.packetserver = false\nextension.pluginhandlers = false\nextension.sync = false\nextension.timesync = false\nextension.transactionsink = false\nextension.unbondedpruning = false\n\n'
    let actual = config.extensionsBroker(data)
    expect(actual).to.eql({
      'extension.filespooling': false,
      'extension.partialtransaction': false,
      'extension.addressextraction': true,
      'extension.mongo': true,
      'extension.zeromq': true,
      'extension.eventsource': false,
      'extension.harvesting': false,
      'extension.syncsource': false,
      'extension.diagnostics': false,
      'extension.hashcache': true,
      'extension.networkheight': false,
      'extension.nodediscovery': false,
      'extension.packetserver': false,
      'extension.pluginhandlers': false,
      'extension.sync': false,
      'extension.timesync': false,
      'extension.transactionsink': false,
      'extension.unbondedpruning': false
    })

    let file = path.join(CONFIG_DIR, 'config-extensions-broker.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse extensions recovery data', () => {
    let data = '[extensions]\n\n# api extensions\nextension.filespooling = false\nextension.partialtransaction = false\n\n# addressextraction must be first because mongo and zeromq depend on extracted addresses\nextension.addressextraction = true\nextension.mongo = true\nextension.zeromq = true\n\n# p2p extensions\nextension.eventsource = false\nextension.harvesting = false\nextension.syncsource = false\n\n# common extensions\nextension.diagnostics = false\nextension.hashcache = true\nextension.networkheight = false\nextension.nodediscovery = false\nextension.packetserver = false\nextension.pluginhandlers = false\nextension.sync = false\nextension.timesync = false\nextension.transactionsink = false\nextension.unbondedpruning = false\n'
    let actual = config.extensionsRecovery(data)
    expect(actual).to.eql({
      'extension.filespooling': false,
      'extension.partialtransaction': false,
      'extension.addressextraction': true,
      'extension.mongo': true,
      'extension.zeromq': true,
      'extension.eventsource': false,
      'extension.harvesting': false,
      'extension.syncsource': false,
      'extension.diagnostics': false,
      'extension.hashcache': true,
      'extension.networkheight': false,
      'extension.nodediscovery': false,
      'extension.packetserver': false,
      'extension.pluginhandlers': false,
      'extension.sync': false,
      'extension.timesync': false,
      'extension.transactionsink': false,
      'extension.unbondedpruning': false
    })

    let file = path.join(CONFIG_DIR, 'config-extensions-recovery.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse extensions server data', () => {
    let data = '[extensions]\n\n# api extensions\nextension.filespooling = true\nextension.partialtransaction = true\n\n# addressextraction must be first because mongo and zeromq depend on extracted addresses\nextension.addressextraction = false\nextension.mongo = false\nextension.zeromq = false\n\n# p2p extensions\nextension.eventsource = false\nextension.harvesting = true\nextension.syncsource = true\n\n# common extensions\nextension.diagnostics = true\nextension.hashcache = true\nextension.networkheight = false\nextension.nodediscovery = true\nextension.packetserver = true\nextension.pluginhandlers = true\nextension.sync = true\nextension.timesync = true\nextension.transactionsink = true\nextension.unbondedpruning = true\n'
    let actual = config.extensionsServer(data)
    expect(actual).to.eql({
      'extension.filespooling': true,
      'extension.partialtransaction': true,
      'extension.addressextraction': false,
      'extension.mongo': false,
      'extension.zeromq': false,
      'extension.eventsource': false,
      'extension.harvesting': true,
      'extension.syncsource': true,
      'extension.diagnostics': true,
      'extension.hashcache': true,
      'extension.networkheight': false,
      'extension.nodediscovery': true,
      'extension.packetserver': true,
      'extension.pluginhandlers': true,
      'extension.sync': true,
      'extension.timesync': true,
      'extension.transactionsink': true,
      'extension.unbondedpruning': true
    })

    let file = path.join(CONFIG_DIR, 'config-extensions-server.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse harvesting data', () => {
    let data = '[harvesting]\n\n# keys should look like 3485d98efd7eb07adafcfd1a157d89de2796a95e780813c0258af3f5f84ed8cb\n# Using same ket as boot key for this api-harvester config\nharvesterPrivateKey = 127C8DBCD3A58BE1148A8855CA507DB607B58DDBE21A6EA847C1C27BE0ACB2F2\nenableAutoHarvesting = true\nmaxUnlockedAccounts = 20\ndelegatePrioritizationPolicy = Importance\nbeneficiaryPublicKey = C1B4E25B491D6552F78EDE5A77CB74BB1743955500FB7FAB610338B639C2F763\n\n'
    let actual = config.harvesting(data)
    expect(actual).to.eql({
      harvesterPrivateKey: '127C8DBCD3A58BE1148A8855CA507DB607B58DDBE21A6EA847C1C27BE0ACB2F2',
      enableAutoHarvesting: true,
      maxUnlockedAccounts: 20,
      delegatePrioritizationPolicy: 'Importance',
      beneficiaryPublicKey: 'C1B4E25B491D6552F78EDE5A77CB74BB1743955500FB7FAB610338B639C2F763'
    })

    let file = path.join(CONFIG_DIR, 'config-harvesting.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse inflation data', () => {
    let data = '[inflation]\n\nstarting-at-height-2 = 95998521\nstarting-at-height-437757 = 91882261\n'
    let actual = config.inflation(data)
    expect(actual).to.eql({
      '2': '95998521',
      '437757': '91882261'
    })

    let file = path.join(CONFIG_DIR, 'config-inflation.properties')
    let inflation = config.file(file)
    for (let [key, value] of Object.entries(inflation)) {
      expect(key).to.match(/^\d+$/)
      expect(value).to.match(/^\d+$/)
    }
  })

  it('should parse logging broker data', () => {
    let data = '[console]\n\nsinkType = Async\nlevel = Debug\ncolorMode = Ansi\n\n[console.component.levels]\n\n# e.g. to log more verbose messages about the \'net\' component, uncomment\n# net = Debug\n\n[file]\n\nsinkType = Async\nlevel = Debug\ndirectory = logs\nfilePattern = catapult_broker%4N.log\nrotationSize = 25MB\nmaxTotalSize = 2500MB\nminFreeSpace = 100MB\n\n[file.component.levels]\n'
    let actual = config.loggingBroker(data)
    expect(actual).to.eql({
      console: {
        sinkType: 'Async',
        level: 'Debug',
        colorMode: 'Ansi',
        levels: []
      },
      file: {
        sinkType: 'Async',
        level: 'Debug',
        directory: 'logs',
        filePattern: 'catapult_broker%4N.log',
        rotationSize: '25MB',
        maxTotalSize: '2500MB',
        minFreeSpace: '100MB',
        levels: []
      }
    })

    let file = path.join(CONFIG_DIR, 'config-logging-broker.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse logging recovery data', () => {
    let data = '[console]\n\nsinkType = Async\nlevel = Debug\ncolorMode = Ansi\n\n[console.component.levels]\n\n# e.g. to log more verbose messages about the \'net\' component, uncomment\n# net = Debug\n\n[file]\n\nsinkType = Async\nlevel = Debug\ndirectory = logs\nfilePattern = catapult_recovery%4N.log\nrotationSize = 25MB\nmaxTotalSize = 2500MB\nminFreeSpace = 100MB\n\n[file.component.levels]\n'
    let actual = config.loggingRecovery(data)
    expect(actual).to.eql({
      console: {
        sinkType: 'Async',
        level: 'Debug',
        colorMode: 'Ansi',
        levels: []
      },
      file: {
        sinkType: 'Async',
        level: 'Debug',
        directory: 'logs',
        filePattern: 'catapult_recovery%4N.log',
        rotationSize: '25MB',
        maxTotalSize: '2500MB',
        minFreeSpace: '100MB',
        levels: []
      }
    })

    let file = path.join(CONFIG_DIR, 'config-logging-recovery.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse logging server data', () => {
    let data = '[console]\n\nsinkType = Async\nlevel = Debug\ncolorMode = Ansi\n\n[console.component.levels]\n\n# e.g. to log more verbose messages about the \'net\' component, uncomment\n# net = Debug\n\n[file]\n\nsinkType = Async\nlevel = Debug\ndirectory = logs\nfilePattern = catapult_server%4N.log\nrotationSize = 25MB\nmaxTotalSize = 2500MB\nminFreeSpace = 100MB\n\n[file.component.levels]\n'
    let actual = config.loggingServer(data)
    expect(actual).to.eql({
      console: {
        sinkType: 'Async',
        level: 'Debug',
        colorMode: 'Ansi',
        levels: []
      },
      file: {
        sinkType: 'Async',
        level: 'Debug',
        directory: 'logs',
        filePattern: 'catapult_server%4N.log',
        rotationSize: '25MB',
        maxTotalSize: '2500MB',
        minFreeSpace: '100MB',
        levels: []
      }
    })

    let file = path.join(CONFIG_DIR, 'config-logging-server.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse messaging data', () => {
    let data = '[messaging]\n\nsubscriberPort = 7902\n'
    let actual = config.messaging(data)
    expect(actual).to.eql({
      subscriberPort: 7902
    })

    let file = path.join(CONFIG_DIR, 'config-messaging.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse network data', () => {
    let file = path.join(CONFIG_DIR, 'config-network.properties')
    expect(config.file(file)).to.eql({
      network:{
        identifier: 'public-test',
        nodeEqualityStrategy: 'public-key',
        publicKey: '9BE93593C699867F1B4F624FD37BC7FB93499CDEC9929088F2FF1031293960FF',
        generationHash: '45870419226A7E51D61D94AD728231EDC6C9B3086EF9255A8421A4F26870456A',
        epochAdjustment: '1573430400s'
      },
      enableVerifiableState: true,
      enableVerifiableReceipts: true,
      currencyMosaicId: '51A99028058245A8',
      harvestingMosaicId: '51A99028058245A8',
      blockGenerationTargetTime: '15s',
      blockTimeSmoothingFactor: 3000,
      importanceGrouping: '1433',
      importanceActivityPercentage: 5,
      maxRollbackBlocks: 398,
      maxDifficultyBlocks: 60,
      defaultDynamicFeeMultiplier: 1000,
      maxTransactionLifetime: '24h',
      maxBlockFutureTime: '500ms',
      initialCurrencyAtomicUnits: '7831975436000000',
      maxMosaicAtomicUnits: '9000000000000000',
      totalChainImportance: '7831975436000000',
      minHarvesterBalance: '10000000000',
      maxHarvesterBalance: '50000000000000',
      harvestBeneficiaryPercentage: 25,
      blockPruneInterval: 360,
      maxTransactionsPerBlock: 1500,
      plugins: {
        'catapult.plugins.accountlink': {},
        'catapult.plugins.aggregate': {
          maxTransactionsPerAggregate: 1000,
          maxCosignaturesPerAggregate: 25,
          enableStrictCosignatureCheck: false,
          enableBondedAggregateSupport: true,
          maxBondedTransactionLifetime: '48h'
        },
        'catapult.plugins.lockhash': {
          lockedFundsPerAggregate: '10000000',
          maxHashLockDuration: '2d'
        },
        'catapult.plugins.locksecret': {
          maxSecretLockDuration: '30d',
          minProofSize: 1,
          maxProofSize: 1000
        },
        'catapult.plugins.metadata': {
          maxValueSize: 1024
        },
        'catapult.plugins.mosaic': {
          maxMosaicsPerAccount: 1000,
          maxMosaicDuration: '3650d',
          maxMosaicDivisibility: 6,
          mosaicRentalFeeSinkPublicKey: '4428A4DA56362C2293A277159F7C1E270FE7BD6CED461877494006C7D69F1172',
          mosaicRentalFee: '500'
        },
        'catapult.plugins.multisig': {
          maxMultisigDepth: 3,
          maxCosignatoriesPerAccount: 25,
          maxCosignedAccountsPerAccount: 25
        },
        'catapult.plugins.namespace': {
          maxNameSize: 64,
          maxChildNamespaces: 256,
          maxNamespaceDepth: 3,
          minNamespaceDuration: '30d',
          maxNamespaceDuration: '365d',
          namespaceGracePeriodDuration: '30d',
          reservedRootNamespaceNames: [
            'symbol',
            'symbl',
            'xym',
            'xem',
            'nem',
            'user',
            'account',
            'org',
            'com',
            'biz',
            'net',
            'edu',
            'mil',
            'gov',
            'info'
          ],
          namespaceRentalFeeSinkPublicKey: '4428A4DA56362C2293A277159F7C1E270FE7BD6CED461877494006C7D69F1172',
          rootNamespaceRentalFeePerBlock: '1',
          childNamespaceRentalFee: '100'
        },
        'catapult.plugins.restrictionaccount': {
          maxAccountRestrictionValues: 512
        },
        'catapult.plugins.restrictionmosaic': {
          maxMosaicRestrictionValues: 20
        },
        'catapult.plugins.transfer': {
          maxMessageSize: 1024
        }
      }
    })
  })

  it('should parse network height data', () => {
    let data = '[networkheight]\n\nmaxNodes = 5\n'
    let actual = config.networkHeight(data)
    expect(actual).to.eql({
      maxNodes: 5
    })

    let file = path.join(CONFIG_DIR, 'config-networkheight.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse node data', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse partial transactions data', () => {
    let data = '[partialtransactions]\n\ncacheMaxResponseSize = 20MB\ncacheMaxSize = 1\'000\'000\n'
    let actual = config.partialTransactions(data)
    expect(actual).to.eql({
      cacheMaxResponseSize: '20MB',
      cacheMaxSize: 1000000
    })

    let file = path.join(CONFIG_DIR, 'config-pt.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse task data', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse time synchronization data', () => {
    let data = '[timesynchronization]\n\nmaxNodes = 20\n'
    let actual = config.timeSync(data)
    expect(actual).to.eql({
      maxNodes: 20
    })

    let file = path.join(CONFIG_DIR, 'config-timesync.properties')
    expect(actual).to.eql(config.file(file))
  })

  it('should parse user data', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse peers API data', () => {
    // TODO(ahuszagh) Implement...
  })

  it('should parse peers P2P data', () => {
    // TODO(ahuszagh) Implement...
  })

  // TODO(ahuszagh) need to parse the directory.
  // Need to check the file parse works.
})

// TODO(ahuszagh) Here...
