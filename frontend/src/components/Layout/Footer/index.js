import react from "react";
import LogoImg from '../../../images/logo/arena.png'
import './index.scss'

export default () => {
  return (
    <section className="footer">
      <div className="footer-control">
        <div className="footer-left" >
          <img src={LogoImg} className="footer-logo" />
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tur pretium
            duis ultricies scelerisque habitasse duis.
          </p>
        </div>
        <div className="footer-right" >
          <div className="footer-group" >
            <div className="footer-item" >
              <h3>Marketplace</h3>
              <h5>Collections</h5>
              <h5>All NFTs</h5>
              <h5>Explore</h5>
            </div>
            <div className="footer-item" >
              <h3>My Account</h3>
              <h5>My Collections</h5>
              <h5>Wallet</h5>
              <h5>Create new collection</h5>
            </div>
          </div>

          <div className="footer-group" >
            <div className="footer-item" >
              <h3>Company</h3>
              <h5>Privacy Policy</h5>
              <h5>Terms of service</h5>
              <h5>Copyright</h5>
            </div>
            <div className="footer-item" >
              <h3>Community</h3>
              <h5>Telegram</h5>
              <h5>Twitter</h5>
              <h5>Discord</h5>
            </div>
          </div>

        </div>


        {/* <div className="footer-1">
          <div className="d-flex">
            <img src={LogoImg} className="logo"/>
          </div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tur pretium
            duis ultricies scelerisque habitasse duis.
          </p>
        </div>
        <div className="footer-2">
          <h3>Marketplace</h3>
          <h5>Collections</h5>
          <h5>All NFTs</h5>
          <h5>Explore</h5>
        </div>
        <div className="footer-2">
          <h3>My Account</h3>
          <h5>My Collections</h5>
          <h5>Wallet</h5>
          <h5>Create new collection</h5>
        </div>
        <div className="footer-2">
          <h3>Company</h3>
          <h5>Privacy Policy</h5>
          <h5>Terms of service</h5>
          <h5>Copyright</h5>
        </div>
        <div className="footer-2">
          <h3>Community</h3>
          <h5>Telegram</h5>
          <h5>Twitter</h5>
          <h5>Discard</h5>
        </div> */}
      </div>
    </section>
  );
};
