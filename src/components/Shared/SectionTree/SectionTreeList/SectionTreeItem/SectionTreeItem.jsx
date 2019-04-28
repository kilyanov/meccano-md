import React, {Component} from 'react';
import PropTypes from 'prop-types';
import SectionTreeList from '../SectionTreeList';
import ArrowIcon from '../../../SvgIcons/ArrowIcon';
import TrashIcon from '../../../SvgIcons/TrashIcon';
import PencilIcon from '../../../SvgIcons/PencilIcon';

export default class SectionTreeItem extends Component {
    static propTypes = {
        classes: PropTypes.func.isRequired,
        level: PropTypes.number,
        parent: PropTypes.object,
        item: PropTypes.object.isRequired,
        onAddChild: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired
    };

    state = {
        open: true
    };

    handleClick = () => {
        this.setState({open: !this.state.open});
    };

    render() {
        const {classes, parent, item, onAddChild, onEdit, onDelete} = this.props;
        const {open} = this.state;
        const children = item.sectionsTwo || item.sectionsThree;

        let level = 2;

        if (item.hasOwnProperty('sectionsTwo')) level = 0;
        if (item.hasOwnProperty('sectionsThree')) level = 1;

        return (
            <li {...classes('item', `level-${level}`)}>
                <div {...classes('item-name')}>
                    <div {...classes('item-arrows')}>
                        <ArrowIcon {...classes('item-arrow-top')}/>
                        <ArrowIcon {...classes('item-arrow-bottom')}/>
                    </div>

                    <div {...classes('item-name-wrap')} onClick={this.handleClick}>
                        {item.name}
                    </div>

                    <div {...classes('item-buttons')}>
                        {level < 2 && (
                            <button
                                {...classes('item-button', 'plus')}
                                onClick={() => onAddChild(item)}
                            >
                                <i {...classes('item-icon', 'plus')}>+</i>
                            </button>
                        )}
                        <button
                            {...classes('item-button', 'edit')}
                            onClick={() => onEdit(item)}
                        >
                            <PencilIcon {...classes('item-icon', 'pencil')}/>
                        </button>
                        <button
                            {...classes('item-button', 'remove')}
                            onClick={() => onDelete(item, parent)}
                        >
                            <TrashIcon {...classes('item-icon', 'trash')}/>
                        </button>
                    </div>
                </div>

                {(children && open) && (
                    <SectionTreeList
                        parent={item}
                        items={children}
                        onAddItemChild={onAddChild}
                        onEditItem={onEdit}
                        onDeleteItem={onDelete}
                    />
                )}
            </li>
        );
    }
}
