// @flow

import React from 'react';

import CommonStyles from "./common_styles";

import axios from 'axios'

import { withStyles } from '@material-ui/core';
import { Toolbar, Button, Typography } from '@material-ui/core';
import {
    TableEditRow, 
    // TableEditColumn,
} from '@devexpress/dx-react-grid-material-ui';

import {Export} from 'mdi-material-ui';

import { LookupEditCell } from "./data_table_util";
import DataTableBase from "./data_table_base";

import { EXPORT_BASE_URL, DATA_API_BASE_URL } from "./config";


// =============================================
class MaterialPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepo = "materials";
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
                code: '',
                name: '',
                type: this.state.availableValues.type[0].name,
                safeQuantity: 0,
                comment: '',
                // { name: 'code', title: '编号' },
                // { name: "name", title: "名称" },
                // { name: "type", title: "类型", getCellValue: row => (row.type ? row.type.name : undefined), },
                // { name: "safeQuantity", title: "安全库存" },
                // { name: "comment", title: "备注" },
            }
        });

        // this.commitChanges = this.commitChanges.bind(this);

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
        let dataRepo = "materialTypes"
        axios.get(`${DATA_API_BASE_URL}/${dataRepo}/search/findByIdGreaterThan?id=0`)
            .then(r => r.data._embedded[dataRepo])
            .then(j => this.setState({ availableValues: { 'type': j }, loaded: true }))
        // .catch(e => this.showSanckbar(e.message));
    }

    doLoad = () => {
        return axios.get(`${DATA_API_BASE_URL}/${this.dataRepo}/search/findByCategory?category=0`)//,
            .then(resp => resp.data._embedded[this.dataRepo])
            .then(rs => rs.map(r => { if (r.type) r.type = r.type.name; return r; }))
        // .then(j => this.setState({ rows: j }))
        // .catch(e => this.showSanckbar(e.message));
    }

    doAdd = (r) => {
        let v = this.state.availableValues['type'].find(v => v.name === r.type)
        if (v) r.type = v;

        return axios.post(this.dataRepoApiUrl, r)
            .then(resp => resp.data)
            .then(j => ({ ...j, type: r.type.name }))
    }

    doUpdate = (r, c) => {
        let v = this.state.availableValues['type'].find(v => v.name === c.type)
        if (v && c.type) c.type = "../materialTypes/" + v.id

        return axios.patch(this.dataRepoApiUrl + "/" + r['id'], c)
            .then(resp => resp.data)
            .then(j => ({ ...j, type: v && v.name ? v.name : undefined }))
    }

    doDelete = (r) => {
        return axios.delete(this.dataRepoApiUrl + "/" + r['id'])
    }

    render() {
        const { classes, } = this.props

        return this.state.loaded ? (
            <div className={classes.contentRoot}>
                <Toolbar className={classes.toolbar}>
                    {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton> */}
                    <Typography variant="title" className={classes.toolbarTitle}></Typography>
                    <Button href={`${EXPORT_BASE_URL}/materials`} color='primary' style={{ fontSize: 18 }} ><Export />导出</Button>
                    {/* <Button onClick={() => this.export()} color='primary' style={{ fontSize: 18 }} ><Printer />打印</Button> */}
                </Toolbar>

                <DataTableBase columns={[
                    { name: 'id', title: '序号' },
                    { name: 'code', title: '编号' },
                    { name: "name", title: "名称" },
                    { name: "type", title: "类型" },
                    { name: "spec", title: "规格" },
                    { name: "safeQuantity", title: "安全库存" }, //getCellValue: row => row.safeQuantity ? row.safeQuantity.toString() : undefined },
                    { name: "comment", title: "备注" },
                    // { name: "metadata", title: ""},     
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
        ) : <Typography color="inherit" noWrap variant="headline">Loading</Typography>
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ...{
    },
})


export default withStyles(styles)(MaterialPage);