import {makeStyles} from "@material-ui/core";

export const useComparisonCardStyles = makeStyles(() => {
    return {
        header: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8
        },
        title: {
            marginRight: 'auto'
        }
    };
});
