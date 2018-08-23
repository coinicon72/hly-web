// @flow

import React from 'react';

import axios from 'axios'

import { withStyles } from '@material-ui/core';
import {
    // AppBar,
    Toolbar,
    // Button, IconButton, 
    Typography
} from '@material-ui/core';
import {
    TableEditRow,
    // TableEditColumn,
} from '@devexpress/dx-react-grid-material-ui';

// import * as mdi from 'mdi-material-ui';

//
import {
    // EXPORT_BASE_URL,
    DATA_API_BASE_URL
} from "./config";

import CommonStyles from "./common_styles";

import { LookupEditCell } from "./data_table_util";
import DataTableBase from "./data_table_base";


// =============================================
class UserPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepo = "users";
        this.dataRepoApiUrl = `${DATA_API_BASE_URL}/${this.dataRepo}`;

        this.dataTable = null

        this.state = {
            loaded: false,
            availableValues: {},
        }

        this.editingColumnExtensions = [
            { columnName: 'id', editingEnabled: false },
            // {
            //     columnName: 'safeQuantity', createRowChange: (row, value) => {
            //         return { safeQuantity: parseFloat(value) };
            //     },
            // },
        ];

        this.changeAddedRowsCallback = (row => {
            return Object.keys(row).length ? row : {
                phone: '',
                name: '',
                title: '',
                comment: '',
            }
        });

        this.editCell = ((props) => {
            let availableColumnValues = this.state.availableValues[props.column.name];

            if (availableColumnValues) {
                availableColumnValues = availableColumnValues.map(r => r.name)
                return <LookupEditCell {...props} availableColumnValues={availableColumnValues} />;
            }
            return <TableEditRow.Cell {...props} />;
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
            .then(resp => resp.data._embedded[this.dataRepo])
        // .then(rs => rs.map(r => { if (r.type) r.type = r.type.name; return r; }))
    }

    doAdd = (r) => {
        // let v = this.state.availableValues['type'].find(v => v.name === r.type)
        // if (v) r.type = v;

        return axios.post(this.dataRepoApiUrl, {...r, password: '123456' })
            .then(resp => resp.data)
        //     .then(j => ({ ...j, type: r.type.name }))
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

        return <div className={classes.contentRoot}>
            <Toolbar className={classes.toolbar}>
                {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton> */}
                <Typography variant="title" className={classes.toolbarTitle}></Typography>
                {/* <Button href={`${EXPORT_BASE_URL}/users`} color='primary' style={{ fontSize: 18 }} ><mdi.Export />导出</Button> */}
                {/* <Button onClick={() => this.export()} color='primary' style={{ fontSize: 18 }} ><mdi.Printer />打印</Button> */}
            </Toolbar>

            <DataTableBase columns={[
                { name: 'id', title: '序号' },
                { name: "name", title: "名称" },
                { name: "phone", title: "手机" },
                { name: "title", title: "头衔" },
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
    ...{
    },
})


export default withStyles(styles)(UserPage);