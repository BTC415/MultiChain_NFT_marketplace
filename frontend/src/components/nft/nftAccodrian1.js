import Accordion from 'react-bootstrap/Accordion';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Link } from 'react-router-dom';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import Icons from '../Global/Icons';

function BasicExample({ nftInfo, tokenAddress, detailStatusType, marketFee, mintAddress, ownerAddress, royaltiesAddress }) {
    const anchorWallet = useAnchorWallet()
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
            <p >Mint address</p>
            <Link href={`https://solscan.io/account/${mintAddress}?cluster=devnet`}
              style={{ textDecoration: `none` }}
            >
              {
                !mintAddress ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
                  <p style={{ width: `150px` }} >
                    <Skeleton count={1} />
                  </p>
                </SkeletonTheme>
                  :
                  <h5 style={{ wordBreak: `break-all` }} >
                    {mintAddress?.substr(0, 6) + '...' + mintAddress?.substr(mintAddress?.length - 4, 4)}
                  </h5>
              }
            </Link>
          </div>
          <div className='flexBox'>
            <p>Token address</p>
            <Link
              href={`https://solscan.io/account/${tokenAddress}?cluster=devnet`}
              style={{ textDecoration: `none` }}
            >
              {
                !tokenAddress ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
                  <p style={{ width: `150px` }} >
                    <Skeleton count={1} />
                  </p>
                </SkeletonTheme>
                  :
                  <h5>
                    {!nftInfo ? `` : tokenAddress?.substr(0, 6) + '...' + tokenAddress?.substr(tokenAddress.length - 4, 4)}
                  </h5>
              }


            </Link>
          </div>
          <div className='flexBox'>
            <p>Owner</p>
            <Link
              href={`https://solscan.io/account/${ownerAddress}?cluster=devnet`}
              style={{ textDecoration: `none` }}
            >
              {
                !ownerAddress ?
                  <SkeletonTheme baseColor="#202020" highlightColor="#444">
                    <p style={{ width: `150px` }} >
                      <Skeleton count={1} />
                    </p>
                  </SkeletonTheme>
                  :
                  <h5>
                    {!nftInfo ? `` : ownerAddress?.substr(0, 6) + '...' + ownerAddress?.substr(ownerAddress?.length - 4, 4)}
                  </h5>
              }


            </Link>
          </div>
          <div className='flexBox'>
            <p>Blockchain</p>
            <h5>
              Solana
            </h5>
          </div>
          <div className='flexBox'>
            <p>Artist Royalties</p>
            {
              !royaltiesAddress ?
                <SkeletonTheme baseColor="#202020" highlightColor="#444">
                  <p style={{ width: `150px` }} >
                    <Skeleton count={1} />
                  </p>
                </SkeletonTheme>
                :
                <h5>
                  {royaltiesAddress}%
                </h5>
            }
          </div>
          <div className='flexBox'>
            <p>Transaction Fee</p>
            {
              // // !marketFee ?
              //   isLoading ?
              //   <SkeletonTheme baseColor="#202020" highlightColor="#444">
              //     <p style={{ width: `150px` }} >
              //       <Skeleton count={1} />
              //     </p>
              //   </SkeletonTheme>
              //   :
              <h5> {marketFee}% </h5>
            }

          </div>
          {
            anchorWallet &&   <div className='flexBox'>
            <p>Listing/Bidding/Cancel</p>
            {
              !detailStatusType ?
                <SkeletonTheme baseColor="#202020" highlightColor="#444">
                  <p style={{ width: `150px` }} >
                    <Skeleton count={1} />
                  </p>
                </SkeletonTheme>
                :
                <h5>
                  {detailStatusType}
                </h5>
            }
          </div>
          }
        

        </Accordion.Body>
      </Accordion.Item>

    </Accordion>
  );
}

export default BasicExample;