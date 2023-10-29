import Dropdown from 'react-bootstrap/Dropdown';
import './index.scss'

export default (props) => {
    const { itemData, selectedValue, changeValue, title } = props;
    return <Dropdown className="marketplace-dropdown">
        <Dropdown.Toggle>
            <span className="content-title">{title}: </span>
            <p className="content-description">{selectedValue}</p>
        </Dropdown.Toggle>
        <Dropdown.Menu>
            {
                itemData.map((data, idx) => <Dropdown.Item eventKey={data} onClick={() => changeValue(data)}
                    active={data === selectedValue} key={idx} >{data}</Dropdown.Item>

                )
            }
        </Dropdown.Menu>
    </Dropdown>
}