// @flow

// basic
// import React from 'react';

// // styles
import { withStyles } from '@material-ui/core';
import CommonStyles from "../common_styles";

import DialogCommonSelection from './dialog_common_selection'

import { 
    // toFixedMoney, getTodayDateTimeString, 
    toDateString } from "../utils"


const COLUMNS =[
    { name: 'id', title: '序号' },
    { name: 'no', title: '订单号码' },
    { name: "tax", title: "含税", getCellValue: row => row.tax ? '含税' : null },
    { name: "date", title: "签订日期", getCellValue: row => row.date ? toDateString(row.date) : null },
    { name: "supplier", title: "供应商", getCellValue: row => row._embedded && row._embedded.supplier ? row._embedded.supplier.name : null },
];


class DialogSelectPurchasingOrder extends DialogCommonSelection {
    constructor(props) {
        super(props);

        this.multiple = false;
        this.columns = COLUMNS;
   }
}

// export default DialogSelectPurchasingOrder;
export default withStyles(CommonStyles)(DialogSelectPurchasingOrder);