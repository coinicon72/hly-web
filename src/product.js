// @flow

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import compose from 'recompose/compose';
import { withRouter } from 'react-router'

//
import { withStyles } from '@material-ui/core';
import { Paper, Typography, Button, IconButton, Snackbar, Input, Select, Toolbar } from '@material-ui/core';

// icons
import * as mdi from 'mdi-material-ui';
import * as mui from '@material-ui/icons';

import axios from 'axios'

import CommonStyles from "./common_styles";

import DataTableBase from "./data_table_base"

import { EXPORT_BASE_URL, DATA_API_BASE_URL } from "./config"


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

        this.dataRepoApiUrl = DATA_API_BASE_URL + DATA_REPO;

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

    onRowDoubleClicked = (row) => {
        if (row)
            this.props.history.push('/product/' + row.id);
        // alert(JSON.stringify(row))
    }

    render() {
        const { classes, width } = this.props

        return (
            <div className={classes.contentRoot}>
                {/* <Typography variant="title" color="inherit" className={classes.subTitle} >双击产品可以查看详情</Typography> */}

                <Toolbar className={classes.toolbar}>
                    {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton> */}
                    <Typography variant="title" className={classes.toolbarTitle}>双击产品可以查看详情</Typography>
                    <Button href={`${EXPORT_BASE_URL}/products`} color='primary' style={{ fontSize: 18 }} ><mdi.Export />导出</Button>
                    {/* <Button onClick={() => this.export()} color='primary' style={{ fontSize: 18 }} ><mdi.Printer />打印</Button> */}
                </Toolbar>

                <DataTableBase columns={COLUMNS}
                    editCell={this.editCell}
                    changeAddedRowsCallback={this.changeAddedRowsCallback}
                    editingColumnExtensions={this.editingColumnExtensions}
                    doLoad={this.doLoad}
                    doAdd={this.doAdd}
                    doUpdate={this.doUpdate}
                    doDelete={this.doDelete}
                    clickHandler={this.onRowDoubleClicked}
                />
            </div>
        )
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ... {
        subTitle: {
            fontSize: 18,
            opacity: .75,
            margin: 0,
            // marginleft: 0,
            marginBottom: theme.spacing.unit * 1,
        },
    },
})


export default compose(withStyles(styles), withRouter)(ProductPage);