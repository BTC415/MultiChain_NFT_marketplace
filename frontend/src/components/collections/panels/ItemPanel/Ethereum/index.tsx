
import { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import { Contract, ethers } from 'ethers';

import Icons from '../../../../Global/Icons';
import NftCard from '../../../nftCard';
import './index.scss'
import SettingContent from '../../../../../Pages/Profile/SettingContent';
import { MARKETPLACES_API, SOLANA_CHAININFO } from '../../../../../config';
import { MARKETPLACES_ETH_API } from '../../../../../config/ether';
import { DECIMAL } from '../../../../../config/ether';
import commonService from '../../../../../config/services/common.service';
import { MarketPlaceContractAddress } from '../../../../../constants/abi';
import MarketplaceAbi from '../../../../../constants/abi/Marketplace.json'
import { connectWallet } from '../../../../../utiles/eth-interact';

const EtherItemPanel = ({
	chain,
	nfts,
	symbol,
}: any) => {
 const [etherWallet, setEtherWallet] = useState(``)
  const [isLoading, setLoading] = useState(false);


	const [ethToUsd, setEthToUsd ] = useState<any>(0)
	const [nftLists, setNftLists] = useState<any[]>([])
	const [selectedNftCount, setSelectedNftCount] = useState(0)
	const [sweepLists, setSweepLists] = useState<any[]>([])
	const [balanceByNfts, setBalanceByNfts] = useState<any>({
		avg: 0,
		lowest: 0,
		highest: 0,
		total: 0,
		usdTotal: 0,
		floor: 0
	})
	const [sweepCount, setSweepCount] = useState<any>(``)
	const [isSweepRemoveBtn, setSweepRemoveBtn] = useState(-1)

	const selectNFT = async (index: any) => {
		try {
			const isSelected_nftLists: any[] = nftLists.map((item: any, idx: any) => {
				return idx === index ?
					{ ...item, selected: !item.selected }
					: item
			})
			setNftLists([...isSelected_nftLists])

			if (isSelected_nftLists[index].selected) {
				setSelectedNftCount(selectedNftCount + 1)
			} else {
				setSelectedNftCount(selectedNftCount - 1)
			}

			const get_sweepLists: any[] = isSelected_nftLists.filter((item) => {
				return item?.selected === true;
			})

			setSweepLists(get_sweepLists)
			let total = 0;
			const balance_array = []
			for (let i = 0; i < get_sweepLists.length; i++) {
				balance_array.push(get_sweepLists[i].price)
				total = total + get_sweepLists[i].price;
			}

			const lowest = Math.min.apply(Math, balance_array)
			const highest = Math.max.apply(Math, balance_array)


			const avg = total / get_sweepLists.length
	

			const unSelected_nfts = isSelected_nftLists.filter((item) => {
				return item?.selected === false;
			})
			setSweepCount((get_sweepLists.length).toString())

			if (get_sweepLists.length > 0) {
				setBalanceByNfts({
					...balanceByNfts,
					avg: avg.toFixed(5),
					lowest: lowest.toFixed(5),
					highest: highest.toFixed(5),
					total: total.toFixed(5),
					usdTotal: (total * ethToUsd).toFixed(5),
					floor: unSelected_nfts[0]?.price.toFixed(5)
				})
			} else {
				setBalanceByNfts({
					...balanceByNfts,
					avg: 0,
					lowest: 0,
					highest: 0,
					total: 0,
					usdTotal: 0,
					floor: nftLists[0]?.price
				})
			}

		} catch (error) {
			console.log('error', error)
		}
	}

	const handleBuy = async () => {
		try {
			const filter = nftLists.filter(item=>item.selected === true);
			if(filter.length <=0) {
				toast.error('error')
				return
			}
			setLoading(true)

			 const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
				const signer = Provider.getSigner();

				const marketplaceContract = new Contract(MarketPlaceContractAddress, MarketplaceAbi.abi, signer)
			for(let i =0 ; i<sweepLists.length;i++){
				const token_Id = sweepLists[i]?.nftId
				const tx = await marketplaceContract.buy(
							symbol,
							token_Id,
							{
									value :sweepLists[i].price * DECIMAL
							}
					)
					console.log('tx', tx)
			
					await tx.wait()

					const payload = {
						buyerAddress: etherWallet,
						contract: symbol,
						id: token_Id,
						signature: tx.hash
					}

					await commonService({
							method: `post`,
							route: `${MARKETPLACES_ETH_API.GET_NFT_ITEM}/buy`,
							data: payload
					})
					
					setNftLists([])
			}
					toast.success('success')

			setLoading(false)
		} catch (error) {
			console.log('error', error);
			toast.error('Occur error')
			setLoading(false)
		}


	}

	const handleSweepRemove = async (idx: any) => {
		const res = sweepLists.splice(idx, 1);
		const get_id = nftLists.findIndex((item) => item.image === res[0].image)

		const new_arr = nftLists.map((item, idx) => {
			return idx === get_id ? { ...item, selected: false } : item
		})

		// const selected_nfts = nftLists.filter((item) => item.selected === true);

		// selected_nfts.push(selected_nfts.splice(selected_nfts.indexOf(idx), 1)[0]);

		setNftLists([...new_arr])
		const new_sweepLists = sweepLists.filter((item) => item.image !== res[0].image);

		let total = 0;
		const balance_array = []
		for (let i = 0; i < new_sweepLists.length; i++) {
			balance_array.push(new_sweepLists[i].price)
			total = total + new_sweepLists[i].price;
		}
		const lowest = Math.min.apply(Math, balance_array)
		const highest = Math.max.apply(Math, balance_array)
		const avg = total / new_sweepLists.length
		const unSelected_nfts = new_arr.filter((item) => {
			return item?.selected === false;
		})
		setSweepCount(Number(sweepCount) - 1)

		if (new_sweepLists.length > 0) {
			setBalanceByNfts({
				...balanceByNfts,
				avg: avg.toFixed(5),
				lowest: lowest.toFixed(5),
				highest: highest.toFixed(5),
				total: Number(balanceByNfts.total - res[0].price).toFixed(5),
				usdTotal: Number(balanceByNfts.usdTotal - res[0].price * ethToUsd).toFixed(5),
				floor: unSelected_nfts[0]?.price
			})
		} else {
			setBalanceByNfts({
				...balanceByNfts,
				avg: 0,
				lowest: 0,
				highest: 0,
				total: 0,
				usdTotal: 0,
				floor: 0
			})
		}

	}

	const handleSweepCount = async (count: any) => {
		if (count <= nftLists.length) {
			setSweepCount(count)
		} else {
			return
		}
		if (count === `` || Number(count) === 0) {
			setSweepLists([])

			for (let i = 0; i < nftLists.length; i++) {
				nftLists[i].selected = false
				setBalanceByNfts({
					...balanceByNfts,
					avg: 0,
					lowest: 0,
					highest: 0,
					total: 0,
					usdTotal: 0,
					floor: 0
				})
			}
		}

		if (count > 0) {
			for (let i = 0; i < count; i++) {
				nftLists[i].selected = true
			}
		}

		if (nftLists.length > 0) {
			for (let i = count; i < nftLists.length; i++) {
				nftLists[i].selected = false
			}
		}


		const selected_nft: any[] = nftLists.filter(item => item.selected === true)

		let total = 0;
		const balance_array = []
		for (let i = 0; i < selected_nft.length; i++) {
			balance_array.push(selected_nft[i].price)
			total = total + selected_nft[i].price;
		}

		const avg = total / selected_nft.length;
		const lowest = Math.min.apply(Math, balance_array)
		const highest = Math.max.apply(Math, balance_array)
		const usdTotal: any = await commonService({
			method: 'get',
			route: SOLANA_CHAININFO
		})

		const unSelected_nfts = nftLists.filter((item) => {
			return item?.selected === false;
		})

		if (selected_nft.length > 0) {
			setBalanceByNfts({
				...balanceByNfts,
				avg: avg.toFixed(2),
				lowest: lowest.toFixed(2),
				highest: highest.toFixed(2),
				total: total.toFixed(2),
				usdTotal: (total * ethToUsd).toFixed(2),
				floor: unSelected_nfts[0]?.price
			})
		} else {
			setBalanceByNfts({
				...balanceByNfts,
				avg: 0,
				lowest: 0,
				highest: 0,
				total: 0,
				usdTotal: 0,
				floor: 0
			})
		}


		setSweepCount(selected_nft?.length)
		setSweepLists([...selected_nft])

	}

	useEffect(() => {
		(
			async() => {
				try {
					const get_nftLists = nfts.map((item: any) => {
						return { ...item, selected: false }
					})
		
					const new_nftLists = get_nftLists.sort((a: any, b: any) => { return a.price - b.price })  // sort the nft
					
					if (new_nftLists.length > 0) {
						setBalanceByNfts({ ...balanceByNfts, floor: new_nftLists[0]?.price })
					}
					setNftLists([...new_nftLists])
		
				const get_global_status:any = await commonService({
						method: `get`,
						route: MARKETPLACES_API.GET_GLOBAL_STATUS
				})
		
					setEthToUsd(Number(get_global_status?.ethPrice).toFixed(2))
		
				} catch (error) {
					console.log('error', error)
				}

			}
		)()
		// eslint-disable-next-line 
	}, [nfts])

	 useEffect(() => {
    (
      async () => {
        const ether_Wallet = await connectWallet();
        setEtherWallet(ether_Wallet.address)
      }
    )()
  }, [])

	return (
		<div className='sweep-balance-control' >
			 {
        isLoading ? <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
			<SettingContent />

			<div className='sweep-balance-group' >
				<p className='title' >Sweep</p>

				<div className='sweep-group' >
					<p className='item-count' >items:
						<input
							type={`number`}
							value={sweepCount}
							onChange={(e) => handleSweepCount(e.target.value)}
						/>
					</p>
					<div className='sweep-lists' >

						{
							sweepLists.map((sweep, idx) =>
								<div
									key={idx}
									className='sweep-item'
									onMouseLeave={() => {
										if (idx === 0 || idx) {
											setSweepRemoveBtn(-1)
										}
									}}
									onMouseEnter={() => {
										if (idx === 0 || idx) {
											setSweepRemoveBtn(idx)
										}
									}}
								>
									<div className='sweep-img' >
										<img src={sweep?.image} />
									</div>

									<p className='sweep-price' >  <Icons name={74} />  {sweep?.price}</p>

									<img
										onClick={() => handleSweepRemove(idx)}
										className={isSweepRemoveBtn === idx ? 'sweep-remove' : 'sweep-remove-none'}
										src={require('../../../../../images/sweep-remove.png')}
									/>

								</div>
							)
						}
					</div>
				</div>

				<div className='balance-group' >
					<div className='balance-lists' >
						<div className='balance-item average-balance-item ' >
							<p className='title' >AVG.NFT</p>
							<p className='price' >  <Icons name={97} /> {balanceByNfts.avg}  </p>
						</div>
						<div className='balance-item lowest-balance-item ' >
							<p className='title' >Lowest NFT</p>
							<p className='price' >  <Icons name={97} /> {balanceByNfts.lowest}  </p>
						</div>
						<div className='balance-item range-balance-item ' >
							<p className='title' >Range</p>
							<p className='price' >  <Icons name={97} /> {balanceByNfts.lowest} - <Icons name={97} /> {balanceByNfts.highest}  </p>
						</div>

					</div>
					<div className='total-floor-group' >
						<div className='total-content' >
							<div className='total-group' >
								<p className='title' >Total</p>
								<div className='price-group' >
									<Icons name={97} />
									<p className='price' >{balanceByNfts.total}</p>
									<p className='usd-price' >({balanceByNfts.usdTotal})</p>
								</div>
							</div>
							<div className='buy' onClick={handleBuy} >Buy</div>
						</div>


						<div className='floor-group' >
							<p className='title' >New Floor</p>
							<p className='price' ><Icons name={74} /> {balanceByNfts.floor} </p>
						</div>
					</div>

				</div>
			</div>

			{
				nftLists.length > 0 ?
					<div className='nft-panel flexWrap justify-left gap-[16px] '>
						{
							nftLists.map((nft, index) =>
								<NftCard
									onClick={(e: any) => {
										e.preventDefault();
										selectNFT(index);
									}}
									nft={nft}
									chain = {chain}
									symbol={symbol}
									index={index}
									key={index}
								/>
							)

						}
					</div>
					:

					<div className='nft-panel nft-panel-height flexWrap justify-left gap-[16px] '>
						<div className='no-nftGroup' >
							<p className='title' >Nothing Found</p>
							<p className='subTitle' >We couldn't find anything with this criteria</p>
						</div>
					</div>
			}
		</div>

	)
}

export default EtherItemPanel
