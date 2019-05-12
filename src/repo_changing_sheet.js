// @flow

// basic
import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';
// import compose from 'recompose/compose';
// import produce from 'immer';

// styles
import { withStyles } from '@material-ui/core';

import CommonStyles from "./common_styles";

// redux
// import connect from 'react-redux/lib/connect/connect';

// router
// import { withRouter } from 'react-router'
// import { match } from 'react-router-dom'

// icons
import { ClipboardCheckOutline, CloseOctagonOutline, ContentSave, ArrowLeft, ClipboardText, PlusCircleOutline, } from 'mdi-material-ui';
import { Delete } from '@material-ui/icons';

// ui
import {
    Grid as MuGrid,
    Paper, Typography, TextField, Button, IconButton,
    // MenuItem, Snackbar, 
    Select, Toolbar,
    // Divider, 
    Tooltip, Chip,
    // Input, 
    InputLabel,
    // InputAdornment,
    // FormGroup, FormControlLabel, 
    FormControl,
    // FormHelperText,
    Stepper, Step, StepLabel,
    // Switch,
    Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogActions, DialogContent,
    // DialogContentText, 
    DialogTitle,
} from '@material-ui/core';

import {
    // SelectionState,
    // IntegratedSelection,
    SortingState,
    IntegratedSorting,
    // FilteringState,
    // IntegratedFiltering,
    // EditingState,
    // PagingState,
    // IntegratedPaging,
    DataTypeProvider,
} from '@devexpress/dx-react-grid';

import {
    Grid,
    // Table as dxTable,
    VirtualTable,
    TableHeaderRow,
    // TableSelection,
    // PagingPanel,
    // Toolbar,
    // TableEditRow,
    // TableEditColumn,
    // TableColumnResizing,
    // TableFilterRow,
} from '@devexpress/dx-react-grid-material-ui';

import DialogSelectMaterials from "./components/dialog_select_materials"
import DialogSelectPurchasingOrder from "./components/dialog_select_purchasing_order"
import DialogSelectDeliverySheet from "./components/dialog_select_delivery_sheet"
import DialogSelectBom from "./components/dialog_select_bom"

//
import axios from 'axios'

// import DataTableBase from "./data_table_base"

import {
    TYPE_STOCK_IN, TYPE_STOCK_OUT, TYPE_STOCK_IN_OUT, MODE_ADD, MODE_VIEW, MODE_EDIT,
} from "./common"
import {
    API_BASE_URL, DATA_API_BASE_URL
} from "./config"

//
import { connect } from 'react-redux'

import { actionShowSnackbar } from "./redux/data_selection"

// import { store } from "./redux"
import { toFixedMoney, getTodayDateTimeString, toDateString } from "./utils"
import { COLOR_STOCK_IN, COLOR_STOCK_OUT } from "./common_styles"
import { CurrencyTypeProvider } from "./common_components"
import { REPO_CHANGING_TYPE_IN, REPO_CHANGING_TYPE_OUT } from "./common"

// const TYPE_STOCK_IN = "in";
// const TYPE_STOCK_OUT = "out";

// const MODE_ADD = "add";
// const MODE_EDIT = "edit";
// const MODE_VIEW = "view";
const MODE_DELIVERY = 'delivery';

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


type RouterMatch = {
    params: {},         // (object) Key/value pairs parsed from the URL corresponding to the dynamic segments of the path
    isExact: boolean,   // true if the entire URL was matched (no trailing characters)
    path: string,       // The path pattern used to match. Useful for building nested <Route>s
    url: string,        // The matched portion of the URL. Useful for building nested <Link>s
}

