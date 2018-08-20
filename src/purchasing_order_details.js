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
import { Link } from 'react-router-dom'

//
import { connect } from 'react-redux'

import { actionShowSnackbar } from "./redux/data_selection"

// icons
import * as mdi from 'mdi-material-ui';
import * as mui from '@material-ui/icons';

// ui
import {
    Paper, Typography, TextField, Button, IconButton,
    MenuItem, 
    // Snackbar, Select, Divider, Chip,
    Toolbar, Tooltip,
    Grid,// as Grid,
    Input, InputLabel, InputAdornment,
    // FormGroup, 
    FormControlLabel, FormControl, FormHelperText,
    Stepper, Step, StepLabel, Switch,
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

import * as dx from '@devexpress/dx-react-grid-material-ui'
import {
    // Grid as dxGrid,
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

import { DATA_API_BASE_URL } from "./config"
// import { store } from "./redux"
import { getTodayString, toFixedMoney, toDateString } from "./utils"

const MODE_ADD = 0;
const MODE_EDIT = 1;

const savingSteps = ['检查输入数据', '保存基本信息', "保存明细", "完成"];

// =============================================
class PurchasingOrderDetailsPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            dirty: false, // is data dirty?

            order: {}, // 
            orderItems: [], // { id: { material: p.id, order: this.state.order.id }, quantity: 0, price: 0 }

            //
            showSelectMaterial: false,
            columns: [
                { name: 'id', title: '序号' },
                { name: 'code', title: '编号' },
                { name: "name", title: "名称" },
                { name: "spec", title: "规格" },
                { name: "comment", title: "备注" },
            ],
            selection: [],

            //
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

        this.handleSelectClient = (e => {
            const cid = parseInt(e.target.value, 10)
            const client = this.state.clients.find(i => i.id === cid)
            if (client != this.state.client) {
                this.setState({ client })
            }
        })

        this.handleOrderInfoChange = (e => {
            this.state.order[e.target.id] = e.target.value;
            this.state.dirty = true
            this.forceUpdate()
        })

        this.handleOrderVatChange = (e => {
            this.setState({ order: { ...this.state.order, vat: e.target.value / 100 }, dirty: true })
            // this.state.order.vat = e.target.value / 100;
            // this.forceUpdate()
        })

        this.onChangeTax = (e => {
            this.setState({ order: { ...this.state.order, tax: e.target.checked }, dirty: true })
            // this.state.order.tax = !this.state.order.tax
            // this.forceUpdate()
        })

        this.onAddMaterial = (() => {
            this.setState({ showSelectMaterial: true })
        })

        this.cancelSelect = (() => {
            this.setState({ showSelectMaterial: false })
        })

        this.changeSelection = selection => this.setState({ selection });


        this.addMaterials = (() => {
            const { orderItems, materials, selection } = this.state;
            Object.keys(selection).forEach(idx => {
                let no = selection[idx];
                let p = materials[no];

                if (!orderItems.find(v => v.id.material === p.id))
                    orderItems.push({ id: { material: p.id, order: this.state.order.id }, quantity: 0, vip: 0 })
            })

            //
            this.setState({ orderItems: orderItems, showSelectMaterial: false, selection: [], dirty: true })
        })


        this.onDelete = ((id) => {
            const { orderItems } = this.state;
            let idx = orderItems.findIndex(v => v.id === id)
            if (idx >= 0) {
                orderItems.splice(idx, 1);
                this.state.dirty = true
                this.forceUpdate();
            }
        })


        this.handleQuantityChange = (e => {
            let id = parseInt(e.target.id.split("_")[1], 10)
            let item = this.state.orderItems.find(i => i.id.material === id)
            item.quantity = Number.parseFloat(e.target.value)

            this.updateOrderValue()

            // this.forceUpdate();
        })


        this.handlePriceChange = (e => {
            let id = parseInt(e.target.id.split("_")[1], 10)
            let item = this.state.orderItems.find(i => i.id.material === id)
            item.vip = Number.parseFloat(e.target.value)

            this.updateOrderValue()

            // this.forceUpdate();
        })


        this.updateOrderValue = (e => {
            let value = 0
            this.state.orderItems.forEach(i => {
                value += i.quantity * i.vip
            })

            this.state.order.value = value;
            this.state.dirty = true
            this.forceUpdate()
        })


        //
        this.cancelSave = () => this.setState({ savingOrder: false, activeStep: 0 })

        this.onSaveSuccess = (() => {
            this.setState({ savingOrder: false, activeStep: 0, dirty: false })
            this.props.history.goBack();
        })


        this.saveOrder = (async () => {
            //
            let cancel = false;
            let errors = {};

            //
            this.setState({ savingOrder: true, activeStep: 0, errors })
            this.forceUpdate()


            // step 1
            // this.setState({ activeStep: this.state.activeStep + 1 })

            //
            let { order, orderItems, client } = this.state

            order.signer = { id: this.props.user.id }

            if (!order.no || order.no === "")
                errors['order.no'] = "无效的采购单号"

            if (order.tax && (!order.vat || order.vat < 0))
                errors['order.vat'] = "无效的税率"

            if (!order.date || order.date === "")
                errors['order.date'] = "无效的签订日期"

            if (!client || !client.id)
                errors['order.supplier'] = "无效的供应商"

            if (orderItems.length <= 0) {
                errors['orderItems'] = "采购单中没有添加项目"
            } else {
                orderItems.forEach(item => {
                    if (!item.quantity || item.quantity <= 0) {
                        errors[`quantity_${item.id.material}`] = "无效的数量"
                    }

                    if (!item.vip || item.vip <= 0) {
                        errors[`vip_${item.id.material}`] = "无效的价格"
                    }
                })
            }

            if (Object.keys(errors).length > 0) {
                this.setState({ savingOrder: false, errors })
                this.props.showSnackbar("有错误发生")
                return;
            }


            // step 3
            this.setState({ activeStep: this.state.activeStep + 1 })

            // let value = 0;
            // orderItems.forEach(i => value += i.quantity * i.price)

            // {
            //     ...this.state.order,
            //     // value: ,
            //     signer: { id: user.id }
            // }
            order.supplier = { id: client.id }
            order.date += ' 00:00:00'

            await axios.post(`${DATA_API_BASE_URL}purchasingOrders`, order)
                .then(resp => resp.data)
                .then(j => order.id = j.id)
                .catch(e => {
                    cancel = true;
                    this.setState({ savingOrder: false })

                    this.props.showSnackbar(e.message)
                })

            if (cancel) return;


            // step 4
            this.setState({ activeStep: this.state.activeStep + 1 })

            orderItems.forEach(p => {
                p.id.order = order.id
                let fi = {
                    ...p,
                    // vat: order.vat,
                    purchasingOrder: { id: order.id },
                    material: { id: p.id.material }
                }

                axios.post(`${DATA_API_BASE_URL}purchasingOrderItems`, fi)
                    .catch(e => {
                        cancel = true;
                        this.setState({ savingOrder: false })

                        this.props.showSnackbar(e.message)
                    })
            })

            if (cancel) return;

            // step 5, done
            this.setState({ activeStep: this.state.activeStep + 1 })

        })
    }

    componentDidMount() {
        let { id } = this.props.match.params;
        if (!id) id = 0

        //
        if (id === 0) {
            this.state.mode = MODE_ADD

            this.setState({ order: { tax: false, date: getTodayString() } })
        }
        else //if (id > 0) 
        {
            this.state.mode = MODE_EDIT

            axios.get(`${DATA_API_BASE_URL}/purchasingOrders/${id}`)
                .then(resp => resp.data)
                .then(j => {
                    this.setState({ order: j });
                    if (j._embedded && j._embedded.supplier)
                        this.setState({ client: j._embedded.supplier });

                    return `${DATA_API_BASE_URL}/purchasingOrders/${id}/items`
                })
                .then(url => axios.get(url))
                .then(resp => resp.data._embedded.purchasingOrderItems)
                .then(j => {
                    // { id: { material: p.id, order: this.state.order.id }, quantity: 0, price: 0 }
                    // let fs = []
                    // j.forEach(it => fs.push({ 'quantity': it.quantity, ...it._embedded.material }))
                    // this.setState({ orderItems: fs });
                    this.setState({ orderItems: j })
                    return j
                })
                // .then(j => axios.get(`${DATA_API_BASE_URL}/boms/search/findByOrderId?oid=${id}`))
                // .then(resp => resp.data._embedded.boms)
                // .then(boms => this.setState({ boms }))
                .catch(e => this.props.showSnackbar(e.message));
        }

        // load materials
        axios.get(`${DATA_API_BASE_URL}/materials`)
            .then(resp => resp.data._embedded['materials'])
            .then(j => this.state.materials = j)
            .catch(e => this.showSnackbar(e.message));

        // load suppliers
        axios.get(`${DATA_API_BASE_URL}/clients/search/findByPaymentPolicyIsNotNull`)
            .then(resp => resp.data._embedded.clients)
            .then(clients => {
                this.setState({ clients });
            })
            .catch(e => this.showSnackbar(e.message));
    }

    render() {
        const { classes, } = this.props
        // const { id } = this.props.match.params;
        const { dirty, mode, order, orderItems, materials, stockIn, clients, client } = this.state;
        const { showSelectMaterial, columns, selection } = this.state;
        const { errors } = this.state;

        let shrinkLabel = mode === MODE_EDIT ? true : undefined;

        const { savingOrder, activeStep } = this.state;

        return (
            // <Provider store={store}>
            <React.Fragment>

                <div className={classes.contentRoot}>

                    <Toolbar className={classes.toolbar}>
                        <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton>
                        <Typography variant="title" className={classes.title}>{mode === MODE_ADD ? "新增采购单" : "采购单详情"}</Typography>
                        <Button onClick={() => this.saveOrder()} disabled={mode === MODE_EDIT && !dirty} color='secondary' style={{ fontSize: 18 }} >保存<mdi.ContentSave /></Button>
                        {/* {mode === MODE_VIEW ? null :
                            } */}
                    </Toolbar>

                    <Typography variant="title" className={classes.subTitle}>基本信息</Typography>

                    <Paper className={classes.paper}>
                        <Grid container direction='column' alignItems="stretch">
                            <Grid>
                                <FormControl required error={!!errors['order.no']} aria-describedby="no-error-text">
                                    <InputLabel htmlFor="no" shrink={shrinkLabel}>采购单号</InputLabel>
                                    <Input id="no"
                                        value={order.no}
                                        onChange={e => this.handleOrderInfoChange(e)}
                                    />
                                    <FormHelperText id="no-error-text">{errors.revision}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!order.tax}
                                            onChange={e => this.onChangeTax(e)}
                                            color="secondary"
                                        />
                                    }
                                    label={!!order.tax ? "含税" : "不含税"}
                                    style={{ marginLeft: 32 }}
                                />

                                <FormControl
                                    required={order.tax}
                                    disabled={!order.tax}
                                    error={!!errors['order.vat']} aria-describedby="no-error-text"
                                    style={{ marginLeft: 8, width: 80 }}
                                >
                                    <InputLabel htmlFor="vat" shrink={shrinkLabel}>税率</InputLabel>
                                    <Input id="vat"
                                        type="number"
                                        endAdornment={<InputAdornment position="end">%</InputAdornment>}
                                        value={order.vat ? order.vat * 100 : 0}
                                        onChange={e => this.handleOrderVatChange(e)}
                                    />
                                    <FormHelperText id="no-error-text">{errors.revision}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid>
                                <TextField type="date" required id="date" error={!!errors['order.date']}
                                    label="签订日期"
                                    value={order.date ? toDateString(order.date) : ""}
                                    margin="normal"
                                    onChange={e => this.handleOrderInfoChange(e)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            <Grid>
                                {/* <TextField
                                    id="supplier"
                                    required
                                    error={!!errors['order.supplier']}
                                    label="供应商"
                                    // style={{ width: 300 }}
                                    fullWidth
                                    // className={classNames(classes.margin, classes.textField)}
                                    value={order.supplier}
                                    onChange={e => this.handleOrderInfoChange(e)}
                                    // SelectProps={{
                                    //     native: true,
                                    //     MenuProps: {
                                    //         className: classes.menu,
                                    //     },
                                    // }}
                                    InputLabelProps={{
                                        shrink: shrinkLabel,
                                    }}
                                >
                                </TextField> */}
                                <TextField
                                    required
                                    select
                                    error={!!errors['client']}
                                    label="供应商"
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

                            <Grid>
                                <TextField id="comment" error={!!errors['order.comment']} label="备注"
                                    defaultValue=""
                                    value={order.comment ? order.comment : ""}
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
                            </Grid>
                        </Grid>
                    </Paper>

                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography variant="title" className={classes.subTitle}>条目</Typography>
                        <Typography variant="title" className={classes.subTitle} style={{ marginLeft: 8, flex: 1, color: 'red' }}>{errors['orderItems'] ? errors['orderItems'] : null}</Typography>
                        <Typography variant="title" className={classes.subTitle} color='secondary' marginleft={0}>总价：{order.value ? `¥ ${toFixedMoney(order.value)}` : '--'}</Typography>
                    </div>
                    <Paper className={classes.compactPaper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="dense" style={{ width: '15%', whiteSpace: 'nowrap' }}>物料编号</TableCell>
                                    <TableCell padding="dense" style={{ width: '20%', whiteSpace: 'nowrap' }}>物料名称</TableCell>
                                    <TableCell padding="dense" style={{ width: '20%', whiteSpace: 'nowrap' }}>规格</TableCell>
                                    <TableCell padding="dense" style={{ width: '15%', whiteSpace: 'nowrap' }}>数量</TableCell>
                                    <TableCell padding="dense" style={{ width: '15%', whiteSpace: 'nowrap' }}>单价</TableCell>
                                    <TableCell padding="dense" numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>小计</TableCell>
                                    <TableCell padding="dense" style={{ padding: 0, whiteSpace: 'nowrap' }}>
                                        <Button variant="flat" size="large" onClick={this.onAddMaterial}>
                                            <mdi.PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增条目</Button>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orderItems.map((n, no) => {
                                    let material = materials.find(p => p.id === n.id.material)
                                    let rid = n.id.material
                                    return (
                                        <TableRow key={rid}>
                                            <TableCell padding="dense" style={{ width: '15%', whiteSpace: 'nowrap' }}>{material.code}</TableCell>
                                            <TableCell padding="dense" style={{ width: '20%', whiteSpace: 'nowrap' }}>{material.name}</TableCell>
                                            <TableCell padding="dense" style={{ width: '20%', whiteSpace: 'nowrap' }}>{material.spec}</TableCell>
                                            <TableCell padding="dense" numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>
                                                <TextField type="number" required id={`quantity_${rid}`}
                                                    value={n.quantity}
                                                    fullWidth
                                                    error={!!errors[`quantity_${rid}`]}
                                                    margin="normal"
                                                    // inputProps={{ min: 0 }}
                                                    // InputProps={{
                                                    //     endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                                    // }}
                                                    onChange={e => this.handleQuantityChange(e)}
                                                />
                                            </TableCell>
                                            <TableCell padding="dense" numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>
                                                <TextField type="number" required id={`vip_${rid}`}
                                                    value={n.vip}
                                                    fullWidth
                                                    error={!!errors[`vip_${rid}`]}
                                                    margin="normal"
                                                    InputProps={{
                                                        min: 0,
                                                        startAdornment: <InputAdornment position="start">¥</InputAdornment>
                                                    }}
                                                    onChange={e => this.handlePriceChange(e)}
                                                />
                                            </TableCell>
                                            <TableCell padding="dense" numeric style={{ width: '15%', whiteSpace: 'nowrap' }}>{`¥ ${toFixedMoney(n.quantity * n.vip)}`}</TableCell>
                                            <TableCell padding="dense" style={{ whiteSpace: 'nowrap', padding: 0 }}>
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
                            <Button variant="flat" size="large" component={Link} to={`/formula/add/${material.id}/0`}>
                                <mdi.PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增条目</Button>
                        </div> */}
                    </Paper>

                    {mode === MODE_EDIT ?
                        <React.Fragment>
                            <Typography variant="title" className={classes.subTitle}>入库单</Typography>

                            <Paper className={classes.paper}>
                                {stockIn && stockIn.length > 0 ? (
                                    <React.Fragment>
                                        <Typography >入库单已生成</Typography>
                                        <Button variant="flat" size="large" component={Link} to={`/bom/view/${order.id}`}>
                                            <mdi.FileMultiple style={{ opacity: .5 }} color="primary" />查看入库单</Button>
                                    </React.Fragment>
                                ) : <Button variant="flat" size="large" component={Link} to={`/bom/add/${order.id}`}>
                                        <mdi.PlusCircleOutline style={{ opacity: .5 }} color="secondary" />生成入库单</Button>}
                            </Paper>
                        </React.Fragment>
                        : null}
                </div>

                {/* dialog for add materials */}
                <Dialog
                    open={showSelectMaterial}
                    onClose={this.cancelSelect}
                    // className={classes.dialog}
                    classes={{ paper: classes.dialog }}
                >
                    <DialogTitle>添加物料</DialogTitle>
                    <DialogContent>
                        <Paper>
                            <dx.Grid
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
                            </dx.Grid>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.cancelSelect} color="primary">取消</Button>
                        <Button onClick={this.addMaterials} color="secondary">添加</Button>
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
)(PurchasingOrderDetailsPage)

export default withStyles(styles)(ConnectedComponent);