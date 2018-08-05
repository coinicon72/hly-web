// @flow

import React from 'react';

import CommonStyles from "./common_styles";

import axios from 'axios'

import { withStyles } from '@material-ui/core';
import { Toolbar, Typography, Grid, TextField, IconButton, Button } from '@material-ui/core';
import {
    TableEditRow,
} from '@devexpress/dx-react-grid-material-ui';

import { ArrowLeft, Export } from 'mdi-material-ui';

import { LookupEditCell } from "./data_table_util";
import DataTableBase from "./data_table_base";

import { getTodayString, toDateString } from "./utils"

import {
    EXPORT_BASE_URL,
    DATA_API_BASE_URL
} from "./config";


// =============================================
class CollectingSettlementStatPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepo = "collectingSettlements";
        this.dataRepoApiUrl = DATA_API_BASE_URL + `${this.dataRepo}/search/findByStatus?status=0`;

        this.dataTable = null

        this.state = {
            loaded: false,
            // availableValues: {},

            from: null,
            to: null,

            status: 0,
        }

        // this.editingColumnExtensions = [
        //     { columnName: 'id', editingEnabled: false },
        // ];

        // this.changeAddedRowsCallback = (row => {
        //     return Object.keys(row).length ? row : {
        //         code: '',
        //         name: '',
        //         disabled: false,
        //         comment: '',
        //     }
        // })//.bind(this);

        // this.commitChanges = this.commitChanges.bind(this);

        // this.editCell = ((props) => {
        //     let availableColumnValues = this.state.availableValues[props.column.name];

        //     if (availableColumnValues) {
        //         availableColumnValues = availableColumnValues.map(r => r.name)
        //         return <LookupEditCell {...props} availableColumnValues={availableColumnValues} />;
        //     }
        //     return <TableEditRow.Cell {...props} />;
        // })//.bind(this);

        // this.addRowHandler = () => this.props.history.push('/collectingSettlementDetails');

        this.onRowDoubleClicked = (row) => {
            if (row)
                this.props.history.push('/collectingSettlementDetails/' + row.id);
        }

        this.handleFromChange = e => {
            this.setState({ from: e.target.value })
        }

        this.handleToChange = e => {
            this.setState({ to: e.target.value })
        }

        this.doLoad = () => {
            const { from, to } = this.state

            this.dataRepoApiUrl = DATA_API_BASE_URL + `${this.dataRepo}/search/findByStatusAndConfirmedDateBetween?status=2&from=${from}&to=${to}`;

            return axios.get(this.dataRepoApiUrl)//,
                .then(resp => resp.data._embedded[this.dataRepo])
        }
    }

    componentDidMount() {
        // let to = getTodayString()
        let to = new Date()
        let from = new Date(to)
        from.setDate(from.getDate() - 30);
        this.setState({ from: toDateString(from), to: toDateString(to) })
    }

    render() {
        const { classes } = this.props
        const { from, to } = this.state

        return <div className={classes.contentRoot}>
            {/* <Toolbar className={classes.toolbar}>
                <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                <Typography variant="title" className={classes.toolbarTitle}>应收汇总</Typography>
                <Button href={`${EXPORT_BASE_URL}/roles`} color='primary' style={{ fontSize: 18 }} ><mdi.Export />导出</Button>
            </Toolbar> */}

            <Grid style={{ display:'flex', alignItems: 'center' }}>
                <TextField type="date" required id="start"
                    label="起始日期"
                    value={from}
                    margin="normal"
                    onChange={this.handleFromChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField type="date" required id="end" style={{ marginLeft: '1em' }}
                    label="结束日期"
                    value={to}
                    margin="normal"
                    onChange={this.handleToChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                {/* <span style={{flex:1}} />
                <Button href={`${EXPORT_BASE_URL}/collectingSettlements?from=${from}&to=${to}`} color='primary' style={{ fontSize: 18 }} ><Export />导出</Button> */}
            </Grid>

            <DataTableBase
                key={`${from}-${to}`}
                columns={[
                    { name: 'id', title: '序号' },
                    { name: 'client', title: '客户', getCellValue: row => (row.client) ? row.client.name : null },
                    { name: 'collectingPeriod', title: '结算周期', getCellValue: row => (row.client) ? `${row.client.collectingPeriod} 天` : null },
                    { name: "confirmedDate", title: "结算时间" },
                    { name: "collectedDate", title: "收款时间" },
                    { name: "value", title: "应收" },
                    { name: "collectedValue", title: "实收" },
                ]}
                editCell={this.editCell}
                changeAddedRowsCallback={this.changeAddedRowsCallback}
                // commitChanges={this.commitChanges}
                editingColumnExtensions={this.editingColumnExtensions}
                doLoad={this.doLoad}
                disableEdit={true}
                // doAdd={this.doAdd}
                // doUpdate={this.doUpdate}
                // doDelete={this.doDelete}
                // showEditCommand={false}
                // showDeleteCommend={false}
                // addHandler={this.addRowHandler}
                clickHandler={this.onRowDoubleClicked}
            />
        </div>
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    // ...{
    // },
})


export default withStyles(styles)(CollectingSettlementStatPage);