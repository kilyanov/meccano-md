import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../../../Shared/ConfirmModal/ConfirmModal';
import InputText from '../../../../Form/InputText/InputText';
import TransferService from '../../../../../services/TransferService';
import Form from '../../../../Form/Form/Form';
import Loader from '../../../../Shared/Loader/Loader';
import { NotificationManager } from 'react-notifications';
import InputFile from '../../../../Form/InputFile/InputFile';
import objectToFormData from 'object-to-formdata';
import Select from '../../../../Form/Select/Select';
import InlineButton from '../../../../Shared/InlineButton/InlineButton';
import InputTags from '../../../../Form/InputTags/InputTags';
import { ProjectService } from '@services';
import './settings-export-modal.scss';
import Sortable from "react-sortablejs";
import { isAccess } from "@helpers/Tools";
import { PERMISSION } from "@const";
import { TEMPLATE_TYPE } from "@const/TemplateType";

const cls = new Bem('settings-export-modal');

export default class SettingsExportModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        item: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.defaultForm = {
            name: '',
            rules: [],
            replaces: [],
            projects: [],
            type: TEMPLATE_TYPE.html
        };
        this.defaultRule = {
            selector: '',
            element: ''
        };
        this.defaultReplace = {
            search: '',
            replace: ''
        };
        this.state = {
            form: props.item && !props.item.id ? props.item : { ...this.defaultForm },
            inProgress: false
        };
    }

    componentDidMount() {
        const { item } = this.props;

        if (item?.id) {
            this.setState({ inProgress: true }, () => {
                TransferService
                    .export
                    .get(item.id)
                    .then(response => {
                        const form = response.data;

                        form.projects = form.projects
                            .map(({ id, name }) => ({ label: name, value: id }));

                        this.setState({
                            form,
                            inProgress: false
                        });
                    })
                    .finally(() => this.setState({ inProgress: false }));
            });
        }
    }

    handleChangeForm = (value, prop) => {
        const newState = this.state;

        newState.form[prop] = value;
        this.setState(newState);
    };

    handleAddRule = () => {
        const { form: { rules } } = this.state;
        const hasEmpty = rules.some(rule => !rule.selector || !rule.element);

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

    handleAddReplace = () => {
        const { form: { replaces } } = this.state;
        const hasEmpty = replaces.some(join => !join.search || !join.replace);

        if (!hasEmpty) {
            this.setState(prev => prev.form.replaces.push({ ...this.defaultReplace }));
        }
    };

    handleChangeReplace = (value, prop, index) => {
        this.setState(prev => prev.form.replaces[index][prop] = value);
    };

    handleDeleteJoin = (index) => {
        const newState = this.state;

        newState.form.replaces.splice(index, 1);

        this.setState(newState);
    };

    handleEndSortRules = (sortedKeys) => {
        this.setState(state => {
            state.form.rules = sortedKeys
                .map(key => state.form.rules.find(({ id }) => id === key))
                .filter(item => !!item);

            return state;
        });
    };

    handleEndSortReplaces = (sortedKeys) => {
        this.setState(state => {
            state.form.replaces = sortedKeys
                .map(key => state.form.replaces.find(({ id }) => id === key))
                .filter(item => !!item);

            return state;
        });
    };

    handleSubmit = () => {
        const { parent } = this.props;
        const form = _.pick(this.state.form, [ 'name', 'rules', 'replaces', 'projects', 'file', 'type' ]);
        const method = this.state.form.id ? 'update' : 'set';

        if (_.get(form.file, 'id')) delete form.file;

        form.rules = form.rules.map(({ id, selector, element }, index) => ({ id, selector, element, position: index }));
        form.replaces = form.replaces.map(({ id, search, replace }, index) => ({ id, search, replace, position: index }));

        if (form.projects && form.projects.length) {
            form.projects = form.projects.map(({ value }) => value);
        } else {
            delete form.projects;
        }

        if (parent) {
            form.section_id = parent.id;
        }

        const formData = objectToFormData(form, { indices: true });

        if (!form.rules.length) return NotificationManager.error('???? ?????????????????? "?????????????? ????????????"', '????????????');
        if (!form.rules.every(item => item.selector && item.element)) {
            return NotificationManager.error('???? ?????????? ?????????????????? ???????? "?????????????? ????????????"', ' ????????????');
        }

        // if (!form.replaces.length) return  NotificationManager.error('???? ???????????????? "???????????? ??????????"', '????????????');
        // if (!form.replaces.every(item => item.search && item.replace)) {
        //     return NotificationManager.error('???? ?????????? ?????????????????? ???????? "???????????? ??????????"', ' ????????????');
        // }

        this.setState({ inProgress: true }, () => {
            TransferService.export[method](formData, this.state.form.id).then(response => {
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

    types = Object.entries(TEMPLATE_TYPE).map(([key, value]) => ({ name: value, value: key }));

    canEdit = isAccess(PERMISSION.editSettings);

    renderRule = (rule, ruleIndex) => (
        <div {...cls('rule')} key={ruleIndex} data-id={rule.id}>
            <div {...cls('rule-row', '', 'row')}>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        autoFocus
                        label='????????????????'
                        value={rule.selector}
                        disabled={!this.canEdit}
                        onChange={val => this.handleChangeRule(val, 'selector', ruleIndex)}
                    />
                </div>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        label='??????????????'
                        value={rule.element}
                        disabled={!this.canEdit}
                        onChange={val => this.handleChangeRule(val, 'element', ruleIndex)}
                    />
                </div>
            </div>
            <div {...cls('rule-buttons')}>
                <button
                    tabIndex={-1}
                    type='button'
                    {...cls('button', 'remove')}
                    disabled={!this.canEdit}
                    onClick={() => this.handleDeleteRule(ruleIndex)}
                >???
                </button>
            </div>
        </div>
    );

    renderReplace = (replace, replaceIndex) => (
        <div {...cls('rule')} key={replaceIndex} data-id={replace.id}>
            <div {...cls('rule-row', '', 'row')}>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        label='????????????'
                        value={replace.replace}
                        disabled={!this.canEdit}
                        onChange={val => this.handleChangeReplace(val, 'replace', replaceIndex)}
                    />
                </div>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        autoFocus
                        label='??????????????'
                        value={replace.search}
                        disabled={!this.canEdit}
                        onChange={val => this.handleChangeReplace(val, 'search', replaceIndex)}
                    />
                </div>
            </div>
            <div {...cls('rule-buttons')}>
                <button
                    tabIndex={-1}
                    type='button'
                    {...cls('button', 'remove')}
                    disabled={!this.canEdit}
                    onClick={() => this.handleDeleteJoin(replaceIndex)}
                >???
                </button>
            </div>
        </div>
    );

    render() {
        const { onClose, parent } = this.props;
        const { form, inProgress } = this.state;
        const fileName = form.file ? [ form.file ] : [];

        return (
            <ConfirmModal
                title={form.id ? '????????????????' : '????????????????'}
                subTitle={parent && `?? ?????????????????? ${parent.name}`}
                onClose={onClose}
                onSubmit={() => this.form.submit()}
                submitDisabled={!this.canEdit}
            >
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
                                value={form?.name || ''}
                                onChange={val => this.handleChangeForm(val, 'name')}
                                disabled={!this.canEdit}
                            />
                        </div>
                        <div {...cls('item', '', 'col-md-6')}>
                            <Select
                                label='??????'
                                options={this.types}
                                required
                                onChange={item => this.handleChangeForm(item.value, 'type')}
                                selected={this.types.find(({ value }) => value === form.type) || []}
                                disabled={!this.canEdit}
                            />
                        </div>
                    </div>

                    <div {...cls('row', '', 'row')}>
                        <div {...cls('item', '', 'col-md-12')}>
                            <InputFile
                                files={fileName}
                                onChange={file => this.handleChangeForm(file, 'file')}
                                disabled={!this.canEdit}
                            />
                        </div>
                    </div>

                    <div {...cls('row', '', 'row')}>
                        <div {...cls('item', '', 'col-md-12')}>
                            <InputTags
                                label='????????????'
                                options={form.projects || []}
                                onChange={val => this.handleChangeForm(val, 'projects')}
                                value={form.projects || []}
                                requestService={ProjectService.get}
                                requestCancelService={ProjectService.cancelLast}
                                disabled={!this.canEdit}
                            />
                        </div>
                    </div>

                    <section {...cls('rules')}>
                        <h3 {...cls('title')}>?????????????? ????????????</h3>

                        <Sortable
                            {...cls('list', 'left')}
                            options={{ animation: 150, disabled: !this.canEdit }}
                            disabled={!this.canEdit}
                            onChange={this.handleEndSortRules}
                        >
                            {form.rules.map(this.renderRule)}
                        </Sortable>

                        <InlineButton onClick={this.handleAddRule} disabled={!this.canEdit}>+ ????????????????</InlineButton>
                    </section>

                    <section {...cls('joins')}>
                        <h3 {...cls('title')}>???????????? ??????????</h3>

                        <Sortable
                            {...cls('list', 'left')}
                            options={{ animation: 150, disabled: !this.canEdit }}
                            disabled={!this.canEdit}
                            onChange={this.handleEndSortReplaces}
                        >
                            {form.replaces.map(this.renderReplace)}
                        </Sortable>

                        <InlineButton onClick={this.handleAddReplace} disabled={!this.canEdit}>+ ????????????????</InlineButton>
                    </section>
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
