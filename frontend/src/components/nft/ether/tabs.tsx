import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import Attributes from '../attributes'
import Activity from '../activity'
import '../index.scss'

function UncontrolledExample({ nftInfo, nftActivity }: any) {
	return (
		<div className='cst-tab'>
			<Tabs
				defaultActiveKey="Attributes"
				className="mb-3"
			>
				<Tab eventKey="Attributes" title="Attributes">
					{
						nftInfo?.attributes ?
							<div className='attributes-list'>
								{
									nftInfo?.attributes &&
									nftInfo?.attributes.map((item: any, index: any) => <Attributes index={index} value={item.value} title={item.trait_type} key={index} />)
								}
							</div>
							:

							Array.from({ length: 1 }).map((_, i) => (<div key={i} className='attributes-list' >

								<div className='attributes-item' >
									<SkeletonTheme baseColor="#202020" highlightColor="#444">
										<p style={{ width: `100%` }} >
											<Skeleton count={1} style={{ minHeight: `64px` }} />
										</p>
									</SkeletonTheme>
								</div>
								<div className='attributes-item' >
									<SkeletonTheme baseColor="#202020" highlightColor="#444">
										<p style={{ width: `100%` }} >
											<Skeleton count={1} style={{ minHeight: `64px` }} />
										</p>
									</SkeletonTheme>
								</div>
								<div className='attributes-item' >
									<SkeletonTheme baseColor="#202020" highlightColor="#444">
										<p style={{ width: `100%` }} >
											<Skeleton count={1} style={{ minHeight: `64px` }} />
										</p>
									</SkeletonTheme>
								</div>
								<div className='attributes-item' >
									<SkeletonTheme baseColor="#202020" highlightColor="#444">
										<p style={{ width: `100%` }} >
											<Skeleton count={1} style={{ minHeight: `64px` }} />
										</p>
									</SkeletonTheme>
								</div>
								<div className='attributes-item' >
									<SkeletonTheme baseColor="#202020" highlightColor="#444">
										<p style={{ width: `100%` }} >
											<Skeleton count={1} style={{ minHeight: `64px` }} />
										</p>
									</SkeletonTheme>
								</div>
								<div className='attributes-item' >
									<SkeletonTheme baseColor="#202020" highlightColor="#444">
										<p style={{ width: `100%` }} >
											<Skeleton count={1} style={{ minHeight: `64px` }} />
										</p>
									</SkeletonTheme>
								</div>
							</div>))
					}

				</Tab>
				<Tab eventKey="Activity" title="Activity">
					<div className='activity-list' style={{ width: `100%` }} >
						{
							nftActivity[0] ?
								nftActivity[0].length > 0 ?

									nftActivity[0].map((activity: any, index: any) => {
										const activityHour: any = (Number(Date.now() - new Date(activity.created_at).getTime()) / 3600000).toFixed(0); // hour about milisection
										const activityMinute = Number((Number(Date.now() - new Date(activity.created_at).getTime()) / 3600000) * 60).toFixed(0) // Minute about milisection

										const activityDays: any = Number(activityHour / 24).toFixed(0)
										const activityMonths = Number(activityDays / 30).toFixed(0)

										return (
											<Activity
												key={index}
												activity={activity}
												activityMonths={activityMonths}
												activityDays={activityDays}
												activityHour={activityHour}
												activityMinute={activityMinute}
											/>
										)
									})
									:
									Array.from({ length: 1 }).map((_, i) => (<div key={i} className='attributes-list' >

										<div className='attributes-item' >
											<SkeletonTheme baseColor="#202020" highlightColor="#444">
												<p style={{ width: `100%` }} >
													<Skeleton count={1} style={{ minHeight: `64px` }} />
												</p>
											</SkeletonTheme>
										</div>
										<div className='attributes-item' >
											<SkeletonTheme baseColor="#202020" highlightColor="#444">
												<p style={{ width: `100%` }} >
													<Skeleton count={1} style={{ minHeight: `64px` }} />
												</p>
											</SkeletonTheme>
										</div>
										<div className='attributes-item' >
											<SkeletonTheme baseColor="#202020" highlightColor="#444">
												<p style={{ width: `100%` }} >
													<Skeleton count={1} style={{ minHeight: `64px` }} />
												</p>
											</SkeletonTheme>
										</div>
										<div className='attributes-item' >
											<SkeletonTheme baseColor="#202020" highlightColor="#444">
												<p style={{ width: `100%` }} >
													<Skeleton count={1} style={{ minHeight: `64px` }} />
												</p>
											</SkeletonTheme>
										</div>
										<div className='attributes-item' >
											<SkeletonTheme baseColor="#202020" highlightColor="#444">
												<p style={{ width: `100%` }} >
													<Skeleton count={1} style={{ minHeight: `64px` }} />
												</p>
											</SkeletonTheme>
										</div>
										<div className='attributes-item' >
											<SkeletonTheme baseColor="#202020" highlightColor="#444">
												<p style={{ width: `100%` }} >
													<Skeleton count={1} style={{ minHeight: `64px` }} />
												</p>
											</SkeletonTheme>
										</div>
									</div>))
								:

								<div className='no-nftGroup' >
									<p className='title' >Nothing Found</p>
									<p className='subTitle' >We couldn't find anything with this criteria</p>
								</div>
						}
					</div>
				</Tab>

			</Tabs>

		</div>

	);
}

export default UncontrolledExample;