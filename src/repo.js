// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

import CommonStyles from "./common_styles";

import axios from 'axios'

//
import { withStyles } from '@material-ui/core';
import {
    Select, Input,
    // MenuItem
} from '@material-ui/core';

import { DataTypeProvider } from '@devexpress/dx-react-grid';

//
import { DATA_API_BASE_URL } from "./config"

import DataTableBase from "./data_table_base"


// =============================================
const DATA_REPO = "repoes";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: "name", title: "名称" },
    { name: "type", title: "类型" }, //getCellValue: row => row.type == 0 ? '物料仓库' : '成品仓库' },
    { name: "comment", title: "备注" },
]

const EDITING_COLUMN_EXTENSIONS = [
    { columnName: 'id', editingEnabled: false },
]

const NEW_ROW_TEMPLATE = {
    id: 0,
    name: '',
    type: 0,
}

const RepoTypeEditor = ({ value, onValueChange }) => (
    <Select
        native
        input={<Input />}
        value={value}
        onChange={event => {
            onValueChange(event.target.value)
        }
        }
        style={{ width: '100%' }}
    >
        <option value=""></option>
        <option value={0}>物料仓库</option>
        <option value={1}>成品仓库</option>
    </Select>
);

const RepoTypeProvider = props => (
    <DataTypeProvider
        // formatterComponent={({ value }) => <Typography style={{ opacity: .7 }} >{value == 0 ? '物料仓库' : '成品仓库'}</Typography>}
        formatterComponent={({ value }) => value ? '成品仓库' : '物料仓库'}
        editorComponent={RepoTypeEditor}
        {...props}
    />
);


// =============================================
class RepoPage extends React.PureComponent {
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
        const { classes } = this.props

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
                        <RepoTypeProvider key='rtp' for={["type"]} />,
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


export default withStyles(styles)(RepoPage);