// @flow

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

// import _ from "lodash";

import { withStyles } from 'material-ui/styles';

import { Paper, Typography, Button, IconButton, Snackbar, Input, Select } from 'material-ui';
// import Icon from 'material-ui/Icon';

import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';

import { AddCircleOutline, PlaylistAdd, Delete, Edit, Save, Cancel } from '@material-ui/icons';
import { Refresh } from 'mdi-material-ui';

import {
    SelectionState,
    IntegratedSelection,
    SortingState,
    IntegratedSorting,
    FilteringState,
    IntegratedFiltering,
    EditingState,
    PagingState,
    IntegratedPaging,
} from '@devexpress/dx-react-grid';

import {
    Grid,
    Table,
    VirtualTable,
    TableHeaderRow,
    TableSelection,
    PagingPanel,
    Toolbar,
    TableEditRow,
    TableEditColumn,
    TableColumnResizing,
    TableFilterRow,
} from '@devexpress/dx-react-grid-material-ui';

import axios from 'axios'

import { LookupEditCell } from "./data_table_util";

// import ReactHeight from 'react-height';

// import { generateRows } from './data_generator'
const AddButton = ({ onExecute }) => (
    // <div style={{ textAlign: 'center' }}>
    <IconButton
        color="primary"
        onClick={onExecute}
        title="新增一条数据"
    >
        <AddCircleOutline style={{ fontSize: 28 }} />
    </IconButton>
    // </div>
);

const EditButton = ({ onExecute }) => (
    <IconButton onClick={onExecute} title="编辑">
        <Edit />
    </IconButton>
);

const DeleteButton = ({ onExecute }) => (
    <IconButton onClick={onExecute} title="删除">
        <Delete />
    </IconButton>
);

const CommitButton = ({ onExecute }) => (
    <IconButton onClick={onExecute} title="保存所有操作">
        <Save />
    </IconButton>
);

const CancelButton = ({ onExecute }) => (
    <IconButton color="secondary" onClick={onExecute} title="取消">
        <Cancel />
    </IconButton>
);

const commandComponents = {
    add: AddButton,
    edit: EditButton,
    delete: DeleteButton,
    commit: CommitButton,
    cancel: CancelButton,
};

const Command = ({ id, onExecute }) => {
    const CommandButton = commandComponents[id];
    return (
        <CommandButton
            onExecute={onExecute}
        />
    );
};


// const API_BASE_URL = "/api/data/"

