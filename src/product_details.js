// @flow

// basic
import React from 'react';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';
// import compose from 'recompose/compose';

// styles
import { withStyles } from '@material-ui/core';

import CommonStyles from "./common_styles";

// router
// import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

// icons
import { ArrowLeft, PlusCircleOutline, FileDocumentBox, } from 'mdi-material-ui';
import { Edit, Delete } from '@material-ui/icons';

// ui
import {
    Paper, Typography, Grid,
    // TextField, 
    Button, IconButton, Snackbar,
    // Input, Select, 
    Toolbar,
    // Divider, 
    Tooltip,
    Table, TableBody, TableCell, TableHead, TableRow
} from '@material-ui/core';

//
import axios from 'axios'


// import DataTableBase from "./data_table_base"

import { DATA_API_BASE_URL } from "./config"
// import { store } from "./redux/redux"


// =============================================
class ProductDetailsPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            product: {},
            formulas: [],

            //
            snackbarOpen: false,
            snackbarContent: "",
        }

        // this.onDetails = ((id) => {
        //     alert(`details ${id}`)
        // })

        // this.onEdit = ((id) => {
        //     alert(`edit ${id}`)
        // })

        this.onDelete = ((id, no) => {
            if (window.confirm(`删除此配方？`)) {
                axios.delete(`${DATA_API_BASE_URL}/formulas/${id}`)
                    .then(r => {
                        this.state.formulas.splice(no, 1);
                        this.forceUpdate();
                        this.showSnackbar("已删除");
                    })
                    .catch(e => this.showSnackbar(e.message));
            }
        })
    }

    showSnackbar(msg: String) {
        this.setState({ snackbarOpen: true, snackbarContent: msg });
    }

    componentDidMount() {
        const { id } = this.props.match.params;

        axios.get(`${DATA_API_BASE_URL}/products/${id}`)
            .then(resp => resp.data)
            .then(j => {
                this.setState({ product: j });
                return j._links.formulas.href;
            })
            .then(url => axios.get(url))
            .then(resp => resp.data._embedded.formulas)
            .then(fs => {
                fs.forEach(i => i.createDate = i.createDate.split('.')[0].replace("T", " "))
                return fs.sort((i, j) => i.revision - j.revision);
            })
            .then(fs => this.setState({ formulas: fs }))
            .catch(e => this.showSnackbar(e.message));
    }

    render() {
        const { classes, } = this.props
        // const { id } = this.props.match.params;
        const { product, formulas } = this.state;
        const { snackbarOpen, snackbarContent } = this.state;

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
            <React.Fragment>

                <div className={classes.contentRoot}>

                    <Toolbar className={classes.toolbar}>
                        <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><ArrowLeft /></IconButton>
                        <Typography variant="title" className={classes.title}>产品详情</Typography>
                    </Toolbar>

                    <Typography variant="title" className={classes.subTitle}>基本信息</Typography>

                    <Paper className={classes.paper}>
                        <Grid container spacing={8} style={{ padding: '16 0 0 16' }}>
                            <Grid item md={2}><Typography className={classes.detailsTitle}>序号</Typography></Grid>
                            <Grid item md={10}><Typography className={classes.details}>{product.id}</Typography></Grid>

                            <Grid item md={2}><Typography className={classes.detailsTitle}>编号</Typography></Grid>
                            <Grid item md={10}><Typography className={classes.details}>{product.code}</Typography></Grid>

                            <Grid item md={2}><Typography className={classes.detailsTitle}>颜色</Typography></Grid>
                            <Grid item md={10}><Typography className={classes.details}>{product.color}</Typography></Grid>

                            <Grid item md={2}><Typography className={classes.detailsTitle}>附着材质</Typography></Grid>
                            <Grid item md={10}><Typography className={classes.details}>{product.base}</Typography></Grid>

                            <Grid item md={2}><Typography className={classes.detailsTitle}>备注</Typography></Grid>
                            <Grid item md={10}><Typography className={classes.details}>{product.comment}</Typography></Grid>
                        </Grid>
                    </Paper>

                    <Typography variant="title" className={classes.subTitle}>配方</Typography>

                    <Paper className={classes.compactPaper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell numeric style={{ whiteSpace: 'nowrap' }}>修订版本</TableCell>
                                    <TableCell style={{ whiteSpace: 'nowrap' }}>修订日期</TableCell>
                                    <TableCell style={{ whiteSpace: 'nowrap' }}>修订日志</TableCell>
                                    <TableCell style={{ padding: 0 }}>
                                        <Button variant="flat" size="large" component={Link} to={`/formula/add/${product.id}/0`}>
                                            <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增配方</Button>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formulas.map((n, no) => {
                                    return (
                                        <TableRow key={n.id}>
                                            <TableCell numeric style={{ width: '10%', whiteSpace: 'nowrap' }}>{n.revision}</TableCell>
                                            <TableCell style={{ width: '15%', whiteSpace: 'nowrap' }}>{n.createDate}</TableCell>
                                            <TableCell style={{ width: '75%', whiteSpace: 'nowrap' }}>{n.changeLog}</TableCell>
                                            <TableCell style={{ whiteSpace: 'nowrap', padding: 0 }}>
                                                <Tooltip title="配方明细">
                                                    {/* <IconButton onClick={() => this.onDetails(n.id)}> */}
                                                    <IconButton component={Link} to={`/formula/view/${product.id}/${n.id}`}>
                                                        <FileDocumentBox />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="编辑">
                                                    {/* <IconButton onClick={() => this.onEdit(n.id)} title="编辑"> */}
                                                    <IconButton component={Link} to={`/formula/edit/${product.id}/${n.id}`}>
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="删除">
                                                    <IconButton onClick={() => this.onDelete(n.id, no)}>
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <div style={{ padding: 8, textAlign: 'center', width: '100%' }}>
                            <Button variant="flat" size="large" component={Link} to={`/formula/add/${product.id}/0`}>
                                <PlusCircleOutline style={{ opacity: .5 }} color="secondary" />新增配方</Button>
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
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{snackbarContent}</span>}
                />

            </React.Fragment>
            // </Provider>
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

        detailsTitle: {
            fontSize: 16,
            opacity: .75,
        },

        details: {
            fontSize: 16,
        }
    },
})


export default withStyles(styles)(ProductDetailsPage);