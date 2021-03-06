import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SectionTreeList from '../SectionTreeList';
import ArrowIcon from '../../../SvgIcons/ArrowIcon';
import TrashIcon from '../../../SvgIcons/TrashIcon';
import PencilIcon from '../../../SvgIcons/PencilIcon';
import CopuIcon from "@components/Shared/SvgIcons/CopyIcon";

export default class SectionTreeItem extends Component {
    static propTypes = {
        cls: PropTypes.func.isRequired,
        level: PropTypes.number,
        parent: PropTypes.object,
        item: PropTypes.object.isRequired,
        onAddChild: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        onCopy: PropTypes.func.isRequired,
        onSortChildren: PropTypes.func.isRequired
    };

    state = {
        open: false
    };

    handleClick = () => {
        this.setState({ open: !this.state.open });
    };

    render() {
        const { cls, parent, item, onAddChild, onEdit, onDelete, onSortChildren, onCopy } = this.props;
        const { open } = this.state;
        const children = item.sectionsTwo || item.sectionsThree;

        let level = 2;

        if (item.hasOwnProperty('sectionsTwo')) level = 0;
        if (item.hasOwnProperty('sectionsThree')) level = 1;

        return (
            <li
                {...cls('item', `level-${level}`)}
                data-id={item.id}
            >
                <div {...cls('item-name')}>
                    <div {...cls('item-arrows')}>
                        <ArrowIcon {...cls('item-arrow-top')}/>
                        <ArrowIcon {...cls('item-arrow-bottom')}/>
                    </div>

                    <div {...cls('item-name-wrap')} onClick={this.handleClick}>
                        {item.name} {children && !!children.length && (
                            <ArrowIcon { ...cls('arrow-icon', { opened: open }) } />
                        )}
                    </div>

                    <div {...cls('item-buttons')}>
                        {level < 2 && (
                            <button
                                {...cls('item-button', 'plus')}
                                onClick={() => onAddChild(item)}
                                title='???????????????? ??????????????????'
                            >
                                <i {...cls('item-icon', 'plus')}>+</i>
                            </button>
                        )}
                        <button
                            {...cls('item-button', 'edit')}
                            onClick={() => onCopy(item, parent)}
                            title='????????????????????'
                        >
                            <CopuIcon {...cls('item-icon', 'copy')}/>
                        </button>
                        <button
                            {...cls('item-button', 'edit')}
                            onClick={() => onEdit(item)}
                            title='??????????????????????????'
                        >
                            <PencilIcon {...cls('item-icon', 'pencil')}/>
                        </button>
                        <button
                            {...cls('item-button', 'remove')}
                            onClick={() => onDelete(item, parent)}
                            title='??????????????'
                        >
                            <TrashIcon {...cls('item-icon', 'trash')}/>
                        </button>
                    </div>
                </div>

                {children && (
                    <SectionTreeList
                        opened={open}
                        parent={item}
                        items={children}
                        onAddItemChild={onAddChild}
                        onEditItem={onEdit}
                        onDeleteItem={onDelete}
                        onSorting={onSortChildren}
                        onCopyItem={onCopy}
                    />
                )}
            </li>
        );
    }
}
