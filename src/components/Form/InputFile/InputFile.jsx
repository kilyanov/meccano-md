import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../Shared/Button/Button';
import './input-file.scss';

const classes = new Bem('input-file');

export default class InputFile extends Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired
    };

    state = {
        files: [],
        inProgress: false
    };

    handleChange = (event) => {
        const files = Array.from(event.target.files).map(file => file);

        this.props.onChange(files);
        this.setState({files});
    };

    upload = () => {
        this.setState({inProgress: true});
    };

    render() {
        const {files} = this.state;

        return (
            <div {...classes()}>
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
            </div>
        );
    }
}
