import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SectionTreeList from './SectionTreeList/SectionTreeList';
import './section-tree.scss';
import SectionTreeAddItem from './SectionTreeAddItem/SectionTreeAddItem';
import PromiseDialogModal from '../PromiseDialogModal/PromiseDialogModal';
import InlineButton from '../InlineButton/InlineButton';

const cls = new Bem('section-tree');

export default class SectionTree extends Component {
    static propTypes = {
        data: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired
    };

    state = {
        showAddModal: false,
        selectedSection: null,
        data: this.props.data || [],
        copyData: this.props.data || []
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.data !== prevState.data) {
            // First set data
            if (!prevState.data.length) {
                return { data: nextProps.data, copyData: _.cloneDeep(nextProps.data) };
            }

            return { data: nextProps.data };
        }

        return null;
    }

    handleAddSection = (name) => {
        const { data, selectedSection } = this.state;

        if (selectedSection) {
            if (selectedSection.hasOwnProperty('sectionsTwo')) {
                selectedSection.sectionsTwo.push({ name, sectionsThree: [], id: _.uniqueId('new_') });
            } else {
                selectedSection.sectionsThree.push({ name, id: _.uniqueId('new_') });
            }

            this.setState({ selectedSection: null });
        } else {
            data.push({ name, sectionsTwo: [], id: _.uniqueId('new_') });
            this.setState({ data });
        }

        this.setState({ copyData: _.cloneDeep(data) });
        this.updateParent();
    };

    handleOpenAddModal = (selectedSection, isEdit = false) => {
        this.setState({
            selectedSection,
            isEdit,
            showAddModal: true
        });
    };

    handleEditSection = (name) => {
        const { selectedSection } = this.state;

        selectedSection.name = name;
        this.setState({ selectedSection: null });
        this.updateParent();
    };

    handleDeleteSection = (section, parent) => {
        if (!parent) {
            const data = this.state.data.filter(({ id }) => id !== section.id);

            return this.props.onChange(data);
        }

        if (parent.hasOwnProperty('sectionsTwo')) {
            parent.sectionsTwo = parent.sectionsTwo.filter(({ id }) => id !== section.id);
        } else {
            parent.sectionsThree = parent.sectionsThree.filter(({ id }) => id !== section.id);
        }

        this.forceUpdate();
        this.updateParent();
    };

    handleSorting = (sorted, parent) => {
        const { data, copyData } = this.state;
        const sort = (items) => {
            return sorted.map((id, index) => {
                let child = items.find(c => c.id === id);

                if (!child) {
                    child = this.findSectionById(id, copyData);
                }

                if (!parent && !child.hasOwnProperty('sectionsTwo')) {
                    child.sectionsTwo = child.sectionsThree || [];
                    delete child.id;
                    delete child.sectionsThree;
                }

                if (parent && parent.hasOwnProperty('sectionsTwo') && !child.hasOwnProperty('sectionsThree')) {
                    child.sectionsThree = child.sectionsTwo || [];
                    delete child.id;
                    delete child.sectionsTwo;
                }

                if (parent && parent.hasOwnProperty('sectionsThree')) {
                    delete child.id;
                    delete child.sectionsTwo;
                    delete child.sectionsThree;
                }

                child.position = index;
                return child;
            });
        };
        const arr = parent
            ? parent.hasOwnProperty('sectionsTwo') ? parent.sectionsTwo : parent.sectionsThree
            : data;

        if (parent) {
            parent[parent.hasOwnProperty('sectionsTwo') ? 'sectionsTwo' : 'sectionsThree'] = sort(arr);
            this.forceUpdate();
        } else {
            this.props.onChange(sort(data));
        }

        console.table(data);
    };

    findSectionById = (sectionId, sections) => {
        const r = (items) => {
            let found = null;

            for (const item of items) {
                if (item.id === sectionId) {
                    found = item;
                    break; // for stop loop
                }

                if (item.sectionsTwo && item.sectionsTwo.length) {
                    found = r(item.sectionsTwo);
                }

                if (item.sectionsThree && item.sectionsThree.length) {
                    found = r(item.sectionsThree);
                }

                if (found) {
                    break;
                }
            }

            return found;
        };

        return r(sections);
    };

    updateParent = () => {
        this.props.onChange(this.state.data);
    };

    render() {
        const { showAddModal, selectedSection, isEdit } = this.state;

        return (
            <section {...cls()}>
                <InlineButton
                    onClick={() => this.setState({ showAddModal: true })}
                >+ Добавить корневой раздел</InlineButton>

                <SectionTreeList
                    items={this.state.data}
                    onAddItemChild={section => this.handleOpenAddModal(section)}
                    onEditItem={section => this.handleOpenAddModal(section, true)}
                    onDeleteItem={this.handleDeleteSection}
                    onSorting={this.handleSorting}
                />

                {showAddModal && (
                    <SectionTreeAddItem
                        item={isEdit ? selectedSection : null}
                        onClose={() => this.setState({ showAddModal: false })}
                        onSubmit={isEdit ? this.handleEditSection : this.handleAddSection}
                    />
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </section>
        );
    }
}
