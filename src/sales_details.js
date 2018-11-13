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

// icons
import { ArrowLeft, ContentSave, PlusCircleOutline, CalendarToday, FileMultiple, UnfoldMoreHorizontal, UnfoldLessHorizontal } from 'mdi-material-ui';
import { Delete } from '@material-ui/icons';

// ui
import {
    Grid as MuGrid,
    Paper, Typography, TextField, Button, IconButton, MenuItem,
    // Snackbar,
    // Select, Divider,
    Toolbar, Tooltip, Chip,
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
// import DataTableBase from "./data_table_base"
import Loading from "./loading-component"
import { MODE_ADD, MODE_EDIT, MODE_VIEW } from "./common"
import { DATA_API_BASE_URL } from "./config"

// import { store } from "./redux"
import { toFixedMoney, toDateString } from "./utils"
import {
    ORDER_STATUS_PRODUCING,
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_SETTLED,
    ORDER_STATUS_COLLECTED,
} from "./common"

//
import { connect } from 'react-redux'
import { actionShowSnackbar } from "./redux/data_selection"

// =============================================
class SalesDetailsPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            order: null,
            orderItems: null, // { id: { product: p.id, order: this.state.order.id }, quantity: 0, price: 0 }
            client: null,

            deliverySheets: null,
            deliverySheetItems: {},
            expandedDeliverySheetItem: null,

            repoChangings: null,
            repoChangingItems: {},
            expandedRepoChangingItem: null,

            //
            columns: [
                { name: 'id', title: '序号' },
                { name: 'code', title: '编号' },
                { name: "color", title: "颜色" },
                { name: "comment", title: "备注" },
            ],
        }

        // this.toggleAllDeliverySheetDetails = _ => {
        //     if (this.state.expandedDeliverySheetItem === -1)
        //         this.setState({ expandedDeliverySheetItem: null })
        //     else
        //         this.setState({ expandedDeliverySheetItem: -1 })
        // }

        this.toggleDeliverySheetDetails = id => {
            if (this.state.expandedDeliverySheetItem === id)
                this.setState({ expandedDeliverySheetItem: null })
            else {
                this.setState({ expandedDeliverySheetItem: id })

                const items = this.state.deliverySheetItems ? this.state.deliverySheetItems[id] : null
                if (!items) {
                    axios.get(`${DATA_API_BASE_URL}/deliverySheets/${id}/items`)
                        .then(r => r.data._embedded.deliverySheetItems)
                        .then(i => {
                            let newItems = Object.assign({}, this.state.deliverySheetItems)
                            newItems[id] = i

                            this.setState({ deliverySheetItems: newItems })
                        })
                }
            }
        }


        this.toggleRepoChangingsDetails = id => {
            if (this.state.expandedRepoChangingItem === id)
                this.setState({ expandedRepoChangingItem: null })
            else {
                this.setState({ expandedRepoChangingItem: id })

                const items = this.state.repoChangingItems ? this.state.repoChangingItems[id] : null
                if (!items) {
                    axios.get(`${DATA_API_BASE_URL}/repoChangings/${id}/items`)
                        .then(r => r.data._embedded.repoChangingItems)
                        .then(i => {
                            let newItems = Object.assign({}, this.state.repoChangingItems)
                            newItems[id] = i

                            this.setState({ repoChangingItems: newItems })
                        })
                }
            }
        }
    }

    componentDidMount() {
        // document.title = "订单详情";

        let { oid } = this.props.match.params;
        if (oid > 0) {
            axios.get(`${DATA_API_BASE_URL}/orders/${oid}`)
                .then(resp => resp.data)
                .then(order => {
                    this.setState({ order, orderItems: order._embedded.items, client: order._embedded.client });

                    return 'items'
                })

                // .then(url => axios.get(`${DATA_API_BASE_URL}/orders/${oid}/items`))
                // .then(resp => resp.data._embedded.orderItems)
                // .then(orderItems => {
                //     this.setState({ orderItems })
                //     return "ds"
                // })

                .then(j => axios.get(`${DATA_API_BASE_URL}/deliverySheets/search/findByOrderId?id=${oid}`))
                .then(resp => resp.data._embedded.deliverySheets)
                .then(deliverySheets => {
                    this.setState({ deliverySheets })
                    return 'rc'
                })

                .then(j => axios.get(`${DATA_API_BASE_URL}/repoChangings/search/findStockOutByOrderIdAndReasonId?oid=${oid}&reason=11`))
                .then(resp => resp.data._embedded.repoChangings)
                .then(repoChangings => this.setState({ repoChangings }))

                .catch(e => this.props.showSnackbar(e.message));
        }
    }

    render() {
        const { classes, } = this.props

        const { client, order, orderItems,
            deliverySheets, deliverySheetItems, expandedDeliverySheetItem,
            repoChangings, repoChangingItems, expandedRepoChangingItem } = this.state;

        return (order ?
            // <Provider store={store}>
            <React.Fragment>

                <div className={classes.contentRoot}>

                    <Toolbar className={classes.toolbar}>
                        <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                        <Typography variant="title" className={classes.title}>销售明细</Typography>
                        {/* <Button onClick={() => this.saveOrder()} disabled color='secondary' style={{ fontSize: 18 }} >保存订单<ContentSave /></Button> */}
                    </Toolbar>

                    <Typography variant="title" className={classes.subTitle}>订单</Typography>

                    <Paper className={classes.paper}>
                        <MuGrid container direction='column' alignItems="stretch">

                            <Typography variant="subTitle">客户</Typography>
                            <MuGrid style={{ marginBottom: 16 }}>
                                <Chip label={client.name} className={classes.chip} />
                                <Chip label={client.fullName} className={classes.chip} />
                                <Chip label={`${client.collectingPolicy}, ${client.collectingPeriod}天`} className={classes.chip} />
                            </MuGrid>


                            <Typography variant="subTitle" style={{ marginTop: '1em' }}>订单内容</Typography>
                            <MuGrid>
                                <FormControl disabled>
                                    <InputLabel htmlFor="no" shrink={true}>订单编号</InputLabel>
                                    <Input id="no" value={order.no} />
                                </FormControl>

                                <FormControlLabel disabled
                                    control={
                                        <Switch
                                            checked={!!order.tax}
                                            color="secondary"
                                        />
                                    }
                                    label={!!order.tax ? "含税" : "不含税"}
                                    style={{ marginLeft: 32 }}
                                />
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
                                    id="deliveryDate"
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
                                    defaultValue=""
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
                        {/* </Paper> */}


                        <Typography variant="subTitle" style={{ marginTop: '1em' }}>订单明细</Typography>

                        {/* <Paper className={classes.compactPaper}> */}
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>产品编号</TableCell>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>产品颜色</TableCell>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>数量</TableCell>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>单价</TableCell>
                                    <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>小计</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orderItems.map((n, no) => {
                                    let product = n.product
                                    let rid = n.id.product
                                    return (
                                        <TableRow key={rid}>
                                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{product.code}</TableCell>
                                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{product.color}</TableCell>
                                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{`${n.quantity} kg`}</TableCell>
                                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{`¥ ${n.price}`}</TableCell>
                                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{`¥ ${toFixedMoney(n.quantity * n.price)}`}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Paper>


                    <Typography variant="title" className={classes.subTitle}>发货单</Typography>

                    <Paper className={classes.compactPaper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ width: '30%', whiteSpace: 'nowrap' }}>发货单编号</TableCell>
                                    <TableCell style={{ width: '30%', whiteSpace: 'nowrap' }}>发货时间</TableCell>
                                    <TableCell style={{ width: '30%', whiteSpace: 'nowrap' }}>状态</TableCell>
                                    <TableCell style={{ width: '5%', whiteSpace: 'nowrap' }}>
                                        {/* <IconButton onClick={this.toggleAllDeliverySheetDetails} >{expandedDeliverySheetItem === -1 ? <UnfoldLessHorizontal /> : <UnfoldMoreHorizontal />}</IconButton> */}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {deliverySheets ? deliverySheets.map((d, no) => {
                                    let s = ""
                                    switch (d.status) {
                                        case 0: s = '未提交';
                                        case 1: s = '已提交';
                                        case 2: s = '已处理';
                                    }

                                    return (
                                        <React.Fragment>
                                            <TableRow key={d.id}>
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>{d.no}</TableCell>
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>{d.deliveryDate}</TableCell>
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>{s}</TableCell>
                                                <TableCell>
                                                    <Tooltip title="展开查看详情">
                                                        <IconButton onClick={_ => this.toggleDeliverySheetDetails(d.id)} >{expandedDeliverySheetItem === d.id ? <UnfoldLessHorizontal /> : <UnfoldMoreHorizontal />}</IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>

                                            {expandedDeliverySheetItem === -1 || expandedDeliverySheetItem === d.id ? deliverySheetItems && deliverySheetItems[d.id] ?
                                                <TableRow key={`d-${d.id}`}>
                                                    <TableCell colSpan={4} style={{ padding: 0, backgroundColor: 'lightyellow' }}>
                                                        <Table>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell padding="dense" style={{ width: '6em', whiteSpace: 'nowrap' }}></TableCell>
                                                                    <TableCell padding="dense">产品编号</TableCell>
                                                                    <TableCell padding="dense">产品颜色</TableCell>
                                                                    <TableCell padding="dense">数量</TableCell>
                                                                    <TableCell padding="dense">箱数</TableCell>
                                                                    <TableCell padding="dense">单价</TableCell>
                                                                    <TableCell padding="dense">小计</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {
                                                                    deliverySheetItems[d.id].map((it, no) => {
                                                                        const { orderItem } = it._embedded
                                                                        const { product } = orderItem
                                                                        const pid = product.id
                                                                        return (
                                                                            <TableRow key={pid}>
                                                                                <TableCell padding="dense"></TableCell>
                                                                                <TableCell padding="dense">{product.code}</TableCell>
                                                                                <TableCell padding="dense">{product.color}</TableCell>
                                                                                <TableCell padding="dense">{`${it.quantity} kg`}</TableCell>
                                                                                <TableCell padding="dense">{it.boxes}</TableCell>
                                                                                <TableCell padding="dense">{`¥ ${it.price}`}</TableCell>
                                                                                <TableCell padding="dense">{`¥ ${toFixedMoney(it.quantity * it.price)}`}</TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableCell>
                                                </TableRow> : <Typography style={{ margin: '.5em' }}>数据加载中...</Typography> : null}
                                        </React.Fragment>
                                    );
                                }) : null}
                            </TableBody>
                        </Table>
                    </Paper>


                    <Typography variant="title" className={classes.subTitle}>出库单</Typography>

                    {/* { name: 'no', title: '单号' },
    { name: 'type', title: '类型' },
    { name: "repo", title: "仓库", getCellValue: row => row.repo ? row.repo.name : null },
    { name: "applicant", title: "申请人", getCellValue: row => row.applicant ? row.applicant.name : null },
    { name: "department", title: "部门" },
    { name: "applyingDate", title: "申请日期", getCellValue: row => row.applyingDate ? row.applyingDate.split('T')[0] : null },
    { name: "reason", title: "原因", getCellValue: row => row.reason ? row.reason.reason : null },
    { name: "amount", title: "总额", getCellValue: row => row.type === REPO_CHANGING_TYPE_IN ? row.amount : "" }, */}
                    <Paper className={classes.compactPaper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ width: '25%', whiteSpace: 'nowrap' }}>出库单号</TableCell>
                                    <TableCell style={{ width: '25%', whiteSpace: 'nowrap' }}>仓库</TableCell>
                                    <TableCell style={{ width: '25%', whiteSpace: 'nowrap' }}>状态</TableCell>
                                    <TableCell style={{ width: '25%', whiteSpace: 'nowrap' }}>出库时间</TableCell>
                                    {/* <TableCell style={{ width: '30%', whiteSpace: 'nowrap' }}>总额</TableCell> */}
                                    <TableCell style={{ width: '5%', whiteSpace: 'nowrap' }}>
                                        {/* <IconButton onClick={this.toggleAllDeliverySheetDetails} >{expandedDeliverySheetItem === -1 ? <UnfoldLessHorizontal /> : <UnfoldMoreHorizontal />}</IconButton> */}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {repoChangings ? repoChangings.map((c, no) => {
                                    return (
                                        <React.Fragment>
                                            <TableRow key={c.id}>
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>{c.no}</TableCell>
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>{c.repo.name}</TableCell>
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>{c.status === 1 ? '已提交' : c.status === 2 ? '已出库' : ''}</TableCell>
                                                <TableCell style={{ whiteSpace: 'nowrap' }}>{c.executeDate}</TableCell>
                                                {/* <TableCell style={{ whiteSpace: 'nowrap' }}>{c.amount ? `¥ ${toFixedMoney(c.amount)}` : null}</TableCell> */}
                                                <TableCell>
                                                    <Tooltip title="展开查看详情">
                                                        <IconButton onClick={_ => this.toggleRepoChangingsDetails(c.id)} >{expandedRepoChangingItem === c.id ? <UnfoldLessHorizontal /> : <UnfoldMoreHorizontal />}</IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>

                                            {expandedRepoChangingItem === -1 || expandedRepoChangingItem === c.id ? repoChangingItems && repoChangingItems[c.id] ?
                                                <TableRow key={`d-${c.id}`}>
                                                    <TableCell colSpan={4} style={{ padding: 0, backgroundColor: 'lightyellow' }}>
                                                        <Table>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell padding='dense' style={{ width: '4em', whiteSpace: 'nowrap' }}></TableCell>
                                                                    <TableCell padding='dense'>材料编号</TableCell>
                                                                    <TableCell padding='dense'>材料名称</TableCell>
                                                                    <TableCell padding='dense'>规格</TableCell>
                                                                    <TableCell padding='dense'>数量</TableCell>
                                                                    {/* <TableCell padding='dense'>价格</TableCell>
                                                                    <TableCell padding='dense'>小计</TableCell> */}
                                                                </TableRow>
                                                            </TableHead>

                                                            <TableBody>
                                                                {repoChangingItems[c.id].map((n, no) => {
                                                                    let m = n._embedded.material
                                                                    let subtotal = n.quantity * n.price
                                                                    if (!subtotal) subtotal = 0
                                                                    return (
                                                                        <TableRow key={m.id}>
                                                                            <TableCell padding='dense'></TableCell>
                                                                            <TableCell padding='dense'>{m.code}</TableCell>
                                                                            <TableCell padding='dense'>{m.name}</TableCell>
                                                                            <TableCell padding='dense'>{m.spec}</TableCell>
                                                                            <TableCell padding='dense'>{n.quantity}</TableCell>
                                                                            {/* <TableCell padding='dense'>{`¥ ${toFixedMoney(n.price)}`}</TableCell>
                                                                            <TableCell padding='dense'>{`¥ ${toFixedMoney(subtotal)}`}</TableCell> */}
                                                                        </TableRow>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableCell>
                                                </TableRow> : <Typography style={{ margin: '.5em' }}>数据加载中...</Typography> : null}
                                        </React.Fragment>
                                    );
                                }) : null}
                            </TableBody>
                        </Table>
                    </Paper>
                </div>

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
    // null,
    mapDispatchToProps
)(SalesDetailsPage)

export default withStyles(styles)(ConnectedComponent);