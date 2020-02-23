symbol-data-lib
===============

Library and command-line scripts to facilitate debugging and accessing NEM Node data directly from stores. symbol-data-lib retreieves internal stores from:
- MongoDB
- RocksDB
- Blocks
- Spool
- Audit
- Configuration Files
- TCP
- And more.

# Getting Started

First, install the dependent modules.

```bash
npm install
```

Then, build the library and link the scripts to allow them to be run globally:

```bash
npm run build
npm link
```

Next, you can run the data scripts globally:

```bash
# Dump the mosaics collection from MongoDB.
$ catapult-mongo-dump --collection mosaics --limit 1 --verbose
Running catapult-mongo-dump with: 
    database     = mongodb://db:27017/catapult
    collection   = mosaics
    limit        = 1
Connected to mongo at mongodb://db:27017/catapult
[
    {
        "mosaic": {
            "id": "61F6EFB8D6BF2705",
            "supply": "8998999998000000",
            "startHeight": "1",
            "owner": {
                "publicKey": "F7E69E0A1E1D00459D6B1D315986A60B582BDEF8BB51EA6498A0ECA59AB7A2B4",
                "address": "TDDN4FLEN4SO4HPV2BT4GUFVQDID6R2HZOOWAXEC"
            },
            "revision": 1,
            "flags": 2,
            "divisibility": 6,
            "duration": "0"
        }
    }
]

# Dump the accounts collection from RocksDB.
$ catapult-rocks-dump --collection AccountStateCache --limit 1 --verbose
Running catapult-rocks-dump with: 
    data-dir     = /data
    collection   = AccountStateCache
    limit        = 1
    output       = stdout
Connected to rocks at /data/statedb/AccountStateCache
{
    "TD6BXOCQ3TQOKEWKGO4EAV6DO4B7TSSDM7M6B76C": {
        "address": "TD6BXOCQ3TQOKEWKGO4EAV6DO4B7TSSDM7M6B76C",
        "addressHeight": "1",
        "publicKey": "0000000000000000000000000000000000000000000000000000000000000000",
        "publicKeyHeight": "0",
        "accountType": 0,
        "linkedAccountKey": "0000000000000000000000000000000000000000000000000000000000000000",
        "importances": [
            {
                "value": "0",
                "height": "0"
            },
            {
                "value": "0",
                "height": "0"
            },
            {
                "value": "0",
                "height": "0"
            }
        ],
        "activityBuckets": [
            {
                "startHeight": "0",
                "totalFeesPaid": "0",
                "beneficiaryCount": 0,
                "rawScore": "0"
            },
            {
                "startHeight": "0",
                "totalFeesPaid": "0",
                "beneficiaryCount": 0,
                "rawScore": "0"
            },
            {
                "startHeight": "0",
                "totalFeesPaid": "0",
                "beneficiaryCount": 0,
                "rawScore": "0"
            },
            {
                "startHeight": "0",
                "totalFeesPaid": "0",
                "beneficiaryCount": 0,
                "rawScore": "0"
            },
            {
                "startHeight": "0",
                "totalFeesPaid": "0",
                "beneficiaryCount": 0,
                "rawScore": "0"
            },
            {
                "startHeight": "0",
                "totalFeesPaid": "0",
                "beneficiaryCount": 0,
                "rawScore": "0"
            },
            {
                "startHeight": "0",
                "totalFeesPaid": "0",
                "beneficiaryCount": 0,
                "rawScore": "0"
            }
        ],
        "mosaics": [
            {
                "mosaicId": "61F6EFB8D6BF2705",
                "amount": "449949999900000"
            }
        ]
    }
}

# Dump the time-sync configuration file.
$ catapult-config-dump --collection time-sync --verbose
Running catapult-config-dump with: 
    config-dir   = /userconfig/resources
    collection   = time-sync
    output       = stdout
{
    "maxNodes": 20
}

# Dump the block audit data.
$ catapult-audit-dump --collection block --limit 1 --verbose
Running catapult-audit-dump with: 
    data-dir     = /data
    collection   = block
    limit        = 1
    output       = stdout
{
    "8956342029": {
        "2308": {
            "source": 2,
            "sourcePublicKey": "8D270FA5E8E30D01182E8A339A31818856E30ABD0249662CFBA43CE8610333D3",
            "blocks": [
                {
                    "entity": {
                        "signature": "8F16C9EBC4A4BF2782AE98203C50859B2876E24DAE2D1230637C862E61C8E6D8FD60588EC8B7616B31CC1C153D5E8206C15338A7EA0C597A22F2C65DF5E7E00B",
                        "key": "C151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B787",
                        "version": 1,
                        "network": 152,
                        "type": 33091
                    },
                    "block": {
                        "height": "99085",
                        "timestamp": "8997981668",
                        "difficulty": "10000000000000",
                        "previousBlockHash": "A242ADCDAA7154044E0A68742162725A5EF934945D166654F8139D124BA333DE",
                        "transactionsHash": "0000000000000000000000000000000000000000000000000000000000000000",
                        "receiptsHash": "2C58E870D91B7FD590C2C5EBB85DE610D6B3C6B65C71CE1CE2EEC207A9936409",
                        "stateHash": "D5022EF8E3B4A6CC6D38008DB9AAF1B478CC5689BB8E02D84370A091E0033FDD",
                        "beneficiaryPublicKey": "C151A3A63E7AFF6BDB78BF40E8A78C772DDB36E2306401771B0BFDCD4DD3B787",
                        "feeMultiplier": 0
                    }
                }
            ]
        }
    }
}

# Dump the block change spool data.
$ catapult-spool-dump --collection block_change --limit 1 --verbose
Running catapult-spool-dump with: 
    data-dir     = /data
    collection   = block_change
    limit        = 1
    output       = stdout
{
    "0000000000001141.dat": {
        "type": 0,
        "entity": {
            "signature": "20931835AB26A2448963D94AB20F4DF8FA085A24BE5C74AA07E0DDBBE13653D7ED990CE916AEDC9BAACF7B0BBD705BA5CABA749250FECEE453B7860DB7F6B10A",
            "key": "B35833B6DDF147DEEE0F659335EE4331EEAE80670F45D29FF4EC02C46303866B",
            "version": 1,
            "network": 152,
            "type": 33091
        },
        "block": {
            "height": "4418",
            "timestamp": "8925016934",
            "difficulty": "29130111651049",
            "previousBlockHash": "6901340858C2D50BA5C932EBA7B11FF0CB8A37CB3F4737CC546ECD3D81B4E9C6",
            "transactionsHash": "0000000000000000000000000000000000000000000000000000000000000000",
            "receiptsHash": "074211776A2CEBBB80F25FED1240B1E198726851049DAC3A53E64D8E2278C99F",
            "stateHash": "9CDE58E25EDEDE785F18FD167F70FD209282C9774500FFE2F6FBA549F1FD3EB5",
            "beneficiaryPublicKey": "B35833B6DDF147DEEE0F659335EE4331EEAE80670F45D29FF4EC02C46303866B",
            "feeMultiplier": 0
        },
        "entityHash": "19E7D670763E6B1063842151AC6D788C8C4C9B3F7F02534E9A0A0DBD772C0E5E",
        "generationHash": "DCAE35B5B292852C0C75ACA430251569FE4ED2C4C60830CA5D7A027CB5983C94",
        "transactions": [],
        "merkleRoots": [
            "75323D5482A81D971ADB848DAF9E812EDBB06CD0727A59FC42CBB0D209D0091C",
            "7ECA4CBCAAE5BB32BDEEF6772BE7F3BE2D763C48039A40C09BB215717C6B3A89",
            "4013692D1BEEB8F511C8259D4CE8C012672385372D863064B6D520A016479AF1",
            "0000000000000000000000000000000000000000000000000000000000000000",
            "0000000000000000000000000000000000000000000000000000000000000000",
            "0000000000000000000000000000000000000000000000000000000000000000",
            "0000000000000000000000000000000000000000000000000000000000000000",
            "0000000000000000000000000000000000000000000000000000000000000000",
            "0000000000000000000000000000000000000000000000000000000000000000"
        ],
        "blockStatement": {
            "transactionStatements": [
                {
                    "source": {
                        "primaryId": 0,
                        "secondaryId": 0
                    },
                    "receipts": [
                        {
                            "type": 8515,
                            "version": 1,
                            "mosaic": {
                                "id": "61F6EFB8D6BF2705",
                                "amount": "0"
                            },
                            "targetPublicKey": "B35833B6DDF147DEEE0F659335EE4331EEAE80670F45D29FF4EC02C46303866B"
                        }
                    ]
                }
            ],
            "addressResolutionStatements": [],
            "mosaicResolutionStatements": []
        }
    }
}

# Dump the block data.
$ catapult-block-dump --limit 2 --verbose
Running catapult-block-dump with: 
    data-dir     = /data
    collection   = block_change
    limit        = 2
    output       = stdout
{
    "00000": {
        "04418.stmt": {
            "transactionStatements": [
                {
                    "source": {
                        "primaryId": 0,
                        "secondaryId": 0
                    },
                    "receipts": [
                        {
                            "type": 8515,
                            "version": 1,
                            "mosaic": {
                                "id": "61F6EFB8D6BF2705",
                                "amount": "0"
                            },
                            "targetPublicKey": "B35833B6DDF147DEEE0F659335EE4331EEAE80670F45D29FF4EC02C46303866B"
                        }
                    ]
                }
            ],
            "addressResolutionStatements": [],
            "mosaicResolutionStatements": []
        },
        "04418.dat": {
            "entity": {
                "signature": "20931835AB26A2448963D94AB20F4DF8FA085A24BE5C74AA07E0DDBBE13653D7ED990CE916AEDC9BAACF7B0BBD705BA5CABA749250FECEE453B7860DB7F6B10A",
                "key": "B35833B6DDF147DEEE0F659335EE4331EEAE80670F45D29FF4EC02C46303866B",
                "version": 1,
                "network": 152,
                "type": 33091
            },
            "block": {
                "height": "4418",
                "timestamp": "8925016934",
                "difficulty": "29130111651049",
                "previousBlockHash": "6901340858C2D50BA5C932EBA7B11FF0CB8A37CB3F4737CC546ECD3D81B4E9C6",
                "transactionsHash": "0000000000000000000000000000000000000000000000000000000000000000",
                "receiptsHash": "074211776A2CEBBB80F25FED1240B1E198726851049DAC3A53E64D8E2278C99F",
                "stateHash": "9CDE58E25EDEDE785F18FD167F70FD209282C9774500FFE2F6FBA549F1FD3EB5",
                "beneficiaryPublicKey": "B35833B6DDF147DEEE0F659335EE4331EEAE80670F45D29FF4EC02C46303866B",
                "feeMultiplier": 0
            },
            "entityHash": "19E7D670763E6B1063842151AC6D788C8C4C9B3F7F02534E9A0A0DBD772C0E5E",
            "generationHash": "DCAE35B5B292852C0C75ACA430251569FE4ED2C4C60830CA5D7A027CB5983C94",
            "transactions": [],
            "merkleRoots": [
                "75323D5482A81D971ADB848DAF9E812EDBB06CD0727A59FC42CBB0D209D0091C",
                "7ECA4CBCAAE5BB32BDEEF6772BE7F3BE2D763C48039A40C09BB215717C6B3A89",
                "4013692D1BEEB8F511C8259D4CE8C012672385372D863064B6D520A016479AF1",
                "0000000000000000000000000000000000000000000000000000000000000000",
                "0000000000000000000000000000000000000000000000000000000000000000",
                "0000000000000000000000000000000000000000000000000000000000000000",
                "0000000000000000000000000000000000000000000000000000000000000000",
                "0000000000000000000000000000000000000000000000000000000000000000",
                "0000000000000000000000000000000000000000000000000000000000000000"
            ]
        }
    }
}
```

