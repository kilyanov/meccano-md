import React, {Component} from 'react';
import Page from '../Shared/Page/Page';
import './documents-page.scss';
import Document from './Document/Document';
import InputText from '../Form/InputText/InputText';
import InputDatePicker from '../Form/InputDatePicker/InputDatePicker';
import Select from '../Form/Select/Select';
import {DOCUMENT_STATUS} from '../../constants/DocumentStatus';
import PromiseDialogModal from '../Shared/PromiseDialogModal/PromiseDialogModal';
import {DocumentService} from '../../services';
import Loader from '../Shared/Loader/Loader';
import {saveAs} from 'file-saver';

const cls = new Bem('documents-page');

export default class DocumentsPage extends Component {
    state = {
        filters: {
            name: '',
            date: null,
            status: null,
            owner: ''
        },
        filteredDocuments: [],
        documents: [],
        inProgress: true
    };

    componentDidMount() {
        this.getDocuments();
    }

    handleSearch = (value, prop) => {
        const newState = this.state;

        newState.filters[prop] = value;

        if (prop === 'status' && _.isEmpty(value)) {
            newState.filters[prop] = null;
        }

        newState.filteredDocuments = newState.documents.filter(doc => {
            let result = true;

            for (const key in newState.filters) {
                if (newState.filters.hasOwnProperty(key) && newState.filters[key]
                ) {
                    const filterValue = newState.filters[key];

                    console.log(key, filterValue);

                    if (key === 'name' || key === 'owner') {
                        const re = new RegExp(`(${filterValue})`, 'gi');

                        result = re.test(doc.name);
                        if (!result) break;
                    }

                    if (key === 'status') {
                        result = doc.status === filterValue.value;
                        if (!result) break;
                    }

                    if (key === 'date') {
                        console.log(moment(doc.date).format('YYYY.MM.DD'), moment(filterValue).format('YYYY.MM.DD'));
                        result = moment(doc.date).format('YYYY.MM.DD') === moment(filterValue).format('YYYY.MM.DD');
                        if (!result) break;
                    }
                }
            }

            return result;
        });

        this.setState(newState);
    };

    handleDelete = (doc) => {
        this.promiseModal.open({
            title: 'Удаление документа',
            content: `Вы уверены, что хотите удалить документ "${doc.name}"?`
        }).then(() => {
            DocumentService.delete(doc.id).then(this.getDocuments);
        });
    };

    getDocuments = () => {
        DocumentService.get()
            .then(response => {
                this.setState({
                    documents: response.data,
                    inProgress: false
                });
            })
            .catch(() => this.setState({inProgress: false}));
    };

    statusOptions = Object.keys(DOCUMENT_STATUS).map(value => ({name: DOCUMENT_STATUS[value], value}));

    render() {
        const {filteredDocuments, filters, inProgress} = this.state;
        const inSearch = filters.name || filters.date || !_.isEmpty(filters.status) || filters.date;
        const documents = inSearch ? filteredDocuments : this.state.documents;

        return (
            <Page {...cls()} withBar>
                <h2 {...cls('title')}>Документы</h2>

                <section {...cls('filter-panel')}>
                    <InputText
                        {...cls('filter-field')}
                        label='Название документа'
                        placeholder='Введите название'
                        value={filters.name}
                        clearable
                        onChange={value => this.handleSearch(value, 'name')}
                    />
                    <InputDatePicker
                        {...cls('filter-field')}
                        label='Дата'
                        value={filters.date}
                        clearable
                        onChange={value => this.handleSearch(value, 'date')}
                    />
                    {/*<InputText*/}
                    {/*    {...cls('filter-field')}*/}
                    {/*    label='Имя пользователя'*/}
                    {/*    placeholder='Введите имя пользователя'*/}
                    {/*    value={filters.owner}*/}
                    {/*    clearable*/}
                    {/*    onChange={value => this.handleSearch(value, 'owner')}*/}
                    {/*/>*/}
                    <Select
                        {...cls('filter-field')}
                        label='Статус'
                        placeholder='Выберите статус'
                        options={this.statusOptions}
                        selected={filters.status}
                        onChange={value => this.handleSearch(value, 'status')}
                        withSearch
                    />
                </section>

                <section {...cls('document-list')}>
                    {documents.map((document, documentIndex) => (
                        <Document
                            {...cls('document')}
                            key={documentIndex}
                            document={document}
                            onDelete={this.handleDelete}
                        />
                    ))}

                    {!documents.length && (
                        <span {...cls('empty-msg')}>{inSearch ? 'Нет результатов' : 'Нет документов'}</span>
                    )}
                </section>

                <PromiseDialogModal ref={ref => this.promiseModal = ref} />

                {inProgress && <Loader fixed />}
            </Page>
        );
    }
}
