// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

// import Loadable from 'react-loadable';
// import Loading from './loading-component';

import {
    withStyles,
    // Typography, Select, Input 
} from '@material-ui/core';
// import { DataTypeProvider } from '@devexpress/dx-react-grid';

import axios from 'axios'

//
import { connect } from 'react-redux'

import { actionShowSnackbar } from "./redux/data_selection"

//
import { API_BASE_URL, DATA_API_BASE_URL } from "./config"

import CommonStyles from "./common_styles"

// import { CurrencyTypeProvider } from "./common_components"

import DataTableBase from "./data_table_base"
import { toDateString } from './utils'
import { InventoryStatusProvider, TaxTypeProvider } from './common_components'


// =============================================
const DATA_REPO = "inventories";

const ADD_INVENTORY_PAGE_URL = "/add_inventory";
const DETAIL_PAGE_URL = "/inventory_details";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: 'repo', title: '仓库', getCellValue: row => row.repo ? row.repo.name : null },
    { name: 'createDate', title: '日期' },
    { name: "reportBy", title: "录入", getCellValue: row => row.reportBy ? row.reportBy.name : null },
    { name: "auditBy", title: "审核", getCellValue: row => row.auditBy ? row.auditBy.name : null },
    { name: "status", title: "状态" },
]


// =============================================
class InventoryPage extends React.PureComponent {
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
        return axios.get(`${API_BASE_URL}/inventories`)//,
            .then(resp => resp.data)
            .then(d => {
                let r = d.map(i => i.reportBy).filter(i => i && typeof (i) == 'object')
                let a = d.map(i => i.auditBy).filter(i => i && typeof (i) == 'object')
                let us = r.concat(a)

                d.forEach(inv => {
                    if (inv.reportBy && typeof (inv.reportBy) == 'number') {
                        let u = us.find(i => i.id == inv.reportBy)
                        if (u)
                            inv.reportBy = u;
                    }

                    if (inv.auditBy && typeof (inv.auditBy) == 'number') {
                        let u = us.find(i => i.id == inv.auditBy)
                        if (u)
                            inv.auditBy = u;
                    }
                })

                return d;
            })
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
            this.props.history.push(`${DETAIL_PAGE_URL}/${row.id}`);
        }
    }

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
                    clickHandler={this.onRowDoubleClicked}
                    providers={[
                        <InventoryStatusProvider key='inventoryStatusProvider' for={['status']} />,
                        // <TaxTypeProvider key='TaxTypeProvider' for={['tax']} />,
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
)(InventoryPage)


export default withStyles(styles)(ConnectedComponent);