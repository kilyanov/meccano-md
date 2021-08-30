import { makeStyles } from '@material-ui/core';

export const projectNameStyles = makeStyles(({ spacing }) => ({
    form: {
        '& > * + *': {
            marginTop: spacing(2)
        }
    }
}));
