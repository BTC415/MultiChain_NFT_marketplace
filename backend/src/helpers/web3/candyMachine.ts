import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes"
import { PublicKey, Connection } from "@solana/web3.js"
import { CLUSTER_API } from "../../config"

const connection = new Connection(CLUSTER_API)
const TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
const CANDY_MACHINE_V1_PROGRAM = new PublicKey('cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ')
const CANDY_MACHINE_V2_PROGRAM = new PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ')

const MAX_NAME_LENGTH = 32
const MAX_URI_LENGTH = 200
const MAX_SYMBOL_LENGTH = 10
const MAX_CREATOR_LEN = 32 + 1 + 1
const MAX_CREATOR_LIMIT = 5

const MAX_DATA_SIZE = 4 + MAX_NAME_LENGTH + 4 + MAX_SYMBOL_LENGTH + 4 + MAX_URI_LENGTH + 2 + 1 + 4 + MAX_CREATOR_LIMIT * MAX_CREATOR_LEN

const MAX_METADATA_LEN = 1 + 32 + 32 + MAX_DATA_SIZE + 1 + 1 + 9 + 172
const CREATOR_ARRAY_START = 1 + 32 + 32 + 4 + MAX_NAME_LENGTH + 4 + MAX_URI_LENGTH + 4 + MAX_SYMBOL_LENGTH + 2 + 1 + 4

// Get Candy Machine Version
export const getCandyMachineVersion = async (candyMachineId: PublicKey) => {

    const accountInfo = await connection.getAccountInfo(new PublicKey(candyMachineId))

    if (accountInfo.owner.toString() === CANDY_MACHINE_V1_PROGRAM.toString()) {
        return 'v1'
    }

    if (accountInfo.owner.toString() === CANDY_MACHINE_V2_PROGRAM.toString()) {
        return 'v2'
    }
    return null
}

// Get Candy Machine V2 Creator
export const getCandyMachineV2Creator = async (candyMachineId: PublicKey): Promise<[PublicKey, number]> => (
    PublicKey.findProgramAddress(
        [Buffer.from('candy_machine'), candyMachineId.toBuffer()],
        CANDY_MACHINE_V2_PROGRAM
    )
)

// Get Mint Address
export const getMintAddress = async (firstCreatorAddress: String) => {
    try {
        const firstPubKey = new PublicKey(firstCreatorAddress)
        const metadataAccounts = await connection.getProgramAccounts(
            TOKEN_METADATA_PROGRAM,
            {
                dataSlice: { offset: 33, length: 32 },

                filters: [
                    { dataSize: MAX_METADATA_LEN },
                    {
                        memcmp: {
                            offset: CREATOR_ARRAY_START,
                            bytes: firstPubKey.toBase58(),
                        },
                    },
                ],
            },
        )

        return metadataAccounts.map((metadataAccountInfo) => (
            bs58.encode(metadataAccountInfo.account.data)
        ))

    } catch (e) {
        console.log(e)
        return []
    }
}

export const fetchMintAddress = async (candyMachineId: String) => {
    try {
        const candymachinPubkey = new PublicKey(candyMachineId)
        console.log("Program Id:", candymachinPubkey)

        const candyVersion = await getCandyMachineVersion(candymachinPubkey)
        console.log(candyVersion)
        if (!candyVersion) {
            return
        }

        let creator = candymachinPubkey
        if (candyVersion == 'v2') {
            const candyMachineCreator = await getCandyMachineV2Creator(candymachinPubkey)
            if (!candyMachineCreator[0]) {
                console.log('Your program id not valid...')
                return
            }

            creator = candyMachineCreator[0]
        }

        console.log('creator', creator)
        const tokenIds = await getMintAddress(creator.toString())
        return tokenIds
    }
    catch (error) {
        console.log('error', error)
    }
}