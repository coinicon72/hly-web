const drawerWidth = 240;

export const COLOR_STOCK_IN = 'green'
export const COLOR_STOCK_OUT = 'red'

const styles = theme => ({
    // appBar: {
    //     position: 'inherit',
    //     // marginleft: drawerWidth,
    //     // [theme.breakpoints.up('md')]: {
    //     //     width: `calc(100% - ${drawerWidth}px)`,
    //     // },
    //     // transition: theme.transitions.create(['margin', 'width'], {
    //     //   easing: theme.transitions.easing.sharp,
    //     //   duration: theme.transitions.duration.leavingScreen,
    //     // }),
    // },

    // navIconHide: {
    //     [theme.breakpoints.up('md')]: {
    //         display: 'none',
    //     },
    // },

    // appTitle: {
    //     color: "inherit",
    //     overflow: "hidden",
    //     whiteSpace: "nowrap",
    //     textOverflow: "ellipsis",
    //     flex: 1,
    // },

    contentRoot: {
        // flex: 1,
        minHeight: `calc(100% - ${theme.spacing.unit * 3 * 2}px)`,
        padding: theme.spacing.unit * 3,
        backgroundColor: '#f4f4f4',
        // marginTop: '64px',
        // overflowY: 'auto',
    },

    toolbar: {
        padding: 0,
    },

    toolbarTitle: {
        opacity: .75,
        margin: 0,
        flex: 1,
    },

    error: {
        color: 'red',
    },

    title: {
        // fontSize: 24,
        opacity: .75,
        margin: theme.spacing.unit * 4,
        marginleft: 0,
        marginBottom: theme.spacing.unit * 2,
    },

    subTitle: {
        fontSize: 18,
        opacity: .75,
        margin: theme.spacing.unit * 4,
        marginleft: 0,
        marginBottom: theme.spacing.unit * 1,
    },

    paper: {
        padding: theme.spacing.unit * 3,
    },

    compactPaper: {
        padding: 0,
    },

    dialog: {
        maxWidth: 'calc(100% - 16em)',
    },
})

export default styles;