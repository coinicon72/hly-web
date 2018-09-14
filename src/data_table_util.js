import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core';
import { Select, Input, TableCell } from '@material-ui/core';

import { DataTypeProvider } from '@devexpress/dx-react-grid';


const styles = theme => ({
    lookupEditCell: {
        paddingTop: theme.spacing.unit * 0.875,
        paddingRight: theme.spacing.unit,
        paddingLeft: theme.spacing.unit,
    },
    dialog: {
        width: 'calc(100% - 16px)',
    },

    inputRoot: {
        width: '100%',
    },

    numericInput: {
        textAlign: 'right',
    },
});


const LookupEditCellBase = ({
    availableColumnValues, value, onValueChange, classes,
}) => (
        <TableCell
            className={classes.lookupEditCell}
        >
            <Select
                native
                value={value}
                onChange={event => onValueChange(event.target.value)}
                input={
                    <Input
                        classes={{ root: classes.inputRoot }}
                    />
                }
            >
                <option value="" />
                {availableColumnValues.map(item => (
                    // <MenuItem key={item} value={item}>{item}</MenuItem>
                    // <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                    // <option key={item.id} value={item.id}>{item.name}</option>
                    <option key={item} value={item}>{item}</option>
                ))}
            </Select>
        </TableCell>
    );

export const LookupEditCell = withStyles(styles)(LookupEditCellBase);



const getInputValue = value => (value === undefined ? '' : value);

const EditorBase = ({ value, onValueChange, classes, allowNumeric, min, max, step }) => {
    const handleChange = (event) => {
        const { value: targetValue } = event.target;
        if (targetValue.trim() === '') {
            onValueChange();
            return;
        }
        onValueChange(allowNumeric ? parseFloat(targetValue) : parseInt(targetValue, 10));
    };
    return (
        <Input
            type="number"
            classes={{
                root: classes.inputRoot,
                input: classes.numericInput,
            }}
            value={getInputValue(value)}
            inputProps={{
                min: min ? min : undefined,
                max: max ? max : undefined,
                step: step ? step : undefined,
            }}
            onChange={handleChange}
        />
    );
};

EditorBase.propTypes = {
    value: PropTypes.number,
    onValueChange: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    allowNumeric: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number
};

EditorBase.defaultProps = {
    value: undefined,
    allowNumeric: false,
    min: 0,
    step: 1,
};

// const NumericEditorBase = ({ value, onValueChange, classes, min, max, step }) => {
// }

const Editor = withStyles(styles)(EditorBase);
// export Editor;


const CurrencyEditor = (props) => (
    <EditorBase min={0} />
);
export const CurrencyFormatter = ({ value }) => `¥{value}`;

export const CurrencyTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={CurrencyFormatter}
        editorComponent={CurrencyEditor}
        {...props}
    />
);


const NumericEditor = (props) => (
    <EditorBase allowNumeric={true} />
);
export const NumericTypeProvider = props => (
    <DataTypeProvider
        // formatterComponent={Formatter}
        editorComponent={NumericEditor}
        {...props}
    />
);



// const IntEditor = (props) => (
//     <EditorBase />
// );
export const IntTypeProvider = props => (
    <DataTypeProvider
        // formatterComponent={Formatter}
        editorComponent={Editor}
        {...props}
    />
);