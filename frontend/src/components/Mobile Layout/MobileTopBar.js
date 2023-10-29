import Icons from "../Global/Icons";

import './index.scss'

export default ({
  collapsed,
  setcollapsed,
  collapsedFilter,
  setcollapsedFilter,
  isMobile,
}) => {
  return (
    <div className={`${isMobile ? "overlayBar" : ""}`}>
      <section className="navbar-cst">
        <div className="flexBox w-100">
          <div className="left-bx flexBox" style={{ justifyContent: `unset` }} >
            <button
              onClick={() => {
                setcollapsed(!collapsed);
                setcollapsedFilter(true);
              }}
              className="btn"
            >
              <Icons name={collapsed ? 18 : 20} />
            </button>
            <img src={require('../../images/mobile_logo.png')} style={{ marginTop: `4px` }} />
          </div>
          <div className="mid-bx flexBox"></div>
          <div className="logo-4 flexBox">
            <div className="flexBox searchBox">
              <input />
              <button className="btn" onClick={() => alert()}>
                <Icons name={13} />
              </button>
            </div>
            <button
              onClick={() => {
                setcollapsedFilter(!collapsedFilter);
                setcollapsed(true);
              }}
              className="btn mobile-menuBtn"
            >
              <Icons name={collapsedFilter ? 19 : 20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
