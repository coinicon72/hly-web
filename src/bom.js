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
const MODE_VIEW = 2;

const savingSteps = ['选择合同', '保存基本信息', "保存明细", "完成"];

// =============================================
class BomPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            mode: MODE_VIEW,

            order: null,
            orderItems: [], // { id: { product: p.id, order: this.state.order.id }, quantity: 0, price: 0 }
            // client: null,

            orders: [],

            //
            showSelectOrder: false,
            columns: [
                { name: 'no', title: '订单编号' },
                { name: "client", title: "客户", getCellValue: row => row._embedded && row._embedded.client ? row._embedded.client.name : null },
                { name: "orderDate", title: "下单日期" },
                { name: "deliveryDate", title: "交货日期" },
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

        this.selectOrder = (async () => {
            if (this.state.orders.length == 0) {
                await axios.get(`${API_BASE_URL}/orders`)
                    .then(resp => resp.data._embedded.orders)
                    .then(j => {
                        this.setState({ orders: j });
                    })
                    .catch(e => this.showSnackbar(e.message));
            }

            this.setState({ showSelectOrder: true })
        }).bind(this)


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
            this.setState({ showSelectOrder: true })
        }).bind(this)


        this.cancelSelect = (() => {
            this.setState({ showSelectOrder: false })
        }).bind(this)


        this.changeSelection = selection => {
            let keys = Object.keys(selection)
            if (keys.length > 1) {
                let lastNo = selection[keys[keys.length - 1]]
                selection = [lastNo]
            }

            this.setState({ selection });
        }


        this.onSelectedOrder = (() => {
            const { orders, selection } = this.state;
            if (selection.length == 0) return;

            //
            let order = orders[selection[0]]

            axios.get(`${API_BASE_URL}/orders/${order.id}/items`)
                .then(resp => resp.data._embedded.orderItems)
                .then(j => {
                    this.setState({ order: order, orderItems: j, showSelectOrder: false, selection: [] })
                })
                .catch(e => this.showSnackbar(e.message));
        }).bind(this)


        this.handleQuantityChange = (e => {
            let id = e.target.id.split("_")[1]
            let item = this.state.orderItems.find(i => i.id.product == id)
            item.quantity = Number.parseFloat(e.target.value)

            this.updateOrderValue()

            this.forceUpdate();
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
        let { id } = this.props.match.params;
        if (!id) id = 0

        if (id == 0) {
            this.state.mode = MODE_ADD

            // this.state.order = null
        }
        else //if (id > 0) 
        {
            this.state.mode = MODE_VIEW

            // load clients
            axios.get(`${API_BASE_URL}/orders/${id}`)
                .then(resp => resp.data)
                .then(j => {
                    this.state.order = j
                    return j._links.items.href
                })
                .then(url => axios.get(url))
                .then(resp => resp.data._embedded.orderItems)
                .then(j => {
                    this.setState({orderItems: j })
                })
                .catch(e => this.showSnackbar(e.message));
        }

        // // load products
        // axios.get(`${API_BASE_URL}/products`)
        //     .then(resp => resp.data._embedded.products)
        //     .then(j => {
        //         this.setState({ products: j });
        //     })
        //     .catch(e => this.showSnackbar(e.message));
    }

    render() {
        const { classes, width } = this.props
        const { id } = this.props.match.params;
        const { mode, order, orderItems, orders } = this.state;
        const { showSelectOrder, columns, selection } = this.state;
        const { errors, snackbarOpen, snackbarContent } = this.state;

        // let shrinkLabel = mode === MODE_EDIT ? true : undefined;

        const { savingOrder, activeStep } = this.state;

        return (
            // <Provider store={store}>
            <React.Fragment>

                <div className={classes.contentRoot}>

                    <Toolbar className={classes.toolbar}>
                        <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton>
                        <Typography variant="title" className={classes.title}>生成BOM单</Typography>
                        <Button onClick={() => this.saveOrder()} disabled={mode === MODE_VIEW || !order} color='secondary' style={{ fontSize: 18 }} >保存BOM单<mdi.ContentSave /></Button>
                        {/* {mode === MODE_VIEW ? null :
                            } */}
                    </Toolbar>

                    {/* <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography variant="title" className={classes.subTitle} style={{ display: 'inline-flex'}}></Typography> */}
                    <Button onClick={this.selectOrder} color='primary' style={{ fontSize: 18, marginBottom: 8 }} ><mdi.ClipboardText />选择订单</Button>
                    {/* </div> */}

                    {order ? (
                        <React.Fragment>
                            <Paper className={classes.paper}>
                                <mu.Grid container direction='column' alignItems="stretch">
                                    <mu.Grid style={{ marginBottom: 16 }}>
                                        <React.Fragment>
                                            <Chip label={order._embedded.client.name} className={classes.chip} />
                                            <Chip label={order._embedded.client.fullName} className={classes.chip} />
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
                                    </mu.Grid>
                                </mu.Grid>
                            </Paper>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="title" className={classes.subTitle} style={{ flex: 1 }}>BOM</Typography>

                                {orderItems && orderItems.map(i => <BomSheet key={i.id.product} orderItem={i} />)}

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


                {/* dialog for select order */}
                <Dialog
                    open={showSelectOrder}
                    onClose={this.cancelSelect}
                    // className={classes.dialog}
                    classes={{ paper: classes.dialog }}
                >
                    <DialogTitle>选择订单</DialogTitle>
                    <DialogContent>
                        <Paper>
                            <Grid
                                rows={orders}
                                columns={columns}
                            >
                                <SelectionState
                                    selection={selection}
                                    onSelectionChange={this.changeSelection}
                                />
                                <IntegratedSelection />

                                <SortingState
                                    defaultSorting={[{ columnName: 'no', direction: 'asc' }]}
                                />
                                <IntegratedSorting />

                                <FilteringState defaultFilters={[]} />
                                <IntegratedFiltering />

                                <VirtualTable height={500} messages={{ noData: "没有数据" }} />

                                <TableHeaderRow showSortingControls />
                                <TableFilterRow />
                                <TableSelection showSelectAll={false} selectByRowClick={true} />
                            </Grid>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.cancelSelect} color="primary">取消</Button>
                        <Button disabled={selection.length > 0 ? false : true} onClick={this.onSelectedOrder} color="secondary">添加</Button>
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
            product: {},
            formula: null,

            formulas: [],
            formulaItems: [],

            showSelectFormula: false,
        }

        this.columns = [
            { name: 'revision', title: '修订版本' },
            { name: "createDate", title: "修订日期" },
            { name: "changeLog", title: "修订日志" },
            { name: "comment", title: "备注" },
        ],

            this.cancelSelect = (() => {
                this.setState({ showSelectFormula: false })
            }).bind(this)


        this.changeSelection = selection => {
            let keys = Object.keys(selection)
            if (keys.length > 1) {
                let lastNo = selection[keys[keys.length - 1]]
                selection = [lastNo]
            }

            this.setState({ selection });
        }


        this.onSelectedFormula = (() => {
            const { orderItem } = this.props
            const { formulas, selection } = this.state;
            if (selection.length == 0) return;

            //
            let formula = formulas[selection[0]]

            axios.get(`${API_BASE_URL}/formulas/${formula.id}/items`)
                .then(resp => resp.data._embedded.formulaItems)
                .then(j => {
                    let tq = 0
                    j.forEach(i => {
                        i.calc_quantity = i.quantity * orderItem.quantity
                        i.custom_quantity = i.calc_quantity = parseFloat(i.calc_quantity.toFixed(3))
                        tq += i.calc_quantity
                    })

                    formula.total_quantity = tq
                    this.setState({ formula: formula, formulaItems: j, showSelectFormula: false, })
                })
                .catch(e => this.showSnackbar(e.message));
        }).bind(this)


        this.handleQuantityChange = (e => {
            let { formula, formulaItems } = this.state

            let id = e.target.id.split("_")[1]
            let item = formulaItems.find(i => i.id.material == id)
            item.custom_quantity = Number.parseFloat(e.target.value)

            let tq = 0
            formulaItems.forEach(i => {
                tq += i.custom_quantity
            })
            formula.total_quantity = tq

            this.forceUpdate();
        }).bind(this)
    }

    componentDidMount() {
        const { orderItem } = this.props

        axios.get(`${API_BASE_URL}/products/${orderItem.id.product}`)
            .then(resp => resp.data)
            .then(j => {
                this.setState({ product: j });
                return j._links.formulas.href;
            })
            .then(url => axios.get(url))
            .then(resp => resp.data._embedded.formulas)
            .then(fs => {
                fs.forEach(i => i.createDate = i.createDate.split('.')[0].replace("T", " "))
                return fs//.sort((i, j) => j.revision - i.revision);
            })
            .then(fs => this.setState({ formulas: fs }))
            .catch(e => this.showSnackbar(e.message));
    }

    render() {
        const { classes, width } = this.props
        const { orderItem } = this.props
        const { product, formula, formulas, formulaItems } = this.state
        const { showSelectFormula, selection } = this.state

        return (
            <React.Fragment>
                <Paper className={classes.paper} style={{ marginBottom: 16 }}>
                    <Typography variant="title" className={classes.subTitle2}>产品</Typography>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Chip label={product.code} className={classes.chip} />
                        <Chip label={product.color} className={classes.chip} />
                        <Chip label={product.base} className={classes.chip} />
                        <Chip label={`${orderItem.quantity} kg`} className={classNames(classes.chip, classes.quantityChip)} />
                    </div>
                    <Divider style={{ margin: '1em 0 1em 0' }} />
                    <div>
                        <Typography variant="title" className={classes.subTitle2}>配方</Typography>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Button onClick={() => { this.setState({ showSelectFormula: true }) }} color='primary' style={{ fontSize: 18, marginRight: '2em' }} ><mdi.AutoFix />选择配方</Button>
                            {formula ? (
                                <React.Fragment>
                                    <Tooltip title='修订版本' >
                                        <Chip label={formula.revision} className={classes.chip} />
                                    </Tooltip>
                                    <Tooltip title='修订日期' >
                                        <Chip label={formula.createDate} className={classes.chip} />
                                    </Tooltip>
                                    <Tooltip title={formula.changeLog} >
                                        <Chip label='修订日志' className={classes.chip} />
                                    </Tooltip>
                                    <div style={{ flex: 1 }} />
                                    <Typography variant="title" className={classes.subTitle2} color='secondary' margin={0}>总量：{formula.total_quantity} kg</Typography>
                                </React.Fragment>
                            ) : null}
                        </div>
                    </div>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>材料编号</TableCell>
                                <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>材料名称</TableCell>
                                <TableCell style={{ width: '15%', whiteSpace: 'nowrap' }}>材料类型</TableCell>
                                <TableCell style={{ width: '15%', whiteSpace: 'nowrap' }}>配方比例</TableCell>
                                <TableCell style={{ width: '15%', whiteSpace: 'nowrap' }}>计算用量</TableCell>
                                <TableCell style={{ width: '15%', whiteSpace: 'nowrap' }}>最终用量</TableCell>
                                {/* <TableCell style={{ padding: 0, whiteSpace: 'nowrap' }}>
                            </TableCell> */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {formulaItems.map((f, no) => {
                                const { material } = f._embedded
                                // let q = f.quantity * orderItem.quantity
                                // q = parseFloat(q.toFixed(3))
                                return (
                                    <TableRow key={material.id}>
                                        <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{material.code}</TableCell>
                                        <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{material.name}</TableCell>
                                        <TableCell style={{ width: '15%', whiteSpace: 'nowrap' }}>{material.type.name}</TableCell>
                                        <TableCell numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>{f.quantity}</TableCell>
                                        <TableCell numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>{`${f.calc_quantity} kg`}</TableCell>
                                        <TableCell numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>
                                            <TextField type="number" required id={`quantity_${f.id.material}`}
                                                value={f.custom_quantity}
                                                fullWidth
                                                // error={!!errors[`item_${f.id.material}`]}
                                                inputProps={{ min: 0 }}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                                }}
                                                onChange={e => this.handleQuantityChange(e)}
                                            />
                                        </TableCell>
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

                {/* dialog for add materials */}
                <Dialog
                    open={showSelectFormula}
                    onClose={this.cancelSelect}
                    // className={classes.dialog}
                    classes={{ paper: classes.dialog }}
                >
                    <DialogTitle>选择配方</DialogTitle>
                    <DialogContent>
                        <Paper>
                            <Grid
                                rows={formulas}
                                columns={this.columns}
                            >
                                <SelectionState
                                    selection={selection}
                                    onSelectionChange={this.changeSelection}
                                />
                                <IntegratedSelection />

                                <SortingState
                                    defaultSorting={[{ columnName: 'revision', direction: 'desc' }]}
                                />
                                <IntegratedSorting />

                                <FilteringState defaultFilters={[]} />
                                <IntegratedFiltering />

                                <VirtualTable height={400} messages={{ noData: "没有数据" }} />

                                <TableHeaderRow showSortingControls />
                                <TableFilterRow />
                                <TableSelection showSelectAll={false} selectByRowClick={true} />
                            </Grid>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.cancelSelect} color="primary">取消</Button>
                        <Button onClick={this.onSelectedFormula} color="secondary">选择</Button>
                    </DialogActions>
                </Dialog>

            </React.Fragment>
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

        subTitle2: {
            fontSize: 16,
            opacity: .75,
            margin: `0 0 ${theme.spacing.unit * 1}px 0`,
            // marginLeft: 0,
            // marginBottom: ,
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
        },

        quantityChip: {
            backgroundColor: 'dodgerblue',
            fontWeight: 'bold',
            color: 'white',
        }
    },
})


BomSheet = withStyles(styles)(BomSheet);


export default withStyles(styles)(BomPage);