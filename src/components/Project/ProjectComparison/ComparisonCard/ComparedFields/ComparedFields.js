import React, { useCallback } from 'react';
import { Box, LinearProgress, Typography } from '@material-ui/core';
import { useComparedFieldsStyles } from './styles';

function ComparedFields({ comparedFields, projectFields }) {
    const classes = useComparedFieldsStyles();

    const getFieldLabel = useCallback((slug) => {
        return projectFields.find((field) => field.slug === slug)?.name || '';
    }, [projectFields]);

    return (
        <Box className={classes.root} >
            {comparedFields.map((field) => {
                const hasResultCompare = !!field?.result_compare;

                return (
                    <Box
                        className={classes.field}
                        key={field.filed_compare}
                    >
                        <Typography
                            className={classes.fieldName}
                            color="primary"
                        >
                            {getFieldLabel(field.filed_compare) || field.filed_compare}
                        </Typography>
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
