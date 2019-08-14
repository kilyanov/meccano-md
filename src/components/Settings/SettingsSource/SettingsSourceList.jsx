import React, {Component} from 'react';
import {LocationService, SourceService} from '../../../services';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import PropertiesTable from '../../Shared/PropertiesTable/PropertiesTable';
import SettingsPage from '../SettingsPage/SettingsPage';
import {NotificationManager} from 'react-notifications';
import ListEndedStub from '../../Shared/ListEndedStub/ListEndedStub';
import SettingsSourceModal from './SettingsSourceModal';

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

const defaultForm = {
    name: '',
    source_type_id: '',
    country_id: '',
    region_id: '',
    city_id: '',
    category: ''
};

export default class SettingsSourceList extends Component {
    state = {
        form: defaultForm,
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

    handleCloseModal = () => {
        this.setState({showItemModal: false, form: defaultForm});
    };

    handleEditItem = (item) => {
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
            this.setState({inProgress: true}, () => {
                SourceService.delete(item.id).then(() => {
                    const items = this.state.items.filter(({id}) => id !== item.id);

                    NotificationManager.success('Успешно удалено', 'Удаление');
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

    handleSubmit = (newItem) => {
        const {selectedItem} = this.state;
        let items = [...this.state.items];

        if (selectedItem) {
            items = items.map(item => item.id === selectedItem.id ? newItem : item);
        } else {
            items.push(newItem);
        }

        this.setState({items, showItemModal: false});
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
            items,
            selectedItem,
            pagination,
            typeItems,
            countryItems,
            regionItems,
            cityItems,
            showItemModal,
            searchQuery,
            inProgress
        } = this.state;

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
                    <SettingsSourceModal
                        item={selectedItem}
                        onClose={this.handleCloseModal}
                        onSubmit={this.handleSubmit}
                        typeItems={typeItems}
                        countryItems={countryItems}
                        regionItems={regionItems}
                        cityItems={cityItems}
                    />
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </SettingsPage>
        );
    }
}
