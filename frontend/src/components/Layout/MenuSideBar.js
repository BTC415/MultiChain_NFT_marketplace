import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { BlockChainItems, VolumeItems, PerformanceItems } from "../../utiles";
import Icons from "../Global/Icons";

export default ({ collapsed, isMobile, isFilter, setFilter }) => {
  return (
    <div className={`${isMobile ? "overlay-menu" : ""}`}>
      <ProSidebar
        collapsed={collapsed}
        className={isMobile && collapsed ? "side-filter-cst" : "dsp-none"}
        collapsedWidth={isMobile ? "0px" : 34}
        style={{ position: `relative`, display: isFilter ? `none` : `block` }}
      >
        {
          isMobile && <div
            style={{
              position: `absolute`,
              right: `20px`
            }}
            onClick={() => setFilter(!isFilter)}
          >
            <Icons name={20} />
          </div>
        }

        <Menu iconShape="square" style={{ marginLeft: 10 }}>
          <div className="menu-container">
            <label>Volume:</label>
            <SubMenu title="Low - High">
              {VolumeItems.map((x, i) => (
                <MenuItem onClick={x.onClick} className="mx-2" key={i} >
                  {x.name}
                </MenuItem>
              ))}
            </SubMenu>
          </div>
          <div className="menu-container">
            <label>Blockchain:</label>
            <SubMenu title="All">
              {BlockChainItems.map((x, i) => (
                <MenuItem onClick={x.onClick} className="mx-2" key={i} >
                  {x.name}
                </MenuItem>
              ))}
            </SubMenu>
          </div>
          <div className="menu-container">
            <label>Floorprice:</label>
            <SubMenu title="Low - High">
              {VolumeItems.map((x, i) => (
                <MenuItem onClick={x.onClick} className="mx-2" key={i} >
                  {x.name}
                </MenuItem>
              ))}{" "}
            </SubMenu>
          </div>
          <div className="menu-container">
            <label>Performance:</label>
            <SubMenu title="Last 24 hours">
              {PerformanceItems.map((x, i) => (
                <MenuItem onClick={x.onClick} className="mx-2" key={i} >
                  {x.name}
                </MenuItem>
              ))}{" "}
            </SubMenu>
          </div>
          <div className="menu-container">
            <label>Supply:</label>
            <SubMenu title="Low - High">
              {VolumeItems.map((x, i) => (
                <MenuItem onClick={x.onClick} className="mx-2" key={i} >
                  {x.name}
                </MenuItem>
              ))}{" "}
            </SubMenu>
          </div>
        </Menu>
      </ProSidebar>
    </div>
  );
};
