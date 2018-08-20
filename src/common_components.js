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
