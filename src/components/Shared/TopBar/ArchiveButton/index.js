import React, { useState } from 'react';
import TopBarButton from "../TopBarButton";
import StorageIcon from "../../SvgIcons/StorageIcon";
import ArchiveModal from "../../../Archive/ArchiveModal";
import { useSelector } from "react-redux";

export default function ArchiveButton({ className }) {
    const [ showModal, setShowModal ] = useState(false);
    const currentProject = useSelector(state => state.currentProject);

    return (
        <>
            <TopBarButton
                title='Архив'
                className={className}
                IconComponent={StorageIcon}
                onClick={() => setShowModal(true)}
            />

            {(showModal && currentProject) &&  (
                <ArchiveModal
                    projectId={currentProject.id}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
