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

import { API_BASE_URL } from "./config"
import { store } from "./redux"

const MODE_ADD = 0;
const MODE_EDIT = 1;

const savingSteps = ['选择合同', '保存基本信息', "保存明细", "完成"];

// =============================================
class BomPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            order: null,
            orderItems: [], // { id: { product: p.id, order: this.state.order.id }, quantity: 0, price: 0 }
            client: null,

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

            await axios.post(`${API_BASE_URL}orders`, o)
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

                axios.post(`${API_BASE_URL}orderItems`, fi)
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
        const { id } = this.props.match.params;

        if (id == 0) {
            this.state.mode = MODE_ADD

            this.setState({ order: { tax: false } })
        }
        else //if (id > 0) 
        {
            this.state.mode = MODE_EDIT

            axios.get(`${API_BASE_URL}/orders/${id}`)
                .then(resp => resp.data)
                .then(j => {
                    this.setState({ order: j });
                    if (j._embedded && j._embedded.client)
                        this.setState({ client: j._embedded.client });

                    return `${API_BASE_URL}/orders/${id}/items`
                })
                .then(url => axios.get(url))
                .then(resp => resp.data._embedded.orderItems)
                .then(j => {
                    // { id: { product: p.id, order: this.state.order.id }, quantity: 0, price: 0 }
                    // let fs = []
                    // j.forEach(it => fs.push({ 'quantity': it.quantity, ...it._embedded.material }))
                    // this.setState({ orderItems: fs });
                    this.setState({ orderItems: j })
                })
                .catch(e => this.showSnackbar(e.message));
        }

        // load clients
        axios.get(`${API_BASE_URL}/clients`)
            .then(resp => resp.data._embedded.clients)
            .then(j => {
                this.setState({ clients: j });
            })
            .catch(e => this.showSnackbar(e.message));

        // load products
        axios.get(`${API_BASE_URL}/products`)
            .then(resp => resp.data._embedded.products)
            .then(j => {
                this.setState({ products: j });
            })
            .catch(e => this.showSnackbar(e.message));
    }

    render() {
        const { classes, width } = this.props
        const { id } = this.props.match.params;
        const { mode, order, client, orderItems, products, clients } = this.state;
        const { showSelectProduct, columns, selection } = this.state;
        const { errors, snackbarOpen, snackbarContent } = this.state;

        let shrinkLabel = mode === MODE_EDIT ? true : undefined;

        const { savingOrder, activeStep } = this.state;

        return (
            // <Provider store={store}>
            <React.Fragment>

                <div className={classes.contentRoot}>

                    <Toolbar className={classes.toolbar}>
                        <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton>
                        <Typography variant="title" className={classes.title}>生成BOM单</Typography>
                        <Button onClick={() => this.saveOrder()} disabled={mode === MODE_EDIT} color='secondary' style={{ fontSize: 18 }} >保存订单<mdi.ContentSave /></Button>
                        {/* {mode === MODE_VIEW ? null :
                            } */}
                    </Toolbar>

                    {/* <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography variant="title" className={classes.subTitle} style={{ display: 'inline-flex'}}></Typography> */}
                    <Button onClick={() => { }} color='primary' style={{ fontSize: 18, marginBottom: 8 }} ><mdi.ClipboardText />选择订单</Button>
                    {/* </div> */}

                    {order ? (
                        <React.Fragment>
                            <Paper className={classes.paper}>
                                <mu.Grid container direction='column' alignItems="stretch">
                                    <mu.Grid style={{ marginBottom: 16 }}>
                                        <React.Fragment>
                                            <Chip label={client.name} className={classes.chip} />
                                            <Chip label={client.fullName} className={classes.chip} />
                                            <Chip label={client.settlementPolicy} className={classes.chip} />
                                        </React.Fragment>
                                    </mu.Grid>
                                    <mu.Grid>
                                        <FormControl disabled aria-describedby="no-error-text">
                                            <InputLabel htmlFor="no" shrink={true}>订单编号</InputLabel>
                                            <Input id="no"
                                                value={order.no}
                                            />
                                            <FormHelperText id="no-error-text">{errors.revision}</FormHelperText>
                                        </FormControl>
                                    </mu.Grid>

                                    <mu.Grid>
                                        <TextField type="date" disabled id="orderDate"
                                            label="下单日期"
                                            value={order.orderDate ? order.orderDate.split("T")[0] : ""}
                                            margin="normal"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />

                                        <TextField type="date" disabled id="deliveryDate"
                                            label="发货日期"
                                            style={{ marginLeft: 32 }}
                                            value={order.deliveryDate ? order.deliveryDate.split("T")[0] : ""}
                                            margin="normal"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </mu.Grid>
                                    <mu.Grid>
                                        <TextField id="comment" label="备注"
                                            value={order.comment}
                                            className={classes.textFieldWithoutWidth}
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
                                <Typography variant="title" className={classes.subTitle} style={{ flex: 1 }}>BOM</Typography>

                                <BomSheet />
                                <BomSheet />
                            </div>
                        </React.Fragment>
                    ) : null}

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
                                <TableSelection showSelectAll />
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

class BomSheet extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            formula: {},
            formulaItems: []
        }
    }

    render() {
        const { classes, width } = this.props
        const { product, orderItem } = this.props
        const { formula, formulaItems } = this.state

        return (
            <Paper className={classes.compactPaper}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Chip label={product.code} className={classes.chip} />
                    <Chip label={product.color} className={classes.chip} />
                    <Chip label={product.base} className={classes.chip} />
                    <Chip label={`${orderItem.quantity} kg`} className={classes.chip} />
                    <Button onClick={() => { }} color='primary' style={{ fontSize: 18, }} ><mdi.AutoFix />选择配方</Button>
                </div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>材料编号</TableCell>
                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>材料名称</TableCell>
                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>材料类型</TableCell>
                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>配方比例</TableCell>
                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>数量</TableCell>
                            {/* <TableCell style={{ padding: 0, whiteSpace: 'nowrap' }}>
                            </TableCell> */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formulaItems.map((n, no) => {
                            const { material } = n._embedded
                            return (
                                <TableRow key={material.id}>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{material.code}</TableCell>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{material.name}</TableCell>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{material.type.name}</TableCell>
                                    <TableCell numeric style={{ width: '20%', whiteSpace: 'nowrap' }}>{material.quantity}</TableCell>
                                    <TableCell numeric style={{ width: '20%', whiteSpace: 'nowrap' }}>{material.quantity * orderItem.quantity}</TableCell>
                                    {/* <TableCell style={{ whiteSpace: 'nowrap', padding: 0 }}>
                                        <Tooltip title="删除">
                                            <IconButton onClick={() => this.onDelete(n.id, no)}>
                                                <mui.Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell> */}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        )
    }
}

BomSheet = withStyles(styles)(BomSheet);


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


export default withStyles(styles)(BomPage);