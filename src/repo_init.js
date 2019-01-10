// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

import axios from 'axios'

import {
    withStyles, Typography,
    Toolbar,
    Select,
    InputLabel, FormControl,
} from '@material-ui/core';

import { DataTypeProvider } from '@devexpress/dx-react-grid';

import {
    TableEditRow,
    // TableEditColumn,
} from '@devexpress/dx-react-grid-material-ui';

//
import { DATA_API_BASE_URL } from "./config"
import { LookupEditCell } from "./data_table_util";

import CommonStyles from "./common_styles";
import { toFixedMoney } from './utils';
import { CurrencyTypeProvider } from "./common_components"

import DataTableBase from "./data_table_base"


// =============================================
const DATA_REPO = "repoItems";
const DATA_FILTER = "";

const COLUMNS = [
    { name: 'code', title: '编号', getCellValue: row => row._embedded && row._embedded.material ? row._embedded.material.code : null },
    { name: "name", title: "名称", getCellValue: row => row._embedded && row._embedded.material ? row._embedded.material.name : null },
    { name: "type", title: "类型", getCellValue: row => row._embedded && row._embedded.material && row._embedded.material.type ? row._embedded.material.type.name : null },
    { name: "spec", title: "规格", getCellValue: row => row._embedded && row._embedded.material ? row._embedded.material.spec : null },
    { name: "safeQuantity", title: "安全库存", getCellValue: row => row._embedded && row._embedded.material ? row._embedded.material.safeQuantity : null },
    { name: "quantity", title: "库存" },
    { name: "price", title: "单价" },
    { name: "subtotal", title: "小计", getCellValue: row => toFixedMoney(row.quantity * row.price) },
    { name: "place", title: "存放位置" },
]

const SafeQuantityTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={({ value }) => <Typography style={{ opacity: .7 }} >{value}</Typography>}
        {...props}
    />
);

const QuantityTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={({ row, value }) =>
            <Typography style={value >= row._embedded.material.safeQuantity ? {} : { fontWeight: 'bold', color: 'red' }} >{value}</Typography>
        }
        {...props}
    />
);

