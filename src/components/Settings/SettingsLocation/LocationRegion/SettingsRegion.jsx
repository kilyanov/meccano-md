import React, {Component} from 'react';
import {LocationService} from '../../../../services';
import PromiseDialogModal from '../../../Shared/PromiseDialogModal/PromiseDialogModal';
import ConfirmModal from '../../../Shared/ConfirmModal/ConfirmModal';
import PropertiesTable from '../../../Shared/PropertiesTable/PropertiesTable';
import SettingsPage from '../../SettingsPage/SettingsPage';
import InputText from '../../../Form/InputText/InputText';
import {NotificationManager} from 'react-notifications';
import Loader from '../../../Shared/Loader/Loader';
import Select from '../../../Form/Select/Select';
import ListEndedStub from '../../../Shared/ListEndedStub/ListEndedStub';
import Form from '../../../Form/Form/Form';
import {PERMISSION} from "../../../../constants/Permissions";
import LocationRegionModal from "./LocationRegionModal";

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
        items: [],
        pagination: {
            page: 1,
            pageCount: 1
        },
        selectedItem: null,
        searchQuery: '',
        showItemModal: false,
        inProgress: true
    };

    componentDidMount() {
        this.getRegions(false);
    }

    handleCloseModal = () => {
        this.setState({showItemModal: false, selectedItem: null});
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
                LocationService.region.delete(item.id).then(() => {
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
            this.setState(newState, this.getRegions);
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

    getRegions = (isPagination = true) => {
        const {pagination: {page}, searchQuery} = this.state;

        LocationService.region
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
            LocationService.region
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
            searchQuery,
            showItemModal,
            pagination,
            inProgress,
            selectedItem
        } = this.state;

        return (
            <SettingsPage
                title='Местоположение'
                subtitle='Регион'
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
                    <LocationRegionModal
                        onClose={this.handleCloseModal}
                        onSubmit={() => this.getRegions(false)}
                        item={selectedItem}
                    />
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </SettingsPage>
        );
    }
}
