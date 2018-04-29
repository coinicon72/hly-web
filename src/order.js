// @flow

// basic
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

// styles
import { withStyles } from 'material-ui';

import CommonStyles from "./common_styles";

// router
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

// icons
import * as mdi from 'mdi-material-ui';
import * as mui from '@material-ui/icons';

// ui
import { Paper, Typography, Grid, TextField, Button, IconButton, Snackbar, Input, Select, Toolbar, Divider, Tooltip } from 'material-ui';

import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

//
import axios from 'axios'

import DataTableBase from "./data_table_base"

import { API_BASE_URL } from "./config"
import { store } from "./redux"

// =============================================
const DATA_REPO = "orders";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: 'no', title: '订单编号' },
    { name: 'clientId', title: '客户', getCellValue: row => (row._embedded && row._embedded.client) ? row._embedded.client.name : null},
    { name: 'orderDate', title: '下单时间', getCellValue: row => row.orderDate.split("T")[0] },
    { name: 'deliveryDate', title: '发货时间', getCellValue: row => row.deliveryDate.split("T")[0] },
    { name: 'value', title: '总额' },
    { name: 'tax', title: '是否含税', getCellValue: row => row.tax ? '是' : '否' },
    { name: 'comment', title: '备注' },
    // { name: 'actual_value', title: '' },
    // { name: 'metadata', title: '' },
]

const EDITING_COLUMN_EXTENSIONS = [
    { columnName: 'id', editingEnabled: false },
]

const NEW_ROW_TEMPLATE = {
    id: 0,           
    actualValue: 0, 
    comment: '',      
    deliveryDate: '',
    metadata: '',     
    no: '',           
    orderDate: '',   
    tax: true,          
    value: 0,        
    clientId: 0,    
}

class OrderPage extends React.PureComponent {
    constructor(props) {
        super(props);

        // this.state = {
        //     orders: [],
            
        //     //
        //     snackbarOpen: false,
        //     snackbarContent: "",
        // }
  
        this.dataRepoApiUrl = API_BASE_URL + DATA_REPO;

        this.editingColumnExtensions = EDITING_COLUMN_EXTENSIONS;

        this.changeAddedRowsCallback = (row => {
            return Object.keys(row).length ? row : NEW_ROW_TEMPLATE
        });

        this.onRowDoubleClicked = this.onRowDoubleClicked.bind(this)
        this.addRowHandler = () => this.props.history.push('/order/0');

        this.doLoad = this.doLoad.bind(this)
        this.doAdd = this.doAdd.bind(this)
        this.doUpdate = this.doUpdate.bind(this)
        this.doDelete = this.doDelete.bind(this)
  }

    componentDidMount() {
        // axios.get(`${API_BASE_URL}/${DATA_REPO}`)
        //     .then(resp => resp.data._embedded[DATA_REPO])
        //     .then(j => {
        //         this.setState({ orders: j });
        //     })
        //     .catch(e => this.showSnackbar(e.message));
    }

    onRowDoubleClicked = (row) => {
        if (row)
            this.props.history.push('/order/' + row.id);
    }

    doLoad = () => {
        return axios.get(this.dataRepoApiUrl)//,
            .then(resp => resp.data._embedded[DATA_REPO])
    }

    doAdd = (r) => {
        return axios.post(this.dataRepoApiUrl, r)
            .then(resp => resp.data)
    }

    doUpdate = (r, c) => {
        return axios.patch(this.dataRepoApiUrl + "/" + r['id'], c)
            .then(resp => resp.data)
    }

    doDelete = (r) => {
        return axios.delete(this.dataRepoApiUrl + "/" + r['id'])
    }

    // showSnackbar(msg: String) {
    //     this.setState({ snackbarOpen: true, snackbarContent: msg });
    // }

    render() {
        const { classes, width } = this.props
        // const { snackbarOpen, snackbarContent } = this.state;

        return (
            <React.Fragment>
                <div className={classes.contentRoot}>
                    {/* <Typography variant="title" color="inherit" className={classes.subTitle} >双击产品可以查看详情</Typography> */}

                    <DataTableBase columns={COLUMNS}
                        editCell={this.editCell}
                        changeAddedRowsCallback={this.changeAddedRowsCallback}
                        editingColumnExtensions={this.editingColumnExtensions}
                        doLoad={this.doLoad}
                        doAdd={this.doAdd}
                        doUpdate={this.doUpdate}
                        doDelete={this.doDelete}
                        clickHandler={this.onRowDoubleClicked}
                        showEditCommand={false}
                        showDeleteCommand={false}
                        addHandler={this.addRowHandler}
                        // editHandler={this.editRowHandler}
                    />
                </div>

            </React.Fragment>
        )
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ... {
    },
})


export default withStyles(styles)(OrderPage);