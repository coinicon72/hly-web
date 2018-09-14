import React
    // , { Component } 
    from 'react';

import {
    // Paper, 
    // Typography,
    // Grid, TextField, 
    // Button,
    // IconButton, Snackbar, 
    Input, Select,
    // Toolbar,
    // Divider, Tooltip,
    // Table, 
    // TableBody, 
    // TableCell, TableHead, TableRow
} from '@material-ui/core';

import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { Typography } from '@material-ui/core';

import { REPO_CHANGING_TYPE_IN, REPO_CHANGING_TYPE_OUT } from "./common"

import { COLOR_STOCK_IN, COLOR_STOCK_OUT } from "./common_styles"

export const CurrencyTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={({ value }) => value ? <Typography>¥ {value}</Typography> : null}
        {...props}
    />
);


export const TaxTypeEditor = ({ value, onValueChange }) => (
    <Select
        native
        input={<Input />}
        value={value}
        onChange={event => {
            onValueChange(event.target.value)
        }
        }
        style={{ width: '100%' }}
    >
        <option key="o-1" value=""></option>
        <option key="o0" value={false}>不含税</option>
        <option key="o1" value={true}>含税</option>
    </Select>
);

// const BooleanTypeProvider = props => (
export const TaxTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={
            ({ row, value }) =>
                value ? <Typography style={{ fontWeight: 'bold', color: 'red' }}>含税</Typography> : null
        }
        editorComponent={TaxTypeEditor}
        {...props}
    />
);


export const BooleanTypeEditor = ({ value, onValueChange }) => (
    <Select
        native
        input={<Input />}
        value={value}
        onChange={event => {
            onValueChange(event.target.value)
        }
        }
        style={{ width: '100%' }}
    >
        <option key="o-1" value=""></option>
        <option key="o0" value={false}>否</option>
        <option key="o1" value={true}>是</option>
    </Select>
);

// const BooleanTypeProvider = props => (
export const BooleanTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={
            ({ row, value }) =>
                value ? '是' : null
        }
        editorComponent={BooleanTypeEditor}
        {...props}
    />
);


export const OrderStatusEditor = ({ value, onValueChange }) => (
    <Select
        native
        input={<Input />}
        value={value}
        onChange={event => {
            onValueChange(event.target.value)
        }
        }
        style={{ width: '100%' }}
    >
        <option key="o-1" value=""></option>
        <option key="o0" value={0}>签订</option>
        <option key="o1" value={1}>生产中</option>
        <option key="o2" value={2}>已发货</option>
        <option key="o3" value={3}>已结算</option>
        <option key="o4" value={4}>已收款</option>
    </Select>
);

// const BooleanTypeProvider = props => (
export const OrderStatusProvider = props => (
    <DataTypeProvider
        formatterComponent={
            ({ row, value }) => {
                switch (value) {
                    case 0: return "签订";
                    case 1: return "生产中";
                    case 2: return "已发货";
                    case 3: return "已结算";
                    case 4: return "已收款";
                }
            }}
        editorComponent={OrderStatusEditor}
        {...props}
    />
);


export const OrderRelatedTypeEditer = ({ value, onValueChange }) => (
    <Select
        native
        input={<Input />}
        value={value}
        onChange={event => {
            onValueChange(event.target.value)
        }
        }
        style={{ width: '100%' }}
    >
        <option key="o0" value=""></option>
        <option key="o1" value={1}>订单相关</option>
        <option key="o2" value={2}>采购相关</option>
    </Select>
);

// const BooleanTypeProvider = props => (
export const OrderRelatedTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={
            ({ row, value }) => {
                switch (value) {
                    case 0: return "";
                    case 1: return "订单相关";
                    case 2: return "采购相关";
                }
            }}
        editorComponent={OrderRelatedTypeEditer}
        {...props}
    />
);



export const RepoChangingTypeEditor = ({ value, onValueChange }) => (
    <Select
        native
        input={<Input />}
        value={value}
        onChange={event => {
            onValueChange(event.target.value)
        }
        }
        style={{ width: '100%' }}
    >
        <option key="o-1" value=""></option>
        <option key="o0" value={REPO_CHANGING_TYPE_IN}>入库</option>
        <option key="o1" value={REPO_CHANGING_TYPE_OUT}>出库</option>
    </Select>
);

// const BooleanTypeProvider = props => (
// export const ReasonTypeProvider = props => (
//     <DataTypeProvider
//         formatterComponent={
//             ({ row, value }) =>
//                 value === REPO_CHANGING_TYPE_IN ? '入库' : '出库'
//         }
//         editorComponent={ReasonTypeEditor}
//         {...props}
//     />
// );

export const RepoChangingTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={({ row, value }) =>
            <Typography key={value} style={value === REPO_CHANGING_TYPE_IN ? { color: COLOR_STOCK_IN } : { color: COLOR_STOCK_OUT }}>{value === REPO_CHANGING_TYPE_IN ? '入库' : '出库'}</Typography>}
            editorComponent={RepoChangingTypeEditor}
            {...props}
    />
);
