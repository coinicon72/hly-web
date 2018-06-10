// @flow

import React from 'react';

import CommonStyles from "./common_styles";

import axios from 'axios'

import { AppBar, Toolbar, Button, Grid, IconButton, Typography, Paper, Checkbox, Snackbar, Switch } from 'material-ui';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import { FormGroup, FormControlLabel, FormControl, FormHelperText, FormLabel } from 'material-ui/Form';

import {
    TableEditRow, TableEditColumn,
} from '@devexpress/dx-react-grid-material-ui';

import * as mdi from 'mdi-material-ui';

import { LookupEditCell } from "./data_table_util";
import DataTableBase from "./data_table_base";

import { EXPORT_BASE_URL, DATA_API_BASE_URL, API_BASE_URL } from "./config";
import { withStyles } from 'material-ui';

//
import { connect } from 'react-redux'
import { actionShowSnackbar } from "./redux/data_selection"


// =============================================
class RolePrivilegePage extends React.PureComponent {
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

        this.isPrivilegeSelected = (pid => {
            const role = this.state.selectedRole

            return !!role && !!role.privileges && !!role.privileges.find(p => p.id === pid)
        }).bind(this)

        this.isWriteablePrivilege = (pcode => {
            const role = this.state.selectedRole

            return !!role && !!role.privileges && !!role.privileges.find(p => p.code === pcode)
        }).bind(this)

        this.handlePrivilegeClick = ((event, pid) => {
            const { showSnackbar } = this.props

            const privilege = this.state.privileges.find(r => r.id === pid)

            // let role = this.state.selectedRole
            // if (!role) return
            // if (!role.privileges) role.privileges = []

            // const i = role.privileges.findIndex(r => r.id === pid)

            // if (i < 0) {
            //     axios.post(role._links.privileges.href, `${API_BASE_URL}privileges/${pid}`, {
            //         headers: {
            //             'Content-Type': 'text/uri-list',
            //         }
            //     }).then(_ => {
            //         role.privileges.push(privilege)
            //         this.forceUpdate()
            //     })
            //         .catch(e => this.showSnackbar(e.message))
            // } else {
            //     axios.delete(`${role._links.privileges.href}/${pid}`)
            //         .then(_ => {
            //             role.privileges.splice(i, 1)
            //             this.forceUpdate()
            //         })
            //         .catch(e => this.showSnackbar(e.message))
            // }

            const isAdd = event.target.checked
            if (!isAdd) {
                const code = privilege.code.replace(':read', '')
                const writePrivilege = this.state.privileges.find(r => r.code === code)

                // this.updatePrivilege(writePrivilege, isAdd)
                //     .then(this.updatePrivilege(privilege, isAdd))
                //     .catch(e => showSnackbar(e.message))
                this.updatePrivilege([writePrivilege, privilege], isAdd)
            } else {
                this.updatePrivilege([privilege], isAdd)
                // .catch(e => showSnackbar(e.message))
            }
        }).bind(this)

        this.handleToggle = code => (event => {
            const privilege = this.state.privileges.find(r => r.code === code)
            this.updatePrivilege([privilege], event.target.checked)
        }).bind(this)

