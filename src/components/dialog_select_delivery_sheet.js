// @flow

// basic
// import React from 'react';

// styles
import { withStyles } from '@material-ui/core';
import CommonStyles from "../common_styles";

import { 
    // toFixedMoney, getTodayDateTimeString, 
    toDateString } from "../utils"

import DialogCommonSelection from './dialog_common_selection'


const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: 'no', title: '发货单编号' },
    { name: 'deliveryDate', title: '发货时间', getCellValue: row => toDateString(row.deliveryDate) },
    { name: 'committedDate', title: '提交时间', getCellValue: row => toDateString(row.deliveryDate) },
    { name: 'orderNo', title: '订单编号', getCellValue: row => row.order ? row.order.no : null },
    { name: 'clientId', title: '客户', getCellValue: row => row.order && row.order.client ? row.order.client.name : null },
];


class DialogSelection extends DialogCommonSelection {
    constructor(props) {
        super(props);

        this.multiple = false;
        this.columns = COLUMNS;
    }
}

export default withStyles(CommonStyles)(DialogSelection);