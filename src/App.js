// @flow

import React from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';

// import Loadable from 'react-loadable';
// import Loading from './loading-component';

import compose from 'recompose/compose';

import { withStyles, withWidth } from '@material-ui/core';
import {
  AppBar, Drawer, Divider, Toolbar,
  // Tooltip, Button, Grid,
  Hidden, IconButton, Typography,
  // Paper, Checkbox, 
  Snackbar,
  Menu, MenuItem,
  List, ListItem, ListItemIcon, ListItemText
} from '@material-ui/core';

// icons
import * as mdi from 'mdi-material-ui';
// import * as mui from '@material-ui/icons';

import { GroupWork } from '@material-ui/icons'
import {
  Menu as MenuIcon, AccountCircle,
  // ChevronLeft, ChevronRight, Inbox, EmailOpen, Star, Send, Email, Delete, AlertOctagon, 
  ClipboardAccount, ClipboardText, HexagonMultiple, FlagVariant
} from 'mdi-material-ui';

import { connect } from 'react-redux'

import axios from 'axios'

// import { hashHistory } from 'react-router';
import {
  BrowserRouter, Switch, Route, Link,
  // Redirect
} from 'react-router-dom';

import {
  withCookies,
  // Cookies
} from 'react-cookie';

import LoginPage from './login';

import HomePage from "./home"
// import DataTableBase from "./data_table_base"
import ClientTypePage from "./client_type"
import MaterialTypePage from "./material_type"
import MaterialPage from "./material"
import ClientPage from "./client"
import OrderPage from "./order"
import OrderDetailsPage from "./order_details"
import ProductPage from "./product"
import ProductDetailsPage from "./product_details"
import FormulaDetailsPage from "./formula_details"
import BomDetailsPage from "./bom_details"
import BomsPage from "./boms"
import PurchasingOrderPage from "./purchasing_order"
import PurchasingOrderDetailsPage from "./purchasing_order_details"
import StockChangingPage from './repo_changing'
import StockChangingDetailsPage from './repo_changing_details'
import RepoPage from './repo'
import RepoDetailsPage from './repo_details'
import InventoryPage from './inventory'
import OrganizaionPage from './organization'
import UserPage from './user'
import RolePage from './role'
import UserRolePage from './user_role'
import RolePrivilegePage from './role_privilege'
import PaymentSettlementPage from './payment_settlement'
import PaymentSettlementDetailsPage from './payment_settlement_details'
import CollectingSettlementPage from './collecting_settlement'
import CollectingSettlementDetailsPage from './collecting_settlement_details'

// import DAC from "./dimension_aware_component"
import * as config from "./config"

import { actionLogout, actionUpdateUserInfo } from "./redux/redux"
import { actionShowSnackbar, actionHideSnackbar } from "./redux/data_selection"
// import withRouter from 'react-router-dom/withRouter';

// const DataTableBase = Loadable({
//   loader: () => import('./data_table_base'),
//   loading: Loading,
// });
// const ClientTypePage = Loadable({
//   loader: () => import("./client_type"),
//   loading: Loading,
// });
// const MaterialTypePage = Loadable({
//   loader: () => import("./material_type"),
//   loading: Loading,
// });
// const MaterialPage = Loadable({
//   loader: () => import("./material"),
//   loading: Loading,
// });
// const ClientPage = Loadable({
//   loader: () => import("./client"),
//   loading: Loading,
// });
// const OrderPage = Loadable({
//   loader: () => import("./order"),
//   loading: Loading,
// });
// const OrderDetailsPage = Loadable({
//   loader: () => import("./order_details"),
//   loading: Loading,
// });
// const ProductPage = Loadable({
//   loader: () => import("./product"),
//   loading: Loading,
// });
// const ProductDetailsPage = Loadable({
//   loader: () => import("./product_details"),
//   loading: Loading,
// });
// const FormulaDetailsPage = Loadable({
//   loader: () => import("./formula_details"),
//   loading: Loading,
// });
// const BomDetailsPage = Loadable({
//   loader: () => import("./bom_details"),
//   loading: Loading,
// });
// const BomsPage = Loadable({
//   loader: () => import("./boms"),
//   loading: Loading,
// });


class App extends React.PureComponent<{ classes: any }, any> {