// =============================================
class RepoInitPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            repoes: [], // all repoes
            currentRepo: null,
            availableValues: {},
        }

        this.dataRepoApiUrl = `${DATA_API_BASE_URL}/${DATA_REPO}${DATA_FILTER}`;

        this.EditingColumnExtensions = [
            {
                columnName: 'code', editingEnabled: true, createRowChange: (r, v, c) => {
                    // console.info(r, v, c);
                    let m = this.state.availableValues['materials'].find(m => m.code === v);

                    if (!r._embedded)
                        r._embedded = {}
                    r._embedded.material = m;
                }
            },
            { columnName: 'name', editingEnabled: false },
            { columnName: 'type', editingEnabled: false },
            { columnName: 'spec', editingEnabled: false },
            { columnName: 'safeQuantity', editingEnabled: false },
            { columnName: "quantity", editingEnabled: true, type: 'number' },
            { columnName: "price", editingEnabled: true, type: 'number' },
            { columnName: "subtotal", editingEnabled: false },
            { columnName: "place", editingEnabled: true, },
        ];

        this.doLoad = () => {
            // return axios.get(this.dataRepoApiUrl)//,
            //     .then(resp => resp.data._embedded[DATA_REPO])
            return axios.get(`${DATA_API_BASE_URL}/repoItems/search/findByRepo?repo=../../../repoes/${this.state.currentRepo.id}`)//,
                .then(resp => resp.data._embedded['repoItems'])
        }

        this.doAdd = (r) => {
            // let v = this.state.availableValues['type'].find(v => v.name === r.type)
            // if (v) r.type = v;

            // { "id": { "repo": 1, "material": 6 }, 
            // "repo": { "id": 1 }, 
            // "material": { "id": 6 }, 
            // "quantity": 30, 
            // "price": 43.2, 
            // "place": "test" }
            let c = { ...r };
            delete c._embedded
            Object.assign(c, {
                id: { repo: this.state.currentRepo.id, material: r._embedded.material.id },
                repo: { id: this.state.currentRepo.id }, material: { id: r._embedded.material.id }
            });
            return axios.post(`${DATA_API_BASE_URL}/repoItems`, c)
                .then(resp => resp.data)
            // .then(j => ({ ...j, type: r.type.name }))
        }

        this.doUpdate = (r, c) => {
            return axios.patch(`${DATA_API_BASE_URL}/repoItems/${r.id.repo}_${r.id.material}`, c)
                .then(resp => resp.data)
            // .then(j => ({ ...j, type: v && v.name ? v.name : undefined }))
        }

        this.doDelete = (r) => {
            return axios.delete(`${DATA_API_BASE_URL}/repoItems/${r.id.repo}_${r.id.material}`)
        }

        this.onChangedRepo = (e => {
            const rid = parseInt(e.target.value, 10)
            const r = this.state.repoes.find(r => r.id === rid)
            this.state.currentRepo = r
            this.forceUpdate()
        })

        this.editCell = ((props) => {
            // let availableColumnValues = this.state.availableValues[props.column.name];

            if (props.column.name === 'code') {
                let availableColumnValues = this.state.availableValues['materials'].map(r => r.code)
                return <LookupEditCell {...props}
                    availableColumnValues={availableColumnValues}
                // onValueChange={(v) => {
                //     let m = this.state.availableValues['materials'].find(m => m.code === v);

                //     if (!props.row._embedded)
                //         props.row._embedded = {}
                //     props.row._embedded.material = m;

                //     Object.assign(props.row, {code: m.code, id: m.id, name: m.name, type: m.type.name, spec: m.spec});
                // }}
                />;
            } else
                return <TableEditRow.Cell {...props} />;
        });
    }

    componentDidMount() {
        axios.get(`${DATA_API_BASE_URL}/materials`)
            .then(r => r.data._embedded.materials)
            .then(j => this.setState({ availableValues: { 'materials': j } }))

        axios.get(`${DATA_API_BASE_URL}/repoes`)
            .then(resp => resp.data._embedded['repoes'])
            .then(repoes => {
                this.setState({ repoes, currentRepo: repoes[0] })
            })
    }

    render() {
        const { classes } = this.props
        const { repoes, currentRepo, } = this.state;

        return currentRepo ? (
            <div className={classes.contentRoot}>
                <Toolbar className={classes.toolbar}>
                    {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton> */}
                    {/* <Typography variant="title" className={classes.toolbarTitle}></Typography> */}
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="repo" shrink>仓库</InputLabel>
                        <Select
                            native
                            value={currentRepo ? currentRepo.id : null}
                            onChange={this.onChangedRepo}
                            inputProps={{
                                name: 'repo',
                                id: 'repo',
                            }}
                        >
                            {repoes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </Select>
                    </FormControl>

                    {/* <Button onClick={this.saveInventory} color='primary' disabled={!this.state.changes || this.state.changes.length <= 0} style={{ fontSize: 18 }} ><ContentSave />保存</Button> */}
                    {/* <Button onClick={() => this.export()} color='primary' style={{ fontSize: 18 }} ><Printer />打印</Button> */}
                </Toolbar>

                <DataTableBase columns={COLUMNS}
                    // changeAddedRowsCallback={this.changeAddedRowsCallback}
                    editingColumnExtensions={this.EditingColumnExtensions}
                    key={`repo${currentRepo.id}`}
                    doLoad={this.doLoad}
                    editCell={this.editCell}
                    // disableEdit={true}
                    doAdd={this.doAdd}
                    doUpdate={this.doUpdate}
                    doDelete={this.doDelete}
                    // showAddCommand={false}
                    // showDeleteCommand={false}
                    providers={[
                        <SafeQuantityTypeProvider key='sqtp' for={["safeQuantity"]} />,
                        <QuantityTypeProvider key='qtp' for={["quantity"]} />,
                        <CurrencyTypeProvider key='ctp' for={["price", "subtotal"]} />,
                    ]}
                />
            </div>
        ) : null
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ...{
    },
})


export default withStyles(styles)(RepoInitPage);