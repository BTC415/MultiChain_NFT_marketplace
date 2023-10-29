import NFTCell from '../NFTCell'

export default ({ nfts, collectionName, isLoading }) => {
    return <div className='nft-panel flexWrap'>
        {
            isLoading ?
                <div>Loading ...</div>
                :
                <>
                    {
                        nfts.map(nft => <NFTCell nft={nft} collectionName={collectionName} />)

                    }
                </>
        }
    </div>
}