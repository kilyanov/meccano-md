import React, {Component} from 'react';
import {LocationService, SourceService} from '../../../services';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import PropertiesTable from '../../Shared/PropertiesTable/PropertiesTable';
import SettingsPage from '../SettingsPage/SettingsPage';
import InputText from '../../Form/InputText/InputText';
import {NotificationManager} from 'react-notifications';
import Loader from '../../Shared/Loader/Loader';
import Select from '../../Form/Select/Select';
import ListEndedStub from '../../Shared/ListEndedStub/ListEndedStub';

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

export default class SettingsSourceList extends Component {
    state = {
        form: {
            name: '',
            source_type_id: '',
            country_id: '',
            region_id: '',
            city_id: '',
            category: ''
        },
        items: [],

        pagination: {
            page: 1,
            pageCount: 1
        },

        typeItems: [],
        countryItems: [],
        regionItems: [],
        cityItems: [],

        selectedItem: null,
        showItemModal: false,
        searchQuery: '',

        inProgress: true,
        modalInProgress: false
    };

    componentDidMount() {
        Promise.all([
            SourceService.get(),
            SourceService.type.get(),
            LocationService.country.get()
        ]).then(([
            sourceResponse,
            typeResponse,
            countryResponse
        ]) => {
            this.setState({
                items: sourceResponse.data,
                pagination: {
                    pageCount: +_.get(sourceResponse.headers, 'x-pagination-page-count'),
                    page: +_.get(sourceResponse.headers, 'x-pagination-current-page')
                },
                typeItems: typeResponse.data.map(({id, name}) => ({name, value: id})),
                countryItems: countryResponse.data.map(({id, name}) => ({name, value: id})),
                inProgress: false
            });
        }).catch(() => this.setState({inProgress: false}));
    }

    handleChangeForm = (value, prop) => {
        const newState = _.clone(this.state);
        const isCountryChange = prop === 'country_id';
        const isRegionChange = prop === 'region_id';

        if (prop && value) {
            newState.form[prop] = value;
            newState.modalInProgress = isCountryChange || isRegionChange;

            if (isCountryChange) {
                newState.form.region_id = '';
                newState.form.city_id = '';
                newState.regionItems = [];
                newState.cityItems = [];
            }

            if (isRegionChange) {
                newState.form.city_id = '';
                newState.cityItems = [];
            }

            this.setState(newState, () => {
                if (isCountryChange && value) {
                    this.getRegions(value);
                }

                if (isRegionChange && value) {
                    this.getCities(value);
                }
            });
        }
    };

