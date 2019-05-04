// @flow

// basic
// import React from 'react';
import equal from 'fast-deep-equal';

// styles
import { withStyles } from '@material-ui/core';
import CommonStyles from "../common_styles";

import { 
    // toFixedMoney, getTodayDateTimeString, 
    toDateString } from "../utils"

import DialogCommonSelection from './dialog_common_selection'


const COLUMNS = [
    { name: 'clientId', title: '客户', getCellValue: row => row.orderItem && row.orderItem.order && row.orderItem.order._embedded.client ? row.orderItem.order._embedded.client.name : null },
    { name: 'orderNo', title: '订单编号', getCellValue: row => row.orderItem && row.orderItem.order ? row.orderItem.order.no : null },
    { name: 'deliveryDate', title: '产品编号', getCellValue: row => row.orderItem && row.orderItem.product ? row.orderItem.product.code : null },
    { name: 'committedDate', title: '数量', getCellValue: row => row.orderItem && row.orderItem.quantity ? row.orderItem.quantity : null },
];


class DialogSelectBom extends DialogCommonSelection {
    constructor(props) {
        super(props);

        this.multiple = false;
        this.columns = COLUMNS;
    }

    // shouldComponentUpdate(nextProps){
    //     return !equal(nextProps, this.props);
    // }
}

export default withStyles(CommonStyles)(DialogSelectBom);