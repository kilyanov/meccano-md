import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from "../../Shared/ConfirmModal/ConfirmModal";
import BEMHelper from "react-bem-helper";
import InputSearch from "../../Form/InputSearch";
import './archive-modal.scss';
import 'react-dates/initialize';
import { ArchiveService, } from "../../../services";
import DateRange from "../../Form/DateRange";
import StorageIcon from "../../Shared/SvgIcons/StorageIcon";
import Loader from "../../Shared/Loader/Loader";
import { Link } from "react-router-dom";
import TrashIcon from "../../Shared/SvgIcons/TrashIcon";
import PromiseDialogModal from "../../Shared/PromiseDialogModal/PromiseDialogModal";
import Button from '../../Shared/Button/Button';
import ArchiveCreateModal from '../ArchiveCreateModal';
import { NotificationManager } from 'react-notifications';

const cls = new BEMHelper('archive-modal');

export default class ArchiveModal extends Component {
    static propTypes = {
        articleIds: PropTypes.array,
        projectId: PropTypes.string.isRequired,
        updateArticels: PropTypes.node,
        onClose: PropTypes.func.isRequired,
        isAll: PropTypes.bool
    };

    state = {
        search: '',
        startDate: moment().subtract(1, 'week'),
        endDate: moment(),
        archives: [],
        showCreateModal: false,
        selectedArchiveId: null,
        inProgress: true
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

        if (!selectedArchiveId || !articleIds || !articleIds.length) {
            return;
        }

        ArchiveService
            .addArticles(selectedArchiveId, articleIds)
            .then(() => {
                NotificationManager.success(
                    'Добавление в архив', 
                    articleIds.length === 1 ? 'Статья успешно добавлена в архив' : 'Статьи успешно добавлены в архив'
                );

                if (this.props.updateArticels) {
                    this.props.updateArticels();
                }

                this.props.onClose();
            });
    }
    

    getArchives = () => {
        const { projectId, articleIds } = this.props;
        const { startDate, endDate } = this.state;

        ArchiveService
            .list(projectId, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))
            .then(response => {
                this.setState({ archives: response.data, inProgress: false });
            })
            .catch(() => this.setState({ inProgress: false }));
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
                submitDisabled={!selectedArchiveId}
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
                            {archives.map(archive => (
                                isSelectArchiveMode ? (
                                    <li 
                                        { ...cls('item', { selected: selectedArchiveId === archive.id} ) } 
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
                                        <div {...cls('item-tag')}>{selectedArchiveId === archive.id ? 'Выбран' : 'Выбрать'}</div>
                                    </li>
                                ) : (
                                    <li { ...cls('item') } key={archive.id}>
                                        <Link { ...cls('item-link') } to={`/archive/${projectId}/${archive.id}`} target='_blank'>
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

                {showCreateModal && (
                    <ArchiveCreateModal
                        projectId={projectId}
                        articleIds={articleIds}
                        isAll={isAll}
                        onClose={() => this.setState({ showCreateModal: false })}
                    />
                )}

                <PromiseDialogModal ref={node => this.promiseDialogModal = node}/>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
