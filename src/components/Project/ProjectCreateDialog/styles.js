import { makeStyles } from '@material-ui/core';

export const projectCreateDialogStyles = makeStyles(({ spacing, palette }) => ({
    content: {
        '& > * + *': {
            marginTop: spacing(2)
        }
    },
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
