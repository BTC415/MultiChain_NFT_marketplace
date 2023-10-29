import { Buffer } from 'buffer'

import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import * as borsh from 'borsh';

import { SolanaNFTType } from './types'
import { Nullable } from '../utils/typeUtils'
import { Metadata, METADATA_SCHEMA } from '../schema';
import axios from 'axios';

type SolanaNFTMetadata = { type: SolanaNFTType; url: string }

const SOLANA_CLUSTER_ENDPOINT = 'https://api.mainnet-beta.solana.com'
export const METADATA_PROGRAM_ID_PUBLIC_KEY = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
export const METADATA_REPLACE = new RegExp('\u0000', 'g');

export async function decodeMetadata(buffer: Buffer) {
  const metadata = borsh.deserializeUnchecked(
    METADATA_SCHEMA,
    Metadata,
    buffer,
  );
  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, '');
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, '');
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, '');
  return metadata;
}

export type SolanaClientProps = {
  rpcEndpoint?: string
}

export class SolanaClient {
  readonly endpoint: string = SOLANA_CLUSTER_ENDPOINT
  private connection: Nullable<Connection> = null
  constructor(props?: SolanaClientProps) {
    this.endpoint = props?.rpcEndpoint ?? this.endpoint
    try {
      this.connection = new Connection(this.endpoint!, 'confirmed')
    } catch (e) {
      console.error('Could not create Solana RPC connection', e)
      this.connection = null
    }
  }

  /**
   * for each given wallet:
   * - get and parse its token accounts to get the mint addresses
   * - filter out tokens whose decimal places are not 0
   * - find the metadata PDAs for the mint addresses
   * - get the account infos for the PDAs if they exist
   * - get the metadata urls from the account infos and fetch the metadatas
   * - transform the nft metadatas to Audius-domain collectibles
   */

