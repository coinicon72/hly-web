// @flow

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Loadable from 'react-loadable';
import Loading from './loading-component';

import compose from 'recompose/compose';
import { withStyles } from 'material-ui/styles';
import withWidth from 'material-ui/utils/withWidth';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Hidden from 'material-ui/Hidden';
import Menu, { MenuItem } from 'material-ui/Menu';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';

// icons
import * as mdi from 'mdi-material-ui';
import * as mui from '@material-ui/icons';

import { GroupWork } from '@material-ui/icons'
import { Menu as MenuIcon, AccountCircle, ChevronLeft, ChevronRight, Inbox, EmailOpen, Star, Send, Email, Delete, AlertOctagon, ClipboardAccount, ClipboardText, HexagonMultiple, FlagVariant } from 'mdi-material-ui';

import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';

import HomePage from "./home"
import DataTableBase from "./data_table_base"
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
import StockApplyPage from './repo_changing'
import StockApplyDetailsPage from './repo_changing_details'
import RepoPage from './repo'
import RepoDetailsPage from './repo_details'
import InventoryPage from './inventory'
import UserPage from './user'
import RolePage from './role'
import UserRolePage from './user_role'
import RolePrivilegePage from './role_privilege'

// import DAC from "./dimension_aware_component"
import * as config from "./config"
import { Tooltip } from 'material-ui';


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



const salesItems = (<div>
  <Link to="/client">
    <ListItem button>
      <ListItemIcon>
        <ClipboardAccount />
      </ListItemIcon>
      <ListItemText primary="客户" />
    </ListItem>
  </Link>
  <Link to="/orders">
    <ListItem button>
      <ListItemIcon>
        <ClipboardText />
      </ListItemIcon>
      <ListItemText primary="订单" />
    </ListItem>
  </Link>
  <Link to="/product">
    <ListItem button>
      <ListItemIcon>
        <GroupWork />
      </ListItemIcon>
      <ListItemText primary="产品" />
    </ListItem>
  </Link>
</div>
);

const basicDataItems = (
  <div>
    <Link to="/basic_data/client_type">
      <ListItem button>
        <ListItemIcon>
          <FlagVariant />
        </ListItemIcon>
        <ListItemText primary="客户类型" />
      </ListItem>
    </Link>
    <Link to="/basic_data/material_type">
      <ListItem button>
        <ListItemIcon>
          <FlagVariant />
        </ListItemIcon>
        <ListItemText primary="材料分类" />
      </ListItem>
    </Link>
    <Link to="/basic_data/material">
      <ListItem button>
        <ListItemIcon>
          <HexagonMultiple />
        </ListItemIcon>
        <ListItemText primary="材料" />
      </ListItem>
    </Link>
  </div>
);

const userManagementItems = (
  <div>
    <Link to="/user">
      <ListItem button>
        <ListItemIcon>
          <mdi.AccountCircle />
        </ListItemIcon>
        <ListItemText primary="员工" />
      </ListItem>
    </Link>
    <Link to="/role">
      <ListItem button>
        <ListItemIcon>
          <mdi.AccountCircle />
        </ListItemIcon>
        <ListItemText primary="岗位" />
      </ListItem>
    </Link>
    {/* <Link to="/privilege">
      <ListItem button>
        <ListItemIcon>
          <mdi.AccountCircle />
        </ListItemIcon>
        <ListItemText primary="权限" />
      </ListItem>
    </Link> */}
    <Link to="/userRole">
      <ListItem button>
        <ListItemIcon>
          <mdi.AccountCircle />
        </ListItemIcon>
        <ListItemText primary="员工岗位" />
      </ListItem>
    </Link>
    <Link to="/rolePrivilege">
      <ListItem button>
        <ListItemIcon>
          <mdi.AccountCircle />
        </ListItemIcon>
        <ListItemText primary="岗位权限" />
      </ListItem>
    </Link>
  </div>
);

const manufactionItems = (
  <div>
    <Link to="/boms">
      <ListItem button>
        <ListItemIcon>
          <mdi.FileMultiple />
        </ListItemIcon>
        <ListItemText primary="BOM 物料清单" />
      </ListItem>
    </Link>
  </div>
);

const stockItems = (
  <div>
    <Link to="/repo">
      <ListItem button>
        <ListItemIcon>
          <mdi.Database />
        </ListItemIcon>
        <ListItemText primary="仓库" />
      </ListItem>
    </Link>

    <Tooltip title="非库房人员申请">
      <Link to={config.ROUTER_STOCK_IN}>
        <ListItem button>
          <ListItemIcon>
            <mdi.DatabasePlus />
          </ListItemIcon>
          <ListItemText primary="入库单" />
        </ListItem>
      </Link>
    </Tooltip>

    <Tooltip title="非库房人员申请">
      <Link to={config.ROUTER_STOCK_OUT}>
        <ListItem button>
          <ListItemIcon>
            <mdi.DatabaseMinus />
          </ListItemIcon>
          <ListItemText primary="出库单" />
        </ListItem>
      </Link>
    </Tooltip>

    <Tooltip title="库房人员使用">
      <Link to={config.ROUTER_STOCK_IN_OUT}>
        <ListItem button>
          <ListItemIcon>
            <mdi.Database />
          </ListItemIcon>
          <ListItemText primary="出/入库单受理" />
        </ListItem>
      </Link>
    </Tooltip>

    <Link to="/repo_details">
      <ListItem button>
        <ListItemIcon>
          <mdi.DatabaseSearch />
        </ListItemIcon>
        <ListItemText primary="库存明细" />
      </ListItem>
    </Link>

    <Link to="/inventory">
      <ListItem button>
        <ListItemIcon>
          <mdi.DatabaseSearch />
        </ListItemIcon>
        <ListItemText primary="盘点" />
      </ListItem>
    </Link>
  </div>
);

