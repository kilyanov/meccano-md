import { makeStyles } from '@material-ui/core';

export const fixedLoaderStyles = makeStyles(({ palette }) => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.divider,
        zIndex: 1000
    }
}));

