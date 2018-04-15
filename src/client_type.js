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

const API_BASE_URL = "http://localhost:8080/api/data/"
const DATA_REPO = 'clientTypes';
const DATA_REPO_API_URL = API_BASE_URL + DATA_REPO;

class Page extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            // toolbarHeight: 0,

            //
            columns: [
                { name: 'id', title: '编号' },
                { name: 'name', title: '名称' },
            ],
            rows: [],

            //
            selection: [],

            editingStateColumnExtensions: [
                { columnName: 'id', editingEnabled: false },
            ],
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

        this.changeEditingRowIds = editingRowIds => {
            console.debug('changeEditingRowIds');
            this.setState({ editingRowIds });
        };

        this.changeAddedRows = addedRows => {
            console.debug('changeAddedRows');
            this.setState({
                addedRows: addedRows.map(row => (Object.keys(row).length ? row : {
                    id: 0,
                    name: '',
                })),
            });
        }

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

                axios.delete(DATA_REPO_API_URL + "/" + r['id'])
                    .then(r => {
                        rows.splice(idx, 1);
                        deletingRows.splice(0, 1);
                        this.setState({ rows, deletingRows });
                    })
                    .catch(e => this.showSanckbar(e.message));
            }
            // })
        };
    }

    showSanckbar(msg: String) {
        this.setState({ snackbarOpen: true, snackbarContent: msg });
    }

    commitChanges = ({ added, changed, deleted }) => {
        let { rows } = this.state;

        if (added) {
            added.forEach(r => {
                delete r.id;
                axios.post(DATA_REPO_API_URL, r)
                    .then(r => r.data)
                    .then(r => {
                        rows = [...rows, r];
                        this.setState({ rows });
                    })
                    .catch(e => this.showSanckbar(e.message));
            });
        }

        if (changed) {
            for (let i in changed) {
                let r = rows[i]

                if (r) {
                    axios.patch(DATA_REPO_API_URL + "/" + r['id'], changed[i])
                        .then(resp => resp.data)
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
            //     axios.delete(DATA_REPO_API_URL + "/" + r['id'])
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
        axios.get(DATA_REPO_API_URL)//,
            //     { mode: 'no-cors', headers: { 'Access-Control-Allow-Origin': '*', }, crossdomain: true, })
            // fetch("http://localhost:8080/api/data/clientTypes")//, {method: 'GET', mode: 'no-cors' })
            .then(r => r.data._embedded[DATA_REPO])
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
        const { classes } = this.props;
        const { rows, columns, selection } = this.state;

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
                        columnExtensions={this.state.editingStateColumnExtensions}

                        editingRowIds={this.state.editingRowIds}
                        onEditingRowIdsChange={this.changeEditingRowIds}

                        rowChanges={this.state.rowChanges}
                        onRowChangesChange={this.changeRowChanges}

                        addedRows={this.state.addedRows}
                        onAddedRowsChange={this.changeAddedRows}

                        // defaultEditingRowIds={[]}
                        onCommitChanges={this.commitChanges}
                    />

                    <VirtualTable height={this.state.tableHeight} />

                    {/* <TableColumnResizing /> */}
                    {/* defaultColumnWidths={defaultColumnWidths} /> */}
                    <TableHeaderRow showSortingControls />
                    <TableEditRow />
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
                    open={this.state.snackbarOpen}
                    onClose={() => this.setState({ snackbarOpen: false })}
                    SnackbarContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.state.snackbarContent}</span>}
                />


                {/* deletion confirm */}
                <Dialog
                    open={!!this.state.deletingRows.length}
                    onClose={this.cancelDelete}
                    classes={{ paper: classes.dialog }}
                >
                    <DialogTitle>删除</DialogTitle>
                    <DialogContent>
                        <DialogContentText>确定删除如下数据吗？</DialogContentText>
                        <Paper>
                            <Grid
                                rows={rows.filter((row, i) => this.state.deletingRows.indexOf(i) > -1)}
                                columns={this.state.columns}
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

export default withStyles(styles)(Page);