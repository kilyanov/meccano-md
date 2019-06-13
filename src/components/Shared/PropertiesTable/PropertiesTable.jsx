import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './properties-table.scss';
import PropertiesTableRow from './PropertiesTableRow/PropertiesTableRow';

const classes = new Bem('properties-table');

export default class PropertiesTable extends Component {
    static propTypes = {
        columnSettings: PropTypes.object.isRequired,
        items: PropTypes.array.isRequired,
        onEditItem: PropTypes.func,
        onClickItem: PropTypes.func,
        onDeleteItem: PropTypes.func
    };

    render() {
        const {items, columnSettings} = this.props;

        return items.length ? (
            <div {...classes()}>
                <div {...classes('header')}>
                    {Object.keys(columnSettings).map(key => (
                        <div
                            {...classes('header-cell')}
                            key={key}
                            style={columnSettings[key].style}
                        >
                            {columnSettings[key].name}
                        </div>
                    ))}
                    <div {...classes('header-cell', 'buttons')}/>
                </div>

                <div {...classes('body')}>
                    {items.map(item => (
                        <PropertiesTableRow
                            key={item.id}
                            item={item}
                            columnSettings={columnSettings}
                            onClick={this.props.onClickItem}
                            onEdit={this.props.onEditItem}
                            onDelete={this.props.onDeleteItem}
                        />
                    ))}
                </div>
            </div>
        ) : <span {...classes('empty-message')}>Нет данных</span>;
    }
}