# Library Usage

symbol-data-lib also exposes a library, simplifying data access from catapult data stores.

# Detailed Instructions

The following scripts use paths by default within the Docker container, however, it may be easier to run them from outside the docker container (to avoid having to install NPM, cloning the repository, and installing the dependencies). However, some issues arise when running these tools outside of a container.

**Configuring Audit, Block, and Spool**

The audit, block, and spool require superuser privileges (sudo or admin access) in order to read the generated data.

**Configuring Mongo DB**

Docker compose does not by default expose port 27017, so we must expose this in the `db` image:

```yaml
  db:
    ports:
    - "27017:27017"
```

After starting our node, we can use the scripts above but customize the database path and data-dir to allow their use outside the container:

```bash
# Dump the mosaics collection from MongoDB.
$ catapult-mongo-dump --database mongodb://localhost:27017/catapult \
    --collection mosaics --limit 1 --verbose
...

# Dump the accounts collection from RocksDB.
$ catapult-service-bootstrap="~/catapult-service-bootstrap"
$ catapult-rocks-dump --data-dir "$catapult-service-bootstrap/data/api-node-0"  \
    --collection AccountStateCache --limit 1 --verbose
...
```

Alternatively, you can either modify the Dockerfiles to install, build, and link the scripts inside the `db` and `api-node-0` commands. From there, you would find the proper container ID via `docker ps`, and run `docker exec -it $id /bin/bash` to enter an interactive session of the running container. From there, run the desired script.

**Configuring TCP**

Docker compose does not by default expose port 7900 and 7902, so we must expose this in the `api-node` and `api-broker` images, respectively:

```yaml
  api-node:
    ports:
    - "7900:7900"

  api-broker:
    ports:
    - "7902:7902"
```

# Compatibility Warning

These tools are meant to debug issues with local nodes in catapult, by providing human-readable access to the underlying storage. This should not be used as an alternative to the REST API, as this code relies on internal databases that are not documented and may be change at any time for any reason.

# Testing

The tests are only guaranteed to work on little-endian systems, and will likely fail on big-endian systems. The rest of the code should work regardless on other platforms. Ideally, we should test big-endian systems later.

# License

symbol-data-lib is licensed under the Apache 2.0 license. See [LICENSE](/LICENSE) for more information.

# Contributing

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in symbol-data-lib by you, as defined in the Apache-2.0 license, shall be licensed as above, without any additional terms or conditions.
