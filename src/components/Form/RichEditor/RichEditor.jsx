import React, {Component} from 'react';
import 'jodit';
import PropTypes from 'prop-types';
import Editor from 'jodit-react';
import '../../../../node_modules/jodit/build/jodit.min.css';
import './rich-editor.scss';

const cls = new Bem('rich-editor');

export default class RichEditor extends Component {
    static propTypes = {
        className: PropTypes.string,
        content: PropTypes.string,
        label: PropTypes.string,
        onChange: PropTypes.func,
        onAfterChange: PropTypes.func
    };

    static defaultProps = {
        onChange: () => {},
        onAfterChange: () => {}
    };

    config = {
        _that: this,
        readonly: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        allowResizeX: true,
        allowResizeY: true,

        beautifyHTML: false,
        beautifyHTMLCDNUrlsJS: [],
        cleanHTML: {
            timeout: 300,
            removeEmptyElements: false,
            fillEmptyParagraph: false,
            replaceNBSP: false,
            cleanOnPaste: false,
            replaceOldTags: {},
            allowTags: false,
            denyTags: false
        },
        spellcheck: false,
        events: {
            afterGetValueFromEditor: (jodit, _that = this) => {
                _that.props.onAfterChange(jodit.value);
            }

        },
        // afterInit: e => console.log(e),

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
            <div {...cls('', '', className)}>
                {label && <span {...cls('label')}>{label}</span>}

                <Editor
                    ref={ref => this.jodit = ref}
                    value={content}
                    config={this.config}
                    onChange={value => this.props.onChange(value)}
                />
            </div>
        );
    }
}
