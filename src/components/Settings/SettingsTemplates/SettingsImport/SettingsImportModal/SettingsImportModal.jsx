import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../../../Shared/ConfirmModal/ConfirmModal';
import './settings-import-modal.scss';
import InputText from '../../../../Form/InputText/InputText';
import Select from '../../../../Form/Select/Select';
import TransferService from '../../../../../services/TransferService';
import Form from '../../../../Form/Form/Form';
import Loader from '../../../../Shared/Loader/Loader';
import { NotificationManager } from 'react-notifications';
import InlineButton from '../../../../Shared/InlineButton/InlineButton';
import Sortable from "react-sortablejs";
import { isAccess } from "../../../../../helpers/Tools";
import { PERMISSION } from "../../../../../constants";

const cls = new Bem('settings-import-modal');

export default class SettingsImportModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        item: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.defaultForm = {
            name: '',
            item: '',
            type: '',
            itemsContainer: '',
            rules: [],
            joins: [],
            reprintsContainer: '',
            reprintItem: ''
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
            form: { ...this.defaultForm },
            types: [],
            inProgress: true
        };
    }

    componentDidMount() {
        const { item } = this.props;

        Promise
            .all([
                TransferService.type.get(),
                item?.id && TransferService.import.get(item.id)
            ])
            .then(([typesResponse, importResponse]) => {
                this.setState({
                    types: typesResponse.data.map(({ name }) => ({ name, value: name })),
                    form: importResponse?.data || item || { ...this.defaultForm },
                    inProgress: false
                });
            })
            .finally(() => this.setState({ inProgress: false }));
    }

    handleChangeForm = (value, prop) => {
        const newState = this.state;

        newState.form[prop] = value;
        this.setState(newState);
    };

    handleAddRule = () => {
        const { form: { rules } } = this.state;
        const hasEmpty = rules.some(rule => !rule.field_name || !rule.path_value);

        if (!hasEmpty) {
            this.setState(prev => prev.form.rules.push({ ...this.defaultRule }));
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
        const { form: { joins } } = this.state;
        const hasEmpty = joins.some(join => !join.name || !join.value);

        if (!hasEmpty) {
            this.setState(prev => prev.form.joins.push({ ...this.defaultJoin }));
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

    handleEndSort = (sortedKeys) => {
        this.setState(state => {
            state.form.rules = sortedKeys
                .map(key => state.form.rules.find(({ id }) => id === key))
                .filter(item => !!item);

            return state;
        });
    };

    handleSubmit = () => {
        const { parent } = this.props
        const form = { ...this.state.form };
        const method = form.id ? 'update' : 'set';

        delete form.id;
        delete form.createdAt;
        delete form.updatedAt;
        delete form.value;
        delete form.slug;

        form.rules = form.rules || [];
        form.joins = form.joins || [];
        form.rules = form.rules.map((item, index) => ({ ...item, position: index }));

        if (!form.rules.length) return NotificationManager.error('???? ?????????????????? "??????????????"', '????????????');
        if (!form.rules.every(item => item.field_name && item.path_value)) {
            return NotificationManager.error('???? ?????????? ?????????????????? ???????? "??????????????"', ' ????????????');
        }

        if (!form.joins.length) return NotificationManager.error('???? ?????????????????? "?????????????????????? ??????????"', '????????????');
        if (!form.joins.every(item => item.name && item.value)) {
            return NotificationManager.error('???? ?????????? ?????????????????? ???????? "?????????????????????? ??????????"', ' ????????????');
        }

        if (parent) {
            form.section_id = parent.id;
        }

        this.setState({ inProgress: true }, () => {
            TransferService.import[method](form, this.state.form.id).then(response => {
                NotificationManager.success('?????????????? ??????????????????', '??????????????????');
                this.setState({
                    form: { ...this.defaultForm },
                    inProgress: false
                });
                this.props.onSubmit(response.data, method);
                this.props.onClose();
            }).catch(() => this.setState({ inProgress: false }));
        });
    };

    canEdit = isAccess(PERMISSION.editSettings);

    renderRule = (rule, ruleIndex) => (
        <div {...cls('rule')} key={ruleIndex} data-id={rule.id}>
            <div {...cls('rule-row', '', 'row')}>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        autoFocus
                        label='??????????????'
                        value={rule.field_name}
                        onChange={val => this.handleChangeRule(val, 'field_name', ruleIndex)}
                        disabled={!this.canEdit}
                    />
                </div>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        label='????????????????'
                        value={rule.path_value}
                        onChange={val => this.handleChangeRule(val, 'path_value', ruleIndex)}
                        disabled={!this.canEdit}
                    />
                </div>
            </div>
            <div {...cls('rule-buttons')}>
                <button
                    type='button'
                    {...cls('button', 'remove')}
                    onClick={() => this.handleDeleteRule(ruleIndex)}
                    disabled={!this.canEdit}
                >???
                </button>
            </div>
        </div>
    );

    renderJoin = (join, joinIndex) => (
        <div {...cls('rule')} key={joinIndex}>
            <div {...cls('rule-row', '', 'row')}>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        autoFocus
                        label='??????????????'
                        value={join.name}
                        onChange={val => this.handleChangeJoin(val, 'name', joinIndex)}
                        disabled={!this.canEdit}
                    />
                </div>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        label='????????????????'
                        value={join.value}
                        onChange={val => this.handleChangeJoin(val, 'value', joinIndex)}
                        disabled={!this.canEdit}
                    />
                </div>
            </div>
            <div {...cls('rule-buttons')}>
                <button
                    type='button'
                    {...cls('button', 'remove')}
                    onClick={() => this.handleDeleteJoin(joinIndex)}
                    disabled={!this.canEdit}
                >???
                </button>
            </div>
        </div>
    );

    render() {
        const { onClose, item, parent } = this.props;
        const { form, types, inProgress } = this.state;
        const selectedType = types.find(t => t?.value === form.type);

        return (
            <ConfirmModal
                title={form.id ? '????????????????' : '????????????????'}
                subTitle={parent && `?? ?????????????????? ${parent.name}`}
                onClose={onClose}
                onSubmit={() => this.form.submit()}
                submitDisabled={!this.canEdit}
            >
                {(item?.id && !form.name) && (
                    <span>?????????????????? ???????????? ?????? ???????????????? ??????????!</span>
                )}
                <Form
                    onSubmit={this.handleSubmit}
                    ref={ref => this.form = ref}
                    validate
                >
                    <div {...cls('row', '', 'row')}>
                        <div {...cls('item', '', 'col-md-6')}>
                            <InputText
                                autoFocus
                                required
                                label='????????????????'
                                value={form.name || ''}
                                onChange={val => this.handleChangeForm(val, 'name')}
                                disabled={!this.canEdit}
                            />
                        </div>
                        <div {...cls('item', '', 'col-md-6')}>
                            <Select
                                label='?????? ??????????'
                                required
                                options={types}
                                onChange={({ value }) => this.handleChangeForm(value, 'type')}
                                selected={selectedType}
                                disabled={!this.canEdit}
                            />
                        </div>
                        <div {...cls('item', '', 'col-md-6')}>
                            <InputText
                                label='???????????????? ?????? ???????????????????? ????????????'
                                value={form.itemsContainer || ''}
                                onChange={val => this.handleChangeForm(val, 'itemsContainer')}
                                disabled={!this.canEdit}
                            />
                        </div>
                        <div {...cls('item', '', 'col-md-6')}>
                            <InputText
                                label='???????????????? ?????? ????????????'
                                value={form.item || ''}
                                onChange={val => this.handleChangeForm(val, 'item')}
                                disabled={!this.canEdit}
                            />
                        </div>
                        <div {...cls('item', '', 'col-md-6')}>
                            <InputText
                                label='???????????????? ?????? ???????????????????? ??????????????????????'
                                value={form.reprintsContainer || ''}
                                onChange={val => this.handleChangeForm(val, 'reprintsContainer')}
                                disabled={!this.canEdit}
                            />
                        </div>
                        <div {...cls('item', '', 'col-md-6')}>
                            <InputText
                                label='???????????????? ?????? ??????????????????????'
                                value={form.reprintItem || ''}
                                onChange={val => this.handleChangeForm(val, 'reprintItem')}
                                disabled={!this.canEdit}
                            />
                        </div>
                    </div>

                    <section {...cls('rules')}>
                        <h3 {...cls('title')}>??????????????</h3>

                        <Sortable
                            {...cls('list', 'left')}
                            options={{ animation: 150, disabled: !this.canEdit }}
                            onChange={this.handleEndSort}
                            disabled={!this.canEdit}
                        >
                            {form.rules?.map(this.renderRule)}
                        </Sortable>

                        <InlineButton onClick={this.handleAddRule} disabled={!this.canEdit}>
                            + ????????????????
                        </InlineButton>
                    </section>

                    <section {...cls('joins')}>
                        <h3 {...cls('title')}>?????????????????????? ??????????</h3>

                        {form.joins?.map(this.renderJoin)}
                        <InlineButton onClick={this.handleAddJoin} disabled={!this.canEdit}>
                            + ????????????????
                        </InlineButton>
                    </section>
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
