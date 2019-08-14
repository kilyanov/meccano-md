import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../Shared/Button/Button';
import './input-file.scss';
import {EventEmitter} from '../../../helpers';
import {EVENTS} from '../../../constants/Events';
import DownloadIcon from '../../Shared/SvgIcons/DownloadIcon';
import {saveAs} from 'file-saver';
import {FileService} from '../../../services/FileService';

const classes = new Bem('input-file');

export default class InputFile extends Component {
    static propTypes = {
        accept: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        className: PropTypes.string,
        required: PropTypes.bool,
        files: PropTypes.array,
        onChange: PropTypes.func.isRequired,
        validateErrorMessage: PropTypes.string
    };

    static defaultProps = {
        validateErrorMessage: 'Поле обязательно для заполнения'
    };

    state = {
        accept: '',
        error: false,
        files: this.props.files || [],
        inProgress: false
    };

    componentDidMount() {
        EventEmitter.on(EVENTS.FORM.ON_VALIDATE, this.validate);
    }

    componentWillUnmount() {
        EventEmitter.off(EVENTS.FORM.ON_VALIDATE, this.validate);
    }

    handleDelete = (fileIndex) => {
        const newState = this.state;

        newState.files.splice(fileIndex, 1);
        this.props.onChange(newState.files);
        this.setState(newState);
    };

    handleChange = (event) => {
        const files = Array.from(event.target.files).map(file => file);

        this.props.onChange(files);
        this.setState({files, error: false});
    };

    handleDownloadFile = (file) => {
        this.setState({inProgress: true}, () => {
            FileService
                .download({id: file.id, isTemplate: 1})
                .then(response => {
                    const blob = new Blob([response.data], {type: 'application/octet-stream'});

                    saveAs(blob, response.headers['x-filename']);
                    this.setState({inProgress: false});
                })
                .catch(() => this.setState({inProgress: false}));
        });
    };

    validate = () => {
        const invalid = this.props.required && !this.state.files.length;

        this.setState({error: invalid});
        return EventEmitter.emit(invalid ? EVENTS.FORM.ON_VALIDATE_FAILURE : EVENTS.FORM.ON_VALIDATE_SUCCESS);
    };

    renderFile = (file, fileIndex) => (
        <div {...classes('file')} key={fileIndex}>
            <span
                {...classes('file-name', {'downloading': !!file.url})}
                title='Скачать файл'
                onClick={() => this.handleDownloadFile(file)}
            >
                <DownloadIcon {...classes('download-icon')}/>
                {file.name}
            </span>
            <button
                type='button'
                {...classes('file-button')}
                title='Удалить файл'
                onClick={() => this.handleDelete(fileIndex)}
            >✕</button>
        </div>
    );

    render() {
        const {accept, className, required, validateErrorMessage} = this.props;
        const {files, error} = this.state;
        const acceptMIME = accept instanceof Array ? accept.join(', ') : accept;

        return (
            <div {...classes('', {error}, {
                validated: required,
                [className]: !!className
            })}
            >
                <Button
                    {...classes('button')}
                    text="Выберите файл"
                    style='inline'
                    onClick={() => this.inputFile.click()}
                />

                <div {...classes('file-list')}>{files.map(this.renderFile)}</div>

                <input
                    {...classes('field')}
                    ref={node => this.inputFile = node}
                    type="file"
                    accept={acceptMIME}
                    onChange={this.handleChange}
                />

                {error && (
                    <span {...classes('message')}>{validateErrorMessage}</span>
                )}
            </div>
        );
    }
}
