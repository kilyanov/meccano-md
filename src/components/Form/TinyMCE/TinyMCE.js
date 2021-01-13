import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import BEMHelper from "react-bem-helper";
import { TINY_MCE_KEY } from "@const/TinyMCEApiKey";
import './tiny-mce.scss';

import 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/plugins/table';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/print';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/code';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/paste';

const cls = new BEMHelper('tiny-mce');

export default function TinyMCE({
    className,
    content,
    label,
    onEditorChange,
    onChange,
    readOnly,
    draggable,
    required,
    height = 500
}) {
    return (
        <div {...cls('', {readOnly}, className)}>
            {label && (
                <span
                    {...cls(
                        'label',
                        { error: required && (!content || !content.length) },
                        { 'drag-handle': draggable }
                    )}
                >{label}</span>
            )}

            <Editor
                apiKey={TINY_MCE_KEY}
                value={content}
                disabled={readOnly}
                init={{
                    // skin: 'oxide-dark',
                    // content_css: 'dark',
                    height,
                    menubar: false,
                    entity_encoding: 'raw',
                    plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount paste'
                    ],
                    paste_as_text: true,
                    toolbar: 'undo redo | formatselect | bold italic backcolor | \ ' +
                        'alignleft aligncenter alignright alignjustify | \ ' +
                        'bullist numlist outdent indent | removeformat | code help',
                    code_dialog_height: 200,
                    code_dialog_width: 300
                }}
                onEditorChange={onEditorChange}
                onChange={a => {
                    console.log('a', a);
                }}
            />
        </div>
    );
}
