import React, {Component} from 'react';
import {LocationService} from '../../../services';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import PropertiesTable from '../../Shared/PropertiesTable/PropertiesTable';
import SettingsPage from '../SettingsPage/SettingsPage';
import InputText from '../../Form/InputText/InputText';
import {NotificationManager} from 'react-notifications';
import Loader from '../../Shared/Loader/Loader';
import Select from '../../Form/Select/Select';

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

export default class SettingsRegion extends Component {
    state = {
        form: {
            name: '',
            country_id: '',
            federal_district_id: ''
        },
        items: [],
        countryItems: [],
        federalItems: [],
        selectedItem: null,
        showItemModal: false,
        inProgress: true,
        modalInProgress: false
    };

    componentDidMount() {
        Promise.all([
            LocationService.region.get(),
            LocationService.country.get()
            // LocationService.federal.get(),
        ]).then(([
            regionResponse,
            countryResponse
            // federalResponse
        ]) => {
            this.setState({
                items: regionResponse.data,
                // federalItems: federalResponse.data.map(({id, name}) => ({name, value: id})),
                countryItems: countryResponse.data.map(({id, name}) => ({name, value: id})),
                inProgress: false
            });
        });
    }

    handleChangeForm = (value, prop) => {
        const newState = this.state;
        const isCountryChange = prop === 'country_id';

        if (value && prop) {
            newState.form[prop] = value;
            newState.modalInProgress = isCountryChange;

            if (isCountryChange) {
                newState.form.federal_district_id = '';
                newState.federalItems = [];
            }
        }

        this.setState(newState, () => {
            if (isCountryChange) {
                this.getFederalItems();
            }
        });
    };

    handleEditItem = (item) => {
        const hasCountry = !!item.country_id;

        this.setState({
            form: item,
            modalInProgress: hasCountry,
            showItemModal: true
        }, () => {
            if (hasCountry) this.getFederalItems(item.country_id);
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
                LocationService.federal.delete(item.id).then(() => {
                    const items = this.state.items.filter(({id}) => id !== item.id);

                    this.setState({items, inProgress: false});
                }).catch(() => this.setState({inProgress: false}));
            });
        });
    };

    handleSubmit = () => {
        const {form} = this.state;
        const method = form.id ? 'update' : 'create';
        const requestForm = _.pick(form, 'name', 'country_id', 'federal_district_id');

        if (!requestForm.name.length) {
            NotificationManager.error('Название не может быть пустым', 'Ошибка');
        }

        this.setState({modalInProgress: true}, () => {
            LocationService.region[method](requestForm, form.id).then(response => {
                let items = [...this.state.items];

                if (form.id) {
                    items = items.map(item => item.id === form.id ? response.data : item);
                } else {
                    items.push(response.data);
                }

                this.setState({
                    items,
                    form: {name: ''},
                    showItemModal: false,
                    modalInProgress: false
                });
            }).catch(() => this.setState({modalInProgress: false}));
        });
    };

    getFederalItems = (countryId = this.state.form.country_id) => {
        LocationService
            .federal
            .get('', {'query[country_id]': countryId})
            .then(response => {
                this.setState({
                    federalItems: response.data.map(({id, name}) => ({name, value: id})),
                    modalInProgress: false
                });
            })
            .catch(() => this.setState({modalInProgress: false}));
    };

    render() {
        const {
            form,
            items,
            countryItems,
            federalItems,
            showItemModal,
            inProgress,
            modalInProgress
        } = this.state;
        const selectedCountry = countryItems.find(({value}) => value === form.country_id);
        const selectedFederal = federalItems.find(({value}) => value === form.federal_district_id);

        return (
            <SettingsPage
                title='Местоположение'
                subtitle='Регион'
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
                        onClose={() => this.setState({showItemModal: false, form: {name: ''}})}
                        onSubmit={this.handleSubmit}
                    >
                        <InputText
                            autoFocus
                            label='Название'
                            value={form.name}
                            onChange={value => this.handleChangeForm(value, 'name')}
                        />

                        <Select
                            label='Страна'
                            options={countryItems}
                            selected={selectedCountry}
                            onChange={({value}) => this.handleChangeForm(value, 'country_id')}
                            fixedPosList
                        />

                        {!!form.country_id && (
                            <Select
                                label='Федеральный округ'
                                options={federalItems}
                                selected={selectedFederal}
                                onChange={({value}) => this.handleChangeForm(value, 'federal_district_id')}
                                fixedPosList
                            />
                        )}

                        {modalInProgress && <Loader/>}
                    </ConfirmModal>
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
                {inProgress && <Loader/>}
            </SettingsPage>
        );
    }
}