    handleEditItem = (item) => {
        const hasCountry = !!item.country_id;
        const hasRegion = !!item.region_id;

        this.setState({
            form: item,
            modalInProgress: hasCountry || hasRegion,
            showItemModal: true
        }, () => {
            if (hasCountry && !hasRegion) {
                this.getRegions(item.country_id);
            }

            if (hasRegion) {
                this.getCities(item.region_id);
            }
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
                SourceService.delete(item.id).then(() => {
                    const items = this.state.items.filter(({id}) => id !== item.id);

                    this.setState({items, inProgress: false});
                }).catch(() => this.setState({inProgress: false}));
            });
        });
    };

    handleEndPage = () => {
        const {inProgress, pagination: {page, pageCount}} = this.state;

        if (page < pageCount && !inProgress) {
            const newState = this.state;

            newState.pagination.page = newState.pagination.page + 1;
            newState.inProgress = true;
            this.setState(newState, this.getSources);
        }
    };

    handleSearch = (query) => {
        const searchQuery = query.trim().toLowerCase();

        this.setState({searchQuery: query}, () => {
            this.debouncedSearch(searchQuery);
        });
    };

    handleSubmit = () => {
        const {form} = this.state;
        const method = form.id ? 'update' : 'create';
        const requestForm = _.pick(form, [
            'name',
            'city_id',
            'country_id',
            'region_id',
            'source_type_id',
            'category'
        ]);

        if (!requestForm.name.length) {
            NotificationManager.error('Название не может быть пустым', 'Ошибка');
        }

        this.setState({modalInProgress: true}, () => {
            SourceService[method](requestForm, form.id).then(response => {
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
                    modalInProgress: false,
                    showItemModal: false
                });
            }).catch(() => this.setState({modalInProgress: false}));
        });
    };

    getSources = () => {
        const {pagination: {page}, searchQuery} = this.state;

        SourceService.get({page, 'query[name]': searchQuery}).then(response => {
            this.setState({
                items: this.state.items.concat(response.data),
                pagination: {
                    pageCount: +_.get(response.headers, 'x-pagination-page-count'),
                    page: +_.get(response.headers, 'x-pagination-current-page')
                },
                inProgress: false
            });
        });
    };

    getRegions = (countryId) => {
        LocationService
            .region
            .get('', {'query[country_id]': countryId})
            .then(response => {
                this.setState({
                    regionItems: response.data.map(({id, name}) => ({name, value: id})),
                    modalInProgress: false
                });
            }).catch(() => this.setState({modalInProgress: false}));
    };

    getCities = (regionId) => {
        LocationService
            .city
            .get('', {'query[region_id]': regionId})
            .then(response => {
                this.setState({
                    cityItems: response.data.map(({id, name}) => ({name, value: id})),
                    modalInProgress: false
                });
            }).catch(() => this.setState({modalInProgress: false}));
    };

    debouncedSearch = _.debounce((value) => {
        this.setState({inProgress: true}, () => {
            SourceService.cancelLast();
            SourceService
                .get({'query[name]': value})
                .then(response => {
                    this.setState({
                        inProgress: false,
                        items: response.data,
                        pagination: {
                            pageCount: +_.get(response.headers, 'x-pagination-page-count'),
                            page: +_.get(response.headers, 'x-pagination-current-page')
                        }
                    });
                })
                .catch(() => this.setState({inProgress: false}));
        });
    }, 1000);

    render() {
        const {
            form,
            items,
            pagination,
            typeItems,
            countryItems,
            regionItems,
            cityItems,
            showItemModal,
            searchQuery,
            inProgress,
            modalInProgress
        } = this.state;
        const selectedType = typeItems.find(({value}) => value === form.source_type_id);
        const selectedCountry = countryItems.find(({value}) => value === form.country_id);
        const selectedRegion = regionItems.find(({value}) => value === form.region_id);
        const selectedCity = cityItems.find(({value}) => value === form.city_id);

        return (
            <SettingsPage
                title='Источники'
                subtitle='Список'
                withAddButton
                onAdd={() => this.setState({showItemModal: true})}
                onEndPage={this.handleEndPage}
                onSearch={this.handleSearch}
                searchQuery={searchQuery}
                inProgress={inProgress}
            >
                <PropertiesTable
                    columnSettings={columnSettings}
                    items={items}
                    onEditItem={this.handleEditItem}
                    onClickItem={this.handleEditItem}
                    onDeleteItem={this.handleDeleteItem}
                />

                {(pagination.page === pagination.pageCount && !inProgress) && (
                    <ListEndedStub/>
                )}

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
                            label='Тип источника'
                            options={typeItems}
                            selected={selectedType}
                            onChange={({value}) => this.handleChangeForm(value, 'source_type_id')}
                            fixedPosList
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
                                label='Регион'
                                options={regionItems}
                                selected={selectedRegion}
                                onChange={({value}) => this.handleChangeForm(value, 'region_id')}
                                fixedPosList
                            />
                        )}

                        {!!form.region_id && (
                            <Select
                                label='Город'
                                options={cityItems}
                                selected={selectedCity}
                                onChange={({value}) => this.handleChangeForm(value, 'city_id')}
                                fixedPosList
                            />
                        )}

                        {modalInProgress && <Loader/>}
                    </ConfirmModal>
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </SettingsPage>
        );
    }
}
