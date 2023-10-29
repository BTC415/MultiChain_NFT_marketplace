import Accordion from 'react-bootstrap/Accordion';
import Icons from '../Global/Icons';

function BasicExample({ nftInfo, nftDescirption }) {
  return (
    <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <div className='flexBox w-100' >
            <div className='flexBox'>
              <Icons name={94} />
              <h5 className='mx-3'>About {nftInfo.collectionName}</h5>
            </div>
            <Icons name={44} />

          </div>
        </Accordion.Header>
        <Accordion.Body>
          <p>{nftDescirption}</p>
        </Accordion.Body>
      </Accordion.Item>

    </Accordion>
  );
}

export default BasicExample;