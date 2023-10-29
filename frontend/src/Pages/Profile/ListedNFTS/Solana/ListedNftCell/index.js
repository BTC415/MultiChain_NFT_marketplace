import { Link } from 'react-router-dom';

import Icons from '../../../../../components/Global/Icons';
import { serverUrl } from '../../../../../config';

import './index.scss'

const ListedNftCell = (props) => {
	const {
		nft,
		index,
		collectionsInWallet,
		setNftsInWallet,
		nftShowStatus,
		setNftShowStatus
	} = props
	const handleNftShowStatus = () => {
		if (!nftShowStatus) {
			if (index === 0 || index) {
				setNftsInWallet(collectionsInWallet[index].items)
				setNftShowStatus(true);
			}
		}
	}
	return (
		<Link
			className='nft-item'
			key={index}
			onClick={handleNftShowStatus}
			to={nftShowStatus && `/collection/solana/${nft?.symbol}/${nft?.mintAddress}`}
		>
			{
				!nftShowStatus && !!nft.collectionImg && <>
					<img src={`${serverUrl}${nft.collectionImg}`} alt='nft' />

				</>
			}
			{
				nftShowStatus && !!nft.image &&
				<>
					<img src={nft.image} alt='nft' onError={(e) => {
						e.currentTarget.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP-3QSHNAEBzr6s2fvf7hhOpnt0HGHthvDoGqFF3XQHg&s"
					}} />
					<div className=' nft-item-independent '>
						<div className='nft-item-top'>
							<div className="favourate-group">
								<div><Icons name={77} /></div>
								<div><p>{`111`}</p></div>
							</div>
						</div>
						<div className='nft-item-bottom'>
							<div className="nft-item-name">
								<p>#{nft?.name.split('#')[1]}</p>
							</div>
							<div className="nft-price-group" >
								<div className="sol-icon" >
									<Icons name={74} />
								</div>
								<div className="nft-price" ><p>{nft?.price}</p></div>
							</div>
						</div>
					</div>
				</>
			}

		</Link>
	)
}

export default ListedNftCell
