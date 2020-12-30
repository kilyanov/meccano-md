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

    state = {
        isDisabledTabbing: true
    }

    handleEnableTabbing = (e) => {
        if (this.state.isDisabledTabbing) {
            this.setState({ isDisabledTabbing: false });
        }
    }

    handleDisableTabbing = () => {
        if (!this.state.isDisabledTabbing) {
            setTimeout(() => this.setState({ isDisabledTabbing: true }), 0);
        }
    }

    render() {
        const { className, clearable, label, format, readOnly, disabled, draggable, value } = this.props;
        const { isDisabledTabbing } = this.state;

        return (
            <div
                {...cls('', { readOnly: readOnly || disabled }, className)}
                onClick={this.handleEnableTabbing}
            >
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
                        disableCalendar={isDisabledTabbing}
                        disableClock={isDisabledTabbing}
                        onCalendarClose={this.handleDisableTabbing}
                        onClockClose={this.handleDisableTabbing}
                    />
                </label>
            </div>
        );
    }
}
