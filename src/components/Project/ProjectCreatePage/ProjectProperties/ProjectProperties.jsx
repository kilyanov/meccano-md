import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Sortable from 'react-sortablejs';
import './project-properties.scss';
import {InitScrollbar} from '../../../../helpers/Tools';
import SelectedProperty from './SelectedProperty/SelectedProperty';
import UnselectedProperty from './UnselectedProperty/UnselectedProperty';
import CreateFieldModal from "../CreateFieldModal/CreateFieldModal";
import InlineButton from "../../../Shared/InlineButton/InlineButton";
import InputText from "../../../Form/InputText/InputText";
import SearchIcon from "../../../Shared/SvgIcons/SearchIcon";

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
        selectedFieldId: '',
        searchSelectedValue: '',
        searchUnselectedValue: ''
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

    handleSearch = (value ,type) => {
        this.setState({ [type]: value.toLowerCase() });
    };

    highlight = (text, searchString) => {
        if (searchString) {
            const parts = text.split(new RegExp(`(${searchString})`, 'gi'));

            return (
                <span>
                    {parts.map((part, i) =>
                        <span
                            key={i}
                            style={part.toLowerCase() === searchString.toLowerCase() ?
                                {backgroundColor: '#ffff8f'} : {}}
                        >
                            {part}
                        </span>
                    )}
                </span>);
        }

        return text;
    };

    render() {
        const {fields, allFields} = this.props;
        const {openCreateFieldModal, selectedFieldId, searchUnselectedValue} = this.state;
        const filteredAllFields = searchUnselectedValue ?
            allFields.filter(({name}) => name.toLowerCase().includes(searchUnselectedValue)) :
            allFields;

        console.log(fields);

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
                            {!!fields.length && fields.map((item, index) => (
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
                            <div {...cls('search-field')}>
                                <SearchIcon {...cls('search-icon')} />
                                <InputText
                                    {...cls('search-input')}
                                    placeholder='Поиск...'
                                    onChange={value => this.handleSearch(value, 'searchUnselectedValue')}
                                    value={searchUnselectedValue}
                                />
                            </div>
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
                            {filteredAllFields.map(item => {
                                const selected = !!fields.find(({slug}) => slug === item.slug);

                                item.hignlightedName = this.highlight(item.name, searchUnselectedValue);

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
