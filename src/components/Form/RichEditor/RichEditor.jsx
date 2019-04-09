import React, {Component} from 'react';
import 'jodit';
import PropTypes from 'prop-types';
import Editor from 'jodit-react';
import '../../../../node_modules/jodit/build/jodit.min.css';
import './rich-editor.scss';

const classes = new Bem('rich-editor');

export default class RichEditor extends Component {
    static propTypes = {
        className: PropTypes.string,
        content: PropTypes.string,
        label: PropTypes.string,
        onChange: PropTypes.func
    };

    static defaultProps = {
        onChange: () => {}
    };

    config = {
        readonly: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        language: 'ru',
        i18n: {
            ru: {
                'Type something': 'Текст'
            }
        },
        buttons: [
            'source', 'bold', 'strikethrough', 'underline', 'italic', '|',
            'ul', 'ol', '|',
            'align', '|',
            'font', 'fontsize', 'brush', 'paragraph', '|',
            // 'link', '|',
            'undo', 'redo', 'hr', '\n'
        ],
        buttonsMD: [
            'source', 'bold', 'strikethrough', 'underline', 'italic', '|',
            'ul', 'ol', '|',
            'align', '|',
            'font', 'fontsize', 'brush', 'paragraph', '|',
            // 'link', '|',
            'undo', 'redo', 'hr', '\n'
        ],
        buttonsXS: [
            'bold', 'strikethrough', 'underline', '|',
            'ul', 'ol', '|',
            'fullsize'
        ]
    };

    render() {
        const {content, label, className} = this.props;

        return (
            <div {...classes('', '', className)}>
                {label && <span {...classes('label')}>{label}</span>}

                <Editor
                    value={content}
                    config={this.config}
                    onChange={value => this.props.onChange(value)}
                />
            </div>
        );
    }
}
