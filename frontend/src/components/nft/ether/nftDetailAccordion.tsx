import Accordion from 'react-bootstrap/Accordion';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Link } from 'react-router-dom';

import Icons from '../../Global/Icons';

const NftDetailAccordion = (props: any) => {
 const { nftInfo,collectionInfo, tokenId }: any = props;

 return (
  <Accordion defaultActiveKey="0">
   <Accordion.Item eventKey="0">
    <Accordion.Header>
     <div className='flexBox w-100' >
      <div className='flexBox'>
       <Icons name={95} />
       <h5 className='mx-3'>Details</h5>
      </div>
      <Icons name={44} />

     </div>
    </Accordion.Header>
    <Accordion.Body>
     <div className='flexBox'>
      <p >Contract address</p>

      {
       !collectionInfo?.contract ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
        <p style={{ width: `150px` }} >
         <Skeleton count={1} />
        </p>
       </SkeletonTheme>
        :
        <h5 style={{ wordBreak: `break-all` }} >
         {collectionInfo?.contract?.substr(0, 6) + '...' + collectionInfo?.contract?.substr(collectionInfo?.contract?.length - 4, 4)}
        </h5>
      }
     </div>
     <div className='flexBox'>
      <p >Token ID</p>
      {
       !tokenId ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
        <p style={{ width: `150px` }} >
         <Skeleton count={1} />
        </p>
       </SkeletonTheme>
        :
        <h5 style={{ wordBreak: `break-all` }} >
         {tokenId}
        </h5>
      }
     </div>
     <div className='flexBox'>
      <p >Token Standard</p>
      {
       !nftInfo?.contract_type ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
        <p style={{ width: `150px` }} >
         <Skeleton count={1} />
        </p>
       </SkeletonTheme>
        :
        <h5 style={{ wordBreak: `break-all` }} >
         {nftInfo?.contract_type}
        </h5>
      }
     </div>
     <div className='flexBox'>
      <p >Owner</p>
      {
       !nftInfo?.owner_of ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
        <p style={{ width: `150px` }} >
         <Skeleton count={1} />
        </p>
       </SkeletonTheme>
        :
        <h5 style={{ wordBreak: `break-all` }} >
         {nftInfo?.owner_of?.substr(0, 6) + '...' + nftInfo?.owner_of?.substr(nftInfo?.owner_of?.length - 4, 4)}
        </h5>
      }
     </div>

    </Accordion.Body>
   </Accordion.Item>

  </Accordion>
 );
}

export default NftDetailAccordion;