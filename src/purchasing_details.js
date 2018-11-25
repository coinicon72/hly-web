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
    { name: "date", title: "采购日期", getCellValue: row => row.repoChanging.purchasingOrder ? row.repoChanging.purchasingOrder.date : null },
    { name: "orderNo", title: "采购单号", getCellValue: row => row.repoChanging.purchasingOrder ? row.repoChanging.purchasingOrder.no : null },
    { name: "executeDate", title: "入库日期", getCellValue: row => row.repoChanging.executeDate },
    { name: "repoNo", title: "入库编号", getCellValue: row => row.repoChanging.no },
    { name: "repo", title: "仓库", getCellValue: row => row.repoChanging.repo.name },
    { name: "supplier", title: "供应商", getCellValue: row => row.repoChanging.purchasingOrder ? row.repoChanging.purchasingOrder.supplier.name : null },
    { name: 'productCode', title: '产品名称', getCellValue: row => row.material.name },
    { name: 'type', title: '类型', getCellValue: row => row.material.type.name },
    { name: 'spec', title: '规格', getCellValue: row => row.material.spec },
    // { name: 'unit', title: '单位', },
    { name: 'quantity', title: '数量' },
    { name: 'price', title: '单价', getCellValue: row => `¥ ${toFixedMoney(row.price)}` },
    { name: 'total', title: '总价', getCellValue: row => `¥ ${toFixedMoney(row.quantity * row.price)}` },
    { name: 'tax', title: '是否含税', getCellValue: row => row.repoChanging.purchasingOrder ? row.repoChanging.purchasingOrder.tax : null }, //getCellValue: row => row.tax ? '是' : '否' },
    { name: 'actualTotal', title: '不含税总价', getCellValue: row => `¥ ${toFixedMoney(row.repoChanging.purchasingOrder && row.repoChanging.purchasingOrder.tax ? row.quantity * row.price / 1.16 : row.quantity * row.price)}` },
]


// =============================================
class PurchasingOrderPage extends React.PureComponent {
    constructor(props) {
        super(props);

        // this.state = {
        //     // dataFilter: "",
        //     // dataRepoApiUrl: "",
        //     columns: [],

        //     dataRepoApiUrl: `${API_BASE_URL}/purchasingDetails`,
        //     // ready4UI: false,
        // }

        this.dataRepoApiUrl = `${API_BASE_URL}/purchasingDetails`;

        // this.editingColumnExtensions = EDITING_COLUMN_EXTENSIONS;

        // this.changeAddedRowsCallback = (row => {
        //     return Object.keys(row).length ? row : NEW_ROW_TEMPLATE
        // });

        this.doLoad = this.doLoad.bind(this)
        // this.doAdd = this.doAdd.bind(this)
        // this.doUpdate = this.doUpdate.bind(this)
        // this.doDelete = this.doDelete.bind(this)

        // this.addRowHandler = () => this.props.history.push(DETAIL_PAGE_URL);
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
            .then(d => {
                let changings = {};
                let orders = {};

                d.map(i => i.repoChanging)
                    .filter(o => o !== null && typeof (o) === 'object')
                    .forEach(o => changings[o.id] = o)
                    ;

                d.filter(i => typeof (i.repoChanging) !== 'object')
                    .forEach(i => i.repoChanging = changings[i.repoChanging]);

                d.map(i => i.repoChanging.order)
                    .filter(o => o !== null && typeof (o) === 'object')
                    .forEach(o => orders[o.id] = o)
                    ;

                d.filter(i => typeof (i.repoChanging.purchasingOrder) !== 'object')
                    .forEach(i => i.repoChanging.purchasingOrder = orders[i.repoChanging.purchasingOrder]);

                d.forEach(i => i.key = `${i.id.repoChanging}-${i.id.material}`)
                return d;
            })
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