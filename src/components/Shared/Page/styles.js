import { makeStyles } from '@material-ui/core';

export const pageStyles = makeStyles(({ spacing }) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    header: {
        display: 'flex',
        marginBottom: spacing(2)
    },
    backButton: {
        marginRight: spacing(2)
    },
    withBar: {
        paddingTop: '90px',
        '& $content': {
            paddingTop: 0
        }
    },
    content: {
        flex: 1,
        maxHeight: '100%',
        paddingTop: '30px'
    },
    title: {

    },
    breadcrumbs: {

    }
}));
