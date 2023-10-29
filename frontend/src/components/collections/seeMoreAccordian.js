import Accordion from 'react-bootstrap/Accordion';
import Icons from '../Global/Icons';

function BasicExample() {
  return (
    <div className='proofaccordian'>
        <Accordion >
      <Accordion.Item eventKey="0">
        <Accordion.Header>
            <div className='flexBox w-100' >
                <div className='flexBox'>
                 <h5 className='mx-3'>See more</h5>
                </div>
                <Icons name={59}/>

            </div>
        </Accordion.Header>
        <Accordion.Body>
            <p>10,000 monkeys blasting off at the speed of light!</p>
        </Accordion.Body>
      </Accordion.Item>
      
    </Accordion>
    </div>
  );
}

export default BasicExample;