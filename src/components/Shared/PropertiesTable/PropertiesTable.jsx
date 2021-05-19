import React, {Component} from 'react';
import PropTypes from 'prop-types';
import PropertiesTableRow from './PropertiesTableRow/PropertiesTableRow';
import './properties-table.scss';

const cls = new Bem('properties-table');

export default class PropertiesTable extends Component {
    static propTypes = {
        editPermissions: PropTypes.array.isRequired,
        columnSettings: PropTypes.object.isRequired,
        items: PropTypes.array.isRequired,
        onEditItem: PropTypes.func,
        onClickItem: PropTypes.func,
        onDeleteItem: PropTypes.func
    };

    render() {
        const {items, columnSettings} = this.props;

        return items.length ? (
            <div {...cls()}>
                <div {...cls('header')}>
                    {Object.keys(columnSettings).map(key => (
                        <div
                            {...cls('header-cell')}
                            key={key}
                            style={columnSettings[key].style}
                        >
                            {columnSettings[key].name}
                        </div>
                    ))}
                    <div {...cls('header-cell', 'buttons')}/>
                </div>

                <div {...cls('body')}>
                    {items.map((item, itemIndex) => (
                        <PropertiesTableRow
                            key={item.id || itemIndex}
                            item={item}
                            editPermissions={this.props.editPermissions}
                            columnSettings={columnSettings}
                            onClick={this.props.onClickItem}
                            onEdit={this.props.onEditItem}
                            onDelete={this.props.onDeleteItem}
                        />
                    ))}
                </div>
            </div>
        ) : <span {...cls('empty-message')}>Нет данных</span>;
    }
}
