const styles = theme => ({
    contentRoot: {
        padding: theme.spacing.unit * 3,
        backgroundColor: '#f4f4f4',
    },

    title: {
        // fontSize: 24,
        opacity: .75,
        margin: theme.spacing.unit * 4,
        marginLeft: 0,
        marginBottom: theme.spacing.unit * 2,
    },

    subTitle: {
        fontSize: 18,
        opacity: .75,
        margin: theme.spacing.unit * 4,
        marginLeft: 0,
        marginBottom: theme.spacing.unit * 1,
    },

    paper: {
        padding: theme.spacing.unit * 3,
    },
    
    dialog: {
        maxWidth: 'calc(100% - 32px)',
    },

})

export default styles;