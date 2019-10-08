import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Select from 'react-select/async-creatable';
import {EventEmitter} from '../../../helpers';
import {EVENTS} from '../../../constants/Events';
import './input-tags.scss';
import {THEME_TYPE} from '../../../constants/ThemeType';

const cls = new Bem('input-tags');

class InputTags extends Component {
    static propTypes = {
        required: PropTypes.bool,
        theme: PropTypes.string.isRequired
    };

    state = {
        defaultOptions: []
    };

    componentDidMount() {
        this.getDefaultOptions();
        EventEmitter.on(EVENTS.FORM.ON_VALIDATE, this.validate);
    }

    componentWillUnmount() {
        EventEmitter.off(EVENTS.FORM.ON_VALIDATE, this.validate);
    }

    getDefaultOptions = () => {
        if (!this.props.requestService) return;

        this.props.requestService().then(response => {
            const defaultOptions = response.data.map(({id, name}) => ({value: id, label: name}));

            this.setState({defaultOptions});
        });
    };

    onLoadOptions = (value) => {
        if (!this.props.requestService) return;

        return this.props.requestService({'query[name]': value}).then(response => {
            return response.data.map(({id, name}) => ({value: id, label: name}));
        });
    };

    validate = () => {
        const invalid = this.props.required && !this.props.value;

        this.setState({error: invalid, opened: false});
        return EventEmitter.emit(invalid ? EVENTS.FORM.ON_VALIDATE_FAILURE : EVENTS.FORM.ON_VALIDATE_SUCCESS);
    };

    render() {
        const {label, theme, onChange} = this.props;
        const {defaultOptions} = this.state;
        const isDarkTheme = theme === THEME_TYPE.DARK;

        return (
            <div {...cls('', {succeed: !!this.props.value.length})}>
                {label && (
                    <label {...cls('label', '', 'drag-handle')}>
                        <span {...cls('label-text', '', 'drag-handle')}>{label}</span>
                    </label>
                )}

                <Select
                    {...cls('field')}
                    placeholder={'Начните вводить текст...'}
                    isMulti
                    isSearchable
                    onChange={onChange}
                    defaultOptions={defaultOptions}
                    loadingMessage={() => 'Загрузка...'}
                    noOptionsMessage={() => 'Нет элементов'}
                    loadOptions={this.onLoadOptions}
                    styles={{
                        control: (provided, state) => {
                          console.log(state);
                          return {
                            ...provided,
                              borderRadius: 0,
                              minHeight: 40,
                              backgroundColor: isDarkTheme ? '#313131' : '#fff',
                              '&:hover, &:active': {
                                borderColor: '#b2b2b2',
                                boxShadow: 'none'
                              }
                            }
                        },
                        placeholder: (provided) => ({
                            ...provided,
                            fontSize: 15,
                            color: '#999'
                        }),
                        menu: (provided) => ({
                            ...provided,
                            backgroundColor: isDarkTheme ? '#313131' : '#fff',
                        }),
                        option: (provided) => ({
                            ...provided,
                            backgroundColor: isDarkTheme ? '#313131': '#DEEBFF',
                            '&:hover, &:active, &:focus': {
                                backgroundColor: isDarkTheme ? '#525252' : '#DEEBFF'
                            }
                        })
                    }}
                />
            </div>
        );
    }
}

export default connect(({theme}) => ({theme}))(InputTags);
