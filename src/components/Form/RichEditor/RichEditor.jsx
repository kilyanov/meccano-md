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
        onAfterChange: PropTypes.func,
        readonly: PropTypes.bool
    };

    static defaultProps = {
        onChange: () => {},
        onAfterChange: () => {}
    };

    constructor(props) {
        super(props);

        const generatedFontSizes = {};

        for (let i = 8; i <= 30; i++) {
            generatedFontSizes[i] = `${i} size`;
        }

        const fontSize = {
            name: 'Font Size',
            icon: 'fontsize',
            list: generatedFontSizes,
            exec: (editor, text, controls) => {
                editor.selection.applyCSS({
                    'font-size': `${Number(controls.args[0])}px`
                });
            },
            template: (key, value) => `<span>${value}</span>`
        };

        this.config = {
            _that: this,
            readonly: false,
            showCharsCounter: false,
            showWordsCounter: false,
            showXPathInStatusbar: false,
            allowResizeX: true,
            allowResizeY: true,

            beautifyHTML: false,
            beautifyHTMLCDNUrlsJS: [],
            askBeforePasteHTML: false,
            askBeforePasteFromWord: false,
            defaultActionOnPaste: 'insert_only_text',
            // cleanHTML: {
            // timeout: 300,
            // removeEmptyElements: false,
            // fillEmptyParagraph: false,
            // replaceNBSP: false,
            // cleanOnPaste: false,
            // replaceOldTags: {
            //     "strong": "b"
            // }
            // allowTags: false,
            // denyTags: false
            // },
            spellcheck: false,
            events: {
                afterGetValueFromEditor: (jodit, _that = this) => {
                    _that.props.onAfterChange(jodit.value);
                }

            },
            language: 'ru',
            i18n: {
                ru: {
                    'Type something': '??????????'
                }
            },
            buttons: [
                'source', 'bold', 'strikethrough', 'underline', 'italic', '|',
                'ul', 'ol', '|',
                'align', '|',
                'font', fontSize, 'brush', 'paragraph', '|',
                // 'link', '|',
                'undo', 'redo', 'hr', '\n'
            ],
            buttonsMD: [
                'source', 'bold', 'strikethrough', 'underline', 'italic', '|',
                'ul', 'ol', '|',
                'align', '|',
                'font', fontSize, 'brush', 'paragraph', '|',
                // 'link', '|',
                'undo', 'redo', 'hr', '\n'
            ],
            buttonsXS: [
                'bold', 'strikethrough', 'underline', '|',
                'ul', 'ol', '|',
                'fullsize'
            ]
        };
    }

    render() {
        const {content, label, className, readOnly, required} = this.props;

        return (
            <div {...cls('', {readOnly}, className)}>
                {label && <span {...cls('label', { required })}>{label}</span>}

                <Editor
                    ref={ref => this.jodit = ref}
                    readonly={readOnly}
                    value={content}
                    config={this.config}
                    onChange={value => this.props.onChange(value)}
                />
            </div>
        );
    }
}
