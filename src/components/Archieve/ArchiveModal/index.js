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


const cls = new BEMHelper('archive-modal');

export default class ArchiveModal extends Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired
    };

    state = {
        search: '',
        startDate: moment().subtract(1, 'week'),
        endDate: moment(),
        archives: [],
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

    getArchives = () => {
        const { projectId } = this.props;
        const { startDate, endDate } = this.state;

        ArchiveService
            .list(projectId, startDate.format(), endDate.format())
            .then(response => {
                this.setState({ archives: response.data, inProgress: false });
            })
            .catch(() => this.setState({ inProgress: false }));
    }

    render() {
        const { onClose } = this.props;
        const { archives, search, startDate, endDate, inProgress } = this.state;

        return (
            <ConfirmModal
                {...cls()}
                title='Архив'
                onClose={onClose}
            >
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
                                <li { ...cls('item') } key={archive.id}>
                                    <StorageIcon { ...cls('item-icon') }/>
                                    <div { ...cls('item-data') }>
                                        <span { ...cls('item-name') }>
                                            {moment(archive.date).format('DD.MM.YYYY [в] HH:mm')}
                                        </span>
                                        <span { ...cls('item-description') }>
                                            { archive.description }
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : 'Нет элементов'}
                </section>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
