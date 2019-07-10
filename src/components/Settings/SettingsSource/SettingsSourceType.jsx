import React, {Component} from 'react';
import {SourceService} from '../../../services';
import PromiseDialogModal from '../../Shared/PromiseDialogModal/PromiseDialogModal';
import ConfirmModal from '../../Shared/ConfirmModal/ConfirmModal';
import PropertiesTable from '../../Shared/PropertiesTable/PropertiesTable';
import SettingsPage from '../SettingsPage/SettingsPage';
import InputText from '../../Form/InputText/InputText';
import {NotificationManager} from 'react-notifications';
import Loader from '../../Shared/Loader/Loader';
import ListEndedStub from '../../Shared/ListEndedStub/ListEndedStub';
import Form from '../../Form/Form/Form';

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

const defaultForm = {name: ''};

export default class SettingsSourceType extends Component {
    state = {
        form: defaultForm,
        items: [],
        pagination: {
            page: 1,
            pageCount: 1
        },
        searchQuery: '',
        showItemModal: false,
        inProgress: true,
        modalInProgress: false
    };

    componentDidMount() {
        SourceService.type.get().then(response => {
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
                SourceService.type.delete(item.id).then(() => {
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
            this.setState(newState, this.getTypes);
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
        const requestForm = _.pick(form, 'name');

        if (!requestForm.name.length) {
            NotificationManager.error('Название не может быть пустым', 'Ошибка');
        }

        this.setState({modalInProgress: true}, () => {
            SourceService.type[method](requestForm, form.id).then(response => {
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

    getTypes = () => {
        const {pagination: {page}, searchQuery} = this.state;

        SourceService.type
            .get({page, 'query[name]': searchQuery}).then(response => {
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
            SourceService.cancelLast();
            SourceService.type
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
            showItemModal,
            inProgress,
            pagination,
            searchQuery,
            modalInProgress
        } = this.state;

        return (
            <SettingsPage
                title='Источники'
                subtitle='Тип'
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
                        onClose={this.handleCloseModal}
                        onSubmit={() => this.form.submit()}
                    >
                        <Form
                            validate
                            onSubmit={this.handleSubmit}
                            ref={ref => this.form = ref}
                        >
                            <InputText
                                autoFocus
                                required
                                label='Название'
                                value={form.name}
                                onChange={value => this.handleChangeForm(value, 'name')}
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
