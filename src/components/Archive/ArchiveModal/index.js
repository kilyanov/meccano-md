import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from "../../Shared/ConfirmModal/ConfirmModal";
import BEMHelper from "react-bem-helper";
import InputSearch from "../../Form/InputSearch";
import './archive-modal.scss';
import 'react-dates/initialize';
import { ArchiveService } from "../../../services";
import DateRange from "../../Form/DateRange";
import StorageIcon from "../../Shared/SvgIcons/StorageIcon";
import Loader from "../../Shared/Loader/Loader";
import { Link } from "react-router-dom";
import TrashIcon from "../../Shared/SvgIcons/TrashIcon";
import PromiseDialogModal from "../../Shared/PromiseDialogModal/PromiseDialogModal";
import Button from '../../Shared/Button/Button';
import CheckBox from '../../Form/CheckBox/CheckBox';
import ArchiveCreateModal from '../ArchiveCreateModal';
import { NotificationManager } from 'react-notifications';
import ArchivesExportModal from '../ArchivesExportModal/ArchivesExportModal';

const cls = new BEMHelper('archive-modal');

export default class ArchiveModal extends Component {
    static propTypes = {
        articleIds: PropTypes.array,
        projectId: PropTypes.string.isRequired,
        onSubmit: PropTypes.func,
        onClose: PropTypes.func.isRequired,
        isAll: PropTypes.bool,
        isOpenArchivesExportModal: PropTypes.bool
    };

    state = {
        search: '',
        startDate: moment().subtract(1, 'week'),
        endDate: moment(),
        archives: [],
        showCreateModal: false,
        selectedArchiveId: null,
        inProgress: true,
        selectedArchives: [],
        isOpenArchivesExportModal: false
    }

    componentDidMount() {
        this.getArchives();
    }

    handleDatesChange = ({ startDate, endDate }) => {
        this.setState({ startDate, endDate }, () => {
            if (startDate && endDate) {
                this.setState({ inProgress: true }, this.getArchives);
            }
        });
    }

    handleSearch = (value) => {
        this.setState({ search: value });
    };

    handleDelete  = (archive) => {
        const { projectId } = this.props;

        if (archive && archive.id && projectId) {
            this.promiseDialogModal.open({
                title: 'Удаление архива',
                content: `Вы уверены, что хотите удалить архив от ${moment(archive.date).format('D MMM YYYY[г.] HH:mm')}?`,
                submitText: 'Удалить',
                danger: true
            }).then(() => {
                this.setState({ inProgress: true }, () => {
                    ArchiveService.delete(projectId, archive.id).then(this.getArchives);
                });
            });
        }
    };

    handleSubmitAddArticles = () => {
        const { articleIds, isAll } = this.props;
        const { selectedArchiveId } = this.state;

        if (!selectedArchiveId || !articleIds || (!articleIds.length && !isAll)) {
            return;
        }

        this.setState({ inProgress: true }, () => {
            ArchiveService
                .addArticles(selectedArchiveId, isAll ? { all: true } : { articleIds })
                .then(() => {
                    NotificationManager.success(
                        'Добавление в архив',
                        articleIds.length === 1 ? 'Статья успешно добавлена в архив' : 'Статьи успешно добавлены в архив'
                    );
                })
                .finally(() => {
                    this.setState({ inProgress: false }, () => {
                        this.props.onSubmit();
                        this.props.onClose();
                    });
                });
        });
    }

    handleExport = () => {
        this.setState({ isOpenArchivesExportModal: true });
    }

    handleSelectArchive = (id) => {
        const selectedArchives = [... this.state.selectedArchives];
        const isFound = selectedArchives.includes(id);
        if (isFound) {
            const indexArchive = selectedArchives.indexOf(id);
            selectedArchives.splice(indexArchive, 1);
            return this.setState({ selectedArchives });
        }
        this.setState({
            selectedArchives: [
                ...selectedArchives,
                id
            ]
        });
    }

    handleResetSelectedArchives = () => {
        this.setState({ selectedArchives: [] });
    }

    getArchives = () => {
        const { projectId } = this.props;
        const { startDate, endDate } = this.state;

        ArchiveService
            .list(projectId, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))
            .then(response => {
                this.setState({ archives: response.data, inProgress: false });
            })
            .catch(() => this.setState({ inProgress: false }));
    
