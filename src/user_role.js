// @flow

import React from 'react';

import CommonStyles from "./common_styles";

import axios from 'axios'

import { withStyles } from '@material-ui/core';
import {
    // AppBar, Toolbar, Button, 
    Grid, 
    // IconButton, 
    // Snackbar,
    Typography, Paper, Checkbox, 
    Table, TableBody, TableCell, TableHead, TableRow
} from '@material-ui/core';

// import {
//     TableEditRow, TableEditColumn,
// } from '@devexpress/dx-react-grid-material-ui';

// import * as mdi from 'mdi-material-ui';

// import { LookupEditCell } from "./data_table_util";
// import DataTableBase from "./data_table_base";

import { 
    // EXPORT_BASE_URL, 
    DATA_API_BASE_URL, API_BASE_URL } from "./config";

import { connect } from 'react-redux'

import { actionShowSnackbar } from "./redux/data_selection"

// =============================================
class UserRolePage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            roles: [],

            selectedUser: null, // selected user

            //
            snackbarOpen: false,
            snackbarContent: "",
        }

        this.isUserSelected = (uid => !!this.state.selectedUser && this.state.selectedUser.id === uid)

        this.handleUserClick = ((event, uid) => {
            let user = this.state.users.find(u => u.id === uid)
            if (!user) return

            this.setState({ selectedUser: user })

            if (user.roles) {
            } else {
                axios.get(user._links.roles.href)
                    .then(r => r.data._embedded.roles)
                    .then(rs => {
                        user.roles = rs
                        // this.state.selectedRoles = user.roles.map(r => r.id)
                        this.forceUpdate()
                    })
            }
        })

        this.isRoleSelected = (rid =>
            !!this.state.selectedUser
            && !!this.state.selectedUser.roles
            && !!this.state.selectedUser.roles.find(r => r.id === rid)
        )

        this.handleRoleClick = ((event, rid) => {
            let user = this.state.selectedUser
            if (!user) return
            if (!user.roles) user.roles = []

            let role = this.state.roles.find(r => r.id === rid)
            const i = user.roles.findIndex(r => r.id === rid)

            if (i < 0) {
                axios.post(user._links.roles.href, `${API_BASE_URL}/roles/${rid}`, {
                    headers: {
                        'Content-Type': 'text/uri-list',
                    }
                }).then(_ => {
                    user.roles.push(role)
                    this.forceUpdate()
                })
                    .catch(e => this.props.showSnackbar(e.message))
            } else {
                axios.delete(`${user._links.roles.href}/${rid}`)
                    .then(_ => {
                        user.roles.splice(i, 1)
                        this.forceUpdate()
                    })
                    .catch(e => this.props.showSnackbar(e.message))
            }

        })
    }

    componentDidMount() {
        axios.get(`${DATA_API_BASE_URL}/users`)
            .then(resp => resp.data._embedded['users'])
            .then(users => this.setState({ users }))

        axios.get(`${DATA_API_BASE_URL}/roles`)
            .then(resp => resp.data._embedded['roles'])
            .then(roles => this.setState({ roles }))
    }

    render() {
        const { classes } = this.props
        const { users, roles } = this.state
        // const { snackbarOpen, snackbarContent } = this.state;

        return <React.Fragment>
            <div className={classes.contentRoot}>
                {/* <Toolbar className={classes.toolbar}> */}
                {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton> */}
                {/* <Typography variant="title" className={classes.toolbarTitle}></Typography> */}
                {/* <Button href={`${EXPORT_BASE_URL}/roles`} color='primary' style={{ fontSize: 18 }} ><mdi.Export />导出</Button> */}
                {/* </Toolbar> */}

                <Grid container spacing={16}>
                    <Grid item md={6}>
                        <Typography variant="title" className={classes.toolbarTitle}>员工</Typography>
                        <Paper>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ whiteSpace: 'nowrap' }}></TableCell>
                                        <TableCell style={{ whiteSpace: 'nowrap' }}>序号</TableCell>
                                        <TableCell style={{ whiteSpace: 'nowrap' }}>姓名</TableCell>
                                        <TableCell style={{ whiteSpace: 'nowrap' }}>手机</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users ? users.map(u => {
                                        const isSelected = this.isUserSelected(u.id)
                                        // console.debug(`user ${u.id} ${isSelected}`)

                                        return <TableRow key={u.id}
                                            hover
                                            onClick={event => this.handleUserClick(event, u.id)}>
                                            <TableCell>
                                                <Checkbox checked={isSelected} />
                                            </TableCell>
                                            <TableCell numeric style={{ width: '20%', whiteSpace: 'nowrap' }}>{u.id}</TableCell>
                                            <TableCell style={{ width: '35%', whiteSpace: 'nowrap' }}>{u.name}</TableCell>
                                            <TableCell style={{ width: '45%', whiteSpace: 'nowrap' }}>{u.phone}</TableCell>
                                        </TableRow>
                                    }) : null}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                    <Grid item md={6}>
                        <Typography variant="title" className={classes.toolbarTitle}>岗位</Typography>
                        <Paper>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ whiteSpace: 'nowrap' }}></TableCell>
                                        <TableCell style={{ whiteSpace: 'nowrap' }}>序号</TableCell>
                                        <TableCell style={{ whiteSpace: 'nowrap' }}>代码</TableCell>
                                        <TableCell style={{ whiteSpace: 'nowrap' }}>名称</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {roles ? roles.map(r => {
                                        const isSelected = this.isRoleSelected(r.id);

                                        return <TableRow key={r.id}
                                            hover
                                            onClick={event => this.handleRoleClick(event, r.id)}>
                                            <TableCell>
                                                <Checkbox checked={isSelected} />
                                            </TableCell>
                                            <TableCell numeric style={{ width: '20%', whiteSpace: 'nowrap' }}>{r.id}</TableCell>
                                            <TableCell style={{ width: '35%', whiteSpace: 'nowrap' }}>{r.code}</TableCell>
                                            <TableCell style={{ width: '45%', whiteSpace: 'nowrap' }}>{r.name}</TableCell>
                                        </TableRow>
                                    }) : null}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>

            </div>

            {/* <Snackbar
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
            /> */}
        </React.Fragment>
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ...{
    },
})


const mapDispatchToProps = dispatch => ({
    showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
    // hideSnackbar: _ => dispatch(actionHideSnackbar())
})

const ConnectedUserRolePage = connect(
    // mapStateToProps,
    mapDispatchToProps
)(UserRolePage)

export default withStyles(styles)(ConnectedUserRolePage);