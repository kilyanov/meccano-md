import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Sortable from 'react-sortablejs';
import './project-properties.scss';
import {InitScrollbar} from '../../../../helpers/Tools';
import SelectedProperty from './SelectedProperty/SelectedProperty';
import UnselectedProperty from './UnselectedProperty/UnselectedProperty';
import CreateFieldModal from "../CreateFieldModal/CreateFieldModal";
import InlineButton from "../../../Shared/InlineButton/InlineButton";

const cls = new Bem('project-properties');
const classSelected = 'unselected-property--selected';

export default class ProjectProperties extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        fields: PropTypes.array.isRequired,
        allFields: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
        onCreateField: PropTypes.func.isRequired,
        onEditField: PropTypes.func.isRequired
    };

    state = {
        openCreateFieldModal: false,
        selectedFieldId: ''
    };

    componentDidMount() {
        const leftListRef = _.get(this.leftList, 'sortable.el');
        const rightListRef = _.get(this.rightList, 'sortable.el');

        InitScrollbar(leftListRef, {useBothWheelAxes: false, suppressScrollX: true});
        InitScrollbar(rightListRef);
    }

    componentDidUpdate() {
        const {fields, allFields} = this.props;

        allFields.forEach(item => {
            const selected = !!fields.find(({slug}) => slug === item.slug);
            const elem = document.querySelector(`.unselected-property[data-id="${item.slug}"]`);

            if (!elem) return;

            elem.classList[selected ? 'add' : 'remove'](classSelected);
        });
    }

    handleEndSort = (sortedKeys) => {
        const sortedList = sortedKeys.map(key => {
            return this.props.allFields.find(({slug}) => slug === key);
        }).filter(item => !!item);

        this.props.onChange(sortedList);
    };

    handleChange = (field, index) => {
        const {fields} = this.props;

        fields[index] = field;
        this.props.onChange(fields);
    };

    handleDelete = (index) => {
        const {fields} = this.props;

        fields.splice(index, 1);
        this.props.onChange(fields);
    };

    handleDblClick = (itemCode) => {
        const {fields, allFields} = this.props;
        const foundIndex = fields.findIndex(({slug}) => slug === itemCode);

        if (foundIndex !== -1) {
            this.handleDelete(foundIndex);
        } else {
            fields.push(allFields.find(({slug}) => slug === itemCode));
            this.props.onChange(fields);
        }
    };

    handleEditField = (id = '') => {
        this.setState({
            openCreateFieldModal: true,
            selectedFieldId: id
        });
    };

    render() {
        const {fields, allFields} = this.props;
        const {openCreateFieldModal, selectedFieldId} = this.state;

        return (
            <div {...cls('', '', 'container')}>
                <section {...cls('row', '', 'row')}>
                    <div {...cls('column', '', 'col-xs-6')}>
                        <h3 {...cls('title')}>Выбранные поля</h3>

                        <Sortable
                            ref={ref => this.leftList = ref}
                            {...cls('list', 'left')}
                            options={{
                                animation: 150,
                                filter: '.ps__rail-y',
                                group: {
                                    name: 'fields',
                                    put: 'allFields'
                                }
                            }}
                            onChange={this.handleEndSort}
                        >
                            {fields.map((item, index) => (
                                <SelectedProperty
                                    key={item.id || item.slug}
                                    item={item}
                                    index={index}
                                    onDelete={this.handleDelete}
                                    onChange={field => this.handleChange(field, index)}
                                />
                            ))}
                        </Sortable>
                    </div>
                    <div {...cls('column', '', 'col-xs-6')}>
                        <h3 {...cls('title')}>Добавление полей
                            <InlineButton
                                {...cls('create-field')}
                                onClick={() => this.handleEditField()}
                            >+ Создать поле</InlineButton>
                        </h3>

                        <Sortable
                            ref={ref => this.rightList = ref}
                            {...cls('list', 'right')}
                            onChange={() => true}
                            options={{
                                animation: 150,
                                group: {
                                    name: 'allFields',
                                    pull: 'clone'
                                },
                                sort: false,
                                filter: `.${classSelected}, .ps__rail-y`,
                                onClone: (evt) => {
                                    evt.clone.ondblclick = event =>
                                        this.handleDblClick(event.currentTarget.dataset.id);
                                }
                            }}
                        >
                            {allFields.map(item => {
                                const selected = !!fields.find(({slug}) => slug === item.slug);

                                return (
                                    <UnselectedProperty
                                        key={item.id || item.slug}
                                        item={item}
                                        selected={selected}
                                        classes={cls}
                                        onDoubleClick={this.handleDblClick}
                                    />
                                );
                            })}
                        </Sortable>
                    </div>
                </section>

                {openCreateFieldModal && (
                    <CreateFieldModal
                        fieldId={selectedFieldId}
                        onClose={() => this.setState({openCreateFieldModal: false, selectedFieldId: null})}
                        onCreateField={this.props.onCreateField}
                        onEditField={this.props.onEditField}
                    />
                )}
            </div>
        );
    }
}