        this.handleResetSelectedArchives();
    }

    checkIsSelected = (id) => {
        return this.state.selectedArchives.includes(id);
    }

    render() {
        const { onClose, projectId, isAll, articleIds } = this.props;
        const { archives, search, startDate, endDate, inProgress, showCreateModal, selectedArchiveId } = this.state;
        const isSelectArchiveMode = articleIds && articleIds.length;

        return (
            <ConfirmModal
                {...cls()}
                title='Архив'
                onClose={onClose}
                buttons={isSelectArchiveMode ? ['cancel', 'submit'] : []}
                submitText='Перенести'
                submitStyle='error'
                submitDisabled={!selectedArchiveId || inProgress}
                onSubmit={this.handleSubmitAddArticles}
            >
                {isSelectArchiveMode && (
                    <Button
                        {...cls('create-button')}
                        style="success"
                        title='Создать архив'
                        onClick={() => this.setState({ showCreateModal: true })}
                    >+</Button>
                )}
                <section {...cls('filters')}>
                    <InputSearch
                        { ...cls('filter-item') }
                        onChange={this.handleSearch}
                        value={search}
                    />
                    <DateRange
                        { ...cls('filter-item') }
                        startDate={startDate}
                        endDate={endDate}
                        anchorDirection='right'
                        onChange={this.handleDatesChange}
                        maxDate={moment()}
                    />
                </section>

                <section {...cls('body')}>
                    {archives.length ? (
                        <ul { ...cls('list') }>
                            {archives.map((archive) => (
                                isSelectArchiveMode ? (
                                    <li 
                                        { ...cls('item', {
                                            selected: selectedArchiveId === archive.id,
                                            disabled: inProgress
                                        }) }
                                        key={archive.id}
                                        onClick={() => this.setState({ selectedArchiveId: archive.id })}
                                    >
                                        <div {...cls('item-container')}>
                                            <StorageIcon { ...cls('item-icon') }/>
                                            <div { ...cls('item-data') }>
                                                <span { ...cls('item-name') }>
                                                    {moment(archive.date).format('DD.MM.YYYY [в] HH:mm')}
                                                </span>
                                                <span { ...cls('item-description') }>
                                                    { archive.description }
                                                </span>
                                            </div>
                                        </div>
                                        <div {...cls('item-tag')}>
                                            {selectedArchiveId === archive.id ? 'Выбран' : 'Выбрать'}
                                        </div>
                                    </li>
                                ) : (
                                    <li { ...cls('item') } key={archive.id}>
                                        <CheckBox
                                            {...cls('select-archive')}
                                            checked={this.checkIsSelected(archive.id)}
                                            onChange={() => this.handleSelectArchive(archive.id)}
                                        />
                                        <Link
                                            { ...cls('item-link') }
                                            to={`/archive/${projectId}/${archive.id}`}
                                            onClick={() => this.props.onClose()}
                                        >
                                            <div {...cls('item-container')}>
                                                <StorageIcon { ...cls('item-icon') }/>
                                                <div { ...cls('item-data') }>
                                                    <span { ...cls('item-name') }>
                                                        {moment(archive.date).format('DD.MM.YYYY [в] HH:mm')}
                                                    </span>
                                                    <span { ...cls('item-description') }>
                                                        { archive.description }
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                        <button
                                            { ...cls('item-delete') }
                                            onClick={() => this.handleDelete(archive)}
                                        ><TrashIcon/></button>
                                    </li>
                                )
                            ))}
                        </ul>
                    ) : 'Нет элементов в выбранном периоде'}
                </section>

                <div {...cls('footer')}>
                    {!!this.state.selectedArchives.length && (
                        <Button
                            {...cls('unselect-button')}
                            onClick={this.handleResetSelectedArchives}
                            style='inline'
                        >
                            Отмена
                        </Button>

                    )}
                    <Button
                        {...cls('export-button')}
                        onClick={this.handleExport}
                        disabled={!this.state.selectedArchives?.length}
                        style="success"
                    >
                        Выгрузить выделенные {!!this.state.selectedArchives.length && 
                            <span>{this.state.selectedArchives.length}</span>
                        }
                    </Button>
                </div>

                {showCreateModal && (
                    <ArchiveCreateModal
                        projectId={projectId}
                        articleIds={articleIds}
                        isAll={isAll}
                        onSuccessCreate={() => {
                            this.props.onSubmit();
                            this.props.onClose();
                        }}
                        onClose={() => this.setState({ showCreateModal: false })}
                    />
                )}
                 
                {this.state.isOpenArchivesExportModal && (
                    <ArchivesExportModal
                        projectId={this.props.projectId}
                        archiveIds={this.state.selectedArchives}
                        onClose={() => this.setState({ isOpenArchivesExportModal: false })}
                        onUpdate={this.handleResetSelectedArchives}
                    />
                )}

                <PromiseDialogModal ref={node => this.promiseDialogModal = node}/>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
