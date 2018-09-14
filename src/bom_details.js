// @flow

// basic
import React from 'react';
import classNames from 'classnames';
// import PropTypes from 'prop-types';
// import compose from 'recompose/compose';

// redux
import {
    createStore,
    // combineReducers, applyMiddleware
} from 'redux'
// import { Provider, connect } from 'react-redux'

// styles
import { withStyles } from '@material-ui/core';

import CommonStyles from "./common_styles";

// router
// import { withRouter } from 'react-router'
// import { Link } from 'react-router-dom'

// icons
import { ArrowLeft, ContentSave, Export, ClipboardText, AutoFix } from 'mdi-material-ui';

// ui
import { Grid as muGrid } from '@material-ui/core';
import {
    Paper, Typography, TextField, Button, IconButton,
    // MenuItem, 
    Snackbar,
    // Select, 
    Toolbar, Divider, Tooltip, Chip,
    Input, InputLabel, InputAdornment,
    // FormGroup, FormControlLabel, 
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


// import DataTableBase from "./data_table_base"
import { MODE_ADD, MODE_EDIT, MODE_VIEW } from "./common"

import { EXPORT_BASE_URL, DATA_API_BASE_URL } from "./config"
import { toFixedMass, toDateString } from "./utils"
// import { store } from "./redux"


// ====================================================
const SELECT_ORDER = 1;
const SELECT_FORMULA = 2;
const CHANGE_MATERIAL_QUANTITY = 3;
const VALID_DATA = 10;

const actionSelectOrder = (order) => {
    return {
        type: SELECT_ORDER,
        order: order,
    }
}

const actionSelectFormula = (product, formula) => {
    return {
        type: SELECT_FORMULA,
        ...{ product, formula },
    }
}

const actionChangeMaterialQuantity = (product, formula, material, quantity, calc_quantity) => {
    return {
        type: CHANGE_MATERIAL_QUANTITY,
        ...{ product, formula, material, quantity, calc_quantity },
    }
}

const actionValidData = (errors) => {
    return {
        type: VALID_DATA,
        errors,
    }
}

const initState = {
    order: null, // order.id
    boms: [], // { product.id, formula.id, [{ material.id, quantity }] }
    errors: null // {} errors object
}

function bomReducer(state = initState, action) {
    let newState = { ...state }

    switch (action.type) {
        case SELECT_ORDER:
            newState.order = action.order;
            break;

        case SELECT_FORMULA: {
            let { product, formula } = action

            newState.boms = newState.boms.filter(i => i.product !== product)
            // let bi = newState.bomItems.find(i => i.product == product && i.formula == formula)
            // if (!bi) 
            newState.boms.push({ product, formula, materials: [] })
            break;
        }

        case CHANGE_MATERIAL_QUANTITY: {
            let { product, formula, material, quantity, calc_quantity } = action
            let bi = newState.boms.find(i => i.product === product && i.formula === formula)
            if (bi) {
                let mi = bi.materials.find(m => m.material === material)
                if (mi)
                    mi.quantity = quantity
                else {
                    // if (calc_quantity)
                    bi.materials.push({ material, quantity, calc_quantity })
                    // else
                    //     bi.materials.push({ material, quantity })
                }
            }

            break;
        }

        case VALID_DATA: {
            newState.errors = action.errors
            break;
        }

        default:
            break
    }

    return newState;
}

const store = createStore(bomReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())


// ====================================================
const savingSteps = ['检查数据', '保存BOM', "完成"]

// =============================================
class BomDetailsPage extends React.PureComponent {
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
            showSavingBom: false,
            activeStep: 0,

            // errors
            errors: {},

            //
            snackbarOpen: false,
            snackbarContent: "",
        }


        // =============================================
        this.onRedux = (() => {
            const { errors } = store.getState()
            this.state.errors = {}

            if (errors && errors.order) {
                this.state.errors = errors
            }

            this.forceUpdate()
        })


        // 显示 订单选择对话框
        this.selectOrder = (async () => {
            if (this.state.orders.length === 0) {
                await axios.get(`${DATA_API_BASE_URL}/orders/search/findByStatusEquals?status=0`)
                    .then(resp => resp.data._embedded.orders)
                    .then(j => {
                        this.setState({ orders: j });
                    })
                    .catch(e => this.showSnackbar(e.message));
            }

            store.dispatch(actionValidData({}))
            this.setState({ showSelectOrder: true })
        })


        // 取消显示 订单选择对话框
        this.cancelSelect = (() => {
            this.setState({ showSelectOrder: false })
        })


        // 订单选择发送变化 （在 订单选择对话框 内）
        this.changeSelection = selection => {
            let keys = Object.keys(selection)
            if (keys.length > 1) {
                let lastNo = selection[keys[keys.length - 1]]
                selection = [lastNo]
            }

            this.setState({ selection });
        }


        // 确定了 订单选择
        this.onSelectedOrder = (() => {
            const { orders, selection } = this.state;
            if (selection.length === 0) return;

            //
            let order = orders[selection[0]]

            axios.get(`${DATA_API_BASE_URL}/orders/${order.id}/items`)
                .then(resp => resp.data._embedded.orderItems)
                .then(j => {
                    this.setState({ order: order, orderItems: j, showSelectOrder: false, selection: [] })

                    store.dispatch(actionSelectOrder(order.id))
                })
                .catch(e => this.showSnackbar(e.message));
        })


        //
        this.cancelSave = () => this.setState({ showSavingBom: false, activeStep: 0 })

        this.onSaveSuccess = (() => {
            this.setState({ showSavingBom: false, activeStep: 0 })
            this.props.history.goBack();
        })


        this.saveBom = (async () => {
            //
            this.setState({ showSavingBom: true, activeStep: 0 })
            this.forceUpdate()

            //
            let cancel = false;

            let errors = {};
            store.dispatch(actionValidData(errors))


            // ========================================================
            // step 1
            this.setState({ activeStep: 0 })

            const { boms } = store.getState()
            let { order, orderItems } = this.state

            if (!order || !order.no || order.no === "")
                errors['order'] = "无效的订单"
            else {
                if (!orderItems || orderItems.length <= 0) {
                    errors['order'] = "订单中没有产品明细"
                } else {
                    orderItems.forEach(oi => {
                        // product id
                        const pid = oi.id.product

                        // find bom from redux store
                        const bi = boms.find(bi => bi.product === pid)

                        if (!bi)
                            errors[`formula_${pid}`] = "未选择配方"
                        else if (bi.length <= 0)
                            errors[`formula_${pid}`] = "配方为空"
                        else {
                            bi.materials.forEach(mi => {
                                if (!mi.quantity || mi.quantity <= 0) {
                                    errors[`material_${pid}_${mi.material}`] = "无效的材料数量"
                                }
                            })
                        }
                    })
                }
            }

            if (Object.keys(errors).length > 0) {

                store.dispatch(actionValidData(errors))

                this.setState({
                    showSavingBom: false, errors: errors, snackbarOpen: true,
                    snackbarContent: "发现错误，请检查数据输入"
                })
                return;
            }


            // ========================================================
            // step 2
            this.setState({ activeStep: this.state.activeStep + 1 })

            boms.forEach(bi => {

                let bom = {
                    "formula": {
                        "id": bi.formula,
                    },
                    "orderItem": {
                        "id": {
                            "order": order.id,
                            "product": bi.product
                        },
                        "order": {
                            "id": 0
                        },
                        "product": {
                            "id": 0
                        }
                    }
                }

                axios.post(`${DATA_API_BASE_URL}/boms`, bom)
                    .then(resp => resp.data)
                    .then(j => {
                        bom.id = j.id
                        return j.id
                    })
                    .then(bid => {
                        const { materials } = bi
                        materials.forEach(m => {

                            let bi = {
                                "id": { "bom": 0, "material": 0 },
                                "bom": { "id": bid },
                                "material": { "id": m.material },
                                "quantity": m.quantity,
                                "calcQuantity": m.calc_quantity
                            }

                            axios.post(`${DATA_API_BASE_URL}/bomItems`, bi)
                        })
                    })
                    .catch(e => {
                        cancel = true;
                        this.setState({
                            showSavingBom: false, snackbarOpen: true,
                            snackbarContent: e.message
                        })
                    })
            })

            if (cancel) return;


            // ========================================================
            // done
            this.setState({ activeStep: this.state.activeStep + 1 })

        })
    }

    showSnackbar(msg: String) {
        this.setState({ snackbarOpen: true, snackbarContent: msg });
    }

    componentDidMount() {
        let { mode, id } = this.props.match.params;
        if (!id) id = 0

        // if ((mode == MODE_EDIT || mode == MODE_VIEW) && id > 0) {
        //     this.state.mode = mode

        //     // load order
        //     axios.get(`${DATA_API_BASE_URL}/orders/${id}`)
        //         .then(resp => resp.data)
        //         .then(j => {
        //             this.state.order = j
        //             return j._links.items.href
        //         })
        //         .then(url => axios.get(url))
        //         .then(resp => resp.data._embedded.orderItems)
        //         .then(j => {
        //             this.setState({ orderItems: j })
        //         })
        //         .catch(e => this.showSnackbar(e.message));
        // }
        // else
        // {
        //     this.setState({mode})
        // }
        this.setState({ mode })

        if (id > 0) {
            axios.get(`${DATA_API_BASE_URL}/orders/${id}`)
                .then(resp => resp.data)
                .then(j => {
                    this.state.order = j
                    return `${j._links.self.href}/items`
                })
                .then(url => axios.get(url))
                .then(resp => resp.data._embedded.orderItems)
                .then(j => {
                    this.setState({ orderItems: j })
                })
                .catch(e => this.showSnackbar(e.message));
        }


        //
        this.state.reduxSubscribe = store.subscribe(this.onRedux)

        // // load products
        // axios.get(`${API_BASE_URL}/products`)
        //     .then(resp => resp.data._embedded.products)
        //     .then(j => {
        //         this.setState({ products: j });
        //     })
        //     .catch(e => this.showSnackbar(e.message));
    }

    componentWillUnmount() {
        this.state.reduxSubscribe()
    }


    render() {
        const { classes, } = this.props
        const orderId = this.props.match.params.id;
        const { mode, order, orderItems, orders } = this.state;
        const { showSelectOrder, columns, selection } = this.state;
        const { errors, snackbarOpen, snackbarContent } = this.state;

        // let shrinkLabel = mode === MODE_EDIT ? true : undefined;
        let title = '生成BOM单'
        if (mode === MODE_VIEW)
            title = '查看BOM单'
        else if (mode === MODE_EDIT)
            title = '编辑BOM单'

        const { showSavingBom, activeStep } = this.state;

        return (
            // <Provider store={store}>
            <React.Fragment>

                <div className={classes.contentRoot}>

                    <Toolbar className={classes.toolbar}>
                        <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                        <Typography variant="title" className={classes.title}>{title}</Typography>
                        <Button onClick={() => this.saveBom()} disabled={mode === MODE_VIEW || !order} color='secondary' style={{ fontSize: 18 }} >保存BOM单<ContentSave /></Button>

                        {
                            mode === MODE_ADD ? null :
                                <Button href={`${EXPORT_BASE_URL}/boms/${orderId}`} color='primary' style={{ fontSize: 18 }} ><Export />导出</Button>
                        }
                    </Toolbar>

                    <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                        <Button onClick={this.selectOrder} color='primary' style={{ fontSize: 18 }}
                            disabled={mode === MODE_VIEW}><ClipboardText />选择订单</Button>
                        <Typography className={classes.error} style={{ marginLeft: '1em' }}>{errors.order}</Typography>
                    </div>

                    {order ? (
                        <React.Fragment>
                            <Paper className={classes.paper}>
                                <muGrid container direction='column' alignItems="stretch">
                                    <muGrid style={{ marginBottom: 16 }}>
                                        <React.Fragment>
                                            <Chip label={order._embedded.client.name} className={classes.chip} />
                                            <Chip label={order._embedded.client.fullName} className={classes.chip} />
                                        </React.Fragment>
                                    </muGrid>
                                    <muGrid>
                                        <FormControl disabled aria-describedby="no-error-text">
                                            <InputLabel htmlFor="no" shrink={true}>订单编号</InputLabel>
                                            <Input id="no"
                                                value={order.no}
                                            />
                                            <FormHelperText id="no-error-text">{errors.revision}</FormHelperText>
                                        </FormControl>
                                    </muGrid>

                                    <muGrid>
                                        <TextField type="date" disabled id="orderDate"
                                            label="下单日期"
                                            value={order.orderDate ? toDateString(order.orderDate) : ""}
                                            margin="normal"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />

                                        <TextField type="date" disabled id="deliveryDate"
                                            label="发货日期"
                                            style={{ marginLeft: 32 }}
                                            value={order.deliveryDate ? toDateString(order.deliveryDate) : ""}
                                            margin="normal"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </muGrid>
                                    <muGrid>
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
                                    </muGrid>
                                </muGrid>
                            </Paper>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="title" className={classes.subTitle} style={{ flex: 1 }}>BOM</Typography>

                                {orderItems && orderItems.map(i => <BomSheet key={i.id.product} orderItem={i} mode={mode} />)}

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
                    ContentProps={{
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


                {/* dialog for save bom */}
                <Dialog
                    open={showSavingBom}
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

class BomSheet extends React.PureComponent {

    constructor(props) {
        super(props)

        this.state = {
            product: {},
            formula: null, // formula for current select formula
            formulaItems: [], // formula items plus extra custom_quantity

            formulas: [],

            showSelectFormula: false,
        }

        this.columns = [
            { name: 'revision', title: '修订版本' },
            { name: "createDate", title: "修订日期" },
            { name: "changeLog", title: "修订日志" },
            { name: "comment", title: "备注" },
        ]


        // ============================================================
        // redux, manually subsiribe for now, try to use connect() next
        this.onRedux = (() => {
            const { product } = this.props.orderItem.id
            const { errors } = store.getState()

            this.state.errors = {}

            let e = {}
            if (errors) {
                const keys = Object.keys(errors)

                keys.filter(k => k === `formula_${product}`)
                    .forEach(k => {
                        e.formula = errors[k]
                    })

                keys.filter(k => k.startsWith(`material_${product}`))
                    .forEach(k => {
                        let mi = k.split("_")[2]
                        e[`material_${mi}`] = errors[k]
                    })

                this.state.errors = e
            }

            this.forceUpdate()
        })

        //
        this.cancelSelect = (() => {
            this.setState({ showSelectFormula: false })
        })


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
            if (selection.length === 0) return;

            //
            let formula = formulas[selection[0]]
            store.dispatch(actionSelectFormula(orderItem.id.product, formula.id))

            axios.get(`${DATA_API_BASE_URL}/formulas/${formula.id}/items`)
                .then(resp => resp.data._embedded.formulaItems)
                .then(j => {
                    let tq = 0
                    j.forEach(i => {
                        i.calc_quantity = i.quantity * orderItem.quantity
                        i.custom_quantity = i.calc_quantity = parseFloat(i.calc_quantity.toFixed(3))
                        tq += i.calc_quantity

                        store.dispatch(actionChangeMaterialQuantity(orderItem.id.product, i.id.formula, i.id.material, i.calc_quantity, i.calc_quantity))
                    })

                    formula.total_quantity = tq
                    this.setState({ formula: formula, formulaItems: j, showSelectFormula: false, })
                })
                .catch(e => this.showSnackbar(e.message));
        })


        this.updateMaterialQuantity = ((mid, quantity, calcQuantity) => {
            const { orderItem } = this.props
            let { formula, formulaItems } = this.state

            let item = formulaItems.find(i => i.id.material === mid)
            item.custom_quantity = quantity

            store.dispatch(actionChangeMaterialQuantity(orderItem.id.product, item.id.formula, item.id.material, item.custom_quantity, calcQuantity))

            //
            let tq = 0
            formulaItems.forEach(i => {
                tq += i.custom_quantity
            })
            formula.total_quantity = parseFloat(tq.toFixed(3))

            this.forceUpdate();
        })

        this.handleQuantityChange = (e => {
            const mid = e.target.id.split("_")[1]
            const value = Number.parseFloat(e.target.value)

            this.updateMaterialQuantity(mid, value)
        })
    }

    componentDidMount() {
        const { orderItem } = this.props

        this.state.reduxSubscribe = store.subscribe(this.onRedux)

        axios.get(`${DATA_API_BASE_URL}/products/${orderItem.id.product}`)
            .then(resp => resp.data)
            .then(j => {
                this.setState({ product: j });
                return j._links.formulas.href;
            })
            .then(url => axios.get(url))
            .then(resp => resp.data._embedded.formulas)
            .then(fs => {
                fs.forEach(i => i.createDate = i.createDate.split('.')[0].replace("T", " "))
                this.setState({ formulas: fs })
                return orderItem
            })
            .then(oi => axios.get(`${DATA_API_BASE_URL}/orderItems/${oi.id.order}_${oi.id.product}`))
            .then(resp => resp.data._embedded ? resp.data._embedded.bom : null)
            .then(bom => {
                if (!bom) return

                bom.formula.createDate = bom.formula.createDate.split('.')[0].replace("T", " ")
                this.state.formula = bom.formula
                store.dispatch(actionSelectFormula(bom.orderItem.id.product, bom.formula.id))

                axios.get(`${DATA_API_BASE_URL}/formulas/${bom.formula.id}/items`)
                    .then(resp => resp.data._embedded.formulaItems)
                    .then(formulaItems => {
                        this.state.formulaItems = formulaItems

                        return axios.get(`${DATA_API_BASE_URL}/boms/${bom.id}/items`)
                    })
                    .then(resp => resp.data._embedded.bomItems)
                    .then(bomItems => {
                        bomItems.forEach(bi => {
                            let fi = this.state.formulaItems.find(fi => fi.id.material === bi.id.material)
                            if (fi) {
                                fi.calc_quantity = bi.calcQuantity
                                // fi.custom_quantity = bi.quantity

                                this.updateMaterialQuantity(bi.id.material, bi.quantity, bi.calcQuantity)
                            }
                        })

                        this.forceUpdate()
                    })
            })
            .catch(e => this.showSnackbar(e.message));
    }

    componentWillUnmount() {
        this.state.reduxSubscribe()
    }


    showSnackbar(msg: String) {
        this.setState({ snackbarOpen: true, snackbarContent: msg });
    }

    render() {
        const { classes, } = this.props
        const { orderItem, mode } = this.props
        const { product, formula, formulas, formulaItems } = this.state
        const { showSelectFormula, selection } = this.state
        const { errors, snackbarOpen, snackbarContent } = this.state;

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
                            <Button onClick={() => { this.setState({ showSelectFormula: true }) }} color='primary' style={{ fontSize: 18, marginRight: '2em' }} disabled={mode === MODE_VIEW}><AutoFix />选择配方</Button>
                            {formula ? (
                                <React.Fragment>
                                    <Tooltip title='修订版本' >
                                        <Chip label={formula.revision} className={classes.chip} />
                                    </Tooltip>
                                    <Tooltip title='修订日期' >
                                        <Chip label={formula.createDate} className={classes.chip} />
                                    </Tooltip>
                                    {formula.changeLog ?
                                        <Tooltip title={formula.changeLog} >
                                            <Chip label='修订日志' className={classes.chip} />
                                        </Tooltip>
                                        : null}
                                    <div style={{ flex: 1 }} />
                                    <Typography variant="title" className={classes.subTitle2} color='secondary' margin={0}>总量：{formula.total_quantity ? toFixedMass(formula.total_quantity) : '--'} kg</Typography>
                                </React.Fragment>
                            ) : (errors && errors.formula ? <Typography className={classes.error}>{errors.formula}</Typography>
                                : null)}
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
                                                disabled={mode === MODE_VIEW}
                                                value={f.custom_quantity ? toFixedMass(f.custom_quantity) : null}
                                                fullWidth
                                                error={errors && errors[`material_${f.id.material}`]}
                                                InputProps={{
                                                    min: 0,
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

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    autoHideDuration={3000}
                    open={snackbarOpen}
                    onClose={() => this.setState({ snackbarOpen: false })}
                    // ContentProps={{
                    //     'aria-describedby': 'message-id',
                    // }}
                    message={<span id="message-id">{snackbarContent}</span>}
                />

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

// const mapStateToBomPageProps = (state) => {
//     return { ...state }
// }

// const mapStateToBomSheetProps = (state, ownProps) => {
//     let errors = null
//     const { product } = ownProps.orderItem.id

//     if (state.errors) {
//         const keys = Object.keys(state.errors)

//         keys.filter(k => k == `formula_${product}` || k.startsWith(`material_${product}`))
//             .forEach(k => {
//                 errors[k] = state.errors[k]
//             })
//     }

//     return { errors }
// }

// const mapDispatchToProps = (dispatch) => {
//     return { dispatch }
// }

const styles = theme => ({
    ...CommonStyles(theme),
    ...{
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

export default withStyles(styles)(BomDetailsPage);

// BomSheet = compose(connect(mapStateToBomSheetProps, mapDispatchToProps), withStyles(styles))(BomSheet);

// export default compose(connect(mapStateToBomPageProps, mapDispatchToProps), withStyles(styles))(BomDetailsPage);