// @flow

// basic
import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';
// import compose from 'recompose/compose';

// styles
import { withStyles } from '@material-ui/core';

import CommonStyles from "./common_styles";

// router
// import { withRouter } from 'react-router'
// import { Link } from 'react-router-dom'

// icons
import { ArrowLeft } from 'mdi-material-ui';
// import * as mui from '@material-ui/icons';

// ui
import {
    // Paper, 
    Typography,
    // Grid, TextField, 
    // Button,
    IconButton,
    // Snackbar, 
    // Input, Select, 
    Toolbar,
    // Divider, Tooltip,
    // Table, 
    // TableBody, 
    // TableCell, TableHead, TableRow
} from '@material-ui/core';

// import { DataTypeProvider } from '@devexpress/dx-react-grid';

//
import axios from 'axios'

//
import DataTableBase from "./data_table_base"

import { EXPORT_BASE_URL, API_BASE_URL, DATA_API_BASE_URL } from "./config"
import { toDateString } from "./utils"
import {
    // TaxTypeEditor, 
    // DeliverySheetStatusProvider,
    TaxTypeProvider,
    // OrderStatusEditor, 
    // OrderStatusProvider 
} from './common_components'


// =============================================
const DATA_REPO = "deliverySheets/search/findByStatus?status=1";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: 'no', title: '发货单编号' },
    { name: 'deliveryDate', title: '发货时间', getCellValue: row => toDateString(row.deliveryDate) },
    { name: 'committedDate', title: '提交时间', getCellValue: row => toDateString(row.deliveryDate) },
    { name: 'orderNo', title: '订单编号', getCellValue: row => row.order ? row.order.no : null },
    { name: 'clientId', title: '客户', getCellValue: row => row.order && row.order.client ? row.order.client.name : null },
]

class CommittedDeliverySheetPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            order: null,
        }

        // this.dataRepoApiUrl = `${DATA_API_BASE_URL}/${DATA_REPO}`;

        this.onRowDoubleClicked = this.onRowDoubleClicked.bind(this)
        // this.addRowHandler = _ => {
        //     if (this.props.match.params.oid)
        //         this.props.history.push(`/delivery_sheet_details/add/${this.props.match.params.oid}`);
        // }

        this.doLoad = this.doLoad.bind(this)
        // this.doAdd = this.doAdd.bind(this)
        // this.doUpdate = this.doUpdate.bind(this)
        // this.doDelete = this.doDelete.bind(this)
    }

    componentDidMount() {
        const { oid } = this.props.match.params

        if (oid) {
            axios.get(`${DATA_API_BASE_URL}/orders/${oid}`)
                .then(resp => resp.data)
                .then(order => {
                    this.setState({ order });
                })
                .catch(e => this.props.showSnackbar(e.message));
        }
    }

    onRowDoubleClicked = (row) => {
        if (row)
            this.props.history.push('/committed_delivery_sheet_details/edit/' + row.id);
    }

    doLoad = () => {
        // const { oid } = this.props.match.params

        let url = `${API_BASE_URL}/deliverySheet/committed`
        // if (oid)
        //     url = `${API_BASE_URL}/order/${oid}/deliverySheet`

        return axios.get(url)//,
            .then(resp => resp.data)

        // let url = this.dataRepoApiUrl

        // return axios.get(url)//,
        //     .then(resp => resp.data._embedded.deliverySheets)
        // {
        //     let sheets = resp.data._embedded[DATA_REPO]

        //     sheets.flatMap(s => s._links.order)
        //         .
        // })
    }

    // doAdd = (r) => {
    //     return axios.post(this.dataRepoApiUrl, r)
    //         .then(resp => resp.data)
    // }

    // doUpdate = (r, c) => {
    //     return axios.patch(this.dataRepoApiUrl + "/" + r['id'], c)
    //         .then(resp => resp.data)
    // }

    // doDelete = (r) => {
    //     return axios.delete(this.dataRepoApiUrl + "/" + r['id'])
    // }

    // showSnackbar(msg: String) {
    //     this.setState({ snackbarOpen: true, snackbarContent: msg });
    // }

    render() {
        const { oid, } = this.props.match.params
        const { classes, } = this.props
        const { order } = this.state;

        return (
            // <React.Fragment>
            <div className={classes.contentRoot}>
                {/* <Typography variant="title" color="inherit" className={classes.subTitle} >双击产品可以查看详情</Typography> */}

                <Toolbar className={classes.toolbar}>
                    <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                    <Typography variant="title" className={classes.toolbarTitle}>{(oid && order) ? `订单 ${order.no} 的发货单` : `全部发货单`}</Typography>
                    {/* <Button href={`${EXPORT_BASE_URL}/orders`} color='primary' style={{ fontSize: 18 }} ><Export />导出</Button> */}
                    {/* <Button onClick={() => this.export()} color='primary' style={{ fontSize: 18 }} ><Printer />打印</Button> */}
                </Toolbar>

                <DataTableBase columns={COLUMNS}
                    editCell={this.editCell}
                    // changeAddedRowsCallback={this.changeAddedRowsCallback}
                    // editingColumnExtensions={this.editingColumnExtensions}
                    doLoad={this.doLoad}
                    // doAdd={this.doAdd}
                    // doUpdate={this.doUpdate}
                    // doDelete={this.doDelete}
                    clickHandler={this.onRowDoubleClicked}
                    disableEdit={true}
                    showAddCommand={!!oid}
                    showEditCommand={false}
                    // showDeleteCommand={false}
                    addHandler={this.addRowHandler}
                    providers={[
                        <TaxTypeProvider for={['tax']} />,
                    ]}
                // editHandler={this.editRowHandler}
                />
            </div>

            // </React.Fragment>
        )
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ...{
    },
})


export default withStyles(styles)(CommittedDeliverySheetPage);