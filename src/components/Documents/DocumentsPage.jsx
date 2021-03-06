import React, { Component } from 'react';
import Page from '../Shared/Page/Page';
import './documents-page.scss';
import InputText from '../Form/InputText/InputText';
import InputDatePicker from '../Form/InputDatePicker/InputDatePicker';
import Select from '../Form/Select/Select';
import { DOCUMENT_STATUS, EVENTS, PERMISSION } from '../../constants';
import PromiseDialogModal from '../Shared/PromiseDialogModal/PromiseDialogModal';
import { DocumentService } from '../../services';
import Loader from '../Shared/Loader/Loader';
import { EventEmitter } from "../../helpers";
import Access from "../Shared/Access/Access";
import Document from "./Document";
import { isAccess } from "../../helpers/Tools";

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
        this.highlightDocumentId = this.props.match.params.id;
        EventEmitter.on(EVENTS.APP_CONTAINER_SCROLL_END, this.handleEndPage);
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
                if (newState.filters.hasOwnProperty(key) && newState.filters[key]) {
                    const filterValue = newState.filters[key];

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
                        result = moment(doc.updatedAt).startOf('day').isSame(filterValue);
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
            title: '???????????????? ??????????????????',
            content: `???? ??????????????, ?????? ???????????? ?????????????? ???????????????? "${doc.name}"?`,
            danger: true
        }).then(() => {
            DocumentService.delete(doc.id).then(this.getDocuments);
        });
    };

    handleEndPage = () => {
    };

    getDocuments = () => {
        DocumentService.get('', { sort: '-updated_at' })
            .then(response => {
                this.setState({
                    documents: response.data,
                    inProgress: false
                }, this.scrollToHighlighted);
            })
            .catch(() => this.setState({ inProgress: false }));
    };

    scrollToHighlighted = () => {
        if (this.highlightDocumentId) {
            const appDOM = document.querySelector('.app');
            const documentDOM = document.querySelector(`[data-id="${this.highlightDocumentId}"]`);

            if (appDOM && documentDOM && documentDOM.offsetTop) {
                appDOM.scrollTo({ top: documentDOM.offsetTop + 50, behavior: 'smooth' });
            }
        }
    };

    statusOptions = Object.keys(DOCUMENT_STATUS).map(value => ({ name: DOCUMENT_STATUS[value], value }));

    render() {
        const { filteredDocuments, filters, inProgress } = this.state;
        const inSearch = filters.name || filters.date || !_.isEmpty(filters.status) || filters.date;
        const documents = inSearch ? filteredDocuments : this.state.documents;

        return (
            <Access
                permissions={[ PERMISSION.viewDocuments, PERMISSION.editDocuments ]}
                redirect='/'
            >
                <Page title='??????????????????' {...cls()} withBar>
                    <section {...cls('filter-panel')}>
                        <InputText
                            {...cls('filter-field')}
                            label='???????????????? ??????????????????'
                            placeholder='?????????????? ????????????????'
                            value={filters.name}
                            clearable
                            onChange={value => this.handleSearch(value, 'name')}
                        />
                        <InputDatePicker
                            {...cls('filter-field')}
                            label='????????'
                            value={filters.date}
                            clearable
                            onChange={value => this.handleSearch(value, 'date')}
                        />
                        {/* <InputText */}
                        {/*    {...cls('filter-field')}*/}
                        {/*    label='?????? ????????????????????????'*/}
                        {/*    placeholder='?????????????? ?????? ????????????????????????'*/}
                        {/*    value={filters.owner}*/}
                        {/*    clearable*/}
                        {/*    onChange={value => this.handleSearch(value, 'owner')}*/}
                        {/* /> */}
                        <Select
                            {...cls('filter-field')}
                            label='????????????'
                            placeholder='???????????????? ????????????'
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
                                canDelete={isAccess(PERMISSION.editDocuments)}
                                highlighted={document.id === this.highlightDocumentId}
                                onDelete={this.handleDelete}
                            />
                        ))}

                        {!documents.length && (
                            <span {...cls('empty-msg')}>{inSearch ? '?????? ??????????????????????' : '?????? ????????????????????'}</span>
                        )}
                    </section>

                    <PromiseDialogModal ref={ref => this.promiseModal = ref}/>

                    {inProgress && <Loader fixed/>}
                </Page>
            </Access>
        );
    }
}
