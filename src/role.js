// @flow

import React from 'react';

import CommonStyles from "./common_styles";

import axios from 'axios'

import { withStyles } from '@material-ui/core';
import { Toolbar, Typography } from '@material-ui/core';
import {
    TableEditRow,
} from '@devexpress/dx-react-grid-material-ui';

// import * as mdi from 'mdi-material-ui';

import { LookupEditCell } from "./data_table_util";
import DataTableBase from "./data_table_base";

import {
    // EXPORT_BASE_URL,
    DATA_API_BASE_URL
} from "./config";


// =============================================
class RolePage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepo = "roles";
        this.dataRepoApiUrl = DATA_API_BASE_URL + this.dataRepo;

        this.dataTable = null

        this.state = {
            loaded: false,
            availableValues: {},
        }

        this.editingColumnExtensions = [
            { columnName: 'id', editingEnabled: false },
        ];

        this.changeAddedRowsCallback = (row => {
            return Object.keys(row).length ? row : {
                code: '',
                name: '',
                disabled: false,
                comment: '',
            }
        })//.bind(this);

        // this.commitChanges = this.commitChanges.bind(this);

        this.editCell = ((props) => {
            let availableColumnValues = this.state.availableValues[props.column.name];

            if (availableColumnValues) {
                availableColumnValues = availableColumnValues.map(r => r.name)
                return <LookupEditCell {...props} availableColumnValues={availableColumnValues} />;
            }
            return <TableEditRow.Cell {...props} />;
        })//.bind(this);

        this.doLoad = this.doLoad.bind(this)
        this.doAdd = this.doAdd.bind(this)
        this.doUpdate = this.doUpdate.bind(this)
        this.doDelete = this.doDelete.bind(this)
    }

    componentDidMount() {
    }

    doLoad = () => {
        return axios.get(this.dataRepoApiUrl)//,
            .then(resp => resp.data._embedded[this.dataRepo])
    }

    doAdd = (r) => {
        return axios.post(this.dataRepoApiUrl, r)
            .then(resp => resp.data)
        // .then(j => ({ ...j, type: r.type.name }))
    }

    doUpdate = (r, c) => {
        return axios.patch(this.dataRepoApiUrl + "/" + r['id'], c)
            .then(resp => resp.data)
        // .then(j => ({ ...j, type: v && v.name ? v.name : undefined }))
    }

    doDelete = (r) => {
        return axios.delete(this.dataRepoApiUrl + "/" + r['id'])
    }

    render() {
        const { classes } = this.props

        return <div className={classes.contentRoot}>
            <Toolbar className={classes.toolbar}>
                {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton> */}
                <Typography variant="title" className={classes.toolbarTitle}></Typography>
                {/* <Button href={`${EXPORT_BASE_URL}/roles`} color='primary' style={{ fontSize: 18 }} ><mdi.Export />导出</Button> */}
            </Toolbar>

            <DataTableBase columns={[
                { name: 'id', title: '序号' },
                { name: 'code', title: '代号' },
                { name: "name", title: "名称" },
                // { name: "disabled", title: "有效" },
                { name: "comment", title: "备注" },
            ]}
                editCell={this.editCell}
                changeAddedRowsCallback={this.changeAddedRowsCallback}
                // commitChanges={this.commitChanges}
                editingColumnExtensions={this.editingColumnExtensions}
                doLoad={this.doLoad}
                doAdd={this.doAdd}
                doUpdate={this.doUpdate}
                doDelete={this.doDelete}
            />
        </div>
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    // ...{
    // },
})


export default withStyles(styles)(RolePage);