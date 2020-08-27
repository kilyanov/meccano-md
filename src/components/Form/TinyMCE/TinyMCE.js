import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import BEMHelper from "react-bem-helper";
import './tiny-mce.scss';
import {TINY_MCE_KEY} from "../../../constants/TinyMCEApiKey";

const cls = new BEMHelper('tiny-mce');

export default function TinyMCE({ className, content, label, onEditorChange, onChange, readOnly, draggable, required }) {
    return (
        <div {...cls('', {readOnly}, className)}>
            {label && <span {...cls('label', { error: required && (!content || !content.length) }, { 'drag-handle': draggable })}>{label}</span>}

            <Editor
                apiKey={TINY_MCE_KEY}
                value={content}
                disabled={readOnly}
                init={{
                    // skin: 'oxide-dark',
                    // content_css: 'dark',
                    height: 500,
                    menubar: false,
                    entity_encoding: 'raw',
                    plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount'
                    ],
                    toolbar: 'undo redo | formatselect | bold italic backcolor | \ ' +
                        'alignleft aligncenter alignright alignjustify | \ ' +
                        'bullist numlist outdent indent | removeformat | code help',
                    code_dialog_height: 200,
                    code_dialog_width: 300
                }}
                onEditorChange={onEditorChange}
                onChange={onChange}
            />
        </div>
    );
}
