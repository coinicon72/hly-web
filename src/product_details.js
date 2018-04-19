// @flow

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import { Paper, Typography, Grid, TextField, Button, IconButton, Snackbar, Input, Select, Toolbar, Divider, withStyles } from 'material-ui';

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

        // let noDataTip = null
        // if (!formulas.length) {
        //     noDataTip = (
        //         <div style={{ padding: 8, textAlign: 'center', width: '100%' }}>
        //             <Button variant="flat" size="large">
        //                 <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />
        //                 新增配方
        //   </Button>
        //         </div>
        //     )
        // }


        return (
            // <Provider store={store}>
            <div style={{ padding: 16 }}>

                <Typography variant="headline" className={classes.title}><HexagonMultiple style={{ fontSize: 24, opacity: 0.5 }} />产品详情</Typography>

                <Grid container spacing={8} style={{ padding: '16 0 0 16' }}>
                    <Grid item md={2}><Typography className={classes.details}>序号</Typography></Grid>
                    <Grid item md={8}><Typography className={classes.details}>{product.id}</Typography></Grid>

                    <Grid item md={2}><Typography className={classes.details}>编号</Typography></Grid>
                    <Grid item md={8}><Typography className={classes.details}>{product.code}</Typography></Grid>

                    <Grid item md={2}><Typography className={classes.details}>颜色</Typography></Grid>
                    <Grid item md={8}><Typography className={classes.details}>{product.color}</Typography></Grid>

                    <Grid item md={2}><Typography className={classes.details}>附着材质</Typography></Grid>
                    <Grid item md={8}><Typography className={classes.details}>{product.base}</Typography></Grid>

                    <Grid item md={2}><Typography className={classes.details}>备注</Typography></Grid>
                    <Grid item md={8}><Typography className={classes.details}>{product.comment}</Typography></Grid>
                </Grid>

                <Divider style={{ margin: 16 }} />

                <Typography variant="headline" className={classes.title}><FileMultiple style={{ fontSize: 24, opacity: 0.5 }} />配方</Typography>
                <Paper>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell numeric>修订版</TableCell>
                                <TableCell>修订日期</TableCell>
                                <TableCell>日志</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {formulas.map(n => {
                                return (
                                    <TableRow key={n.id}>
                                        <TableCell numeric>{n.revision}</TableCell>
                                        <TableCell>{n.createDate}</TableCell>
                                        <TableCell>{n.changeLog}</TableCell>
                                        <TableCell><IconButton onClick={this.onEdit(n.id)} title="编辑">
                                            <Edit />
                                        </IconButton><IconButton onClick={this.onDelete(n.id)} title="删除">
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
        margin: 16,
    },

    details: {
        fontSize: 16,
    }
})

export default withStyles(styles)(ProductDetailsPage);