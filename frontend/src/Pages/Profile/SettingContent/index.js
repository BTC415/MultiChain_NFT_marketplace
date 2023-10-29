import { useState } from "react";
import { GoSettings } from 'react-icons/go';
import { AiOutlineRight } from 'react-icons/ai';
import { useMediaQuery } from "react-responsive";
import Icons from "../../../components/Global/Icons";
import MPDropDown from '../../../components/Global/MPDropDown'
import SearchContent from '../../../components/Global/search'
import MenuSideBar from "../../../components/Layout/MenuSideBar";
import './index.scss'

const testData = [
  "High", "Middle", "Low"
]
const rarityData = [
  "High", "Middle", "Low"
]
const performanceData = [
  "Most clicked", "Viewed"
]
const listData = [
  "All"
]

const SettingContent = () => {
  const [floorPrice, setfloorPrice] = useState("Low - High")
  const [rarity, setRarity] = useState("Rare - Common")
  const [performance, setPerformance] = useState("Most clicked / Viewed")
  const [list, setList] = useState("All")

  const [isFilter, setFilter] = useState(true)
  const [collapsed, setcollapsed] = useState(false)

  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  return (
    <>
      <div className="my-nfts">
        <div className=" setting-content">

          {
            !isMobile ?
              <div className="nft-control-menu">
                <div className="menu-desktop-control" >
                  <div className="menu-displayer">
                    <GoSettings className="setting-icon" />
                    <AiOutlineRight />
                  </div>
                  <div className="filter-control" >
                    <div className="filter-list" >
                      <MPDropDown itemData={testData} selectedValue={floorPrice} title={"FloorPrice"} changeValue={setfloorPrice} />
                      <MPDropDown itemData={rarityData} selectedValue={rarity} title={"Rarity"} changeValue={setRarity} />
                      <MPDropDown itemData={performanceData} selectedValue={performance} title={"Performance"} changeValue={setPerformance} />
                      <MPDropDown itemData={listData} selectedValue={list} title={"List"} changeValue={setList} />
                    </div>
                    <SearchContent />
                  </div>
                </div>

              </div>
              :
              <div className="nft-control-menu">
                <div className="menu-mobile-control" >
                  {/* <div className="menu-displayer">
                    <GoSettings className="setting-icon" />
                    <AiOutlineRight />
                  </div> */}
                  <SearchContent />
                  <div className="menu-mobile-group" style={{ display: `flex`, justifyContent: `space-between`, alignItems: `center`, margin: `16px 0px` }} >
                    <div
                      onClick={() => {
                        setFilter(!isFilter);
                        setcollapsed(true)
                      }}
                    >
                      <Icons name={isFilter ? 19 : 20} />
                    </div>
                    <Icons name={87} />
                  </div>
                </div>

              </div>
          }

        </div>
      </div>
      {isMobile ? (
        <MenuSideBar
          isMobile={isMobile}
          isFilter={isFilter}
          setFilter={setFilter}
        />
      ) : (
        <></>
      )}
    </>

  );
}

export default SettingContent;
