import React, { useRef } from 'react';
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
import { useSelector } from "react-redux";
import Button from "@components/Shared/Button/Button";
import { copyToClipboard, getFromClipboard, stripHtml } from "@helpers/Tools";
import { NotificationManager } from "react-notifications";

const cls = new BEMHelper('tiny-mce');

export default function TinyMCE({
    className,
    content,
    label,
    onEditorChange,
    // onChange,
    readOnly,
    draggable,
    required,
    canCopyPaste,
    height = 500
}) {
    const theme = useSelector(state => state.theme);
    const isDarkTheme = theme === 'dark';
    const editorRef = useRef(null);

    const handleCopy = () => {
        const editorInstance = editorRef?.current?.editor;
        const selection = editorInstance?.selection?.getSel();
        let node = editorInstance?.getContent(); // get all content

        // or selected content
        if (selection && !selection?.isCollapsed) {
            node = editorInstance?.selection?.getContent();
        }

        return copyToClipboard(stripHtml(node))
            .then(() => {
                NotificationManager.success(
                    `${!selection?.isCollapsed ? 'Выделенный текст' : 'Текст'} успешно скопирован`, 'Скопировано!'
                );
            })
            .catch(() => {
                NotificationManager.error('При копировании конетна произошла ошибка', 'Ошибка');
            });
    };

    const handlePaste = () => {
        getFromClipboard()
            .then((text) => {
                if (!text?.length) return;
                const editorInstance = editorRef?.current?.editor;

                editorInstance.setContent(text);
            })
            .catch(() => {
                NotificationManager.error('Произошла ошибка при попытке чтения буфера обмена', 'Ошибка');
            });
    };

    return (
        <div {...cls('', {readOnly}, className)}>
            <div { ...cls('label-container') }>
                {label && (
                    <span
                        {...cls(
                            'label',
                            { error: required && (!content || !content.length) },
                            { 'drag-handle': draggable }
                        )}
                    >{label}</span>
                )}

                {canCopyPaste && (
                    <div { ...cls('label-right') }>
                        <Button
                            onClick={handleCopy}
                            title='Копировать текст'
                        >Копировать</Button>
                        <Button
                            onClick={handlePaste}
                            title='Вставить текст с заменой'
                        >Вставить</Button>
                    </div>
                )}
            </div>

            <Editor
                ref={editorRef}
                apiKey={TINY_MCE_KEY}
                value={content}
                disabled={readOnly}
                init={{
                    skin: isDarkTheme ? 'oxide-dark' : '',
                    content_css: isDarkTheme ? 'dark' : '',
                    height,
                    menubar: false,
                    entity_encoding: 'raw',
                    plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount'
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
