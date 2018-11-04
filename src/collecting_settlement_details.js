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

//
import { connect } from 'react-redux'

import { actionShowSnackbar } from "./redux/data_selection"

// icons
import {
    ArrowLeft, ContentSave, ClipboardCheck, 
} from 'mdi-material-ui';
import { Delete } from '@material-ui/icons';

// ui
import {
    Paper, Typography, TextField, Button, IconButton,
    // Snackbar, Select, Divider, 
    MenuItem,
    Chip,
    Toolbar, Tooltip,
    Grid,// as Grid,
    // Input, InputLabel, 
    InputAdornment,
    // FormGroup, 
    // FormControlLabel, FormControl, FormHelperText,
    Stepper, Step, StepLabel,
    // Switch,
    Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';

import {
    SelectionState,
    IntegratedSelection,
    SortingState,
    IntegratedSorting,
    FilteringState,
    IntegratedFiltering,
    // EditingState,
    // PagingState,
    // IntegratedPaging,
} from '@devexpress/dx-react-grid';

// import * as dx from '@devexpress/dx-react-grid-material-ui'
import {
    Grid as dxGrid,
    // Table as dxTable,
    VirtualTable,
    TableHeaderRow,
    TableSelection,
    // PagingPanel,
    // Toolbar,
    // TableEditRow,
    // TableEditColumn,
    // TableColumnResizing,
    TableFilterRow,
} from '@devexpress/dx-react-grid-material-ui';

//
import axios from 'axios'


// import DataTableBase from "./data_table_base"
import { MODE_ADD, MODE_EDIT, MODE_VIEW } from "./common"

import { API_BASE_URL, DATA_API_BASE_URL } from "./config"
// import { store } from "./redux"
import { getTodayString, toFixedMoney, toDateString } from "./utils"

// const MODE_ADD = 0;
// const MODE_EDIT = 1;

const savingSteps = ['检查输入数据', '保存基本信息', "保存明细", "完成"];

// =============================================
class CollectingSettlementDetailsPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            dirty: false, // is data dirty?

            clients: [],
            orders: [], // 

            // document
            document: {},
            client: null,

            //
            showSelectOrder: false,
            columns: [
                { name: 'id', title: '序号' },
                { name: 'code', title: '编号' },
                { name: "name", title: "名称" },
                { name: "spec", title: "规格" },
                { name: "comment", title: "备注" },
            ],
            selection: [],

            //
            savingDocument: false,
            activeStep: 0,

            // errors
            errors: {},
        }

        // this.onDetails = ((id) => {
        //     alert(`details ${id}`)
        // })

        // this.onEdit = ((id) => {
        //     alert(`edit ${id}`)
        // })

        this.handleSelectClient = (e => {
            const cid = parseInt(e.target.value, 10)
            let client = this.state.clients.find(i => i.id === cid)
            if (client != this.state.client) {
                this.state.client = client
                this.state.orders = []
                this.forceUpdate()

                axios.get(`${DATA_API_BASE_URL}/orders/search/findByClientAndStatus?client=../../clients/${this.state.client.id}&status=0`)
                    .then(r => r.data._embedded.orders)
                    .then(orders => this.setState({ orders }))
            }
        })

        // this.onAddOrders = (() => {
        //     this.setState({ showSelectOrder: true })
        // })

        // this.cancelSelect = (() => {
        //     this.setState({ showSelectOrder: false })
        // })

        // this.changeSelection = selection => this.setState({ selection });

        // this.addOrders = (() => {
        //     const { client, orders, selection } = this.state;
        //     Object.keys(selection).forEach(idx => {
        //         let no = selection[idx];
        //         let p = orders[no];
        //     })
        // })


        this.onDelete = ((id) => {
            const { orders } = this.state;
            let idx = orders.findIndex(v => v.id === id)
            if (idx >= 0) {
                orders.splice(idx, 1);
                this.state.dirty = true
                this.forceUpdate();
            }
        })


        // this.updateOrderValue = (e => {
        //     let value = 0
        //     this.state.orderItems.forEach(i => {
        //         value += i.quantity * i.vip
        //     })

        //     this.state.order.vip = value;
        //     this.state.dirty = true
        //     this.forceUpdate()
        // })


        //
        this.cancelSave = () => this.setState({ savingDocument: false, activeStep: 0 })

        this.onSaveSuccess = (() => {
            this.setState({ savingDocument: false, activeStep: 0, dirty: false })
            this.props.history.goBack();
        })


        this.saveDocument = (async () => {
            //
            this.setState({ savingDocument: true, activeStep: 0 })
            this.forceUpdate()

            //
            let cancel = false;
            let errors = {};


            // step 1
            // this.setState({ activeStep: this.state.activeStep + 1 })

            //
            let { document, client, orders } = this.state

            // document.createdBy = { id: this.props.user.id }
            // document.createDate = getTodayString()
            if (!client)
                errors['client'] = "未指定客户"

            if (!orders || orders.length < 0)
                errors['orders'] = "未指定订单"

            if (Object.keys(errors).length > 0) {
                this.setState({ savingDocument: false, errors })
                this.props.showSnackbar("发现错误，请检查数据输入")
                return;
            }


            // step 3
            this.setState({ activeStep: this.state.activeStep + 1 })

            document.client = { id: client.id }

            await axios.post(`${DATA_API_BASE_URL}/collectingSettlements`, document)
                .then(resp => resp.data)
                .then(j => document.id = j.id)
                .catch(e => {
                    cancel = true;
                    this.setState({ savingDocument: false })

                    this.props.showSnackbar(e.message)
                })

            if (cancel) return;


            // step 4
            this.setState({ activeStep: this.state.activeStep + 1 })

            orders.forEach(p => {
                let fi = {
                    id: { settlement: document.id, order: p.id },
                    settlement: { id: document.id },
                    order: { id: p.id }
                }

                axios.post(`${DATA_API_BASE_URL}/collectingSettlementItems`, fi)
                    .catch(e => {
                        cancel = true;
                        this.setState({ savingDocument: false })

                        this.props.showSnackbar(e.message)
                    })
            })

            if (cancel) return;

            // step 5, done
            this.setState({ activeStep: this.state.activeStep + 1 })
        })

        this.confirmDocument = () => {
            if (window.confirm("确认此结算单？")) {
                axios.patch(`${API_BASE_URL}/collecting/${this.state.document.id}/confirm`)
                    .then(_ => {
                        this.props.showSnackbar("结算单已确认")
                        this.props.history.goBack();
                    })
                    .catch(e => this.props.showSnackbar(e.message));
            }
        }

        this.processDocument = () => {
            if (!this.state.document.collectedValue) {
                const errors = { collected: "无效的金额" }
                this.setState({ errors })
                this.props.showSnackbar("发现错误，请检查数据输入")
                return
            } else {
                this.setState({ errors: {} })
            }

            if (window.confirm("确认已收款？")) {
                axios.patch(`${API_BASE_URL}/collecting/${this.state.document.id}/finish`, { collectedValue: this.state.document.collectedValue })
                    .then(_ => {
                        this.props.showSnackbar("结算单已完成")
                        this.props.history.goBack();
                    })
                    .catch(e => this.props.showSnackbar(e.message));
            }
        }
    }

    componentDidMount() {
        let { id } = this.props.match.params;
        if (!id) id = 0

        //
        if (id === 0) {
            this.state.mode = MODE_ADD

            this.setState({ document: {} })

            // load materials
            axios.get(`${DATA_API_BASE_URL}/clients/search/findByCollectingPolicyIsNotNull`)
                .then(resp => resp.data._embedded.clients)
                .then(clients => {
                    this.setState({ clients });
                })
                .catch(e => this.props.showSnackbar(e.message));
        }
        else //if (id > 0) 
        {
            this.state.mode = MODE_EDIT

            axios.get(`${DATA_API_BASE_URL}/collectingSettlements/${id}`)
                .then(resp => resp.data)
                .then(j => {
                    this.setState({ document: j });
                    if (j._embedded && j._embedded.client)
                        this.setState({ client: j._embedded.client });

                    return `${DATA_API_BASE_URL}/collectingSettlements/${id}/items`
                })
                .then(url => axios.get(url))
                .then(resp => resp.data._embedded.collectingSettlementItems)
                .then(items => items.flatMap(i => i.order))
                .then(orders => {
                    this.setState({ orders })
                })
                .catch(e => this.props.showSnackbar(e.message));
        }
    }

    render() {
        const { classes, } = this.props
        // const { id } = this.props.match.params;
        const { dirty, mode, clients, client, document, orders, } = this.state;
        const { showSelectOrder, columns, selection } = this.state;
        const { errors } = this.state;

        // let shrinkLabel = mode === MODE_EDIT ? true : undefined;

        const { savingDocument, activeStep } = this.state;

        return (
            // <Provider store={store}>
            <React.Fragment>

                <div className={classes.contentRoot}>

                    <Toolbar className={classes.toolbar}>
                        <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                        <Typography variant="title" className={classes.title}>{mode === MODE_ADD ? "新增应收结算" : "应收结算详情"}</Typography>
                        {mode === MODE_ADD ?
                            <Button onClick={() => this.saveDocument()} disabled={!client || !orders || orders.length <= 0} color='secondary' style={{ fontSize: 18 }} >保存<ContentSave /></Button>
                            :
                            document.status === 1 ?
                                <Button onClick={() => this.processDocument()} color='secondary' style={{ fontSize: 18 }} >收款完成<ClipboardCheck /></Button>
                                :
                                <Button onClick={() => this.confirmDocument()} color='secondary' style={{ fontSize: 18 }} >确认<ClipboardCheck /></Button>
                        }
                        {/* {mode === MODE_VIEW ? null :
                            } */}
                    </Toolbar>

                    <Typography variant="title" className={classes.subTitle}>基本信息</Typography>

                    <Paper className={classes.paper}>
                        <Grid container direction='column' alignItems="stretch">
                            {mode === MODE_ADD ? (
                                <Grid style={{ marginBottom: 16 }}>
                                    <TextField
                                        required
                                        select
                                        error={!!errors['client']}
                                        label="客户"
                                        style={{ width: 300 }}
                                        // className={classNames(classes.margin, classes.textField)}
                                        value={client ? client.id : ""}
                                        onChange={e => this.handleSelectClient(e)}
                                    // SelectProps={{
                                    //     native: true,
                                    //     MenuProps: {
                                    //         className: classes.menu,
                                    //     },
                                    // }}
                                    >
                                        {clients && clients.map(c => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {c.fullName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            ) : <Typography>客户</Typography>}

                            {client ? (
                                <Grid>
                                    <React.Fragment>
                                        <Chip label={client.name} className={classes.chip} />
                                        <Chip label={client.fullName} className={classes.chip} />
                                        <Chip label={`${client.collectingPolicy}, ${client.collectingPeriod}天`} className={classes.chip} />
                                    </React.Fragment>
                                </Grid>
                            ) : null}

                            <Grid style={{ marginTop: 16 }}>
                                <Typography>结算单创建日期</Typography><Chip label={mode === MODE_ADD ? getTodayString() : document.createDate} className={classes.chip} />
                            </Grid>

                            {mode === MODE_EDIT && document.status === 1 ? (
                                <React.Fragment>
                                    <Grid style={{ marginTop: 16 }}>
                                        <TextField
                                            disabled
                                            label="应收"
                                            style={{ width: 150 }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">¥</InputAdornment>
                                            }}
                                            inputProps={{
                                                min: 0,
                                            }}
                                            // className={classNames(classes.margin, classes.textField)}
                                            value={document.value}
                                        />
                                    </Grid>
                                    <Grid style={{ marginTop: 16 }}>
                                        <TextField type="number"
                                            label="实收"
                                            numeric={true}
                                            error={errors['collected'] ? true : false}
                                            style={{ width: 150 }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">¥</InputAdornment>
                                            }}
                                            inputProps={{
                                                min: 0,
                                            }}
                                            // className={classNames(classes.margin, classes.textField)}
                                            value={document.collectedValue}
                                            onChange={e => {
                                                document.collectedValue = e.target.value
                                                this.setState({ document })
                                            }}

                                        />
                                    </Grid>
                                </React.Fragment>
                            ) : null}
                        </Grid>
                    </Paper>

                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography variant="title" className={classes.subTitle}>销售明细</Typography>
                        {/* <Typography variant="title" className={classes.subTitle} style={{ marginLeft: 8, flex: 1, color: 'red' }}>{errors['orderItems'] ? errors['orderItems'] : null}</Typography> */}
                        {/* <Typography variant="title" className={classes.subTitle} color='secondary' marginleft={0}>总价：{document.total ? `¥ ${toFixedMoney(document.total)}` : '--'}</Typography> */}
                    </div>
                    <Paper className={classes.compactPaper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="dense" style={{ width: '15%', whiteSpace: 'nowrap' }}>序号</TableCell>
                                    <TableCell padding="dense" style={{ width: '20%', whiteSpace: 'nowrap' }}>订单编号</TableCell>
                                    <TableCell padding="dense" style={{ width: '20%', whiteSpace: 'nowrap' }}>签订时间</TableCell>
                                    <TableCell padding="dense" style={{ width: '20%', whiteSpace: 'nowrap' }}>发货时间</TableCell>
                                    <TableCell padding="dense" style={{ width: '15%', whiteSpace: 'nowrap' }}>是否含税</TableCell>
                                    <TableCell padding="dense" numeric style={{ width: '10%', whiteSpace: 'nowrap' }}>总价</TableCell>
                                    {mode === MODE_ADD ?
                                        <TableCell padding="dense" style={{ padding: 0, whiteSpace: 'nowrap' }}>
                                            {/* <Button variant="flat" disabled={!client} size="large" onClick={this.onAddOrders}>
                                            <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增条目</Button> */}
                                        </TableCell> : null
                                    }
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((n, no) => {
                                    return (
                                        <TableRow key={n.id}>
                                            <TableCell padding="dense" style={{ whiteSpace: 'nowrap' }}>{n.id}</TableCell>
                                            <TableCell padding="dense" style={{ whiteSpace: 'nowrap' }}>{n.no}</TableCell>
                                            <TableCell padding="dense" style={{ whiteSpace: 'nowrap' }}>{toDateString(n.orderDate)}</TableCell>
                                            <TableCell padding="dense" style={{ whiteSpace: 'nowrap' }}>{toDateString(n.deliveryDate)}</TableCell>
                                            <TableCell padding="dense" style={{ whiteSpace: 'nowrap' }}>{n.tax ? '含税' : ''}</TableCell>
                                            <TableCell padding="dense" numeric style={{ whiteSpace: 'nowrap' }}>¥ {n.value}</TableCell>
                                            {mode === MODE_ADD ?
                                                <TableCell padding="dense" style={{ whiteSpace: 'nowrap', padding: 0 }}>
                                                    <Tooltip title="删除">
                                                        <IconButton onClick={() => this.onDelete(n.id, no)}>
                                                            <Delete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell> : null
                                            }
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {/* <div style={{ padding: 8, textAlign: 'center', width: '100%' }}>
                            <Button variant="flat" size="large" component={Link} to={`/formula/add/${material.id}/0`}>
                                <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增条目</Button>
                        </div> */}
                    </Paper>
                </div>

                {/* dialog for add materials */}
                <Dialog
                    open={showSelectOrder}
                    onClose={this.cancelSelect}
                    // className={classes.dialog}
                    classes={{ paper: classes.dialog }}
                >
                    <DialogTitle>选择订单</DialogTitle>
                    <DialogContent>
                        <Paper>
                            <dxGrid
                                rows={orders}
                                columns={columns}
                            >
                                <SelectionState
                                    selection={selection}
                                    onSelectionChange={this.changeSelection}
                                />
                                <IntegratedSelection />

                                <SortingState
                                    defaultSorting={[{ columnName: 'id', direction: 'asc' }]}
                                />
                                <IntegratedSorting />

                                <FilteringState defaultFilters={[]} />
                                <IntegratedFiltering />

                                <VirtualTable height={400} messages={{ noData: "没有数据" }} />

                                <TableHeaderRow showSortingControls />
                                <TableFilterRow />
                                <TableSelection showSelectAll selectByRowClick={true} />
                            </dxGrid>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.cancelSelect} color="primary">取消</Button>
                        <Button onClick={this.addOrders} color="secondary">添加</Button>
                    </DialogActions>
                </Dialog>


                {/* dialog for save formula */}
                <Dialog
                    open={savingDocument}
                    onClose={this.cancelSave}
                    classes={{ paper: classes.dialog }}
                >
                    <DialogTitle>正在保存...</DialogTitle>
                    <DialogContent>
                        <Paper>
                            <Stepper activeStep={activeStep} alternativeLabel>
                                {savingSteps.map(label => {
                                    return (
                                        <Step key={label}>
                                            <StepLabel>{label}</StepLabel>
                                        </Step>
                                    );
                                })}
                            </Stepper>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onSaveSuccess} disabled={this.state.activeStep < savingSteps.length - 1} color="primary">确定</Button>
                    </DialogActions>
                </Dialog>

            </React.Fragment>
            // </Provider>
        )
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ...{
        toolbar: {
            padding: 0,
        },

        title: {
            opacity: .75,
            margin: 0,
            flex: 1,
        },

        // subTitle: {
        //     marginRight: 0,
        // },

        detailsTitle: {
            fontSize: 16,
            opacity: .75,
        },

        details: {
            fontSize: 16,
        },

        chip: {
            margin: `0 ${theme.spacing.unit * 2}px 0 0`,
        }
    },
})


const mapDispatchToProps = dispatch => ({
    //
    showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
})

const ConnectedComponent = connect(
    // mapStateToProps,
    null,
    mapDispatchToProps
)(CollectingSettlementDetailsPage)

export default withStyles(styles)(ConnectedComponent);