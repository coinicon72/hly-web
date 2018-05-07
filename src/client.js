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
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';

//
import { AppBar, Toolbar, IconButton, Typography } from 'material-ui';
import {
    TableEditRow, TableEditColumn,
} from '@devexpress/dx-react-grid-material-ui';

import * as mdi from 'mdi-material-ui';
import * as mui from '@material-ui/icons';

//
import axios from 'axios'

//
import { LookupEditCell } from "./data_table_util";
import DataTableBase from "./data_table_base";

import { EXPORT_BASE_URL, API_BASE_URL } from "./config";


// =============================================
const DATA_REPO = "clients";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: "name", title: "简称" },
    { name: "fullName", title: "全称" },
    { name: 'type', title: '类型' },
    { name: 'contractNo', title: '合同编号' },
    { name: 'settlementPolicy', title: '结算政策' },
    { name: "address", title: "地址" },
    { name: "deliveryAddress", title: "发货地址" },
    { name: "postCode", title: "邮编" },
    { name: "contact", title: "联系人" },
    { name: "phone", title: "电话" },
    { name: "comment", title: "备注" },
    // { name: "metadata", title: ""},     
]

const EDITING_COLUMN_EXTENSIONS = [
    { columnName: 'id', editingEnabled: false },
]

const NEW_ROW_TEMPLATE = {
    id: 0,
    name: '',
    fullName: '',
    type: undefined, //this.state.availableValues.type[0].name,
    contractNo: '',
    settlementPolicy: '',
    address: '',
    deliveryAddress: '',
    postCode: '',
    contact: '',
    phone: '',
    comment: '',
    // metadata: '',
}


// =============================================
class ClientPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepoApiUrl = API_BASE_URL + DATA_REPO;

        this.state = {
            loaded: false,
            availableValues: {},
        }

        this.editingColumnExtensions = EDITING_COLUMN_EXTENSIONS;

        this.changeAddedRowsCallback = (row => {
            return Object.keys(row).length ? row : NEW_ROW_TEMPLATE
        });

        // this.commitChanges = this.commitChanges.bind(this);

        this.editCell = ((props) => {
            let availableColumnValues = this.state.availableValues[props.column.name];

            if (availableColumnValues) {
                availableColumnValues = availableColumnValues.map(r => r.name)
                return <LookupEditCell {...props} availableColumnValues={availableColumnValues} />;
            }
            return <TableEditRow.Cell {...props} />;
        }).bind(this);

        this.doLoad = this.doLoad.bind(this)
        this.doAdd = this.doAdd.bind(this)
        this.doUpdate = this.doUpdate.bind(this)
        this.doDelete = this.doDelete.bind(this)
    }

    componentDidMount() {
        let dataRepo = "clientTypes"
        axios.get(API_BASE_URL + dataRepo)
            .then(r => r.data._embedded[dataRepo])
            .then(j => this.setState({ availableValues: { 'type': j }, loaded: true }))
    }

    doLoad = () => {
        return axios.get(this.dataRepoApiUrl)
            .then(resp => resp.data._embedded[DATA_REPO])
            .then(rs => rs.map(r => { if (r.type) r.type = r.type.name; return r; }))
    }

    doAdd = (r) => {
        let v = this.state.availableValues['type'].find(v => v.name === r.type)
        if (v) r.type = v;

        return axios.post(this.dataRepoApiUrl, r)
            .then(resp => resp.data)
            .then(j => ({ ...j, type: r.type }))
    }

    doUpdate = (r, c) => {
        let v = this.state.availableValues['type'].find(v => v.name === c.type)
        if (v && c.type) c.type = "../clientTypes/" + v.id

        return axios.patch(this.dataRepoApiUrl + "/" + r['id'], c)
            .then(resp => resp.data)
            .then(j => ({ ...j, type: v && v.name ? v.name : undefined }))
    }

    doDelete = (r) => {
        return axios.delete(this.dataRepoApiUrl + "/" + r['id'])
    }

    render() {
        const { classes, width } = this.props

        return this.state.loaded ? (
            // <React.Fragment>

            <div className={classes.contentRoot}>

                <Toolbar className={classes.toolbar}>
                    {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton> */}
                    <Typography variant="title" className={classes.toolbarTitle}></Typography>
                    <Button href={`${EXPORT_BASE_URL}/clients`} color='primary' style={{ fontSize: 18 }} ><mdi.Export />导出</Button>
                    {/* <Button onClick={() => this.export()} color='primary' style={{ fontSize: 18 }} ><mdi.Printer />打印</Button> */}
                </Toolbar>

                <DataTableBase columns={COLUMNS}
                    editCell={this.editCell}
                    changeAddedRowsCallback={this.changeAddedRowsCallback}
                    // commitChanges={this.commitChanges}
                    editingColumnExtensions={this.editingColumnExtensions}
                    doLoad={this.doLoad}
                    doAdd={this.doAdd}
                    doUpdate={this.doUpdate}
                    doDelete={this.doDelete}
                />
            </div>
            // </React.Fragment>
        ) : <Typography color="inherit" noWrap variant="headline">Loading</Typography>
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ... {
    },
})


export default withStyles(styles)(ClientPage);