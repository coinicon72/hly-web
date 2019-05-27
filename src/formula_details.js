// @flow

// basic
import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';
import compose from 'recompose/compose';

// styles
import { withStyles } from '@material-ui/core';

import CommonStyles from "./common_styles";

// router
import { withRouter } from 'react-router'
// import { Link } from 'react-router-dom'

// icons
import { ArrowLeft, ContentSave, PlusCircleOutline } from 'mdi-material-ui';
import { Delete } from '@material-ui/icons';

// ui components
import {
    Grid as MuGrid,
    Paper, Typography, TextField, Button, IconButton,
    // MenuItem, 
    Snackbar,
    // Select, 
    Toolbar,
    // Divider, Tooltip, Chip,
    Input, InputLabel, InputAdornment,
    // FormGroup, 
    FormControlLabel, FormControl, FormHelperText,
    Stepper, Step, StepLabel, Switch,
    Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogActions, DialogContent, DialogTitle,
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

import axios from 'axios'

// import DataTableBase from "./data_table_base"
import { MODE_ADD, MODE_EDIT, MODE_VIEW } from "./common"

import { DATA_API_BASE_URL } from "./config"

import { getTodayString } from "./utils"
// import { store } from "./redux/redux"


// =============================================
class AddFourmulaPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            mode: MODE_ADD,

            // 
            product: {},

            //
            selectMaterial: false,
            columns: [
                { name: 'id', title: '序号' },
                { name: 'code', title: '编号' },
                { name: "name", title: "名称" },
                { name: "type", title: "类型", getCellValue: row => row.type ? row.type.name : undefined },
                { name: "comment", title: "备注" },
            ],
            materials: [],
            selection: [],

            //
            basicInfo: {},
            produceCond: {},
            formulaItems: [], // item {material-id, material-name, quantity}

            // save formula
            autoGenRevision: true,
            savingFormula: false,
            activeStep: 0,

            // errors
            errors: {},

            //
            snackbarOpen: false,
            snackbarContent: "",
        }

        this.steps = ['检查/生成修订版本', '检查输入数据', '保存基本信息及生产条件', "保存材料明细", "完成"];
        this.produceCondItems = ['mixTime', 'mesh', 'inputTemperature', 'outputTemperature', 'mainMillerRpm', 'secondMillerRpm', 'screwRpm']

        this.onEdit = ((id) => {
            alert(`edit ${id}`)
        })

        this.onDelete = ((id) => {
            const { formulaItems } = this.state;
            let idx = formulaItems.findIndex(v => v.id === id)
            if (idx >= 0) {
                formulaItems.splice(idx, 1);
                // this.setState({ formulas: formulas });
                this.forceUpdate();
            }
        })

        this.changeSelection = selection => this.setState({ selection });

        this.cancelSelect = () => this.setState({ selectMaterial: false })

        this.handleBasicInfoChange = (e => {
            // this.state.basicInfo[e.target.id] = e.target.value
            // this.forceUpdate();
            const newVal = { ...this.state.basicInfo }
            newVal[e.target.id] = e.target.value
            this.setState({ basicInfo: newVal })
        })

        this.handleProdCondChange = (e => {
            this.state.produceCond[e.target.id] = e.target.value;
            this.forceUpdate();
        })

        this.addMaterials = (() => {
            const { formulaItems, materials, selection } = this.state;
            Object.keys(selection).forEach(idx => {
                let no = selection[idx];
                let material = materials[no];

                if (!formulaItems.find(v => v.id === material.id))
                    formulaItems.push(material)
            })

            //
            this.setState({ formulaItems: formulaItems, selectMaterial: false, selection: [] })
        })

        this.handleQuantityChange = (e => {
            let id = parseInt(e.target.id.split("_")[1], 10)
            let item = this.state.formulaItems.find(i => i.id === id)
            item.quantity = Number.parseFloat(e.target.value)
            this.forceUpdate();
        })

        //
        this.cancelSave = () => this.setState({ savingFormula: false, activeStep: 0 })

        this.onSaveSuccess = (() => {
            this.setState({ savingFormula: false, activeStep: 0 })
            this.props.history.goBack();
        })

        this.saveFormula = (async () => {
            //
            this.setState({ savingFormula: true, activeStep: 0 })
            this.forceUpdate()

            //
            let cancel = false;
            let errors = {};

            // step 0: generate/check revision
            let latestRev = await axios
                .get(`${DATA_API_BASE_URL}/formulas/search/getLatestRevision?id=${this.state.product.id}`)
                .then(resp => resp.data)
                .catch(e => {
                    cancel = true;
                    this.setState({
                        savingFormula: false, snackbarOpen: true,
                        snackbarContent: e.message
                    })
                })

            if (cancel) return;

            if (this.state.autoGenRevision) {
                this.state.basicInfo.revision = latestRev + 1
            } else {
                if (!this.state.basicInfo.revision || this.state.basicInfo.revision <= latestRev) {
                    errors['revision'] = "错误的版本号"
                    this.setState({
                        savingFormula: false, errors: errors, snackbarOpen: true,
                        snackbarContent: "发现错误，请检查数据输入"
                    })
                    return;
                }
            }

            // step 1
            this.setState({ activeStep: this.state.activeStep + 1 })

            let { produceCond, formulaItems } = this.state

            this.produceCondItems.forEach(it => {
                if (!produceCond[it])
                    errors[it] = "参数错误"
            })

            if (formulaItems.length <= 0) {
                errors['formulaItems'] = "配方中没有添加材料"
                // this.setState({
                //     savingFormula: false, errors: errors, snackbarOpen: true,
                //     snackbarContent: "配方中没有添加材料"
                // })
                // return;
            } else {
                formulaItems.forEach(item => {
                    if (!item.quantity || item.quantity < 0) {
                        errors[`item_${item.id}`] = "无效的数量"
                    }
                })
            }

            if (Object.keys(errors).length > 0) {
                this.setState({
                    savingFormula: false, errors: errors, snackbarOpen: true,
                    snackbarContent: "发现错误，请检查数据输入"
                })
                return;
            }


            // // step 2
            // this.setState({ activeStep: this.state.activeStep + 1 })

            // let savedFormula = await axios.post(`${API_BASE_URL}/formulas`,
            //     {
            //         product: { id: this.state.product.id },
            //         ...this.state.basicInfo
            //     })
            //     .then(resp => resp.data)
            //     .then(f => {
            //         this.state.basicInfo = f;
            //         return f;
            //     })
            //     .catch(e => {
            //         cancel = true;
            //         this.setState({
            //             savingFormula: false, snackbarOpen: true,
            //             snackbarContent: e.message
            //         })
            //     })

            // if (cancel) return;

            // step 3
            this.setState({ activeStep: this.state.activeStep + 1 })

            let f = {
                product: { id: this.state.product.id },
                ...this.state.basicInfo
            }

            let pc = {
                ...this.state.produceCond,
                formula: f
            }

            await axios.post(`${DATA_API_BASE_URL}/produceConditions`, pc)
                .then(resp => resp.data)
                .then(j => this.state.basicInfo.id = j.id)
                .catch(e => {
                    cancel = true;
                    this.setState({
                        savingFormula: false, snackbarOpen: true,
                        snackbarContent: e.message
                    })
                })

            if (cancel) return;

            // step 4
            this.setState({ activeStep: this.state.activeStep + 1 })

            formulaItems.forEach(item => {
                let fi = {
                    quantity: item.quantity,
                    id: { formula: this.state.basicInfo.id, material: item.id },
                    formula: this.state.basicInfo,
                    material: item
                }

                axios.post(`${DATA_API_BASE_URL}/formulaItems`, fi)
                    // .then(resp => resp.data)
                    // .then(j => {
                    // })
                    .catch(e => {
                        cancel = true;
                        this.setState({
                            savingFormula: false, snackbarOpen: true,
                            snackbarContent: e.message
                        })
                    })
            })

            if (cancel) return;

            // step 5, done
            this.setState({ activeStep: this.state.activeStep + 1 })

        })

        //
        this.loadInitData = this.loadInitData.bind(this)
    }

    showSnackbar(msg: String) {
        this.setState({ snackbarOpen: true, snackbarContent: msg });
    }

    componentDidMount() {
        const { mode } = this.props.match.params;

        // check mode
        if (mode === MODE_ADD || mode === MODE_VIEW || mode === MODE_EDIT) {
            this.setState({ mode }, this.loadInitData)
        } else {
            this.setState({ mode: undefined })
            return;
        }
    }

    loadInitData() {
        const { pid, fid } = this.props.match.params;

        //
        axios.get(`${DATA_API_BASE_URL}/products/${pid}`)
            .then(resp => resp.data)
            .then(j => {
                // this.setState({ product: j });
                this.setState({ product: j });
            })
            .catch(e => this.showSnackbar(e.message));

        axios.get(`${DATA_API_BASE_URL}/materials`)
            .then(resp => resp.data._embedded['materials'])
            .then(j => this.setState({ materials: j }))
            .catch(e => this.showSnackbar(e.message));

        // load details
        if (this.state.mode === MODE_VIEW || this.state.mode === MODE_EDIT) {
            axios.get(`${DATA_API_BASE_URL}/formulas/${fid}`)
                .then(resp => resp.data)
                .then(j => {
                    this.setState({ basicInfo: j });
                    return j._links.produceCondition.href
                })

                .then(url => axios.get(url))
                .then(resp => resp.data)
                .then(j => {
                    this.setState({ produceCond: j });
                    return `${DATA_API_BASE_URL}/formulas/${fid}/items`
                })

                .then(url => axios.get(url))
                .then(resp => resp.data._embedded.formulaItems)
                .then(j => {
                    let fs = []
                    j.forEach(it => fs.push({ 'quantity': it.quantity, ...it._embedded.material }))
                    this.setState({ formulaItems: fs });
                })
                .catch(e => this.showSnackbar(e.message));
        }
    }

    render() {
        const { classes, } = this.props
        // const { id } = this.props.match.params;
        const { basicInfo, produceCond, formulaItems } = this.state;
        const { selectMaterial, materials, columns, selection, errors } = this.state;
        const { snackbarOpen, snackbarContent } = this.state;

        // save formula
        const { savingFormula, activeStep } = this.state;
        const steps = this.steps;

        // title
        let title = "不支持的操作";
        let shrinkLabel = true;
        switch (this.state.mode) {
            case MODE_VIEW:
                title = "查看配方"
                break

            case MODE_ADD:
                title = "添加配方"
                shrinkLabel = undefined;
                break

            case MODE_EDIT:
                title = "编辑配方"
                break

            default:
                break
        }

        return (
            // <Provider store={store}>
            <React.Fragment>
                <div className={classes.contentRoot}>

                    <Toolbar className={classes.toolbar}>
                        <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                        <Typography variant="title" className={classes.title}>{title}</Typography>
                        {/* <Typography variant="title">添加配方</Typography> */}
                        {this.state.mode === MODE_VIEW ? null :
                            <Button onClick={() => this.saveFormula()} disabled={this.state.mode === MODE_EDIT} color='secondary' style={{ fontSize: 18 }} >保存配方<ContentSave /></Button>}
                    </Toolbar>

                    {/* <Divider style={{ margin: 16 }} /> */}

                    <Typography variant="title" className={classes.subTitle}>基本信息</Typography>

                    <Paper className={classes.paper}>

                        <MuGrid container direction='column' alignItems="stretch">
                            <MuGrid>
                                <FormControl required disabled={this.state.autoGenRevision} error={!!this.state.errors.revision} aria-describedby="revision-error-text"
                                // className={classes.textFieldWithoutMargin}
                                >
                                    <InputLabel htmlFor="revision" shrink={shrinkLabel}>修订版本</InputLabel>
                                    <Input id="revision" type="number" inputProps={{ min: 1 }}
                                        value={basicInfo.revision}
                                        onChange={e => this.handleBasicInfoChange(e)}
                                    />
                                    <FormHelperText id="revision-error-text">{this.state.errors.revision}</FormHelperText>
                                </FormControl>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={this.state.autoGenRevision}
                                            onChange={(e) => this.setState({ autoGenRevision: e.target.checked })}
                                            color="primary"
                                        />
                                    }
                                    label="自动生成修订版本号"
                                    style={{ marginLeft: 16 }}
                                />
                            </MuGrid>
                            <MuGrid>
                                <TextField type="date" required disabled id="createDate" label="修订日期"
                                    // defaultValue={basicInfo.createDate}
                                    value={getTodayString()}
                                    // className={classes.textFieldWithoutMargin}
                                    margin="normal"
                                    onChange={e => this.handleBasicInfoChange(e)}
                                />
                            </MuGrid>
                            <MuGrid>
                                <TextField id="changeLog" label="修订日志"
                                    defaultValue=""
                                    value={basicInfo.changeLog}
                                    className={classes.textFieldWithoutWidth}
                                    onChange={e => this.handleBasicInfoChange(e)}
                                    multiline
                                    fullWidth
                                    rowsMax="4"
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: shrinkLabel,
                                    }}
                                />
                            </MuGrid>
                            <MuGrid>
                                <TextField id="comment" label="备注"
                                    defaultValue=""
                                    value={basicInfo.comment}
                                    className={classes.textFieldWithoutWidth}
                                    onChange={e => this.handleBasicInfoChange(e)}
                                    multiline
                                    fullWidth
                                    rowsMax="4"
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: shrinkLabel,
                                    }}
                                />
                            </MuGrid>
                        </MuGrid>
                    </Paper>

                    <Typography variant="title" className={classes.subTitle}>生产条件</Typography>

                    <Paper className={classes.paper}>
                        <TextField type="number" required id="mixTime" error={!!errors['mixTime']}
                            label="混合时间"
                            value={produceCond.mixTime}
                            className={classes.textField}
                            onChange={e => this.handleProdCondChange(e)}
                            margin="normal"
                            InputLabelProps={{
                                shrink: shrinkLabel,
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end" style={{ width: '3em' }}>分钟</InputAdornment>
                            }}
                            inputProps={{
                                min: 0,
                            }}
                        />

                        <TextField type="number" required id="mesh" error={!!errors['mesh']}
                            label="筛网目数"
                            value={produceCond['mesh']}
                            className={classes.textField}
                            onChange={e => this.handleProdCondChange(e)}
                            margin="normal"
                            InputLabelProps={{
                                shrink: shrinkLabel,
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">目</InputAdornment>
                            }}
                            inputProps={{
                                min: 0,
                            }}
                    />

                        <div>
                            <TextField type="number" required id="inputTemperature" error={!!errors['inputTemperature']}
                                label="进料挤温" defaultValue=""
                                value={produceCond.inputTemperature}
                                className={classes.textField}
                                onChange={e => this.handleProdCondChange(e)}
                                margin="normal"
                                InputLabelProps={{
                                    shrink: shrinkLabel,
                                }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">&#8451;</InputAdornment>
                                }}
                                inputProps={{
                                    min: 0,
                                }}
                       />

                            <TextField type="number" required id="outputTemperature" error={!!errors['outputTemperature']}
                                label="出料挤温" defaultValue=""
                                value={produceCond.outputTemperature}
                                className={classes.textField}
                                onChange={e => this.handleProdCondChange(e)}
                                margin="normal"
                                InputLabelProps={{
                                    shrink: shrinkLabel,
                                }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">&#8451;</InputAdornment>
                                }}
                                inputProps={{
                                    min: 0,
                                }}
                   />
                        </div>

                        <TextField type="number" required id="mainMillerRpm" error={!!errors['mainMillerRpm']} label="主磨转数" defaultValue=""
                            value={produceCond.mainMillerRpm}
                            className={classes.textField}
                            onChange={e => this.handleProdCondChange(e)}
                            margin="normal"
                            InputLabelProps={{
                                shrink: shrinkLabel,
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">RPM</InputAdornment>
                            }}
                            inputProps={{
                                min: 0,
                            }}
          />

                        <TextField type="number" required id="secondMillerRpm" error={!!errors['secondMillerRpm']} label="副磨转数" defaultValue=""
                            value={produceCond.secondMillerRpm}
                            className={classes.textField}
                            onChange={e => this.handleProdCondChange(e)}
                            margin="normal"
                            InputLabelProps={{
                                shrink: shrinkLabel,
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">RPM</InputAdornment>
                            }}
                            inputProps={{
                                min: 0,
                            }}
               />

                        <TextField type="number" required id="screwRpm" error={!!errors['screwRpm']} label="螺杆转数" defaultValue=""
                            value={produceCond.screwRpm}
                            className={classes.textField}
                            onChange={e => this.handleProdCondChange(e)}
                            margin="normal"
                            InputLabelProps={{
                                shrink: shrinkLabel,
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">RPM</InputAdornment>
                            }}
                            inputProps={{
                                min: 0,
                            }}
       />

                    </Paper>

                    <div>
                        <Typography variant="title" className={classes.subTitle} style={{ display: 'inline-flex' }}>材料</Typography>
                        {errors['formulaItems'] ? <Typography className={classes.subTitle} style={{ display: 'inline-flex', color: '#f44336' }}>{errors['formulaItems']}</Typography> : null}
                    </div>

                    <Paper className={classes.compactPaper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.tableHead}>材料序号</TableCell>
                                    <TableCell className={classes.tableHead}>材料编号</TableCell>
                                    <TableCell className={classes.tableHead}>材料名称</TableCell>
                                    <TableCell className={classes.tableHead}>类型</TableCell>
                                    <TableCell className={classes.tableHead} align="right">数量</TableCell>
                                    <TableCell style={{ padding: 0 }}>
                                        {this.state.mode === MODE_VIEW ? null : <div style={{ padding: 8, textAlign: 'center', width: '100%' }}>
                                            <Button variant="text" size="large" onClick={() => this.setState({ selectMaterial: true })}>
                                                <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />添加材料</Button>
                                        </div>}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formulaItems.map(m => {
                                    return (
                                        <TableRow key={m.id}>
                                            <TableCell style={{ width: '15%', whiteSpace: 'nowrap' }}>{m.id}</TableCell>
                                            <TableCell style={{ width: '20%', whiteSpace: 'nowrap' }}>{m.code}</TableCell>
                                            <TableCell style={{ width: '25%', whiteSpace: 'nowrap' }}>{m.name}</TableCell>
                                            <TableCell style={{ width: '20%' }}>{m.type.name}</TableCell>

                                            <TableCell style={{ width: '15%', whiteSpace: 'nowrap' }}>
                                                <TextField type="number" required id={`quantity_${m.id}`}
                                                    value={m.quantity}
                                                    fullWidth
                                                    error={!!errors[`item_${m.id}`]}
                                                    margin="normal"
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                                    }}
                                                    onChange={e => this.handleQuantityChange(e)}
                                                />
                                            </TableCell>

                                            <TableCell style={{ whiteSpace: 'nowrap', padding: 0 }}>
                                                {/* <IconButton onClick={() => this.onEdit(m.id)} title="编辑">
                                                <Edit />
                                            </IconButton> */}
                                                {this.state.mode === MODE_VIEW ? null : <IconButton onClick={() => this.onDelete(m.id)} title="删除">
                                                    <Delete />
                                                </IconButton>}

                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {this.state.mode === MODE_VIEW ? null : <div style={{ padding: 8, textAlign: 'center', width: '100%' }}>
                            <Button variant="text" size="large" onClick={() => this.setState({ selectMaterial: true })}>
                                <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />添加材料</Button>
                        </div>}
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
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{snackbarContent}</span>}
                />


                {/* dialog for add materials */}
                <Dialog
                    open={selectMaterial}
                    onClose={this.cancelSelect}
                    // className={classes.dialog}
                    classes={{ paper: classes.dialog }}
                >
                    <DialogTitle>添加材料</DialogTitle>
                    <DialogContent>
                        {/* <DialogContentText>请选择材料</DialogContentText> */}
                        <Paper>
                            <Grid
                                rows={materials}
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
                                <TableSelection showSelectAll selectByRowClick={true} />
                            </Grid>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.cancelSelect} color="primary">取消</Button>
                        <Button onClick={this.addMaterials} color="secondary">添加</Button>
                    </DialogActions>
                </Dialog>


                {/* dialog for save formula */}
                <Dialog
                    open={savingFormula}
                    onClose={this.cancelSave}
                    classes={{ paper: classes.dialog }}
                >
                    <DialogTitle>正在保存...</DialogTitle>
                    <DialogContent>
                        {/* <DialogContentText>请选择材料</DialogContentText> */}
                        <Paper>
                            <Stepper activeStep={activeStep} alternativeLabel>
                                {steps.map(label => {
                                    return (
                                        <Step key={label}>
                                            <StepLabel>{label}</StepLabel>
                                        </Step>
                                    );
                                })}
                            </Stepper>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onSaveSuccess} disabled={this.state.activeStep >= this.steps.length - 1 ? false : true} color="primary">确定</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        )
    }
}

const styles = theme => ({
    ...CommonStyles(theme),
    ...{
        toolbar: {
            padding: 0,
        },

        title: {
            opacity: .75,
            margin: 0,
            flex: 1,
        },

        textField: {
            marginleft: theme.spacing.unit,
            marginRight: theme.spacing.unit,
            width: 200,
        },

        textFieldWithoutMargin: {
            // marginleft: theme.spacing.unit,
            // marginRight: theme.spacing.unit,
            width: 200,
        },

        textFieldWithoutWidth: {
            // marginleft: theme.spacing.unit,
            // marginRight: theme.spacing.unit,
        },

        tableHead: {
            whiteSpace: 'nowrap',
        }
    },
})

// export default compose(withStyles(styles), withRouter())(AddFourmulaPage);
export default compose(withStyles(styles), withRouter)(AddFourmulaPage);