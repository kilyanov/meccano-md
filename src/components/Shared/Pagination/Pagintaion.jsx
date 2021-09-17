import React from 'react';
import MuiPagination from '@material-ui/lab/Pagination';
import './pagination.scss';

const Pagination = ({ page, pageCount, onPageChange }) => {
    return  (
        <MuiPagination
            page={page}
            count={pageCount}
            color='primary'
            onChange={(event, value) => onPageChange(value)}
        />
    );
};

export default Pagination;