  constructor(props) {
    super(props);

    this.state = {
      openDrawer: false,
      anchor: 'left',

      basicDataMenu: false,
    };

    this.handleDrawerToggle = this.handleDrawerToggle.bind(this);

    this.handleClick = event => {
      this.setState({ anchorEl: event.currentTarget });
    };

    this.handleClose = () => {
      this.setState({ anchorEl: null });
    };

    this.handleLogout = () => {
      this.setState({ anchorEl: null });

      this.props.cookies.remove('token')
      this.props.logout()

      // this.props.history.replace("/")
    };

    this.hasPrivilege = (privilege => {
      if (!this.state.user || !this.state.user.roles)
        return false

      const { roles } = this.state.user
      for (let r of roles) {
        for (let p of r.privileges) {
          if (privilege.startsWith(p.code))
            return true
        }
      }

      return false
    })
  }

  componentDidMount() {
    const { cookies } = this.props;
    const token = cookies.get('token')
    // const user = cookies.get('user')

    // if (!token) {
    //   this.props.history.replace('/login');
    // } else
    this.setState({ token })

    // if (user)
    //   this.setState({ user })
    // else {
    if (token) {
      axios.defaults.headers.common['Authorization'] = token;

      axios.get(`${config.API_BASE_URL}user`)
        .then(r => r.data.data)
        .then(user => {
          this.setState({ user })
          this.props.updateUserInfo(user)
        })
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.token !== this.props.token) {
      const { cookies, token, user } = this.props

      if (token) {
        cookies.set('token', token, { path: '/' })
        // cookies.set('user', user)

        axios.defaults.headers.common['Authorization'] = token;
        // axios.get(`${config.API_BASE_URL}user`)
        //   .then(r => r.data.data)
        //   .then(user => this.setState({ user }))
      }

      this.setState({ token, user })
      this.props.history.replace("/")
      // console.warn(`login failed: ${this.props.loginResult}`)
    }
  }

  handleDrawerToggle() {
    this.setState({ openDrawer: !this.state.openDrawer });
  }

  salesItems = _ => {
    let l = []

    if (this.hasPrivilege('sales:client'))
      l.push(<Link key="/client" to="/client">
        <ListItem button>
          <ListItemIcon>
            <ClipboardAccount />
          </ListItemIcon>
          <ListItemText primary="客户" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('sales:order'))
      l.push(<Link key="/orders" to="/orders">
        <ListItem button>
          <ListItemIcon>
            <ClipboardText />
          </ListItemIcon>
          <ListItemText primary="订单" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('production:product'))
      l.push(<Link key="/product" to="/product">
        <ListItem button>
          <ListItemIcon>
            <GroupWork />
          </ListItemIcon>
          <ListItemText primary="产品" />
        </ListItem>
      </Link>)

    return l.length > 0 ?
      <React.Fragment>
        <Divider />
        <List>
          {l}
        </List>
      </React.Fragment >
      : null
  }

  basicDataItems = _ => {
    let l = []

    if (this.hasPrivilege('system:basic-data'))
      l.push(<Link key="/basic_data/client_type" to="/basic_data/client_type">
        <ListItem button>
          <ListItemIcon>
            <FlagVariant />
          </ListItemIcon>
          <ListItemText primary="客户类型" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('system:basic-data'))
      l.push(<Link key="/basic_data/material_type" to="/basic_data/material_type">
        <ListItem button>
          <ListItemIcon>
            <FlagVariant />
          </ListItemIcon>
          <ListItemText primary="材料分类" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('production:material'))
      l.push(<Link key="/basic_data/material" to="/basic_data/material">
        <ListItem button>
          <ListItemIcon>
            <HexagonMultiple />
          </ListItemIcon>
          <ListItemText primary="材料" />
        </ListItem>
      </Link>)

    return l.length > 0 ?
      <React.Fragment>
        <Divider />
        <List>
          {l}
        </List>
      </React.Fragment >
      : null
  }

