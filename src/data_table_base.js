// @flow

import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';

// import _ from "lodash";

import { withStyles } from '@material-ui/core';

import {
    Paper,
    // Typography, 
    Button, IconButton, Snackbar,
    // Input, Select, Toolbar, 
    Tooltip,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@material-ui/core';

import {
    AddCircleOutline,
    // PlaylistAdd, 
    Delete, Edit, Save, Cancel
} from '@material-ui/icons';
// import { Refresh } from 'mdi-material-ui';

import {
    // SelectionState,
    // IntegratedSelection,
    SortingState,
    IntegratedSorting,
    FilteringState,
    IntegratedFiltering,
    EditingState,
    // PagingState,
    // IntegratedPaging,
} from '@devexpress/dx-react-grid';

import {
    Grid,
    Table,
    VirtualTable,
    TableHeaderRow,
    // TableSelection,
    // PagingPanel,
    // Toolbar,
    TableEditRow,
    TableEditColumn,
    // TableColumnResizing,
    TableFilterRow,
} from '@devexpress/dx-react-grid-material-ui';

// import axios from 'axios'

import CommonStyles from "./common_styles";

// import {
//     TaxTypeProvider,
//     OrderStatusProvider
// } from './common_components'

// import { LookupEditCell } from "./data_table_util";

// import ReactHeight from 'react-height';

// import { generateRows } from './data_generator'
// const AddButton = ({ onExecute }) => (
//     <Tooltip title="新增一条数据">
//         <IconButton
//             color="primary"
//             onClick={onExecute}
//         >
//             <AddCircleOutline style={{ fontSize: 28 }} />
//         </IconButton>
//     </Tooltip>
// );

function CustomAddButton(handler) {
    return ({ onExecute }) => {
        if (handler) onExecute = handler
        return (
            <Tooltip title="新增一条数据">
                <IconButton
                    color="primary"
                    onClick={onExecute}
                >
                    <AddCircleOutline style={{ fontSize: 28 }} />
                </IconButton>
            </Tooltip>
        )
    }
}

const EditButton = ({ onExecute }) => (
    <Tooltip title="编辑">
        <IconButton onClick={onExecute}>
            <Edit />
        </IconButton>
    </Tooltip>
);

// function CustomEditButton(handler) {
//     return ({ onExecute }) => {
//         if (handler) onExecute = handler
//         return (
//             <Tooltip title="编辑">
//                 <IconButton onClick={onExecute}>
//                     <Edit />
//                 </IconButton>
//             </Tooltip>
//         )
//     }
// }

const DeleteButton = ({ onExecute }) => (
    <Tooltip title="删除">
        <IconButton onClick={onExecute}>
            <Delete />
        </IconButton>
    </Tooltip>
);

const CommitButton = ({ onExecute }) => (
    <Tooltip title="保存所有操作">
        <IconButton onClick={onExecute}>
            <Save />
        </IconButton>
    </Tooltip>
);

const CancelButton = ({ onExecute }) => (
    <Tooltip title="取消">
        <IconButton color="secondary" onClick={onExecute}>
            <Cancel />
        </IconButton>
    </Tooltip>
);

// function customAddHandler() {
//     console.log("customAddHandler")
// }

// function customEditHandler(a, b, c, ...params) {
//     console.log("customEditHandler")
// }

// const commandComponents = {
//     add: AddButton, //CustomAddButton(customAddHandler),
//     edit: EditButton,
//     delete: DeleteButton,
//     commit: CommitButton,
//     cancel: CancelButton,
// };

// const Command = ({ id, onExecute }) => {
//     const CommandButton = commandComponents[id];
//     return (
//         <CommandButton
//             onExecute={onExecute}
//         />
//     );
// };


// const API_BASE_URL = "/api/data/"
// const TableRow = ({ row, ...restProps }) => (
//     <Table.Row
//         {...restProps}
//         // eslint-disable-next-line no-alert
//         // onClick={() => alert(JSON.stringify(row))}
//         // onDoubleClick={() => alert("double click")}
//         style={{
//             cursor: 'pointer',
//         }}
//     />
// );

function tableRowWithClickHandler(handler) {
    return ({ row, ...restProps }) => (
        <Table.Row
            {...restProps}
            // eslint-disable-next-line no-alert
            // onClick={() => alert(JSON.stringify(row))}
            onDoubleClick={() => handler && handler(row)}
            style={{ cursor: 'pointer', }}
        />
    )
}

class DataTableBase extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepo = props.dataRepo; //'clientTypes';
        this.dataRepoApiUrl = props.apiBaseUrl + this.dataRepo;

        //
        this.commandComponents = {
            add: CustomAddButton(props.addHandler),
            edit: EditButton,// CustomEditButton(customEditHandler),
            delete: DeleteButton,
            commit: CommitButton,
            cancel: CancelButton,
        };

        this.Command = ({ id, onExecute }) => {
            const CommandButton = this.commandComponents[id];
            return (
                <CommandButton
                    onExecute={onExecute}
                />
            );
        };


        //
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

                if (this.doDelete) {
                    const result = this.doDelete(r) //axios.delete(this.dataRepoApiUrl + "/" + r['id'])
                    if (result)
                        result.then(r => {
                            rows.splice(idx, 1);
                            deletingRows.splice(0, 1);
                            this.setState({ rows, deletingRows });
                        })
                            .catch(e => this.showSnackbar(e.message));
                }
            }
            // })
        };

        this.doLoad = props.doLoad
        this.doAdd = props.doAdd
        this.doUpdate = props.doUpdate
        this.doDelete = props.doDelete
    }

    showSnackbar(msg: String) {
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
                    .catch(e => this.showSnackbar(e.message));
            });
        }

        if (changed && this.doUpdate) {
            // for (let i in changed) {
            Object.keys(changed).forEach(i => {
                let r = rows[i]

                if (r) {
                    this.doUpdate(r, changed[i]) //axios.patch(this.dataRepoApiUrl + "/" + r['id'], changed[i])
                        // .then(resp => resp.data)
                        .then(j => {
                            rows = rows.map((row, idx) => changed[idx] ? { ...row, ...j } : row);
                            this.setState({ rows });
                        })
                        .catch(e => this.showSnackbar(e.message));
                }
            })
        }

        // here, only add deleted row into deletingrows
        // no need to process deleting here, shows a dialog to let user confirm this action
        if (deleted) {
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

        this.setState({ tableHeight: update_height - 64 - 64 - 64 })
        // }
    }

    /**
     * Add event listener
     */
    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));

        //
        // console.debug("componentDidMount: " + this);

        //
        this.doLoad && this.doLoad()
            .then(j => this.setState({ rows: j }))
            .catch(e => this.showSnackbar(e.message));
    }

    /**
     * Remove event listener
     */
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    render() {
        const { classes, columns, disableEdit, editCell, editingColumnExtensions, changeAddedRows, providers } = this.props;
        const { rows, editingRowIds, rowChanges, addedRows, tableHeight, snackbarOpen, snackbarContent, deletingRows } = this.state;

        const TableRow = tableRowWithClickHandler(this.props.clickHandler)

        return (
            // <ReactHeight onHeightReady={height => console.log(height)}>
            // <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            /* <span>Total rows selected: {selection.length}</span> */
            <Paper>
                <Grid
                    rows={rows}
                    columns={columns}
                >
                    {providers ?
                        <React.Fragment>
                            {providers.map(i => i)}
                        </React.Fragment>
                        : null
                    }
                    {/* <TaxTypeProvider key='TaxTypeProvider' for={['tax']} />,
                        <OrderStatusProvider key='OrderStatusProvider' for={['status']} />, */}
                    {/* <Toolbar>
                        <div>
                            <Typography color="inherit" noWrap>
                                {selection.length}
                            </Typography>
                            <IconButton color="inherit"><Refresh /></IconButton>
                        </div>
                    </Toolbar> */}

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

                    {disableEdit ? null :
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
                        />}

                    <VirtualTable height={tableHeight} rowComponent={TableRow} messages={{ noData: "没有数据" }} />

                    {/* <TableColumnResizing /> */}
                    {/* defaultColumnWidths={defaultColumnWidths} /> */}
                    <TableHeaderRow showSortingControls />
                    {disableEdit ? null : (editCell ? <TableEditRow cellComponent={editCell} /> : <TableEditRow />)}

                    <TableFilterRow />

                    {disableEdit ? null :
                        <TableEditColumn
                            showAddCommand={this.props.showAddCommand === false ? false : true}
                            showEditCommand={this.props.showEditCommand === false ? false : true}
                            showDeleteCommand={this.props.showDeleteCommand === false ? false : true}
                            commandComponent={this.Command}
                            padding="dense"
                        />
                    }
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
                    ContentProps={{
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
                </Dialog>
            </Paper>
            // </div>
            // </ReactHeight>
        );
    }
}

const styles = theme => ({
    ...CommonStyles(theme),
    ...{
        lookupEditCell: {
            paddingTop: theme.spacing.unit * 0.875,
            paddingRight: theme.spacing.unit,
            paddingLeft: theme.spacing.unit,
        },

        inputRoot: {
            width: '100%',
        },
    },
})

export default withStyles(styles)(DataTableBase);
