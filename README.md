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
Running catapult-config-dump with: 
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
