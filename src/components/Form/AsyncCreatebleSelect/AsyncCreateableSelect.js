import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import AsyncCreatable from "react-select/async-creatable";
import AsyncSelect from "react-select/async";
import { components } from 'react-select';
import { ReactSelectStyles } from "@const/ReactSelectStyles";
import { connect } from "react-redux";
import { EVENTS, THEME_TYPE } from "@const";
import BEMHelper from "react-bem-helper";
import { EventEmitter } from "../../../helpers";
import PencilIcon from "@components/Shared/SvgIcons/PencilIcon";

const cls = new BEMHelper('select');
const SingleValue = ({ children, ...props }) => (
    <components.SingleValue {...props}>
        <div title={children}>{children}</div>
    </components.SingleValue>
);

class AsyncCreatableSelect extends Component {
    state = {
        loadedOptions: this.props.loadedOptions || [],
        currentOption: {},
        inputValue: '',
        editMode: false,
        isError: false,
        inProgress: true
    };

    componentDidMount() {
        const { required, requestService, selected } = this.props;

        if (required) {
            EventEmitter.on(EVENTS.FORM.ON_VALIDATE, this.validate);
        }

        if (requestService) {
            if (!this.props.loadedOptions) {
                this.getOptions('', () => {}, false);
            }

            if (selected) {
                requestService({ 'query[id]': selected }).then(response => {
                    if (response && response.data && response.data.length) {
                        const { name, id } = response.data[0];
                        this.setState({
                            currentOption: { label: name, value: id },
                            inProgress: false
                        });
                    }
                });
            }
        }
    }

    componentDidUpdate() {
        const { selected, requestService } = this.props;
        const { currentOption, loadedOptions, inProgress } = this.state;

        if (currentOption && selected !== currentOption.value) {
            if (!selected) {
                if (!_.isEmpty(currentOption)) {
                    this.setState({ currentOption: {}, inProgress: false });
                }
            } else {
                const found = loadedOptions.find(({ value }) => value === selected);

                if (found) {
                    this.setState({ currentOption: found, inProgress: false });
                } else if (requestService && !inProgress) {
                    this.setState({ inProgress: true }, () => {
                        requestService({ 'query[id]': selected }).then(response => {
                            if (response && response.data && response.data.length) {
                                const { name, id } = response.data[0];
                                this.setState({ currentOption: { label: name, value: id }, inProgress: false });
                            }
                        });
                    });
                }
            }
        }
    }

    handleSelect = (option) => {
        this.props.onChange(option);
        this.setState({
            currentOption: option,
            isError: false,
            inputValue: ''
        });
    };

    handleBlur = () => {
        if (this.props.onBlur) {
            this.props.onBlur();
        }
        if (!this.state.currentOption) {
            this.getOptions();
        }
    };

    getOptions = (inputValue = '', callback = () => {}, cancelLastRequest = true) => {
        const { requestService, requestCancelService, extendRequestForm } = this.props;
        let form = {};

        if (requestCancelService && cancelLastRequest) {
            requestCancelService();
        }

        if (inputValue) {
            form['query[name]'] = inputValue;
        }

        if (extendRequestForm) {
            form = { ...form, ...extendRequestForm };
        }

        return requestService(form).then(({ data }) => {
            const opt = data.map(option => ({
                label: _.get(option, 'name'),
                value: _.get(option, 'id')
            }));

            this.setState({ loadedOptions: opt, inProgress: false });
            callback(opt);
            return opt;
        });
    };

    validate = () => {
        const { required } = this.props;
        const { currentOption } = this.state;
        const invalid = required && !currentOption || (currentOption instanceof Array && !currentOption.length);

        this.setState({ isError: invalid });
        return EventEmitter.emit(invalid ? EVENTS.FORM.ON_VALIDATE_FAILURE : EVENTS.FORM.ON_VALIDATE_SUCCESS);
    };

    editMode = false

    render() {
        const { loadedOptions, currentOption, isError } = this.state;
        const {
            autoFocus,
            className,
            readOnly,
            disabled,
            required,
            menuPosition = 'absolute',
            validateErrorMessage = 'Поле обязательно для заполнения',
            label,
            draggable,
            theme,
            canCreate = true,
            onlyValue,
            onKeyDown,
            onCreateOption = () => {}
        } = this.props;
        const isDarkTheme = theme === THEME_TYPE.DARK;
        const selectProps = {
            autoFocus,
            cacheOptions: true,
            defaultOptions: loadedOptions,
            loadOptions: _.debounce(this.getOptions, 1000),
            onChange: this.handleSelect,
            onInputChange: (val, payload) => {
                if (payload?.action === 'input-change') {
                    this.setState({ inputValue: val });
                }
            },
            inputValue: this.state.inputValue,
            onBlur: this.handleBlur,
            onKeyDown,
            value: currentOption,
            formatCreateLabel: (inputValue) => `Создать "${inputValue.trim()}"`,
            menuPosition,
            classNamePrefix: 'select',
            createOptionPosition: 'first',
            isDisabled: readOnly || disabled,
            placeholder: 'Выберите...',
            isClearable: true,
            styles: ReactSelectStyles(isDarkTheme),
            loadingMessage: () => 'Загрузка...',
            noOptionsMessage: () => 'Нет результатов',
            components: { SingleValue },
            isValidNewOption: (inputValue, _, selectOption) => {
                return selectOption.every((item) => item.label !== inputValue && inputValue.length);
            },
            onCreateOption: (value) => {
                onCreateOption(value);
                this.handleSelect({
                    label: value.trim(),
                    value: value.trim(),
                    __isNew__: true
                });
            }
        };

        return (
            <div
                {...cls('', {
                    error: isError,
                    disabled,
                    validated: required,
                    succeed: !!currentOption && !!currentOption.value,
                    onlyValue
                }, { [className]: !!className })}
            >
                {(this.props.editable && !!currentOption?.label) && (
                    <button
                        { ...cls('edit-btn') }
                        type='button'
                        onClick={() => {
                            this.setState({ inputValue: currentOption.label }, () => {
                                this.selectRef.focus();
                                const $domNode = ReactDOM.findDOMNode(this.selectRef);

                                if ($domNode) {
                                    const $input = $domNode.querySelector('input');

                                    if ($input) {
                                        $input.focus();
                                        $input.style.maxWidth = '100%';
                                        $input.style.opacity = '1';
                                        // Scroll text to end
                                        // $input.scrollLeft = $input.scrollWidth;
                                        // $input.setSelectionRange(currentOption.label.length, currentOption.label.length);
                                    }
                                }
                            });
                        }}
                    ><PencilIcon /></button>
                )}
                <label
                    {...cls('label', { required: required && (!currentOption || !currentOption.value) })}
                    title={required ? 'Обязательное поле' : ''}
                >
                    {(label && !onlyValue) && (
                        <span {...cls('label-text', '', { 'drag-handle': draggable })}>
                            {label}
                        </span>
                    )}

                    {canCreate
                        ? <AsyncCreatable ref={ref => this.selectRef = ref} {...selectProps} className='CREATE' />
                        : <AsyncSelect {...selectProps} className='NONCREATE'/>
                    }
                </label>

                {isError && <span {...cls('message')}>{validateErrorMessage}</span>}
            </div>
        );
    }
}

export default connect(({ theme }) => ({ theme }))(AsyncCreatableSelect);
