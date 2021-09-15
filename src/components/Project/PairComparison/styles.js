import { alpha, makeStyles } from '@material-ui/core';

export const usePairComparisonStyles = makeStyles((theme) => {
    return {
        label: {
            marginBottom: theme.spacing(1)
        },
        column: {
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(2)
        },
        fieldWrapper: {
            padding: theme.spacing(1),
            backgroundColor: alpha(theme.palette.success.main, 0.1)
        },
        comparedFieldWrapper: {
            padding: theme.spacing(1),
            backgroundColor: alpha(theme.palette.error.main, 0.1)
        }
    };
});
