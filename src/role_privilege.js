// @flow

import React from 'react';

import CommonStyles from "./common_styles";

import axios from 'axios'

import { AppBar, Toolbar, Button, Grid, IconButton, Typography, Paper, Checkbox, Snackbar } from 'material-ui';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import {
    TableEditRow, TableEditColumn,
} from '@devexpress/dx-react-grid-material-ui';

import * as mdi from 'mdi-material-ui';

import { LookupEditCell } from "./data_table_util";
import DataTableBase from "./data_table_base";

import { EXPORT_BASE_URL, DATA_API_BASE_URL, API_BASE_URL } from "./config";
import { withStyles } from 'material-ui';


// =============================================
class UserRolePage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            roles: [],
            privileges: [],

            selectedRole: null, // selected user

            //
            snackbarOpen: false,
            snackbarContent: "",
        }

        this.isRoleSelected = (uid => !!this.state.selectedRole && this.state.selectedRole.id === uid).bind(this)

        this.handleRoleClick = ((event, rid) => {
            let role = this.state.roles.find(u => u.id === rid)
            if (!role) return

            this.setState({ selectedRole: role })

            if (role.privileges) {
            } else {
                axios.get(role._links.privileges.href)
                    .then(r => r.data._embedded.privileges)
                    .then(rs => {
                        role.privileges = rs
                        this.forceUpdate()
                    })
            }
        }).bind(this)

        this.isPrivilegeSelected = (pid =>
            !!this.state.selectedRole
            && !!this.state.selectedRole.privileges
            && !!this.state.selectedRole.privileges.find(p => p.id === pid)
        ).bind(this)

        this.handlePrivilegeClick = ((event, pid) => {
            let role = this.state.selectedRole
            if (!role) return
            if (!role.privileges) role.privileges = []

            let privilege = this.state.privileges.find(r => r.id === pid)
            const i = role.privileges.findIndex(r => r.id === pid)

            if (i < 0) {
                axios.post(role._links.privileges.href, `${API_BASE_URL}privileges/${pid}`, {
                    headers: {
                        'Content-Type': 'text/uri-list',
                    }
                }).then(_ => {
                    role.privileges.push(privilege)
                    this.forceUpdate()
                })
                    .catch(e => this.showSnackbar(e.message))
            } else {
                axios.delete(`${role._links.privileges.href}/${pid}`)
                    .then(_ => {
                        role.privileges.splice(i, 1)
                        this.forceUpdate()
                    })
                    .catch(e => this.showSnackbar(e.message))
            }

        }).bind(this)
    }

    componentDidMount() {
        axios.get(DATA_API_BASE_URL + '/privileges')
            .then(resp => resp.data._embedded['privileges'])
            .then(privileges => this.setState({ privileges }))

        axios.get(DATA_API_BASE_URL + '/roles')
            .then(resp => resp.data._embedded['roles'])
            .then(roles => this.setState({ roles }))
    }

    render() {
        const { classes, width } = this.props
        const { privileges, roles, selectedRole } = this.state
        const { snackbarOpen, snackbarContent } = this.state;

        return <React.Fragment>
            <div className={classes.contentRoot}>
                {/* <Toolbar className={classes.toolbar}> */}
                {/* <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton> */}
                {/* <Typography variant="title" className={classes.toolbarTitle}></Typography> */}
                {/* <Button href={`${EXPORT_BASE_URL}/roles`} color='primary' style={{ fontSize: 18 }} ><mdi.Export />导出</Button> */}
                {/* </Toolbar> */}

                <Grid container spacing={16}>
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
                                        const isSelected = this.isRoleSelected(r.id)
                                        // console.debug(`user ${u.id} ${isSelected}`)

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
                    <Grid item md={6}>
                        <Typography variant="title" className={classes.toolbarTitle}>权限</Typography>
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
                                    {privileges ? privileges.map(p => {
                                        const isSelected = this.isPrivilegeSelected(p.id);

                                        return <TableRow key={p.id}
                                            hover
                                            onClick={event => this.handlePrivilegeClick(event, p.id)}>
                                            <TableCell>
                                                <Checkbox checked={isSelected} />
                                            </TableCell>
                                            <TableCell numeric style={{ width: '20%', whiteSpace: 'nowrap' }}>{p.id}</TableCell>
                                            <TableCell style={{ width: '35%', whiteSpace: 'nowrap' }}>{p.code}</TableCell>
                                            <TableCell style={{ width: '45%', whiteSpace: 'nowrap' }}>{p.name}</TableCell>
                                        </TableRow>
                                    }) : null}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>

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
        </React.Fragment>
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ... {
    },
})


export default withStyles(styles)(UserRolePage);