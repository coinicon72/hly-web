// @flow

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import axios from 'axios'

import { withStyles, Typography } from '@material-ui/core';

import { DataTypeProvider } from '@devexpress/dx-react-grid';

//
import * as config from "./config"

import CommonStyles from "./common_styles";
import { toFixedMoney } from './utils';
import { CurrencyTypeProvider } from "./common_components"

import DataTableBase from "./data_table_base"


// =============================================
const DATA_REPO = "repoItems";
const DATA_FILTER = "";

const COLUMNS = [
    { name: 'code', title: '编号', getCellValue: row => row._embedded.material.code },
    { name: "name", title: "名称", getCellValue: row => row._embedded.material.name },
    { name: "type", title: "类型", getCellValue: row => row._embedded.material.type ? row._embedded.material.type.name : null },
    { name: "spec", title: "规格", getCellValue: row => row._embedded.material.spec },
    { name: "safeQuantity", title: "安全库存", getCellValue: row => row._embedded.material.safeQuantity },
    { name: "quantity", title: "库存" },
    { name: "price", title: "单价" },
    { name: "subtotal", title: "小计", getCellValue: row => toFixedMoney(row.quantity * row.price) },
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
class RepoDetailsPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepoApiUrl = config.DATA_API_BASE_URL + DATA_REPO + DATA_FILTER;

        this.doLoad = this.doLoad.bind(this)
    }

    componentDidMount() {
    }

    doLoad = () => {
        return axios.get(this.dataRepoApiUrl)//,
            .then(resp => resp.data._embedded[DATA_REPO])
    }

    render() {
        const { classes, width } = this.props

        return (
            <div className={classes.contentRoot}>
                <DataTableBase columns={COLUMNS}
                    doLoad={this.doLoad}
                    disableEdit={true}
                    providers={[
                        <SafeQuantityTypeProvider key='sqtp' for={["safeQuantity"]} />,
                        <QuantityTypeProvider key='qtp' for={["quantity"]} />,
                        <CurrencyTypeProvider key='ctp' for={["price", "subtotal"]} />,
                    ]}
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


export default withStyles(styles)(RepoDetailsPage);