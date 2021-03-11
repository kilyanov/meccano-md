import React, { useEffect, useRef, useState } from 'react';
import Document from "../../../Documents/Document";
import { Link } from "react-router-dom";
import './top-bar-button.scss';

const namespace = 'top-bar-button';
const cls = new Bem(namespace);

export default function TopBarButton({
    title = '',
    className,
    IconComponent,
    options = [],
    withList = false,
    onClick = () => {},
    linkToPage = '',
    showLinkForGoToSection = false
}) {
    const [ isOpen, setIsOpen ] = useState(false);
    const buttonRef = useRef(null);

    useEffect(() => {
        document.addEventListener('click', (event) => {
            if (buttonRef && buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        });
    }, []);

    return (
        <div
            {...cls('', { active: isOpen }, className)}
            ref={buttonRef}
            title={title}
            onClick={(event) => {
                if (
                    withList && (
                        event.target.classList.contains(namespace) ||
                        event.target.classList.contains(`${namespace}__icon`) ||
                        event.target.viewportElement?.tagName === 'svg'
                    )
                ) {
                    setIsOpen(!isOpen);
                }

                onClick();
            }}
        >
            {IconComponent && <IconComponent {...cls('icon')}/>}

            {isOpen && (
                <div {...cls('list-container')}>
                    <h3 {...cls('list-title')}>{ title }</h3>

                    <ul {...cls('list')}>
                        {options.length ? (
                            options.map(document => (
                                <li
                                    {...cls('list-item')}
                                    key={document.id}
                                >
                                    <Document
                                        {...cls('document')}
                                        document={document}
                                        linkPrefix={linkToPage}
                                        onClick={() => setIsOpen(false)}
                                        canDelete={false}
                                    />
                                </li>
                            ))
                        ) : (
                            <li {...cls('list-item', 'empty')}>Нет элементов</li>
                        )}

                        {linkToPage && showLinkForGoToSection && (
                            <li {...cls('list-item', 'link')}>
                                <Link
                                    {...cls('list-link')}
                                    to={linkToPage}
                                    target='_blank'
                                >
                                    Перейти в { title }
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
