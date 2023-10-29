
import Icons from '../Global/Icons';
import SeemoreAccordian from './seeMoreAccordian'
import { serverUrl } from '../../config';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default ({ info }) => {
	return <div className='proofCard'>
		<div className='d-flex align-items-center'>
			{
				info.baseImage ?
					!!info?.baseImage && <img src={`${serverUrl}${info.baseImage}`} />
					:
					<SkeletonTheme baseColor="#202020" highlightColor="#444">
						<p style={{ width: `130px` }} >
							<Skeleton count={1} style={{ minHeight: `130px` }} />
						</p>
					</SkeletonTheme>
			}
			<div >
				<div className='flexBox'>
					{
						info.title ?
							<SkeletonTheme baseColor="#202020" highlightColor="#444">
								<p style={{ width: `130px` }} >
									<Skeleton count={1} style={{ minHeight: `130px` }} />
								</p>
							</SkeletonTheme>
							:
							<h4>{info.title}</h4>
					}
					<div className='chip-btn-proof'>

						<p>{`mutable`}</p>
					</div>
				</div>
				<div className='flexBox chatroombtn btn'>
					<Icons name={57} />
					<h6>Chat Room</h6>
				</div>
			</div>
		</div>
		<div>
			<h1>{info.description}</h1>
		</div>
		<SeemoreAccordian />
		<div className='flexBox'>
			<div className='flexBox feature-proof'>
				<h3>Get this NFT
					featured on the landing page</h3>
				<button className='btn btn-menu-f cshsid-d'>Feature</button>
			</div>
			<div>
				<button className='btn btn-menu-f sadasawe3'><Icons name={58} /></button>
			</div>
		</div>
	</div>
}