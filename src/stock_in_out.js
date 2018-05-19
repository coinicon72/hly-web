// @flow

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import CommonStyles from "./common_styles";

import axios from 'axios'

import DataTableBase from "./data_table_base"

import * as config from "./config"
import { withStyles } from 'material-ui';


// =============================================
const DATA_REPO = "repoChangings";
const DATA_FILTER = "/search/findByTypeAndStatus?type=1&status=0";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: "applicant", title: "申请人" },
    { name: "department", title: "部门" },
    { name: "applyingDate", title: "申请日期", getCellValue: row => row.applyingDate.split('T')[0] },
    { name: "application", title: "原因" },
    { name: "amount", title: "总额" },
]


// =============================================
class ClientTypePage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepoApiUrl = config.API_BASE_URL + DATA_REPO + DATA_FILTER;

        // this.editingColumnExtensions = EDITING_COLUMN_EXTENSIONS;

        // this.changeAddedRowsCallback = (row => {
        //     return Object.keys(row).length ? row : NEW_ROW_TEMPLATE
        // });

        this.doLoad = this.doLoad.bind(this)
        this.doAdd = this.doAdd.bind(this)
        this.doUpdate = this.doUpdate.bind(this)
        this.doDelete = this.doDelete.bind(this)
    
        this.addRowHandler = () => this.props.history.push(`${config.ROUTER_STOCK_IN}/add`);
    }

    componentDidMount() {
    }

    doLoad = () => {
        return axios.get(this.dataRepoApiUrl)//,
            .then(resp => resp.data._embedded[DATA_REPO])
    }

    doAdd = (r) => {
        return axios.post(this.dataRepoApiUrl, r)
            .then(resp => resp.data)
    }

    doUpdate = (r, c) => {
        return axios.patch(this.dataRepoApiUrl + "/" + r['id'], c)
            .then(resp => resp.data)
    }

    doDelete = (r) => {
        return axios.delete(this.dataRepoApiUrl + "/" + r['id'])
    }

    onRowDoubleClicked = (row) => {
        if (row)
            this.props.history.push(`${config.ROUTER_STOCK_IN}/edit/${row.id}`);
    }

    render() {
        const { classes, width } = this.props

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


export default withStyles(styles)(ClientTypePage);