  userManagementItems = _ => {
    let l = []

    // if (this.hasPrivilege('system:user-management'))
    //   l.push(<Link key="/organizaion" to="/organizaion">
    //     <ListItem button>
    //       <ListItemIcon>
    //         <mdi.AccountGroup />
    //       </ListItemIcon>
    //       <ListItemText primary="组织结构" />
    //     </ListItem>
    //   </Link>)stem:user-management'))
    //   l.push(<Link key="/organizaion" to="/organizaion">
    //     <ListItem button>
    //       <ListItemIcon>
    //         <mdi.AccountGroup />
    //       </ListItemIcon>
    //       <ListItemText primary="组织结构" />
    //     </ListItem>
    //   </Link>)

    if (this.hasPrivilege('system:user-management'))
      l.push(<Link key="/user" to="/user">
        <ListItem button>
          <ListItemIcon>
            <mdi.AccountCircle />
          </ListItemIcon>
          <ListItemText primary="员工" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('system:user-management'))
      l.push(<Link key="/role" to="/role">
        <ListItem button>
          <ListItemIcon>
            <mdi.AccountCircle />
          </ListItemIcon>
          <ListItemText primary="岗位" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('system:user-management'))
      l.push(<Link key="/userRole" to="/userRole">
        <ListItem button>
          <ListItemIcon>
            <mdi.AccountCircle />
          </ListItemIcon>
          <ListItemText primary="员工岗位" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('system:user-management'))
      l.push(<Link key="/rolePrivilege" to="/rolePrivilege">
        <ListItem button>
          <ListItemIcon>
            <mdi.AccountCircle />
          </ListItemIcon>
          <ListItemText primary="岗位权限" />
        </ListItem>
      </Link>)

    return l.length > 0 ?
      <React.Fragment>
        <Divider />
        <List>
          {l}
        </List>
      </React.Fragment >
      : null
  }

  manufactionItems = _ => {
    let l = []

    if (this.hasPrivilege('production:bom'))
      l.push(<Link key="/boms" to="/boms">
        <ListItem button>
          <ListItemIcon>
            <mdi.FileMultiple />
          </ListItemIcon>
          <ListItemText primary="BOM 物料清单" />
        </ListItem>
      </Link>)

    return l.length > 0 ?
      <React.Fragment>
        <Divider />
        <List>
          {l}
        </List>
      </React.Fragment >
      : null
  }

  purchasingOrderItems = _ => {
    let l = []

    if (this.hasPrivilege('purchasing:plan'))
      l.push(<Link key="/purchasingOrder" to="/purchasingOrder">
        <ListItem button>
          <ListItemIcon>
            <mdi.LibraryBooks />
          </ListItemIcon>
          <ListItemText primary="采购计划" />
        </ListItem>
      </Link>)

    return l.length > 0 ?
      <React.Fragment>
        <Divider />
        <List>
          {l}
        </List>
      </React.Fragment >
      : null
  }

  accountingItems = _ => {
    let l = []

    if (this.hasPrivilege('accounting:settlement'))
      l.push(<Link key="/paymentSettlement" to="/paymentSettlement">
        <ListItem button>
          <ListItemIcon>
            <mdi.LibraryBooks />
          </ListItemIcon>
          <ListItemText primary="应付结算" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('accounting:settlement'))
      l.push(<Link key="/paymentProcess" to="/paymentProcess">
        <ListItem button>
          <ListItemIcon>
            <mdi.LibraryBooks color='light-red' />
          </ListItemIcon>
          <ListItemText primary="应付处理" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('accounting:settlement'))
      l.push(<Link key="/collectingSettlement" to="/collectingSettlement">
        <ListItem button>
          <ListItemIcon>
            <mdi.LibraryBooks />
          </ListItemIcon>
          <ListItemText primary="应收结算" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('accounting:settlement'))
      l.push(<Link key="/collectingProcess" to="/collectingProcess">
        <ListItem button>
          <ListItemIcon>
            <mdi.LibraryBooks color='lightRed' />
          </ListItemIcon>
          <ListItemText primary="应收处理" />
        </ListItem>
      </Link>)

    return l.length > 0 ?
      <React.Fragment>
        <Divider />
        <List>
          {l}
        </List>
      </React.Fragment >
      : null
  }

