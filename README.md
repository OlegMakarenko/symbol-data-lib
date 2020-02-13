catapult-scripts
================

Command-line scripts to facilitate debugging and accessing NEM MongoDB and RocksDB data.

# Getting Started

First, build and link the scripts to allow them to be run globally:

```bash
npm run build
npm link
```

Next, you can run them globally:

```bash
catapult-mongo-dump --collection mosaics --limit 1 --verbose
Running catapult-mongo-dump with: 
    database     = mongodb://localhost:27017/catapult
    collection   = mosaics
    limit        = 1
Connected to mongo at mongodb://localhost:27017/catapult
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

# TODO(ahuszagh) Add catapult-rocks-dump
```

# License

catapult-scripts is licensed under the Apache 2.0 license. See [LICENSE](/LICENSE) for more information.

# Contributing

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in catapult-scripts by you, as defined in the Apache-2.0 license, shall be licensed as above, without any additional terms or conditions.
