import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from "react-redux";
import DocumentIcon from '../../SvgIcons/DocumentIcon';
import Document from "../../../Documents/Document/Document";
import './docs-button.scss';

const namespace = 'docs-button';
const cls = new Bem(namespace);

const DocsButton = ({className}) => {
    const documents = useSelector(state => state.documents);
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    useEffect(() => {
        document.addEventListener('click', (event) => {
            if (!buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        });
    }, []);

    return (
        <div
            {...cls('', {active: isOpen}, className)}
            ref={buttonRef}
            title='Документы'
            onClick={(event) => {
                if (
                    event.target.classList.contains(namespace) ||
                    event.target.classList.contains('docs-button__icon')
                ) {
                    setIsOpen(!isOpen);
                }
            }}
        >
            <DocumentIcon {...cls('icon')}/>

            {isOpen && (
                <ul {...cls('list')}>
                    {documents.length ? (
                        documents.map(document => (
                            <li
                                {...cls('list-item')}
                                key={document.id}
                            >
                                <Document
                                    {...cls('document')}
                                    document={document}
                                    canDelete={false}
                                />
                            </li>
                        ))
                    ) : (
                        <li {...cls('list-item')}>Нет документов</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default DocsButton;
