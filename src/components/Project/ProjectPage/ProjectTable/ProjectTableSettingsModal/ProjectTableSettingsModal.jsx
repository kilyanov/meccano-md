import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './project-table-settings-modal.scss';
import ConfirmModal from '../../../../Shared/ConfirmModal/ConfirmModal';
import {getColumnsFromStorage, getColumnsFromFields, setColumnsToStorage} from '../Columns';
import CheckBox from '../../../../Form/CheckBox/CheckBox';

const cls = new Bem('project-table-settings-modal');

export default class ProjectTableSettingsModal extends Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired,
        projectFields: PropTypes.array.isRequired,
        onClose: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        const projectColumns = getColumnsFromFields(props.projectFields);
        const selectedColumns = getColumnsFromStorage(props.projectId, projectColumns);

        this.state = {
            projectColumns,
            selectedColumns
        };
    }

    handleChangeColumns = (checked, column) => {
        let {selectedColumns} = this.state;

        if (checked) selectedColumns.push(column);
        else selectedColumns = selectedColumns.filter(key => key !== column);

        this.setState({selectedColumns});
    };

    handleSubmit = () => {
        const {selectedColumns, projectColumns} = this.state;

        setColumnsToStorage(selectedColumns, projectColumns, this.props.projectId);
        this.props.onChange(selectedColumns);
        this.props.onClose();
    };

    render() {
        const {projectFields} = this.props;
        const {projectColumns, selectedColumns} = this.state;

        return (
            <ConfirmModal
                title='Настройка столбцов'
                onClose={this.props.onClose}
                onSubmit={this.handleSubmit}
                width='small'
            >
                <div {...cls('items')}>
                    {projectColumns.map(column => (
                        <div {...cls('item')} key={column}>
                            <CheckBox
                                checked={selectedColumns.includes(column)}
                                label={_.get(projectFields.find(({slug}) => slug === column), 'name')}
                                onChange={checked => this.handleChangeColumns(checked, column)}
                            />
                        </div>
                    ))}
                </div>
            </ConfirmModal>
        );
    }
}
