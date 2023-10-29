import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ActivityPanel from './panels/activityPanel';
import AnalyticsPanel from './panels/analyticsPanel';
import ItemPanel from './panels/ItemPanel';
import EtherItemPanel from './panels/ItemPanel/Ethereum';
import NewsPanel from './panels/newsPanel';

const TabComponent = ({
    nfts,
    chain,
    symbol,
    setLoading
}) => {
    return (
        <div className='cst-tab'>
            <Tabs
                defaultActiveKey="Items"
                className="mb-3"
            >
                <Tab eventKey="Items" title="Items">
                    {
                        chain === 'solana' && <ItemPanel
                            chain={chain}
                            nfts={nfts}
                            symbol={symbol}
                            setLoading={setLoading}
                        />
                    }
                    {
                        chain === 'ether' && <EtherItemPanel
                            chain={chain}
                            nfts={nfts}
                            symbol={symbol}
                            setLoading={setLoading}
                        />
                    }

                </Tab>
                <Tab eventKey="Activity" title="Activity">
                    <ActivityPanel
                        chain={chain}
                        symbol={symbol}
                    />
                </Tab>
                <Tab eventKey="Analytics" title="Analytics">
                    <AnalyticsPanel
                        symbol={symbol}
                        chain={chain}
                    />
                </Tab>
                <Tab eventKey="Degen News" title="Degen News">
                    <NewsPanel />
                </Tab>

            </Tabs>

        </div>

    );
}

export default TabComponent;