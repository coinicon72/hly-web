import React, { Component } from 'react';

import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { Typography } from 'material-ui';

export const CurrencyTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={({ value }) => value ? <Typography>¥ {value}</Typography> : null}
        {...props}
    />
);
