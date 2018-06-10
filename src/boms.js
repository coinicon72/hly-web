// @flow

// basic
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

// styles
import { withStyles } from 'material-ui';

import CommonStyles from "./common_styles";

// router
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

// icons
import * as mdi from 'mdi-material-ui';
import * as mui from '@material-ui/icons';

// ui
import { Paper, Typography, Grid, TextField, Button, IconButton, Snackbar, Input, Select, Toolbar, Divider, Tooltip } from 'material-ui';

import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

//
import axios from 'axios'

import DataTableBase from "./data_table_base"

import { DATA_API_BASE_URL } from "./config"
import { store } from "./redux"

// =============================================
const DATA_REPO = "orders";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: 'no', title: '订单编号' },
    { name: 'clientId', title: '客户', getCellValue: row => (row._embedded && row._embedded.client) ? row._embedded.client.name : null },
    { name: 'orderDate', title: '下单时间', getCellValue: row => row.orderDate.split("T")[0] },
    { name: 'deliveryDate', title: '发货时间', getCellValue: row => row.deliveryDate.split("T")[0] },
    { name: 'value', title: '总额' },
    { name: 'tax', title: '是否含税', getCellValue: row => row.tax ? '是' : '否' },
    { name: 'comment', title: '备注' },
    // { name: 'actual_value', title: '' },
    // { name: 'metadata', title: '' },
]

const EDITING_COLUMN_EXTENSIONS = [
    { columnName: 'id', editingEnabled: false },
]

const NEW_ROW_TEMPLATE = {
    id: 0,
    actualValue: 0,
    comment: '',
    deliveryDate: '',
    metadata: '',
    no: '',
    orderDate: '',
    tax: true,
    value: 0,
    clientId: 0,
}

class BomPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            boms: [],

            //
            snackbarOpen: false,
            snackbarContent: "",
        }

        // this.dataRepoApiUrl = API_BASE_URL + DATA_REPO;

        // this.editingColumnExtensions = EDITING_COLUMN_EXTENSIONS;

        // this.changeAddedRowsCallback = (row => {
        //     return Object.keys(row).length ? row : NEW_ROW_TEMPLATE
        // });

        // this.onRowDoubleClicked = this.onRowDoubleClicked.bind(this)
        // this.addRowHandler = () => this.props.history.push('/order');

        // this.doLoad = this.doLoad.bind(this)
        // this.doAdd = this.doAdd.bind(this)
        // this.doUpdate = this.doUpdate.bind(this)
        // this.doDelete = this.doDelete.bind(this)
        this.loadBoms = (async () => {
            axios.get(`${DATA_API_BASE_URL}/boms`)
                .then(resp => resp.data._embedded.boms)
                .then(boms => {
                    this.state.boms = boms;

                    boms.forEach(b => {
                        axios.get(`${DATA_API_BASE_URL}/boms/${b.id}/orderItem`)
                            .then(resp => resp.data)
                            .then(bi => {
                                b.orderItem = bi
                                return bi.order.id
                            })
                            .then(oid => axios.get(`${DATA_API_BASE_URL}/orders/${oid}`))
                            .then(resp => resp.data._embedded.client)
                            .then(client => {
                                b.client = client
                                this.forceUpdate()
                            })
                        // .then(oid => axios.get(`${API_BASE_URL}/orders/${oid}`))
                        // .then(o => b.order = o)
                    })
                })
                .catch(e => this.showSnackbar(e.message));

        }).bind(this)
    }

    showSnackbar(msg: String) {
        this.setState({ snackbarOpen: true, snackbarContent: msg });
    }

    componentDidMount() {
        this.loadBoms()
    }

    onRowDoubleClicked = (row) => {
        if (row)
            this.props.history.push('/order/' + row.id);
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
        const { classes, width } = this.props
        const { boms } = this.state
        const { snackbarOpen, snackbarContent } = this.state;

        return (
            <React.Fragment>
                <div className={classes.contentRoot}>
                    <Paper className={classes.compactPaper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell numeric style={{ whiteSpace: 'nowrap' }}>BOM序号</TableCell>
                                    <TableCell style={{ whiteSpace: 'nowrap' }}>客户</TableCell>
                                    <TableCell style={{ whiteSpace: 'nowrap' }}>订单编号</TableCell>
                                    <TableCell style={{ whiteSpace: 'nowrap' }}>产品编号</TableCell>
                                    <TableCell numeric style={{ whiteSpace: 'nowrap' }}>数量</TableCell>
                                    <TableCell style={{ padding: 0, whiteSpace: 'nowrap' }}>
                                        <Button variant="flat" size="large" component={Link} to={`/bom/add`}>
                                            <mdi.PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增BOM</Button>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {boms.map((bom, no) => {
                                    const { client, orderItem } = bom
                                    return (
                                        <TableRow key={bom.id}>
                                            <TableCell numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>{bom.id}</TableCell>
                                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{client ? client.name : null}</TableCell>
                                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{orderItem ? orderItem.order.no : null}</TableCell>
                                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{orderItem.product.code}</TableCell>
                                            <TableCell numeric style={{ width: '20%', whiteSpace: 'nowrap' }}>{`${orderItem.quantity} kg`}</TableCell>
                                            <TableCell style={{ whiteSpace: 'nowrap', padding: 0, textAlign: 'center' }}>
                                                <Tooltip title="明细">
                                                    <IconButton component={Link} to={`/bom/view/${orderItem.order.id}`}>
                                                        <mdi.FileDocumentBox />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="编辑">
                                                    <IconButton component={Link} to={`/bom/edit/${orderItem.order.id}`}>
                                                        <mui.Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                {/* <Tooltip title="删除">
                                                    <IconButton onClick={() => this.onDeleteBom(bom.id, no)}>
                                                        <mui.Delete />
                                                    </IconButton>
                                                </Tooltip> */}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {/* <div style={{ padding: 8, textAlign: 'center', width: '100%' }}>
                            <Button variant="flat" size="large" component={Link} to={`/formula/add/${product.id}/0`}>
                                <mdi.PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增配方</Button>
                        </div> */}
                    </Paper>
                </div>

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    autoHideDuration={3000}
                    open={snackbarOpen}
                    onClose={() => this.setState({ snackbarOpen: false })}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{snackbarContent}</span>}
                />
            </React.Fragment>
        )
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ... {
    },
})


export default withStyles(styles)(BomPage);