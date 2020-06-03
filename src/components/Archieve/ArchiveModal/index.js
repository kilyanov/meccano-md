import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from "../../Shared/ConfirmModal/ConfirmModal";
import BEMHelper from "react-bem-helper";
import InputSearch from "../../Form/InputSearch";
import './archive-modal.scss';

const cls = new BEMHelper('archive-modal');

export default class ArchiveModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired
    };

    state = {
        search: ''
    }

    handleSearch = (value) => {
        this.setState({ search: value });
    };

    render() {
        const { onClose } = this.props;
        const { search } = this.state;

        return (
            <ConfirmModal
                {...cls()}
                title='Архив'
                onClose={onClose}
            >
                <section {...cls('filters')}>
                    <InputSearch
                        onChange={this.handleSearch}
                        value={search}
                    />
                </section>

                <section {...cls('body')}>
                    Нет элементов
                </section>
            </ConfirmModal>
        );
    }
}
