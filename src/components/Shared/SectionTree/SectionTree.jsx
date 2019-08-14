import React, {Component} from 'react';
import PropTypes from 'prop-types';
import SectionTreeList from './SectionTreeList/SectionTreeList';
import './section-tree.scss';
import SectionTreeAddItem from './SectionTreeAddItem/SectionTreeAddItem';
import PromiseDialogModal from '../PromiseDialogModal/PromiseDialogModal';
import InlineButton from '../InlineButton/InlineButton';

const classes = new Bem('section-tree');

export default class SectionTree extends Component {
    static propTypes = {
        data: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired
    };

    state = {
        showAddModal: false,
        selectedSection: null,
        data: this.props.data || []
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.data !== prevState.data) {
            return {data: nextProps.data};
        }

        return  null;
    }

    handleAddSection = (name) => {
        const {data, selectedSection} = this.state;

        if (selectedSection) {
            if (selectedSection.hasOwnProperty('sectionsTwo')) {
                selectedSection.sectionsTwo.push({name, sectionsThree: []});
            } else {
                selectedSection.sectionsThree.push({name});
            }

            this.setState({selectedSection: null});
        } else {
            data.push({id: _.uniqueId(), name, sectionsTwo: []});
            this.setState({data});
        }

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
        const {selectedSection} = this.state;

        selectedSection.name = name;
        this.setState({selectedSection: null});
        this.updateParent();
    };

    handleDeleteSection = (section, parent) => {
        if (!parent) {
            const data = this.state.data.filter(({id}) => id !== section.id);

            return this.props.onChange(data);
        }

        if (parent.hasOwnProperty('sectionsTwo')) {
            parent.sectionsTwo = parent.sectionsTwo.filter(({id}) => id !== section.id);
        } else {
            parent.sectionsThree = parent.sectionsThree.filter(({id}) => id !== section.id);
        }

        this.forceUpdate();
        this.updateParent();
    };

    updateParent = () => {
        this.props.onChange(this.state.data);
    };

    render() {
        const {showAddModal, selectedSection, isEdit} = this.state;

        return (
            <section {...classes()}>
                <InlineButton
                    onClick={() => this.setState({showAddModal: true})}
                >+ Добавить корневой раздел</InlineButton>

                <SectionTreeList
                    items={this.state.data}
                    onAddItemChild={section => this.handleOpenAddModal(section)}
                    onEditItem={section => this.handleOpenAddModal(section, true)}
                    onDeleteItem={this.handleDeleteSection}
                />

                {showAddModal && (
                    <SectionTreeAddItem
                        item={isEdit ? selectedSection : null}
                        onClose={() => this.setState({showAddModal: false})}
                        onSubmit={isEdit ? this.handleEditSection : this.handleAddSection}
                    />
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </section>
        );
    }
}
