import Accordion from 'react-bootstrap/Accordion';
import Icons from '../Global/Icons';
import NftChart from '../Charts/nftChart'
function BasicExample() {
  return (
    <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <div className='flexBox w-100' >
            <div className='flexBox'>
              <Icons name={56} />
              <h5 className='mx-3'>Price History</h5>
            </div>
            <Icons name={44} />

          </div>
        </Accordion.Header>
        <Accordion.Body className='mt-4'>
        <NftChart/>

        </Accordion.Body>
      </Accordion.Item>

    </Accordion>
  );
}

export default BasicExample;