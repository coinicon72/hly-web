// @flow

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import { Paper, Typography, TextField, Button, IconButton, Snackbar, Select, Toolbar, Divider, withStyles } from 'material-ui';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';

import { HexagonMultiple, FileMultiple, PlusCircleOutline, ArrowLeft } from 'mdi-material-ui';
import { Delete, Edit } from '@material-ui/icons'

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
    Table as dxTable,
    VirtualTable,
    TableHeaderRow,
    TableSelection,
    PagingPanel,
    // Toolbar,
    TableEditRow,
    TableEditColumn,
    TableColumnResizing,
    TableFilterRow,
} from '@devexpress/dx-react-grid-material-ui';

import axios from 'axios'

import DataTableBase from "./data_table_base"

import { API_BASE_URL } from "./config"
import { store } from "./redux"


// =============================================
class AddFourmulaPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            product: {},
            formulas: [],

            selectMaterial: false,
            columns: [
                { name: 'id', title: '序号' },
                { name: 'code', title: '编号' },
                { name: "name", title: "名称" },
                { name: "type", title: "类型", getCellValue: row => row.type ? row.type.name : undefined },
                { name: "comment", title: "备注" },
            ],
            rows: [],
            selection: [],

            //
            snackbarOpen: false,
            snackbarContent: "",
        }

        this.onEdit = ((id) => {
            alert(`edit ${id}`)
        }).bind(this)

        this.onDelete = ((id) => {
            alert(`delete ${id}`)

        }).bind(this)

        this.changeSelection = selection => this.setState({ selection });

        this.cancelSelect = () => this.setState({ selectMaterial: false })
    }

    showSanckbar(msg: String) {
        this.setState({ snackbarOpen: true, snackbarContent: msg });
    }

    componentDidMount() {
        const { id } = this.props.match.params;

        axios.get(`${API_BASE_URL}/products/${id}`)
            .then(resp => resp.data)
            .then(j => {
                this.setState({ product: j });
                return j._links.formulas.href;
            })
            .then(url => axios.get(url))
            .then(resp => resp.data._embedded.formulas)
            .then(fs => this.setState({ formulas: fs }))
            .catch(e => this.showSanckbar(e.message));

        axios.get(`${API_BASE_URL}/materials`)
            .then(resp => resp.data._embedded['materials'])
            .then(j => this.setState({ rows: j }))
            .catch(e => this.showSanckbar(e.message));
    }

    render() {
        const { classes, width } = this.props
        const { id } = this.props.match.params;
        const { product, formulas, selectMaterial, rows, columns, selection } = this.state;
        const { snackbarOpen, snackbarContent } = this.state;

        let now = new Date();
        let m = now.getMonth() + 1;
        if (m < 10)
            m = '0' + m;
        let d = now.getDate();
        if (d < 10)
            d = '0' + d;
        let ds = `${now.getFullYear()}-${m}-${d}`

        return (
            // <Provider store={store}>
            <div className={classes.contentRoot}>

                {/* <Grid
                    rows={rows}
                    columns={columns}
                >
                    <SelectionState
                        selection={selection}
                        onSelectionChange={this.changeSelection}
                    />
                    <IntegratedSelection />

                    <SortingState
                        defaultSorting={[{ columnName: 'id', direction: 'asc' }]}
                    />
                    <IntegratedSorting />

                    <FilteringState defaultFilters={[]} />
                    <IntegratedFiltering />

                    <VirtualTable height={300} messages={{ noData: "没有数据" }} />

                    <TableHeaderRow showSortingControls />
                    <TableSelection showSelectAll />
                </Grid> */}

                <div>
                    <Typography variant="title" className={classes.title} style={{ marginLeft: 0, marginTop: 0 }}><IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>添加配方</Typography>

                    {/* <Divider style={{ margin: 16 }} /> */}

                    <Typography variant="title" className={classes.subTitle}>基本信息</Typography>

                    <Paper className={classes.paper}>
                        <TextField type="number" required id="revision" label="修订版本" defaultValue=""
                            className={classes.textField}
                            margin="normal"
                        />

                        <TextField type="date" required disabled id="create_date" label="修订日期" defaultValue={ds}
                            className={classes.textField}
                            margin="normal"
                        />

                        <TextField required id="change_log" label="修订日志" defaultValue=""
                            className={classes.textFieldWithoutWidth}
                            multiline
                            fullWidth
                            rowsMax="4"
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Paper>

                    <Typography variant="title" className={classes.subTitle}>生产条件</Typography>

                    <Paper className={classes.paper}>
                        <TextField type="number" required id="mix_time" label="混合时间" defaultValue=""
                            className={classes.textField}
                            margin="normal" InputProps={{
                                endAdornment: <InputAdornment position="end" style={{ width: '3em' }}>分钟</InputAdornment>
                            }}
                        />

                        <TextField type="number" required id="mesh" label="筛网目数" defaultValue=""
                            className={classes.textField}
                            margin="normal" InputProps={{
                                endAdornment: <InputAdornment position="end">目</InputAdornment>
                            }}
                        />

                        <div>
                            <TextField type="number" required id="input_temperature" label="进料挤温" defaultValue=""
                                className={classes.textField}
                                margin="normal" InputProps={{
                                    endAdornment: <InputAdornment position="end">&#8451;</InputAdornment>
                                }}
                            />

                            <TextField type="number" required id="output_temperature" label="出料挤温" defaultValue=""
                                className={classes.textField}
                                margin="normal" InputProps={{
                                    endAdornment: <InputAdornment position="end">&#8451;</InputAdornment>
                                }}
                            />
                        </div>

                        <TextField type="number" required id="main_miller_rpm" label="主磨转数" defaultValue=""
                            className={classes.textField}
                            margin="normal" InputProps={{
                                endAdornment: <InputAdornment position="end">RPM</InputAdornment>
                            }}
                        />

                        <TextField type="number" required id="second_miller_rpm" label="副磨转数" defaultValue=""
                            className={classes.textField}
                            margin="normal" InputProps={{
                                endAdornment: <InputAdornment position="end">RPM</InputAdornment>
                            }}
                        />

                        <TextField type="number" required id="screw_rpm" label="螺杆转数" defaultValue=""
                            className={classes.textField}
                            margin="normal" InputProps={{
                                endAdornment: <InputAdornment position="end">RPM</InputAdornment>
                            }}
                        />

                    </Paper>

                    <Typography variant="title" className={classes.subTitle}>材料</Typography>
                    <Paper className={classes.paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>材料编号</TableCell>
                                    <TableCell>材料名称</TableCell>
                                    <TableCell numeric>数量</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formulas.map(m => {
                                    return (
                                        <TableRow key={m.id}>
                                            <TableCell>{m.code}</TableCell>
                                            <TableCell>{m.name}</TableCell>
                                            <TableCell numeric>{m.quantity}</TableCell>
                                            <TableCell><IconButton onClick={this.onEdit(m.id)} title="编辑">
                                                <Edit />
                                            </IconButton><IconButton onClick={this.onDelete(m.id)} title="删除">
                                                    <Delete />
                                                </IconButton></TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <div style={{ padding: 8, textAlign: 'center', width: '100%' }}>
                            <Button variant="flat" size="large" onClick={() => this.setState({ selectMaterial: true })}>
                                <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />
                                新增配方
          </Button>
                        </div>
                    </Paper>
                </div>


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


                <Dialog
                    open={selectMaterial}
                    onClose={this.cancelSelect}
                    // className={classes.dialog}
                    classes={{ paper: classes.dialog }}
                >
                    <DialogTitle>添加材料</DialogTitle>
                    <DialogContent>
                        <DialogContentText>请选择材料</DialogContentText>
                        <Paper>
                            <Grid
                                rows={rows}
                                columns={columns}
                            >
                                <SelectionState
                                    selection={selection}
                                    onSelectionChange={this.changeSelection}
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
                                <TableSelection showSelectAll />
                            </Grid>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.cancelSelect} color="primary">取消</Button>
                        <Button onClick={this.addMaterial} color="secondary">添加</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

const styles = theme => ({
    contentRoot: {
        padding: theme.spacing.unit * 3,
        backgroundColor: '#f4f4f4',
    },

    title: {
        // fontSize: 24,
        opacity: .75,
        margin: theme.spacing.unit * 4,
        marginLeft: 0,
        marginBottom: theme.spacing.unit * 2,
    },

    subTitle: {
        fontSize: 18,
        opacity: .75,
        margin: theme.spacing.unit * 4,
        marginLeft: 0,
        marginBottom: theme.spacing.unit * 1,
    },

    paper: {
        padding: theme.spacing.unit * 2,
    },

    details: {
        fontSize: 16,
    },

    dialog: {
        maxWidth: 'calc(100% - 32px)',
    },

    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },

    textFieldWithoutWidth: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
})

// export default compose(withStyles(styles), withRouter())(AddFourmulaPage);
export default withStyles(styles)(withRouter(AddFourmulaPage));