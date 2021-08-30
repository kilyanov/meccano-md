import { makeStyles } from '@material-ui/core';
import { red } from '@material-ui/core/colors';

export const homePageStyles = makeStyles(({ spacing }) => ({
    pageTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing(4)
    },
    subTitle: {
        display: 'inline',
        fontWeight: 300
    },
    fab: {
        position: 'fixed',
        right: spacing(4),
        bottom: spacing(4)
    },
    card: {
        width: 250,
        marginRight: spacing(2),
        marginBottom: spacing(2)
    },
    cardTitle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 14
    },
    pos: {

    },
    avatar: {
        backgroundColor: red[500],
        textTransform: 'uppercase'
    },
    cardActions: {
        justifyContent: 'flex-end'
    }
}));
