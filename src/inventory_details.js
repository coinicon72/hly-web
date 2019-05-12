// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

import axios from 'axios'

// icon
import {
    ContentSave,
} from 'mdi-material-ui';

// ui
// ui
import {
    withStyles, Typography,
    Toolbar, Button,
    Select,
    InputLabel, FormControl,
    Grid as MuGrid,
    Paper,
    TextField, IconButton,
    // MenuItem, Snackbar, 
    // Select, Toolbar,
    // Divider, 
    // Tooltip, Chip,
    // Input, 
    // InputLabel,
    // InputAdornment,
    // FormGroup, FormControlLabel, 
    // FormControl,
    // FormHelperText,
    // Stepper, Step, StepLabel,
    // Switch,
    // Table, TableBody, TableCell, TableHead, TableRow,
    // Dialog, DialogActions, DialogContent,
    // DialogContentText, 
    // DialogTitle,
} from '@material-ui/core';

import { DataTypeProvider } from '@devexpress/dx-react-grid';

import {
    TableEditRow,
    // TableEditColumn,
} from '@devexpress/dx-react-grid-material-ui';

//
import { connect } from 'react-redux'
import { actionShowSnackbar } from "./redux/data_selection"

//
import { toFixedMoney, getTodayDateTimeString, toDateString } from "./utils"

//
import { DATA_API_BASE_URL } from "./config"
import { LookupEditCell } from "./data_table_util";

import CommonStyles from "./common_styles";
import { CurrencyTypeProvider } from "./common_components"
import { MODE_ADD, MODE_EDIT, MODE_VIEW } from "./common"

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
    // { name: "place", title: "存放位置" },
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
class InventoryPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            mode: MODE_ADD,

            form: {},

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
            // { columnName: "place", editingEnabled: true, },
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
        const { id } = this.props;
        const { form } = this.state;

        if (id) {
            this.setState({ mode: MODE_EDIT });

            axios.get(`${DATA_API_BASE_URL}/inventories/${id}`)
                .then(r => r.data)
                .then(form => this.setState({ form }))
        } else {
            form.createDate = new Date();
            form.reportBy = this.props.user;
        }

        axios.get(`${DATA_API_BASE_URL}/materials`)
            .then(r => r.data._embedded.materials)
            .then(j => this.setState({ availableValues: { 'materials': j } }))

        axios.get(`${DATA_API_BASE_URL}/repoes`)
            .then(resp => resp.data._embedded['repoes'])
            .then(repoes => {
                this.setState({ repoes, currentRepo: repoes[0] })
            })
    }

    componentDidUpdate() {
        const { form } = this.state;
        if (!form.reportBy) form.reportBy = this.props.user;
    }

    render() {
        const { classes } = this.props
        const { repoes, currentRepo, form } = this.state;

        return currentRepo ? (
            <div className={classes.contentRoot}>
                <Toolbar className={classes.toolbar}>
                    {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton> */}
                    {/* <Typography variant="title" className={classes.toolbarTitle}></Typography> */}

                    <FormControl className={classes.formControl} style={{ marginBottom: 16 }}>
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

                    <span style={{ flex: 1 }} />

                    <Button onClick={this.saveInventory} color='primary' disabled={false} style={{ fontSize: 18 }} ><ContentSave />保存</Button>
                    <Button onClick={this.commitInventory} color='secondary' style={{ fontSize: 18 }} ><ContentSave />提交</Button>
                </Toolbar>

                <Typography variant="title" className={classes.subTitle}>基本信息</Typography>

                <Paper className={classes.paper}>
                    <MuGrid container direction='column' alignItems="stretch">

                        {/* <FormControl className={classes.formControl} style={{ marginBottom: 16 }}>
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
                        </FormControl> */}

                        <MuGrid style={{ marginBottom: 16 }}>
                            <TextField
                                id="applicant"
                                // required
                                disabled//={disableEdit}
                                // select
                                // error={!!errors['form.applicant']}
                                label="制单人"
                                style={{ width: 200 }}
                                value={form.reportBy ? form.reportBy.name : ""}
                                // onChange={e => this.handleInput(e)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </MuGrid>

                        <MuGrid style={{ marginBottom: 16 }}>
                            <TextField type="date" disabled={true} required id="createDate"
                                label="制单日期"
                                value={form.createDate ? toDateString(form.createDate) : ""}
                                margin="normal"
                                // onChange={e => this.handleOrderInfoChange(e)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            {form.reportDate ?
                                <TextField type="date" disabled={true} required id="reportDate"
                                    label="提交日期"
                                    value={form.reportDate ? toDateString(form.reportDate) : ""}
                                    margin="normal"
                                    // onChange={e => this.handleOrderInfoChange(e)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                /> : null}
                        </MuGrid>
                    </MuGrid>
                </Paper>

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



const mapStateToProps = state => ({
    token: state.main.token,
    user: state.main.user,
})

const mapDispatchToProps = dispatch => ({
    //
    showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
})

const ConnectedComponent = connect(
    mapStateToProps,
    mapDispatchToProps
)(InventoryPage)

export default withStyles(styles)(ConnectedComponent);