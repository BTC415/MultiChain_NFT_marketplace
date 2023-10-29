import toast from "react-hot-toast";
import { Link } from 'react-router-dom';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from "@solana/web3.js";

import Icons from "../Icons";
import { MARKETPLACES_API, serverUrl } from '../../../config';
import commonService from '../../../config/services/common.service';
import { signAndSendTransaction } from '../../../config/helpers/sol/connection';

import './index.scss'


export default (props) => {
	const {
		nft,
		index,
		setLoading,
		listActive,
		offeredActive,
		offeredNfts,
		setOfferedNfts,
		collectionsInWallet,
		setNftsInWallet,
		nftShowStatus,
		setNftShowStatus
	} = props
	const wallet = useWallet()

	const { connection } = useConnection()

	const handleCancelOffer = async () => {
		try {
			setLoading(true);
			let result = await commonService({
				method: "post",
				route: `${MARKETPLACES_API.GET_CANCELBID_TX}`,
				data: {
					bidderAddress: wallet.publicKey.toString(),
					mintAddress: nft.mintAddress
				}
			});

			if (result?.tx?.data) {
				const transaction = Transaction.from(result.tx.data);
				const res = await signAndSendTransaction(connection, wallet, transaction);
				if (res?.txid) {
					await commonService({
						method: "post",
						route: `${MARKETPLACES_API.GET_CANCELBID_TX_CONF}`,
						data: {
							bidderAddress: wallet.publicKey.toString(),
							mintAddress: nft.mintAddress,
							signature: res.txid
						}
					});

					const remain_nfts = offeredNfts.filter((item) => item.mintAddress !== nft.mintAddress)
					setOfferedNfts([...remain_nfts])

					toast.success("Your offering is sucessfully canceled.")
				}
				else {
					toast.error("Cancel is failed, Please try again.")
				}
			}
			else {
				toast.error("Cancel is failed, Please try again.")
			}
			setLoading(false);

		} catch (error) {
			console.log('error', error)
			setLoading(false)
			toast.error("Cancel is failed, Please try again.")

		}
	}

	const handleNftShowStatus = () => {
		if (!nftShowStatus) {
			if (index === 0 || index) {
				setNftsInWallet(collectionsInWallet[index].items)
				setNftShowStatus(true);
			}
		}
	}

	return (
		<>
			<Link
				className='nft-item'
				key={index}
				onClick={handleNftShowStatus}
				to={nftShowStatus && `/profile/listing/${nft?.mintAddress}`}
			>
				{
					!nftShowStatus && !!nft.collectionImg && <>
						<img src={`${serverUrl}${nft.collectionImg}`} alt='nft' />

					</>
				}
				{
					nftShowStatus && !!nft.image &&
					<>
						<img src={nft.image} alt='nft' />
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
							</div>
						</div>
					</>
				}
				{/* <img src={nft.image} alt='nft' /> */}
				{
					listActive && <div className=' nft-item-independent '>
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
				}


				{offeredActive && <button className='cancelOffer-btn' onClick={handleCancelOffer} >{`Cancel`}</button>}

			</Link>

		</>

	)

}