  stockItems = _ => {
    let l = []

    if (this.hasPrivilege('system:basic-data'))
      l.push(<Link key="/repo" to="/repo">
        <ListItem button>
          <ListItemIcon>
            <mdi.Database />
          </ListItemIcon>
          <ListItemText primary="仓库" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('repo:stock-in'))
      l.push(
        // <Tooltip key="key_stock_in" title="非库房人员申请">
        <Link key={config.ROUTER_STOCK_IN} to={config.ROUTER_STOCK_IN}>
          <ListItem button>
            <ListItemIcon>
              <mdi.DatabasePlus />
            </ListItemIcon>
            <ListItemText primary="入库单" />
          </ListItem>
        </Link>
        // </Tooltip>
      )

    if (this.hasPrivilege('repo:stock-out'))
      l.push(
        // <Tooltip key="key_stock_out" title="非库房人员申请">
        <Link key={config.ROUTER_STOCK_OUT} to={config.ROUTER_STOCK_OUT}>
          <ListItem button>
            <ListItemIcon>
              <mdi.DatabaseMinus />
            </ListItemIcon>
            <ListItemText primary="出库单" />
          </ListItem>
        </Link>
        // </Tooltip>
      )

    if (this.hasPrivilege('repo:inventory'))
      l.push(
        // <Tooltip key="key_inventory" title="库房人员使用">
        <Link key={config.ROUTER_STOCK_IN_OUT} to={config.ROUTER_STOCK_IN_OUT}>
          <ListItem button>
            <ListItemIcon>
              <mdi.Database />
            </ListItemIcon>
            <ListItemText primary="出/入库单受理" />
          </ListItem>
        </Link>
        // </Tooltip>
      )

    if (this.hasPrivilege('repo:inventory'))
      l.push(<Link key="/repo_details" to="/repo_details">
        <ListItem button>
          <ListItemIcon>
            <mdi.DatabaseSearch />
          </ListItemIcon>
          <ListItemText primary="库存明细" />
        </ListItem>
      </Link>)

    if (this.hasPrivilege('repo:inventory'))
      l.push(<Link key="/inventory" to="/inventory">
        <ListItem button>
          <ListItemIcon>
            <mdi.DatabaseSearch />
          </ListItemIcon>
          <ListItemText primary="盘点" />
        </ListItem>
      </Link>)

    return l.length > 0 ?
      <React.Fragment>
        <Divider />
        <List>
          {l}
        </List>
      </React.Fragment >
      : null
  }

  // handleDrawerOpen = () => {
  //   this.setState({ openDrawer: true });
  // };

  // handleDrawerClose = () => {
  //   this.setState({ openDrawer: false });
  // };


