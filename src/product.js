// @flow

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import axios from 'axios'

import DataTableBase from "./data_table_base"

import {API_BASE_URL} from "./config"


// =============================================
const DATA_REPO = "products";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: "code", title: "编号" },
    { name: "base", title: "附着材质" },
    { name: "color", title: "颜色" },
    { name: "comment", title: "备注" },
]

const EDITING_COLUMN_EXTENSIONS = [
    { columnName: 'id', editingEnabled: false },
]

const NEW_ROW_TEMPLATE = {
    id: 0,
    name: '',
    code: '',
    base: '',
    color: '',
    comment: '',
}


// =============================================
class ProductPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepoApiUrl = API_BASE_URL + DATA_REPO;

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
        return (
            <DataTableBase columns={COLUMNS}
                editCell={this.editCell}
                changeAddedRowsCallback={this.changeAddedRowsCallback}
                editingColumnExtensions={this.editingColumnExtensions}
                doLoad={this.doLoad}
                doAdd={this.doAdd}
                doUpdate={this.doUpdate}
                doDelete={this.doDelete}
            />
        )
    }
}

export default ProductPage;