// =============================================
class RepoChangingSheetPage extends React.PureComponent<{
    match: RouterMatch,
    classes: {},
    showSnackbar: (m: string) => void,

}, {
    dirty: boolean, // is data dirty?


    form: {},  // {applicant, application, department}
    changingItems: {}[], // [{ material: { }, quantity: 0 }]

    //
    selectMaterial: boolean,
    materials: {}[],
    selection: number[],

    //
    repoes: {}[], // all repositories
    // repo: null, // id of repository

    repoChangingReasons: {}[],
    // reason: null, // id of reason

    //
    orderSpecified: boolean,

    showSelectPurchasingOrder: boolean,
    purchasingOrders: {}[], //

    //
    showSelectOrder: boolean,
    orders: {}[], //
    order: ?{}, //

    orderSelection: number[],

    //
    showSelectDeliverySheet: boolean,
    deliverySheets: {}[], //
    deliverySheet: ?{}, //

    deliverySheetSelection: number[],

    //
    showSavingDiag: boolean,
    activeStep: number,

    // errors
    errors: {},

    // preview changing
    showPreviewDiag: boolean,
    applyChangingCountdown: number,
    countdownTimer?: {},
    previewData: {}[],
    previewColumns: {}[],
    canApplyChanging: boolean,

    // confirm reject
    showConfirmDiag: boolean,
    confirmMessage: string,
}> {
    constructor(props) {
        super(props);

        this.state = {
            dirty: false, // is data dirty?


            form: {},  // {applicant, application, department}
            changingItems: [], // [{ material: { }, quantity: 0 }]

            //
            selectMaterial: false,
            materials: [],
            // selection: [],

            //
            repoes: [], // all repositories
            // repo: null, // id of repository

            repoChangingReasons: [],
            // reason: null, // id of reason

            //
            orderSpecified: false,

            showSelectPurchasingOrder: false,
            purchasingOrders: [], //

            //
            // showSelectOrder: false,
            // orders: [], //
            // order: null, //

            // orderSelection: [],

            //
            showSelectBom: false,
            boms: [],

            //
            showSelectDeliverySheet: false,
            deliverySheets: [], //
            deliverySheet: null, //

            // deliverySheetSelection: [],

            //
            showSavingDiag: false,
            activeStep: 0,

            // errors
            errors: {},

            // preview changing
            showPreviewDiag: false,
            applyChangingCountdown: APPLY_CHANGING_COUNTDOWN,
            // countdownTimer: null,
            previewData: [],
            previewColumns: [],
            canApplyChanging: false,

            // confirm reject
            showConfirmDiag: false,
            confirmMessage: "",

            //
            // snackbarOpen: false,
            // snackbarContent: "",
        }
    }
    // this.onDetails = ((id) => {
    //     alert(`details ${id}`)
    // })

    // this.onEdit = ((id) => {
    //     alert(`edit ${id}`)
    // })


    // basic info changed
    handleInput = e => {
        this.state.form[e.target.id] = e.target.value
        this.state.dirty = true
        this.forceUpdate()
    }

    onChangedRepo = e => {
        const repoId = parseInt(e.target.value, 10)
        this.state.form.repo = this.state.repoes.find(r => r.id === repoId)
        this.state.dirty = true
        this.forceUpdate()
    }


    // select materials
    addMaterials = (selection: number[]) => {
        const { form, changingItems, materials, } = this.state;

        const filteredMaterials = materials.filter(m => form.repo && form.repo.type === m.category)

        selection.sort().forEach(idx => {
            let material = filteredMaterials[idx];

            if (!changingItems.find(v => v.material.id === material.id))
                changingItems.push({ material })
        })

        //
        this.setState({ dirty: true, changingItems: changingItems, selectMaterial: false, selection: [] })
    }


    // changeSelection = selection => this.setState({ selection });

    cancelSelect = () => this.setState({ selectMaterial: false })


    // delete a item
    onDelete = (id, no) => {
        const { changingItems } = this.state;
        // let idx = changingItems.findIndex(v => v.id === id)
        // if (idx >= 0) {
        changingItems.splice(no, 1);

        this.state.dirty = true
        this.forceUpdate();
        // }
    }


    // item changed
    handleQuantityChange = (e, mid, no) => {
        // let id = e.target.id.split("_")[1]
        let item = this.state.changingItems[no]
        item.quantity = Number.parseFloat(e.target.value)

        this.updateFormValue()

        // this.forceUpdate();
    }


    handlePriceChange = (e, mid, no) => {
        // let id = e.target.id.split("_")[1]
        let item = this.state.changingItems[no]
        item.price = Number.parseFloat(e.target.value)

        this.updateFormValue()

        // this.forceUpdate();
    }


    updateFormValue = e => {
        let value = 0
        this.state.changingItems.forEach(i => {
            value += i.quantity * i.price
        })

        this.state.dirty = true
        this.state.form.value = toFixedMoney(value);
        this.forceUpdate()
    }


    //
    changedReason = e => {
        const rid = parseInt(e.target.value, 10)

        const r = this.state.repoChangingReasons.find(i => i.id === rid)
        if (r) {
            this.setState({
                dirty: true,
                orderRelated: r.orderRelated,
                form: {
                    ...this.state.form,
                    reason: { id: r.id, orderRelated: r.orderRelated }
                }
            })
        }
    }

    // 采购订单选择
    //
    selectPurchasingOrder = e => {
        this.setState({ showSelectPurchasingOrder: true })

        axios.get(`${DATA_API_BASE_URL}/purchasingOrders/search/findByStatusIn?status=0,1`)
            .then(resp => resp.data._embedded.purchasingOrders)
            .then(purchasingOrders => {
                this.state.errors['form.order'] = null;
                this.setState({ dirty: true, purchasingOrders });
            })
            .catch(e => this.props.showSnackbar(e.message));

    }

    onSelectedPurchasingOrder = (selection: number[]) => {
        const { purchasingOrders } = this.state;
        if (selection.length === 0) return;

        //
        const order = purchasingOrders[selection[0]]
        this.state.form.purchasingOrder = order
        this.setState({ showSelectPurchasingOrder: false })
    }

    cancelSelectPurchasingOrder = _ => this.setState({ showSelectPurchasingOrder: false })

    // // 订单选择
    // //
    // selectOrder = e => {
    //     this.setState({ showSelectOrder: true })

    //     axios.get(`${DATA_API_BASE_URL}/orders`)
    //         .then(resp => resp.data._embedded.orders)
    //         .then(j => {
    //             this.state.errors['form.order'] = null;
    //             this.setState({ orders: j });
    //         })
    //         .catch(e => this.props.showSnackbar(e.message));

    // }

    // cancelSelectOrder = _ => this.setState({ showSelectOrder: false })

    // changeOrderSelection = selection => {
    //     let keys = Object.keys(selection)
    //     if (keys.length > 1) {
    //         let lastNo = selection[keys[keys.length - 1]]
    //         selection = [lastNo]
    //     }

    //     this.setState({ orderSelection: selection });
    // }


    // onSelectedOrder = () => {
    //     const { orders, orderSelection } = this.state;
    //     if (orderSelection.length === 0) return;

    //     //
    //     const order = orders[orderSelection[0]]
    //     this.state.form.order = order
    //     this.setState({ showSelectOrder: false })
    // }


    //#region select bom
    doSelectBom = e => {
        this.setState({ showSelectBom: true })

        axios.get(`${DATA_API_BASE_URL}/boms/search/findByOrderStatus?status=0,1`)
            .then(resp => resp.data._embedded.boms)
            .then(boms => {
                this.state.errors['form.order'] = null;
                // this.setState({ boms });
                this.state.boms = boms;

                Promise.all(
                    boms.map(b => {
                        return axios.get(`${DATA_API_BASE_URL}/orderItems/${b.id.order}_${b.id.product}`)
                            .then(resp => resp.data)
                            .then(bi => {
                                b.orderItem = bi
                                return bi.id.order
                            })

                            .then(oid => axios.get(`${DATA_API_BASE_URL}/products/${b.orderItem.id.product}`))
                            .then(resp => resp.data)
                            .then(p => {
                                b.orderItem.product = p
                                return 1
                            })

                            .then(oid => axios.get(`${DATA_API_BASE_URL}/orders/${b.orderItem.id.order}`))
                            .then(resp => resp.data)
                            .then(o => {
                                b.orderItem.order = o
                                b.client = o._embedded.client

                                // this.setState({ boms: {...boms} })
                            })
                    }))
                    .then(_ => {
                        this.forceUpdate()
                        // this.setState({ showSelectBom: true })
                    })
            })
            .catch(e => this.props.showSnackbar(e.message));
    }

    cancelSelectBom = _ => this.setState({ showSelectBom: false })

    // onBomSelectionChanged = selection => {
    //     let keys = Object.keys(selection)
    //     if (keys.length > 1) {
    //         let lastNo = selection[keys[keys.length - 1]]
    //         selection = [lastNo]
    //     }

    //     this.setState({ orderSelection: selection });
    // }


    onSelectedBom = (selection: number[]) => {
        if (selection.length <= 0) return;

        //
        const { boms } = this.state;

        const bom = boms[selection[0]]
        this.state.form.bom = bom
        this.setState({ dirty: true, showSelectBom: false })
    }
    //#endregion


    //#region 发货单选择
    selectDeliverySheet = e => {
        this.setState({ showSelectDeliverySheet: true })

        axios.get(`${DATA_API_BASE_URL}/deliverySheets/search/findByStatus?status=1`)
            .then(resp => resp.data._embedded.deliverySheets)
            .then(j => {
                this.state.errors['form.order'] = null;
                this.setState({ deliverySheets: j });
            })
            .catch(e => this.props.showSnackbar(e.message));

    }

    cancelSelectDeliverySheet = _ => this.setState({ showSelectDeliverySheet: false })

    // changeDeliverySheetSelection = selection => {
    //     let keys = Object.keys(selection)
    //     if (keys.length > 1) {
    //         let lastNo = selection[keys[keys.length - 1]]
    //         selection = [lastNo]
    //     }

    //     this.setState({ deliverySheetSelection: selection });
    // }

    onSelectedDeliverySheet = (selection: number[]) => {
        const { deliverySheets } = this.state;
        if (selection.length === 0) return;

        //
        const deliverySheet = deliverySheets[selection[0]]
        this.state.form.deliverySheet = deliverySheet
        this.setState({ dirty: true, showSelectDeliverySheet: false })
    }
    //#endregion


    // saving
    cancelSave = _ => this.setState({ showSavingDiag: false, activeStep: 0 })

    onSaveSuccess = _ => {
        this.setState({ showSavingDiag: false, activeStep: 0 })
        this.props.history.goBack();
    }


    //
    saveForm = async (doSubmit) => {
        //
        this.setState({ showSavingDiag: true, activeStep: 0 })
        this.forceUpdate()

        //
        let cancel = false;
        let errors = {};

        //
        // if (!this.state.form.repo)
        //     this.state.form.repo = this.state.repoes[0]

        // if (!this.state.form.reason)
        //     this.state.form.reason = this.state.repoChangingReasons[0]

        // step 1
        this.setState({ activeStep: 0 })

        const { user } = this.props
        let { form, changingItems, mode, delivery_sheet_id } = this.state
        let { type } = this.props

        form.applicant = user
        // if (!form.applicant || form.applicant == "")
        //     errors['form.applicant'] = "无效的制单人"

        if (!form.no || form.no === "")
            errors['form.no'] = "无效的单号"

        if (form.reason.orderRelated === 1 && (!form.order || !form.order.id))
            errors['form.order'] = "未选择订单"

        if (changingItems.length <= 0) {
            errors['changingItems'] = "没有材料"
        } else {
            changingItems.forEach(item => {
                if (!item.quantity || item.quantity <= 0) {
                    errors[`quantity_${item.material.id}`] = "无效的数量"
                }

                if (type !== TYPE_STOCK_OUT) {
                    if (item.material.category === 0 && (!item.price || item.price <= 0)) {
                        errors[`price_${item.material.id}`] = "无效的价格"
                    }
                }
            })
        }

        if (Object.keys(errors).length > 0) {
            // this.setState({
            //     showSavingDiag: false, errors: errors, snackbarOpen: true,
            //     snackbarContent: "发现错误，请检查数据输入"
            // })
            this.setState({ showSavingDiag: false, errors: errors })
            this.props.showSnackbar("发现错误，请检查数据输入")
            return
        }


        // step 3
        this.setState({ activeStep: this.state.activeStep + 1 })

        // let value = 0;
        // changingItems.forEach(i => value += i.quantity * i.price)
        if (!form.id)
            form.id = 0;

        // clean up
        let fd = { ...form };

        fd.applicant = { id: form.applicant.id }

        delete fd.items;

        if (form.order)
            fd.order = { id: form.order.id };

        if (form.bom)
            fd.bom = { id: form.bom.id };

        if (form.deliverySheet)
            fd.deliverySheet = { id: form.deliverySheet.id }

        if (form.reason)
            fd.reason = { id: form.reason.id };

        if (form.repo)
            fd.repo = { id: form.repo.id };

        if (doSubmit) {
            fd.status = 1;
            fd.applyingDate = getTodayDateTimeString();
        }

        if (mode === MODE_DELIVERY) {
            await axios.post(`${API_BASE_URL}/deliverySheet/${delivery_sheet_id}/repoChangingSheet`, fd)
                // .then(resp => resp.data)
                // .then(j => form.id = j.id)
                .catch(e => {
                    cancel = true
                    this.setState({ showSavingDiag: false })
                    this.props.showSnackbar(e.message)
                })

            if (cancel) return;

            this.setState({ activeStep: this.state.activeStep + 1 })
        } else {
            await axios.post(`${DATA_API_BASE_URL}/repoChangings`, fd)
                .then(resp => resp.data)
                .then(j => form.id = j.id)
                .catch(e => {
                    cancel = true
                    this.setState({ showSavingDiag: false })
                    this.props.showSnackbar(e.message)
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

                axios.post(`${DATA_API_BASE_URL}/repoChangingItems`, fi)
                    .catch(e => {
                        cancel = true;
                        this.setState({ showSavingDiag: false })
                        this.props.showSnackbar(e.message)
                    })
            })
        }

        if (cancel) return;

        // step 5, done
        this.setState({ activeStep: this.state.activeStep + 1 })

        //
        this.props.showSnackbar(doSubmit ? "已保存并提交" : "已保存")

    };


    processForm = () => {
        const { form } = this.state
        const url = form.type === REPO_CHANGING_TYPE_IN ? `${API_BASE_URL}/previewStockIn/${form.id}` : `${API_BASE_URL}/previewStockOut/${form.id}`

        axios.get(url)
            .then(resp => resp.data)
            .then(p => {
                const { repoes, changingItems } = this.state
                return p.map(pi => {
                    let ci = changingItems.find(ci => ci.material.id === pi.materialId)
                    pi.material = ci.material

                    let repo = repoes.find(r => r.id === pi.repoId)
                    pi.repo = repo

                    return pi
                })
            })
            .then(p => {
                this.setState({
                    previewData: p,
                    previewColumns: form.type === REPO_CHANGING_TYPE_IN ? PREVIEW_STOCK_IN_COLUMNS : PREVIEW_STOCK_OUT_COLUMNS,
                    showPreviewDiag: true,
                    applyChangingCountdown: APPLY_CHANGING_COUNTDOWN,
                    canApplyChanging: form.type === REPO_CHANGING_TYPE_IN || p.every(pi => pi.fulfilled)
                })

                this.state.countdownTimer = window.setInterval(() => {
                    this.state.applyChangingCountdown >= 0 ?
                        this.state.applyChangingCountdown -= 1 : window.clearInterval(this.state.countdownTimer)
                    this.forceUpdate()
                }, 1000)
            })
            .catch(e => {
                this.props.showSnackbar(e.message)
            })
    };


    cancelPreview = () => this.setState({ showPreviewDiag: false });

    onApplyChanging = () => {
        const { form } = this.state
        const url = form.type === REPO_CHANGING_TYPE_IN ? `${API_BASE_URL}/applyStockIn/${form.id}` : `${API_BASE_URL}/applyStockOut/${form.id}`

        axios.post(url, { comment: '' })
            .then(r => {
                this.props.showSnackbar("成功")
                this.setState({ showPreviewDiag: false })
                this.props.history.goBack();
            })
            .catch(e => {
                this.props.showSnackbar(e.message)
            })
    };


    //
    rejectForm = () => this.setState({ showConfirmDiag: true, confirmMessage: "确定拒绝此申请吗？" });


    // confirm
    cancelConfirm = () => this.setState({ showConfirmDiag: false });

    onConfirm = () => {
        this.setState({ showConfirmDiag: false })

        let { form } = this.state
        axios.patch(`${DATA_API_BASE_URL}/repoChangings/${form.id}`, { status: -1 })
            .then(() => this.props.history.goBack())
            .catch(e => {
                this.props.showSnackbar(e.message)
            })
    };
    // }

    componentDidMount() {
        let { mode, id } = this.props.match.params;
        let { type, user } = this.props

        switch (type) {
            case TYPE_STOCK_IN:
                this.state.form.type = REPO_CHANGING_TYPE_IN;
                break;

            case TYPE_STOCK_OUT:
                this.state.form.type = REPO_CHANGING_TYPE_OUT;
                break;

            // case TYPE_STOCK_IN_OUT:
            //     this.state.form.type = 0;
            //     break;
            default:
                break
        }

        //
        if (!id) id = 0
        this.setState({ delivery_sheet_id: id })

        if (id === 0 || mode === MODE_ADD) {
            this.setState({ mode, form: { ...this.state.form, applicant: user } })

            if (id > 0) {
                this.setState({ orderSpecified: true })
                axios.get(`${DATA_API_BASE_URL}/purchasingOrders/${id}`)
                    .then(resp => resp.data)
                    .then(purchasingOrder => this.setState({ form: { ...this.state.form, purchasingOrder } }))

                    .then(_ => axios.get(`${DATA_API_BASE_URL}/purchasingOrders/${id}/items`))
                    .then(resp => resp.data._embedded.purchasingOrderItems)
                    .then(items => {
                        let changingItems = []
                        items.forEach(item => {
                            changingItems.push({ material: item._embedded.material, quantity: item.quantity, price: item.vep })
                        })
                        this.setState({ changingItems })
                    })

                    .catch(e => this.props.showSnackbar(e.message))
            }
        } else if (mode === MODE_DELIVERY) {
            this.setState({ mode })

            // axios.get(`${DATA_API_BASE_URL}/deliverySheets/${id}`)
            //     .then(resp => resp.data)
            //     .then(deliverySheet => {
            //         this.setState({ deliverySheet });
            //     })
            // .then(_ => axios.get(`${DATA_API_BASE_URL}/deliverySheets/${id}/items`))
            axios.get(`${DATA_API_BASE_URL}/deliverySheets/${id}/items`)
                .then(resp => resp.data._embedded.deliverySheetItems)
                .then(items => {
                    let { changingItems } = this.state

                    items.forEach(item => {
                        changingItems.push({ material: { id: item.id.orderItem.product, name: item._embedded.orderItem.product.code, type: { name: "产品" }, spec: "" }, quantity: item.quantity, price: item.price })
                    })

                    this.setState({ changingItems })
                })
                .then(_ => axios.get(`${DATA_API_BASE_URL}/deliverySheets/${id}/order`))
                .then(resp => resp.data)
                .then(order => {
                    this.setState({
                        orderSpecified: true,
                        form: {
                            ...this.state.form,
                            status: 1,
                            type: REPO_CHANGING_TYPE_OUT,
                            applicant: this.props.user,
                            order,
                            deliverySheet: { id },
                            reason: { id: 11, orderRelated: 1 }
                        }
                    })
                })
                .catch(e => this.props.showSnackbar(e.message));
        }
        else //if (mode === MODE_EDIT) 
        {
            this.state.mode = mode //MODE_EDIT
            // this.state.dirty = false

            // axios.get(`${DATA_API_BASE_URL}/repoChangings/${id}`)
            axios.get(`${API_BASE_URL}/stock-changing/${id}`)
                .then(resp => resp.data)
                .then(j => {
                    if (!j.order && j.deliverySheet && j.deliverySheet.order)
                        j.order = j.deliverySheet.order;

                    this.state.form = j
                    // return j._links.repo.href
                    // })
                    // .then(url => axios.get(url))
                    // .then(resp => {
                    //     this.state.form.repo = resp.data
                    //     return this.state.form._links.reason.href
                    // })
                    // .then(url => axios.get(url))
                    // .then(resp => {
                    //     this.state.form.reason = resp.data
                    //     return this.state.form._links.applicant.href
                    // })
                    // .then(url => axios.get(url))
                    // .then(resp => {
                    //     this.state.form.applicant = resp.data
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

                    //
                    // return this.state.form._links.order.href
                })
                .catch(e => this.props.showSnackbar(e.message))

            // .then(url => axios.get(url))
            // .then(resp => resp.data)
            // .then(order => this.setState({ form: { ...this.state.form, order } }))
            // .catch(e => `${DATA_API_BASE_URL}/repoChangings/${id}/purchasingOrder`)

            // .then(url => axios.get(url))
            // .then(resp => resp.data)
            // .then(purchasingOrder => this.setState({ form: { ...this.state.form, purchasingOrder } }))
            // .catch(e => this.props.showSnackbar(e.message))
        }

        // load materials
        axios.get(`${DATA_API_BASE_URL}/materials`)
            .then(resp => resp.data._embedded.materials)
            .then(j => {
                this.setState({ materials: j });
            })
            .catch(e => this.props.showSnackbar(e.message));

        // load repositories
        axios.get(`${DATA_API_BASE_URL}/repoes`)
            .then(resp => resp.data._embedded.repoes)
            .then(j => {
                if (mode === MODE_ADD)
                    this.state.form.repo = j[0]
                else if (mode === MODE_DELIVERY) {
                    j = j.filter(r => r.type === 1)
                    this.state.form.repo = j[0]
                }

                this.setState({ repoes: j });
            })
            .catch(e => this.props.showSnackbar(e.message));

        // load changing reason
        axios.get(`${DATA_API_BASE_URL}/repoChangingReasons`)///search/findByType?type=${this.state.form.type}`)
            .then(resp => resp.data._embedded.repoChangingReasons)
            .then(j => {
                // this.state.form.reason = j[0]
                if (mode === MODE_ADD)
                    this.state.form.reason = j.filter(r => r.type === this.state.form.type)[0]

                this.setState({ repoChangingReasons: j });
            })
            .catch(e => this.props.showSnackbar(e.message));
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.mode === MODE_ADD && !prevProps.user && this.props.user) {
            this.state.form.applicant = this.props.user
            this.forceUpdate()
        }
    }

    render() {
        const { type, classes, } = this.props
        // const { id } = this.props.match.params;
        const { mode, form, changingItems, materials } = this.state;
        const { dirty, orderSpecified, selectMaterial, } = this.state;
        const { errors, } = this.state;

        let shrinkLabel = mode === MODE_ADD ? undefined : true;

        const { showSavingDiag, activeStep } = this.state;

        let filteredMaterials = materials.filter(m => form.repo && form.repo.type === m.category)

        //#region title
        let title = "";
        switch (type) {

            case TYPE_STOCK_IN: {
                switch (mode) {
                    case MODE_ADD:
                        title = "填写入库单";
                        break;
                    case MODE_VIEW:
                        title = "查看入库单";
                        break;
                    case MODE_EDIT:
                        title = "编辑入库单";
                        break;
                    default:
                        break;
                }

                break
            }

            case TYPE_STOCK_OUT: {
                switch (mode) {
                    case MODE_ADD:
                        title = "填写出库单";
                        break;
                    case MODE_VIEW:
                        title = "查看出库单";
                        break;
                    case MODE_EDIT:
                        title = "编辑出库单";
                        break;
                    default:
                        break;
                }

                break;
            }

            case TYPE_STOCK_IN_OUT: {
                if (form) {
                    if (form.type === REPO_CHANGING_TYPE_IN)
                        title = "处理入库单";
                    else
                        title = "处理出库单";
                } else
                    title = "处理出/入库单";
                break;
            }

            default:
                break
        }
        //#endregion

        // enable edit
        const disableEdit = type === TYPE_STOCK_IN_OUT || mode === MODE_VIEW

        //#region actions
        const actions = type === TYPE_STOCK_IN_OUT ?
            <React.Fragment>
                <Tooltip title="受理此表单并开始处理">
                    <Button disabled={form.status === 2} onClick={() => this.processForm()} color='primary' style={{ fontSize: 18 }} >处理<ClipboardCheckOutline /></Button></Tooltip>
                <Tooltip title="拒绝受理此表单">
                    <Button disabled={form.status === 2} onClick={() => this.rejectForm()} color='secondary' style={{ fontSize: 18 }} >拒绝<CloseOctagonOutline /></Button></Tooltip>
            </React.Fragment>
            :
            <React.Fragment>
                {mode === MODE_DELIVERY ? null :
                    <Tooltip title="保存表单">
                        <Button onClick={() => this.saveForm(false)} disabled={!dirty || form.status === 2} color='primary' style={{ fontSize: 18 }} >保存<ContentSave /></Button></Tooltip>
                }
                <Tooltip title="保存表单，然后提交给仓库管理员">
                    <Button onClick={() => this.saveForm(true)} color='secondary' disabled={(!dirty && mode !== MODE_EDIT) || mode === MODE_VIEW || form.status === 2} style={{ fontSize: 18 }} >{dirty ? "保存并提交" : "提交"}<ContentSave /></Button></Tooltip>
            </React.Fragment>
        //#endregion

        //#region order info
        let orderInfo = null;

        if (form && form.reason && form.reason.orderRelated) {
            let oi = { error: errors['form.order'] };

            if (form.type === REPO_CHANGING_TYPE_OUT && form.reason.orderRelated === 1) {
                oi.onClick = this.selectDeliverySheet;
                oi.disabled = disableEdit;// || form.deliverySheet;
                oi.title = form.deliverySheet ? '发货单' : '选择发货单';
                oi.no = form.deliverySheet ? form.deliverySheet.no : null;
                oi.name = form.order && form.order.client ? form.order.client.name : null;
            } else if (form.type === REPO_CHANGING_TYPE_OUT && form.reason.orderRelated === 3) {
                oi.onClick = this.doSelectBom;
                oi.disabled = disableEdit;// || form.bom;
                oi.title = form.bom ? 'BOM单' : '选择BOM单';
                oi.no = form.order ? form.order.no : null;
                oi.name = form.bom && form.bom.orderItem && form.bom.orderItem.product ? form.bom.orderItem.product.code : null;
            } else if (form.type === REPO_CHANGING_TYPE_IN && form.reason.orderRelated === 2) {
                oi.onClick = this.selectPurchasingOrder;
                oi.disabled = disableEdit;// || form.purchasingOrder;
                oi.title = form.purchasingOrder ? '采购计划' : '选择采购计划';
                oi.no = form.purchasingOrder ? form.purchasingOrder.no : null;
                oi.name = form.purchasingOrder && form.purchasingOrder._embedded && form.purchasingOrder._embedded.supplier ? form.purchasingOrder._embedded.supplier.name : null;
            }

            orderInfo = oi.onClick ? <OrderInfo {...oi} /> : null;
        }
        //#endregion

        //
        return this.state.repoes && this.state.materials && this.state.repoChangingReasons ? (
            // <Provider store={store}>
            <React.Fragment>

                <div className={classes.contentRoot}>

                    <Toolbar className={classes.toolbar}>
                        <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                        <Typography variant="title" className={classes.title}>{title}</Typography>
                        {actions}
                    </Toolbar>

                    <Typography variant="title" className={classes.subTitle}>基本信息</Typography>

                    <Paper className={classes.paper}>
                        <MuGrid container direction='column' alignItems="stretch">

                            {type === TYPE_STOCK_IN_OUT ?
                                <MuGrid style={{ marginBottom: 16 }}>
                                    {form.type === REPO_CHANGING_TYPE_IN ?
                                        <Chip label="入库" style={{ color: 'white', backgroundColor: COLOR_STOCK_IN }} />
                                        :
                                        <Chip label="出库" style={{ color: 'white', backgroundColor: COLOR_STOCK_OUT }} />}
                                </MuGrid>
                                : null
                            }

                            <MuGrid style={{ marginBottom: 16 }}>
                                <TextField
                                    id="applicant"
                                    // required
                                    disabled//={disableEdit}
                                    // select
                                    // error={!!errors['form.applicant']}
                                    label="制单人"
                                    style={{ width: 200 }}
                                    value={form.applicant ? form.applicant.name : ""}
                                    // onChange={e => this.handleInput(e)}
                                    InputLabelProps={{
                                        shrink: shrinkLabel,
                                    }}
                                />
                            </MuGrid>

                            <MuGrid style={{ marginBottom: 16 }}>
                                <TextField
                                    id="no"
                                    required
                                    disabled={disableEdit}
                                    // select
                                    error={!!errors['form.no']}
                                    label="单号"
                                    style={{ width: 200 }}
                                    value={form.no}
                                    onChange={e => this.handleInput(e)}
                                    InputLabelProps={{
                                        shrink: shrinkLabel,
                                    }}
                                />
                            </MuGrid>

                            <MuGrid style={{ marginBottom: 16 }}>
                                <FormControl className={classes.formControl} disabled={disableEdit}>
                                    <InputLabel htmlFor="repo" shrink>仓库</InputLabel>
                                    <Select
                                        native
                                        value={form.repo ? form.repo.id : null}
                                        onChange={this.onChangedRepo}
                                        inputProps={{
                                            name: 'repo',
                                            id: 'repo',
                                        }}
                                    >
                                        {this.state.repoes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </Select>
                                </FormControl>
                            </MuGrid>

                            <MuGrid style={{ marginBottom: 16 }}>
                                <FormControl className={classes.formControl} disabled={disableEdit || mode === MODE_DELIVERY}>
                                    <InputLabel htmlFor="reason" shrink>原因类别</InputLabel>
                                    <Select
                                        native
                                        value={this.state.form.reason ? this.state.form.reason.id : null}
                                        onChange={this.changedReason}
                                        inputProps={{
                                            name: 'reason',
                                            id: 'reason',
                                        }}
                                    >
                                        {
                                            this.state.repoChangingReasons
                                                .filter(r => r.type === form.type)
                                                .map(r => <option key={r.id} value={r.id}>{r.reason}</option>)}
                                    </Select>
                                </FormControl>

                                <TextField
                                    id="reasonDetail"
                                    disabled={disableEdit}
                                    label="原因描述"
                                    defaultValue=""
                                    className={classes.textFieldWithoutWidth}
                                    value={form ? form.reasonDetail : ""}
                                    onChange={e => this.handleInput(e)}
                                    multiline
                                    fullWidth
                                    rowsMax="4"
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: shrinkLabel,
                                    }}
                                />
                            </MuGrid>

                            {/* {form && form.type === REPO_CHANGING_TYPE_OUT && form.reason && form.reason.orderRelated === 1 ?
                                <MuGrid >
                                    <Button onClick={this.selectDeliverySheet} disabled={disableEdit || form.deliverySheet}>
                                        <ClipboardText color="primary" />{type === TYPE_STOCK_IN_OUT || form.deliverySheet ? '发货单' : '选择发货单'}
                                    </Button>
                                    {form.deliverySheet ? <React.Fragment>
                                        <Chip label={form.deliverySheet.no} style={{ marginLeft: 16 }} />
                                        <Chip label={form.order.client.name} style={{ marginLeft: 8 }} />
                                    </React.Fragment> :
                                        (!!errors['form.order'] ? <Typography className={classes.error} style={{ marginLeft: '1em' }}>{errors['form.order']}</Typography> : null)}
                                </MuGrid>
                                : form.type === REPO_CHANGING_TYPE_IN && this.state.form && this.state.form.reason && this.state.form.reason.orderRelated === 2 ?
                                    <MuGrid >
                                        <Button onClick={this.selectPurchasingOrder} disabled={disableEdit || form.purchasingOrder}>
                                            <ClipboardText color="primary" />{type === TYPE_STOCK_IN_OUT || purchasingOrder ? '采购计划' : '选择采购计划'}
                                        </Button>
                                        {form.purchasingOrder ? <React.Fragment>
                                            <Chip label={form.purchasingOrder.no} style={{ marginLeft: 16 }} />
                                            <Chip label={form.purchasingOrder.supplier.name} style={{ marginLeft: 8 }} />
                                        </React.Fragment> :
                                            (!!errors['form.order'] ? <Typography className={classes.error} style={{ marginLeft: '1em' }}>{errors['form.order']}</Typography> : null)}
                                    </MuGrid>
                                    : form.type === REPO_CHANGING_TYPE_OUT && this.state.form && this.state.form.reason && this.state.form.reason.orderRelated === 3 ?
                                        <MuGrid >
                                            <Button onClick={this.selectPurchasingOrder} disabled={disableEdit || orderSpecified}>
                                                <ClipboardText color="primary" />{type === TYPE_STOCK_IN_OUT || orderSpecified ? 'BOM单' : '选择BOM单'}
                                            </Button>
                                            {form.purchasingOrder ? <React.Fragment>
                                                <Chip label={form.purchasingOrder.no} style={{ marginLeft: 16 }} />
                                                <Chip label={form.purchasingOrder.supplier.name} style={{ marginLeft: 8 }} />
                                            </React.Fragment> :
                                                (!!errors['form.order'] ? <Typography className={classes.error} style={{ marginLeft: '1em' }}>{errors['form.order']}</Typography> : null)}
                                        </MuGrid>
                                        : null} */}
                            {orderInfo}
                        </MuGrid>
                    </Paper>

                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography variant="title" className={classes.subTitle} style={{ display: 'inline-flex' }}>明细</Typography>
                        {errors['changingItems'] ? <Typography className={classes.subTitle} style={{ display: 'inline-flex', color: '#f44336' }}>{errors['changingItems']}</Typography> : null}
                        {type === TYPE_STOCK_IN ? (
                            <React.Fragment>
                                <div style={{ display: 'inline-flex', flex: 1 }} />
                                <Typography variant="title" className={classes.subTitle} color='secondary' marginleft={0}>总价：{form.value ? `¥ ${toFixedMoney(form.value)}` : '--'}</Typography>
                            </React.Fragment>) : null}
                    </div>
                    <Paper className={classes.compactPaper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding='dense' style={{ width: '20%', whiteSpace: 'nowrap' }}>材料编号</TableCell>
                                    <TableCell padding='dense' style={{ width: '20%', whiteSpace: 'nowrap' }}>材料名称</TableCell>
                                    <TableCell padding='dense' style={{ width: '10%', whiteSpace: 'nowrap' }}>类型</TableCell>
                                    <TableCell padding='dense' style={{ width: '10%', whiteSpace: 'nowrap' }}>规格</TableCell>
                                    <TableCell padding='dense' style={{ width: '10%', whiteSpace: 'nowrap' }}>数量</TableCell>
                                    {form.type === REPO_CHANGING_TYPE_OUT ? null : (
                                        <React.Fragment>
                                            <TableCell padding='dense' style={{ width: '10%', whiteSpace: 'nowrap' }}>价格</TableCell>
                                            <TableCell padding='dense' style={{ width: '10%', whiteSpace: 'nowrap' }}>小计</TableCell>
                                        </React.Fragment>
                                    )}
                                    <TableCell padding='dense' style={{ padding: 0, whiteSpace: 'nowrap' }}>
                                        {disableEdit || orderSpecified ? null :
                                            <Button variant="flat" size="large" onClick={() => this.setState({ selectMaterial: true })}>
                                                <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增</Button>
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
                                            <TableCell padding='dense' style={{ width: '20%', whiteSpace: 'nowrap' }}>{m.code}</TableCell>
                                            <TableCell padding='dense' style={{ width: '20%', whiteSpace: 'nowrap' }}>{m.name}</TableCell>
                                            <TableCell padding='dense' style={{ width: '10%', whiteSpace: 'nowrap' }}>{m.type.name}</TableCell>
                                            <TableCell padding='dense' style={{ width: '10%', whiteSpace: 'nowrap' }}>{m.spec}</TableCell>
                                            <TableCell padding='dense' numeric style={{ width: '10%', whiteSpace: 'nowrap' }}>
                                                <TextField type="number" required id={`quantity_${m.id}`}
                                                    value={n.quantity}
                                                    fullWidth
                                                    disabled={disableEdit || orderSpecified}
                                                    error={!!errors[`quantity_${m.id}`]}
                                                    margin="normal"
                                                    inputProps={{ min: 0 }}
                                                    // InputProps={{
                                                    //     endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                                    // }}
                                                    onChange={e => this.handleQuantityChange(e, m.id, no)}
                                                />
                                            </TableCell>

                                            {form.type === REPO_CHANGING_TYPE_OUT ? null : (
                                                <React.Fragment>
                                                    <TableCell padding='dense' numeric style={{ width: '10%', whiteSpace: 'nowrap' }}>
                                                        <TextField type="number" required id={`price_${m.id}`}
                                                            value={n.price ? toFixedMoney(n.price) : null}
                                                            disabled={disableEdit || m.category === 1 || orderSpecified}
                                                            fullWidth
                                                            error={!!errors[`price_${m.id}`]}
                                                            margin="normal"
                                                            inputProps={{ min: 0 }}
                                                            // InputProps={{
                                                            //     endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                                            // }}
                                                            onChange={e => this.handlePriceChange(e, m.id, no)}
                                                        />
                                                    </TableCell>

                                                    <TableCell padding='dense' numeric style={{ width: '10%', whiteSpace: 'nowrap' }}>{toFixedMoney(subtotal)}</TableCell>
                                                </React.Fragment>
                                            )}

                                            <TableCell padding='dense' style={{ whiteSpace: 'nowrap', padding: 0 }}>
                                                {disableEdit || orderSpecified ? null :
                                                    <Tooltip title="删除">
                                                        <IconButton onClick={() => this.onDelete(m.id, no)}>
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
                    </Paper>

                </div>


                {/* dialog for add materials */}
                <DialogSelectMaterials
                    show={selectMaterial}
                    title='添加材料/产品'
                    data={filteredMaterials}
                    onSelected={this.addMaterials}
                    onCancel={this.cancelSelect} />


                {/* dialog for select purchasing order */}
                <DialogSelectPurchasingOrder
                    show={this.state.showSelectPurchasingOrder}
                    title='选择采购订单'
                    data={this.state.purchasingOrders}
                    onSelected={this.onSelectedPurchasingOrder}
                    onCancel={this.cancelSelectPurchasingOrder} />


                {/* dialog for select purchasing order */}
                <DialogSelectBom
                    show={this.state.showSelectBom}
                    title='选择BOM单'
                    data={this.state.boms}
                    onSelected={this.onSelectedBom}
                    onCancel={this.cancelSelectBom} />


                {/* dialog for select delivery sheet */}
                <DialogSelectDeliverySheet
                    show={this.state.showSelectDeliverySheet}
                    title='选择发货单'
                    data={this.state.deliverySheets}
                    onSelected={this.onSelectedDeliverySheet}
                    onCancel={this.cancelSelectDeliverySheet} />


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
                        <Button onClick={this.onSaveSuccess} disabled={this.state.activeStep < savingSteps.length - 1} color="primary">确定</Button>
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
        ) : null
    }
}

const OrderInfo = withStyles(styles)(function (props) {
    return <MuGrid >
        <Button onClick={props.onClick} disabled={props.disabled}>
            <ClipboardText color="primary" />{props.title}
        </Button>
        {props.no ? <React.Fragment>
            <Chip label={props.no} style={{ marginLeft: 16 }} />
            <Chip label={props.name} style={{ marginLeft: 8 }} />
        </React.Fragment> :
            (props.error ? <Typography className={props.classes.error} style={{ marginLeft: '1em' }}>{props.error}</Typography> : null)}
    </MuGrid>
})

// const  withStyles(styles)(OrderInfo)


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
    token: state.main.token,
    user: state.main.user,
})

const mapDispatchToProps = dispatch => ({
    //
    showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
})

const ConnectedComponent = connect(
    mapStateToProps,
    mapDispatchToProps
)(RepoChangingSheetPage)

export default withStyles(styles)(ConnectedComponent);