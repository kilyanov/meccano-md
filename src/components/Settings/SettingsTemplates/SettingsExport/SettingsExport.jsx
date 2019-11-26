import React, {Component} from 'react';
import './settings-export.scss';
import SettingsPage from '../../SettingsPage/SettingsPage';
import TransferService from '../../../../services/TransferService';
import {NotificationManager} from 'react-notifications';
import PropertiesTable from '../../../Shared/PropertiesTable/PropertiesTable';
import PromiseDialogModal from '../../../Shared/PromiseDialogModal/PromiseDialogModal';
import Loader from '../../../Shared/Loader/Loader';
import SettingsExportModal from './SettingsExportModal/SettingsExportModal';
import {PERMISSION} from "../../../../constants/Permissions";

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

export default class SettingsExport extends Component {
    state = {
        showItemModal: false,
        selectedItem: null,
        items: [],
        inProgress: false
    };

    componentDidMount() {
        this.setState({inProgress: true}, () => {
            TransferService.export.get().then(response => {
                this.setState({
                    items: response.data.map(item => ({...item, value: item.id})),
                    inProgress: false
                });
            }).catch(() => this.setState({inProgress: false}));
        });
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
            this.setState({items: this.state.items.filter(({id}) => id !== item.id)});
            TransferService.export.delete(item.id).then(() => {
                NotificationManager.success('Успешно удален', 'Удалено');
            });
        });
    };

    handleSubmitItem = (item, method = 'save') => {
        let items = [...this.state.items];

        if (method === 'update') {
            items = items.map(i => (i.id === item.id) ? item : i);
        } else {
            items.push(item);
        }

        this.setState({items, selectedItem: null});
    };

    render() {
        const {showItemModal, selectedItem, inProgress} = this.state;

        return (
            <SettingsPage
                title='Шаблоны'
                subtitle='Экспорт'
                withAddButton
                onAdd={() => this.setState({showItemModal: true, selectedItem: null})}
            >
                <PropertiesTable
                    editPermissions={[PERMISSION.editSettings]}
                    columnSettings={columnSettings}
                    items={this.state.items}
                    onEditItem={this.handleClickItem}
                    onClickItem={this.handleClickItem}
                    onDeleteItem={this.handleDeleteItem}
                />

                {showItemModal && (
                    <SettingsExportModal
                        item={selectedItem}
                        onClose={() => this.setState({selectedItem: null, showItemModal: false})}
                        onSubmit={this.handleSubmitItem}
                    />
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>

                {inProgress && <Loader/>}
            </SettingsPage>
        );
    }
}
