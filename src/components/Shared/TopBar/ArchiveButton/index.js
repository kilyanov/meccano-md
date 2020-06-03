import React, { useState } from 'react';
import TopBarButton from "../TopBarButton";
import StorageIcon from "../../SvgIcons/StorageIcon";
import ArchiveModal from "../../../Archieve/ArchiveModal";

export default function ArchiveButton({ className }) {
    const [ showModal, setShowModal ] = useState(false);

    return (
        <>
            <TopBarButton
                title='Архив'
                className={className}
                IconComponent={StorageIcon}
                onClick={() => setShowModal(true)}
            />

            {showModal && <ArchiveModal onClose={() => setShowModal(false)}/>}
        </>
    );
}
