import React from 'react';
import TopBarButton from "../TopBarButton";
import StorageIcon from "../../SvgIcons/StorageIcon";

export default function ArchiveButton({ className }) {
    return (
        <TopBarButton
            title='Архив'
            className={className}
            IconComponent={StorageIcon}
        />
    );
}
