// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

import CommonStyles from "./common_styles";

import axios from 'axios'

import {
    Input, Select,
} from '@material-ui/core';

import { DataTypeProvider } from '@devexpress/dx-react-grid';
import DataTableBase from "./data_table_base"

import { DATA_API_BASE_URL } from "./config"
import { withStyles } from '@material-ui/core';
import { BooleanTypeProvider, RepoChangingTypeProvider } from './common_components'
import { REPO_CHANGING_TYPE_IN, REPO_CHANGING_TYPE_OUT } from "./common"


// =============================================
const DATA_REPO = "repoChangingReasons";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: 'type', title: '类型' },
    { name: "reason", title: "原因" },
    { name: "orderRelated", title: "订单相关" },
]

const EDITING_COLUMN_EXTENSIONS = [
    { columnName: 'id', editingEnabled: false },
]

const NEW_ROW_TEMPLATE = {
    id: 0,
    type: 1,
    reason: '',
    orderRelated: false,
}


// =============================================
class RepoChangingReasonPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepoApiUrl = `${DATA_API_BASE_URL}/${DATA_REPO}`;

        this.editingColumnExtensions = EDITING_COLUMN_EXTENSIONS;

        this.changeAddedRowsCallback = (row => {
            return Object.keys(row).length ? row : NEW_ROW_TEMPLATE
        });

        this.doLoad = this.doLoad.bind(this)
        this.doAdd = this.doAdd.bind(this)
        this.doUpdate = this.doUpdate.bind(this)
        this.doDelete = this.doDelete.bind(this)
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
                    providers={[
                        <RepoChangingTypeProvider for={['type']} />,
                        <BooleanTypeProvider for={['orderRelated']} />,
                    ]}
                />
            </div>
        )
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ...{
        // contentRoot: {
        //     // flex: 1,
        //     minHeight: `calc(100% - ${theme.spacing.unit * 3}px)`,
        //     padding: theme.spacing.unit * 3,
        //     backgroundColor: '#f4f4f4',
        //     // marginTop: '64px',
        //     // overflowY: 'auto',
        // },
    },
})


export default withStyles(styles)(RepoChangingReasonPage);