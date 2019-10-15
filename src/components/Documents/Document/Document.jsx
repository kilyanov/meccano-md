import React, {useState} from 'react';
import DocumentIcon from '../../Shared/SvgIcons/DocumentIcon';
import {DOCUMENT_STATUS, DOCUMENT_STATUS_VALUE} from '../../../constants/DocumentStatus';
import TrashIcon from '../../Shared/SvgIcons/TrashIcon';
import DownloadIcon from '../../Shared/SvgIcons/DownloadIcon';
import {DocumentService} from '../../../services';
import {saveAs} from 'file-saver';
import Loader from '../../Shared/Loader/Loader';
import './document.scss';
import {FILE_TYPE_ICON} from '../../../constants/FileTypeIcons';

const cls = new Bem('document');

const Document = ({className, document, highlighted, onDelete}) => {
    const [inProgress, setProgress] = useState(false);

    const handleDownload = (doc) => {
        setProgress(true);
        DocumentService.download(doc.transactionId).then(response => {
            const blob = new Blob([response.data], {type: 'application/octet-stream'});

            saveAs(blob, response.headers['x-filename']);
            setProgress(false);
        });
    };

    const getIcon = (ext) => {
        if (FILE_TYPE_ICON.hasOwnProperty(ext)) {
            return <img {...cls('icon')} src={FILE_TYPE_ICON[ext]()} alt=''/>;
        }

        return <DocumentIcon {...cls('icon')} />;
    };

    return (
        <div {...cls('', {highlighted}, className)} data-id={document.id}>
            {getIcon(document.ext)}

            <section {...cls('main')}>
                <h3 {...cls('title')}>{document.name || 'Документ'}</h3>
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
                        title={document.filename}
                    >
                        {inProgress ?
                            <Loader radius={8} strokeWidth={3}/> :
                            <DownloadIcon {...cls('button-icon')} />
                        }
                    </button>
                )}

                <button
                    {...cls('button', 'danger')}
                    onClick={() => onDelete(document)}
                >
                    <TrashIcon {...cls('button-icon')} />
                </button>
            </section>
        </div>
    );
};

export default Document;
