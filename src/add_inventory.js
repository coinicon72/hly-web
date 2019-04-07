// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

import axios from 'axios'

import {
    withStyles, Typography,
    Toolbar, Button,
    Select,
    InputLabel, FormControl,
} from '@material-ui/core';

import {
    ContentSave,
} from 'mdi-material-ui';
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
class AddInventoryPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            form: {},

            repoes: [], // all repoes
            currentRepo: null,
            availableValues: {},
        }
    }

    componentDidMount() {
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

                    <span style={{ flex: 1 }} />

                    <Button onClick={this.saveInventory} color='primary' disabled={false} style={{ fontSize: 18 }} ><ContentSave />保存</Button>
                    <Button onClick={this.commitInventory} color='secondary' style={{ fontSize: 18 }} ><ContentSave />提交</Button>
                </Toolbar>
            </div>
        ) : null
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ...{
    },
})


export default withStyles(styles)(AddInventoryPage);