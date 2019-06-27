import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../Shared/Button/Button';
import './input-file.scss';
import {EventEmitter} from '../../../helpers';
import {EVENTS} from '../../../constants/Events';

const classes = new Bem('input-file');

export default class InputFile extends Component {
    static propTypes = {
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
        error: false,
        files: this.props.files || [],
        inProgress: false
    };

    componentDidMount() {
        EventEmitter.on(EVENTS.ON_VALIDATE, this.validate);
    }

    componentWillUnmount() {
        EventEmitter.off(EVENTS.ON_VALIDATE, this.validate);
    }

    handleChange = (event) => {
        const files = Array.from(event.target.files).map(file => file);

        this.props.onChange(files);
        this.setState({files, error: false});
    };

    validate = () => {
        const invalid = this.props.required && !this.state.files.length;

        this.setState({error: invalid});
        return EventEmitter.emit(invalid ? EVENTS.ON_VALIDATE_FAILURE : EVENTS.ON_VALIDATE_SUCCESS);
    };

    upload = () => {
        this.setState({inProgress: true});
    };

    render() {
        const {className, required, validateErrorMessage} = this.props;
        const {files, error} = this.state;

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

                <div {...classes('file-names')}>{files.map(file => file.name).join(', ')}</div>

                <input
                    ref={node => this.inputFile = node}
                    type="file"
                    {...classes('field')}
                    onChange={this.handleChange}
                />

                {error && (
                    <span {...classes('message')}>{validateErrorMessage}</span>
                )}
            </div>
        );
    }
}
