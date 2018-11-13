// @flow

import React from 'react';

import CommonStyles from "./common_styles";

import axios from 'axios'

import { withStyles } from '@material-ui/core';
import { Toolbar, Typography } from '@material-ui/core';
import {
    TableEditRow,
} from '@devexpress/dx-react-grid-material-ui';

// import {} from 'mdi-material-ui';

import { LookupEditCell } from "./data_table_util";
import DataTableBase from "./data_table_base";

import {
    // EXPORT_BASE_URL,
    DATA_API_BASE_URL
} from "./config";


// =============================================
class CollectingSettlementPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepo = "collectingSettlements";
        this.dataRepoApiUrl = `${DATA_API_BASE_URL}/${this.dataRepo}/search/findByStatus?status=0`;

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

        this.addRowHandler = () => this.props.history.push('/collectingSettlementDetails');

        this.onRowDoubleClicked = (row) => {
            if (row)
                this.props.history.push('/collectingSettlementDetails/' + row.id);
        }
    
        this.doLoad = this.doLoad.bind(this)
        this.doAdd = this.doAdd.bind(this)
        this.doUpdate = this.doUpdate.bind(this)
        this.doDelete = this.doDelete.bind(this)
    }

    componentDidMount() {
    }

    doLoad = () => {
        const { type } = this.props;
        if (type === 'process') {
            this.dataRepoApiUrl = `${DATA_API_BASE_URL}/${this.dataRepo}/search/findByStatus?status=1`;
            // this.setState({ status: 1 })
        }

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
                {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton> */}
                <Typography variant="title" className={classes.toolbarTitle}></Typography>
                {/* <Button href={`${EXPORT_BASE_URL}/roles`} color='primary' style={{ fontSize: 18 }} ><Export />导出</Button> */}
            </Toolbar>

            <DataTableBase columns={[
                { name: 'id', title: '序号' },
                { name: 'client', title: '客户', getCellValue: row => (row.client) ? row.client.name : null },
                { name: 'paymentPeriod', title: '结算周期', getCellValue: row => (row.client) ? `${row.client.collectingPeriod} 天` : null },
                { name: "createDate", title: "生成时间" },
                // { name: "disabled", title: "有效" },
                // { name: "confirmedDate", title: "确认时间" },
                // { name: "confirmedDate", title: "确认时间" },
            ]}
                editCell={this.editCell}
                changeAddedRowsCallback={this.changeAddedRowsCallback}
                // commitChanges={this.commitChanges}
                editingColumnExtensions={this.editingColumnExtensions}
                doLoad={this.doLoad}
                doAdd={this.doAdd}
                // doUpdate={this.doUpdate}
                doDelete={this.doDelete}
                showEditCommand={false}
                addHandler={this.addRowHandler}
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


export default withStyles(styles)(CollectingSettlementPage);