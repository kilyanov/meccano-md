import React, { Component } from 'react';
import { Prompt } from 'react-router-dom';
import PromiseDialogModal from '../../../Shared/PromiseDialogModal/PromiseDialogModal';
import SettingsImportModal from './SettingsImportModal/SettingsImportModal';
import TransferService from '../../../../services/TransferService';
import { NotificationManager } from 'react-notifications';
import { PERMISSION } from "../../../../constants";
import SettingsPage from '../../SettingsPage/SettingsPage';
import Loader from '../../../Shared/Loader/Loader';
import SettingsCategoryModal from "../SettingsCategoryModal/SettingsCategoryModal";
import SettingsTemplatesTree from "../SettingsTemplatesTree/SettingsTemplatesTree";
import Text from "../../../Shared/Text";
import ButtonsModal from '../../../Shared/ButtonsModal/ButtonsModal';
import './settings-import.scss';

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

const TYPE = 'import';

export default class SettingsImport extends Component {
    state = {
        showItemModal: false,
        showCategoryModal: false,
        showButtonsModal: false,

        selectedTemplate: null,
        selectedCategory: null,

        data: {},
        cloneData: {},

        inProgress: false,
        hasChanges: false
    };

    componentDidMount() {
        this.setState({ inProgress: true }, () => {
            TransferService.section
                .get(TYPE)
                .then(response => {
                    if (response?.data) {
                        this.data = response.data;
                        this.setState({ inProgress: false });
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

    componentDidUpdate = () => {
        if (this.state.hasChanges) {
            window.onbeforeunload = () => true;
        } else {
            window.onbeforeunload = undefined;
        }
    }

    handleAddTemplate = () => {
        this.setState({ showItemModal: true });
    }

    handleAddCategory = () => {
        this.setState({ showCategoryModal: true });
    }

    handleClickItem = (item) => {
        this.setState({
            selectedTemplate: item,
            showItemModal: true
        });
    };

    handleDeleteItem = (item) => {
        const isCategory = this.isCategory(item);
        const message = [];

        message.push(
            <p key={0}>
                Вы уверены, что хотите удалить {isCategory ? 'категорию' : 'шаблон'} <b>"{item.name}"</b>?
            </p>
        );

        if (isCategory && item[TYPE]?.length || item.children?.length) {
            message.push(
                <p key={1}>
                    В ней присутствуют вложенные {item[TYPE]?.length ? 'шаблоны' : 'подкатегории'}!
                </p>
            );
        }

        this.dialogModal
            .open({
                title: 'Удаление',
                content: message,
                submitText: 'Удалить',
                danger: true
            }).then(() => {
                this.removeItemFromData(item.id || item.name);
                if (!isCategory) {
                    TransferService.import.delete(item.id).then(() => {
                        NotificationManager.success('Успешно удален', 'Удалено');
                    });
                }
            });
    };

    handleSubmitItem = (item, method = 'save') => {
        const { selectedCategory } = this.state;
        const source = selectedCategory || this.data;

        if (method === 'update') {
            source[TYPE] = source[TYPE].map(i => (i.id === item.id) ? item : i);
        } else {
            source[TYPE].push(item);
        }

        this.setState({
            selectedCategory: null,
            hasChanges: true
        });
    };

    handleSubmitCategory = (name) => {
        const { selectedCategory } = this.state;
        const newCategory = {
            id: _.uniqueId('new_'),
            name,
            depth: selectedCategory
                ? selectedCategory.depth + 1
                : 0,
            children: [],
            open: true,
            [TYPE]: []
        };

        if (selectedCategory) {
            if (!selectedCategory.children) {
                selectedCategory.children = [];
            }
            selectedCategory.open = true;
            selectedCategory.children.push(newCategory);
        } else {
            if (!this.data.children) {
                this.data.children = [];
            }

            this.data.children.push(newCategory);
        }

        this.setState({
            selectedCategory: null,
            showCategoryModal: false,
            hasChanges: true
        });
    }

    handleAddChild = (parent) => {
        this.setState({
            showButtonsModal: true,
            selectedCategory: parent
        });
    }

    handleSort = (sorted, parent) => {
        const { categories, templates } = sorted.reduce((acc, curr) => {
            const item = JSON.parse(curr);
            const source = this.isCategory(item) ? acc.categories : acc.templates;

            source.push({ ...item, lft: source.length });
            return acc;
        }, { categories: [], templates: [] });

        if (parent) {
            parent.open = true;
        }

        const source = parent || this.data;

        source[TYPE] = templates;
        source.children = categories;

        this.setState({ hasChanges: true });
    }

    handleSaveStructure = () => {
        this.setState({ inProgress: true }, () => {
            TransferService.section
                .put(TYPE, this.data)
                .then(response => {
                    console.log('response', response);
                    this.setState({ hasChanges: false });
                })
                .finally(() => this.setState({ inProgress: false }));
        });
    }

    findItemInData = (idOrName) => {
        const r = (arr, n) => {
            const found = arr.find(b => b?.id === n || (this.isCategory(b) && b.name === n));

            if (!found) {
                arr.forEach(i => {
                    const newArr = [
                        ...(i?.[TYPE] || []),
                        ...(i?.children || [])
                    ];

                    if (newArr.length) {
                        r(newArr, n);
                    }
                });
            }

            return found;
        };

        return r(
            [
                ...(this.data?.[TYPE] || []),
                ...(this.data?.children || []),
                ...this.moved
            ],
            idOrName
        );
    }

    removeItemFromData = (idOrName) => {
        const f = (arr, n) => {
            return arr.filter(i => {
                const found = i?.id === n || (this.isCategory(i) && i.name === n);

                if (!found) {
                    if (i.children?.length) {
                        i.children = f(i.children, n);
                    }

                    if (i[TYPE]?.length) {
                        i[TYPE] = f(i[TYPE], n);
                    }
                }

                return !found;
            });
        };

        this.data.children = f(this.data.children, idOrName);
        this.forceUpdate();
    }

    isCategory = (item) => {
        return item.hasOwnProperty('children') || item.hasOwnProperty(TYPE);
    }

    data = {};

    moved = [];

    render() {
        const {
            showItemModal,
            showCategoryModal,
            showButtonsModal,
            selectedCategory,
            selectedTemplate,
            hasChanges,
            inProgress,
            error
        } = this.state;

        return (
            <>
                <Prompt
                    when={hasChanges}
                    message='У Вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?'
                />
                <SettingsPage
                    title='Шаблоны'
                    subtitle='Импорт'
                    withAddButton
                    onAdd={() => this.setState({ showButtonsModal: true })}
                    additionalButtons={hasChanges && [
                        {
                            title: 'Сохранить',
                            style: 'success',
                            onClick: this.handleSaveStructure
                        }
                    ]}
                >
                    {error && <Text color='red'>{error}</Text>}

                    <SettingsTemplatesTree
                        editPermissions={[ PERMISSION.editSettings ]}
                        columnSettings={columnSettings}
                        data={this.data}
                        onEditItem={this.handleClickItem}
                        onClickItem={this.handleClickItem}
                        onDeleteItem={this.handleDeleteItem}
                        onAddItemChild={this.handleAddChild}
                        onSort={this.handleSort}
                    />

                    {showItemModal && (
                        <SettingsImportModal
                            item={selectedTemplate}
                            onClose={() => this.setState({ selectedTemplate: null, showItemModal: false })}
                            onSubmit={this.handleSubmitItem}
                        />
                    )}

                    {showCategoryModal && (
                        <SettingsCategoryModal
                            existCategoriesNames={
                                (selectedCategory?.children || this.data.children)
                                    ?.map(({ name }) => name.toLowerCase()) || []
                            }
                            existErrorMessage='Категория с таким именем уже есть!'
                            onClose={() => this.setState({ showCategoryModal: false, selectedCategory: null })}
                            onSubmit={this.handleSubmitCategory}
                        />
                    )}

                    <PromiseDialogModal ref={node => this.dialogModal = node}/>

                    {showButtonsModal && (
                        <ButtonsModal
                            title='Добавить элемент'
                            description='Выберите, какой элемент добавить'
                            onClose={() => this.setState({showButtonsModal: false })}
                            buttons={[
                                {
                                    label: 'Категорию',
                                    onClick: this.handleAddCategory
                                },
                                {
                                    label: 'Шаблон',
                                    onClick: this.handleAddTemplate
                                }
                            ]}
                        />
                    )}

                    {inProgress && <Loader/>}
                </SettingsPage>
            </>
        );
    }
}
