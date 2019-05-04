// @flow

// basic
import React from 'react';

// ui
import {
//     Grid as MuGrid,
    Paper, 
    // Typography, TextField, 
    Button, 
    // IconButton,
//     // MenuItem, Snackbar, 
//     Select, Toolbar,
//     // Divider, 
//     Tooltip, Chip,
//     // Input, 
//     InputLabel,
//     // InputAdornment,
//     // FormGroup, FormControlLabel, 
//     FormControl,
//     // FormHelperText,
//     Stepper, Step, StepLabel,
//     // Switch,
//     Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogActions, DialogContent,
//     // DialogContentText, 
    DialogTitle,
} from '@material-ui/core';

import {
    SelectionState,
    IntegratedSelection,
    SortingState,
    IntegratedSorting,
    FilteringState,
    IntegratedFiltering,
    // EditingState,
    // PagingState,
    // IntegratedPaging,
    // DataTypeProvider,
} from '@devexpress/dx-react-grid';

import {
    Grid,
    // Table as dxTable,
    VirtualTable,
    TableHeaderRow,
    TableSelection,
    // PagingPanel,
    // Toolbar,
    // TableEditRow,
    // TableEditColumn,
    // TableColumnResizing,
    TableFilterRow,
} from '@devexpress/dx-react-grid-material-ui';

class DialogCommonSelection<P, S> extends React.PureComponent<P, S> {
    state = {
        selection: [],
    };

    _changeSelection = (selection: number[]) => {
        if (this.multiple) {
            this.setState({ selection });
        } else {
            this.setState({ selection: selection.slice(selection.length - 1) });
        }
    }

    _done = () => {
        if (this.props.onSelected)
            this.props.onSelected(this.state.selection);

        this.setState({
            selection: []
        });
    }

    render() {
        let { classes, data } = this.props;
        let { selection } = this.state;

        return <Dialog
            open={this.props.show}
            onClose={this.props.onCancel}
            classes={{ paper: classes.dialog }}
        >
            <DialogTitle>{this.props.title}</DialogTitle>
            <DialogContent>
                <Paper>
                    <Grid
                        rows={data}
                        columns={this.columns}
                    >
                        <SelectionState
                            selection={selection}
                            onSelectionChange={this._changeSelection}
                        />
                        <IntegratedSelection />

                        <SortingState
                            defaultSorting={[{ columnName: 'id', direction: 'asc' }]}
                        />
                        <IntegratedSorting />

                        <FilteringState defaultFilters={[]} />
                        <IntegratedFiltering />

                        <VirtualTable height={400} messages={{ noData: "没有数据" }} />

                        <TableHeaderRow showSortingControls />
                        <TableFilterRow />
                        <TableSelection showSelectAll selectByRowClick={true} />
                    </Grid>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button onClick={this.props.onCancel} color="primary">取消</Button>
                <Button onClick={this._done} disabled={selection.length <= 0} color="secondary">添加</Button>
            </DialogActions>
        </Dialog>
    }
}

export default DialogCommonSelection;
// export default withStyles(CommonStyles)(DialogCommonSelection);