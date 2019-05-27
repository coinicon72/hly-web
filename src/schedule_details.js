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
import { ArrowLeft, ContentSave, AutoFix } from 'mdi-material-ui';
// import * as mui from '@material-ui/icons';

// ui
import {
    Grid as MuGrid,
    Paper, Typography, TextField, Button, IconButton,
    // MenuItem, 
    // Snackbar,
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

//
import { connect } from 'react-redux'
import { actionShowSnackbar } from "./redux/data_selection"


// import DataTableBase from "./data_table_base"
import { MODE_ADD, MODE_EDIT, MODE_VIEW } from "./common"

import { EXPORT_BASE_URL, DATA_API_BASE_URL } from "./config"
import { toFixedMass, toDateString, getTodayString } from "./utils"
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

const actionSelectFormula = (productId, formulaId) => {
    return {
        type: SELECT_FORMULA,
        ...{ productId, formulaId },
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
    boms: [], // {id: {order: 1, product: 1}, formula: 2, materials: []} { product.id, formula.id, [{ material.id, quantity }] }
    errors: null // {} errors object
}

function bomReducer(state = initState, action) {
    let newState = { ...state }

    switch (action.type) {
        case SELECT_ORDER:
            newState.order = action.order;
            break;

        case SELECT_FORMULA: {
            let { productId, formulaId } = action

            newState.boms = newState.boms.filter(i => i.product !== productId)
            // let bi = newState.bomItems.find(i => i.product == product && i.formula == formula)
            // if (!bi) 
            newState.boms.push({ product: productId, formula: formulaId, materials: [] })
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

const savingSteps = ['检查数据', '保存排产', '保存BOM', "完成"]

// =============================================
class SchedulePage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            mode: MODE_VIEW,

            order: null,
            orderItem: null, // { id: { product: p.id, order: this.state.order.id }, quantity: 0, price: 0 }
            // client: null,

            schedule: {},

            // orders: [],

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
        }


        // =============================================
        this.onRedux = () => {
            const { errors } = store.getState()
            this.state.errors = {}

            if (errors && errors.order) {
                this.state.errors = errors
            }

            this.forceUpdate()
        }


        // 显示 订单选择对话框
        this.selectOrder = (async () => {
            if (this.state.orders.length === 0) {
                await axios.get(`${DATA_API_BASE_URL}/orders/search/findByStatusEquals?status=0`)
                    .then(resp => resp.data._embedded.orders)
                    .then(j => {
                        this.setState({ orders: j });
                    })
                    .catch(e => this.props.showSnackbar(e.message));
            }

            store.dispatch(actionValidData({}))
            this.setState({ showSelectOrder: true })
        })


        // 取消显示 订单选择对话框
        this.cancelSelect = () => {
            this.setState({ showSelectOrder: false })
        }


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
        this.onSelectedOrder = () => {
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
                .catch(e => this.props.showSnackbar(e.message));
        }


        //
        this.cancelSave = () => this.setState({ showSavingBom: false, activeStep: 0 })

        this.onSaveSuccess = () => {
            this.setState({ showSavingBom: false, activeStep: 0 })
            this.props.history.goBack();
        }


        this.saveBom = async () => {
            //
            this.setState({ showSavingBom: true, activeStep: 0 })
            this.forceUpdate()

            //
            let cancel = false;

            let errors = {};
            store.dispatch(actionValidData(errors))


            // ========================================================
            // step 1
            let activeStep = 0
            this.setState({ activeStep })

            const { boms } = store.getState()
            let { order, orderItem } = this.state
            let { schedule } = this.state

            if (!order || !order.no || order.no === "")
                errors['order'] = "无效的订单"
            else {
                if (!orderItem) {
                    errors['order'] = "没有选择产品"
                } else {
                    const pid = orderItem.id.product

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
                }
            }

            if (!schedule || !schedule.scheduleDate) {
                errors[`scheduleDate`] = "未设置计划日期"
            }

            if (Object.keys(errors).length > 0) {

                store.dispatch(actionValidData(errors))

                this.setState({ showSavingBom: false, errors })
                this.props.showSnackbar("发现错误，请检查数据输入")
                return;
            }


            // ========================================================
            // step 2
            activeStep++
            this.setState({ activeStep })
            // this.state.activeStep += 1
            // this.forceUpdate()

            // if (!schedule.id) {
            const { id } = this.props.match.params;
            const oid = Number.parseInt(id.split('_')[0])
            const pid = Number.parseInt(id.split('_')[1])

            // { "id": { "order": 2, "product": 2 }, "order": { "id": 2 }, "product": { "id": 2 }, "scheduleDate": "2018-08-24" }
            schedule.id = { order: oid, product: pid }
            schedule.order = { id: oid }
            schedule.product = { id: pid }
            // }

            axios.post(`${DATA_API_BASE_URL}/producingSchedules`, schedule)
                .then(_ => axios.patch(`${DATA_API_BASE_URL}/orders/${schedule.order.id}`, { status: 1 }))
                .catch(e => {
                    cancel = true;
                    this.setState({
                        showSavingBom: false,
                    })
                    this.props.showSnackbar(e.message)
                })

            if (cancel) return;


            // ========================================================
            // step 3
            activeStep++
            this.setState({ activeStep })
            // this.state.activeStep += 1
            // this.forceUpdate()

            boms.forEach(bi => {

                let bom = {
                    "formula": {
                        "id": bi.formula,
                    },
                    "id": {
                        "order": order.id,
                        "product": bi.product
                    },
                    "order": {
                        "id": order.id
                    },
                    "product": {
                        "id": bi.product
                    }
                }

                let action = null;
                if (bi.id) {
                    // bom exists, 
                    if (bi.formula === orderItem._embedded.bom.formula.id)
                        action = new Promise((resolve, reject) => resolve(bi.id))
                    else
                        // formula changed
                        action = axios.delete(`${DATA_API_BASE_URL}/boms/${bi.id.order}_${bi.id.product}`)
                            .then(_ =>
                                axios.post(`${DATA_API_BASE_URL}/boms`, bom)
                                    .then(resp => resp.data)
                                    .then(j => {
                                        // bom.id = j.id
                                        return j.id
                                    })
                            )
                } else
                    action = axios.post(`${DATA_API_BASE_URL}/boms`, bom)
                        .then(resp => resp.data)
                        .then(j => {
                            // bom.id = j.id
                            return j.id
                        })

                action.then(bid => {
                    const { materials } = bi
                    materials.forEach(m => {

                        let bi = {
                            "id": { "order": bid.order, 'product': bid.product, "material": m.material },
                            "order": { "id": bid.order },
                            'product': { 'id': bid.product },
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
                            showSavingBom: false,
                            // snackbarOpen: true,
                            // snackbarContent: e.message
                        })
                        this.props.showSnackbar(e.message)
                    })
            })

            if (cancel) return;


            // ========================================================
            // done
            activeStep++
            this.setState({ activeStep })
            // this.state.activeStep += 1
            // this.forceUpdate()
        }
    }

    componentDidMount() {
        let { mode, id } = this.props.match.params;

        if (id) {
            // const oid = Number.parseInt(id.split('_')[0])
            // const pid = Number.parseInt(id.split('_')[1])
            axios.get(`${DATA_API_BASE_URL}/orderItems/${id}`)
                .then(resp => resp.data)
                .then(orderItem => {
                    // this.setState({ orderItem })
                    this.state.orderItem = orderItem
                })

                .then(_ => axios.get(`${DATA_API_BASE_URL}/orderItems/${id}/product`))
                .then(resp => resp.data)
                .then(product => {
                    this.setState({ orderItem: { ...this.state.orderItem, product } })
                })
                // .catch(e => this.props.showSnackbar(e.message))

                .then(_ => axios.get(`${DATA_API_BASE_URL}/orderItems/${id}/order`))
                .then(resp => resp.data)
                .then(order => {
                    this.setState({ order })
                })
                .catch(e => this.props.showSnackbar(e.message))

                .then(_ =>
                    axios.get(`${DATA_API_BASE_URL}/producingSchedules/${id}`)
                )
                .then(resp => resp.data)
                .then(schedule => {
                    this.setState({
                        schedule, mode: MODE_EDIT,
                        // order: schedule._embedded.orderItem.order, 
                        // orderItem: schedule._embedded.orderItem,
                        bom: schedule._embedded.bom,
                        formula: schedule._embedded.bom ? schedule._embedded.bom.formula : null,
                    })
                })

                .catch(e => {
                    if (e.response && e.response.status === 404)
                        this.setState({ mode: MODE_ADD })
                    else
                        this.props.showSnackbar(e.message)
                })
        }


        //
        this.state.reduxSubscribe = store.subscribe(this.onRedux)

        // // load products
        // axios.get(`${API_BASE_URL}/products`)
        //     .then(resp => resp.data._embedded.products)
        //     .then(j => {
        //         this.setState({ products: j });
        //     })
        //     .catch(e => this.props.showSnackbar(e.message));
    }

    componentWillUnmount() {
        this.state.reduxSubscribe()
    }


    render() {
        const { classes, } = this.props
        const orderId = this.props.match.params.id;
        const { mode, order, orderItem, schedule, formula, bom } = this.state;
        const { showSelectOrder, columns, selection } = this.state;
        const { errors } = this.state;

        // let shrinkLabel = mode === MODE_EDIT ? true : undefined;
        let title = '排产计划'
        // if (schedule === MODE_VIEW)
        //     title = '查看排产计划'
        // else if (mode === MODE_EDIT)
        //     title = '编辑排产计划'

        const { showSavingBom, activeStep } = this.state;

        return (
            // <Provider store={store}>
            <React.Fragment>

                <div className={classes.contentRoot}>

                    <Toolbar className={classes.toolbar}>
                        <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                        <Typography variant="title" className={classes.title}>{title}</Typography>
                        <Button onClick={() => this.saveBom()} disabled={Object.keys(schedule).length === 0 || store.getState().boms.length === 0} color='secondary' style={{ fontSize: 18 }} >保存排产<ContentSave /></Button>

                        {/* {
                            mode === MODE_ADD ? null :
                                <Button href={`${EXPORT_BASE_URL}/boms/${orderId}`} color='primary' style={{ fontSize: 18 }} ><Export />导出</Button>
                        } */}
                    </Toolbar>

                    {/* <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                        <Button onClick={this.selectOrder} color='primary' style={{ fontSize: 18 }}
                            disabled={mode === MODE_VIEW}><ClipboardText />选择订单</Button>
                        <Typography className={classes.error} style={{ marginleft: '1em' }}>{errors.order}</Typography>
                    </div> */}

                    {order ? (
                        <React.Fragment>
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
                                            <InputLabel htmlFor="no" shrink={true}>订单编号</InputLabel>
                                            <Input id="no"
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

                                        <TextField type="date" disabled id="deliveryDate"
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

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="title" className={classes.subTitle} style={{ flex: 1 }}>排产</Typography>

                                <Paper className={classes.paper}>
                                    <MuGrid container direction='column' alignItems="stretch">

                                        <MuGrid>
                                            <TextField type="date" id="scheduleDate"
                                                required
                                                label="计划生产日期"
                                                value={schedule.scheduleDate ? toDateString(schedule.scheduleDate) : ""}
                                                onChange={e => {
                                                    schedule.scheduleDate = e.target.value
                                                    this.setState({ schedule: { ...schedule } })
                                                }}
                                                error={!!errors['scheduleDate']}
                                                margin="normal"
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                inputProps={{
                                                    min: mode === MODE_VIEW ? null : getTodayString()
                                                }}
                                            />

                                            <TextField type="date" id="producingDate"
                                                label="实际生产日期"
                                                style={{ marginLeft: 32 }}
                                                value={schedule.producingDate ? toDateString(schedule.producingDate) : ""}
                                                onChange={e => {
                                                    schedule.producingDate = e.target.value
                                                    this.setState({ schedule: { ...schedule } })
                                                }}
                                                margin="normal"
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                inputProps={{
                                                    min: mode === MODE_VIEW ? null : getTodayString()
                                                }}
                                            />
                                        </MuGrid>

                                        <MuGrid>
                                            <TextField id="line" label="生产线"
                                                value={schedule.line}
                                                onChange={e => {
                                                    schedule.line = e.target.value
                                                    this.setState({ schedule: { ...schedule } })
                                                }}
                                                className={classes.textFieldWithoutWidth}
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

                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="title" className={classes.subTitle} style={{ flex: 1 }}>产品</Typography>

                                {orderItem && <BomSheet key={orderItem.id.product}
                                    mode={MODE_EDIT}
                                    orderItem={orderItem}
                                    product={orderItem.product}
                                    formula={formula}
                                    bom={bom}
                                />}

                            </div>
                        </React.Fragment>
                    ) : null}
                </div>


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
        this.onRedux = () => {
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
        }

        //
        this.cancelSelect = () => {
            this.setState({ showSelectFormula: false })
        }


        this.changeSelection = selection => {
            let keys = Object.keys(selection)
            if (keys.length > 1) {
                let lastNo = selection[keys[keys.length - 1]]
                selection = [lastNo]
            }

            this.setState({ selection });
        }


        this.onSelectedFormula = () => {
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
                .catch(e => this.props.showSnackbar(e.message));
        }


        this.updateMaterialQuantity = (mid, quantity, calcQuantity) => {
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
        }

        this.handleQuantityChange = e => {
            const mid = Number.parseInt(e.target.id.split("_")[1])
            const value = Number.parseFloat(e.target.value)

            this.updateMaterialQuantity(mid, value)
        }
    }

    componentDidMount() {
        const { orderItem, formula, bom, product } = this.props
        this.setState({ formula, product })

        this.state.reduxSubscribe = store.subscribe(this.onRedux)

        // axios.get(`${DATA_API_BASE_URL}/products/${orderItem.id.product}`)
        //     .then(resp => resp.data)
        //     .then(j => {
        //         this.setState({ product: j });
        //         return j._links.formulas.href;
        //     })
        //     .then(url => axios.get(url))
        axios.get(`${DATA_API_BASE_URL}/products/${product.id}/formulas`)
            .then(resp => resp.data._embedded.formulas)
            .then(fs => {
                fs.forEach(i => i.createDate = toDateString(i.createDate)); //i.createDate.split('.')[0].replace("T", " "))
                this.setState({ formulas: fs })

                return bom //orderItem
            })
            // .then(oi => axios.get(`${DATA_API_BASE_URL}/orderItems/${oi.id.order}_${oi.id.product}`))
            // .then(resp => resp.data._embedded ? resp.data._embedded.bom : null)
            .then(bom => {
                if (!bom) return

                this.loadBom(bom);
            })
            .catch(e => this.props.showSnackbar(e.message));
    }

    loadBom(bom) {
        bom.formula.createDate = toDateString(bom.formula.createDate); //bom.formula.createDate.split('.')[0].replace("T", " ")
        // this.state.formula = bom.formula
        store.dispatch(actionSelectFormula(bom.id.product, bom.formula.id));
        
        axios.get(`${DATA_API_BASE_URL}/formulas/${bom.formula.id}/items`)
            .then(resp => resp.data._embedded.formulaItems)
            .then(formulaItems => {
                this.state.formulaItems = formulaItems;
                return axios.get(`${DATA_API_BASE_URL}/boms/${bom.id.order}_${bom.id.product}/items`);
            })
            .then(resp => resp.data._embedded.bomItems)
            .then(bomItems => {
                bomItems.forEach(bi => {
                    let fi = this.state.formulaItems.find(fi => fi.id.material === bi.id.material);
                    if (fi) {
                        fi.calc_quantity = bi.calcQuantity;
                        // fi.custom_quantity = bi.quantity
                        this.updateMaterialQuantity(bi.id.material, bi.quantity, bi.calcQuantity);
                    }
                });
                this.forceUpdate();
            });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { formula, bom } = this.props
        if (formula)
            this.setState({ formula })

        if (!prevProps.bom && bom)
            this.loadBom(bom)
    }

    componentWillUnmount() {
        this.state.reduxSubscribe()
    }

    render() {
        const { classes, } = this.props
        const { orderItem, mode } = this.props
        const { product, formula, formulas, formulaItems } = this.state
        const { showSelectFormula, selection } = this.state
        const { errors } = this.state;

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
                                        <TableCell align="right" style={{ width: '15%', whiteSpace: 'nowrap' }}>{f.quantity}</TableCell>
                                        <TableCell align="right" style={{ width: '15%', whiteSpace: 'nowrap' }}>{`${f.calc_quantity} kg`}</TableCell>
                                        <TableCell align="right" style={{ width: '15%', whiteSpace: 'nowrap' }}>
                                            <TextField type="number" required id={`quantity_${f.id.material}`}
                                                disabled={mode === MODE_VIEW}
                                                value={f.custom_quantity ? toFixedMass(f.custom_quantity) : null}
                                                fullWidth
                                                error={errors && errors[`material_${f.id.material}`]}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                                }}
                                                inputProps={{ min: 0, }}
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
            // marginleft: 0,
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


// const mapStateToProps = state => ({
//     user: state.main.user,
// })

BomSheet = withStyles(styles)(BomSheet);

const mapDispatchToProps = dispatch => ({
    showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
})

BomSheet = connect(
    // mapStateToProps,
    null,
    mapDispatchToProps
)(BomSheet)

const ConnectedSchedulePage = connect(
    // mapStateToProps,
    null,
    mapDispatchToProps
)(SchedulePage)

export default withStyles(styles)(ConnectedSchedulePage);

// BomSheet = compose(connect(mapStateToBomSheetProps, mapDispatchToProps), withStyles(styles))(BomSheet);

// export default compose(connect(mapStateToBomPageProps, mapDispatchToProps), withStyles(styles))(BomDetailsPage);