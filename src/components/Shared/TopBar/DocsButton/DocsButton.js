import React from 'react';
import { useSelector } from "react-redux";
import DocumentIcon from '../../SvgIcons/DocumentIcon';
import TopBarButton from "../TopBarButton";

const SHOW_COUNT = 5;

const DocsButton = ({ className }) => {
    const documents = useSelector(state => state.documents);

    return (
        <TopBarButton
            title='Документы'
            withList
            className={className}
            IconComponent={DocumentIcon}
            options={documents.slice(0, SHOW_COUNT)}
            linkToPage='/documents'
        />
    );
};

export default DocsButton;
