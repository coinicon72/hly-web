// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

// import Loadable from 'react-loadable';
// import Loading from './loading-component';

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
    withStyles, Select, Input
} from '@material-ui/core';

import { DataTypeProvider } from '@devexpress/dx-react-grid';

//
import axios from 'axios'

//
import { connect } from 'react-redux'

import { actionShowSnackbar } from "./redux/data_selection"

//
import { API_BASE_URL, DATA_API_BASE_URL } from "./config"

import CommonStyles from "./common_styles"

// import { CurrencyTypeProvider } from "./common_components"

import DataTableBase from "./data_table_base"
import { toDateString, toFixedMoney } from './utils'
import { TaxTypeEditor, TaxTypeProvider } from './common_components'


// =============================================
// const DATA_REPO = "purchasingOrders";

// const DETAIL_PAGE_URL = "/purchasingDetails";

const COLUMNS = [
    // { name: 'id', title: '序号', getCellValue: row => `${row.id.repoChanging}-${row.id.material}` },
    { name: "date", title: "采购日期", getCellValue: row => row.order.date },
    { name: "orderNo", title: "采购单号", getCellValue: row => row.order.no },
    { name: "executeDate", title: "入库日期", getCellValue: row => row.order.repoChanging ? row.order.repoChanging.executeDate : null },
    { name: "repoNo", title: "入库编号", getCellValue: row => row.order.repoChanging ? row.order.repoChanging.no : null },
    { name: "repo", title: "仓库", getCellValue: row => row.order.repoChanging ? row.order.repoChanging.repo.name : null },
    { name: "supplier", title: "供应商", getCellValue: row => row.order.supplier.name },
    { name: 'productCode', title: '产品名称', getCellValue: row => row.item.material.name },
    { name: 'type', title: '类型', getCellValue: row => row.item.material.type.name },
    { name: 'spec', title: '规格', getCellValue: row => row.item.material.spec },
    // { name: 'unit', title: '单位', },
    { name: 'quantity', title: '数量', getCellValue: row => row.item.quantity },
    { name: 'price', title: '单价', getCellValue: row => `¥ ${toFixedMoney(row.item.vip)}` },
    { name: 'total', title: '总价', getCellValue: row => `¥ ${toFixedMoney(row.item.quantity * row.item.vip)}` },
    { name: 'tax', title: '是否含税', getCellValue: row => row.order.tax }, //getCellValue: row => row.tax ? '是' : '否' },
    { name: 'actualTotal', title: '不含税总价', getCellValue: row => `¥ ${toFixedMoney(row.order.tax ? row.item.quantity * row.item.vip / (1 + row.order.vat) : row.item.quantity * row.item.vip)}` },
]


// =============================================
class PurchasingOrderPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.suppliers = {};
        this.materials = {};

        this.details = [];

        //
        this.dataRepoApiUrl = `${API_BASE_URL}/purchasingOrders`;

        //
        this.doLoad = this.doLoad.bind(this)
    }

    componentDidMount() {
        // this.updateDataFilter();
    }

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     if (!prevProps.user && this.props.user) {
    //         this.updateDataFilter();
    //     }
    // }

    doLoad = () => {
        return axios.get(this.dataRepoApiUrl)//,
            .then(resp => resp.data)
            .then(orders => {
                orders.map(o => o.supplier)
                    .filter(c => typeof (c) === 'object')
                    .forEach(c => {
                        if (!this.suppliers[c.id])
                            this.suppliers[c.id] = c;
                    });

                orders.forEach(order => {
                    if (typeof (order.supplier) !== 'object')
                        order.supplier = this.suppliers[order.supplier];

                    order.items.forEach(item => {
                        this.details.push({ order, item });
                    })
                })

                return this.details;
            });
    }

    // doAdd = (r) => {
    //     return axios.post(this.state.dataRepoApiUrl, r)
    //         .then(resp => resp.data)
    // }

    // doUpdate = (r, c) => {
    //     return axios.patch(this.state.dataRepoApiUrl + "/" + r['id'], c)
    //         .then(resp => resp.data)
    // }

    // doDelete = (r) => {
    //     return axios.delete(this.state.dataRepoApiUrl + "/" + r['id'])
    // }

    // onRowDoubleClicked = (row) => {
    //     if (row) {
    //             this.props.history.push(`${DETAIL_PAGE_URL}/${row.id}`);
    //     }
    // }

    render() {
        const { classes, } = this.props

        return (
            <div className={classes.contentRoot}>
                <Toolbar className={classes.toolbar}>
                    <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                    <Typography variant="title" className={classes.toolbarTitle}>采购明细</Typography>
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
                        // <OrderStatusProvider key='OrderStatusProvider' for={['status']} />,
                    ]}
                />
            </div>
        )
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ...{
    },
})

// const mapStateToProps = state => ({
//     token: state.main.token,
//     user: state.main.user,
// })

const mapDispatchToProps = dispatch => ({
    //
    showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
})

const ConnectedComponent = connect(
    // mapStateToProps,
    null,
    mapDispatchToProps
)(PurchasingOrderPage)


export default withStyles(styles)(ConnectedComponent);