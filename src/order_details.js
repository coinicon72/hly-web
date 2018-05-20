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
import * as mu from 'material-ui';
import { Paper, Typography, TextField, Button, IconButton, Snackbar, Select, Toolbar, Divider, Tooltip, Chip } from 'material-ui';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormGroup, FormControlLabel, FormControl, FormHelperText } from 'material-ui/Form';
import Stepper, { Step, StepLabel } from 'material-ui/Stepper';
import Switch from 'material-ui/Switch';
import { MenuItem } from 'material-ui/Menu';

import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';

import {
    SelectionState,
    IntegratedSelection,
    SortingState,
    IntegratedSorting,
    FilteringState,
    IntegratedFiltering,
    EditingState,
    PagingState,
    IntegratedPaging,
} from '@devexpress/dx-react-grid';

import {
    Grid,
    Table as dxTable,
    VirtualTable,
    TableHeaderRow,
    TableSelection,
    PagingPanel,
    // Toolbar,
    TableEditRow,
    TableEditColumn,
    TableColumnResizing,
    TableFilterRow,
} from '@devexpress/dx-react-grid-material-ui';

//
import axios from 'axios'


import DataTableBase from "./data_table_base"

import { DATA_API_BASE_URL } from "./config"
// import { store } from "./redux"
import { toFixedMoney } from "./utils"

const MODE_ADD = 0;
const MODE_EDIT = 1;

const savingSteps = ['检查输入数据', '保存基本信息', "保存明细", "完成"];

