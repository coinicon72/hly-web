// @flow

// basic
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

// styles
import { withStyles } from 'material-ui';

import CommonStyles from "./common_styles";

// redux
// import connect from 'react-redux/lib/connect/connect';

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
import { FormGroup, FormControlLabel, FormControl, FormHelperText } from 'material-ui';
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
    DataTypeProvider,
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

import { TYPE_STOCK_IN, TYPE_STOCK_OUT, TYPE_STOCK_IN_OUT, MODE_ADD, MODE_EDIT, MODE_VIEW, API_BASE_URL, DATA_API_BASE_URL } from "./config"

// import { store } from "./redux"
import { toFixedMoney } from "./utils"
import { COLOR_STOCK_IN, COLOR_STOCK_OUT } from "./common_styles"
import { CurrencyTypeProvider } from "./common_components"

// const TYPE_STOCK_IN = "in";
// const TYPE_STOCK_OUT = "out";

// const MODE_ADD = "add";
// const MODE_EDIT = "edit";
// const MODE_VIEW = "view";

const APPLY_CHANGING_COUNTDOWN = 5

const savingSteps = ['检查输入数据', '保存基本信息', "保存明细", "完成"];

const PREVIEW_STOCK_IN_COLUMNS = [
    // '材料编号', '材料名称', '材料类型', '材料规格', '入库数量', '入库价格', '现存数量', '现存价格', '新数量', '新价格'
    { name: 'code', title: '编号', getCellValue: row => row.material.code },
    { name: "name", title: "名称", getCellValue: row => row.material.name },
    { name: "type", title: "类型", getCellValue: row => row.material.type ? row.material.type.name : null },
    { name: "spec", title: "规格", getCellValue: row => row.material.spec },
    { name: "currentQuantity", title: "现存数量" },
    { name: "currentPrice", title: "现存单价" },
    { name: "inQuantity", title: "入库数量" },
    { name: "inPrice", title: "入库单价" },
    { name: "newQuantity", title: "新数量" },
    { name: "newPrice", title: "新单价" },

]
const PREVIEW_STOCK_OUT_COLUMNS = [
    { name: 'code', title: '编号', getCellValue: row => row.material.code },
    { name: "name", title: "名称", getCellValue: row => row.material.name },
    { name: "type", title: "类型", getCellValue: row => row.material.type ? row.material.type.name : null },
    { name: "spec", title: "规格", getCellValue: row => row.material.spec },
    { name: "repoQuantity", title: "库存数量" },
    { name: "requireQuantity", title: "出库数量" },
    { name: "fulfilled", title: "是否满足", getCellValue: row => row.fulfilled ? '是' : '否' },
]

const FulfilledTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={({ row, value }) =>
            <Typography style={row.fulfilled ? {} : { fontWeight: 'bold', color: 'red' }}>{value}</Typography>}
        {...props}
    />
);

