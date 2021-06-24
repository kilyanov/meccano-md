import React from 'react';
import './object-keyword.scss';

const cls = new Bem('object-keyword');

function ObjectKeyword(props) {
    const {
        className: mix = '',
        isChecked = false,
        keywordId,
        keyword
    } = props;

    return (
        <div {...cls('', '', mix)}>
            {keyword}
        </div>
    );
}

export default ObjectKeyword;