  renderRenderTitle(classes) {
    return (
      <Switch>
        <Route path="/client" component={() => <Typography variant="title" className={classes.appTitle}>客户</Typography>} />
        <Route path="/order" component={() => <Typography variant="title" className={classes.appTitle}>订单详情</Typography>} />
        <Route path="/orders" component={() => <Typography variant="title" className={classes.appTitle}>订单</Typography>} />
        <Route path="/product/:id" component={() => <Typography variant="title" className={classes.appTitle}>产品详情</Typography>} />
        <Route path="/formula/:mode/*" component={() => <Typography variant="title" className={classes.appTitle}>产品详情 - 配方</Typography>} />
        <Route path="/product" component={() => <Typography variant="title" className={classes.appTitle}>产品</Typography>} />
        <Route path="/basic_data/client_type" component={() => <Typography variant="title" className={classes.appTitle}>客户类型</Typography>} />
        <Route path="/basic_data/material_type" component={() => <Typography variant="title" className={classes.appTitle}>材料分类</Typography>} />
        <Route path="/basic_data/material" component={() => <Typography variant="title" className={classes.appTitle}>材料</Typography>} />
        <Route path="/bom/*" component={() => <Typography variant="title" className={classes.appTitle}>BOM - 物料清单</Typography>} />
        <Route path="/boms" component={() => <Typography variant="title" className={classes.appTitle}>BOM - 物料清单</Typography>} />
        <Route path={config.ROUTER_STOCK_IN} component={({ type }) => <Typography variant="title" className={classes.appTitle}>入库单</Typography>} />
        <Route path={config.ROUTER_STOCK_OUT} component={({ type }) => <Typography variant="title" className={classes.appTitle}>出库单</Typography>} />
        <Route path={config.ROUTER_STOCK_IN_OUT} component={({ type }) => <Typography variant="title" className={classes.appTitle}>出/入库单受理</Typography>} />
        <Route path="/repo" component={({ type }) => <Typography variant="title" className={classes.appTitle}>仓库</Typography>} />
        <Route path="/repo_details" component={({ type }) => <Typography variant="title" className={classes.appTitle}>库存明细</Typography>} />
        <Route path="/inventory" component={({ type }) => <Typography variant="title" className={classes.appTitle}>库存</Typography>} />
        <Route path="/purchasingOrder" component={({ type }) => <Typography variant="title" className={classes.appTitle}>采购计划</Typography>} />
        <Route path="/purchasingOrderDetails" component={({ type }) => <Typography variant="title" className={classes.appTitle}>采购计划明细</Typography>} />
        <Route path="/organizaion" component={({ type }) => <Typography variant="title" className={classes.appTitle}>组织结构</Typography>} />
        <Route path="/user" component={({ type }) => <Typography variant="title" className={classes.appTitle}>员工</Typography>} />
        <Route path="/role" component={({ type }) => <Typography variant="title" className={classes.appTitle}>岗位</Typography>} />
        <Route path="/userRole" component={({ type }) => <Typography variant="title" className={classes.appTitle}>员工岗位</Typography>} />
        <Route path="/rolePrivilege" component={({ type }) => <Typography variant="title" className={classes.appTitle}>岗位权限</Typography>} />
        <Route path="/paymentSettlement" component={({ type }) => <Typography variant="title" className={classes.appTitle}>应付结算</Typography>} />
        <Route path="/paymentProcess" component={({ type }) => <Typography variant="title" className={classes.appTitle}>应付处理</Typography>} />
        <Route path="/collectingSettlement" component={({ type }) => <Typography variant="title" className={classes.appTitle}>应收结算</Typography>} />
        <Route path="/collectingProcess" component={({ type }) => <Typography variant="title" className={classes.appTitle}>应收处理</Typography>} />
        <Route component={() => <Typography variant="title" className={classes.appTitle}>华丽雅</Typography>} />
      </Switch>

    )
  }

