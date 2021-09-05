import { makeStyles } from '@material-ui/core';

export const alertDialogStyles = makeStyles(({ spacing, palette }) => ({
    closeButton: {
        position: 'absolute',
        right: spacing(1),
        top: spacing(1),
        color: palette.grey[500]
    },
    button: {
        textTransform: 'uppercase'
    }
}));
