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
            <li {...cls('item', `level-${level}`)}>
                <div {...cls('item-name')}>
                    <div {...cls('item-arrows')}>
                        <ArrowIcon {...cls('item-arrow-top')}/>
                        <ArrowIcon {...cls('item-arrow-bottom')}/>
                    </div>

                    <div {...cls('item-name-wrap')} onClick={this.handleClick}>
                        {item.name}
                    </div>

                    <div {...cls('item-buttons')}>
                        {level < 2 && (
                            <button
                                {...cls('item-button', 'plus')}
                                onClick={() => onAddChild(item)}
                                title='Добавить подраздел'
                            >
                                <i {...cls('item-icon', 'plus')}>+</i>
                            </button>
                        )}
                        <button
                            {...cls('item-button', 'edit')}
                            onClick={() => onEdit(item)}
                            title='Редактировать'
                        >
                            <PencilIcon {...cls('item-icon', 'pencil')}/>
                        </button>
                        <button
                            {...cls('item-button', 'remove')}
                            onClick={() => onDelete(item, parent)}
                            title='Удалить'
                        >
                            <TrashIcon {...cls('item-icon', 'trash')}/>
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
