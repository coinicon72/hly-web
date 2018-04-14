// @flow

import React, { Component } from 'react';
// import logo from './logo.svg';
// import '../node_modules/material-design-lite/material.min.css'
// import "../node_modules/material-design-lite/material.min.js"
// import "./material_icons.css"
import { Elevation } from 'rmwc/Elevation';

import { Button, ButtonIcon } from 'rmwc/Button';

import { Chip, ChipText, ChipIcon, ChipSet } from 'rmwc/Chip';

import {
  Toolbar,
  ToolbarRow,
  ToolbarSection,
  ToolbarTitle,
  ToolbarMenuIcon,
  ToolbarIcon
} from 'rmwc/Toolbar';

import {
  Drawer,
  DrawerHeader,
  DrawerContent
} from 'rmwc/Drawer';

import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryText,
  ListItemGraphic,
  ListItemMeta,
  SimpleListItem
} from 'rmwc/List';

import { Grid, GridCell } from 'rmwc/Grid';

import { Fab } from 'rmwc/Fab';

import { BrowserRouter, Route, Link } from 'react-router-dom';

import { HomePage } from "./home"
import ClientTypePage from "./client_type"
import MaterialTypePage from "./material_type"
import MaterialPage from "./material"
import ClientPage from "./client"
import OrderPage from "./order"
import ProductPage from "./product"

class App extends Component<any, any> {

  constructor(props: any) {
    super(props)

    this.state = { persistentOpen: true, basicDataMenu: false, }

  }

  /**
   * Calculate & Update state of new dimensions
   */
  updateDimensions() {
    // if(window.innerWidth < 500) {
    //   this.setState({ width: 450, height: 102 });
    // } else {
    let update_width = window.innerWidth//-100;
    let update_height = window.innerHeight// Math.round(update_width/4.4);
    this.setState({ width: update_width, height: update_height });
    // }
  }

  /**
   * Add event listener
   */
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  /**
   * Remove event listener
   */
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  render() {
    return (
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
          <Toolbar>
            <ToolbarRow>
              <ToolbarSection alignStart>
                {/* <Button onClick={}> */}
                <ToolbarMenuIcon use="menu" onClick={() => this.setState({ persistentOpen: this.state.persistentOpen === undefined ? false : !this.state.persistentOpen })} />
                {/* </Button> */}
                <ToolbarTitle>Try to figure out the cool title</ToolbarTitle>
              </ToolbarSection>
              <ToolbarSection alignEnd>
                {/* <Link to="/myself"> */}
                <ToolbarIcon use="save" />
                {/* </Link> */}

                {/* <Link to="/help"> */}
                <ToolbarIcon use="print" />
                {/* </Link> */}
              </ToolbarSection>
            </ToolbarRow>
          </Toolbar>
          {/* <Grid> */}
          {/* <GridCell span="4"> */}
          {/* <div style={{flexDirection: 'row'}}> */}
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ height: '100%', overflowY: this.state.persistentOpen ? 'auto' : 'hidden' }}>
              <Drawer persistent style={{}} open={this.state.persistentOpen == undefined ? true : this.state.persistentOpen}>
                <DrawerHeader>
                  DrawerHeader
  </DrawerHeader>
                <DrawerContent>
                  <ListItem onClick={() => this.setState({ basicDataMenuOpen: !this.state.basicDataMenuOpen })}>
                    <ListItemGraphic>storage</ListItemGraphic>
                    <ListItemText>基础数据</ListItemText>
                    <ListItemMeta className={this.state.basicDataMenuOpen ? "submenu_icon submenu_icon_open" : "submenu_icon"}>chevron_right</ListItemMeta>
                  </ListItem>
                  <List className={this.state.basicDataMenuOpen ? 'submenu submenu_open' : 'submenu'}>
                    <Link to="/basic_data/client_type">
                      <SimpleListItem text="客户类型" />
                    </Link>
                    <Link to="/basic_data/material_type">
                      <SimpleListItem text="材料分类" />
                    </Link>
                    <Link to="/basic_data/material">
                      <SimpleListItem text="材料" />
                    </Link>
                  </List>
                  <Link to="/client">
                    <SimpleListItem graphic="assignment_ind" text="客户" />
                  </Link>
                  <Link to="/order">
                    <SimpleListItem graphic="assignment" text="订单" />
                  </Link>
                  <Link to="/product">
                    <SimpleListItem graphic="group_work" text="产品" />
                  </Link>
                </DrawerContent>
              </Drawer>
            </div>
            <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: 16 }}>
              {/* </GridCell> */}
              {/* <GridCell style={{ marginLeft: this.state.persistentOpen ? 240 : 0 }}> */}
              <Route exact path="/" component={HomePage} />
              <Route path="/client" component={ClientPage} />
              <Route path="/order" component={OrderPage} />
              <Route path="/product" component={ProductPage} />
              <Route path="/basic_data/client_type" component={ClientTypePage} />
              <Route path="/basic_data/material_type" component={MaterialTypePage} />
              <Route path="/basic_data/material" component={MaterialPage} />
              {/* </GridCell>
</Grid> */}
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
