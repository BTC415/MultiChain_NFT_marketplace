import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import './index.scss'

export default (props)=>{
    const { itemData, selectedValue, changeValue, className } = props;
    return <Dropdown className={`marketplace-dropdown-transparent ${className}`}>
        <Dropdown.Toggle>
            <p className="content-description">{selectedValue}</p>
        </Dropdown.Toggle>
        <Dropdown.Menu>
        {
            itemData.map(data => {
                    return <Dropdown.Item eventKey={data} onClick={()=>changeValue(data)}
                     active={data === selectedValue}>{data}</Dropdown.Item>
                }
            )
        }
        </Dropdown.Menu>
    </Dropdown>
}