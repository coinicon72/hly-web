// @flow

// basic
import React from 'react';

// styles
import { withStyles } from '@material-ui/core';

import CommonStyles from "./common_styles";

// icons
import { Export, ArrowLeft } from 'mdi-material-ui';

// ui
import {
    Typography,
    Button,
    IconButton, //Snackbar, 
    Toolbar,
} from '@material-ui/core';

//
import axios from 'axios'

//
import DataTableBase from "./data_table_base"

import { EXPORT_BASE_URL, API_BASE_URL, DATA_API_BASE_URL } from "./config"
import { toDateString, toFixedMoney } from "./utils"
import {
    TaxTypeProvider,
    OrderStatusProvider
} from './common_components'


// =============================================
// const DATA_REPO = "orders";

const COLUMNS = [
    // { name: 'id', title: '序号', getCellValue: row => `${row.id.repoChanging}-${row.id.material}` },
    { name: 'orderDate', title: '订单日期', getCellValue: row => row.order.orderDate },
    { name: 'orderNo', title: '订单编号', getCellValue: row => row.order.no },
    { name: 'clientId', title: '客户', getCellValue: row => row.order.client ? row.order.client.name : null },
    { name: 'deliveryDate', title: '发货日期', getCellValue: row => row.deliverySheet ? toDateString(row.deliverySheet.deliveryOn) : null },
    { name: 'deliveryNo', title: '发货单编号', getCellValue: row => row.deliverySheet ? row.deliverySheet.no : null },
    { name: 'repo', title: '发出仓库', getCellValue: row => row.deliverySheet && row.deliverySheet.repoChanging && row.deliverySheet.repoChanging.repo ? row.deliverySheet.repoChanging.repo.name : null },
    { name: 'productCode', title: '产品名称', getCellValue: row => row.item.product ? row.item.product.code : null },
    { name: 'type', title: '类型', getCellValue: row => row.item.product ? row.item.product.material.type.name : null },
    { name: 'spec', title: '规格', getCellValue: row => row.item.product ? row.item.product.material.spec : null },
    // { name: 'unit', title: '单位', },
    { name: 'quantity', title: '数量', getCellValue: row => row.deliveryItem ? row.deliveryItem.quantity : row.item.quantity },
    { name: 'price', title: '单价', getCellValue: row => `¥ ${toFixedMoney(row.item.price)}` },
    { name: 'total', title: '总价', getCellValue: row => row.deliveryItem ? `¥ ${toFixedMoney(row.deliveryItem.quantity * row.item.price)}` : `¥ ${toFixedMoney(row.item.quantity * row.item.price)}`},
    { name: 'tax', title: '是否含税', getCellValue: row => row.order.tax }, //getCellValue: row => row.tax ? '是' : '否' },
    { name: 'actualTotal', title: '不含税总价', getCellValue: row => row.deliveryItem ? `¥ ${toFixedMoney(row.order.tax ? row.deliveryItem.quantity * row.item.price / 1.16 : row.deliveryItem.quantity * row.item.price)}` : `¥ ${toFixedMoney(row.order.tax ? row.item.quantity * row.item.price / 1.16 : row.item.quantity * row.item.price)}` },
]


class SaleDetailsPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.clients = {};
        this.products = {};

        this.details = [];

        this.dataRepoApiUrl = `${API_BASE_URL}/orders`;

        this.doLoad = this.doLoad.bind(this)
    }

    doLoad = () => {
        return axios.get(this.dataRepoApiUrl)//,
            .then(resp => resp.data)
            .then(orders => {
                orders.map(o => o.client)
                    .filter(c => typeof (c) === 'object')
                    .forEach(c => {
                        if (!this.clients[c.id])
                            this.clients[c.id] = c;
                    });

                orders.flatMap(o => o.items)
                    .map(i => i.product)
                    .filter(p => typeof (p) === 'object')
                    .forEach(p => {
                        if (!this.products[p.id])
                            this.products[p.id] = p;
                    });

                orders.forEach(order => {
                    if (typeof (order.client) !== 'object')
                        order.client = this.clients[order.client];

                    if (order.deliverySheets.length > 0) {
                        order.deliverySheets.forEach(deliverySheet => {
                            // if (deliverySheet.items.length > 0) {
                            deliverySheet.items.forEach(p => {
                                const item = order.items.find(i => i.id.product === p.orderItem.id.product);
                                const product = this.products[p.orderItem.product];
                                this.details.push({ order, deliverySheet, item, product, deliveryItem: p });
                            })
                            // } else
                            //     this.details.push({ order, deliverySheet });
                        })
                    } else {
                        order.items.forEach(item => this.details.push({ order, item }));
                    }
                })
                // d.map(i => i.repoChanging.order)
                //     .filter(o => typeof (o) === 'object')
                //     .forEach(o => orders[o.id] = o)
                //     ;

                // d.filter(i => typeof (i.repoChanging.order) !== 'object')
                //     .forEach(i => i.repoChanging.order = orders[i.repoChanging.order]);

                // d.forEach(i => i.key = `${i.id.repoChanging}-${i.id.material}`)
                // return d;
                return this.details;
            })
    }

    render() {
        const { classes, } = this.props

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
                    disableEdit={true}
                    doLoad={this.doLoad}
                    showEditCommand={false}
                    showDeleteCommand={false}
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