import NftChart from '../Charts/marketOverview'
import NftEtherChart from '../Charts/ethereum/marketOverview'

function BasicExample({ chain, symbol }) {
  return (
    <div className='w-100 my-4 jkalsdfj-askdj'>
      <div className='flexBox jkdsafk-wenms'>
        <h6>Market Overview</h6>
        {/* <div className='jaskdjas-wajeia'>
          <button className='btn codjsf-sadw'>6H</button>
          <button className='btn codjsf-sadw-ac'>24H</button>
          <button className='btn codjsf-sadw'>7D</button>
          <button className='btn codjsf-sadw'>30D</button>
          <button className='btn codjsf-sadw'>3M</button>
          <button className='btn codjsf-sadw'>1Y</button>
          <button className='btn codjsf-sadw'>All</button>
        </div> */}
      </div>
      <div className='hjkads-jasew flexBox pos-rel'>
        {/* <h6 className='jkj-jsaijdw2'>Floor Price (SOL)</h6> */}
        <div className='w-100 ml-4'>
          {
            chain === `solana` &&
            <NftChart symbol={symbol} />
          }
          {
            chain === `ether` &&
            <NftEtherChart symbol={symbol} />
          }
        </div>
        {/* <h6 className='jkj-jsaijdw21'>Listings</h6> */}

      </div>

    </div>
  );
}

export default BasicExample;