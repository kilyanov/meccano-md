import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tinymce from 'tinymce';
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

import BEMHelper from 'react-bem-helper';
import './tiny-mce.scss';

const cls = new BEMHelper('tiny-mce');

export default class TinyMceLocal extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        className: PropTypes.string,
        content: PropTypes.any,
        label: PropTypes.string,
        onEditorChange: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        readOnly: PropTypes.bool,
        draggable: PropTypes.bool,
        required: PropTypes.bool,
        height: PropTypes.number
    }

    static defaultProps = {
        height: 500
    }

    constructor(props) {
        super(props);

        this.state = { editor: null };
    }

    componentDidMount() {
        tinymce.init({
            height: this.props.height,
            menubar: false,
            selector: `#${this.props.id}`,
            entity_encoding: 'raw',
            plugins: 'advlist autolink lists link image charmap print preview anchor' +
                'searchreplace visualblocks code fullscreen' +
                'insertdatetime media table paste code help wordcount paste',
            setup: (editor) => {
                editor.on('keyup change', () => {
                    const cnt = editor.getContent();

                    this.setState({ editor });
                    this.props.onEditorChange(cnt);
                });
            },
            toolbar: 'undo redo | formatselect | bold italic backcolor | \ ' +
                'alignleft aligncenter alignright alignjustify | \ ' +
                'bullist numlist outdent indent | removeformat | code help',
            paste_as_text: true,
            code_dialog_height: 200,
            code_dialog_width: 300
        });
    }

    componentWillUnmount() {
        tinymce.remove(this.state.editor);
    }

    render() {
        const { readOnly, className, label, required, content, draggable, id, onChange } = this.props;

        return (
            <div {...cls('', { readOnly }, className)}>
                {label && (
                    <span
                        {...cls(
                            'label',
                            { error: required && (!content || !content.length) },
                            { 'drag-handle': draggable }
                        )}
                    >{label}</span>
                )}

                <textarea
                    id={id}
                    onChange={onChange}
                    value={content}
                />
            </div>
        );
    }
}
