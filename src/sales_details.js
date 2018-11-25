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
import { Export, ArrowLeft } from 'mdi-material-ui';
// import * as mui from '@material-ui/icons';

// ui
import {
    // Paper, 
    Typography,
    // Grid, TextField, 
    Button,
    IconButton, //Snackbar, 
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
import { toDateString, toFixedMoney } from "./utils"
import {
    // TaxTypeEditor, 
    TaxTypeProvider,
    // OrderStatusEditor, 
    OrderStatusProvider
} from './common_components'


// =============================================
// const DATA_REPO = "orders";

const COLUMNS = [
    // { name: 'id', title: '序号', getCellValue: row => `${row.id.repoChanging}-${row.id.material}` },
    { name: 'orderDate', title: '订单日期', getCellValue: row => row.repoChanging.order.orderDate },
    { name: 'orderNo', title: '订单编号', getCellValue: row => row.repoChanging.order.no },
    { name: 'clientId', title: '客户', getCellValue: row => row.repoChanging.order.client ? row.repoChanging.order.client.name : null },
    { name: 'deliveryDate', title: '发货日期', getCellValue: row => toDateString(row.repoChanging.order.deliveryDate) },
    { name: 'deliveryNo', title: '发货单编号', getCellValue: row => row.repoChanging.deliverySheet ? row.repoChanging.deliverySheet.no : null },
    { name: 'repo', title: '发出仓库', getCellValue: row => row.repoChanging.repo.name },
    { name: 'productCode', title: '产品名称', getCellValue: row => row.material.name },
    { name: 'type', title: '类型', getCellValue: row => row.material.type.name },
    { name: 'spec', title: '规格', getCellValue: row => row.material.spec },
    // { name: 'unit', title: '单位', },
    { name: 'quantity', title: '数量' },
    { name: 'price', title: '单价', getCellValue: row => `¥ ${toFixedMoney(row.price)}` },
    { name: 'total', title: '总价', getCellValue: row => `¥ ${toFixedMoney(row.quantity * row.price)}` },
    { name: 'tax', title: '是否含税', getCellValue: row => row.repoChanging.order.tax }, //getCellValue: row => row.tax ? '是' : '否' },
    { name: 'actualTotal', title: '不含税总价', getCellValue: row => `¥ ${toFixedMoney(row.repoChanging.order.tax ? row.quantity * row.price / 1.16 : row.quantity * row.price)}` },
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

class SaleDetailsPage extends React.PureComponent {
    constructor(props) {
        super(props);

        // this.state = {
        //     orders: [],

        //     //
        //     snackbarOpen: false,
        //     snackbarContent: "",
        // }

        this.dataRepoApiUrl = `${API_BASE_URL}/salesDetails`;

        // this.editingColumnExtensions = EDITING_COLUMN_EXTENSIONS;

        // this.changeAddedRowsCallback = (row => {
        //     return Object.keys(row).length ? row : NEW_ROW_TEMPLATE
        // });

        this.onRowDoubleClicked = this.onRowDoubleClicked.bind(this)
        // this.addRowHandler = () => this.props.history.push('/order');

        this.doLoad = this.doLoad.bind(this)
        // this.doAdd = this.doAdd.bind(this)
        // this.doUpdate = this.doUpdate.bind(this)
        // this.doDelete = this.doDelete.bind(this)
    }

    componentDidMount() {
    }

    onRowDoubleClicked = (row) => {
        // if (row)
        //     this.props.history.push('/order/' + row.id);
    }

    doLoad = () => {
        return axios.get(this.dataRepoApiUrl)//,
            .then(resp => resp.data)
            .then(d => {
                let orders = {};

                d.map(i => i.repoChanging.order)
                    .filter(o => typeof (o) === 'object')
                    .forEach(o => orders[o.id] = o)
                    ;

                d.filter(i => typeof (i.repoChanging.order) !== 'object')
                    .forEach(i => i.repoChanging.order = orders[i.repoChanging.order]);

                d.forEach(i => i.key = `${i.id.repoChanging}-${i.id.material}`)
                return d;
            })
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
        const { classes, } = this.props
        // const { snackbarOpen, snackbarContent } = this.state;

        return (
            // <React.Fragment>
            <div className={classes.contentRoot}>
                {/* <Typography variant="title" color="inherit" className={classes.subTitle} >双击产品可以查看详情</Typography> */}

                <Toolbar className={classes.toolbar}>
                    <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                    <Typography variant="title" className={classes.toolbarTitle}>销售明细</Typography>
                    {/* <Button href={`${EXPORT_BASE_URL}/orders`} color='primary' style={{ fontSize: 18 }} ><Export />导出</Button> */}
                    {/* <Button onClick={() => this.export()} color='primary' style={{ fontSize: 18 }} ><Printer />打印</Button> */}
                </Toolbar>

                <DataTableBase columns={COLUMNS}
                    // editCell={this.editCell}
                    // changeAddedRowsCallback={this.changeAddedRowsCallback}
                    // editingColumnExtensions={this.editingColumnExtensions}
                    disableEdit={true}
                    doLoad={this.doLoad}
                    // doAdd={this.doAdd}
                    // doUpdate={this.doUpdate}
                    // doDelete={this.doDelete}
                    // clickHandler={this.onRowDoubleClicked}
                    showEditCommand={false}
                    showDeleteCommand={false}
                    // addHandler={this.addRowHandler}
                    providers={[
                        <TaxTypeProvider key='TaxTypeProvider' for={['tax']} />,
                        <OrderStatusProvider key='OrderStatusProvider' for={['status']} />,
                    ]}
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


export default withStyles(styles)(SaleDetailsPage);