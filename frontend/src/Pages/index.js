import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import Layout from '../components/Layout'
import MPDropDown from '../components/Global/MPDropDown'
import Search from '../components/Global/search'
import './index.scss'

const blockchainList = ["All", "Ethereum", "Solana"]
const floorpriceList = ["Low", "Middle", "High"]
const volumeList = ["Low", "Middle", "High"]
const performanceList = ["Low", "Middle", "High"]
const typeList = ["New collections only"]

function App() {


  const [slecetedBlockchain, setSelectedBlockchain] = useState("All")
  const [slecetedFloorPrice, setSelectedFloorPrice] = useState("Low")
  const [selectedVolume, setSelectedVolume] = useState("Low")
  const [slecetedPerformance, setSelectedPerformance] = useState("Low")
  const [slecetedType, setSelectedType] = useState("New collections only")

  const isMobile = useMediaQuery({
    query: "(max-width: 1000px)",
  });
  return (

    <Layout>
      <>
        <div className="nft-filter">
          <div className="dropdown-filter">
            <MPDropDown itemData={blockchainList} selectedValue={slecetedBlockchain} title={"Blockchain"} changeValue={setSelectedBlockchain} />
            <MPDropDown itemData={floorpriceList} selectedValue={slecetedFloorPrice} title={"Floorprice"} changeValue={setSelectedFloorPrice} />
            <MPDropDown itemData={volumeList} selectedValue={selectedVolume} title={"Volume"} changeValue={setSelectedVolume} />
            <MPDropDown itemData={performanceList} selectedValue={slecetedPerformance} title={"Performance"} changeValue={setSelectedPerformance} />
            <MPDropDown itemData={typeList} selectedValue={slecetedType} title={"Type"} changeValue={setSelectedType} />
          </div>
          <Search />
        </div>
      </>
    </Layout>
  );
}

export default App;
