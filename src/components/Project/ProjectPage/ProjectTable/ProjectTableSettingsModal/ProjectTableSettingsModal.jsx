import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './project-table-settings-modal.scss';
import ConfirmModal from '../../../../Shared/ConfirmModal/ConfirmModal';
import {getColumnsFromStorage, getColumnsFromFields, setColumnsToStorage, DEFAULT_COLUMN_WIDTH} from '../Columns';
import CheckBox from '../../../../Form/CheckBox/CheckBox';
import {StorageService} from "@services";
import {STORAGE_KEY, THEME_TYPE} from "@const";
import Select from "react-select";
import {ReactSelectStyles} from "@const/ReactSelectStyles";
import {connect} from "react-redux";

const cls = new Bem('project-table-settings-modal');

class ProjectTableSettingsModal extends Component {
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
        const perPage = StorageService.get(STORAGE_KEY.TABLE_PER_PAGE) || 50;

        this.state = {
            projectColumns,
            selectedColumns,
            perPage: this.pageSizeItems.find(({value}) => value === +perPage)
        };
    }

    handleChangeColumns = (checked, column) => {
        let {selectedColumns} = this.state;

        if (checked) selectedColumns.push({key: column, width: DEFAULT_COLUMN_WIDTH});
        else selectedColumns = selectedColumns.filter(({key}) => key !== column);

        this.setState({selectedColumns});
    };

    handleChangePerPage = (option) => {
        this.setState({perPage: option});
        StorageService.set(STORAGE_KEY.TABLE_PER_PAGE, option.value)
    };

    handleSubmit = () => {
        const {selectedColumns, projectColumns} = this.state;

        setColumnsToStorage(selectedColumns, projectColumns, this.props.projectId);
        this.props.onChange(selectedColumns);
        this.props.onClose();
    };

    pageSizeItems = [
        {label: '50', value: 50},
        {label: '100', value: 100},
        {label: '150', value: 150}
    ];

    render() {
        const {projectFields, theme} = this.props;
        const {projectColumns, selectedColumns, perPage} = this.state;
        const isDarkTheme = theme === THEME_TYPE.DARK;

        return (
            <ConfirmModal
                title='Параметры таблицы'
                onClose={this.props.onClose}
                onSubmit={this.handleSubmit}
                width='wide'
            >
                <h3 {...cls('subtitle')}>Столбцы</h3>
                <div {...cls('items')}>
                    {projectColumns.map(column => (
                        <div {...cls('item')} key={column}>
                            <CheckBox
                                checked={!!selectedColumns.find(({key}) => key === column)}
                                label={_.get(projectFields.find(({slug}) => slug === column), 'name')}
                                onChange={checked => this.handleChangeColumns(checked, column)}
                            />
                        </div>
                    ))}
                </div>

                <h3 {...cls('subtitle')}>Количество статей</h3>
                <Select
                    value={perPage}
                    placeholder='Кол-во статей на странице'
                    classNamePrefix='select'
                    options={this.pageSizeItems}
                    onChange={this.handleChangePerPage}
                    closeMenuOnScroll
                    menuPlacement='top'
                    // menuPosition='fixed'
                    styles={ReactSelectStyles(isDarkTheme)}
                />
            </ConfirmModal>
        );
    }
}

export default connect(({theme}) => ({theme}))(ProjectTableSettingsModal);
