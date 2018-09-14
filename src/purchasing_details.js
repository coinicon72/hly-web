// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

// import Loadable from 'react-loadable';
// import Loading from './loading-component';

import { withStyles, Typography, Select, Input } from '@material-ui/core';
import { DataTypeProvider } from '@devexpress/dx-react-grid';

import axios from 'axios'

//
import { connect } from 'react-redux'

import { actionShowSnackbar } from "./redux/data_selection"

//
import {API_BASE_URL, DATA_API_BASE_URL} from "./config"

import CommonStyles from "./common_styles"

// import { CurrencyTypeProvider } from "./common_components"

import DataTableBase from "./data_table_base"
import { toDateString } from './utils'
import { TaxTypeEditor, TaxTypeProvider } from './common_components'


// =============================================
const DATA_REPO = "purchasingOrders";

const DETAIL_PAGE_URL = "/purchasingOrderDetails";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: "date", title: "采购日期"},
    { name: "repoDate", title: "入库日期"},
    { name: "repoNo", title: "入库编号"},
    { name: "repo", title: "仓库"},
    { name: "supplier", title: "供应商" },
    { name: "name", title: "产品名称"},
    { name: "type", title: "类型"},
    { name: "spec", title: "规格"},
    { name: 'unit', title: '单位' },
    { name: 'quantity', title: '数量' },
    { name: 'price', title: '单价' },
    { name: 'subtotal', title: '总价' },
    { name: "tax", title: "税率" },
    { name: "tev", title: "不含税总价" },
]


// =============================================
class PurchasingOrderPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            // dataFilter: "",
            // dataRepoApiUrl: "",
            columns: [],

            dataRepoApiUrl: `${API_BASE_URL}/${DATA_REPO}`,
            // ready4UI: false,
        }


        // this.editingColumnExtensions = EDITING_COLUMN_EXTENSIONS;

        // this.changeAddedRowsCallback = (row => {
        //     return Object.keys(row).length ? row : NEW_ROW_TEMPLATE
        // });

        this.doLoad = this.doLoad.bind(this)
        this.doAdd = this.doAdd.bind(this)
        this.doUpdate = this.doUpdate.bind(this)
        this.doDelete = this.doDelete.bind(this)

        this.addRowHandler = () => this.props.history.push(DETAIL_PAGE_URL);
    }

    componentDidMount() {
        // this.updateDataFilter();
    }

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     if (!prevProps.user && this.props.user) {
    //         this.updateDataFilter();
    //     }
    // }

    doLoad = () => {
        return axios.get(`${DATA_API_BASE_URL}/purchasingOrders/search/findBySigner?signer=../../../users/${this.props.user.id}`)//,
            .then(resp => resp.data._embedded[DATA_REPO])
    }

    // doAdd = (r) => {
    //     return axios.post(this.state.dataRepoApiUrl, r)
    //         .then(resp => resp.data)
    // }

    // doUpdate = (r, c) => {
    //     return axios.patch(this.state.dataRepoApiUrl + "/" + r['id'], c)
    //         .then(resp => resp.data)
    // }

    // doDelete = (r) => {
    //     return axios.delete(this.state.dataRepoApiUrl + "/" + r['id'])
    // }

    // onRowDoubleClicked = (row) => {
    //     if (row) {
    //             this.props.history.push(`${DETAIL_PAGE_URL}/${row.id}`);
    //     }
    // }

    render() {
        const { classes, } = this.props

        return (
            <div className={classes.contentRoot}>
                <DataTableBase columns={COLUMNS}
                    editCell={this.editCell}
                    changeAddedRowsCallback={this.changeAddedRowsCallback}
                    editingColumnExtensions={this.editingColumnExtensions}
                    doLoad={this.doLoad}
                    doAdd={this.doAdd}
                    doUpdate={this.doUpdate}
                    doDelete={this.doDelete}
                    addHandler={this.addRowHandler}
                    showEditCommand={false}
                    disableEdit={true}
                    clickHandler={this.onRowDoubleClicked}
                    providers={[
                        <TaxTypeProvider for={['tax']} />,
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
)(PurchasingOrderPage)


export default withStyles(styles)(ConnectedComponent);