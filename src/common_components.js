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


export const DeliverySheetStatusEditor = ({ value, onValueChange }) => (
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
        <option key="o0" value={0}>未提交</option>
        <option key="o1" value={1}>已提交</option>
        <option key="o2" value={2}>已处理</option>
    </Select>
);

// const BooleanTypeProvider = props => (
export const DeliverySheetStatusProvider = props => (
    <DataTypeProvider
        formatterComponent={
            ({ row, value }) => {
                switch (value) {
                    case 0: return <Typography style={{ color: 'gray' }}>未提交</Typography>;
                    case 1: return <Typography style={{ color: 'green' }}>已提交</Typography>;
                    case 2: return <Typography style={{ color: 'orange' }}>已处理</Typography>;
                    default: return null;
                }
                // value === 1? <Typography style={{ color: 'green' }}>已提交</Typography> : null
            }
        }
        editorComponent={DeliverySheetStatusEditor}
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


export const PurchasingOrderStatusEditor = ({ value, onValueChange }) => (
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
        <option key="o1" value={1}>执行中</option>
        <option key="o2" value={2}>已入库</option>
        <option key="o3" value={3}>已结算</option>
        <option key="o4" value={4}>已付款</option>
    </Select>
);

export const PurchasingOrderStatusProvider = props => (
    <DataTypeProvider
        formatterComponent={
            ({ row, value }) => {
                switch (value) {
                    case 0: return "签订";
                    case 1: return "执行中";
                    case 2: return "已入库";
                    case 3: return "已结算";
                    case 4: return "已付款";
                    default: return '';
                }
            }}
        editorComponent={PurchasingOrderStatusEditor}
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
                    default: return '';
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
        <option key="o1" value={1}>发货相关</option>
        <option key="o2" value={2}>采购相关</option>
        <option key="o3" value={3}>BOM相关</option>
    </Select>
);

// const BooleanTypeProvider = props => (
export const OrderRelatedTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={
            ({ row, value }) => {
                switch (value) {
                    case 1: return "发货相关";
                    case 2: return "采购相关";
                    case 3: return "BOM相关";
                    default: return "";
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

export const RepoChangingTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={({ row, value }) =>
            <Typography key={value} style={value === REPO_CHANGING_TYPE_IN ? { color: COLOR_STOCK_IN } : { color: COLOR_STOCK_OUT }}>{value === REPO_CHANGING_TYPE_IN ? '入库' : '出库'}</Typography>}
        editorComponent={RepoChangingTypeEditor}
        {...props}
    />
);


// 0 = init; 1 = submitted; 2 = executed; -1 = rejected
export const RepoChangingStatusEditor = ({ value, onValueChange }) => (
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
        <option key="o" value=""></option>
        <option key="o0" value={0}>创建</option>
        <option key="o1" value={1}>已提交</option>
        <option key="o2" value={2}>已完成</option>
        <option key="o-1" value={-1}>被拒绝</option>
    </Select>
);

export const RepoChangingStatusProvider = props => (
    <DataTypeProvider
        formatterComponent={({ row, value }) =>
        // <Typography key={value} style={value === REPO_CHANGING_TYPE_IN ? { color: COLOR_STOCK_IN } : { color: COLOR_STOCK_OUT }}>{value === REPO_CHANGING_TYPE_IN ? '入库' : '出库'}</Typography>}
        {
            switch (value) {
                case 0: return "创建";
                case 1: return "已提交";
                case 2: return "已完成";
                case -1: return "被拒绝";
                default: return "";
            }
        }}
        editorComponent={RepoChangingStatusEditor}
        {...props}
    />
);
