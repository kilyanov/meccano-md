import { makeStyles } from '@material-ui/core';

export const loginStyles = makeStyles(({ spacing, palette }) => ({
    container: {
        height: '100%'
    },
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%'
    },
    logo: {
        marginBottom: spacing(4)
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: 300,
        '& > * + *': {
            marginTop: spacing(2)
        }
    },
    loader: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.divider
    }
}));
