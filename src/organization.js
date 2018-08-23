// @flow

import React from 'react';
import classnames from 'classnames';
import CommonStyles from "./common_styles";

import axios from 'axios'
import { connect } from 'react-redux'

import { withStyles } from '@material-ui/core';
import { Toolbar, Typography, Button, IconButton, Grid, Paper } from '@material-ui/core';
import {
    TableEditRow,
} from '@devexpress/dx-react-grid-material-ui';

// icons
import * as mdi from 'mdi-material-ui';

// import Tree from 'react-ui-tree';
import TreeView from 'react-treeview'
import "./tree-view.css"

//
import { actionShowSnackbar } from "./redux/data_selection"

//
import {
    // EXPORT_BASE_URL,
    DATA_API_BASE_URL
} from "./config";


// =============================================
class OrganizationPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.dataRepo = "organizations";
        this.dataRepoApiUrl = `${DATA_API_BASE_URL}/${this.dataRepo}`;

        this.state = {
            loaded: false,

            tree: [{
                "module": "react-ui-tree",
                "children": [
                    {
                        "module": "dist",
                        "collapsed": true,
                        "children": [
                            {
                                "module": "node.js",
                                "leaf": true
                            },
                            {
                                "module": "react-ui-tree.css",
                                "leaf": true
                            },
                            {
                                "module": "react-ui-tree.js",
                                "leaf": true
                            },
                            {
                                "module": "tree.js",
                                "leaf": true
                            }
                        ]
                    },
                    {
                        "module": "example",
                        "children": [
                            {
                                "module": "app.js",
                                "leaf": true
                            },
                            {
                                "module": "app.less",
                                "leaf": true
                            },
                            {
                                "module": "index.html",
                                "leaf": true
                            }
                        ]
                    },
                    {
                        "module": "lib",
                        "children": [
                            {
                                "module": "node.js",
                                "leaf": true
                            },
                            {
                                "module": "react-ui-tree.js",
                                "leaf": true
                            },
                            {
                                "module": "react-ui-tree.less",
                                "leaf": true
                            },
                            {
                                "module": "tree.js",
                                "leaf": true
                            }
                        ]
                    },
                    {
                        "module": ".gitiignore",
                        "leaf": true
                    },
                ]
            }],

            selectedNode: null,
        }

        // this.renderNode = node => {
        //     const { classes } = this.props
        //     return (
        //         <span
        //             className={classnames(classes.node, {
        //                 'is-active': node === this.state.active
        //             })}
        //             onClick={this.onClickNode.bind(null, node)}
        //         >
        //             {node.module}
        //         </span>
        //     );
        // }

        this.onClickNode = node => {
            this.setState({
                active: node
            });
        };

        // this.doLoad = this.doLoad.bind(this)
        // this.doAdd = this.doAdd.bind(this)
        // this.doUpdate = this.doUpdate.bind(this)
        // this.doDelete = this.doDelete.bind(this)
    }

    componentDidMount() {
        // let otree = [];

        // axios.get(this.dataRepoApiUrl)
        //     .then(resp => resp.data._embedded[this.dataRepo])
        //     .then(n => {
        //         if (n.parent) {

        //         } else 
        //         otree.push(n)
        //     })
        //     .catche(e => this.props.showSnackbar(e.message))
    }

    // doLoad = () => {
    //     return axios.get(this.dataRepoApiUrl)//,
    //         .then(resp => resp.data._embedded[this.dataRepo])
    // }

    // doAdd = (r) => {
    //     return axios.post(this.dataRepoApiUrl, r)
    //         .then(resp => resp.data)
    //     // .then(j => ({ ...j, type: r.type.name }))
    // }

    // doUpdate = (r, c) => {
    //     return axios.patch(this.dataRepoApiUrl + "/" + r['id'], c)
    //         .then(resp => resp.data)
    //     // .then(j => ({ ...j, type: v && v.name ? v.name : undefined }))
    // }

    // doDelete = (r) => {
    //     return axios.delete(this.dataRepoApiUrl + "/" + r['id'])
    // }

    findNode(id) {
        const ids = id.split('-')

        let node = null;
        ids.map(id => parseInt(id, 10))
            .forEach(id => {
                if (node === null)
                    node = this.state.tree[id];
                else
                    node = node.children[id];
            });

        return node;
    }

    handleTreeNodeClick = id => {
        console.log(`clicked on ${id}`)
        const node = this.findNode(id);

        this.setState({ selectedNode: node });
    }

    handleTreeNodeExpandorClick = id => {
        console.log(`clicked on expandor ${id}`)
        const node = this.findNode(id);

        if (node) {
            node.collapsed = !node.collapsed
            this.forceUpdate()
        }
    }

    renderSubtree = (entry, id) => {
        let css = classnames("node");
        if (this.state.selectedNode === entry)
            css = classnames("node", "selected");

        return <TreeView
            key={`n_${id}`}
            nodeLabel={<span className={css} onClick={this.handleTreeNodeClick.bind(null, id)}>{entry.module}</span>}
            collapsed={!!entry.collapsed}
            onClick={this.handleTreeNodeExpandorClick.bind(null, id)}
        >
            {entry.children && entry.children.map((sn, idx) => this.renderSubtree(sn, `${id}-${idx}`))}
        </TreeView>
    }

    render() {
        const { classes } = this.props;
        const { tree } = this.state;

        const rnTree = this.renderSubtree(tree[0], `0`);

        return <div className={classes.contentRoot}>
            <Toolbar className={classes.toolbar}>
                <IconButton style={{ marginRight: 16 }} onClick={this.props.history.goBack} ><mdi.ArrowLeft /></IconButton>
                <Typography variant="title" className={classes.toolbarTitle}>组织结构管理</Typography>
                {/* <Button color='primary' style={{ fontSize: 18 }} disabled={!this.state.selectedNode} ><mdi.PlusCircleOutline />添加下属结构</Button> */}
            </Toolbar>

            <Grid container spacing={16}>
                <Grid item md={6}>
                    <Typography variant="title" className={classes.toolbarTitle}>总览</Typography>
                    <Paper style={{ flex: 1, padding: 8, overflow: 'auto' }}>
                        {rnTree}
                    </Paper>
                </Grid>

                <Grid item md={6}>
                    <Typography variant="title" className={classes.toolbarTitle}>操作{this.state.selectedNode ? null : " (请先选择一个结构)"}</Typography>
                    <Paper style={{ padding: 8 }}>

                    </Paper>
                </Grid>
            </Grid>

        </div>
    }
}


const styles = theme => ({
    ...CommonStyles(theme),
    // ...{},
})


const mapDispatchToProps = dispatch => ({
    // doLogin: (uid, pwd) => {
    //     dispatch(actionLogging())

    //     axios.post(`${API_BASE_URL}/token?uid=${uid}&pwd=${pwd}`)
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

const ConnectedPage = connect(
    // mapStateToProps,
    null,
    mapDispatchToProps
)(OrganizationPage)


export default withStyles(styles)(ConnectedPage);