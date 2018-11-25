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

import { EXPORT_BASE_URL, DATA_API_BASE_URL } from "./config"
import { toDateString } from "./utils"
import {
    // TaxTypeEditor, 
    TaxTypeProvider,
    // OrderStatusEditor, 
    OrderStatusProvider
} from './common_components'


// =============================================
const DATA_REPO = "producingSchedules";

const COLUMNS = [
    { name: 'order_id', title: '订单编号', getCellValue: row => (row._embedded && row._embedded.orderItem && row._embedded.orderItem.order) ? row._embedded.orderItem.order.no : null },
    // { name: 'clientId', title: '客户', getCellValue: row => (row._embedded && row._embedded.client) ? row._embedded.client.name : null },
    { name: 'product_code', title: '产品编号', getCellValue: row => (row._embedded && row._embedded.orderItem && row._embedded.orderItem.product) ? row._embedded.orderItem.product.code : null },
    { name: 'quantity', title: '数量', getCellValue: row => (row._embedded && row._embedded.orderItem && row._embedded.orderItem) ? row._embedded.orderItem.quantity : null  },
    { name: 'line', title: '生产线' },
    { name: 'scheduleDate', title: '排产日期' },
]

class SchedulesPage extends React.PureComponent {
    constructor(props) {
        super(props);

        // this.state = {
        //     orders: [],

        //     //
        //     snackbarOpen: false,
        //     snackbarContent: "",
        // }

        this.dataRepoApiUrl = `${DATA_API_BASE_URL}/${DATA_REPO}/search/findByProducingDateIsNull`;

        // this.editingColumnExtensions = EDITING_COLUMN_EXTENSIONS;

        // this.changeAddedRowsCallback = (row => {
        //     return Object.keys(row).length ? row : NEW_ROW_TEMPLATE
        // });

        this.onRowDoubleClicked = this.onRowDoubleClicked.bind(this)
        this.addRowHandler = () => this.props.history.push('/order');

        this.doLoad = this.doLoad.bind(this)
        this.doAdd = this.doAdd.bind(this)
        this.doUpdate = this.doUpdate.bind(this)
        this.doDelete = this.doDelete.bind(this)
    }

    componentDidMount() {
    }

    onRowDoubleClicked = (row) => {
        if (row)
            this.props.history.push(`/order/${row.id.order}`);
    }

    doLoad = () => {
        return axios.get(this.dataRepoApiUrl)//,
            .then(resp => resp.data._embedded[DATA_REPO])
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
        return axios.delete(this.dataRepoApiUrl + "/" + r['id'])
    }

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
                    {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton> */}
                    <Typography variant="title" className={classes.toolbarTitle}></Typography>
                    <Button href={`${EXPORT_BASE_URL}/orders`} color='primary' style={{ fontSize: 18 }} ><Export />导出</Button>
                    {/* <Button onClick={() => this.export()} color='primary' style={{ fontSize: 18 }} ><Printer />打印</Button> */}
                </Toolbar>

                <DataTableBase columns={COLUMNS}
                    disableEdit={true}
                    editCell={this.editCell}
                    changeAddedRowsCallback={this.changeAddedRowsCallback}
                    editingColumnExtensions={this.editingColumnExtensions}
                    doLoad={this.doLoad}
                    doAdd={this.doAdd}
                    doUpdate={this.doUpdate}
                    doDelete={this.doDelete}
                    clickHandler={this.onRowDoubleClicked}
                    showEditCommand={false}
                    showDeleteCommand={false}
                    addHandler={this.addRowHandler}
                    providers={[
                        <TaxTypeProvider key='TaxTypeProvider' for={['tax']} />,
                        <OrderStatusProvider key='OrderStatusProvider' for={['status']} />,
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


export default withStyles(styles)(SchedulesPage);