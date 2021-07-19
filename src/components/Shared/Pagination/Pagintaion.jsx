import React from 'react';
import ReactPaginate from "react-paginate";
import './pagination.scss';

const Pagination = ({ page, pageCount, onPageChange }) => {
    return (
        <ReactPaginate
            pageCount={pageCount}
            initialPage={page - 1}
            onPageChange={({ selected }) => onPageChange(selected + 1)}
            previousLabel='<'
            nextLabel='>'
            disableInitialCallback
            containerClassName='pagination'
            pageClassName='pagination__item'
            pageLinkClassName='pagination__item-link'
            activeClassName='pagination__item--active'
            activeLinkClassName='pagination__item-link--active'
            previousClassName='pagination__item'
            previousLinkClassName='pagination__item-link'
            nextLinkClassName='pagination__item-link'
            nextClassName='pagination__item'
            breakClassName='pagination__item'
            breakLinkClassName='pagination__item-link'
            disabledClassName='pagination__item--disabled'
        />
    );
};

export default Pagination;
