import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import BEMHelper from "react-bem-helper";
import './tiny-mce.scss';
import {TINY_MCE_KEY} from "../../../constants/TinyMCEApiKey";

const cls = new BEMHelper('tiny-mce');

export default function TinyMCE({ className, content, label, onEditorChange, onChange, readOnly }) {
    return (
        <div {...cls('', {readOnly}, className)}>
            {label && <span {...cls('label')}>{label}</span>}

            <Editor
                apiKey={TINY_MCE_KEY}
                value={content}
                disabled={readOnly}
                init={{
                    // skin: 'oxide-dark',
                    // content_css: 'dark',
                    height: 500,
                    menubar: false,
                    plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount'
                    ],
                    toolbar: 'undo redo | formatselect | bold italic backcolor | \ ' +
                        'alignleft aligncenter alignright alignjustify | \ ' +
                        'bullist numlist outdent indent | removeformat | help'
                }}
                onEditorChange={onEditorChange}
                onChange={onChange}
            />
        </div>
    );
}
