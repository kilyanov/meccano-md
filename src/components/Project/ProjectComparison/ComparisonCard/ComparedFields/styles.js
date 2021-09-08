import {makeStyles} from "@material-ui/core";

export const useComparedFieldsStyles = makeStyles((theme) => {
    return {
        root: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(1)
        },
        field: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: theme.spacing(1)
        },
        fieldName: {
            minWidth: 128,
            justifyContent: 'flex-start'
        },
        progressBar: {
            height: 8,
            width: 64
        }
    };
});
