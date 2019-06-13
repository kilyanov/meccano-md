import React, {Component} from 'react';
import './settings-import.scss';
import PropertiesTable from '../../../Shared/PropertiesTable/PropertiesTable';
import SettingsPage from '../../SettingsPage/SettingsPage';
import PromiseDialogModal from '../../../Shared/PromiseDialogModal/PromiseDialogModal';
import SettingsTemplateModal from '../SettingsTemplateModal/SettingsTemplateModal';

const columnSettings = {
    name: {
        name: 'Название',
        style: {width: '60%'}
    },
    type: {
        name: 'Тип',
        style: {width: '40%'}
    }
};

export default class SettingsImport extends Component {
    state = {
        showItemModal: false,
        selectedItem: null,
        items: [{
            id: _.uniqueId(),
            name: 'Шаблон HTML',
            link: '/settings/import/html',
            type: 'html'
        }, {
            id: _.uniqueId(),
            name: 'Шаблон EXCEL',
            link: '/settings/import/xlsx',
            type: 'xlsx'
        }, {
            id: _.uniqueId(),
            name: 'Шаблон WORD',
            link: '/settings/import/word',
            type: 'docx'
        }]
    };

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
            this.setState({items: this.state.items.filter(({id}) => id !== item.id)});
        });
    };

    handleSubmitItem = (item) => {
        let items = [...this.state.items];

        if (item.id) {
            items = items.map(i => (i.id === item.id) ? item : i);
        } else {
            item.id = _.uniqueId();
            items.push(item);
        }

        this.setState({items, selectedItem: null});
    };

    render() {
        const {showItemModal, selectedItem} = this.state;

        return (
            <SettingsPage
                title='Шаблоны'
                subtitle='Импорт'
                withAddButton
                onAdd={() => this.setState({showItemModal: true, selectedItem: null})}
            >
                <PropertiesTable
                    columnSettings={columnSettings}
                    items={this.state.items}
                    onEditItem={this.handleClickItem}
                    onClickItem={this.handleClickItem}
                    onDeleteItem={this.handleDeleteItem}
                />

                {showItemModal && (
                    <SettingsTemplateModal
                        item={selectedItem}
                        onClose={() => this.setState({selectedItem: null, showItemModal: false})}
                        onSubmit={this.handleSubmitItem}
                    />
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </SettingsPage>
        );
    }
}
