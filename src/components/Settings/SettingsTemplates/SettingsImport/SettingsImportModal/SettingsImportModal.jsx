import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../../../Shared/ConfirmModal/ConfirmModal';
import './settings-import-modal.scss';
import InputText from '../../../../Form/InputText/InputText';
import Select from '../../../../Form/Select/Select';
import TransferService from '../../../../../services/TransferService';
import Form from '../../../../Form/Form/Form';
import Loader from '../../../../Shared/Loader/Loader';
import {NotificationManager} from 'react-notifications';

const classes = new Bem('settings-import-modal');

export default class SettingsImportModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        item: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.defaultForm = {
            name: '',
            item: '',
            type: '',
            itemsContainer: '',
            rules: [],
            joins: []
        };
        this.defaultRule = {
            field_name: '',
            path_value: ''
        };
        this.defaultJoin = {
            name: '',
            value: ''
        };
        this.state = {
            form: props.item || {...this.defaultForm},
            types: [],
            inProgress: true
        };
    }

    componentDidMount() {
        TransferService.type.get().then(response => {
            this.setState({
                types: response.data.map(({name}) => ({name, value: name})),
                inProgress: false
            });
        }).catch(() => this.setState({inProgress: false}));
    }

    handleChangeForm = (value, prop) => {
        const newState = this.state;

        newState.form[prop] = value;
        this.setState(newState);
    };

    handleAddRule = () => {
        const {form: {rules}} = this.state;
        const hasEmpty = rules.some(rule => !rule.field_name || !rule.path_value);

        if (!hasEmpty) {
            this.setState(prev => prev.form.rules.push({...this.defaultRule}));
        }
    };

    handleChangeRule = (value, prop, index) => {
        this.setState(prev => prev.form.rules[index][prop] = value);
    };

    handleDeleteRule = (index) => {
        const newState = this.state;

        newState.form.rules.splice(index, 1);

        this.setState(newState);
    };

    handleAddJoin = () => {
        const {form: {joins}} = this.state;
        const hasEmpty = joins.some(join => !join.name || !join.value);

        if (!hasEmpty) {
            this.setState(prev => prev.form.joins.push({...this.defaultJoin}));
        }
    };

    handleChangeJoin = (value, prop, index) => {
        this.setState(prev => prev.form.joins[index][prop] = value);
    };

    handleDeleteJoin = (index) => {
        const newState = this.state;

        newState.form.joins.splice(index, 1);

        this.setState(newState);
    };

    handleSubmit = () => {
        const form = {...this.state.form};
        const method = form.id ? 'update' : 'set';

        delete form.id;
        delete form.createdAt;
        delete form.updatedAt;
        delete form.value;
        delete form.slug;


        if (!form.rules.length) return NotificationManager.error('Не заполнены "Правила"', 'Ошибка');
        if (!form.rules.every(item => item.field_name && item.path_value)) {
            return NotificationManager.error('Не верно заполнены поля "Правила"', ' Ошибка');
        }

        if (!form.joins.length) return  NotificationManager.error('Не заполнено "Объединение полей"', 'Ошибка');
        if (!form.joins.every(item => item.name && item.value)) {
            return NotificationManager.error('Не верно заполнены поля "Объединение полей"', ' Ошибка');
        }

        this.setState({inProgress: true}, () => {
            TransferService.import[method](form, this.state.form.id).then(response => {
                NotificationManager.success('Успешно сохранено', 'Сохранено');
                this.setState({
                    form: {...this.defaultForm},
                    inProgress: false
                });
                this.props.onSubmit(response.data, method);
                this.props.onClose();
            }).catch(() => this.setState({inProgress: false}));
        });
    };

    renderRule = (rule, ruleIndex) => (
        <div {...classes('rule')}  key={ruleIndex}>
            <div {...classes('rule-row', '', 'row')}>
                <div {...classes('item', '', 'col-xs-6')}>
                    <InputText
                        autoFocus
                        label='Элемент'
                        value={rule.field_name}
                        onChange={val => this.handleChangeRule(val, 'field_name', ruleIndex)}
                    />
                </div>
                <div {...classes('item', '', 'col-xs-6')}>
                    <InputText
                        label='Селектор'
                        value={rule.path_value}
                        onChange={val => this.handleChangeRule(val, 'path_value', ruleIndex)}
                    />
                </div>
            </div>
            <div {...classes('rule-buttons')}>
                <button
                    {...classes('button', 'remove')}
                    onClick={() => this.handleDeleteRule(ruleIndex)}
                >✕</button>
            </div>
        </div>
    );

    renderJoin = (join, joinIndex) => (
        <div {...classes('rule')}  key={joinIndex}>
            <div {...classes('rule-row', '', 'row')}>
                <div {...classes('item', '', 'col-xs-6')}>
                    <InputText
                        autoFocus
                        label='Элемент'
                        value={join.name}
                        onChange={val => this.handleChangeJoin(val, 'name', joinIndex)}
                    />
                </div>
                <div {...classes('item', '', 'col-xs-6')}>
                    <InputText
                        label='Значение'
                        value={join.value}
                        onChange={val => this.handleChangeJoin(val, 'value', joinIndex)}
                    />
                </div>
            </div>
            <div {...classes('rule-buttons')}>
                <button
                    {...classes('button', 'remove')}
                    onClick={() => this.handleDeleteJoin(joinIndex)}
                >✕</button>
            </div>
        </div>
    );

    render() {
        const {onClose} = this.props;
        const {form, types, inProgress} = this.state;
        const selectedType = types.find(({value}) => value === form.type);

        return (
            <ConfirmModal
                title={form.id ? 'Изменить' : 'Добавить'}
                onClose={onClose}
                onSubmit={() => this.form.submit()}
            >
                <Form
                    onSubmit={this.handleSubmit}
                    ref={ref => this.form = ref}
                    validate
                >
                    <div {...classes('row', '', 'row')}>
                        <div {...classes('item', '', 'col-md-6')}>
                            <InputText
                                autoFocus
                                required
                                label='Название'
                                value={form.name}
                                onChange={val => this.handleChangeForm(val, 'name')}
                            />
                        </div>
                        <div {...classes('item', '', 'col-md-6')}>
                            <Select
                                label='Тип файла'
                                required
                                options={types}
                                onChange={({value}) => this.handleChangeForm(value, 'type')}
                                selected={selectedType}
                            />
                        </div>
                        <div {...classes('item', '', 'col-md-6')}>
                            <InputText
                                label='Селектор для контейнера статей'
                                value={form.itemsContainer}
                                onChange={val => this.handleChangeForm(val, 'itemsContainer')}
                            />
                        </div>
                        <div {...classes('item', '', 'col-md-6')}>
                            <InputText
                                label='Селектор для статьи'
                                value={form.item}
                                onChange={val => this.handleChangeForm(val, 'item')}
                            />
                        </div>
                    </div>

                    <section {...classes('rules')}>
                        <h3 {...classes('title')}>Правила</h3>

                        {form.rules.map(this.renderRule)}
                        <a
                            role='button'
                            {...classes('empty-msg')}
                            onClick={this.handleAddRule}
                        >+ Добавить</a>
                    </section>

                    <section {...classes('joins')}>
                        <h3 {...classes('title')}>Объединение полей</h3>

                        {form.joins.map(this.renderJoin)}
                        <a
                            role='button'
                            {...classes('empty-msg')}
                            onClick={this.handleAddJoin}
                        >+ Добавить</a>
                    </section>
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
