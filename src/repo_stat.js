// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

import axios from 'axios'

import {
    withStyles, Typography,
    Toolbar,
    Select,
    TextField,
    InputLabel, FormControl,
} from '@material-ui/core';

import { DataTypeProvider } from '@devexpress/dx-react-grid';

//
import { DATA_API_BASE_URL } from "./config"

import CommonStyles from "./common_styles";
import { toFixedMoney, getTodayString, toDateString, toMonthString } from './utils';
import { CurrencyTypeProvider } from "./common_components"

import DataTableBase from "./data_table_base"


// =============================================
const COLUMNS = [
    { name: 'repo', title: '仓库', getCellValue: row => row.id.repo },
    { name: 'code', title: '编号', getCellValue: row => row._embedded.material.code },
    { name: "name", title: "名称", getCellValue: row => row._embedded.material.name },
    { name: "type", title: "类型", getCellValue: row => row._embedded.material.type ? row._embedded.material.type.name : null },
    { name: "spec", title: "规格", getCellValue: row => row._embedded.material.spec },
    { name: "preQuantity", title: "期初库存量", getCellValue: row => row.quantity + row.quantityOut - row.quantityIn },
    { name: "preValue", title: "期初库存金额", getCellValue: row => row.value + row.valueOut - row.valueIn },
    { name: "quantityIn", title: "本期入库量" },
    { name: "valueIn", title: "本期入库金额" },
    { name: "quantityOut", title: "本期出库量" },
    { name: "valueOut", title: "本期出库金额" },
    { name: "quantity", title: "期末库存量" },
    { name: "value", title: "期末库存金额" },
]

// =============================================
class RepoStatPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            statDate: getTodayString(),
            repoes: [], // all repoes
            currentRepo: null,
        }

        this.dataRepoApiUrl = `${DATA_API_BASE_URL}/repoSnapshots/search/findByDate?d=`;

        this.doLoad = () => {
            // return axios.get(this.dataRepoApiUrl)//,
            //     .then(resp => resp.data._embedded[DATA_REPO])
            return axios.get(`${DATA_API_BASE_URL}/repoSnapshots/search/findByDate?d=${this.state.statDate}`)//,
                .then(resp => resp.data._embedded['repoSnapshots'])
        }

        this.onChangedRepo = (e => {
            const rid = parseInt(e.target.value, 10)
            const r = this.state.repoes.find(r => r.id === rid)
            this.state.currentRepo = r
            this.forceUpdate()
        })

        this.handleStatDateChange = (e => {
            this.setState({ statDate: toDateString(e.target.value) })
        })
    }

    componentDidMount() {
        return axios.get(`${DATA_API_BASE_URL}/repoes`)
            .then(resp => resp.data._embedded['repoes'])
            .then(repoes => {
                this.setState({ repoes, currentRepo: repoes[0] })
            })
    }

    render() {
        const { classes } = this.props
        const { repoes, currentRepo, statDate } = this.state;

        return currentRepo ? (
            <div className={classes.contentRoot}>
                <Toolbar className={classes.toolbar}>
                    {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton> */}
                    {/* <Typography variant="title" className={classes.toolbarTitle}></Typography> */}
                    <FormControl className={classes.formControl}>
                        {/* <InputLabel htmlFor="repo" shrink>仓库</InputLabel>
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
                        </Select> */}

                        <TextField type="date" id="statDate"
                            label="汇总日期"
                            value={statDate ? statDate : ""}
                            margin="normal"
                            onChange={e => this.handleStatDateChange(e)}
                            inputProps={{
                                max: getTodayString()
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                    </FormControl>

                    {/* <Button onClick={this.saveInventory} color='primary' disabled={!this.state.changes || this.state.changes.length <= 0} style={{ fontSize: 18 }} ><ContentSave />保存</Button> */}
                    {/* <Button onClick={() => this.export()} color='primary' style={{ fontSize: 18 }} ><Printer />打印</Button> */}
                </Toolbar>

                <DataTableBase columns={COLUMNS}
                    // editingColumnExtensions={EditingColumnExtensions}
                    key={`repo${currentRepo.id}-${statDate}`}
                    doLoad={this.doLoad}
                    disableEdit={true}
                    // doUpdate={this.doUpdate}
                    showAddCommand={false}
                    showDeleteCommand={false}
                    providers={[
                        <CurrencyTypeProvider key='ctp' for={['preValue', "valueIn", "valueOut", "value"]} />,
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


export default withStyles(styles)(RepoStatPage);