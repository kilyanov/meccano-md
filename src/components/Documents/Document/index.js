import React, { useState } from 'react';
import DocumentIcon from '../../Shared/SvgIcons/DocumentIcon';
import { DOCUMENT_STATUS, DOCUMENT_STATUS_VALUE } from '../../../constants';
import TrashIcon from '../../Shared/SvgIcons/TrashIcon';
import DownloadIcon from '../../Shared/SvgIcons/DownloadIcon';
import { DocumentService } from '../../../services';
import { saveAs } from 'file-saver';
import Loader from '../../Shared/Loader/Loader';
import './document.scss';
import { FILE_TYPE_ICON } from '../../../constants';
import Access from "../../Shared/Access/Access";
import { PERMISSION } from "../../../constants";
import { Link } from "react-router-dom";

const cls = new Bem('document');

const Document = ({
    className,
    document,
    disabled = false,
    highlighted,
    canDelete = true,
    onDelete = () => {},
    onClick = () => {},
    linkPrefix
}) => {
    const [ inProgress, setProgress ] = useState(false);
    const handleDownload = (doc) => {
        setProgress(true);
        DocumentService.download(doc.transactionId).then(response => {
            const blob = new Blob([ response.data ], { type: 'application/octet-stream' });

            saveAs(blob, decodeURI(response.headers['x-filename']));
            setProgress(false);
        });
    };
    const getIcon = (ext) => {
        if (FILE_TYPE_ICON.hasOwnProperty(ext)) {
            return <img {...cls('icon')} src={FILE_TYPE_ICON[ext]()} alt=''/>;
        }

        return <DocumentIcon {...cls('icon')} />;
    };
    const Wrapper = ({ children, ...props }) => (
        linkPrefix
            ? <Link to={`${linkPrefix}/${document.id}`} {...props}>{children}</Link>
            : <div {...props}>{children}</div>
    );
    const handleClick = (e) => {
        if (e.target.closest('.document__buttons')) {
            e.preventDefault();
        }

        onClick();
    };

    return (
        <Wrapper
            {...cls('', { highlighted, disabled }, className)}
            data-id={document.id}
            onClick={handleClick}
        >
            {getIcon(document.ext)}

            <section {...cls('main')}>
                <h3 {...cls('title')}>{document.filename || document.name || 'Документ'}</h3>
                <span {...cls('owner')}>
                    {_.get(document, 'user.username', 'Нет пользователя')}, {moment(document.updatedAt)
                        .format('D MMMM YYYY [в] HH:mm')}
                </span>
                <span {...cls('status', document.status)}>{DOCUMENT_STATUS[document.status]}</span>
            </section>

            <section {...cls('buttons')}>
                {document.status === DOCUMENT_STATUS_VALUE.done && (
                    <button
                        {...cls('button')}
                        onClick={() => handleDownload(document)}
                    >
                        {inProgress ?
                            <Loader radius={8} strokeWidth={3}/> :
                            <DownloadIcon {...cls('button-icon')} />
                        }
                    </button>
                )}

                {canDelete && (
                    <Access permissions={[ PERMISSION.editDocuments ]}>
                        <button
                            {...cls('button', 'danger')}
                            onClick={() => onDelete(document)}
                        >
                            <TrashIcon {...cls('button-icon')} />
                        </button>
                    </Access>
                )}
            </section>
        </Wrapper>
    );
};

export default Document;
