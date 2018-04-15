// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withStyles } from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';

import { GroupWork } from '@material-ui/icons'
import { Menu as MenuIcon, AccountCircle, ChevronLeft, ChevronRight, Inbox, EmailOpen, Star, Send, Email, Delete, AlertOctagon, ClipboardAccount, ClipboardText, HexagonMultiple, FlagVariant } from 'mdi-material-ui';

import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';

import { HomePage } from "./home"
import ClientTypePage from "./client_type"
import MaterialTypePage from "./material_type"
import MaterialPage from "./material"
import ClientPage from "./client"
import OrderPage from "./order"
import ProductPage from "./product"

const mailFolderListItems = (<div>
  <Link to="/client">
    <ListItem button>
      <ListItemIcon>
        <ClipboardAccount />
      </ListItemIcon>
      <ListItemText primary="客户" />
    </ListItem>
  </Link>
  <Link to="/order">
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

const otherMailFolderListItems = (
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

const drawerWidth = 240;

class App extends Component<{ classes: any }, any> {
  state = {
    open: true,
    anchor: 'left',

    basicDataMenu: false,
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props
    const { anchor, open } = this.state;

    const drawer = (
      <Drawer
        variant="persistent"
        anchor={anchor}
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={this.handleDrawerClose}>
            <ChevronLeft />
          </IconButton>
        </div>
        <Divider />
        <List>{mailFolderListItems}</List>
        <Divider />
        <List>{otherMailFolderListItems}</List>
      </Drawer>
    );

    return (
      <BrowserRouter>
        <div className={classes.root}>
          <div className={classes.appFrame}>
            <AppBar className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
              [classes[`appBarShift-${anchor}`]]: open,
            })}>
              <Toolbar disableGutters={!open}>
                <IconButton color="inherit" className={classes.menuButton, open && classes.hide} aria-label="open drawer" onClick={this.handleDrawerOpen}>
            <MenuIcon />
          </IconButton>
              <Typography variant="title" color="inherit" noWrap className={classes.flex}>
                Wasted too much time to figure out a cool title
          </Typography>
              <IconButton color="inherit"><AccountCircle /></IconButton>
        </Toolbar>
      </AppBar>

          {drawer}

          <main
            className={classNames(classes.content, classes[`content-${anchor}`], {
              [classes.contentShift]: open,
              [classes[`contentShift-${anchor}`]]: open,
            })}
          >
            {/* <div className={classes.drawerHeader} /> */}

            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route path="/client" component={ClientPage} />
              <Route path="/order" component={OrderPage} />
              <Route path="/product" component={ProductPage} />
              <Route path="/basic_data/client_type" component={ClientTypePage} />
              <Route path="/basic_data/material_type" component={MaterialTypePage} />
              <Route path="/basic_data/material" component={MaterialPage} />
            </Switch>

          </main>
        </div>
              </div>
      </BrowserRouter >
    );
  }
}

const styles = theme => ({
  root: {
    flexGrow: 1,
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
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
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
    marginLeft: drawerWidth,
  },
  'appBarShift-right': {
    marginRight: drawerWidth,
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),

    marginTop: '64px',
    // overflowY: 'auto',
  },
  'content-left': {
    marginLeft: -drawerWidth,
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
    marginLeft: 0,
  },
  'contentShift-right': {
    marginRight: 0,
  },
});

App.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles, { withTheme: true })(App);
