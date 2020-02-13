catapult-scripts
================

Command-line scripts to facilitate debugging and accessing NEM MongoDB and RocksDB data.

# Getting Started

First, install the dependent modules.

```bash
npm install
```

Then, build and link the scripts to allow them to be run globally:

```bash
npm run build
npm link
```

Next, you can run them globally:

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
```

# Details

The following scripts use paths by default within the Docker container, however, it may be easier to run them from outside the docker container (to avoid having to install NPM, cloning the repository, and installing the dependencies). To do so, we must expose port `27017` on the `db` image:

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


# License

catapult-scripts is licensed under the Apache 2.0 license. See [LICENSE](/LICENSE) for more information.

# Contributing

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in catapult-scripts by you, as defined in the Apache-2.0 license, shall be licensed as above, without any additional terms or conditions.
