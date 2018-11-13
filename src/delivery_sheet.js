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
    DeliverySheetStatusProvider,
    TaxTypeProvider,
    // OrderStatusEditor, 
    OrderStatusProvider
} from './common_components'

import { connect } from 'react-redux'
import { actionShowSnackbar } from "./redux/data_selection"

// =============================================
const DATA_REPO = "deliverySheets";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: 'no', title: '发货单编号' },
    { name: 'deliveryDate', title: '发货时间', getCellValue: row => toDateString(row.deliveryDate) },
    { name: 'orderNo', title: '订单编号', getCellValue: row => row.order ? row.order.no : null },
    { name: 'status', title: '状态' },
    { name: 'clientId', title: '客户', getCellValue: row => row.order && row.order.client ? row.order.client.name : null },
    // { name: 'orderDate', title: '下单时间', getCellValue: row => toDateString(row.orderDate) },
    // { name: 'value', title: '总额' },
    // { name: 'tax', title: '是否含税' }, //getCellValue: row => row.tax ? '是' : '否' },
    // { name: 'comment', title: '备注' },
    // { name: 'actual_value', title: '' },
    // { name: 'metadata', title: '' },
]

// const EDITING_COLUMN_EXTENSIONS = [
//     { columnName: 'id', editingEnabled: false },
// ]

// const NEW_ROW_TEMPLATE = {
//     id: 0,
//     actualValue: 0,
//     comment: '',
//     deliveryDate: '',
//     metadata: '',
//     no: '',
//     orderDate: '',
//     tax: true,
//     value: 0,
//     clientId: 0,
// }

class DeliverySheetPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            order: null,
        }

        this.dataRepoApiUrl = `${DATA_API_BASE_URL}/${DATA_REPO}`;

        // this.editingColumnExtensions = EDITING_COLUMN_EXTENSIONS;

        // this.changeAddedRowsCallback = (row => {
        //     return Object.keys(row).length ? row : NEW_ROW_TEMPLATE
        // });

        this.onRowDoubleClicked = this.onRowDoubleClicked.bind(this)
        this.addRowHandler = _ => {
            if (this.props.match.params.oid)
                this.props.history.push(`/delivery_sheet_details/add/${this.props.match.params.oid}`);
        }

        this.doLoad = this.doLoad.bind(this)
        this.doAdd = this.doAdd.bind(this)
        this.doUpdate = this.doUpdate.bind(this)
        this.doDelete = this.doDelete.bind(this)
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
            this.props.history.push('/delivery_sheet_details/edit/' + row.id);
    }

    doLoad = () => {
        const { oid } = this.props.match.params

        let url = `${API_BASE_URL}/deliverySheet`
        if (oid)
            url = `${API_BASE_URL}/order/${oid}/deliverySheet`

        return axios.get(url)//,
            .then(resp => resp.data)
        // .then(ds => ds.filter(s => s.status < 2))
        // {
        //     let sheets = resp.data._embedded[DATA_REPO]

        //     sheets.flatMap(s => s._links.order)
        //         .
        // })
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
        if (r.status === 0)
            return axios.delete(this.dataRepoApiUrl + "/" + r['id'])
        else {
            this.props.showSnackbar("不能删除已提交/已处理的发货单")
            return null
        }
    }

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
                    doAdd={this.doAdd}
                    doUpdate={this.doUpdate}
                    doDelete={this.doDelete}
                    clickHandler={this.onRowDoubleClicked}
                    showAddCommand={!!oid}
                    showEditCommand={false}
                    // showDeleteCommand={false}
                    addHandler={this.addRowHandler}
                    providers={[
                        <DeliverySheetStatusProvider for={['status']} />,
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


const mapDispatchToProps = dispatch => ({
    showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
})

const ConnectedPage = connect(
    null,
    mapDispatchToProps
)(DeliverySheetPage)


export default withStyles(styles)(ConnectedPage);