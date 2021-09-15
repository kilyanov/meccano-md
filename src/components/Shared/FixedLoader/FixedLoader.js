import React from 'react';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { fixedLoaderStyles } from './styles';


const FixedLoader = ({
    size = 24,
    color
}) => {
    const classes = fixedLoaderStyles();

    return (
        <Box className={classes.root}>
            <CircularProgress
                size={size}
                color={color}
            />
        </Box>
    );
};

export default FixedLoader;
