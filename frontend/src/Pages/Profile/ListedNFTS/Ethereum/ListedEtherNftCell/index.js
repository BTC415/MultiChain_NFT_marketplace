import { Link } from 'react-router-dom';

import Icons from '../../../../../components/Global/Icons';
import { serverUrl } from '../../../../../config/ether';
import './index.scss'

const ListedEtherNftCell = (props) => {
	const {
		nft,
		index,
		nftShowStatus,
		ethCollections,
		setNftShowStatus,
		setEthNfts
	} = props

	const handleNftShowStatus = () => {
		if (!nftShowStatus) {
			if (index === 0 || index) {
				setEthNfts(ethCollections[index].items)
				setNftShowStatus(true);
			}
		}
	}

	return (
		<Link
			className='nft-item'
			key={index}
			onClick={handleNftShowStatus}
			to={nftShowStatus && `/collection/ether/${nft?.token_address}/${nft?.token_id}`}
		>
			{
				!nftShowStatus && !!nft.image && <>
					<img src={`${serverUrl}${nft.image}`} alt='nft'
						onError={(e) => {
							e.currentTarget.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTockQ1nzDdNSl0C1GJG3Wn8PZDz_zgxbe5oQ&usqp=CAU"
						}}
					/>

				</>
			}

			{
				nftShowStatus && !!nft.metadata?.image &&
				<>
					<img src={nft.metadata?.image} alt='nft'
						onError={(e) => {
							e.currentTarget.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTockQ1nzDdNSl0C1GJG3Wn8PZDz_zgxbe5oQ&usqp=CAU"
						}}
					/>
					<div className=' nft-item-independent '>
						<div className='nft-item-top'>
							<div className="favourate-group">
								<div><Icons name={77} /></div>
								<div><p>{`111`}</p></div>
							</div>
						</div>
						<div className='nft-item-bottom'>
							<div className="nft-item-name">
								<p>#{nft?.token_id}</p>
							</div>
						</div>
					</div>
				</>
			}
		</Link>
	)
}

export default ListedEtherNftCell
