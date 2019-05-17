// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

import produce from 'immer'

import axios from 'axios'

// icon
import {
    ContentSave,
    ChevronUp,
    ChevronDown,
    PlaylistRemove,
    FileRemove,
    FilePlus,
    // Tooltip,
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
    Collapse,
    // MenuItem, Snackbar, 
    // Select, Toolbar,
    // Divider, 
    Tooltip,
    // Chip,
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
import { API_BASE_URL, DATA_API_BASE_URL } from "./config"
import { LookupEditCell } from "./data_table_util";

import CommonStyles from "./common_styles";
import { CurrencyTypeProvider } from "./common_components"
import { MODE_ADD, MODE_EDIT, MODE_VIEW } from "./common"

import DataTableBase from "./data_table_base"


// =============================================
const DATA_REPO = "repoItems";
const DATA_FILTER = "";

const COLUMNS = [
    { name: 'code', title: '编号', getCellValue: row => row.material ? row.material.code : null },
    { name: "name", title: "名称", getCellValue: row => row.material ? row.material.name : null },
    { name: "type", title: "类型", getCellValue: row => row.material && row.material.type ? row.material.type.name : null },
    { name: "spec", title: "规格", getCellValue: row => row.material ? row.material.spec : null },
    { name: "safeQuantity", title: "安全库存", getCellValue: row => row.material ? row.material.safeQuantity : null },
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
            <Typography style={value >= row.material.safeQuantity ? {} : { fontWeight: 'bold', color: 'red' }} >{value}</Typography>
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

            rows: [],

            repoes: [], // all repoes
            currentRepo: null,
            availableValues: {},

            basicInfoExpanded: false,
        }

        this.dataRepoApiUrl = `${DATA_API_BASE_URL}/${DATA_REPO}${DATA_FILTER}`;

        this.EditingColumnExtensions = [
            {
                columnName: 'code', editingEnabled: true, createRowChange: (r, v, c) => {
                    // console.info(r, v, c);
                    let m = this.state.availableValues['materials'].find(m => m.code === v);

                    r.material = m;
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
            // delete c._embedded
            Object.assign(c, {
                id: { repo: this.state.currentRepo.id, material: r.material.id },
                repo: { id: this.state.currentRepo.id }, material: { id: r.material.id }
            });
            // return axios.post(`${DATA_API_BASE_URL}/repoItems`, c)
            //     .then(resp => resp.data)
            // .then(j => ({ ...j, type: r.type.name }))

            // this.state.rows.push(c);
            // console.info(produce(draft => {
            //     draft.rows.push(c);
            // }))
            this.setState(produce(draft => {
                draft.rows.push(c);
            }));

            return Promise.resolve(null);
        }

        this.doUpdate = (r, c, idx) => {
            // return axios.patch(`${DATA_API_BASE_URL}/repoItems/${r.id.repo}_${r.id.material}`, c)
            //     .then(resp => resp.data)
            // .then(j => ({ ...j, type: v && v.name ? v.name : undefined }))

            let nr = { ...r, ...c };
            this.setState(produce(draft => {
                // draft.rows[idx] = nr;
                draft.rows.splice(idx, 1, nr);
            }));

            return Promise.resolve(nr);
        }

        this.doDelete = (r, idx) => {
            // return axios.delete(`${DATA_API_BASE_URL}/repoItems/${r.id.repo}_${r.id.material}`)

            this.setState(produce(draft => {
                draft.rows.splice(idx, 1);
                // draft.rows.push(c);
            }));

            return Promise.resolve(null);
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

        this.updateComment = t => {
            this.setState(produce(drift => {
                drift.form.comment = t;
            }));
        }

        this.toggleBasicInfoExpand = _ => this.setState({ basicInfoExpanded: !this.state.basicInfoExpanded })

        this.autoFillInventoryItems = _ => {
            if (!window.confirm('确定从当前仓库自动添加明细吗？'))
                return;

            axios.get(`${DATA_API_BASE_URL}/repoItems/search/findByRepo?repo=../../../repoes/${this.state.currentRepo.id}`)//,
                .then(resp => resp.data._embedded['repoItems'])
                .then(rows => this.setState({ rows }));
        }

        this.clearInventoryItems = _ => {
            if (!window.confirm('确定清除明细列表吗？'))
                return;

            this.setState({ rows: [] });
        }

        this.saveInventory = _ => {
            if (!window.confirm('确定保存当前盘点报表吗？'))
                return;

            this.doSaveInventory(0);
        }

        this.commitInventory = _ => {
            if (!window.confirm('确定保存并提交当前盘点报表吗？'))
                return;

            this.doSaveInventory(1);
        }

        this.auditInventory = _ => {
            if (!window.confirm('确定审核通过当前盘点报表吗？'))
                return;

            this.doSaveInventory(2);
        }
    }

    doSaveInventory(action) {
        const { currentRepo, form, rows } = this.state

        let f = { id: form.id, repo: { id: currentRepo.id }, reportBy: { id: form.reportBy.id }, comment: form.comment };
        f.items = this.state.rows;

        axios.post(`${API_BASE_URL}/inventories?action=${action}`, f)
            .then(resp => {
                this.props.showSnackbar('保存成功')
                this.props.history.goBack();
            })
            .catch(e => {
                // cancel = true;
                // this.setState({
                //     savingOrder: false,
                // })
                this.props.showSnackbar(e.message)
            })
    }

    componentDidMount() {
        const { id } = this.props.match.params;
        const { form } = this.state;

        if (id) {
            axios.get(`${API_BASE_URL}/inventories/${id}`)
                .then(r => r.data)
                .then(form => {
                    // this.setState({ mode: MODE_EDIT });
                    this.setState({ form, rows: form.items, mode: form.status == 2 ? MODE_VIEW : MODE_EDIT })
                })
        } else {
            this.setState({ mode: MODE_ADD });

            form.id = 0;
            form.createDate = new Date();
            form.reportBy = this.props.user;
            form.status = 0;
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
        const { mode, repoes, currentRepo, form, rows } = this.state;

        return currentRepo ? (
            <div className={classes.contentRoot}>
                <Toolbar className={classes.toolbar}>
                    {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton> */}
                    {/* <Typography variant="title" className={classes.toolbarTitle}></Typography> */}

                    <FormControl className={classes.formControl} style={{ marginBottom: 16 }} disabled={form.status >= 1}>
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

                    {form.status == 0 ? <React.Fragment>
                        <Tooltip title="保存盘点表单">
                            <Button onClick={this.saveInventory} color='primary' disabled={false} style={{ fontSize: 18 }} ><ContentSave />保存</Button>
                        </Tooltip>
                        <Tooltip title="保存盘点表单，并提交审核">
                            <Button onClick={this.commitInventory} color='secondary' style={{ fontSize: 18 }} ><ContentSave />提交</Button>
                        </Tooltip>
                    </React.Fragment> : form.status == 1 ? <Tooltip title="">
                        <Button onClick={this.auditInventory} color='secondary' style={{ fontSize: 18 }} ><ContentSave />审核通过</Button>
                    </Tooltip> : null}

                </Toolbar>

                <Toolbar className={classes.toolbar}>
                    <Typography variant="title" className={classes.subTitle}>基本信息</Typography>
                    <span style={{ flex: 1 }} />
                    <IconButton onClick={this.toggleBasicInfoExpand}>{this.state.basicInfoExpanded ? <ChevronUp /> : <ChevronDown />}</IconButton>
                </Toolbar>

                <Collapse in={this.state.basicInfoExpanded} timeout="auto" unmountOnExit>
                    <Paper className={classes.paper} style={{ marginBottom: 16 }}>
                        <MuGrid container direction='column' alignItems="stretch">

                            <MuGrid style={{ marginBottom: 8 }}>
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

                            <MuGrid style={{ marginBottom: 8 }}>
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

                            <MuGrid>
                                <TextField id="comment" disabled={form.status >= 1} label="备注"
                                    defaultValue=""
                                    value={form.comment}
                                    className={classes.textFieldWithoutWidth}
                                    onChange={e => this.updateComment(e.target.value)}
                                    multiline
                                    fullWidth
                                    rowsMax="4"
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </MuGrid>
                        </MuGrid>
                    </Paper>
                </Collapse>

                <Toolbar className={classes.toolbar}>
                    <Typography variant="title" className={classes.subTitle}>库存明细</Typography>
                    <span style={{ flex: 1 }} />

                    {form.status >= 1 ? null : <React.Fragment>
                        <Tooltip title="从当前仓库自动添加明细">
                            <IconButton onClick={this.autoFillInventoryItems}><FilePlus /></IconButton>
                        </Tooltip>
                        <Tooltip title="清除明细列表">
                            <IconButton onClick={this.clearInventoryItems}><FileRemove /></IconButton>
                        </Tooltip>
                    </React.Fragment>
                    }
                </Toolbar>

                <DataTableBase columns={COLUMNS}
                    // changeAddedRowsCallback={this.changeAddedRowsCallback}
                    editingColumnExtensions={this.EditingColumnExtensions}
                    key={`repo${currentRepo.id}`}
                    rows={rows}
                    // doLoad={this.doLoad}
                    editCell={this.editCell}
                    disableEdit={form.status >= 1}
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