// =============================================
class RepoChangingDetailsPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            dirty: false, // is data dirty?

            form: {},  // {applicant, application, department}
            changingItems: [], // [{ material: { }, quantity: 0 }]

            //
            selectMaterial: false,
            columns: [
                { name: 'id', title: '序号' },
                { name: 'code', title: '编号' },
                { name: "name", title: "名称" },
                { name: "type", title: "类型", getCellValue: row => row.type ? row.type.name : undefined },
                { name: "spec", title: "规格" },
                { name: "comment", title: "备注" },
            ],
            materials: [],
            selection: [],

            //
            showSavingDiag: false,
            activeStep: 0,

            // errors
            errors: {},

            // preview changing
            showPreviewDiag: false,
            applyChangingCountdown: APPLY_CHANGING_COUNTDOWN,
            countdownTimer: null,
            previewData: [],
            previewColumns: [],
            canApplyChanging: false,

            // confirm reject
            showConfirmDiag: false,
            confirmMessage: "",

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


        // basic info changed
        this.handleInput = (e => {
            this.state.form[e.target.id] = e.target.value
            this.state.dirty = true
            this.forceUpdate()
        }).bind(this)


        // select materials
        this.addMaterials = (() => {
            const { changingItems, materials, selection } = this.state;
            Object.keys(selection).forEach(idx => {
                let no = selection[idx];
                let material = materials[no];

                if (!changingItems.find(v => v.material.id === material.id))
                    changingItems.push({ material })
            })

            //
            this.setState({ dirty: true, changingItems: changingItems, selectMaterial: false, selection: [] })
        }).bind(this)


        this.changeSelection = selection => this.setState({ selection });

        this.cancelSelect = () => this.setState({ selectMaterial: false })


        // delete a item
        this.onDelete = ((id, no) => {
            const { changingItems } = this.state;
            // let idx = changingItems.findIndex(v => v.id === id)
            // if (idx >= 0) {
            changingItems.splice(no, 1);

            this.state.dirty = true
            this.forceUpdate();
            // }
        }).bind(this)


        // item changed
        this.handleQuantityChange = ((e, mid, no) => {
            // let id = e.target.id.split("_")[1]
            let item = this.state.changingItems[no]
            item.quantity = Number.parseFloat(e.target.value)

            this.updateFormValue()

            // this.forceUpdate();
        }).bind(this)


        this.handlePriceChange = ((e, mid, no) => {
            // let id = e.target.id.split("_")[1]
            let item = this.state.changingItems[no]
            item.price = Number.parseFloat(e.target.value)

            this.updateFormValue()

            // this.forceUpdate();
        }).bind(this)


        this.updateFormValue = (e => {
            let value = 0
            this.state.changingItems.forEach(i => {
                value += i.quantity * i.price
            })

            this.state.dirty = true
            this.state.form.amount = toFixedMoney(value);
            this.forceUpdate()
        }).bind(this)


        // saving
        this.cancelSave = () => this.setState({ showSavingDiag: false, activeStep: 0 })

        this.onSaveSuccess = (() => {
            this.setState({ showSavingDiag: false, activeStep: 0 })
            this.props.history.goBack();
        }).bind(this)


        //
        this.saveForm = (async (doSubmit) => {
            //
            this.setState({ showSavingDiag: true, activeStep: 0 })
            this.forceUpdate()

            //
            let cancel = false;
            let errors = {};


            // step 1
            this.setState({ activeStep: this.state.activeStep + 1 })

            let { form, changingItems } = this.state
            let { type } = this.props

            if (!form.applicant || form.applicant == "")
                errors['form.applicant'] = "无效的申请人"

            if (changingItems.length <= 0) {
                errors['changingItems'] = "没有材料"
            } else {
                changingItems.forEach(item => {
                    if (!item.quantity || item.quantity <= 0) {
                        errors[`quantity_${item.material.id}`] = "无效的数量"
                    }

                    if (type != TYPE_STOCK_OUT) {
                        if (!item.price || item.price <= 0) {
                            errors[`price_${item.material.id}`] = "无效的价格"
                        }
                    }
                })
            }

            if (Object.keys(errors).length > 0) {
                this.setState({
                    showSavingDiag: false, errors: errors, snackbarOpen: true,
                    snackbarContent: "有错误发生"
                })
                return;
            }


            // step 3
            this.setState({ activeStep: this.state.activeStep + 1 })

            // let value = 0;
            // changingItems.forEach(i => value += i.quantity * i.price)
            if (doSubmit)
                form.status = 1

            await axios.post(`${DATA_API_BASE_URL}repoChangings`, form)
                .then(resp => resp.data)
                .then(j => form.id = j.id)
                .catch(e => {
                    cancel = true;
                    this.setState({
                        showSavingDiag: false, snackbarOpen: true,
                        snackbarContent: e.message
                    })
                })

            if (cancel) return;


            // step 4
            this.setState({ activeStep: this.state.activeStep + 1 })

            // {"id": {"repoChanging": 0, "material": 0}, "repoChanging": {"id":1}, "material": {"id":6}, "quantity": -1.3, "price": 4.4}
            changingItems.forEach(p => {
                let fi = {
                    id: { repoChanging: form.id, material: p.material.id },
                    repoChanging: { id: form.id },
                    material: { id: p.material.id },
                    quantity: p.quantity,
                    price: p.price,
                }

                axios.post(`${DATA_API_BASE_URL}repoChangingItems`, fi)
                    .catch(e => {
                        cancel = true;
                        this.setState({
                            showSavingDiag: false, snackbarOpen: true,
                            snackbarContent: e.message
                        })
                    })
            })

            if (cancel) return;

            // step 5, done
            this.setState({ activeStep: this.state.activeStep + 1 })

            //
            this.showSnackbar(doSubmit ? "已保存并提交" : "已保存")

        }).bind(this)


        this.processForm = (() => {
            const { form } = this.state
            const url = form.type === 1 ? `${API_BASE_URL}previewStockIn/${form.id}` : `${API_BASE_URL}previewStockOut/${form.id}`

            axios.get(url)
                .then(resp => resp.data)
                .then(p => {
                    const { changingItems } = this.state
                    return p.map(pi => {
                        let ci = changingItems.find(ci => ci.material.id == pi.id)
                        pi.material = ci.material

                        return pi
                    })
                })
                .then(p => {
                    this.setState({
                        previewData: p,
                        previewColumns: form.type === 1 ? PREVIEW_STOCK_IN_COLUMNS : PREVIEW_STOCK_OUT_COLUMNS,
                        showPreviewDiag: true,
                        applyChangingCountdown: APPLY_CHANGING_COUNTDOWN,
                        canApplyChanging: form.type === 1 || p.every(pi => pi.fulfilled)
                    })

                    this.state.countdownTimer = window.setInterval(() => {
                        this.state.applyChangingCountdown >= 0 ?
                            this.state.applyChangingCountdown -= 1 : window.clearInterval(this.state.countdownTimer)
                        this.forceUpdate()
                    }, 1000)
                })
                .catch(e => {
                    this.showSnackbar(e.message)
                })
        }).bind(this)


        this.cancelPreview = () => this.setState({ showPreviewDiag: false })

        this.onApplyChanging = (() => {
            const { form } = this.state
            const url = form.type === 1 ? `${API_BASE_URL}applyStockIn/${form.id}` : `${API_BASE_URL}applyStockOut/${form.id}`

            axios.post(url, { comment: '' })
                .then(r => {
                    this.showSnackbar("成功")
                    this.setState({ showPreviewDiag: false })
                    this.props.history.goBack();
                })
                .catch(e => {
                    this.showSnackbar(e.message)
                })
        }).bind(this)


            //
            this.rejectForm = (() => this.setState({ showConfirmDiag: true, confirmMessage: "确定拒绝此申请吗？" })).bind(this)


            // confirm
            this.cancelConfirm = () => this.setState({ showConfirmDiag: false })

            this.onConfirm = (() => {
                this.setState({ showConfirmDiag: false })

                let { form } = this.state
                axios.patch(`${DATA_API_BASE_URL}repoChangings/${form.id}`, { status: -1 })
                    .then(() => this.props.history.goBack())
                    .catch(e => {
                        this.showSnackbar(e.message)
                    })
            }).bind(this)
        }

    showSnackbar(msg: String) {
            this.setState({ snackbarOpen: true, snackbarContent: msg });
        }

        componentDidMount() {
            let { mode, id } = this.props.match.params;
            let { type } = this.props

            switch (type) {
                case TYPE_STOCK_IN:
                    this.state.form.type = 1;
                    break;

                case TYPE_STOCK_OUT:
                    this.state.form.type = -1;
                    break;

                case TYPE_STOCK_IN_OUT:
                    this.state.form.type = 0;
                    break;
            }

            //
            if (!id) id = 0

            if (id == 0 || mode === MODE_ADD) {
                this.state.mode = MODE_ADD
                // this.state.dirty = f

                // this.setState({ order: { tax: false } })
            }
            else //if (id > 0) 
            {
                this.state.mode = MODE_EDIT
                // this.state.dirty = false

                axios.get(`${DATA_API_BASE_URL}/repoChangings/${id}`)
                    .then(resp => resp.data)
                    .then(j => {
                        this.setState({ form: j });

                        return `${DATA_API_BASE_URL}/repoChangings/${id}/items`
                    })
                    .then(url => axios.get(url))
                    .then(resp => resp.data._embedded.repoChangingItems)
                    .then(items => {
                        let { changingItems } = this.state
                        items.forEach(item => {
                            changingItems.push({ material: item._embedded.material, quantity: item.quantity, price: item.price })
                        })
                        this.state.changingItems = changingItems
                        this.forceUpdate()
                    })
                    .catch(e => this.showSnackbar(e.message));
            }

            // load materials
            axios.get(`${DATA_API_BASE_URL}/materials`)
                .then(resp => resp.data._embedded.materials)
                .then(j => {
                    this.setState({ materials: j });
                })
                .catch(e => this.showSnackbar(e.message));
        }

        render() {
            const { type, classes, width } = this.props
            const { id } = this.props.match.params;
            const { mode, form, changingItems, materials } = this.state;
            const { dirty, selectMaterial, columns, selection } = this.state;
            const { errors, snackbarOpen, snackbarContent } = this.state;

            let shrinkLabel = mode === MODE_EDIT ? true : undefined;

            const { showSavingDiag, activeStep } = this.state;

            // title
            let title = "";
            switch (type) {

                case TYPE_STOCK_IN: {
                    if (mode == MODE_ADD)
                        title = "填写入库单";
                    else
                        title = "编辑入库单";
                    break
                }

                case TYPE_STOCK_OUT: {
                    if (mode == MODE_ADD)
                        title = "填写出库单";
                    else
                        title = "编辑出库单";
                    break;
                }

                case TYPE_STOCK_IN_OUT: {
                    if (form) {
                        if (form.type == 1)
                            title = "处理入库单";
                        else
                            title = "处理出库单";
                    } else
                        title = "处理出/入库单";
                    break;
                }
            }

            // actions
            const actions = type === TYPE_STOCK_IN_OUT ?
                <React.Fragment>
                    <Tooltip title="受理此表单并开始处理">
                        <Button onClick={() => this.processForm()} color='primary' style={{ fontSize: 18 }} >处理<mdi.ClipboardCheckOutline /></Button></Tooltip>
                    <Tooltip title="拒绝受理此表单">
                        <Button onClick={() => this.rejectForm()} color='secondary' style={{ fontSize: 18 }} >拒绝<mdi.CloseOctagonOutline /></Button></Tooltip>
                </React.Fragment>
                :
                <React.Fragment>
                    <Tooltip title="保存表单">
                        <Button onClick={() => this.saveForm(false)} disabled={!dirty} color='primary' style={{ fontSize: 18 }} >保存<mdi.ContentSave /></Button></Tooltip>
                    <Tooltip title="保存表单，然后提交给仓库管理员">
                        <Button onClick={() => this.saveForm(true)} color='secondary' disabled={!dirty && mode === MODE_ADD} style={{ fontSize: 18 }} >{dirty ? "保存并提交" : "提交"}<mdi.ContentSave /></Button></Tooltip>
                </React.Fragment>

            // enable edit
            const disableEdit = type === TYPE_STOCK_IN_OUT

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
                            <Typography variant="title" className={classes.title}>{title}</Typography>
                            {actions}
                        </Toolbar>

                        <Typography variant="title" className={classes.subTitle}>基本信息</Typography>

                        <Paper className={classes.paper}>
                            <mu.Grid container direction='column' alignItems="stretch">

                                {type === TYPE_STOCK_IN_OUT ?
                                    <mu.Grid style={{ marginBottom: 16 }}>
                                        {form.type == 1 ?
                                            <Chip label="入库" style={{ color: 'white', backgroundColor: COLOR_STOCK_IN }} />
                                            :
                                            <Chip label="出库" style={{ color: 'white', backgroundColor: COLOR_STOCK_OUT }} />}
                                    </mu.Grid>
                                    : null
                                }

                                <mu.Grid style={{ marginBottom: 16 }}>
                                    <TextField
                                        id="applicant"
                                        required
                                        disabled={disableEdit}
                                        // select
                                        error={!!errors['form.applicant']}
                                        label="申请人"
                                        style={{ width: 300 }}
                                        value={form ? form.applicant : ""}
                                        onChange={e => this.handleInput(e)}
                                        InputLabelProps={{
                                            shrink: shrinkLabel,
                                        }}
                                    >
                                        {/* {clients.map(c => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {c.fullName}
                                            </MenuItem>
                                        ))} */}
                                    </TextField>
                                </mu.Grid>

                                <mu.Grid style={{ marginBottom: 16 }}>
                                    <TextField
                                        id="department"
                                        disabled={disableEdit}
                                        // required
                                        // select
                                        // error={!!errors['client']}
                                        label="部门"
                                        style={{ width: 300 }}
                                        value={form ? form.department : ""}
                                        onChange={e => this.handleInput(e)}
                                        InputLabelProps={{
                                            shrink: shrinkLabel,
                                        }}
                                    />
                                </mu.Grid>

                                {/* <mu.Grid>
                                <TextField type="date" 
                                required 
                                disabled
                                id="orderDate" 
                                // error={!!errors['order.orderDate']}
                                    label="申请日期"
                                    // value={order.orderDate ? order.orderDate.split("T")[0] : ""}
                                    margin="normal"
                                    // onChange={e => this.handleOrderInfoChange(e)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </mu.Grid> */}

                                <mu.Grid>
                                    <TextField
                                        id="application"
                                        // error={!!errors['order.comment']} 
                                        disabled={disableEdit}
                                        label="原因"
                                        defaultValue=""
                                        className={classes.textFieldWithoutWidth}
                                        value={form ? form.application : ""}
                                        onChange={e => this.handleInput(e)}
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
                            <Typography variant="title" className={classes.subTitle} style={{ display: 'inline-flex' }}>明细</Typography>
                            {errors['changingItems'] ? <Typography className={classes.subTitle} style={{ display: 'inline-flex', color: '#f44336' }}>{errors['changingItems']}</Typography> : null}
                            {type === TYPE_STOCK_IN ? (
                                <React.Fragment>
                                    <div style={{ display: 'inline-flex', flex: 1 }} />
                                    <Typography variant="title" className={classes.subTitle} color='secondary' marginLeft={0}>总价：{form.amount ? `¥ ${toFixedMoney(form.amount)}` : '--'}</Typography>
                                </React.Fragment>) : null}
                        </div>
                        <Paper className={classes.compactPaper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>材料编号</TableCell>
                                        <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>材料名称</TableCell>
                                        <TableCell style={{ width: '10%', whiteSpace: 'nowrap' }}>类型</TableCell>
                                        <TableCell style={{ width: '10%', whiteSpace: 'nowrap' }}>规格</TableCell>
                                        <TableCell style={{ width: '10%', whiteSpace: 'nowrap' }}>数量</TableCell>
                                        {form.type === -1 ? null : (
                                            <React.Fragment>
                                                <TableCell style={{ width: '10%', whiteSpace: 'nowrap' }}>价格</TableCell>
                                                <TableCell style={{ width: '10%', whiteSpace: 'nowrap' }}>小计</TableCell>
                                            </React.Fragment>
                                        )}
                                        <TableCell style={{ padding: 0, whiteSpace: 'nowrap' }}>
                                            {disableEdit ? null :
                                                <Button variant="flat" size="large" onClick={() => this.setState({ selectMaterial: true })}>
                                                    <mdi.PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增</Button>
                                            }
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {changingItems.map((n, no) => {
                                        let m = n.material
                                        let subtotal = n.quantity * n.price
                                        if (!subtotal) subtotal = 0
                                        return (
                                            <TableRow key={m.id}>
                                                <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{m.code}</TableCell>

                                                <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{m.name}</TableCell>

                                                <TableCell style={{ width: '10%', whiteSpace: 'nowrap' }}>{m.type.name}</TableCell>

                                                <TableCell style={{ width: '10%', whiteSpace: 'nowrap' }}>{m.spec}</TableCell>

                                                <TableCell numeric style={{ width: '10%', whiteSpace: 'nowrap' }}>
                                                    <TextField type="number" required id={`quantity_${m.id}`}
                                                        value={n.quantity}
                                                        fullWidth
                                                        disabled={disableEdit}
                                                        error={!!errors[`quantity_${m.id}`]}
                                                        margin="normal" inputProps={{ min: 0 }}
                                                        // InputProps={{
                                                        //     endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                                        // }}
                                                        onChange={e => this.handleQuantityChange(e, m.id, no)}
                                                    />
                                                </TableCell>

                                                {form.type === -1 ? null : (
                                                    <React.Fragment>
                                                        <TableCell numeric style={{ width: '10%', whiteSpace: 'nowrap' }}>
                                                            <TextField type="number" required id={`price_${m.id}`}
                                                                value={n.price}
                                                                disabled={disableEdit}
                                                                fullWidth
                                                                error={!!errors[`price_${m.id}`]}
                                                                margin="normal" inputProps={{ min: 0 }}
                                                                // InputProps={{
                                                                //     endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                                                // }}
                                                                onChange={e => this.handlePriceChange(e, m.id, no)}
                                                            />
                                                        </TableCell>

                                                        <TableCell numeric style={{ width: '10%', whiteSpace: 'nowrap' }}>{toFixedMoney(subtotal)}</TableCell>
                                                    </React.Fragment>
                                                )}

                                                <TableCell style={{ whiteSpace: 'nowrap', padding: 0 }}>
                                                    {disableEdit ? null :
                                                        <Tooltip title="删除">
                                                            <IconButton onClick={() => this.onDelete(m.id, no)}>
                                                                <mui.Delete />
                                                            </IconButton>
                                                        </Tooltip>
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
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
                        open={selectMaterial}
                        onClose={this.cancelSelect}
                        // className={classes.dialog}
                        classes={{ paper: classes.dialog }}
                    >
                        <DialogTitle>添加材料</DialogTitle>
                        <DialogContent>
                            {/* <DialogContentText>请选择材料</DialogContentText> */}
                            <Paper>
                                <Grid
                                    rows={materials}
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
                            <Button onClick={this.addMaterials} disabled={selection.length <= 0} color="secondary">添加</Button>
                        </DialogActions>
                    </Dialog>


                    {/* dialog for save formula */}
                    <Dialog
                        open={showSavingDiag}
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
                            <Button onClick={this.onSaveSuccess} disabled={this.state.activeStep >= savingSteps.length - 1 ? false : true} color="primary">确定</Button>
                        </DialogActions>
                    </Dialog>


                    {/* dialog for preview repo changing */}
                    <Dialog
                        open={this.state.showPreviewDiag}
                        onClose={this.cancelPreview}
                        classes={{ paper: classes.dialog }}
                    >
                        <DialogTitle>仓库变更预览</DialogTitle>
                        <DialogContent>
                            <Paper>
                                <Grid
                                    rows={this.state.previewData}
                                    columns={this.state.previewColumns}
                                >
                                    <FulfilledTypeProvider for={['fulfilled']} />
                                    <CurrencyTypeProvider for={['currentPrice', 'inPrice', 'newPrice']} />

                                    <SortingState
                                        defaultSorting={[{ columnName: 'id', direction: 'asc' }]}
                                    />
                                    <IntegratedSorting />

                                    <VirtualTable height={400} messages={{ noData: "没有数据" }} />

                                    <TableHeaderRow showSortingControls />
                                </Grid>
                            </Paper>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.onApplyChanging} disabled={!this.state.canApplyChanging || this.state.applyChangingCountdown > 0} color="secondary">确定{this.state.applyChangingCountdown > 0 ? ` (${this.state.applyChangingCountdown})` : null}</Button>
                            <Button onClick={this.cancelPreview} color="primary">取消</Button>
                        </DialogActions>
                    </Dialog>


                    {/* dialog for confirm */}
                    <Dialog
                        open={this.state.showConfirmDiag}
                        onClose={this.cancelConfirm}
                        classes={{ paper: classes.dialog }}
                    >
                        <DialogTitle>确认</DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" >{this.state.confirmMessage}</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.onConfirm} color="primary">确定</Button>
                            <Button onClick={this.cancelConfirm} color="secondary">取消</Button>
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


    export default withStyles(styles)(RepoChangingDetailsPage);