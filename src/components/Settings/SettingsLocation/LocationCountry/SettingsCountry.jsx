import React, {Component} from 'react';
import {LocationService} from '../../../../services';
import PromiseDialogModal from '../../../Shared/PromiseDialogModal/PromiseDialogModal';
import PropertiesTable from '../../../Shared/PropertiesTable/PropertiesTable';
import SettingsPage from '../../SettingsPage/SettingsPage';
import {NotificationManager} from 'react-notifications';
import ListEndedStub from '../../../Shared/ListEndedStub/ListEndedStub';
import {PERMISSION} from "../../../../constants";
import LocationCountryModal from "./LocationCountryModal";

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
        items: [],
        pagination: {
            page: 1,
            pageCount: 1
        },
        selectedItem: null,
        searchQuery: '',
        showItemModal: false,
        inProgress: true,
    };

    componentDidMount() {
        LocationService.country.get().then(response => {
            this.setState({
                items: response.data,
                pagination: {
                    pageCount: +_.get(response.headers, 'x-pagination-page-count'),
                    page: +_.get(response.headers, 'x-pagination-current-page')
                },
                inProgress: false
            });
        }).catch(() => this.setState({inProgress: false}));
    }

    handleCloseModal = () => {
        this.setState({
            showItemModal: false,
            selectedItem: null
        });
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
            danger: true
        }).then(() => {
            this.setState({inProgress: true}, () => {
                LocationService.country.delete(item.id).then(() => {
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
            this.setState(newState, this.getCounties);
        }
    };

    handleSearch = (query) => {
        const searchQuery = query.trim().toLowerCase();

        this.setState({searchQuery: query}, () => {
            this.debouncedSearch(searchQuery);
        });
    };

    getCounties = (isPagination = true) => {
        const {pagination: {page}, searchQuery} = this.state;

        LocationService.country
            .get({page, 'query[name]': searchQuery})
            .then(response => {
                this.setState({
                    items: isPagination ? this.state.items.concat(response.data) : response.data,
                    pagination: {
                        pageCount: +_.get(response.headers, 'x-pagination-page-count'),
                        page: +_.get(response.headers, 'x-pagination-current-page')
                    },
                    inProgress: false
                });
            })
            .catch(() => this.setState({inProgress: false}));
    };

    debouncedSearch = _.debounce((value) => {
        this.setState({inProgress: true}, () => {
            LocationService.cancelLast();
            LocationService.country
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
            pagination,
            showItemModal,
            selectedItem,
            searchQuery,
            inProgress
        } = this.state;

        return (
            <SettingsPage
                title='Местоположение'
                subtitle='Страна'
                withAddButton
                onAdd={() => this.setState({showItemModal: true})}
                onEndPage={this.handleEndPage}
                onSearch={this.handleSearch}
                searchQuery={searchQuery}
                inProgress={inProgress}
            >
                <PropertiesTable
                    editPermissions={[PERMISSION.editSettings]}
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
                    <LocationCountryModal
                        onClose={this.handleCloseModal}
                        onSubmit={() => this.getCounties(false)}
                        item={selectedItem}
                    />
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </SettingsPage>
        );
    }
}
