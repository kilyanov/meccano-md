import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-date-picker';
import CalendarIcon from '../../Shared/SvgIcons/CalendarIcon';
import CloseIcon from '../../Shared/SvgIcons/CloseIcon';
import './input-date-picker.scss';

const cls = new Bem('input-date-picker');

export default class InputDatePicker extends Component {
    static propTypes = {
        label: PropTypes.string,
        value: PropTypes.instanceOf(Date),
        onChange: PropTypes.func,
        withClearBtn: PropTypes.bool,
        format: PropTypes.string
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
        const {withClearBtn, label, format} = this.props;
        const {value} = this.state;

        return (
            <div {...cls()}>
                <label {...cls('label')}>
                    {label && <span {...cls('label-text', '', 'drag-handle')}>{label}</span>}

                    <DatePicker
                        calendarIcon={<CalendarIcon/>}
                        clearIcon={withClearBtn ? <CloseIcon/> : null}
                        value={value}
                        onChange={this.handleChange}
                        locale='ru-RU'
                        format={format}
                    />
                </label>
            </div>
        );
    }
}
