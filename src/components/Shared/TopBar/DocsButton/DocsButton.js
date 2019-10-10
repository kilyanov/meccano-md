import React from 'react';
import {Link} from 'react-router-dom';
import DocumentIcon from '../../SvgIcons/DocumentIcon';
import './docs-button.scss';

const cls = new Bem('docs-button');

const DocsButton = ({className}) => (
    <Link to='/documents' {...cls('', '', className)} title='Документы'>
        <DocumentIcon {...cls('icon')}/>
    </Link>
);

export default DocsButton;
