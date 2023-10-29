import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from '../components/Layout'
import ProofCollectiveCard from "../components/collections/proofCollectiveCard";
import FloorpriceChart from "../components/Charts/floorPriceChart";
import FloorPriceEtherChart from '../components/Charts/ethereum/floorPriceChart'
import FloorPriceCard from "../components/collections/floorPriceCard";
import Tabs from '../components/collections/tabs'
import commonService from "../config/services/common.service";
import { MARKETPLACES_API } from "../config";
import { MARKETPLACES_ETH_API } from "../config/ether";

function App() {
  const { chain, name } = useParams();
  const [collectionData, setCollectionData] = useState({});
  const [nfts, setNfts] = useState([]);
  const [isLoading, setLoading] = useState(false)
  useEffect(() => {
    (
      async () => {
        try {
          if (chain === 'solana') {
            setLoading(true)
            let _collectionData = await commonService({
              method: "post",
              route: `${MARKETPLACES_API.GET_COLLECTION_DATA}`,
              data: {
                symbol: name
              }
            });

            setNfts([..._collectionData?.nfts?.rows])

            let res = await commonService({
              method: 'get',
              route: `${MARKETPLACES_API.GET_COLLECTION_DATA}${_collectionData?.collection?.symbol} `
            })
            setCollectionData(res)

            setLoading(false)
          } else if (chain === 'ether') {
            setLoading(true)
            const collectionData = await commonService({
              method: `post`,
              route: `${MARKETPLACES_ETH_API.GET_COLLECTION}`,
              data: {
                contract: name
              }
            })
            setNfts(collectionData?.nfts?.rows)

            let res = await commonService({
              method: 'get',
              route: `${MARKETPLACES_ETH_API.GET_COLLECTION}/${name} `
            })

            setCollectionData(res)
            setLoading(false)

          }

        } catch (error) {
          console.log('error', error)
          setLoading(false)
        }

      }
    )();
  }, [name])

  return (

    <Layout>
      <div className="col-main-box">
        <div className="flexBox fxbox-sds p-4 flex-wrap">
          <div className="mr-20 mb-4"><ProofCollectiveCard info={collectionData} /></div>
          <div className="mr-20 mb-4 hasdsa-wej">
            {chain === 'solana' &&
              <FloorpriceChart name={name} />
            }
            {chain === 'ether' &&
              <FloorPriceEtherChart name={name} />
            }
          </div>
          <div className="mb-20">
            <FloorPriceCard info={collectionData} isLoading={isLoading} />
          </div>
        </div>
        <Tabs
          chain={chain}
          nfts={nfts}
          symbol={name}
          setLoading={setLoading}
        />
      </div>
    </Layout>
  );
}

export default App;
