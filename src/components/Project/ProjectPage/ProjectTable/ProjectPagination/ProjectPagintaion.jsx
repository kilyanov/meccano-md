import React from 'react';
import ReactPaginate from "react-paginate";
import './project-pagination.scss';

const ProjectPagination = ({ page, pageCount, onPageChange }) => {
    return (
        <ReactPaginate
            pageCount={pageCount}
            initialPage={page - 1}
            onPageChange={onPageChange}
            previousLabel='<'
            nextLabel='>'
            disableInitialCallback
            containerClassName='project-pagination'
            pageClassName='project-pagination__item'
            pageLinkClassName='project-pagination__item-link'
            activeClassName='project-pagination__item--active'
            activeLinkClassName='project-pagination__item-link--active'
            previousClassName='project-pagination__item'
            previousLinkClassName='project-pagination__item-link'
            nextLinkClassName='project-pagination__item-link'
            nextClassName='project-pagination__item'
            breakClassName='project-pagination__item'
            breakLinkClassName='project-pagination__item-link'
            disabledClassName='project-pagination__item--disabled'
        />
    );
};

export default ProjectPagination;
