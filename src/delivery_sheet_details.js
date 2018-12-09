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

// icons
import { ArrowLeft, ContentSave, PlusCircleOutline, ClipboardCheck } from 'mdi-material-ui';
import { Delete } from '@material-ui/icons';

// ui
import {
    Grid as MuGrid,
    Paper, Typography, TextField, Button, IconButton,
    // MenuItem,
    // Snackbar,
    // Select, Divider,
    Toolbar, Tooltip, Chip,
    Input, InputLabel, InputAdornment,
    // FormGroup, 
    // FormControlLabel, 
    FormControl, FormHelperText,
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

import {
    Grid,
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

//
import Loading from "./loading-component"

import { DATA_API_BASE_URL } from "./config"
// import { store } from "./redux"
import { toFixedMoney, toDateString, getTodayDateTimeString, getTodayString } from "./utils"

//
import { MODE_ADD, MODE_EDIT, MODE_VIEW, ROUTER_STOCK_OUT } from "./common"
import { connect } from 'react-redux'
import { actionShowSnackbar } from "./redux/data_selection"

// const MODE_ADD = 0;
// const MODE_EDIT = 1;

const MODE_AUDIT = 'audit';

const savingSteps = ['检查输入数据', '保存基本信息', "保存明细", "完成"];

// =============================================
class DeliverySheetDetailsPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            order: null,
            products: [], // list of product from order

            deliverySheet: {},
            deliverySheetItems: [],

            //
            showSelectProduct: false,
            columns: [
                { name: 'id', title: '序号' },
                { name: 'code', title: '编号' },
                { name: "color", title: "颜色" },
                { name: "comment", title: "备注" },
            ],
            selection: [],

            //
            dirty: false,

            savingOrder: false,
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

        this.handleSheetInfoChange = e => {
            this.state.deliverySheet[e.target.id] = e.target.value;
            this.forceUpdate()

            this.setState({ dirty: true })
        }


        this.onAddProduct = () => {
            this.setState({ showSelectProduct: true })
        }


        this.cancelSelect = () => {
            this.setState({ showSelectProduct: false })
        }


        this.changeSelection = selection => this.setState({ selection });


        this.addProducts = () => {
            const { deliverySheet, deliverySheetItems, order, selection, errors } = this.state;
            Object.keys(selection).forEach(idx => {
                let no = selection[idx];
                let p = order._embedded.items[no];

                if (!deliverySheetItems.find(v => v.id.orderItem.product === p.id.product)) {
                    deliverySheetItems.push({ id: { deliverySheet: deliverySheet.id, orderItem: p.id }, _embedded: { orderItem: p }, quantity: 0, boxes: 1, price: p.price })

                    errors['deliverySheetItems'] = null
                    this.forceUpdate()

                    this.setState({ dirty: true })
                }
            })

            //
            this.setState({ deliverySheetItems, showSelectProduct: false, selection: [] })
        }


        this.onDelete = id => {
            const { deliverySheetItems } = this.state;
            let idx = deliverySheetItems.findIndex(v => v.id === id)
            if (idx >= 0) {
                deliverySheetItems.splice(idx, 1);
                this.updateSheetValue()

                this.setState({ dirty: true })

                this.forceUpdate();
            }
        }


        this.handleQuantityChange = e => {
            let id = parseInt(e.target.id.split("_")[1], 10)
            let item = this.state.deliverySheetItems.find(i => i.id.orderItem.product === id)
            item.quantity = Number.parseFloat(e.target.value)

            this.updateSheetValue()
            this.forceUpdate();

            this.setState({ dirty: true })
        }


        this.handleBoxesChange = e => {
            let id = parseInt(e.target.id.split("_")[1], 10)
            let item = this.state.deliverySheetItems.find(i => i.id.orderItem.product === id)
            item.boxes = Number.parseFloat(e.target.value)

            this.forceUpdate();
            this.setState({ dirty: true })
        }


        this.handlePriceChange = e => {
            let id = parseInt(e.target.id.split("_")[1])
            let item = this.state.deliverySheetItems.find(i => i.id.orderItem.product === id)
            item.price = Number.parseFloat(e.target.value)

            this.updateSheetValue()
            this.forceUpdate();

            this.setState({ dirty: true })
        }


        this.updateSheetValue = () => {
            let value = 0
            this.state.deliverySheetItems.forEach(i => {
                value += i.quantity * i.price
            })

            this.state.deliverySheet.value = value;

            this.forceUpdate()
        }


        //
        this.cancelSave = () => this.setState({ savingOrder: false, activeStep: 0 })

        this.onSaveSuccess = () => {
            this.setState({ savingOrder: false, activeStep: 0 })
            this.props.history.goBack();
        }


        this.saveSheet = async () => {
            //
            this.setState({ savingOrder: true, activeStep: 0, errors: {} })
            this.forceUpdate()

            //
            let cancel = false;
            let errors = {};


            // step 1
            // this.setState({ activeStep: this.state.activeStep + 1 })

            let { order, deliverySheet, deliverySheetItems, client } = this.state

            if (!deliverySheet.no || deliverySheet.no === "")
                errors['deliverySheet.no'] = "无效的发货单号"

            if (!deliverySheet.deliveryDate || deliverySheet.deliveryDate === "")
                errors['deliverySheet.deliveryDate'] = "无效的发货日期"

            if (deliverySheetItems.length <= 0) {
                errors['deliverySheetItems'] = "发货单中没有添加项目"
            } else {
                deliverySheetItems.forEach(item => {
                    if (!item.quantity || item.quantity <= 0) {
                        errors[`quantity_${item.id.orderItem.product}`] = "无效的数量"
                    }

                    if (!item.price || item.price <= 0) {
                        errors[`price_${item.id.orderItem.product}`] = "无效的价格"
                    }
                })
            }

            if (Object.keys(errors).length > 0) {
                this.setState({
                    savingOrder: false, errors,
                    // snackbarOpen: true,
                    // snackbarContent: "发现错误，请检查数据输入"
                })
                this.props.showSnackbar("发现错误，请检查数据输入")
                return;
            }


            // step 3
            this.setState({ activeStep: this.state.activeStep + 1 })

            // let value = 0;
            // deliverySheetItems.forEach(i => value += i.quantity * i.price)

            let o = {
                ...this.state.deliverySheet,
                id: 0,
                order: { id: order.id },
                createdBy: { id: this.props.user.id },
            }

            await axios.post(`${DATA_API_BASE_URL}/deliverySheets`, o)
                .then(resp => resp.data)
                .then(j => deliverySheet.id = j.id)
                .catch(e => {
                    cancel = true;
                    this.setState({
                        savingOrder: false,
                        // snackbarOpen: true,
                        // snackbarContent: e.message
                    })
                    this.props.showSnackbar(e.message)
                })

            if (cancel) return;


            // step 4
            this.setState({ activeStep: this.state.activeStep + 1 })

            deliverySheetItems.forEach(p => {
                p.id.deliverySheet = deliverySheet.id
                const { orderItem } = p.id
                let fi = {
                    ...p,
                    deliverySheet: { id: deliverySheet.id },
                    orderItem: { id: { order: orderItem.order, product: orderItem.product }, order: { id: orderItem.order }, product: { id: orderItem.product } },
                }
                delete fi._embedded

                axios.post(`${DATA_API_BASE_URL}/deliverySheetItems`, fi)
                    .catch(e => {
                        cancel = true;
                        this.setState({
                            savingOrder: false,
                            // snackbarOpen: true,
                            // snackbarContent: e.message
                        })
                        this.props.showSnackbar(e.message)
                    })
            })

            if (cancel) return;

            // step 5, done
            this.setState({ activeStep: this.state.activeStep + 1 })

        }

        this.commitSheet = async () => {
            if (window.confirm('确定将发货单提交至仓库吗？\n\n提交之后不可更改')) {
                const { deliverySheet } = this.state;

                let s = Object.assign(deliverySheet, {
                    status: 1,
                    // committedBy: {id: this.props.user.id},
                    committedBy: `../../users/${this.props.user.id}`,
                    committedOn: getTodayDateTimeString()
                })

                axios.patch(`${DATA_API_BASE_URL}/deliverySheets/${deliverySheet.id}`, s)
                    .then(r => {
                        this.setState({ deliverySheet: s })
                        this.props.showSnackbar("提交成功")
                    })
                    .catch(e => {
                        // cancel = true;
                        // this.setState({
                        //     savingOrder: false,
                        //     // snackbarOpen: true,
                        //     // snackbarContent: e.message
                        // })
                        this.props.showSnackbar(e.message)
                    })
            }
        }

        this.createRepoChangingSheet = _ => {
            this.props.history.push(`${ROUTER_STOCK_OUT}/delivery/${this.state.deliverySheet.id}`);
        }

        this.hasPrivilege = privilege => {
            if (!this.props.user || !this.props.user.roles)
                return false

            const { roles } = this.props.user
            return roles.flatMap(r => r.privileges)
                .findIndex(p => privilege.startsWith(p.code)) >= 0
        }
    }

    componentDidMount() {
        // document.title = "发货单详情";

        let { mode, id } = this.props.match.params;
        if (!mode || !id) {
            this.props.showSnackbar('无效的参数')
            return
        }

        if (mode === MODE_ADD) {
            axios.get(`${DATA_API_BASE_URL}/orders/${id}`)
                .then(resp => resp.data)
                .then(order => {
                    this.setState({ order, orderItems: order._embedded.items.flatMap(it => ({ ...it.product, price: it.price })) })
                })
                .catch(e => this.props.showSnackbar(e.message));
        } else {
            axios.get(`${DATA_API_BASE_URL}/deliverySheets/${id}`)
                .then(resp => resp.data)
                .then(deliverySheet => {
                    this.setState({ deliverySheet });
                })
                .then(_ => axios.get(`${DATA_API_BASE_URL}/deliverySheets/${id}/items`))
                .then(resp => resp.data._embedded.deliverySheetItems)
                .then(deliverySheetItems => {
                    this.setState({ deliverySheetItems });
                    this.updateSheetValue()
                })
                .then(_ => axios.get(`${DATA_API_BASE_URL}/deliverySheets/${id}/order`))
                .then(resp => resp.data)
                .then(order => {
                    this.setState({ order, orderItems: order._embedded.items.flatMap(it => it.product) })
                })
                .catch(e => this.props.showSnackbar(e.message));
        }

        if (mode === MODE_AUDIT)
            this.setState({ mode })
        else
            this.setState({ mode: MODE_EDIT })
    }

    render() {
        const { classes, } = this.props
        // const { id } = this.props.match.params;
        const { order, orderItems, deliverySheet, deliverySheetItems } = this.state;
        let { mode } = this.state;
        const { showSelectProduct, columns, selection } = this.state;
        const { errors, dirty } = this.state;

        // if (mode === MODE_EDIT && order.status > 0)
        //     mode = MODE_VIEW

        let shrinkLabel = mode === MODE_EDIT || mode === MODE_VIEW ? true : undefined;

        const { savingOrder, activeStep } = this.state;

        return (
            // <Provider store={store}>
            order ?
                <React.Fragment>

                    <div className={classes.contentRoot}>

                        <Toolbar className={classes.toolbar}>
                            <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                            <Typography variant="title" className={classes.title}>发货单详情</Typography>
                            {
                                mode === MODE_AUDIT ?
                                    <Button onClick={() => this.createRepoChangingSheet()} color='secondary' style={{ fontSize: 18 }} >生成出库单<ClipboardCheck /></Button>
                                    : <React.Fragment>
                                        <Button onClick={() => this.saveSheet()} disabled={(mode === MODE_EDIT && !dirty) || mode === MODE_VIEW || deliverySheet.status === 1} color='secondary' style={{ fontSize: 18 }} >保存发货单<ContentSave /></Button>
                                        <Button onClick={() => this.commitSheet()} disabled={deliverySheet.id == null || deliverySheet.status !== 0} color='secondary' style={{ fontSize: 18 }} >提交至仓库<ClipboardCheck /></Button>
                                    </React.Fragment>
                            }
                            {/* {mode === MODE_VIEW ? null :
                            } */}
                        </Toolbar>

                        <Typography variant="title" className={classes.subTitle}>订单信息</Typography>

                        <Paper className={classes.paper}>
                            <MuGrid container direction='column' alignItems="stretch">
                                <MuGrid style={{ marginBottom: 16 }}>
                                    <React.Fragment>
                                        <Chip label={order._embedded.client.name} className={classes.chip} />
                                        <Chip label={order._embedded.client.fullName} className={classes.chip} />
                                    </React.Fragment>
                                </MuGrid>
                                <MuGrid>
                                    <FormControl disabled aria-describedby="no-error-text">
                                        <InputLabel htmlFor="orderNo" shrink={true}>订单编号</InputLabel>
                                        <Input id="orderNo"
                                            value={order.no}
                                        />

                                        <FormHelperText id="no-error-text">{errors.revision}</FormHelperText>
                                    </FormControl>
                                </MuGrid>

                                <MuGrid>
                                    <TextField type="date" disabled id="orderDate"
                                        label="下单日期"
                                        value={order.orderDate ? toDateString(order.orderDate) : ""}
                                        margin="normal"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />

                                    <TextField type="date" disabled
                                        label="发货日期"
                                        style={{ marginLeft: 32 }}
                                        value={order.deliveryDate ? toDateString(order.deliveryDate) : ""}
                                        margin="normal"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </MuGrid>
                                <MuGrid>
                                    <TextField id="comment" disabled label="备注"
                                        value={order.comment}
                                        className={classes.textFieldWithoutWidth}
                                        multiline
                                        fullWidth
                                        rowsMax="4"
                                        margin="normal"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </MuGrid>
                            </MuGrid>
                        </Paper>

                        <Typography variant="title" className={classes.subTitle}>发货单信息</Typography>

                        <Paper className={classes.paper}>
                            <MuGrid container direction='column' alignItems="stretch">
                                <MuGrid>
                                    <FormControl required disabled={mode === MODE_AUDIT}
                                        error={!!errors['deliverySheet.no']}
                                    >
                                        <InputLabel htmlFor="no" shrink={true}>发货单编号</InputLabel>
                                        <Input id="no"
                                            value={deliverySheet.no ? deliverySheet.no : ""}
                                            onChange={e => this.handleSheetInfoChange(e)}
                                        />
                                    </FormControl>

                                    <TextField type="date"
                                        id="deliveryDate"
                                        required
                                        disabled={mode === MODE_AUDIT}
                                        error={!!errors['deliverySheet.deliveryDate']}
                                        label="发货日期"
                                        style={{ marginLeft: 32 }}
                                        value={deliverySheet.deliveryDate ? toDateString(deliverySheet.deliveryDate) : ""}
                                        onChange={e => this.handleSheetInfoChange(e)}
                                        margin="normal"
                                        inputProps={{
                                            min: mode === MODE_EDIT ? getTodayString() : null
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </MuGrid>
                            </MuGrid>
                        </Paper>

                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Typography variant="title" className={classes.subTitle} >条目</Typography>
                            {!!errors['deliverySheetItems'] ?
                                <Typography variant="subheading" className={classes.error} style={{ marginLeft: 8, marginTop: 32 }}>{errors['deliverySheetItems']}</Typography>
                                : null
                            }
                            <span style={{ flex: 1 }}></span>
                            <Typography variant="title" className={classes.subTitle} color='secondary' marginleft={0}>总价：{deliverySheet && deliverySheet.value ? `¥ ${toFixedMoney(deliverySheet.value)}` : '--'}</Typography>
                        </div>
                        <Paper className={classes.compactPaper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="dense" style={{ width: '15%', whiteSpace: 'nowrap' }}>产品编号</TableCell>
                                        <TableCell padding="dense" style={{ width: '10%', whiteSpace: 'nowrap' }}>产品颜色</TableCell>
                                        <TableCell padding="dense" numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>数量</TableCell>
                                        <TableCell padding="dense" numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>箱数</TableCell>
                                        <TableCell padding="dense" numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>单价</TableCell>
                                        <TableCell padding="dense" numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>小计</TableCell>
                                        <TableCell padding="dense" style={{ width: '10%', padding: 0, whiteSpace: 'nowrap' }}>
                                            {mode === MODE_VIEW || mode === MODE_AUDIT ? null :
                                                <Button variant="flat" size="large" onClick={this.onAddProduct}>
                                                    <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增条目</Button>
                                            }
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {deliverySheetItems.map((it, no) => {
                                        const { orderItem } = it._embedded
                                        const { product } = orderItem
                                        const pid = product.id
                                        return (
                                            <TableRow key={pid}>
                                                <TableCell padding="dense" style={{ width: '15%', whiteSpace: 'nowrap' }}>{product.code}</TableCell>
                                                <TableCell padding="dense" style={{ width: '10%', whiteSpace: 'nowrap' }}>{product.color}</TableCell>
                                                <TableCell padding="dense" numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>
                                                    <TextField type="number" style={{ width: 100 }} required disabled={mode === MODE_VIEW || mode === MODE_AUDIT} id={`quantity_${pid}`}
                                                        value={it.quantity}
                                                        fullWidth
                                                        error={!!errors[`quantity_${pid}`]}
                                                        margin="normal"
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                                        }}
                                                        inputProps={{ min: 0, }}
                                                        onChange={e => this.handleQuantityChange(e)}
                                                    />
                                                </TableCell>
                                                <TableCell padding="dense" numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>
                                                    <TextField type="number" style={{ width: 80 }} required disabled={mode === MODE_VIEW || mode === MODE_AUDIT} id={`boxes_${pid}`}
                                                        value={it.boxes}
                                                        fullWidth
                                                        error={!!errors[`boxes_${pid}`]}
                                                        margin="normal"
                                                        inputProps={{ min: 1, }}
                                                        onChange={e => this.handleBoxesChange(e)}
                                                    />
                                                </TableCell>
                                                <TableCell padding="dense" numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>
                                                    <TextField type="number"
                                                        style={{ width: 100 }} required
                                                        disabled
                                                        // disabled={mode === MODE_VIEW}
                                                        id={`price_${pid}`}
                                                        value={it.price}
                                                        fullWidth
                                                        error={!!errors[`price_${pid}`]}
                                                        margin="normal"
                                                        InputProps={{
                                                            startAdornment: <InputAdornment position="start">¥</InputAdornment>
                                                        }}
                                                        inputProps={{ min: 0, }}
                                                        onChange={e => this.handlePriceChange(e)}
                                                    />
                                                </TableCell>
                                                <TableCell padding="dense" numeric style={{ width: '10%', whiteSpace: 'nowrap' }}>{`¥ ${toFixedMoney(it.quantity * it.price)}`}</TableCell>
                                                <TableCell padding="dense" numeric style={{ width: '10%', whiteSpace: 'nowrap', padding: 0 }}>
                                                    {mode === MODE_VIEW || mode === MODE_AUDIT ? null :
                                                        <Tooltip title="删除">
                                                            <IconButton onClick={() => this.onDelete(it.id, no)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </Tooltip>
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            {/* <div style={{ padding: 8, textAlign: 'center', width: '100%' }}>
                            <Button variant="flat" size="large" component={Link} to={`/formula/add/${product.id}/0`}>
                                <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增条目</Button>
                        </div> */}
                        </Paper>
                    </div>

                    {/* dialog for add materials */}
                    <Dialog
                        open={showSelectProduct}
                        onClose={this.cancelSelect}
                        // className={classes.dialog}
                        classes={{ paper: classes.dialog }}
                    >
                        <DialogTitle>添加产品</DialogTitle>
                        <DialogContent>
                            <Paper>
                                <Grid
                                    rows={orderItems}
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
                                </Grid>
                            </Paper>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.cancelSelect} color="primary">取消</Button>
                            <Button onClick={this.addProducts} color="secondary">添加</Button>
                        </DialogActions>
                    </Dialog>


                    {/* dialog for save formula */}
                    <Dialog
                        open={savingOrder}
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
                : <Loading />
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

const mapStateToProps = state => ({
    user: state.main.user,
})

const mapDispatchToProps = dispatch => ({
    //
    showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
})

const ConnectedComponent = connect(
    mapStateToProps,
    mapDispatchToProps
)(DeliverySheetDetailsPage)

export default withStyles(styles)(ConnectedComponent);