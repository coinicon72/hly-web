// @flow

// basic
// import React from 'react';

// styles
import { withStyles } from '@material-ui/core';
import CommonStyles from "../common_styles";

import DialogCommonSelection from './dialog_common_selection'


const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: 'code', title: '编号' },
    { name: "name", title: "名称" },
    { name: "type", title: "类型", getCellValue: row => row.type ? row.type.name : undefined },
    { name: "spec", title: "规格" },
    { name: "comment", title: "备注" },
]


class DialogSelectMaterials extends DialogCommonSelection {
    constructor(props) {
        super(props);

        this.multiple = true
        this.columns = COLUMNS;
    }
}

export default withStyles(CommonStyles)(DialogSelectMaterials);