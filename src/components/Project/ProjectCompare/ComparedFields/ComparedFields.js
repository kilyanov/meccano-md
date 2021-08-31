import React from 'react';
import {Box, Chip, LinearProgress, Typography} from '@material-ui/core';
import { useComparedFieldsStyles } from './styles';

const FIELD_NAME = {
    'text': 'Текст',
    'annotation': 'Аннотация'
};

function ComparedFields({ comparedFields }) {
    const classes = useComparedFieldsStyles();

    return (
        <Box className={classes.root} >
            {comparedFields.map((field) => {
                const hasResultCompare = !!field?.result_compare;

                return (
                    <Box
                        className={classes.field}
                        key={field.filed_compare}
                    >
                        <Chip
                            className={classes.fieldName}
                            color="primary"
                            size="small"
                            variant="outlined"
                            label={FIELD_NAME[field.filed_compare] || field.filed_compare}
                        />
                        {hasResultCompare && (
                            <>
                                <LinearProgress
                                    className={classes.progressBar}
                                    variant="determinate"
                                    value={+field.result_compare}
                                />
                                <Typography
                                    className={classes.progressValue}
                                >
                                    {field.result_compare}%
                                </Typography>
                            </>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}

export default ComparedFields;
