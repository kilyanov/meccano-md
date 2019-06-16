import React, {Component} from 'react';
import {LocationService} from '../../../services';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import PropertiesTable from '../../Shared/PropertiesTable/PropertiesTable';
import SettingsPage from '../SettingsPage/SettingsPage';
import InputText from '../../Form/InputText/InputText';
import {NotificationManager} from 'react-notifications';
import Loader from '../../Shared/Loader/Loader';

const columnSettings = {
    name: {
        name: 'Название',
        style: {width: '60%'}
    },
    createdAt: {
        type: 'moment',
        format: 'D MMM YYYY [в] HH:mm',
        name: 'Дата создания',
        style: {width: '40%'}
    }
};

export default class SettingsCountry extends Component {
    state = {
        form: {
            name: ''
        },
        items: [],
        selectedItem: null,
        showItemModal: false,
        inProgress: true,
        modalInProgress: false
    };

    componentDidMount() {
        LocationService.country.get().then(response => {
            this.setState({items: response.data, inProgress: false});
        });
    }

    handleChangeInput = (value) => {
        this.setState(prev => prev.form.name = value);
    };

    handleEditItem = (item) => {
        this.setState({
            form: item,
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
            this.setState({inProgress: true}, () => {
                LocationService.country.delete(item.id).then(() => {
                    const items = this.state.items.filter(({id}) => id !== item.id);

                    this.setState({items, inProgress: false});
                }).catch(() => this.setState({inProgress: false}));
            });
        });
    };

    handleSubmit = () => {
        const {form} = this.state;
        const method = form.id ? 'update' : 'create';
        const requestForm = _.pick(form, 'name');

        if (!requestForm.name.length) {
            NotificationManager.error('Название не может быть пустым', 'Ошибка');
        }

        this.setState({modalInProgress: true}, () => {
            LocationService.country[method](requestForm, form.id).then(response => {
                let items = [...this.state.items];

                if (form.id) {
                    items = items.map(item => item.id === form.id ? response.data : item);
                } else {
                    items.push(response.data);
                }

                NotificationManager.success('Успешно сохранено', 'Сохранено');
                this.setState({
                    items,
                    form: {name: ''},
                    showItemModal: false,
                    modalInProgress: false
                });
            }).catch(() => this.setState({modalInProgress: false}));
        });
    };

    render() {
        const {form, items, showItemModal, inProgress, modalInProgress} = this.state;

        return (
            <SettingsPage
                title='Местоположение'
                subtitle='Страна'
                withAddButton
                onAdd={() => this.setState({showItemModal: true})}
            >
                <PropertiesTable
                    columnSettings={columnSettings}
                    items={items}
                    onEditItem={this.handleEditItem}
                    onClickItem={this.handleEditItem}
                    onDeleteItem={this.handleDeleteItem}
                />

                {showItemModal && (
                    <ConfirmModal
                        title={form.id ? 'Изменить' : 'Добавить'}
                        width='small'
                        onClose={() => this.setState({showItemModal: false})}
                        onSubmit={this.handleSubmit}
                    >
                        <InputText
                            autoFocus
                            label='Название'
                            value={form.name}
                            onChange={this.handleChangeInput}
                        />

                        {modalInProgress && <Loader/>}
                    </ConfirmModal>
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
                {inProgress && <Loader/>}
            </SettingsPage>
        );
    }
}