  renderRenderMainContent() {
    // 'admin'
    // 'financial-manager'
    // 'general-manager'
    // 'process-manager'
    // 'producing-manager'
    // 'product-manager'
    // 'repo-keeper'
    // 'sales-manager'

    // 'production:bom'
    // 'production:formula'
    // 'production:material'
    // 'production:product'
    // 'purchasing:plan'
    // 'repo:inventory'
    // 'repo:stock-in'
    // 'repo:stock-out'
    // 'sales:client'
    // 'sales:order'
    // 'system:basic-data'
    // 'system:user-management'

    // const { roles } = this.state.user


    return (
      <Switch>
        {/* {this.hasPrivilege('sales:client') ? */}
        <Route path="/client" component={ClientPage} />
        {/* : null} */}

        {/* {this.hasPrivilege('sales:order') ?
          <React.Fragment> */}
        <Route path="/order/:id?" component={OrderDetailsPage} />
        <Route path="/orders" component={OrderPage} />
        {/* </React.Fragment>
          : null} */}

        {/* {this.hasPrivilege('production:product') ?
          <React.Fragment> */}
        <Route path="/product/:id" component={ProductDetailsPage} />
        <Route path="/formula/:mode/:pid/:fid" component={FormulaDetailsPage} />
        <Route path="/product" component={ProductPage} />
        {/* </React.Fragment>
          : null} */}

        {/* {this.hasPrivilege('system:basic-data') ?
          <React.Fragment> */}
        <Route path="/basic_data/client_type" component={ClientTypePage} />
        <Route path="/basic_data/material_type" component={MaterialTypePage} />
        {/* </React.Fragment>
          : null} */}

        {/* {this.hasPrivilege('production:material') ?
          <React.Fragment> */}
        <Route path="/basic_data/material" component={MaterialPage} />
        {/* </React.Fragment>
          : null} */}

        <Route path="/bom/:mode/:id?" component={BomDetailsPage} />
        <Route path="/boms" component={BomsPage} />
        <Route path={`${config.ROUTER_STOCK_IN}/:mode/:id?`} render={(props) => <StockChangingDetailsPage {...props} type={config.TYPE_STOCK_IN} user={this.state.user} key="stock-in-detail" />} />
        <Route path={config.ROUTER_STOCK_IN} render={(props) => <StockChangingPage {...props} key={config.ROUTER_STOCK_IN} type={config.TYPE_STOCK_IN} user={this.state.user} />} />
        <Route path={`${config.ROUTER_STOCK_OUT}/:mode/:id?`} render={(props) => <StockChangingDetailsPage {...props} type={config.TYPE_STOCK_OUT} user={this.state.user} key="stock-out-detail" />} />
        <Route path={config.ROUTER_STOCK_OUT} render={(props) => <StockChangingPage {...props} key={config.ROUTER_STOCK_OUT} type={config.TYPE_STOCK_OUT} user={this.state.user} />} />
        <Route path={`${config.ROUTER_STOCK_IN_OUT}/:id`} render={(props) => <StockChangingDetailsPage {...props} key={config.ROUTER_STOCK_IN_OUT} type={config.TYPE_STOCK_IN_OUT} user={this.state.user} />} />
        <Route path={config.ROUTER_STOCK_IN_OUT} render={(props) => <StockChangingPage {...props} key={config.ROUTER_STOCK_IN_OUT} type={config.TYPE_STOCK_IN_OUT} user={this.state.user} />} />
        <Route path="/repo_details" component={RepoDetailsPage} />
        <Route path="/repo" component={RepoPage} />
        <Route path="/inventory" component={InventoryPage} />

        <Route path="/purchasingOrder" render={(props) => <PurchasingOrderPage {...props} user={this.state.user} />} />
        <Route path="/purchasingOrderDetails/:id?" render={(props) => <PurchasingOrderDetailsPage {...props} user={this.state.user} />} />

        <Route path="/paymentSettlement" render={(props) => <PaymentSettlementPage {...props} user={this.state.user} />} />
        <Route path="/paymentProcess" render={(props) => <PaymentSettlementPage {...props} user={this.state.user} type='process' key='paymentProcess' />} />
        <Route path="/paymentSettlementDetails/:id?" render={(props) => <PaymentSettlementDetailsPage {...props} user={this.state.user} />} />
        <Route path="/collectingSettlement" render={(props) => <CollectingSettlementPage {...props} user={this.state.user} />} />
        <Route path="/collectingProcess" render={(props) => <CollectingSettlementPage {...props} user={this.state.user} type='process' key='collectingProcess'  />} />
        <Route path="/collectingSettlementDetails/:id?" render={(props) => <CollectingSettlementDetailsPage {...props} user={this.state.user} />} />

        {/* {this.hasPrivilege('system:user-management') ? */}
        {/* <React.Fragment> */}
        <Route path="/organizaion" component={OrganizaionPage} />
        <Route path="/user" component={UserPage} />
        <Route path="/role" component={RolePage} />
        <Route path="/userRole" component={UserRolePage} />
        <Route path="/rolePrivilege" component={RolePrivilegePage} />
        {/* </React.Fragment>
          : null} */}

        <Route component={HomePage} />
      </Switch>

    )
  }

