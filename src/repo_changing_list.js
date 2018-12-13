// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

// import Loadable from 'react-loadable';
// import Loading from './loading-component';

// import { DataTypeProvider } from '@devexpress/dx-react-grid';
import {
    withStyles,
    // Typography
} from '@material-ui/core';

import axios from 'axios'

//
import { connect } from 'react-redux'

import { actionShowSnackbar } from "./redux/data_selection"

//
import {
    TYPE_STOCK_IN, TYPE_STOCK_OUT, TYPE_STOCK_IN_OUT,
} from "./common"
import { API_BASE_URL, DATA_API_BASE_URL } from "./config"

import CommonStyles from "./common_styles"

import { CurrencyTypeProvider, RepoChangingTypeProvider, RepoChangingStatusProvider } from "./common_components"
import { REPO_CHANGING_TYPE_IN, REPO_CHANGING_TYPE_OUT } from "./common"
import { toDateString } from "./utils"

import DataTableBase from "./data_table_base"


// =============================================
const COLUMNS_OUT = [
    { name: 'id', title: '序号' },
    { name: "createDate", title: "创建日期", getCellValue: row => toDateString(row.createDate) },
    { name: 'no', title: '单号' },
    { name: "repo", title: "仓库" },
    { name: "reason", title: "原因" },
    { name: "client", title: "客户" },
    { name: "name", title: "产品名称" },
    { name: "type", title: "类型" },
    { name: "spec", title: "规格" },
    { name: "unit", title: "单位" },
    { name: "quantity", title: "数量" },
]

const COLUMNS_IN = [
    { name: 'id', title: '序号' },
    { name: "createDate", title: "创建日期", getCellValue: row => toDateString(row.createDate) },
    { name: 'no', title: '单号' },
    { name: "repo", title: "仓库" },
    { name: "reason", title: "原因" },
    { name: "supplier", title: "供应商" },
    { name: "name", title: "产品名称" },
    { name: "type", title: "类型" },
    { name: "spec", title: "规格" },
    { name: "unit", title: "单位" },
    { name: "quantity", title: "数量" },
]

// const COLUMNS_IN_OUT = [
//     { name: 'id', title: '序号' },
//     { name: 'no', title: '单号' },
//     { name: 'type', title: '类型' },
//     { name: "repo", title: "仓库", getCellValue: row => row.repo ? row.repo.name : null },
//     { name: "applicant", title: "申请人", getCellValue: row => row.applicant ? row.applicant.name : null },
//     { name: "department", title: "部门" },
//     { name: "applyingDate", title: "申请日期", getCellValue: row => row.applyingDate ? row.applyingDate.split('T')[0] : null },
//     { name: "reason", title: "原因", getCellValue: row => row.reason ? row.reason.reason : null },
//     { name: "status", title: "状态" },
//     { name: "amount", title: "总额", getCellValue: row => row.type === REPO_CHANGING_TYPE_IN ? row.amount : "" },
//     { name: "totalQuantity", title: "总数量" },
// ]


