import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Layout from '../../components/Layout'
import Search from '../../components/Global/search';
import Overview from './Overview';
import MyNFTs from './MyNFTs';
import ListedNFTS from './ListedNFTS';
import OfferedNfts from "./OfferedNfts";
import MyCustodialNFTS from './MyCustodialNFTS';
import Activities from './Activities';
import OffersReceived from './OffersReceived';

import './index.scss'
import Favourite from './Favourite';

function Profile() {

	return (

		<Layout>
			<div className="user-profile">
				<div className="d-flex justify-content-center profile-top-search">
					<Search />
				</div>
				<Overview />
				<div className='cst-tab profile-tab-group '>
					<Tabs
						defaultActiveKey="myNfts"
						className="mb-3  profile-tab-control "
					>
						<Tab eventKey="myNfts" title="My NFTs">
							<MyNFTs />
						</Tab>
						<Tab eventKey="listedNfts" title="Listed NFTs">
							<ListedNFTS />
						</Tab>
						{/* <Tab eventKey="offeredNfts" title="Offered NFTs">
							<OfferedNfts />
						</Tab> */}
						<Tab eventKey="myCustodialNFTS" title="My Custodial NFTs">
							<MyCustodialNFTS />
						</Tab>
						<Tab eventKey="activities" title="Activites">
							<Activities />
						</Tab>
						<Tab eventKey="offerReceived" title="Offers Received">
							<OffersReceived />
						</Tab>
						<Tab eventKey="favourite" title="Favourite">
							<Favourite />
						</Tab>
					</Tabs>

				</div>
			</div>
		</Layout>
	);
}

export default Profile;