  render() {
    const { classes, } = this.props
    const { token, user, anchor, openDrawer, anchorEl } = this.state;

    const { snackbarOpen, snackbarContent, hideSnackbar } = this.props;

    // console.debug(this.props.width)
    // const defaultCloseDrawer = (width == 'xs' || width == 'sm');

    const drawer = (
      <div>
        <div className={classes.drawerHeader}>
          {/* <IconButton onClick={this.handleDrawerToggle}>
            <ChevronLeft />
          </IconButton> */}
          <Link to="/"><Typography variant="title">华丽雅</Typography></Link>
        </div>
        {/* <Divider />
        <List> */}
        {this.salesItems()}
        {/* </List>
        <Divider />
        <List> */}
        {this.userManagementItems()}
        {/* </List>
        <Divider />
        <List> */}
        {this.basicDataItems()}
        {/* </List>
        <Divider />
        <List> */}
        {this.manufactionItems()}
        {/* </List>
        <Divider />
        <List> */}
        {this.purchasingOrderItems()}

        {this.accountingItems()}

        {this.stockItems()}
        {/* </List> */}
      </div>
    );

    return <React.Fragment>
      {!token || !user ? <LoginPage /> :
        <BrowserRouter>
          <div className={classes.appFrame}>
            <AppBar className={classes.appBar}>
              <Toolbar>
                <IconButton color="inherit" className={classes.navIconHide} aria-label="open drawer" onClick={this.handleDrawerToggle}>
                  <MenuIcon />
                </IconButton>

                {this.renderRenderTitle(classes)}

                <IconButton color="inherit"
                  aria-owns={anchorEl ? 'simple-menu' : null}
                  aria-haspopup="true"
                  onClick={this.handleClick}><AccountCircle /></IconButton>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={this.handleClose}
                >
                  {/* <MenuItem onClick={this.handleClose}>
                    <ListItemIcon className={classes.icon}>
                      <mdi.FaceProfile />
                    </ListItemIcon>
                    <ListItemText classes={{ primary: classes.primary }} primary="个人信息" />
                  </MenuItem> */}
                  <MenuItem onClick={this.handleLogout}>
                    <ListItemIcon className={classes.icon}>
                      <mdi.Logout />
                    </ListItemIcon>
                    <ListItemText classes={{ primary: classes.primary }} primary="退出登录" />
                  </MenuItem>
                </Menu>
                {user ? <Typography style={{ color: "#ffffff" }}>{user.name}</Typography> : null}
              </Toolbar>
            </AppBar>
            <Hidden mdUp>
              <Drawer
                variant="temporary"
                anchor={anchor}
                open={openDrawer}
                onClose={this.handleDrawerToggle}
                classes={{
                  paper: classes.drawerPaper,
                }}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
              >
                {drawer}
              </Drawer>
            </Hidden>
            <Hidden smDown implementation="css">
              <Drawer
                variant="permanent"
                open
                classes={{
                  paper: classes.drawerPaper,
                }}
              >
                {drawer}
              </Drawer>
            </Hidden>
            <main
              className={classes.content}
            >
              {/* <div className={classes.drawerHeader} /> */}

              {this.renderRenderMainContent()}
            </main>
          </div>
        </BrowserRouter >
      }

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        autoHideDuration={3000}
        open={!!snackbarOpen}
        // onClose={() => this.setState({ snackbarOpen: false })}
        onClose={hideSnackbar}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{snackbarContent}</span>}
      />

    </React.Fragment>
  }
}

const drawerWidth = 240;

const styles = theme => ({
  root: {
    // flexGrow: 1,
    width: '100%',
  },

  appTitle: {
    color: "inherit",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    flex: 1,
  },

  appFrame: {
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  appBar: {
    position: 'absolute',
    marginleft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
    // transition: theme.transitions.create(['margin', 'width'], {
    //   easing: theme.transitions.easing.sharp,
    //   duration: theme.transitions.duration.leavingScreen,
    // }),
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  flex: {
    flex: 1,
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'appBarShift-left': {
    marginleft: drawerWidth,
  },
  'appBarShift-right': {
    marginRight: drawerWidth,
  },
  menuButton: {
    marginleft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    // position: 'relative',
    width: drawerWidth,
    [theme.breakpoints.up('md')]: {
      position: 'relative',
    },
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    // display: 'flex',
    // flexDirection: 'column',
    // flex: 1,
    backgroundColor: theme.palette.background.default,
    padding: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),

    marginTop: '64px',
    overflowY: 'auto',
    width: '100%'
  },
  'content-left': {
    marginleft: -drawerWidth,
  },
  'content-right': {
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'contentShift-left': {
    marginleft: 0,
  },
  'contentShift-right': {
    marginRight: 0,
  },
});

App.propTypes = {
  classes: PropTypes.object.isRequired,
};


//
const mapStateToProps = state => ({
  token: state.main.token,
  user: state.main.user,

  //
  snackbarOpen: state.data.snackbarOpen,
  snackbarContent: state.data.snackbarContent,
})

const mapDispatchToProps = dispatch => ({
  updateUserInfo: user => dispatch(actionUpdateUserInfo(user)),
  logout: _ => dispatch(actionLogout()),
  showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
  hideSnackbar: _ => dispatch(actionHideSnackbar())
})

const ConnectedApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)


export default compose(withStyles(styles, { withTheme: true }), withWidth())(withCookies(ConnectedApp));
