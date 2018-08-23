// @flow

import React from 'react';

import CommonStyles from "./common_styles";

import axios from 'axios'

//
import {
    // AppBar, Toolbar, Typography,
    Button, IconButton,
    Input, InputLabel, InputAdornment,
    FormGroup,
    // FormControlLabel, 
    FormControl,
    // FormHelperText, FormLabel
} from '@material-ui/core';

import { withStyles } from '@material-ui/core';

// import {
//     TableEditRow, TableEditColumn,
// } from '@devexpress/dx-react-grid-material-ui';

//
import * as mdi from 'mdi-material-ui';

//
import { connect } from 'react-redux'

import {
    withCookies,
    // Cookies 
} from 'react-cookie';

//
import {
    // EXPORT_BASE_URL,
    API_BASE_URL,
    // DATA_API_BASE_URL
} from "./config";

import { actionLogging, actionLoggedIn, actionLoginFailed } from './redux/redux'
import { actionShowSnackbar } from "./redux/data_selection"


// =============================================
class LoginPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            uid: "",
            pwd: "",

            showPassword: false,
        }

        this.tryLogin = _ => {
            if (this.props.doLogin && this.state.uid && this.state.pwd)
                this.props.doLogin(this.state.uid, this.state.pwd)

            return false;
        }
    }

    componentDidMount() {
    }

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     if (this.props.token) {
    //         const { cookies } = this.props;
    //         cookies.set('token', this.props.token)

    //         // this.props.history.replace("/")
    //         // console.warn(`login failed: ${this.props.loginResult}`)
    //     }
    // }

    render() {
        // const { classes, width } = this.props

        return <div style={{ display: 'flex', flex: 1, justifyContent: 'center', padding: 24 }}>
            {/* <form>  */}
                {/* onSubmit={this.tryLogin}> */}
                <FormGroup>
                    <FormControl aria-describedby="no-error-text">
                        <InputLabel htmlFor="uid">手机</InputLabel>
                        <Input id="uid"
                            value={this.state.uid}
                            onChange={e => this.setState({ uid: e.target.value })}
                            // inputProps={{ onkeyup: "this.tryLogin()" }}
                        />
                        {/* <FormHelperText id="no-error-text">{errors.revision}</FormHelperText> */}
                    </FormControl>

                    <FormControl style={{ marginTop: 16 }}>
                        <InputLabel htmlFor="adornment-password">密码</InputLabel>
                        <Input
                            id="adornment-password"
                            type={this.state.showPassword ? 'text' : 'password'}
                            value={this.state.pwd}
                            onChange={e => this.setState({ pwd: e.target.value })}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        // aria-label="Toggle password visibility"
                                        onClick={_ => this.setState({ showPassword: !this.state.showPassword })}
                                    // onMouseDown={this.handleMouseDownPassword}
                                    >
                                        {this.state.showPassword ? <mdi.EyeOff /> : <mdi.Eye />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            // inputProps={{ onkeyup: "this.tryLogin()" }}
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        style={{ alignSelf: 'flex-end', marginTop: 16 }}
                        disabled={!this.state.uid || !this.state.pwd}
                        onClick={() => this.props.doLogin && this.props.doLogin(this.state.uid, this.state.pwd)}
                    // onClick={() => this.props.showSnackbar("test")}
                    >登录<mdi.LoginVariant /></Button>

                    {this.props.loginError ? <p style={{ color: 'red', marginTop: 16 }}>{this.props.loginError.message}</p> : null}
                </FormGroup>
            {/* </form> */}
        </div>
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    ...{
    },
})


// function actionLoggedIn(token, user) {
//     return {
//         type: 'loggedIn',
//         token: token,
//         user: user,
//     }
// }

// function actionLoginFailed(e) {
//     return {
//         type: 'loginFailed',
//         error: e,
//     }
// }

const mapStateToProps = state => ({
    loginResult: state.main.loginError,
    token: state.main.token,
    user: state.main.user,
})

const mapDispatchToProps = dispatch => ({
    doLogin: (uid, pwd) => {
        dispatch(actionLogging())

        axios.post(`${API_BASE_URL}/token?uid=${uid}&pwd=${pwd}`)
            .then(r => r.data)
            .then(r => {
                dispatch(actionLoggedIn(r.data, r.extra))
            })
            .catch(e => {
                dispatch(actionLoginFailed(e))
            })
    },

    //
    showSnackbar: msg => dispatch(actionShowSnackbar(msg)),
})

const ConnectedLoginPage = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginPage)

export default withStyles(styles)(withCookies(ConnectedLoginPage))