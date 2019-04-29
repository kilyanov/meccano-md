import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './project-table-settings-modal.scss';
import ConfirmModal from '../../../../Shared/ConfirmModal/ConfirmModal';
import { COLUMN_TYPE, COLUMN_NAME, DEFAULT_COLUMNS } from '../Columns';
import CheckBox from '../../../../Form/CheckBox/CheckBox';
import { StorageService } from '../../../../../services/StorageService';

const classes = new Bem('project-table-settings-modal');

export default class ProjectTableSettingsModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired
    };

    constructor() {
        super();

        const storageValue = StorageService.get('project-table-columns');
        const storageColumns = storageValue && JSON.parse(storageValue);

        this.state = {
            columns: storageColumns || [...DEFAULT_COLUMNS]
        };
    }

    handleChangeColumns = (checked, column) => {
        let { columns } = this.state;

        if (checked) columns.push(column);
        else columns = columns.filter(key => key !== column);

        this.setState({columns});
    };

    handleSubmit = () => {
        const {columns} = this.state;

        StorageService.set('project-table-columns', JSON.stringify(columns));

        this.props.onChange(columns);
        this.props.onClose();
    };

    render() {
        const {columns} = this.state;

        return (
            <ConfirmModal
                title='Настройка столбцов'
                onClose={this.props.onClose}
                onSubmit={this.handleSubmit}
                width='small'
            >
                <div {...classes('items')}>
                    {Object.keys(COLUMN_TYPE).map(key => (
                        <div {...classes('item')} key={key}>
                            <CheckBox
                                checked={columns.includes(key)}
                                label={COLUMN_NAME[key]}
                                onChange={checked => this.handleChangeColumns(checked, key)}
                            />
                        </div>
                    ))}
                </div>
            </ConfirmModal>
        );
    }
}
