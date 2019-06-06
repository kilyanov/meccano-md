import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Sortable from 'react-sortablejs';
import './project-properties.scss';
import {InitScrollbar} from '../../../../helpers/Tools';
import SelectedProperty from './SelectedProperty/SelectedProperty';
import UnselectedProperty from './UnselectedProperty/UnselectedProperty';

const classes = new Bem('project-properties');
const classSelected = 'unselected-property--selected';

export default class ProjectProperties extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        fields: PropTypes.array.isRequired,
        allFields: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired
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
            const selected = !!fields.find(({code}) => code === item.code);
            const elem = document.querySelector(`.unselected-property[data-id="${item.code}"]`);

            if (!elem) return;

            elem.classList[selected ? 'add' : 'remove'](classSelected);
        });
    }

    handleEndSort = (sortedKeys) => {
        const sortedList = sortedKeys.map(key => {
            return this.props.allFields.find(({code}) => code === key);
        }).filter(item => !!item);

        this.props.onChange(sortedList);
    };

    handleDelete = (index) => {
        const {fields} = this.props;

        fields.splice(index, 1);
        this.props.onChange(fields);
    };

    handleDblClick = (itemCode) => {
        const {fields, allFields} = this.props;
        const foundIndex = fields.findIndex(({code}) => code === itemCode);

        if (foundIndex !== -1) {
            this.handleDelete(foundIndex);
        } else {
            fields.push(allFields.find(({code}) => code === itemCode));
            this.props.onChange(fields);
        }
    };

    render() {
        const {fields, allFields} = this.props;

        return (
            <div {...classes('', '', 'container')}>
                <div {...classes('row', '', 'row')}>
                    <div {...classes('column', '', 'col-xs-6')}>
                        <h3>Выбранные поля</h3>

                        <Sortable
                            ref={ref => this.leftList = ref}
                            {...classes('list', 'left')}
                            options={{
                                animation: 150,
                                group: {
                                    name: 'fields',
                                    put: 'allFields'
                                }
                            }}
                            onChange={this.handleEndSort}
                        >
                            {fields.map((item, index) => (
                                <SelectedProperty
                                    item={item}
                                    index={index}
                                    type='fields'
                                    onDelete={this.handleDelete}
                                    key={item.code}
                                />
                            ))}
                        </Sortable>
                    </div>
                    <div {...classes('column', '', 'col-xs-6')}>
                        <h3>Добавление полей</h3>

                        <Sortable
                            ref={ref => this.rightList = ref}
                            {...classes('list', 'right')}
                            onChange={() => true}
                            options={{
                                animation: 150,
                                group: {
                                    name: 'allFields',
                                    pull: 'clone'
                                },
                                sort: false,
                                filter: `.${classSelected}`,
                                onClone: (evt) => {
                                    evt.clone.ondblclick = event =>
                                        this.handleDblClick(event.currentTarget.dataset.id);
                                }
                            }}
                        >
                            {allFields.map(item => {
                                const selected = !!fields.find(({code}) => code === item.code);

                                return (
                                    <UnselectedProperty
                                        key={item.code}
                                        item={item}
                                        selected={selected}
                                        classes={classes}
                                        onDoubleClick={this.handleDblClick}
                                    />
                                );
                            })}
                        </Sortable>
                    </div>
                </div>
            </div>
        );
    }
}
