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
import ListEndedStub from '../../Shared/ListEndedStub/ListEndedStub';
import Form from '../../Form/Form/Form';
import {PERMISSION} from "../../../constants/Permissions";

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
    country_id: ''
};

export default class SettingsFederal extends Component {
    state = {
        form: defaultForm,
        items: [],

        pagination: {
            page: 1,
            pageCount: 1
        },

        countryItems: [],
        searchQuery: '',

        selectedItem: null,

        showItemModal: false,
        inProgress: true,
        modalInProgress: false
    };

    componentDidMount() {
        Promise.all([
            LocationService.federal.get(),
            LocationService.country.get()
        ]).then(([federalResponse, countryResponse]) => {
            this.setState({
                items: federalResponse.data,
                pagination: {
                    pageCount: +_.get(federalResponse.headers, 'x-pagination-page-count'),
                    page: +_.get(federalResponse.headers, 'x-pagination-current-page')
                },
                countryItems: countryResponse.data.map(({id, name}) => ({name, value: id})),
                inProgress: false
            });
        });
    }

    handleChangeForm = (value, prop) => {
        this.setState(prev => prev.form[prop] = value);
    };

    handleCloseModal = () => {
        this.setState({showItemModal: false, form: defaultForm});
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
                LocationService.federal.delete(item.id).then(() => {
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
            this.setState(newState, this.getFederal);
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
        const requestForm = _.pick(form, 'name', 'country_id');

        if (!requestForm.name.length) {
            NotificationManager.error('Название не может быть пустым', 'Ошибка');
        }

        this.setState({modalInProgress: true}, () => {
            LocationService.federal[method](requestForm, form.id).then(response => {
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

    getFederal = () => {
        const {pagination: {page}, searchQuery} = this.state;

        LocationService.federal
            .get({page, 'query[name]': searchQuery})
            .then(response => {
                this.setState({
                    items: this.state.items.concat(response.data),
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
            LocationService.federal
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
            countryItems,
            showItemModal,
            searchQuery,
            pagination,
            inProgress,
            modalInProgress
        } = this.state;
        const selectedCountry = countryItems.find(({value}) => value === form.country_id);

        return (
            <SettingsPage
                title='Местоположение'
                subtitle='Федеральный округ'
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
                    <ConfirmModal
                        title={form.id ? 'Изменить' : 'Добавить'}
                        width='small'
                        onClose={this.handleCloseModal}
                        onSubmit={() => this.form.submit()}
                    >
                        <Form
                            onSubmit={this.handleSubmit}
                            ref={ref => this.form = ref}
                            validate
                        >
                            <InputText
                                autoFocus
                                required
                                label='Название'
                                value={form.name}
                                onChange={value => this.handleChangeForm(value, 'name')}
                            />

                            <Select
                                label='Страна'
                                required
                                options={countryItems}
                                selected={selectedCountry}
                                onChange={({value}) => this.handleChangeForm(value, 'country_id')}
                                fixedPosList
                            />
                        </Form>

                        {modalInProgress && <Loader/>}
                    </ConfirmModal>
                )}

                <PromiseDialogModal ref={node => this.dialogModal = node}/>
            </SettingsPage>
        );
    }
}