        this.updatePrivilege = (async (privileges, isAdd) => {
            const { showSnackbar } = this.props

            let role = this.state.selectedRole
            if (!role) return
            if (!role.privileges) role.privileges = []

            for (let privilege of privileges) {
                const pid = privilege.id

                if (isAdd) {
                    await axios.post(role._links.privileges.href, `${API_BASE_URL}privileges/${pid}`,
                        { headers: { 'Content-Type': 'text/uri-list' } })
                        .then(_ => {
                            let i = role.privileges.findIndex(r => r.id === pid)
                            if (i < 0)
                                role.privileges.push(privilege)
                            this.forceUpdate()
                        })
                        .catch(e => showSnackbar(e.message))

                    // return true
                } else {
                    await axios.delete(`${role._links.privileges.href}/${pid}`)
                        .then(_ => {
                            let i = role.privileges.findIndex(r => r.id === pid)
                            if (i >= 0)
                                role.privileges.splice(i, 1)
                            this.forceUpdate()
                        })
                        .catch(e => showSnackbar(e.message))

                    // return true
                }
            }
        }).bind(this)
    }

    componentDidMount() {
        axios.get(DATA_API_BASE_URL + '/privileges?sort=code&size=1000')
            .then(resp => resp.data._embedded['privileges'])
            .then(privileges => {
                this.setState({ privileges })
            })

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
                                        <TableCell style={{}}></TableCell>
                                        <TableCell style={{}}>序号</TableCell>
                                        <TableCell style={{}}>代码</TableCell>
                                        <TableCell style={{}}>名称</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {roles ? roles.map(r => {
                                        const isSelected = this.isRoleSelected(r.id)
                                        // console.debug(`user ${u.id} ${isSelected}`)

                                        return <TableRow key={r.id}
                                            hover
                                            onClick={event => this.handleRoleClick(event, r.id)}>
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={isSelected} />
                                            </TableCell>
                                            <TableCell numeric style={{ width: '20%', }}>{r.id}</TableCell>
                                            <TableCell style={{ width: '35%', }}>{r.code}</TableCell>
                                            <TableCell style={{ width: '45%', }}>{r.name}</TableCell>
                                        </TableRow>
                                    }) : null}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                    <Grid item md={6}>
                        <Typography variant="title" className={classes.toolbarTitle}>权限{selectedRole ? null : " (请先选择一个岗位)"}</Typography>
                        <Paper>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ width: '5%', }}></TableCell>
                                        {/* <TableCell style={{  }}>序号</TableCell> */}
                                        <TableCell style={{ width: '30%', }}>代码</TableCell>
                                        <TableCell style={{ width: '40%', }}>名称</TableCell>
                                        <TableCell style={{ width: '20%', }}>可读写</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {privileges ? privileges.filter(p => p.code.endsWith(":read")).map(p => {
                                        const isSelected = this.isPrivilegeSelected(p.id);
                                        const code = p.code.replace(':read', '')
                                        const isWriteable = this.isWriteablePrivilege(code)

                                        return <TableRow key={p.id}
                                            hover
                                        // onClick={event => this.handlePrivilegeClick(event, p.id)}
                                        >
                                            <TableCell padding="checkbox" style={{ width: '5%' }}>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={event => this.handlePrivilegeClick(event, p.id)} />
                                            </TableCell>
                                            {/* <TableCell numeric style={{ width: '10%',  }}>{p.id}</TableCell> */}
                                            <TableCell padding="dense" style={{ width: '40%', }}>{code}</TableCell>
                                            <TableCell padding="dense" style={{ width: '40%', }}>{p.name}</TableCell>
                                            <TableCell padding="dense" style={{ width: '20%', }}>
                                                {/* <FormControlLabel
                                                control={ */}
                                                <Switch
                                                    disabled={!isSelected}
                                                    checked={isWriteable}
                                                    onChange={this.handleToggle(code)}
                                                //   value=""
                                                />
                                                {/* }
                                                label="可读写"
                                            /> */}
                                            </TableCell>
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
    ... {
    },
})


const mapDispatchToProps = dispatch => ({
    // doLogin: (uid, pwd) => {
    //     dispatch(actionLogging())

    //     axios.post(`${API_BASE_URL}token?uid=${uid}&pwd=${pwd}`)
    //         .then(r => r.data)
    //         .then(r => {
    //             dispatch(actionLoggedIn(r.data, r.extra))
    //         })
    //         .catch(e => {
    //             dispatch(actionLoginFailed(e))
    //         })
    // },

    //
    showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
})

const ConnectedRolePrivilegePage = connect(
    // mapStateToProps,
    null,
    mapDispatchToProps
)(RolePrivilegePage)


export default withStyles(styles)(ConnectedRolePrivilegePage);