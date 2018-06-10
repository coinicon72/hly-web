// @flow

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import CommonStyles from "./common_styles";

import axios from 'axios'

import { AppBar, Toolbar, Button, IconButton, Snackbar, withStyles, Typography } from 'material-ui';

import * as mdi from 'mdi-material-ui';

import { DataTypeProvider } from '@devexpress/dx-react-grid';
import DataTableBase from "./data_table_base"

import * as config from "./config"
import { toFixedMoney } from './utils';
import { CurrencyTypeProvider } from "./common_components"


// =============================================
const DATA_REPO = "repoes";
const DATA_FILTER = "";

const COLUMNS = [
    { name: 'id', title: '序号' },
    { name: 'code', title: '编号', getCellValue: row => row._embedded.material.code },
    { name: "name", title: "名称", getCellValue: row => row._embedded.material.name },
    { name: "type", title: "类型", getCellValue: row => row._embedded.material.type ? row._embedded.material.type.name : null },
    { name: "spec", title: "规格", getCellValue: row => row._embedded.material.spec },
    // { name: "safeQuantity", title: "安全库存", getCellValue: row => row._embedded.material.safeQuantity },
    { name: "quantity", title: "库存" },
    { name: "price", title: "单价" },
    { name: "subtotal", title: "小计", getCellValue: row => toFixedMoney(row.quantity * row.price) },
]

// const SafeQuantityTypeProvider = props => (
//     <DataTypeProvider
//         formatterComponent={({ value }) => <Typography style={{ opacity: .7 }} >{value}</Typography>}
//         {...props}
//     />
// );

// const QuantityTypeProvider = props => (
//     <DataTypeProvider
//         formatterComponent={({ row, value }) =>
//             <Typography style={value >= row._embedded.material.safeQuantity ? {} : { fontWeight: 'bold', color: 'red' }} >{value}</Typography>
//         }
//         {...props}
//     />
// );

// =============================================
class RepoPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            // data: null,
            changes: [],
  
            //
            snackbarOpen: false,
            snackbarContent: "",
      }

        this.dataRepoApiUrl = config.DATA_API_BASE_URL + DATA_REPO + DATA_FILTER;

        this.editingColumnExtensions = [
            { columnName: 'id', editingEnabled: false },
            { columnName: 'code', editingEnabled: false },
            { columnName: 'name', editingEnabled: false },
            { columnName: 'type', editingEnabled: false },
            { columnName: 'spec', editingEnabled: false },
            { columnName: 'safeQuantity', editingEnabled: false },
            { columnName: 'subtotal', editingEnabled: false },
        ];

        this.doLoad = this.doLoad.bind(this)

        this.doUpdate = ((r, c) => {
            let { changes } = this.state

            let item = changes.find(i => i.id == r.id)
            if (item == null) {
                item = { ...r }
                changes.push(item)
            }
            item.change = { ...item.change, ...c }
            this.forceUpdate()

            // let v = this.state.availableValues['type'].find(v => v.name === c.type)
            // if (v && c.type) c.type = "../materialTypes/" + v.id

            // return axios.patch(this.dataRepoApiUrl + "/" + r['id'], c)
            //     .then(resp => resp.data)
            //     .then(j => ({ ...j, type: v && v.name ? v.name : undefined }))
            return new Promise((resolve, reject) => resolve(c))
        }).bind(this)

        this.saveInventory = (() => {
            let { changes } = this.state
            let data = changes.map(ci => ({ id: ci.id, ...ci.change }))

            axios.patch(`${config.API_BASE_URL}inventory`, data)
                .then(r => {
                    this.setState({ changes: [] })
                    this.showSnackbar("已保存")
                })
                .catch(e => this.showSnackbar(e.message));
        }).bind(this)
    }

    showSnackbar(msg: String) {
        this.setState({ snackbarOpen: true, snackbarContent: msg });
    }

    componentDidMount() {
    }

    doLoad = () => {
        return axios.get(this.dataRepoApiUrl)//,
            .then(resp => resp.data._embedded[DATA_REPO])
        // .then(resp => {
        //     this.state.data = resp.data._embedded[DATA_REPO]
        //     return this.state.data
        // })
    }

    render() {
        const { classes, width } = this.props
        const { snackbarOpen, snackbarContent } = this.state;

        return (
            <div className={classes.contentRoot}>
                <Toolbar className={classes.toolbar}>
                    {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton> */}
                    <Typography variant="title" className={classes.toolbarTitle}></Typography>
                    <Button onClick={this.saveInventory} color='primary' disabled={!this.state.changes || this.state.changes.length <= 0} style={{ fontSize: 18 }} ><mdi.ContentSave />保存</Button>
                    {/* <Button onClick={() => this.export()} color='primary' style={{ fontSize: 18 }} ><mdi.Printer />打印</Button> */}
                </Toolbar>

                <DataTableBase columns={COLUMNS}
                    editingColumnExtensions={this.editingColumnExtensions}
                    doLoad={this.doLoad}
                    doUpdate={this.doUpdate}
                    showAddCommand={false}
                    showDeleteCommand={false}
                    providers={[
                        // <SafeQuantityTypeProvider key='sqtp' for={["safeQuantity"]} />,
                        // <QuantityTypeProvider key='qtp' for={["quantity"]} />,
                        <CurrencyTypeProvider key='ctp' for={["price", "subtotal"]} />,
                    ]}
                />

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    autoHideDuration={3000}
                    open={snackbarOpen}
                    onClose={() => this.setState({ snackbarOpen: false })}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{snackbarContent}</span>}
                />
            </div>
        )
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ... {
    },
})


export default withStyles(styles)(RepoPage);