class App extends React.PureComponent<{ classes: any }, any> {

  constructor(props) {
    super(props);

    this.state = {
      openDrawer: false,
      anchor: 'left',

      basicDataMenu: false,
    };

    this.handleDrawerToggle = this.handleDrawerToggle.bind(this);
  }

  // componentDidMount() {
  //   this.setState({openDrawer: this.props.width == 'xs' ? false : true});
  // }

  handleDrawerToggle() {
    this.setState({ openDrawer: !this.state.openDrawer });
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
        <Route path="/inventory" component={({ type }) => <Typography variant="title" className={classes.appTitle}>库存盘点</Typography>} />
        <Route component={() => <Typography variant="title" className={classes.appTitle}>华丽雅</Typography>} />
      </Switch>

    )
  }

  renderRenderMainContent() {
    return (
      <Switch>
        <Route path="/client" component={ClientPage} />
        <Route path="/order/:id?" component={OrderDetailsPage} />
        <Route path="/orders" component={OrderPage} />
        <Route path="/product/:id" component={ProductDetailsPage} />
        <Route path="/formula/:mode/:pid/:fid" component={FormulaDetailsPage} />
        <Route path="/product" component={ProductPage} />
        <Route path="/basic_data/client_type" component={ClientTypePage} />
        <Route path="/basic_data/material_type" component={MaterialTypePage} />
        <Route path="/basic_data/material" component={MaterialPage} />
        <Route path="/bom/:mode/:id?" component={BomDetailsPage} />
        <Route path="/boms" component={BomsPage} />
        <Route path={`${config.ROUTER_STOCK_IN}/:mode/:id?`} render={(props) => <StockApplyDetailsPage {...props} type={config.TYPE_STOCK_IN} key="stock-in-detail" />} />
        <Route path={config.ROUTER_STOCK_IN} render={(props) => <StockApplyPage {...props} key={config.ROUTER_STOCK_IN} type={config.TYPE_STOCK_IN} />} />
        <Route path={`${config.ROUTER_STOCK_OUT}/:mode/:id?`} render={(props) => <StockApplyDetailsPage {...props} type={config.TYPE_STOCK_OUT} key="stock-out-detail" />} />
        <Route path={config.ROUTER_STOCK_OUT} render={(props) => <StockApplyPage {...props} key={config.ROUTER_STOCK_OUT} type={config.TYPE_STOCK_OUT} />} />
        <Route path={`${config.ROUTER_STOCK_IN_OUT}/:id`} render={(props) => <StockApplyDetailsPage {...props} key={config.ROUTER_STOCK_IN_OUT} type={config.TYPE_STOCK_IN_OUT} />} />
        <Route path={config.ROUTER_STOCK_IN_OUT} render={(props) => <StockApplyPage {...props} key={config.ROUTER_STOCK_IN_OUT} type={config.TYPE_STOCK_IN_OUT} />} />
        <Route path="/repo_details" component={RepoDetailsPage} />
        <Route path="/repo" component={RepoPage} />
        <Route path="/inventory" component={InventoryPage} />
        <Route path="/user" component={UserPage} />
        <Route path="/role" component={RolePage} />
        <Route path="/userRole" component={UserRolePage} />
        <Route path="/rolePrivilege" component={RolePrivilegePage} />
        <Route component={HomePage} />
      </Switch>

    )
  }

  render() {
    const { classes, width } = this.props
    const { anchor, openDrawer } = this.state;

    // console.debug(this.props.width)
    // const defaultCloseDrawer = (width == 'xs' || width == 'sm');

    const drawer = (
      <div>
        <div className={classes.drawerHeader}>
          {/* <IconButton onClick={this.handleDrawerToggle}>
            <ChevronLeft />
          </IconButton> */}
        </div>
        <Divider />
        <List>{salesItems}</List>
        <Divider />
        <List>{userManagementItems}</List>
        <Divider />
        <List>{basicDataItems}</List>
        <Divider />
        <List>{manufactionItems}</List>
        <Divider />
        <List>{stockItems}</List>
      </div>
    );

    return (
      <BrowserRouter>
        {/* <div className={classes.root}> */}
        <div className={classes.appFrame}>
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton color="inherit" className={classes.navIconHide} aria-label="open drawer" onClick={this.handleDrawerToggle}>
                <MenuIcon />
              </IconButton>

              {this.renderRenderTitle(classes)}

              <IconButton color="inherit"><AccountCircle /></IconButton>
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
        {/* </div> */}
      </BrowserRouter >
    );
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
    justifyContent: 'flex-end',
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
export default compose(withStyles(styles, { withTheme: true }), withWidth())(App);