class DataTableBase extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepo = props.dataRepo; //'clientTypes';
        this.dataRepoApiUrl = props.apiBaseUrl + this.dataRepo;

        this.state = {
            // toolbarHeight: 0,

            //
            // columns: [
            //     { name: 'id', title: '编号' },
            //     { name: 'name', title: '名称' },
            // ],
            rows: [],

            //
            selection: [],

            // editingColumnExtensions: [
            //     { columnName: 'id', editingEnabled: false },
            // ],
            editingRowIds: [],
            addedRows: [],
            rowChanges: {},
            deletingRows: [],

            //
            snackbarOpen: false,
            snackbarContent: "",
        };

        this.changeSelection = selection => this.setState({ selection });

        // this.toolbar = null;
        this.commitChanges = this.commitChanges.bind(this)
        if (props.commitChanges)
            this.commitChanges = props.commitChanges;

        this.changeEditingRowIds = editingRowIds => {
            console.debug('changeEditingRowIds');
            this.setState({ editingRowIds });
        };

        //
        this.defaultAddedRowsCallback = row => (Object.keys(row).length ? row : {
            id: 0,
            name: '',
        });
        if (props.changeAddedRowsCallback)
            this.defaultAddedRowsCallback = props.changeAddedRowsCallback;

        //
        this.changeAddedRows = addedRows => {
            console.debug('changeAddedRows');
            this.setState({
                addedRows: addedRows.map(this.defaultAddedRowsCallback),
            });
        }
        this.changeAddedRows = this.changeAddedRows.bind(this)

        this.changeRowChanges = rowChanges => {
            console.debug('changeRowChanges'); this.setState({ rowChanges });
        };

        this.cancelDelete = () => this.setState({ deletingRows: [] });

        this.deleteRows = () => {
            const rows = [...this.state.rows];
            const deletingRows = [...this.state.deletingRows]
            deletingRows.sort((i, j) => j > i)

            // new Promise((s, e) => deletingRows.forEach(idx => s(idx)))
            // .then(idx => {

            for (let i = 0; i < deletingRows.length; i++) {
                let idx = deletingRows[0];
                let r = rows[idx]

                this.doDelete && this.doDelete(r) //axios.delete(this.dataRepoApiUrl + "/" + r['id'])
                    .then(r => {
                        rows.splice(idx, 1);
                        deletingRows.splice(0, 1);
                        this.setState({ rows, deletingRows });
                    })
                    .catch(e => this.showSanckbar(e.message));
            }
            // })
        };

        this.doLoad = props.doLoad
        this.doAdd = props.doAdd
        this.doUpdate = props.doUpdate
        this.doDelete = props.doDelete
    }

    showSanckbar(msg: String) {
        this.setState({ snackbarOpen: true, snackbarContent: msg });
    }

    // doLoad = () => {
    //     return axios.get(this.dataRepoApiUrl)//,
    //         .then(r => r.data._embedded[this.dataRepo])
    //     // .then(j => this.setState({ rows: j }))
    //     // .catch(e => this.showSanckbar(e.message));
    // }

    // doAdd = () => {

    // }

    // doUpdate = () => {

    // }

    // doDelete = () => {

    // }

    commitChanges = ({ added, changed, deleted }) => {
        let { rows } = this.state;

        if (added && this.doAdd) {
            added.forEach(r => {
                delete r.id;
                this.doAdd(r) //axios.post(this.dataRepoApiUrl, r)
                    // .then(r => r.data)
                    .then(r => {
                        rows = [...rows, r];
                        this.setState({ rows });
                    })
                    .catch(e => this.showSanckbar(e.message));
            });
        }

        if (changed && this.doUpdate) {
            for (let i in changed) {
                let r = rows[i]

                if (r) {
                    this.doUpdate(r, changed[i]) //axios.patch(this.dataRepoApiUrl + "/" + r['id'], changed[i])
                        // .then(resp => resp.data)
                        .then(j => {
                            rows = rows.map((row, idx) => changed[idx] ? { ...row, ...j } : row);
                            this.setState({ rows });
                        })
                        .catch(e => this.showSanckbar(e.message));
                }
            }
        }

        // here, only add deleted row into deletingrows
        // no need to process deleting here, shows a dialog to let user confirm this action
        if (deleted) {
            // deleted.forEach(idx => {
            //     let r = rows[idx]
            //     axios.delete(this.dataRepoApiUrl + "/" + r['id'])
            //         .then(r => {
            //             // this.setState({rows: this.state.rows.push(r)})
            //         })
            //         .catch(e => this.showSanckbar(e.message));
            // })
            this.setState({ deletingRows: deleted || this.state.deletingRows });
        }


        // console.debug('commitChanges')
    }


    /**
     * Calculate & Update state of new dimensions
     */
    updateDimensions() {
        // if(window.innerWidth < 500) {
        //   this.setState({ width: 450, height: 102 });
        // } else {
        let update_width = window.innerWidth//-100;
        let update_height = window.innerHeight// Math.round(update_width/4.4);
        this.setState({ width: update_width, height: update_height });

        this.setState({ tableHeight: update_height - 64 - 65 })
        // }
    }

    /**
     * Add event listener
     */
    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));

        //
        console.debug("componentDidMount: " + this);

        //
        this.doLoad && this.doLoad()
            .then(j => this.setState({ rows: j }))
            .catch(e => this.showSanckbar(e.message));
    }

    /**
     * Remove event listener
     */
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    render() {
        const { classes, columns, editCell, editingColumnExtensions, changeAddedRows } = this.props;
        const { rows, selection, editingRowIds, rowChanges, addedRows, tableHeight, snackbarOpen, snackbarContent, deletingRows } = this.state;

        return (
            // <ReactHeight onHeightReady={height => console.log(height)}>
            // <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            /* <span>Total rows selected: {selection.length}</span> */
            <Paper>
                <Grid
                    rows={rows}
                    columns={columns}
                >
                    <Toolbar>
                        <div>
                            <Typography color="inherit" noWrap>
                                {selection.length}
                            </Typography>
                            <IconButton color="inherit"><Refresh /></IconButton>
                        </div>
                    </Toolbar>

                    {/* <SelectionState
                        selection={selection}
                        onSelectionChange={this.changeSelection}
                    />
                    <IntegratedSelection /> */}

                    <SortingState
                        defaultSorting={[{ columnName: 'id', direction: 'asc' }]}
                    />
                    <IntegratedSorting />

                    <FilteringState defaultFilters={[]} />
                    <IntegratedFiltering />

                    {/* <PagingState
                        defaultCurrentPage={0}
                        pageSize={15}
                    />
                    <IntegratedPaging /> */}
                    {/* <ReactHeight onHeightReady={height => {
                        console.log(height);
                        this.setState({ toolbarHeight: height });
                        }}> */}
                    {/* </ReactHeight> */}

                    <EditingState
                        columnExtensions={editingColumnExtensions}

                        editingRowIds={editingRowIds}
                        onEditingRowIdsChange={this.changeEditingRowIds}

                        rowChanges={rowChanges}
                        onRowChangesChange={this.changeRowChanges}

                        addedRows={addedRows}
                        onAddedRowsChange={changeAddedRows ? changeAddedRows : this.changeAddedRows}

                        // defaultEditingRowIds={[]}
                        onCommitChanges={this.commitChanges}
                    />

                    <VirtualTable height={tableHeight} messages={{ noData: "没有数据" }} />

                    {/* <TableColumnResizing /> */}
                    {/* defaultColumnWidths={defaultColumnWidths} /> */}
                    <TableHeaderRow showSortingControls />
                    {editCell ? <TableEditRow cellComponent={editCell} /> : <TableEditRow />}

                    <TableEditColumn
                        showAddCommand
                        showEditCommand
                        showDeleteCommand
                        commandComponent={Command}
                    />
                    {/* <TableSelection showSelectAll /> */}
                    {/* <PagingPanel /> */}
                </Grid>


                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    autoHideDuration={3000}
                    open={snackbarOpen}
                    onClose={() => this.setState({ snackbarOpen: false })}
                    SnackbarContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{snackbarContent}</span>}
                />


                {/* deletion confirm */}
                <Dialog
                    open={!!deletingRows.length}
                    onClose={this.cancelDelete}
                    classes={{ paper: classes.dialog }}
                >
                    <DialogTitle>删除</DialogTitle>
                    <DialogContent>
                        <DialogContentText>确定删除如下数据吗？</DialogContentText>
                        <Paper>
                            <Grid
                                rows={rows.filter((row, i) => deletingRows.indexOf(i) > -1)}
                                columns={columns}
                            >
                                <Table
                                // columnExtensions={tableColumnExtensions}
                                // cellComponent={Cell}
                                />
                                <TableHeaderRow />
                            </Grid>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.cancelDelete} color="primary">取消</Button>
                        <Button onClick={this.deleteRows} color="secondary">删除</Button>
                    </DialogActions>
                </Dialog>            </Paper>
            // </div>
            // </ReactHeight>
        );
    }
}


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
});

export default withStyles(styles)(DataTableBase);

// export default () => <h2>test data table base</h2>