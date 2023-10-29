import { AiOutlineCopy } from "react-icons/ai";
import { Link } from "react-router-dom";

const ContactCell = (props) => {
  const { tool, url } = props
  return (
    <div className="contact-info-cell d-flex justify-content-between">
      <div className="info">
        <p className="content-title">{tool}:</p>
        <p className="content-description">{url}</p>
      </div>
      <div className="control-link">
        <AiOutlineCopy className="white-color" />
        <span className="white-color">|</span>
        <Link className="open-link">Open link</Link>
      </div>

    </div>
  );
}

export default ContactCell;
