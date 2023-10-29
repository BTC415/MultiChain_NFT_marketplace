import React from 'react';
import Icons from '../../Global/Icons';
import MenuButton from '../../Layout/MenuButton'
import { VolumeItems } from '../../../utiles/index'
import { useMediaQuery } from "react-responsive";
import Search from '../../Global/search';
import Sweepcard from '../sweepcard';
import NftCard from '../nftCard';
import Table from 'react-bootstrap/Table';

const NewsCard=({title,head,date,img})=>{
  const [isShown, setIsShown] = React.useState(false);
 
  return <div className='jdskf-kawemwae' onMouseLeave={() => setIsShown(false)}
  onMouseEnter={() => setIsShown(true)}
  >
<img src={img}/>
<div className={isShown?"akdsjfdsa-awenwa":"dsp-none-cst"}>
  <h5>{title}</h5>
  <div className='flexBox'>
    <h6>{head}</h6>
    <p>{date}</p>
  </div>
</div>
  </div>
}
export default () => {
    const isMedium = useMediaQuery({
        query: "(max-width: 1367px)",
    });
    return <div className='flexBox flexWrap' >
        <NewsCard img={require('../../../images/51.png')} title={"GameStop’s New FTX Partnership Could Boost Web3 Onboarding"} head={"By Degen News"} date={"Sep 08 2022"}/>
        <NewsCard img={require('../../../images/52.png')} title={"GameStop’s New FTX Partnership Could Boost Web3 Onboarding"} head={"By Degen News"} date={"Sep 08 2022"}/>
        <NewsCard img={require('../../../images/53.png')} title={"GameStop’s New FTX Partnership Could Boost Web3 Onboarding"} head={"By Degen News"} date={"Sep 08 2022"}/>
        <NewsCard img={require('../../../images/54.png')} title={"GameStop’s New FTX Partnership Could Boost Web3 Onboarding"} head={"By Degen News"} date={"Sep 08 2022"}/>
        <NewsCard img={require('../../../images/52.png')} title={"GameStop’s New FTX Partnership Could Boost Web3 Onboarding"} head={"By Degen News"} date={"Sep 08 2022"}/>
        <NewsCard img={require('../../../images/51.png')} title={"GameStop’s New FTX Partnership Could Boost Web3 Onboarding"} head={"By Degen News"} date={"Sep 08 2022"}/>
        <NewsCard img={require('../../../images/53.png')} title={"GameStop’s New FTX Partnership Could Boost Web3 Onboarding"} head={"By Degen News"} date={"Sep 08 2022"}/>
        <NewsCard img={require('../../../images/54.png')} title={"GameStop’s New FTX Partnership Could Boost Web3 Onboarding"} head={"By Degen News"} date={"Sep 08 2022"}/>
        <NewsCard img={require('../../../images/52.png')} title={"GameStop’s New FTX Partnership Could Boost Web3 Onboarding"} head={"By Degen News"} date={"Sep 08 2022"}/>
        <NewsCard img={require('../../../images/51.png')} title={"GameStop’s New FTX Partnership Could Boost Web3 Onboarding"} head={"By Degen News"} date={"Sep 08 2022"}/>
    </div>
}