import React, { useRef, useCallback } from 'react';
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
import Button from "@components/Shared/Button/Button";
import { useSelector } from "react-redux";
import { NotificationManager } from "react-notifications";
import { StorageService } from "@services";
import { copyToClipboard, getFromClipboard, stripHtml } from "@helpers/Tools";

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
    canCopyPaste,
    height = 500
}) {
    const theme = useSelector(state => state.theme);
    const isDarkTheme = theme === 'dark';
    const editorRef = useRef(null);
    const editorInstance = editorRef?.current?.editor;

    const handleCopyToLocalBuffer = useCallback(() => {
        const selection = editorInstance?.selection?.getSel();
        let node = editorInstance?.getContent(); // get all content

        // or selected content
        if (selection && !selection?.isCollapsed) {
            node = editorInstance?.selection?.getContent();
        }

        StorageService.set('clipboard', JSON.stringify(node));

        onChange();
        NotificationManager
            .success(`${!selection?.isCollapsed ? 'Выделенный текст' : 'Текст'} успешно скопирован`, 'Скопировано!');
    }, [ editorInstance ]);

    const handlePasteFromLocalBuffer = () => {
        const data = StorageService.get('clipboard');

        try {
            const text = JSON.parse(data);

            if (!text?.length) return;

            editorInstance.setContent(text);
            onChange();
        } catch (e) {
            NotificationManager.error('Произошла ошибка при попытке чтения буфера обмена', 'Ошибка');
        }
    };

    const copyToGeneralBuffer = useCallback(() => {
        const selection = editorInstance?.selection?.getSel();
        let node = editorInstance?.getContent(); // get all content

        // or selected content
        if (selection && !selection?.isCollapsed) {
            node = editorInstance?.selection?.getContent();
        }

        return copyToClipboard(stripHtml(node))
            .then(() => {
                onChange();
                NotificationManager.success(
                    `${!selection?.isCollapsed ? 'Выделенный текст' : 'Текст'} успешно скопирован`, 'Скопировано!'
                );
            })
            .catch(() => {
                NotificationManager.error('При копировании конетна произошла ошибка', 'Ошибка');
            });
    }, [ editorInstance ]);

    const pasteFromGeneralBuffer = useCallback(() => {
        getFromClipboard()
            .then((text) => {
                if (!text?.length) return;

                editorInstance.insertContent(text);
                onChange();
            })
            .catch(() => {
                NotificationManager.error('Произошла ошибка при попытке чтения буфера обмена', 'Ошибка');
            });
    }, [ editorInstance ]);

    const handleChange = (e) => {
        if (e?.type === 'change' && e?.originalEvent) {
            onChange();
        }
    };

    const handleEditorChange = (value) => {
        onEditorChange(value);
    };

    if (editorInstance) {
        editorInstance.ui.registry.addMenuItem('TCopyPlugin', {
            type: 'item',
            text: 'Копировать',
            context: 'div',
            icon: 'copy',
            onAction: copyToGeneralBuffer
        });
        editorInstance.ui.registry.addMenuItem('TPastePlugin', {
            type: 'item',
            text: 'Вставить',
            context: 'div',
            icon: 'paste',
            onAction: pasteFromGeneralBuffer
        });
    }

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
                            onClick={handleCopyToLocalBuffer}
                            title='Копировать текст'
                        >Копировать</Button>
                        <Button
                            onClick={handlePasteFromLocalBuffer}
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
                    code_dialog_width: 300,
                    contextmenu: 'TCopyPlugin TPastePlugin'
                }}
                onEditorChange={handleEditorChange}
                onChange={handleChange}
            />
        </div>
    );
}