// =============================================
class OrderDetailsPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            order: {},
            orderItems: [], // { id: { product: p.id, order: this.state.order.id }, quantity: 0, price: 0 }
            client: null,
            boms: [],

            products: [],
            clients: [],

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
            savingOrder: false,
            activeStep: 0,

            // errors
            errors: {},

            //
            snackbarOpen: false,
            snackbarContent: "",
        }

        // this.onDetails = ((id) => {
        //     alert(`details ${id}`)
        // }).bind(this)

        // this.onEdit = ((id) => {
        //     alert(`edit ${id}`)
        // }).bind(this)

        this.handleOrderInfoChange = (e => {
            this.state.order[e.target.id] = e.target.value;
            this.forceUpdate()
        }).bind(this)


        this.onChangeTax = (e => {
            this.state.order.tax = !this.state.order.tax
            this.forceUpdate()
        }).bind(this)


        this.handleSelectClient = (e => {
            let client = this.state.clients.find(i => i.id == e.target.value)
            if (client)
                this.setState({ client: client })
        }).bind(this)


        this.onAddProduct = (() => {
            this.setState({ showSelectProduct: true })
        }).bind(this)


        this.cancelSelect = (() => {
            this.setState({ showSelectProduct: false })
        }).bind(this)


        this.changeSelection = selection => this.setState({ selection });


        this.addProducts = (() => {
            const { orderItems, products, selection } = this.state;
            Object.keys(selection).forEach(idx => {
                let no = selection[idx];
                let p = products[no];

                if (!orderItems.find(v => v.id.product === p.id))
                    orderItems.push({ id: { product: p.id, order: this.state.order.id }, quantity: 0, price: 0 })
            })

            //
            this.setState({ orderItems: orderItems, showSelectProduct: false, selection: [] })
        }).bind(this)


        this.onDelete = ((id) => {
            const { orderItems } = this.state;
            let idx = orderItems.findIndex(v => v.id === id)
            if (idx >= 0) {
                orderItems.splice(idx, 1);
                this.forceUpdate();
            }
        }).bind(this)


        this.handleQuantityChange = (e => {
            let id = e.target.id.split("_")[1]
            let item = this.state.orderItems.find(i => i.id.product == id)
            item.quantity = Number.parseFloat(e.target.value)

            this.updateOrderValue()

            this.forceUpdate();
        }).bind(this)


        this.handlePriceChange = (e => {
            let id = e.target.id.split("_")[1]
            let item = this.state.orderItems.find(i => i.id.product == id)
            item.price = Number.parseFloat(e.target.value)

            this.updateOrderValue()

            this.forceUpdate();
        }).bind(this)


        this.updateOrderValue = (e => {
            let value = 0
            this.state.orderItems.forEach(i => {
                value += i.quantity * i.price
            })

            this.state.order.value = value;
            this.forceUpdate()
        }).bind(this)


        //
        this.cancelSave = () => this.setState({ savingOrder: false, activeStep: 0 })

        this.onSaveSuccess = (() => {
            this.setState({ savingOrder: false, activeStep: 0 })
            this.props.history.goBack();
        }).bind(this)


        this.saveOrder = (async () => {
            //
            this.setState({ savingOrder: true, activeStep: 0 })
            this.forceUpdate()

            //
            let cancel = false;
            let errors = {};


            // step 1
            this.setState({ activeStep: this.state.activeStep + 1 })

            let { order, orderItems, client } = this.state

            if (!order.no || order.no == "")
                errors['order.no'] = "无效的订单号"

            if (!order.orderDate || order.orderDate == "")
                errors['order.orderDate'] = "无效的下单日期"

            if (!order.deliveryDate || order.deliveryDate == "")
                errors['order.deliveryDate'] = "无效的发货日期"

            if (!client || !client.id)
                errors['client'] = "无效的客户"

            if (orderItems.length <= 0) {
                errors['orderItems'] = "订单中没有添加产品"
            } else {
                orderItems.forEach(item => {
                    if (!item.quantity || item.quantity <= 0) {
                        errors[`quantity_${item.id.product}`] = "无效的数量"
                    }

                    if (!item.price || item.price <= 0) {
                        errors[`price_${item.id.product}`] = "无效的价格"
                    }
                })
            }

            if (Object.keys(errors).length > 0) {
                this.setState({
                    savingOrder: false, errors: errors, snackbarOpen: true,
                    snackbarContent: "有错误发生"
                })
                return;
            }


            // step 3
            this.setState({ activeStep: this.state.activeStep + 1 })

            // let value = 0;
            // orderItems.forEach(i => value += i.quantity * i.price)

            let o = {
                ...this.state.order,
                // value: ,
                client: { id: client.id }
            }

            await axios.post(`${DATA_API_BASE_URL}orders`, o)
                .then(resp => resp.data)
                .then(j => order.id = j.id)
                .catch(e => {
                    cancel = true;
                    this.setState({
                        savingOrder: false, snackbarOpen: true,
                        snackbarContent: e.message
                    })
                })

            if (cancel) return;


            // step 4
            this.setState({ activeStep: this.state.activeStep + 1 })

            orderItems.forEach(p => {
                let fi = {
                    ...p,
                    order: { id: order.id },
                    product: { id: p.id.product }
                }

                axios.post(`${DATA_API_BASE_URL}orderItems`, fi)
                    .catch(e => {
                        cancel = true;
                        this.setState({
                            savingOrder: false, snackbarOpen: true,
                            snackbarContent: e.message
                        })
                    })
            })

            if (cancel) return;

            // step 5, done
            this.setState({ activeStep: this.state.activeStep + 1 })

        }).bind(this)
    }

    showSnackbar(msg: String) {
        this.setState({ snackbarOpen: true, snackbarContent: msg });
    }

    componentDidMount() {
        let { id } = this.props.match.params;
        if (!id) id = 0

        if (id == 0) {
            this.state.mode = MODE_ADD

            this.setState({ order: { tax: false } })
        }
        else //if (id > 0) 
        {
            this.state.mode = MODE_EDIT

            axios.get(`${DATA_API_BASE_URL}/orders/${id}`)
                .then(resp => resp.data)
                .then(j => {
                    this.setState({ order: j });
                    if (j._embedded && j._embedded.client)
                        this.setState({ client: j._embedded.client });

                    return `${DATA_API_BASE_URL}/orders/${id}/items`
                })
                .then(url => axios.get(url))
                .then(resp => resp.data._embedded.orderItems)
                .then(j => {
                    // { id: { product: p.id, order: this.state.order.id }, quantity: 0, price: 0 }
                    // let fs = []
                    // j.forEach(it => fs.push({ 'quantity': it.quantity, ...it._embedded.material }))
                    // this.setState({ orderItems: fs });
                    this.setState({ orderItems: j })
                    return j
                })
                .then(j => axios.get(`${DATA_API_BASE_URL}/boms/search/findByOrderId?oid=${id}`))
                .then(resp => resp.data._embedded.boms)
                .then(boms => this.setState({ boms }))
                .catch(e => this.showSnackbar(e.message));
        }

        // load clients
        axios.get(`${DATA_API_BASE_URL}/clients`)
            .then(resp => resp.data._embedded.clients)
            .then(j => {
                this.setState({ clients: j });
            })
            .catch(e => this.showSnackbar(e.message));

        // load products
        axios.get(`${DATA_API_BASE_URL}/products`)
            .then(resp => resp.data._embedded.products)
            .then(j => {
                this.setState({ products: j });
            })
            .catch(e => this.showSnackbar(e.message));
    }

    render() {
        const { classes, width } = this.props
        const { id } = this.props.match.params;
        const { mode, order, client, orderItems, products, clients, boms } = this.state;
        const { showSelectProduct, columns, selection } = this.state;
        const { errors, snackbarOpen, snackbarContent } = this.state;

        let shrinkLabel = mode === MODE_EDIT ? true : undefined;

        const { savingOrder, activeStep } = this.state;

        // current date
        let now = new Date();
        let m = now.getMonth() + 1;
        if (m < 10)
            m = '0' + m;
        let d = now.getDate();
        if (d < 10)
            d = '0' + d;
        let today = `${now.getFullYear()}-${m}-${d}`

        return (
            // <Provider store={store}>
            <React.Fragment>

                <div className={classes.contentRoot}>

                    <Toolbar className={classes.toolbar}>
                        <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton>
                        <Typography variant="title" className={classes.title}>订单详情</Typography>
                        <Button onClick={() => this.saveOrder()} disabled={mode === MODE_EDIT} color='secondary' style={{ fontSize: 18 }} >保存订单<mdi.ContentSave /></Button>
                        {/* {mode === MODE_VIEW ? null :
                            } */}
                    </Toolbar>

                    <Typography variant="title" className={classes.subTitle}>基本信息</Typography>

                    <Paper className={classes.paper}>
                        <mu.Grid container direction='column' alignItems="stretch">
                            <mu.Grid style={{ marginBottom: 16 }}>
                                {mode === MODE_ADD ? (
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
                                        {clients.map(c => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {c.fullName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                ) : (
                                        client ? (
                                            <React.Fragment>
                                                <Chip label={client.name} className={classes.chip} />
                                                <Chip label={client.fullName} className={classes.chip} />
                                                <Chip label={client.settlementPolicy} className={classes.chip} />
                                            </React.Fragment>
                                        ) : null
                                    )}
                            </mu.Grid>
                            <mu.Grid>
                                <FormControl required error={!!errors['order.no']} aria-describedby="no-error-text">
                                    <InputLabel htmlFor="no" shrink={shrinkLabel}>订单编号</InputLabel>
                                    <Input id="no"
                                        value={order.no}
                                        onChange={e => this.handleOrderInfoChange(e)}
                                    />
                                    <FormHelperText id="no-error-text">{errors.revision}</FormHelperText>
                                </FormControl>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!order.tax}
                                            onChange={e => this.onChangeTax()}
                                            color="secondary"
                                        />
                                    }
                                    label={!!order.tax ? "含税" : "不含税"}
                                    style={{ marginLeft: 32 }}
                                />
                            </mu.Grid>

                            <mu.Grid>
                                <TextField type="date" required id="orderDate" error={!!errors['order.orderDate']}
                                    label="下单日期"
                                    value={order.orderDate ? order.orderDate.split("T")[0] : ""}
                                    margin="normal"
                                    onChange={e => this.handleOrderInfoChange(e)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />

                                <TextField type="date" required id="deliveryDate" error={!!errors['order.deliveryDate']}
                                    label="发货日期"
                                    style={{ marginLeft: 32 }}
                                    value={order.deliveryDate ? order.deliveryDate.split("T")[0] : ""}
                                    margin="normal"
                                    onChange={e => this.handleOrderInfoChange(e)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </mu.Grid>
                            <mu.Grid>
                                <TextField id="comment" error={!!errors['order.comment']} label="备注"
                                    defaultValue=""
                                    value={order.comment}
                                    className={classes.textFieldWithoutWidth}
                                    onChange={e => this.handleOrderInfoChange(e)}
                                    multiline
                                    fullWidth
                                    rowsMax="4"
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: shrinkLabel,
                                    }}
                                />
                            </mu.Grid>
                        </mu.Grid>
                    </Paper>

                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography variant="title" className={classes.subTitle} style={{ flex: 1 }}>条目</Typography>
                        <Typography variant="title" className={classes.subTitle} color='secondary' marginLeft={0}>总价：{order.value ? `¥ ${toFixedMoney(order.value)}` : '--'}</Typography>
                    </div>
                    <Paper className={classes.compactPaper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>产品编号</TableCell>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>产品颜色</TableCell>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>数量</TableCell>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>单价</TableCell>
                                    <TableCell numeric style={{ width: '20%', whiteSpace: 'nowrap' }}>小计</TableCell>
                                    <TableCell style={{ padding: 0, whiteSpace: 'nowrap' }}>
                                        <Button variant="flat" size="large" onClick={this.onAddProduct}>
                                            <mdi.PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增条目</Button>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orderItems.map((n, no) => {
                                    let product = products.find(p => p.id === n.id.product)
                                    let rid = n.id.product
                                    return (
                                        <TableRow key={rid}>
                                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{product.code}</TableCell>
                                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{product.color}</TableCell>
                                            <TableCell numeric style={{ width: '20%', whiteSpace: 'nowrap' }}>
                                                <TextField type="number" required id={`quantity_${rid}`}
                                                    value={n.quantity}
                                                    fullWidth
                                                    error={!!errors[`quantity_${rid}`]}
                                                    margin="normal" inputProps={{ min: 0 }}
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                                    }}
                                                    onChange={e => this.handleQuantityChange(e)}
                                                />
                                            </TableCell>
                                            <TableCell numeric style={{ width: '20%', whiteSpace: 'nowrap' }}>
                                                <TextField type="number" required id={`price_${rid}`}
                                                    value={n.price}
                                                    fullWidth
                                                    error={!!errors[`price_${rid}`]}
                                                    margin="normal" inputProps={{ min: 0 }}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start">¥</InputAdornment>
                                                    }}
                                                    onChange={e => this.handlePriceChange(e)}
                                                />
                                            </TableCell>
                                            <TableCell numeric style={{ width: '20%', whiteSpace: 'nowrap' }}>{`¥ ${toFixedMoney(n.quantity * n.price)}`}</TableCell>
                                            <TableCell style={{ whiteSpace: 'nowrap', padding: 0 }}>
                                                <Tooltip title="删除">
                                                    <IconButton onClick={() => this.onDelete(n.id, no)}>
                                                        <mui.Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {/* <div style={{ padding: 8, textAlign: 'center', width: '100%' }}>
                            <Button variant="flat" size="large" component={Link} to={`/formula/add/${product.id}/0`}>
                                <mdi.PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增条目</Button>
                        </div> */}
                    </Paper>


                    <Typography variant="title" className={classes.subTitle}>BOM</Typography>

                    <Paper className={classes.paper}>
                        {boms && boms.length > 0 ? (
                            <React.Fragment>
                                <Typography >BOM已生成</Typography>
                                <Button variant="flat" size="large" component={Link} to={`/bom/view/${order.id}`}>
                                    <mdi.FileMultiple style={{ opacity: .5 }} color="primary" />查看BOM</Button>
                            </React.Fragment>
                        ) : <Button variant="flat" size="large" component={Link} to={`/bom/add/${order.id}`}>
                                <mdi.PlusCircleOutline style={{ opacity: .5 }} color="secondary" />生成BOM</Button>}
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
                    SnackbarContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{snackbarContent}</span>}
                />


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
                                rows={products}
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
                        <Button onClick={this.onSaveSuccess} disabled={this.state.activeStep == savingSteps.length - 1 ? false : true} color="primary">确定</Button>
                    </DialogActions>
                </Dialog>

            </React.Fragment>
            // </Provider>
        )
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ... {
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


export default withStyles(styles)(OrderDetailsPage);