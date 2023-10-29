import Icons from '../../components/Global/Icons';
import UserImg from '../../images/1.png'
import './index.scss'

function Overview() {

  return (
    <div className="profile-overview justify-content-between">
      <div className="user-data">
        <div className="username-address ">
          <img src={UserImg} className="user-img"></img>
          <div className="">
            <p className="user-name">Johnking001</p>
            <p className="wallet-address">23rf3rf</p>
          </div>
        </div>
        <div className="edit-panel-top mt-2">
          <button className="black-btn">Edit Profile</button>
          <button className="black-btn"> <div><Icons name={85} /></div> My Message</button>
          <button className="black-btn"> <div><Icons name={86} /></div></button>
        </div>
      </div>
      <div className="crypto-data container-transparent">
        <div className="info-cell">
          <p className="title">Followers</p>
          <p className="data">1</p>
        </div>
        <div className="info-cell">
          <p className="title">Total Items</p>
          <p className="data">40</p>
        </div>

        <div className="info-cell">
          <p className="title">Unlisted Items</p>
          <p className="data">2</p>
        </div>
        <div className="info-cell">
          <p className="title">Following</p>
          <p className="data">4</p>
        </div>
        <div className="info-cell">
          <p className="title">Estimated Value</p>
          <p className="data">4</p>
        </div>
        <div className="info-cell">
          <p className="title">Listed Items</p>
          <p className="data">4</p>
        </div>
      </div>

      <div className="edit-panel-bottom ">
        <button className="black-btn">Edit Profile</button>
        <button className="black-btn"> <Icons name={85} /> My Message</button>
        <button className="black-btn"> <Icons name={86} /></button>
      </div>
    </div>
  );
}

export default Overview;