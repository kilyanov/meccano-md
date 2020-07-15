import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datetime-picker';
import CalendarIcon from '../../Shared/SvgIcons/CalendarIcon';
import './input-date-picker.scss';

const cls = new Bem('input-date-picker');

export default class InputDateTimePicker extends Component {
    static propTypes = {
        className: PropTypes.string,
        label: PropTypes.string,
        value: PropTypes.instanceOf(Date),
        onChange: PropTypes.func,
        clearable: PropTypes.bool,
        format: PropTypes.string,
        readOnly: PropTypes.bool,
        disabled: PropTypes.bool
    };

    static defaultProps = {
        onChange: () => {},
        format: 'dd.MM.y HH:mm'
    };

    render() {
        const { className, clearable, label, format, readOnly, disabled, draggable, value } = this.props;

        return (
            <div {...cls('', { readOnly: readOnly || disabled }, className)}>
                <label {...cls('label')}>
                    {label && <span {...cls('label-text', '', { 'drag-handle': draggable })}>{label}</span>}

                    <DatePicker
                        calendarIcon={<CalendarIcon/>}
                        clearIcon={clearable && value ? <i {...cls('icon')}>✕</i> : null} // <CloseIcon/>
                        value={value}
                        readOnly={readOnly || disabled}
                        onChange={this.props.onChange}
                        locale='ru-RU'
                        format={format}
                    />
                </label>
            </div>
        );
    }
}
