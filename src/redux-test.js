// @flow

import React from 'react';

import store from './redux'
import connect from 'react-redux/lib/connect/connect';


function actionClickTitle() {
  return {
    type: 'clickTitle',
  }
}


class Toolbar extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const {title, onClickTitle} = this.props

    return <div className="header" style={{flex: 1}} onClick={onClickTitle}>{title}</div>
  }
}

// let Toolbar = ({title, onClickTitle}) => 
//   <div className="header" style={{flex: 1}} onClick={onClickTitle}>{title}</div>

function mapStateToToolbarProps(state) {
  return {title: state.main.toolbarTitle}
}

function mapDispatchToToolbarProps(dispatch) {
  return {
    onClickTitle: () => dispatch(actionClickTitle())
  }
}

Toolbar = connect(mapStateToToolbarProps, mapDispatchToToolbarProps)(Toolbar)


let SideMenu = () => {
  return <div className='nav' style={{flex: 1}}></div>
}


let MainContent = () => {
  return <div className='main' style={{flex: 1}}></div>
}


let Footbar = () => {
  return <div className='footer' style={{flex: 1}}></div>
}

export default (props) => {
  return (<div style={{display: 'flex', flex: 1, justifyContent: 'stretch'}}>
  <Toolbar/>
  <SideMenu />
  <MainContent />
  <Footbar />
  </div>)
}
