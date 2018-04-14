// @flow

import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { withStyles } from 'material-ui/styles';
import withWidth from 'material-ui/utils/withWidth';

import Button from 'material-ui/Button';
import AddIcon from '@material-ui/icons/Add';

import axios from 'axios';
import querystring from 'querystring';

import DataList from './data_list';

class Page extends React.Component<any, any> {
    componentDidMount() {
        axios.get()
    }

    render() {
        const {classes, width} = this.props
        return (
            <DataList />
        )
    }
}

const styles = theme => ({
    root: {
        display: 'flex',
        padding: 0,
        [theme.breakpoints.up('md')]: {
            backgroundColor: theme.palette.primary.main,
        },
        [theme.breakpoints.down('sm')]: {
            backgroundColor: theme.palette.secondary.main,
        },
    },
});

Page.propTypes = {
    classes: PropTypes.object.isRequired,
    width: PropTypes.string.isRequired,
};

export default compose(withStyles(styles), withWidth())(Page);







