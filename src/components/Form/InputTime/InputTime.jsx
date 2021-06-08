import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {InitScrollbar} from '../../../helpers/Tools';
import './input-time.scss';

const cls = new Bem('input-time');

export default class InputTime extends React.Component {
    static propTypes = {
        value: PropTypes.string,
        format: PropTypes.string,
        startTime: PropTypes.string,
        onChange: PropTypes.func,
        onOpen: PropTypes.func,
        onClose: PropTypes.func,
        openOnFocus: PropTypes.bool,
        minutesStep: PropTypes.number,
        disabled: PropTypes.bool,
        disableOldTime: PropTypes.bool,
        filter: PropTypes.bool,
        defaultValue: PropTypes.string,
        readOnly: PropTypes.bool
    };

    static defaultProps = {
        defaultValue: '00:00',
        format: 'HH:mm',
        openOnFocus: true,
        minutesStep: 5,
        onChange: () => {},
        onOpen: () => {},
        onClose: () => {}
    };

    constructor(props) {
        super(props);

        const hours = [];
        const minutes = [];

        for (let i = 8; i < 24; i++) hours.push(i < 10 ? `0${i}` : `${i}`);
        for (let j = 0; j < 60; j += props.minutesStep) minutes.push(j < 10 ? `0${j}` : `${j}`);

        this.keys = {
            enter: 13,
            esc: 27,
            up: 38,
            left: 37,
            right: 39,
            down: 40,
            tab: 9
        };
        this.state = {
            value: moment(props.value || props.defaultValue, props.format),
            error: false,
            isOpen: false,
            focused: false,
            time: {
                hours,
                minutes
            }
        };
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside);
    }

    componentDidUpdate() {
        this.initScrollbars();
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    }

    static getDerivedStateFromProps = (nextProps, prevState) => {
        if (nextProps.value && nextProps.value !== prevState.value.format(nextProps.format)) {
            return {value: moment(nextProps.value, nextProps.format)};
        }

        return null;
    };

    handleClickOutside = (event) => {
        const domNode = ReactDOM.findDOMNode(this);

        if (!domNode || !domNode.contains(event.target)) {
            this.setState({isOpen: false, focused: false});
        }
    };

    handleChange = (value, type) => {
        const time = this.state.value;

        if (type === 'hour') time.hour(value);
        if (type === 'minute') time.minute(value);

        this.setState({value: time}, () => {
            this.props.onChange(time);
            if (type === 'minute') this.close();
            else this.focusMinuteList();
        });
    };

    handleChangeInput = (e) => {
        let value = e.target.value;
        const time = this.state.value;

        if (value.length > 4) value = value.substr(1, 5);
        const parseValue = InputTime.parseTime(value);

        if (parseValue) {
            time.hour(parseValue.hour);
            time.minute(parseValue.minute);

            this.setState({value: time});
        }
    };

    handleBlurInput = () => {
        // TODO: Вся обработка
    };

    handleInputKeyDown = (e) => {
        const key = e.keyCode;
        const {isOpen} = this.state;

        if ((key === this.keys.down || key === this.keys.enter) && !isOpen) {
            this.open();
            this.focusHourList();
        }
        if (key === this.keys.down && isOpen) {
            e.preventDefault();
            this.focusHourList();
        }
        if (key === this.keys.enter && isOpen) this.close();
        if (key === this.keys.esc) {
            e.preventDefault();
            this.close();
        }
        if (key === this.keys.tab) {
            this.close();
        }
    };

    handleListItemKeyDown = (e) => {
        const hourListIsFocused = this.state.focused === 'hourList';
        const minuteListIsFocused = this.state.focused === 'minuteList';
        const $list = hourListIsFocused ? $(this.hourList) : $(this.minuteList);
        const $selected = $list.find('li:focus');
        const time = this.state.value;
        const value = $selected.text();

        switch (e.keyCode) {
            case this.keys.down:
                e.preventDefault();
                if (!!$selected.next().length) {
                    $selected.next().focus();
                } else {
                    $list.children().first().focus();
                }
                break;
            case this.keys.up:
                e.preventDefault();
                if (!!$selected.prev().length) {
                    $selected.prev().focus();
                } else {
                    $list.children().last().focus();
                }
                break;
            case this.keys.right:
                e.preventDefault();
                if (hourListIsFocused) {
                    this.focusMinuteList();
                }
                break;
            case this.keys.left:
                e.preventDefault();
                if (minuteListIsFocused) {
                    this.focusHourList();
                }
                break;
            case this.keys.esc:
                e.preventDefault();
                this.close();
                break;
            case this.keys.enter:
                if (hourListIsFocused) time.hour(value);
                else time.minute(value);

                this.props.onChange(time);

                this.setState({value: time}, () => {
                    if (hourListIsFocused) {
                        this.focusMinuteList();
                    } else this.close();
                });
                break;
            default:
                this.close();
        }
    };

    open = () => {
        this.setState({isOpen: true}, this.props.onOpen);
    };

    close = () => {
        this.setState({
            isOpen: false,
            focused: false
        }, () => {
            this.props.onClose();
        });

        this.input.focus();
    };

    focusHourList = () => {
        if (this.hourList) {
            const selected = this.hourList.querySelector('li:focus');

            if (selected) selected.focus();
            else this.hourList.querySelector('li:first-child').focus();

            this.setState({focused: 'hourList'});
        }
    };

    focusMinuteList = () => {
        if (this.minuteList) {
            const selected = this.minuteList.querySelector('li:focus');

            if (selected) selected.focus();
            else this.minuteList.querySelector('li:first-child').focus();

            this.setState({focused: 'minuteList'});
        }
    };

    static parseTime = (string) => {
        const str = string.replace(/:/g, '');

        let time = `${str.substr(0, 2)}:${str.substr(2, 2)}`;

        time = time.split(':');
        const value = {hour: '08', minute: '00'};

        if (time.length === 2) {
            value.hour = time[0];
            value.minute = time[1];
        }

        return value;
    };

    initScrollbars = () => {
        InitScrollbar(this.hourList);
        InitScrollbar(this.hourList);
    };

    render() {
        const {isOpen, time, error, focused, value, readOnly, onKeyPress} = this.state;
        const {
            autoFocus,
            placeholder,
            className,
            label,
            openOnFocus,
            disabled,
            required,
            validateErrorMessage,
            draggable,
            onKeyDown
        } = this.props;
        const isFocused = this.inputRef === document.activeElement;
        const isError = error; // && !isFocused
        const isSucceed = !!value && !isError;
        const isEmpty = !value.length;

        return (
            <div
                {...cls('', {
                    error: isError,
                    focused: isFocused,
                    succeed: isSucceed,
                    empty: isEmpty,
                    readOnly
                }, className)}
                title={label}
                onClick={() => !isOpen && this.open()}
            >
                <label {...cls('label', { required })}>
                    {label && <span {...cls('label-text', '', { 'drag-handle': draggable })}>{label}</span>}

                    <input
                        autoFocus={autoFocus}
                        readOnly={readOnly}
                        placeholder={placeholder}
                        {...cls('field', {active: focused})}
                        type='text'
                        ref={node => this.input = node}
                        value={value.format('HH:mm')}
                        onFocus={() => {
                            if (openOnFocus && !isOpen && !disabled) this.open();
                        }}
                        onClick={() => !isOpen && this.open()}
                        disabled={disabled}
                        // onKeyDown={this.handleInputKeyDown}
                        onChange={this.handleChangeInput}
                        onBlur={this.handleBlurInput}
                        onKeyDown={onKeyDown}
                    />

                    {(isError && !isEmpty) && (
                        <div
                            {...cls('clear')}
                            onClick={this.handleClear}
                        />
                    )}

                    {(isError && validateErrorMessage) && (
                        <span {...cls('message')}>{validateErrorMessage}</span>
                    )}

                </label>

                {isOpen && (
                    <div {...cls('picker')} ref={node => this.picker = node}>
                        <div {...cls('picker-select-panel')}>
                            <ul
                                {...cls('picker-list')}
                                ref={node => this.hourList = node}
                                tabIndex='0'
                            >
                                {time.hours.map((hour, index) => {
                                    const isActive = hour === value.format('HH');

                                    return (
                                        <li
                                            key={index}
                                            {...cls('picker-list-item', {
                                                active: isActive && !focused
                                            })}
                                            tabIndex='-1'
                                            onClick={this.handleChange.bind(null, hour, 'hour')}
                                            // onKeyDown={this.handleListItemKeyDown}
                                        >
                                            {hour}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div {...cls('picker-select-panel')}>
                            <ul
                                {...cls('picker-list')}
                                ref={node => this.minuteList = node}
                                tabIndex='0'
                            >
                                {time.minutes.map((minute, index) => {
                                    const isActive = minute === value.format('mm');

                                    return (
                                        <li
                                            key={index}
                                            {...cls('picker-list-item', {
                                                active: isActive && !focused
                                            })}
                                            tabIndex='-1'
                                            onClick={this.handleChange.bind(null, minute, 'minute')}
                                            onKeyDown={this.handleListItemKeyDown}
                                            onKeyPress={onKeyPress}
                                        >
                                            {minute}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
