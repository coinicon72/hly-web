// @flow

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import { Paper, Typography, Grid, TextField, Button, IconButton, Snackbar, Select, Toolbar, Divider, withStyles } from 'material-ui';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import { HexagonMultiple, FileMultiple, PlusCircleOutline } from 'mdi-material-ui';
import { Delete, Edit } from '@material-ui/icons'

import axios from 'axios'

import DataTableBase from "./data_table_base"

import { API_BASE_URL } from "./config"
import { store } from "./redux"


// =============================================
class ProductDetailsPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            product: {},
            formulas: []
        }

        this.onEdit = ((id) => {
            alert(`edit ${id}`)
        }).bind(this)

        this.onDelete = ((id) => {
            alert(`delete ${id}`)

        }).bind(this)
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
    }

    render() {
        const { classes, width } = this.props
        const { id } = this.props.match.params;
        const { product, formulas } = this.state;

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
            <div style={{ padding: 16 }}>

                <Typography variant="headline" className={classes.title}><FileMultiple style={{ fontSize: 24, opacity: 0.5 }} />添加配方</Typography>

                <Divider style={{ margin: 16 }} />

                <Typography variant="headline" className={classes.subTitle}>基本信息</Typography>

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

                <Typography variant="headline" className={classes.subTitle}>生产条件</Typography>

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


                <Typography variant="headline" className={classes.subTitle}>材料</Typography>
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
                        <Button variant="flat" size="large" component={Link} to={`/formula/add/${product.id}`}>
                            <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />
                            新增配方
          </Button>
                    </div>
                </Paper>
            </div>
            // </Provider>
        )
    }
}


const styles = theme => ({
    title: {
        fontSize: 24,
        opacity: .75,
        margin: theme.spacing.unit * 3,
    },

    subTitle: {
        fontSize: 20,
        opacity: .75,
        margin: theme.spacing.unit * 2,
    },

    paper: {
        padding: theme.spacing.unit,
    },

    details: {
        fontSize: 16,
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

export default withStyles(styles)(ProductDetailsPage);