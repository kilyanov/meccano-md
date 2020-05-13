import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-date-picker';
import CalendarIcon from '../../Shared/SvgIcons/CalendarIcon';
// import CloseIcon from '../../Shared/SvgIcons/CloseIcon';
import './input-date-picker.scss';

const cls = new Bem('input-date-picker');

export default class InputDatePicker extends Component {
    static propTypes = {
        className: PropTypes.string,
        label: PropTypes.string,
        value: PropTypes.instanceOf(Date),
        onChange: PropTypes.func,
        clearable: PropTypes.bool,
        format: PropTypes.string,
        readOnly: PropTypes.bool
    };

    static defaultProps = {
        onChange: () => {},
        format: 'dd.MM.y'
    };

    state = {
        value: this.props.value || ''
    };

    handleChange = (value) => {
        this.setState({value});
        this.props.onChange(value);
    };

    render() {
        const {className, clearable, label, format, readOnly, draggable} = this.props;
        const {value} = this.state;

        return (
            <div {...cls('', {readOnly}, className)}>
                <label {...cls('label')}>
                    {label && <span {...cls('label-text', '', { 'drag-handle': draggable })}>{label}</span>}

                    <DatePicker
                        calendarIcon={<CalendarIcon/>}
                        clearIcon={clearable && value ? <i {...cls('icon')}>✕</i> : null} // <CloseIcon/>
                        value={value}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                        locale='ru-RU'
                        format={format}
                    />
                </label>
            </div>
        );
    }
}