  public getCollectible = async (mintAddress: string) => {
    try {
      if (this.connection === null) throw new Error('No connection')
      const connection = this.connection

      const program = await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          METADATA_PROGRAM_ID_PUBLIC_KEY.toBytes(),
          new PublicKey(mintAddress).toBytes()
        ],
        METADATA_PROGRAM_ID_PUBLIC_KEY
      );
      const accountInfo = await connection.getAccountInfo(program[0])
      let metadata = await decodeMetadata(accountInfo.data)
      if (!metadata.data) return null
      const tokenInfo = await axios.get(metadata.data.uri).catch(() => ({data: {}}))
      return {
        ...metadata,
        ...metadata.data,
        ...tokenInfo.data
      }
    } catch (e) {
      console.error('Unable to get collectibles', e)
      return Promise.resolve({})
    }

  }

  public getCollectibleWithoutMetadata = async (mintAddress: string) => {
    try {
      if (this.connection === null) throw new Error('No connection')
      const connection = this.connection

      const program = await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          METADATA_PROGRAM_ID_PUBLIC_KEY.toBytes(),
          new PublicKey(mintAddress).toBytes()
        ],
        METADATA_PROGRAM_ID_PUBLIC_KEY
      );
      const accountInfo = await connection.getAccountInfo(program[0])
      let metadata = await decodeMetadata(accountInfo.data)
      return {
        ...metadata,
      }
    } catch (e) {
      console.error('Unable to get collectibles', e)
      return Promise.resolve({})
    }
  }

  public getAllCollectibles =
    async (wallets: string[], filters: any[]): Promise<any> => {
      try {
        if (this.connection === null) throw new Error('No connection')
        const connection = this.connection

        const tokenAccountsByOwnerAddress = await Promise.all(
          wallets.map(async address =>
            connection.getParsedTokenAccountsByOwner(new PublicKey(address), {
              programId: TOKEN_PROGRAM_ID
            })
          )
        )

        const potentialNFTsByOwnerAddress = tokenAccountsByOwnerAddress
          .map(ta => ta.value)
          // value is an array of parsed token info
          .map((value) => {
            const mintAddresses = value
              .map(v => ({
                mint: v.account.data.parsed.info.mint,
                tokenAmount: v.account.data.parsed.info.tokenAmount,
                tokenAccount: v.pubkey.toString()
              }))
              .filter(({ tokenAmount }) => {
                // Filter out the token if we don't have any balance
                const ownsNFT = tokenAmount.amount !== '0'
                // Filter out the tokens that don't have 0 decimal places.
                // NFTs really should have 0
                const hasNoDecimals = tokenAmount.decimals === 0
                return ownsNFT && hasNoDecimals
              })
              .map(({ mint, tokenAccount }) => ({ mint, tokenAccount }))
            return { mintAddresses }
          })
        const nfts = await Promise.all(
          potentialNFTsByOwnerAddress.map(async ({ mintAddresses }) => {
            const programAddresses: any = await Promise.all(
              mintAddresses.map(
                async mintAddress => {
                  const program = await PublicKey.findProgramAddress(
                    [
                      Buffer.from('metadata'),
                      METADATA_PROGRAM_ID_PUBLIC_KEY.toBytes(),
                      new PublicKey(mintAddress.mint).toBytes()
                    ],
                    METADATA_PROGRAM_ID_PUBLIC_KEY
                  );
                  return {
                    ...mintAddress,
                    program
                  }
                }
              ))
            let accountInfos: any[] = [];
            for (let cur = 0; cur < programAddresses.length;) {
              let subAddresses = programAddresses.slice(cur, cur + 100);
              let subAccountInfos = await connection.getMultipleAccountsInfo(
                subAddresses.map((program: any) => program.program[0])
              )
              accountInfos = [...accountInfos, ...subAccountInfos];
              cur += 100;
            }
            accountInfos = accountInfos.map((account, index) => ({
              account,
              ...programAddresses[index]
            }))
            const nonNullInfos = accountInfos?.filter((info: any) => info.account) ?? []
            let metadataList: any[] = [];
            let tokenInfoList: any[] = [];

            for (let i = 0; i < nonNullInfos.length; i++) {

              let metadata = await decodeMetadata(nonNullInfos[i].account!.data);
              if (metadata.data === undefined) continue
              if (filters.length === 0 || filters.find(filter => metadata.updateAuthority === filter.updateAuthority && metadata?.data?.name.indexOf(filter.collectionName) >= 0)) {
                metadataList.push({
                  ...metadata,
                  ...metadata.data
                });

                tokenInfoList.push(nonNullInfos[i]);
              }
            }

            const results = await Promise.all(
              metadataList.map(async item =>
                axios.get(item!.data.uri)
                  .then(res => res.data)
                  .catch(() => null)
              )
            )
            const metadatas = results.map((metadata, i) => ({
              ...metadata,
              ...metadataList[i],
              ...tokenInfoList[i]
            }))
            let newMetadataList = metadatas.filter((meta: any) => meta)
            return newMetadataList;
          })
        )

        const solanaCollectibles = await Promise.all(
          nfts.map(async (nftsForAddress, i) => {
            let newCollectibles: any = [];
            nftsForAddress.forEach((collect, index) => {
              if (collect) {
                let nft: any = nfts[i][index];
                newCollectibles.push({
                  ...collect,
                  ...nft,
                  mint: nft.mint,
                  tokenAccount: nft.tokenAccount
                })
              }
            })
            return newCollectibles;
          })
        )
        return solanaCollectibles.reduce(
          (result, collectibles, i) => ({
            ...result,
            [wallets[i]]: collectibles
          }),
          {}
        )
      } catch (e) {
        console.error('Unable to get collectibles', e)
        return Promise.resolve({})
      }
    }

  public getAllCollectiblesWithCreator =
    async (wallets: string[], creators: any[]): Promise<any> => {
      try {
        if (this.connection === null) throw new Error('No connection')
        const connection = this.connection

        const tokenAccountsByOwnerAddress = await Promise.all(
          wallets.map(async address =>
            connection.getParsedTokenAccountsByOwner(new PublicKey(address), {
              programId: TOKEN_PROGRAM_ID
            })
          )
        )

        const potentialNFTsByOwnerAddress = tokenAccountsByOwnerAddress
          .map(ta => ta.value)
          // value is an array of parsed token info
          .map((value) => {
            const mintAddresses = value
              .map(v => ({
                mint: v.account.data.parsed.info.mint,
                tokenAmount: v.account.data.parsed.info.tokenAmount,
                tokenAccount: v.pubkey.toString()
              }))
              .filter(({ tokenAmount }) => {
                // Filter out the token if we don't have any balance
                const ownsNFT = tokenAmount.amount !== '0'
                // Filter out the tokens that don't have 0 decimal places.
                // NFTs really should have 0
                const hasNoDecimals = tokenAmount.decimals === 0
                return ownsNFT && hasNoDecimals
              })
              .map(({ mint, tokenAccount }) => ({ mint, tokenAccount }))
            return { mintAddresses }
          })
        const nfts = await Promise.all(
          potentialNFTsByOwnerAddress.map(async ({ mintAddresses }) => {
            const programAddresses: any = await Promise.all(
              mintAddresses.map(
                async mintAddress => {
                  const program = await PublicKey.findProgramAddress(
                    [
                      Buffer.from('metadata'),
                      METADATA_PROGRAM_ID_PUBLIC_KEY.toBytes(),
                      new PublicKey(mintAddress.mint).toBytes()
                    ],
                    METADATA_PROGRAM_ID_PUBLIC_KEY
                  );
                  return {
                    ...mintAddress,
                    program
                  }
                }
              ))
            let accountInfos: any[] = [];
            for (let cur = 0; cur < programAddresses.length;) {
              let subAddresses = programAddresses.slice(cur, cur + 100);
              let subAccountInfos = await connection.getMultipleAccountsInfo(
                subAddresses.map((program: any) => program.program[0])
              )
              accountInfos = [...accountInfos, ...subAccountInfos];
              cur += 100;
            }
            accountInfos = accountInfos.map((account, index) => ({
              account,
              ...programAddresses[index]
            }))
            const nonNullInfos = accountInfos?.filter((info: any) => info.account) ?? []
            let metadataList: any[] = [];
            let tokenInfoList: any[] = [];

            for (let i = 0; i < nonNullInfos.length; i++) {

              let metadata = await decodeMetadata(nonNullInfos[i].account!.data);
              if (metadata.data === undefined) continue
              if (metadata.data.creators === undefined) continue
              if (creators.length === 0 || creators.find(creator => metadata.data.creators[0].address === creator)) {
                metadataList.push({
                  ...metadata,
                  ...metadata.data
                });

                tokenInfoList.push(nonNullInfos[i]);
              }
            }

            const results = await Promise.all(
              metadataList.map(async item =>
                axios.get(item!.data.uri)
                  .then(res => res.data)
                  .catch(() => null)
              )
            )
            const metadatas = results.map((metadata, i) => ({
              ...metadata,
              ...metadataList[i],
              ...tokenInfoList[i]
            }))
            let newMetadataList = metadatas.filter((meta: any) => meta)
            return newMetadataList;
          })
        )

        const solanaCollectibles = await Promise.all(
          nfts.map(async (nftsForAddress, i) => {
            let newCollectibles: any = [];
            nftsForAddress.forEach((collect, index) => {
              if (collect) {
                let nft: any = nfts[i][index];
                newCollectibles.push({
                  ...collect,
                  ...nft,
                  mint: nft.mint,
                  tokenAccount: nft.tokenAccount
                })
              }
            })
            return newCollectibles;
          })
        )
        return solanaCollectibles.reduce(
          (result, collectibles, i) => ({
            ...result,
            [wallets[i]]: collectibles
          }),
          {}
        )
      } catch (e) {
        console.error('Unable to get collectibles', e)
        return Promise.resolve({})
      }
    }

  public getAllCollectiblesFromMintAddress =
    async (mintAddressesFromWallet: any[], filters: any[]): Promise<any> => {
      try {
        if (this.connection === null) throw new Error('No connection')
        const connection = this.connection

        let staking_nfts: any[] = [];
        let wallets: any[] = [];
        for (const wallet in mintAddressesFromWallet) {
          const programAddresses: any = await Promise.all(
            mintAddressesFromWallet[wallet].map(
              async (mintAddress: any) => {
                const program = await PublicKey.findProgramAddress(
                  [
                    Buffer.from('metadata'),
                    METADATA_PROGRAM_ID_PUBLIC_KEY.toBytes(),
                    new PublicKey(mintAddress).toBytes()
                  ],
                  METADATA_PROGRAM_ID_PUBLIC_KEY
                );
                return {
                  mintAddress: mintAddress,
                  program
                }
              }
            )
          )

          let accountInfos: any[] = [];
          for (let cur = 0; cur < programAddresses.length;) {
            let subAddresses = programAddresses.slice(cur, cur + 100);
            let subAccountInfos = await connection.getMultipleAccountsInfo(
              subAddresses.map((program: any) => program.program[0])
            )
            accountInfos = [...accountInfos, ...subAccountInfos];
            cur += 100;
          }

          accountInfos = accountInfos.map((account, index) => ({
            account,
            ...programAddresses[index]
          }))

          const nonNullInfos = accountInfos?.filter((info: any) => info.account) ?? []
          let metadataList: any[] = [];
          let tokenInfoList: any[] = [];

          for (let i = 0; i < nonNullInfos.length; i++) {
            let metadata = await decodeMetadata(nonNullInfos[i].account!.data);
            if (metadata.data === undefined) continue
            if (filters.length === 0 || filters.find(filter => metadata.updateAuthority === filter.updateAuthority && metadata?.data?.name.indexOf(filter.collectionName) >= 0)) {
              metadataList.push({
                ...metadata,
                ...metadata.data
              });
              tokenInfoList.push(nonNullInfos[i]);
            }
          }

          const results = await Promise.all(
            metadataList.map(async item =>
              axios.get(item!.data.uri)
                .then(res => res.data)
                .catch(() => null
                )
            )
          )

          const metadatas = results.map((metadata, i) => ({
            ...metadata,
            ...metadataList[i],
            ...tokenInfoList[i]
          }))
          let newMetadataList = metadatas.filter((meta: any) => meta)
          staking_nfts.push(newMetadataList);
          wallets.push(wallet);
        }

        // return staking_nfts;

        const solanaCollectibles = await Promise.all(
          staking_nfts.map(async (nftsForAddress, i) => {
            let newCollectibles: any = [];
            nftsForAddress.forEach((collect: any, index: any) => {
              if (collect) {
                let nft: any = staking_nfts[i][index];
                newCollectibles.push({
                  ...collect,
                  ...nft,


                  mint: nft.mint,
                  tokenAccount: nft.tokenAccount
                })
              }
            })
            return newCollectibles;
          })
        )
        return solanaCollectibles.reduce(
          (result, collectibles, i) => ({
            ...result,
            [wallets[i]]: collectibles
          }),
          {}
        )
      } catch (e) {
        console.error('Unable to get collectibles', e)
        return Promise.resolve({})
      }
    }

  public getAllCollectiblesFromHashList =
    async (hashlist: any[], filters: any[]): Promise<any> => {
      try {
        if (this.connection === null) throw new Error('No connection')
        const connection = this.connection

        let staking_nfts: any[] = [];
        let wallets: any[] = [];
        const programAddresses: any = await Promise.all(
          hashlist.map(
            async (mintAddress: any) => {
              const program = await PublicKey.findProgramAddress(
                [
                  Buffer.from('metadata'),
                  METADATA_PROGRAM_ID_PUBLIC_KEY.toBytes(),
                  new PublicKey(mintAddress).toBytes()
                ],
                METADATA_PROGRAM_ID_PUBLIC_KEY
              );
              return {
                mintAddress: mintAddress,
                program
              }
            }
          )
        )

        let accountInfos: any[] = [];
        for (let cur = 0; cur < programAddresses.length;) {
          let subAddresses = programAddresses.slice(cur, cur + 100);
          let subAccountInfos = await connection.getMultipleAccountsInfo(
            subAddresses.map((program: any) => program.program[0])
          )
          accountInfos = [...accountInfos, ...subAccountInfos];
          cur += 100;
        }

        accountInfos = accountInfos.map((account, index) => ({
          account,
          ...programAddresses[index]
        }))

        const nonNullInfos = accountInfos?.filter((info: any) => info.account) ?? []
        let metadataList: any[] = [];
        let tokenInfoList: any[] = [];

        for (let i = 0; i < nonNullInfos.length; i++) {
          let metadata = await decodeMetadata(nonNullInfos[i].account!.data);
          if (metadata.data === undefined) continue
          if (filters.length === 0 || filters.find(filter => metadata.updateAuthority === filter.updateAuthority && metadata?.data?.name.indexOf(filter.collectionName) >= 0)) {
            metadataList.push({
              ...metadata,
              ...metadata.data
            });
            tokenInfoList.push(nonNullInfos[i]);
          }
        }

        const results = await Promise.all(
          metadataList.map(async item =>
            axios.get(item!.data.uri)
              .then(res => res.data)
              .catch(() => null
              )
          )
        )

        const metadatas = results.map((metadata, i) => ({
          ...metadata,
          ...metadataList[i],
          ...tokenInfoList[i]
        }))
        let newMetadataList = metadatas.filter((meta: any) => meta)
        staking_nfts.push(newMetadataList);

        // return staking_nfts;

        const solanaCollectibles = await Promise.all(
          staking_nfts.map(async (nftsForAddress, i) => {
            let newCollectibles: any = [];
            nftsForAddress.forEach((collect: any, index: any) => {
              if (collect) {
                let nft: any = staking_nfts[i][index];
                newCollectibles.push({
                  ...collect,
                  ...nft,


                  mint: nft.mint,
                  tokenAccount: nft.tokenAccount
                })
              }
            })
            return newCollectibles;
          })
        )
        return solanaCollectibles.reduce(
          (result, collectibles, i) => ({
            ...result,
            nfts: collectibles
          }),
          {}
        )
      } catch (e) {
        console.error('Unable to get collectibles', e)
        return Promise.resolve({})
      }
    }
  public getAllCollectiblesFromMintAddressWithCreator =
    async (mintAddressesFromWallet: any[], creators: any[]): Promise<any> => {
      try {
        if (this.connection === null) throw new Error('No connection')
        const connection = this.connection

        let staking_nfts: any[] = [];
        let wallets: any[] = [];
        for (const wallet in mintAddressesFromWallet) {
          const programAddresses: any = await Promise.all(
            mintAddressesFromWallet[wallet].map(
              async (mintAddress: any) => {
                const program = await PublicKey.findProgramAddress(
                  [
                    Buffer.from('metadata'),
                    METADATA_PROGRAM_ID_PUBLIC_KEY.toBytes(),
                    new PublicKey(mintAddress).toBytes()
                  ],
                  METADATA_PROGRAM_ID_PUBLIC_KEY
                );
                return {
                  mintAddress: mintAddress,
                  program
                }
              }
            )
          )

          let accountInfos: any[] = [];
          for (let cur = 0; cur < programAddresses.length;) {
            let subAddresses = programAddresses.slice(cur, cur + 100);
            let subAccountInfos = await connection.getMultipleAccountsInfo(
              subAddresses.map((program: any) => program.program[0])
            )
            accountInfos = [...accountInfos, ...subAccountInfos];
            cur += 100;
          }

          accountInfos = accountInfos.map((account, index) => ({
            account,
            ...programAddresses[index]
          }))

          const nonNullInfos = accountInfos?.filter((info: any) => info.account) ?? []
          let metadataList: any[] = [];
          let tokenInfoList: any[] = [];

          for (let i = 0; i < nonNullInfos.length; i++) {
            let metadata = await decodeMetadata(nonNullInfos[i].account!.data);

            if (metadata.data === undefined) continue
            if (metadata.data.creators === undefined) continue
            if (creators.find(creator => metadata.data.creators[0].address === creator)) {
              metadataList.push({
                ...metadata,
                ...metadata.data
              });
              tokenInfoList.push(nonNullInfos[i]);
            }
          }

          const results = await Promise.all(
            metadataList.map(async item =>
              axios.get(item!.data.uri)
                .then(res => res.data)
                .catch(() => null
                )
            )
          )

          const metadatas = results.map((metadata, i) => ({
            ...metadata,
            ...metadataList[i],
            ...tokenInfoList[i]
          }))
          let newMetadataList = metadatas.filter((meta: any) => meta)
          staking_nfts.push(newMetadataList);
          wallets.push(wallet);
        }

        // return staking_nfts;

        const solanaCollectibles = await Promise.all(
          staking_nfts.map(async (nftsForAddress, i) => {
            let newCollectibles: any = [];
            nftsForAddress.forEach((collect: any, index: any) => {
              if (collect) {
                let nft: any = staking_nfts[i][index];
                newCollectibles.push({
                  ...collect,
                  ...nft,


                  mint: nft.mint,
                  tokenAccount: nft.tokenAccount
                })
              }
            })
            return newCollectibles;
          })
        )
        return solanaCollectibles.reduce(
          (result, collectibles, i) => ({
            ...result,
            [wallets[i]]: collectibles
          }),
          {}
        )
      } catch (e) {
        console.error('Unable to get collectibles', e)
        return Promise.resolve({})
      }
    }

  /**
   * Decode bytes to get url for nft metadata
   * Check urls based on nft standard e.g. metaplex, or nft collection e.g. solamander, or known domains e.g. ipfs
   * This is because there may be multiple different collections of nfts on e.g. metaplex (arweave), also
   * a given nft collection can have nfts living in different domains e.g. solamander on cloudfront or arweave or etc., also
   * nfts may live in ipfs or other places
   */
  private _utf8ArrayToNFTType = (array: Uint8Array): Nullable<SolanaNFTMetadata> => {
    const text = new TextDecoder().decode(array)
    // for the sake of simplicty/readability/understandability, we check the decoded url
    // one by one against metaplex, star atlas, and others
    return (
      this._metaplex(text) ||
      this._starAtlas(text) ||
      this._jsonExtension(text) ||
      this._ipfs(text)
    )
  }

  private _metaplex = (text: string): Nullable<SolanaNFTMetadata> => {
    const query = 'https://'
    const startIndex = text.indexOf(query)
    if (startIndex === -1) return null

    // metaplex standard nfts live in arweave, see link below
    // https://github.com/metaplex-foundation/metaplex/blob/81023eb3e52c31b605e1dcf2eb1e7425153600cd/js/packages/web/src/contexts/meta/processMetaData.ts#L29
    const isMetaplex = text.includes('arweave')
    const foundNFTUrl = startIndex > -1 && isMetaplex
    if (!foundNFTUrl) return null

    const suffix = '/'
    const suffixIndex = text.indexOf(suffix, startIndex + query.length)
    if (suffixIndex === -1) return null

    const hashLength = 43
    const endIndex = suffixIndex + suffix.length + hashLength
    const url = text.substring(startIndex, endIndex)
    return {
      type: 'METAPLEX',
      url
    }
  }

  private _starAtlas = (text: string): Nullable<SolanaNFTMetadata> => {
    const query = 'https://'
    const startIndex = text.indexOf(query)
    if (startIndex === -1) return null

    // star atlas nfts live in https://galaxy.staratlas.com/nfts/...
    const isStarAtlas = text.includes('staratlas')
    const foundNFTUrl = startIndex > -1 && isStarAtlas
    if (!foundNFTUrl) return null

    const suffix = '/nfts/'
    const suffixIndex = text.indexOf(suffix, startIndex + query.length)
    if (suffixIndex === -1) return null

    const hashLength = 44
    const endIndex = suffixIndex + suffix.length + hashLength
    const url = text.substring(startIndex, endIndex)
    return {
      type: 'STAR_ATLAS',
      url
    }
  }

  private _jsonExtension = (text: string): Nullable<SolanaNFTMetadata> => {
    // Look for 'https://<...>.json' and that will be the metadata location
    // examples:
    // https://d1b6hed00dtfsr.cloudfront.net/9086.json
    // https://cdn.piggygang.com/meta/3ad355d46a9cb2ee57049db4df57088f.json

    const query = 'https://'
    const startIndex = text.indexOf(query)
    if (startIndex === -1) return null

    const extension = '.json'
    const extensionIndex = text.indexOf(extension)
    const foundNFTUrl = startIndex > -1 && extensionIndex > -1
    if (!foundNFTUrl) return null

    const endIndex = extensionIndex + extension.length
    const url = text.substring(startIndex, endIndex)
    return {
      type: 'METAPLEX',
      url
    }
  }

  private _ipfs = (text: string): Nullable<SolanaNFTMetadata> => {
    // Look for 'https://ipfs.io/ipfs/<...alphanumeric...>' and that will be the metadata location
    // e.g. https://ipfs.io/ipfs/QmWJC47JYuvxYw63cRq81bBNGFXPjhQH8nXg71W5JeRMrC

    const query = 'https://'
    let startIndex = text.indexOf(query)
    if (startIndex === -1) {
      startIndex = text.indexOf('http://');
      if (startIndex === -1) return null
    }

    const isIpfs = text.includes('ipfs')
    const foundNFTUrl = startIndex > -1 && isIpfs
    if (!foundNFTUrl) return null

    const suffix = '/ipfs/'
    const suffixIndex = text.indexOf(suffix, startIndex + query.length)
    if (suffixIndex === -1) return null

    let endIndex = suffixIndex + suffix.length
    while (/[a-zA-Z0-9]/.test(text.charAt(endIndex++))) { }

    const url = text.substring(startIndex, endIndex)
    return {
      type: 'METAPLEX',
      url
    }
  }
}