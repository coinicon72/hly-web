// @flow

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Loadable from 'react-loadable';
import Loading from './loading-component';

import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { withStyles, Typography } from '@material-ui/core';

import axios from 'axios'

//
import { connect } from 'react-redux'

import { actionShowSnackbar } from "./redux/data_selection"

//
import * as config from "./config"

import CommonStyles, { COLOR_STOCK_IN, COLOR_STOCK_OUT } from "./common_styles"

import { CurrencyTypeProvider } from "./common_components"

import DataTableBase from "./data_table_base"
// const DataTableBase = Loadable({
//   loader: () => import("./data_table_base"),
//   loading: Loading,
// });


// =============================================
const DATA_REPO = "repoChangings";

const COLUMNS_OUT = [
    { name: 'id', title: '序号' },
    { name: "repo", title: "仓库", getCellValue: row => row.repo ? row.repo.name : null },
    { name: "applicant", title: "申请人", getCellValue: row => row.applicant ? row.applicant.name : null },
    { name: "department", title: "部门" },
    { name: "createDate", title: "创建日期", getCellValue: row => row.createDate.split('T')[0] },
    { name: "reason", title: "原因", getCellValue: row => row.reason ? row.reason.reason : null },
]

const COLUMNS_IN = [
    ...COLUMNS_OUT,
    { name: "amount", title: "总额" },
]

const COLUMNS_IN_OUT = [
    { name: 'id', title: '序号' },
    { name: 'type', title: '类型', getCellValue: row => row.type == 1 ? "入库" : "出库" },
    { name: "repo", title: "仓库", getCellValue: row => row.repo ? row.repo.name : null },
    { name: "applicant", title: "申请人", getCellValue: row => row.applicant ? row.applicant.name : null },
    { name: "department", title: "部门" },
    { name: "applyingDate", title: "申请日期", getCellValue: row => row.applyingDate.split('T')[0] },
    { name: "reason", title: "原因", getCellValue: row => row.reason ? row.reason.reason : null },
    { name: "amount", title: "总额", getCellValue: row => row.type == 1 ? row.amount : "" },
]


const ChangingTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={({ row, value }) =>
            <Typography key={row.type} style={row.type == 1 ? { color: COLOR_STOCK_IN } : { color: COLOR_STOCK_OUT }}>{value}</Typography>}
        {...props}
    />
);


// =============================================
class PurchingPlanPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            dataFilter: "",
            dataRepoApiUrl: "",
            columns: [],

            ready4UI: false,
        }

        // this.state.dataRepoApiUrl = config.API_BASE_URL + DATA_REPO + DATA_FILTER;

        // this.editingColumnExtensions = EDITING_COLUMN_EXTENSIONS;

        // this.changeAddedRowsCallback = (row => {
        //     return Object.keys(row).length ? row : NEW_ROW_TEMPLATE
        // });

        this.doLoad = this.doLoad.bind(this)
        this.doAdd = this.doAdd.bind(this)
        this.doUpdate = this.doUpdate.bind(this)
        this.doDelete = this.doDelete.bind(this)

        this.addRowHandler = () => this.props.history.push(`${this.props.match.path}/add`);
    }

    componentDidMount() {
        this.updateDataFilter();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevProps.user && this.props.user) {
            this.updateDataFilter();
        }
    }

    updateDataFilter() {
        let { type, user } = this.props;

        // if (!user)
        //     user = { id: -1 }

        switch (type) {
            case config.TYPE_STOCK_IN:
                if (user)
                    this.state.dataFilter = `/search/findByTypeAndStatusAndApplicant?type=1&status=0&user=../../../users/${user.id}`;
                else
                    this.state.dataFilter = "/search/findByTypeAndStatus?type=1&status=-1";
                this.state.columns = COLUMNS_IN;
                break;
            case config.TYPE_STOCK_OUT:
                if (user)
                    this.state.dataFilter = `/search/findByTypeAndStatusAndApplicant?type=-1&status=0&user=../../../users/${user.id}`;
                else
                    this.state.dataFilter = "/search/findByTypeAndStatus?type=-1&status=-1";
                this.state.columns = COLUMNS_OUT;
                break;
            case config.TYPE_STOCK_IN_OUT:
                this.state.dataFilter = "/search/findStockInOutByStatus?status=1";
                this.state.columns = COLUMNS_IN_OUT;
                break;
        }
        this.setState({ dataRepoApiUrl: config.DATA_API_BASE_URL + DATA_REPO + this.state.dataFilter, ready4UI: true });
    }

    doLoad = () => {
        return axios.get(this.state.dataRepoApiUrl)//,
            .then(resp => resp.data._embedded[DATA_REPO])
    }

    doAdd = (r) => {
        return axios.post(this.state.dataRepoApiUrl, r)
            .then(resp => resp.data)
    }

    doUpdate = (r, c) => {
        return axios.patch(this.state.dataRepoApiUrl + "/" + r['id'], c)
            .then(resp => resp.data)
    }

    doDelete = (r) => {
        return axios.delete(this.state.dataRepoApiUrl + "/" + r['id'])
    }

    onRowDoubleClicked = (row) => {
        if (row) {
            if (this.props.type == config.TYPE_STOCK_IN_OUT)
                this.props.history.push(`${this.props.match.path}/${row.id}`);
            else
                this.props.history.push(`${this.props.match.path}/edit/${row.id}`);
        }
    }

    render() {
        const { classes, width, type } = this.props
        const { ready4UI, columns } = this.state

        return (
            ready4UI &&
            <div className={classes.contentRoot}>
                <DataTableBase columns={columns}
                    editCell={this.editCell}
                    changeAddedRowsCallback={this.changeAddedRowsCallback}
                    editingColumnExtensions={this.editingColumnExtensions}
                    doLoad={this.doLoad}
                    doAdd={this.doAdd}
                    doUpdate={this.doUpdate}
                    doDelete={this.doDelete}
                    addHandler={this.addRowHandler}
                    showEditCommand={false}
                    disableEdit={type === config.TYPE_STOCK_IN_OUT}
                    clickHandler={this.onRowDoubleClicked}
                    providers={[
                        <ChangingTypeProvider for={['type']} />,
                        <CurrencyTypeProvider for={['amount']} />,
                    ]}
                />
            </div>
        )
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ... {
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
)(PurchingPlanPage)


export default withStyles(styles)(ConnectedComponent);