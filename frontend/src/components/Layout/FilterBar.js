import React from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import ConnectWallet from "./ConnectWallet";
import "react-pro-sidebar/dist/css/styles.css";
import Icons from "./Icons";

export default ({ collapsed, setcollapsed, isMobile }) => {
  return (
    <ProSidebar collapsed={collapsed} collapsedWidth={isMobile ? "0px" : 34}>
      <Menu iconShape="square">
        {!isMobile ? (
          <MenuItem
            onClick={() => {
              setcollapsed(!collapsed);
            }}
          >
            <div
              className={`mx-2 d-flex ${collapsed ? "flex-start" : "flex-end"}`}
            >
              <Icons name={collapsed ? 3 : 8} />
            </div>
          </MenuItem>
        ) : (
          <>
            <ConnectWallet />
          </>
        )}
        <SubMenu
          title="Marketplace"
          icon={
            <>
              <Icons name={4} />
            </>
          }
        >
          <MenuItem>All collection</MenuItem>
        </SubMenu>
        <SubMenu
          title="Insights"
          icon={
            <>
              <Icons name={5} />
            </>
          }
        >
          <MenuItem>Stats</MenuItem>
        </SubMenu>
        <SubMenu
          title="Creators"
          icon={
            <>
              <Icons name={6} />
            </>
          }
        >
          <MenuItem>Apply for listing</MenuItem>
        </SubMenu>

        <MenuItem
          icon={
            <>
              <Icons name={7} />
            </>
          }
        >
          Apply for listing
        </MenuItem>
      </Menu>
      <div className={`sct ${collapsed ? "flex-column cssticon" : ""}`}>
        <div className="sicon">
          <Icons name={9} />
        </div>
        <div className="sicon">
          <Icons name={10} />
        </div>
        <div className="sicon">
          <Icons name={11} />
        </div>
        <div className="sicon">
          <Icons name={12} />
        </div>
      </div>
    </ProSidebar>
  );
};
