import {makeStyles} from "@material-ui/core";

export const useProjectCompareStyles = makeStyles((theme) => {
    return {
        label: {
            marginBottom: theme.spacing(1)
        },
        divider: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2)
        }
    };
});
