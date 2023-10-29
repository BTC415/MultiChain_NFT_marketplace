
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { DECIMAL } from '../../config/ether';

import Icons from '../Global/Icons';

const FloorPriceCard = ({ info, isLoading }) => {
	return (
		<div className=''>
			<div className='floor-price-card'>
				<div className='p-inner-card'>
					<h5>{`Floor price`}</h5>
					{
						isLoading ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
							<p>
								<Skeleton count={1} />
							</p>
						</SkeletonTheme>
							:
							<h3>{info?.floorPrice ? info?.floorPrice : 0}</h3>
					}
				</div>
				<div className='p-inner-card'>
					<h5>{`Initial mint price`}</h5>
					{
						isLoading ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
							<p>
								<Skeleton count={1} />
							</p>
						</SkeletonTheme>
							:
							<h3>{info?.initialMintPrice ? info?.initialMintPrice : 0}</h3>

					}
				</div>
				<div className='p-inner-card'>
					<h5>{`Total volume`}</h5>
					{
						isLoading ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
							<p>
								<Skeleton count={1} />
							</p>
						</SkeletonTheme>
							:
							<h3>{info?.totalVolume ? info?.totalVolume.toFixed(4) : 0}</h3>
					}
				</div>
				<div className='p-inner-card'>
					<h5>{`owners`}</h5>
					{
						isLoading && info ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
							<p>
								<Skeleton count={1} />
							</p>
						</SkeletonTheme>
							:
							<h3>{info?.uniqueHolders ? info?.uniqueHolders : 0}</h3>
					}
				</div>
				<div className='p-inner-card'>
					<h5>{`Listed`}</h5>
					{
						isLoading && info ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
							<p>
								<Skeleton count={1} />
							</p>
						</SkeletonTheme>
							:
							<h3>{info?.listedCount ? info?.listedCount : 0}</h3>
					}
				</div>
				<div className='p-inner-card'>
					<h5>{`Avg. price sale`}</h5>
					{
						isLoading && info ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
							<p>
								<Skeleton count={1} />
							</p>
						</SkeletonTheme>
							:
							<h3>{info?.avgSalePrice ? info?.avgSalePrice : 0}</h3>
					}
				</div>
				<div className='p-inner-card'>
					<h5>{`Purchased`}</h5>
					{
						isLoading && info ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
							<p>
								<Skeleton count={1} />
							</p>
						</SkeletonTheme>
							:
							<h3>{info?.purchased ? info?.purchased : 0}</h3>
					}
				</div>
				<div className='p-inner-card'>
					<h5>{`Total supply`}</h5>
					{
						isLoading && info ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
							<p>
								<Skeleton count={1} />
							</p>
						</SkeletonTheme>
							:
							<h3>{info?.totalSupply ? info?.totalSupply : 0}</h3>
					}
				</div>
			</div>
			<div className='share-social-collection flexBox'>
				<div >
					<a href={info?.telegramLink} target='_blank' rel='noreferrer' >
						<button className='btn '>
							<Icons name={61} />
						</button>
					</a>
					<a href={info?.discordLink} target='_blank' rel='noreferrer' >
						<button className='btn '>
							<Icons name={62} />
						</button>
					</a>
					<a href={info?.twitterLink} target='_blank' rel='noreferrer' >
						<button className='btn '>
							<Icons name={63} />
						</button>
					</a>
					<a href={info?.instagram} target='_blank' rel='noreferrer'>
						<button className='btn '>
							<Icons name={64} />
						</button>
					</a>
					<a href={info?.websiteLink} target='_blank' rel='noreferrer' >
						<button className='btn '>
							<Icons name={65} />
						</button>
					</a>
				</div>
				<div className='flexBox'>
					<div className='brd-left'></div>
					<button className='btn '>
						<Icons name={66} />
					</button>
					<button className='btn '>
						<Icons name={67} />
					</button>
				</div>
			</div>
		</div>
	)
}

export default FloorPriceCard