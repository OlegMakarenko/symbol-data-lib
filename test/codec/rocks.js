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
import rocks from '../../src/codec/rocks'

describe('rocks', () => {
  describe('AccountRestrictionCache', () => {
    it('should parse a valid key', () => {
      let key = Buffer.from('98E0A3C020A97113893126969D78C7F5180B904C4A07DF478A', 'hex')
      let actual = rocks.AccountRestrictionCache.key(key)
      expect(actual).to.equal('TDQKHQBAVFYRHCJRE2LJ26GH6UMAXECMJID56R4K')
    })

    it('should parse a valid value', () => {
      let value = Buffer.from('010098E0A3C020A97113893126969D78C7F5180B904C4A07DF478A040000000000000001000200000000000000983DA4AEC0AE94124F3BC0147615FA6FF1E095DA58C815DB53986A92CB8823385A3FE3B11E4A903783485EF075ADBDE57F4E028002000000000000002FF881484A4D817D80781853CA11434501C0000000000000000004C001000000000000004E42', 'hex')
      let actual = rocks.AccountRestrictionCache.value(value)
      expect(actual).to.eql({
        address: 'TDQKHQBAVFYRHCJRE2LJ26GH6UMAXECMJID56R4K',
        restrictions: [
          {
            restrictionFlags: 0x1,
            values: [
              'TA62JLWAV2KBETZ3YAKHMFP2N7Y6BFO2LDEBLW2T',
              'TBVJFS4IEM4FUP7DWEPEVEBXQNEF54DVVW66K72O'
            ]
          },
          {
            restrictionFlags: 0x8002,
            values: [
              '7D814D4A4881F82F',
              '454311CA53187880'
            ]
          },
          {
            restrictionFlags: 0xC001,
            values: []
          },
          {
            restrictionFlags: 0xC004,
            values: [
              16974
            ]
          }
        ]
      })
    })
  })

  describe('AccountStateCache', () => {
    it('should parse a valid key', () => {
      let key = Buffer.from('9810D42C846BFEF7B6A1E56B2CEEEBE4D16A81A465633E3590', 'hex')
      let actual = rocks.AccountStateCache.key(key)
      expect(actual).to.equal('TAINILEENP7PPNVB4VVSZ3XL4TIWVANEMVRT4NMQ')
    })

    it('should parse a valid value', () => {
      let value = Buffer.from('01009810D42C846BFEF7B6A1E56B2CEEEBE4D16A81A465633E359019C50000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000A84582052890A9510100A84582052890A951010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex')
      let actual = rocks.AccountStateCache.value(value)
      expect(actual).to.eql({
        address: 'TAINILEENP7PPNVB4VVSZ3XL4TIWVANEMVRT4NMQ',
        addressHeight: '50457',
        publicKey: '0000000000000000000000000000000000000000000000000000000000000000',
        publicKeyHeight: '0',
        accountType: 0,
        linkedAccountKey: '0000000000000000000000000000000000000000000000000000000000000000',
        importances: [
          {
            value: '0',
            height: '0'
          },
          {
            value: '0',
            height: '0'
          },
          {
            value: '0',
            height: '0'
          }
        ],
        activityBuckets: [
          {
            startHeight: '0',
            totalFeesPaid: '0',
            beneficiaryCount: 0,
            rawScore: '0'
          },
          {
            startHeight: '0',
            totalFeesPaid: '0',
            beneficiaryCount: 0,
            rawScore: '0'
          },
          {
            startHeight: '0',
            totalFeesPaid: '0',
            beneficiaryCount: 0,
            rawScore: '0'
          },
          {
            startHeight: '0',
            totalFeesPaid: '0',
            beneficiaryCount: 0,
            rawScore: '0'
          },
          {
            startHeight: '0',
            totalFeesPaid: '0',
            beneficiaryCount: 0,
            rawScore: '0'
          },
          {
            startHeight: '0',
            totalFeesPaid: '0',
            beneficiaryCount: 0,
            rawScore: '0'
          },
          {
            startHeight: '0',
            totalFeesPaid: '0',
            beneficiaryCount: 0,
            rawScore: '0'
          }
        ],
        mosaics: [
          {
            id: '51A99028058245A8',
            amount: '1'
          }
        ]
      })
    })

  })

  describe('HashCache', () => {
    it('should parse a valid key', () => {
      let key = Buffer.from('938EBAEC010000009D403172F37D47B9099345D8034742493AD10FCB4350CF9904AA4B63D3CC7C79', 'hex')
      let actual = rocks.HashCache.key(key)
      expect(actual).to.equal('8266616467@9D403172F37D47B9099345D8034742493AD10FCB4350CF9904AA4B63D3CC7C79')
    })

    it('should parse a valid value', () => {
      let value = Buffer.from('', 'hex')
      let actual = rocks.HashCache.value(value)
      expect(actual).to.equal(null)
    })
  })

  describe('HashLockInfoCache', () => {
    it('should parse a valid key', () => {
      let key = Buffer.from('530398AF0A6211661B00F91C4C5A1E0467C406B59C41A0993CDA38A1A58096DC', 'hex')
      let actual = rocks.HashLockInfoCache.key(key)
      expect(actual).to.equal('530398AF0A6211661B00F91C4C5A1E0467C406B59C41A0993CDA38A1A58096DC')
    })

    it('should parse a valid value', () => {
      let value = Buffer.from('0100B572879C8E8627C181803285EF7F447EBB8441988CD20AF398B2F7D56BECD7E8A84582052890A9518096980000000000596501000000000000530398AF0A6211661B00F91C4C5A1E0467C406B59C41A0993CDA38A1A58096DC', 'hex')
      let actual = rocks.HashLockInfoCache.value(value)
      expect(actual).to.eql({
        senderPublicKey: 'B572879C8E8627C181803285EF7F447EBB8441988CD20AF398B2F7D56BECD7E8',
        mosaicId: '51A99028058245A8',
        amount: '10000000',
        endHeight: '91481',
        status: 0,
        hash: '530398AF0A6211661B00F91C4C5A1E0467C406B59C41A0993CDA38A1A58096DC'
      })
    })
  })

  describe('MetadataCache', () => {
    it('should parse a valid key', () => {
      let key = Buffer.from('59287CEBCB3DA8389FF363631970BEE7FD310C84C6880F175B0BF50A91AFB77C', 'hex')
      let actual = rocks.MetadataCache.key(key)
      expect(actual).to.equal('59287CEBCB3DA8389FF363631970BEE7FD310C84C6880F175B0BF50A91AFB77C')
    })

    it('should parse a valid value', () => {
      let value = Buffer.from('0100C5B463D8692161C515D79146FE79C98AA5DD709C745C2D911E1B4D9086E025DAA50F1A9823E0BF3FB76723337874D5B422FC96C5E356834B11E18960D1E82BCBF606C1637121ADBA00000000000000000026007B206E616D653A202231222C2076616C6964446174653A202232302F31302F3230323022207D', 'hex')
      let actual = rocks.MetadataCache.value(value)
      expect(actual).to.eql({
        senderPublicKey: 'C5B463D8692161C515D79146FE79C98AA5DD709C745C2D911E1B4D9086E025DA',
        targetPublicKey: 'A50F1A9823E0BF3FB76723337874D5B422FC96C5E356834B11E18960D1E82BCB',
        scopedMetadataKey: '13451444432914155254',
        targetId: '0000000000000000',
        metadataType: 0,
        valueSize: 38,
        value: '7B206E616D653A202231222C2076616C6964446174653A202232302F31302F3230323022207D'
      })
    })
  })

  describe('MosaicCache', () => {
    it('should parse a valid key', () => {
      let key = Buffer.from('FFD1634FA3F7546C', 'hex')
      let actual = rocks.MosaicCache.key(key)
      expect(actual).to.equal('6C54F7A34F63D1FF')
    })

    it('should parse a valid value', () => {
      let value = Buffer.from('0100FFD1634FA3F7546CE8030000000000009A490000000000003CCB0AD4E24EF318B4B4C595A03109D092D523AFC287C48635A8C744A08006BB0100000007000A00000000000000', 'hex')
      let actual = rocks.MosaicCache.value(value)
      expect(actual).to.eql({
        id: '6C54F7A34F63D1FF',
        supply: '1000',
        startHeight: '18842',
        owner: {
          publicKey: '3CCB0AD4E24EF318B4B4C595A03109D092D523AFC287C48635A8C744A08006BB'
        },
        revision: 1,
        flags: 7,
        divisibility: 0,
        duration: '10'
      })
    })
  })

  describe('MosaicRestrictionCache', () => {
    it('should parse a valid key', () => {
      let key = Buffer.from('4BB9C6DCF56209A1E52E2F646B3994FD7F266784E407C7891DC34BE5BEEE4437', 'hex')
      let actual = rocks.MosaicRestrictionCache.key(key)
      expect(actual).to.equal('4BB9C6DCF56209A1E52E2F646B3994FD7F266784E407C7891DC34BE5BEEE4437')
    })

    it('should parse a valid value', () => {
      let value = Buffer.from('010000F4248FC25206DF3E98E0A3C020A97113893126969D78C7F5180B904C4A07DF478A013A985DA74FE225B20200000000000000', 'hex')
      let actual = rocks.MosaicRestrictionCache.value(value)
      expect(actual).to.eql({
        entryType: 0,
        mosaicId: '3EDF0652C28F24F4',
        targetAddress: 'TDQKHQBAVFYRHCJRE2LJ26GH6UMAXECMJID56R4K',
        restrictions: [
          {
            key: '12836915144627689530',
            value: '2'
          }
        ]
      })
    })
  })

  describe('MultisigCache', () => {
    it('should parse a valid key', () => {
      let key = Buffer.from('FF7DFFDC99CA14F9ED3CEAE0DC3836D67AC894F22FAB149774586CEA26416DAD', 'hex')
      let actual = rocks.MultisigCache.key(key)
      expect(actual).to.equal('FF7DFFDC99CA14F9ED3CEAE0DC3836D67AC894F22FAB149774586CEA26416DAD')
    })

    it('should parse a valid value', () => {
      let value = Buffer.from('01000200000002000000FF7DFFDC99CA14F9ED3CEAE0DC3836D67AC894F22FAB149774586CEA26416DAD0300000000000000BA35DB3D38947967EA261D5C1EF0E792A84101FD88859720147AEDEF49CDE71FCA3C6D12AA403564917D7DC1FC9BF3EECEBA41DB11A63224BCAF929B31B42680CAF8C3E9982AD0C06A778E81C6305A5B224FB9D783AEA0420790A0C6F46242D60000000000000000', 'hex')
      let actual = rocks.MultisigCache.value(value)
      expect(actual).to.eql({
        account: {
          publicKey: 'FF7DFFDC99CA14F9ED3CEAE0DC3836D67AC894F22FAB149774586CEA26416DAD'
        },
        minApproval: 2,
        minRemoval: 2,
        cosignatoryPublicKeys: [
          'BA35DB3D38947967EA261D5C1EF0E792A84101FD88859720147AEDEF49CDE71F',
         'CA3C6D12AA403564917D7DC1FC9BF3EECEBA41DB11A63224BCAF929B31B42680',
         'CAF8C3E9982AD0C06A778E81C6305A5B224FB9D783AEA0420790A0C6F46242D6'
        ],
        multisigPublicKeys: []
      })
    })
  })

  describe('NamespaceCache', () => {
    it('should parse a valid key', () => {
      let key = Buffer.from('FC2BB65603E46AE6', 'hex')
      let actual = rocks.NamespaceCache.key(key)
      expect(actual).to.equal('E66AE40356B62BFC')
    })

    it('should parse a valid value', () => {
      let value = Buffer.from('01000100000000000000FC2BB65603E46AE64DAF479E341AF672B7C2DE843D27F1D614DA058D201E3C97022C798B9DF5697383A0000000000000035823000000000000010000000000000001622F7553ECC1BED001D097466F69ED6C74', 'hex')
      let actual = rocks.NamespaceCache.value(value)
      expect(actual).to.eql([
        {
          registrationType: 0,
          depth: 1,
          levels: [
            'E66AE40356B62BFC'
          ],
          alias: {
            type: 0
          },
          parentId: '0000000000000000',
          ownerPublicKey: '4DAF479E341AF672B7C2DE843D27F1D614DA058D201E3C97022C798B9DF56973',
          startHeight: '41091',
          endHeight: '2316291',
          children: [
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'E66AE40356B62BFC',
                'D0BEC1EC53752F62'
              ],
              alias: {
                type: 1,
                mosaicId: '746CED696F4697D0'
              },
              parentId: 'E66AE40356B62BFC',
              ownerPublicKey: '4DAF479E341AF672B7C2DE843D27F1D614DA058D201E3C97022C798B9DF56973',
              startHeight: '41091',
              endHeight: '2316291'
            }
          ]
        }
      ])
    })

    it('should parse a valid complex value', () => {
      let value = Buffer.from('01000100000000000000F5D0B6CDD925D3B91785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673912A01000000000011E223000000000000140000000000000001DDCC1AEB36E63B8101B02BF8136C07121301CA86FFC4F99BDB8201D3C04B3B71CE1444011DE03D3D05C8898D01C8232F8A6FC1BE0C015D558F2A1D75969301792F7475A7997246013DF5BBED988611960127A99FE7D247E77701B59788F5E792CB9901C0B47FBDA59CE06201949113DC3C26659D01EB654D7EE2C0B77B018E02919AA4B8B2A801E974BAF5A6C09B5E019097FC8484B914AC0105189E2C0FDA9D5601CB94D9D4362282B501044D731A09776C1E01D4AE0810C61B53BB01D9374AF74129AB1701FE4071491D3909BF0190F076242A646A7B01A6426E0D53AFFCCA0199AACF08215BD32301BA408E2EDAE1C4CF01F6B536BE765B827401CD646BB81B7AB3D90102125EFF01355067017AB9F13189F6FFE101F2021AC9935C7F3F0190A128AF9810DEE801EE880452E916314B014692925766D8CFEE019DF8929FCA99726B01C88C37F4040E3BEF017D2187516587215B016828493B95CBF9FE017E3BD0195AA16726', 'hex')
      let actual = rocks.NamespaceCache.value(value)
      //console.log(JSON.stringify(actual))
      expect(actual).to.eql([
        {
          registrationType: 0,
          depth: 1,
          levels: [
            'B9D325D9CDB6D0F5'
          ],
          alias: {
            type: 0
          },
          parentId: '0000000000000000',
          ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
          startHeight: '76433',
          endHeight: '2351633',
          children: [
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                '813BE636EB1ACCDD'
              ],
              alias: {
                type: 1,
                mosaicId: '1312076C13F82BB0'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                '82DB9BF9C4FF86CA'
              ],
              alias: {
                type: 1,
                mosaicId: '4414CE713B4BC0D3'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                '8D89C8053D3DE01D'
              ],
              alias: {
                type: 1,
                mosaicId: '0CBEC16F8A2F23C8'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                '9396751D2A8F555D'
              ],
              alias: {
                type: 1,
                mosaicId: '467299A775742F79'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                '96118698EDBBF53D'
              ],
              alias: {
                type: 1,
                mosaicId: '77E747D2E79FA927'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                '99CB92E7F58897B5'
              ],
              alias: {
                type: 1,
                mosaicId: '62E09CA5BD7FB4C0'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                '9D65263CDC139194'
              ],
              alias: {
                type: 1,
                mosaicId: '7BB7C0E27E4D65EB'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'A8B2B8A49A91028E'
              ],
              alias: {
                type: 1,
                mosaicId: '5E9BC0A6F5BA74E9'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'AC14B98484FC9790'
              ],
              alias: {
                type: 1,
                mosaicId: '569DDA0F2C9E1805'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'B5822236D4D994CB'
              ],
              alias: {
                type: 1,
                mosaicId: '1E6C77091A734D04'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'BB531BC61008AED4'
              ],
              alias: {
                type: 1,
                mosaicId: '17AB2941F74A37D9'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'BF09391D497140FE'
              ],
              alias: {
                type: 1,
                mosaicId: '7B6A642A2476F090'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'CAFCAF530D6E42A6'
              ],
              alias: {
                type: 1,
                mosaicId: '23D35B2108CFAA99'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'CFC4E1DA2E8E40BA'
              ],
              alias: {
                type: 1,
                mosaicId: '74825B76BE36B5F6'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'D9B37A1BB86B64CD'
              ],
              alias: {
                type: 1,
                mosaicId: '67503501FF5E1202'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'E1FFF68931F1B97A'
              ],
              alias: {
                type: 1,
                mosaicId: '3F7F5C93C91A02F2'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'E8DE1098AF28A190'
              ],
              alias: {
                type: 1,
                mosaicId: '4B3116E9520488EE'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'EECFD86657929246'
              ],
              alias: {
                type: 1,
                mosaicId: '6B7299CA9F92F89D'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'EF3B0E04F4378CC8'
              ],
              alias: {
                type: 1,
                mosaicId: '5B2187655187217D'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            },
            {
              registrationType: 1,
              depth: 2,
              levels: [
                'B9D325D9CDB6D0F5',
                'FEF9CB953B492868'
              ],
              alias: {
                type: 1,
                mosaicId: '2667A15A19D03B7E'
              },
              parentId: 'B9D325D9CDB6D0F5',
              ownerPublicKey: '1785D5DDC217DA8E295335C4A67D82DF7FDE20EE1F08FB70FE2C40C933B1B673',
              startHeight: '76433',
              endHeight: '2351633'
            }
          ]
        }
      ])
    })
  })

  describe('SecretLockInfoCache', () => {
    it('should parse a valid key', () => {
      let key = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
      let actual = rocks.SecretLockInfoCache.key(key)
      expect(actual).to.equal('0000000000000000000000000000000000000000000000000000000000000000')
    })

    it('should parse a valid value', () => {
      let value = Buffer.from('01009BE93593C699867F1B4F624FD37BC7FB93499CDEC9929088F2FF1031293960FFA84582052890A9516400000000000000B80B0000000000000001FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF992BE6B9E9B101B8BB00000000000000000000000000000000', 'hex')
      let actual = rocks.SecretLockInfoCache.value(value)
      expect(actual).to.eql({
        sender: {
          publicKey: '9BE93593C699867F1B4F624FD37BC7FB93499CDEC9929088F2FF1031293960FF'
        },
        mosaicId: '51A99028058245A8',
        amount: '100',
        endHeight: '3000',
        status: 0,
        hashAlgorithm: 1,
        secret: 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        recipientAddress: 'TEV6NOPJWEA3ROYAAAAAAAAAAAAAAAAAAAAAAAAA'
      })
    })
  })
})