// =============================================
class RepoChangingListPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            // dataFilter: "",
            dataRepoApiUrl: "",
            columns: [],

            ready4UI: false,
        }

        this.doLoad = this.doLoad.bind(this)
    }

    componentDidMount() {
        // this.updateDataFilter();
        // }

        // componentDidUpdate(prevProps, prevState, snapshot) {
        //     if (!prevProps.user && this.props.user) {
        //         this.updateDataFilter();
        //     }
        // }

        // updateDataFilter() {
        let { type } = this.props;

        //     //
        let url = type === TYPE_STOCK_OUT ? `${API_BASE_URL}/all-stock-out` : `${API_BASE_URL}/all-stock-in`
        let columns = type === TYPE_STOCK_OUT ? COLUMNS_OUT : COLUMNS_IN;

        // switch (type) {
        //     case TYPE_STOCK_IN:
        //             if (user)
        //                 // this.state.dataFilter = `/search/findByTypeAndApplicant?type=${REPO_CHANGING_TYPE_IN}&user=../../../users/${user.id}`;
        //                 url = `${API_BASE_URL}/stock-in`
        //             else
        //                 // this.state.dataFilter = `/search/findByTypeAndStatus?type=${REPO_CHANGING_TYPE_IN}&status=-1`;
        //                 url = `${API_BASE_URL}/stock-in/rejected`
        //             columns = COLUMNS_IN;
        //     break;

        // case TYPE_STOCK_OUT:
        //             if (user)
        //                 // this.state.dataFilter = `/stockOuts`;
        //                 url = `${API_BASE_URL}/stock-out`
        //             else
        //                 // this.state.dataFilter = `/search/findByTypeAndStatus?type=${REPO_CHANGING_TYPE_OUT}&status=-1`;
        //                 url = `${API_BASE_URL}/stock-out/rejected`
        //             columns = COLUMNS_OUT;
        //             break;
        //         // case TYPE_STOCK_IN_OUT:
        //         //     this.state.columns = COLUMNS_IN_OUT;
        //         break;

        //     default:
        //         break
        // }

        //
        this.setState({ dataRepoApiUrl: url, columns, ready4UI: true });
    }

    // { name: 'id', title: '序号' },
    // { name: "createDate", title: "创建日期", getCellValue: row => toDateString(row.createDate) },
    // { name: 'no', title: '单号' },
    // { name: "repo", title: "仓库", getCellValue: row => row.repo ? row.repo.name : null },
    // { name: "reason", title: "原因", getCellValue: row => row.reason ? row.reason.reason : null },
    // { name: "supplier", title: "供应商" },
    // { name: "name", title: "产品名称" },
    // { name: "type", title: "类型" },
    // { name: "spec", title: "规格" },
    // { name: "unit", title: "单位" },
    // { name: "quantity", title: "数量" },
    doLoad = () => {
        return axios.get(this.state.dataRepoApiUrl)//,
            .then(resp => resp.data)
            .then(d => {
                const { type } = this.props;
                // let its = []

                // d.forEach(c => {
                //     c.items.forEach(m => {
                //         let it = {
                //             id: c.id,
                //             createDate: c.createDate,
                //             no: c.no,
                //             repo: c.repo.name,
                //             reason: c.reason.reason,
                //             name: m.material.name,
                //             type: m.material.type,
                //             spec: m.material.spec,
                //             // unit: m.material.unit,
                //             quantity: m.quantity,
                //         }
                //         if (type === TYPE_STOCK_IN)
                //             it.supplier = c.supplier ? c.supplier.name : null
                //         else
                //             it.client = c.order.client.name

                //         // it.push()
                //     })
                // })

                let its = d.flatMap(c => c.items.map(m => {
                    let it = {
                        key: `${c.id}-${m.material.id}`,
                        id: c.id,
                        createDate: c.createDate,
                        no: c.no,
                        repo: c.repo.name,
                        reason: c.reason.reason,
                        name: m.material.name,
                        type: m.material.type.name,
                        spec: m.material.spec,
                        // unit: m.material.unit,
                        quantity: m.quantity,
                    }
                    if (type === TYPE_STOCK_IN)
                        it.supplier = c.purchasingOrder && c.purchasingOrder.supplier ? c.purchasingOrder.supplier.name : null
                    else
                        it.client = c.order && c.order.client ? c.order.client.name : null

                    return it;
                }))

                return its;
            })
    }

    render() {
        const { classes, type } = this.props
        const { ready4UI, columns } = this.state

        return (
            ready4UI &&
            <div className={classes.contentRoot}>
                <DataTableBase columns={columns}
                    disableEdit={true}
                    doLoad={this.doLoad}
                    showEditCommand={false}
                    providers={[
                        <RepoChangingStatusProvider for={['status']} />,
                    ]}
                />
            </div>
        )
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ...{
    },
})

// const mapStateToProps = state => ({
//     token: state.main.token,
//     user: state.main.user,
// })

const mapDispatchToProps = dispatch => ({
    //
    showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
})

const ConnectedComponent = connect(
    // mapStateToProps,
    null,
    mapDispatchToProps
)(RepoChangingListPage)


export default withStyles(styles)(ConnectedComponent);