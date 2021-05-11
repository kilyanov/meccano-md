import React, { Component } from 'react';
import SettingsPage from '../../SettingsPage/SettingsPage';
import PromiseDialogModal from '../../../Shared/PromiseDialogModal/PromiseDialogModal';
import SettingsImportModal from './SettingsImportModal/SettingsImportModal';
import TransferService from '../../../../services/TransferService';
import Loader from '../../../Shared/Loader/Loader';
import { NotificationManager } from 'react-notifications';
import { PERMISSION } from "../../../../constants";
import SettingsCategoryModal from "../SettingsCategoryModal/SettingsCategoryModal";
import SettingsTemplatesTree from "../SettingsTemplatesTree/SettingsTemplatesTree";
import Text from "../../../Shared/Text";
import './settings-import.scss';
import mockup from "./mockup";

const columnSettings = {
    name: {
        name: 'Название',
        style: { width: '60%' }
    },
    type: {
        name: 'Тип',
        style: { width: '40%' }
    }
};

export default class SettingsImport extends Component {
    state = {
        showItemModal: false,
        showCategoryModal: false,
        selectedItem: null,
        items: [],
        inProgress: false
    };

    componentDidMount() {
        this.setState({ inProgress: true }, () => {
            TransferService.section
                .get('import')
                .then(response => {
                    if (response?.data) {
                        this.setState({
                            items: response.data,
                            inProgress: false
                        });
                    }
                })
                .catch(e => {
                    if (e?.data?.message) {
                        this.setState({ error: e.data.message });
                    }
                })
                .finally(() => this.setState({ inProgress: false }));
        });
    }

    handleAddTemplate = () => {
        this.setState({ showItemModal: true, selectedItem: null });
    }

    handleAddCategory = () => {
        this.setState({ showCategoryModal: true, selectedItem: null });
    }

    handleClickItem = (item) => {
        this.setState({
            selectedItem: item,
            showItemModal: true
        });
    };

    handleDeleteItem = (item) => {
        this.dialogModal.open({
            title: 'Удаление',
            content: `Вы уверены, что хотите удалить "${item.name}"?`,
            submitText: 'Удалить',
            style: 'danger'
        }).then(() => {
            this.setState({ items: this.state.items.filter(({ id }) => id !== item.id) });
            TransferService.import.delete(item.id).then(() => {
                NotificationManager.success('Успешно удален', 'Удалено');
            });
        });
    };

    handleSubmitItem = (item, method = 'save') => {
        let items = [ ...this.state.items ];

        if (method === 'update') {
            items = items.map(i => (i.id === item.id) ? item : i);
        } else {
            items.push(item);
        }

        this.setState({ items, selectedItem: null });
    };

    handleSubmitCategory = () => {
        //
    }

    dropDownItems = {
        buttonText: 'Добавить',
        dropDownRight: true,
        dropDownItems: [
            {
                title: 'Добавить шаблон',
                closeOnClick: true,
                onClick: this.handleAddTemplate
            },
            {
                title: 'Добавить категорию',
                closeOnClick: true,
                onClick: this.handleAddCategory
            }
        ]
    }

    render() {
        const {
            showItemModal,
            showCategoryModal,
            selectedItem,
            inProgress,
            items,
            error
        } = this.state;

        return (
            <SettingsPage
                title='Шаблоны'
                subtitle='Импорт'
                dropDownButton={this.dropDownItems}
                withAddButton
                onAdd={() => this.setState({ showItemModal: true, selectedItem: null })}
            >
                {error && <Text color='red'>{error}</Text>}

                <SettingsTemplatesTree
                    editPermissions={[ PERMISSION.editSettings ]}
                    columnSettings={columnSettings}
                    data={mockup}
                    onEditItem={this.handleClickItem}
                    onClickItem={this.handleClickItem}
                    onDeleteItem={this.handleDeleteItem}
                    onAddItemChild={this.handleAdd}
                />

                {showItemModal && (
                    <SettingsImportModal
                        item={selectedItem}
                        onClose={() => this.setState({ selectedItem: null, showItemModal: false })}
                        onSubmit={this.handleSubmitItem}
                    />
                )}

                {showCategoryModal && (
                    <SettingsCategoryModal
                        onClose={() => this.setState({ showCategoryModal: false, selectedItem: null })}
                        onSubmit={this.handleSubmitCategory}
                    />
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>

                {inProgress && <Loader/>}
            </SettingsPage>
        );
    }
}
