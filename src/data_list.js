// @flow

import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { withStyles, withWidth } from '@material-ui/core';


class DataList extends React.Component {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.dl}>
                <div className={classes.dlHeader}></div>
                <div className={classes.dlBody}></div>
                <div className={classes.dlFooter}></div>

            </div>
        )
    }
}


const dataListStyles = theme => ({
    dl: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 0,
        backgroundColor: '#CFD8DC',
        [theme.breakpoints.up('md')]: {
            backgroundColor: theme.palette.primary.main,
        },
        [theme.breakpoints.down('sm')]: {
            backgroundColor: theme.palette.secondary.main,
        },
    },

    dlHeader: {
        display: 'flex',
        // flexDirection: 'column',
        // width: '100%',
        height: '48px',
        padding: 0,
        backgroundColor: '#FFCCBC',
    },

    dlBody: {
        display: 'flex',
        flex: 1,
        // flexDirection: 'column',
        // width: '100%',
        // height: '48px',
        // padding: 0,
        backgroundColor: '#80DEEA',
        overflowY: 'auto',
    },

    dlFooter: {
        display: 'flex',
        // flexDirection: 'column',
        // width: '100%',
        height: '48px',
        padding: 0,
        backgroundColor: '#B39DDB',
    },
});

export default compose(withStyles(dataListStyles), withWidth())(DataList);