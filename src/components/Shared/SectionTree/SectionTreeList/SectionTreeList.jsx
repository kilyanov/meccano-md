import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './section-tree-list.scss';
import SectionTreeItem from './SectionTreeItem/SectionTreeItem';

const cls = new Bem('section-tree-list');

export default class SectionTreeList extends Component {
    static propTypes = {
        parent: PropTypes.object,
        items: PropTypes.array.isRequired,
        level: PropTypes.number,
        onAddItemChild: PropTypes.func.isRequired,
        onEditItem: PropTypes.func.isRequired,
        onDeleteItem: PropTypes.func.isRequired
    };

    render() {
        const {parent, items, level, onAddItemChild, onEditItem, onDeleteItem} = this.props;

        return (
            <ul {...cls()}>
                {items.map((item, itemIndex) => (
                    <SectionTreeItem
                        parent={parent}
                        item={item}
                        key={itemIndex}
                        cls={cls}
                        level={level}
                        onAddChild={onAddItemChild}
                        onEdit={onEditItem}
                        onDelete={onDeleteItem}
                    />
                ))}
            </ul>
        );
    }
}
