import { makeStyles } from '@material-ui/core';

export const usersStyles = makeStyles(({ spacing }) => ({
    fab: {
        position: 'fixed',
        bottom: spacing(2),
        right: spacing(2)
    }
}));
