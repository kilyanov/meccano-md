import { makeStyles } from '@material-ui/core';

export const projectSortStyles = makeStyles(({ spacing }) => ({
    fab: {
        position: 'fixed',
        right: spacing(2),
        bottom: spacing(2)
    },
    extendedIcon: {
        marginRight: spacing(1)
    }
}));
